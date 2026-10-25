const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 4175);
const types = { '.css': 'text/css', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript' };

http.createServer((request, response) => {
  let pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname === '/' || pathname === '/app') pathname = '/app.html';
  if (pathname === '/shift') pathname = '/shift.html';
  const target = path.resolve(root, `.${pathname}`);
  if (!target.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  fs.readFile(target, (error, bytes) => {
    if (error) { response.writeHead(404).end(); return; }
    response.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream');
    response.end(bytes);
  });
}).listen(port, '127.0.0.1');
