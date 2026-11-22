const fs = require('fs')
const http = require('http')
const path = require('path')

const PORT = process.env.PORT || 3000
const COUNTER_FILE = process.env.COUNTER_FILE || '/usr/src/app/files/pingpong.txt'

const readCounter = () => {
  try {
    return Number(fs.readFileSync(COUNTER_FILE, 'utf8')) || 0
  } catch {
    return 0
  }
}

fs.mkdirSync(path.dirname(COUNTER_FILE), { recursive: true })
let counter = readCounter()

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/pingpong') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(`pong ${counter}\n`)
    counter += 1
    fs.writeFileSync(COUNTER_FILE, String(counter))
    return
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not found\n')
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})
