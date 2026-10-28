/**
 * CivicTrust frontend static server.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.join(rootDirectory, 'frontend');
const sharedDirectory = path.join(rootDirectory, 'shared');
const port = Number(process.env.FRONTEND_PORT || 3000);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const server = http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  } catch {
    response.writeHead(400);
    return response.end('Invalid request path.');
  }

  const isSharedAsset = pathname.startsWith('/shared/');
  const assetRoot = isSharedAsset ? sharedDirectory : frontendDirectory;
  const relativePath = isSharedAsset
    ? pathname.slice('/shared/'.length)
    : pathname === '/' ? 'index.html' : pathname.slice(1);
  let filePath = path.resolve(assetRoot, relativePath);
  if (!filePath.startsWith(`${assetRoot}${path.sep}`) && filePath !== path.join(frontendDirectory, 'index.html')) {
    response.writeHead(403);
    return response.end('Forbidden.');
  }

  if (!isSharedAsset && !fs.existsSync(filePath) && !path.extname(pathname)) {
    filePath = path.join(frontendDirectory, 'index.html');
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404);
      return response.end('Not found.');
    }

    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff'
    });
    fs.createReadStream(filePath).pipe(response);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`CivicTrust frontend running at http://127.0.0.1:${port}`);
});
