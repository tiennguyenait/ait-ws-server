const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(cors())

app.get("/", (req, res) => {
  return res.json({message: "AIT WS Server for Shoppe Livestream"})
})

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

const logToFile = (message) => {
  const logFile = path.join(__dirname, 'server.log')
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}\n`

  fs.appendFile(logFile, logMessage, (err) => {
    if (err) console.error('❌ Error writing log:', err)
  })
}

io.on('connection', (socket) => {
  const connectMsg = `📲 A device connected: ${socket.id}`
  logToFile(connectMsg)

  socket.on('joinRoom', (room) => {
    socket.join(room)
    const joinMsg = `📢 ${socket.id} joined room: ${JSON.stringify(room)}`
    logToFile(joinMsg)
    io.to(room).emit('message', `🔔 ${socket.id} has joined room: ${room}`)
  })

  socket.on('message', ({ room, message }) => {
    const msgLog = `📩 [Room ${room}] ${socket.id}: ${JSON.stringify(message)}`
    logToFile(msgLog)
    socket.to(room).emit('message', message)
  })

  socket.on('disconnect', () => {
    const disconnectMsg = `❌ A device disconnected: ${socket.id}`
    logToFile(disconnectMsg)
  })
})

server.listen(7777, () => {
  console.log('🚀 Server running on http://localhost:7777')
  logToFile('🚀 Server started on port 7777')
})
