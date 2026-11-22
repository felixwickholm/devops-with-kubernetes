const fs = require('fs')
const http = require('http')

const PORT = process.env.PORT || 3000
const LOG_FILE = process.env.LOG_FILE || '/usr/src/app/files/log.txt'

const server = http.createServer((req, res) => {
  fs.readFile(LOG_FILE, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      return res.end('Log file not available yet\n')
    }
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(data)
  })
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})
