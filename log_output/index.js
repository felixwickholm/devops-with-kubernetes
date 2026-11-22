const crypto = require('crypto')
const http = require('http')

const PORT = process.env.PORT || 3000
const randomString = crypto.randomUUID()

const status = () => `${new Date().toISOString()}: ${randomString}`

console.log(status())
setInterval(() => console.log(status()), 5000)

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end(status() + '\n')
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})
