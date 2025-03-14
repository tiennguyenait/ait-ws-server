const WebSocket = require('ws')
const { handleMessage, removeRoom } = require('./utils')

const wss = new WebSocket.Server({ port: 5000 })

wss.on('connection', (ws) => {
  console.log('📡 New client connected')

  ws.on('message', (message) => handleMessage(ws, message))

  ws.on('close', () => {
    console.log(`❌ Client disconnected from room ${ws.room_id}`)
    removeRoom(ws.room_id)
  })

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
    removeRoom(ws.room_id)
  })
})

console.log('🚀 WebSocket Server running on ws://localhost:5000')
