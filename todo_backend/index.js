const http = require('http')

const PORT = process.env.PORT || 3000
const todos = []

const readBody = (req) => new Promise((resolve, reject) => {
  let data = ''
  req.on('data', (chunk) => { data += chunk })
  req.on('end', () => resolve(data))
  req.on('error', reject)
})

const parseTodo = (req, body) => {
  if ((req.headers['content-type'] || '').includes('application/json')) {
    return JSON.parse(body || '{}').todo
  }
  return new URLSearchParams(body).get('todo')
}

const isForm = (req) => (req.headers['content-type'] || '').includes('application/x-www-form-urlencoded')

const server = http.createServer(async (req, res) => {
  if (req.url === '/todos' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify(todos))
  }
  if (req.url === '/todos' && req.method === 'POST') {
    let text
    try {
      text = (parseTodo(req, await readBody(req)) || '').trim()
    } catch {
      text = ''
    }
    if (!text) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'todo is required' }))
    }
    const todo = { id: todos.length + 1, text, done: false }
    todos.push(todo)
    // A browser form post is redirected back to the todo app page.
    if (isForm(req)) {
      res.writeHead(302, { Location: '/' })
      return res.end()
    }
    res.writeHead(201, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify(todo))
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not found\n')
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})
