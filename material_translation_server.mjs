import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT || 8765);
const host = process.env.HOST || "127.0.0.1";
const root = process.cwd();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

createServer(async (req, res) => {
  try {
    if (req.url?.startsWith("/api/proxy/")) {
      await proxyRequest(req, res);
      return;
    }
    await serveStatic(req, res);
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: { message: error.message } }));
  }
}).listen(port, host, () => {
  const visibleHost = host === "0.0.0.0" ? "127.0.0.1" : host;
  console.log(`素材翻译工作台: http://${visibleHost}:${port}/material_translation_workflow.html`);
});

async function serveStatic(req, res) {
  const rawPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const filePath = rawPath === "/" ? "/material_translation_workflow.html" : rawPath;
  const safePath = normalize(filePath).replace(/^(\.\.[/\\])+/, "");
  const absolutePath = join(root, safePath);
  let body;
  try {
    body = await readFile(absolutePath);
  } catch {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>页面文件未找到</h1><p>请确认 material_translation_workflow.html 和 material_translation_server.mjs 放在同一个文件夹。</p>");
    return;
  }
  res.writeHead(200, {
    "Content-Type": mimeTypes[extname(absolutePath)] || "application/octet-stream",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

async function proxyRequest(req, res) {
  const apiBase = req.headers["x-api-base"];
  const authorization = req.headers.authorization;
  if (!apiBase || Array.isArray(apiBase)) {
    throw new Error("Missing X-API-Base header.");
  }
  if (!authorization) {
    throw new Error("Missing Authorization header.");
  }

  const endpoint = new URL(req.url, `http://127.0.0.1:${port}`).pathname.replace("/api/proxy", "");
  const targetUrl = `${apiBase.replace(/\/$/, "")}${endpoint}`;
  const body = await readBody(req);
  const headers = {
    "Authorization": Array.isArray(authorization) ? authorization[0] : authorization
  };
  if (req.headers["content-type"]) headers["Content-Type"] = req.headers["content-type"];

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method || "GET") ? undefined : body
  });

  const responseBody = Buffer.from(await upstream.arrayBuffer());
  console.log(`${new Date().toISOString()} ${req.method} ${targetUrl} -> ${upstream.status}`);
  const responseHeaders = {
    "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
    "Access-Control-Allow-Origin": "*"
  };

  if (!upstream.ok && !upstream.headers.get("content-type")?.includes("application/json")) {
    res.writeHead(upstream.status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      error: {
        message: responseBody.toString("utf8") || upstream.statusText,
        status: upstream.status
      }
    }));
    return;
  }

  res.writeHead(upstream.status, responseHeaders);
  res.end(responseBody);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
