const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Dummy Server OK');
});
const PORT = process.env.PORT || 7860;
server.listen(PORT, '0.0.0.0', () => {
  console.log('Dummy server running on port ' + PORT);
});
