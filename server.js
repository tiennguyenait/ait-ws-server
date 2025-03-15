const WebSocket = require('ws')

const rooms = new Map()
const FIXED_ROOM_ID = '12345'
const fs = require('fs')
const path = require('path')

const wss = new WebSocket.Server({ port: 7777 })

const logToFile = (message) => {
  const logFile = path.join(__dirname, 'server.log')
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}\n`

  fs.appendFile(logFile, logMessage, (err) => {
    if (err) console.error('❌ Error writing log:', err)
  })
}

wss.on('connection', (ws) => {
  logToFile('✅ Client connected')

  ws.on('message', (message) => {
    handleMessage(ws, message)
  })

  ws.on('close', () => {
    if (ws.room_id) {
      const clients = rooms.get(ws.room_id)
      if (clients) {
        clients.delete(ws)
        if (clients.size === 0) {
          rooms.delete(ws.room_id)
        }
      }
      logToFile(`❌ Client disconnected from room: ${ws.room_id}`)
    }
  })

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error)
  })
})

const handleMessage = (ws, message) => {
  let data
  try {
    data = JSON.parse(message)
    logToFile('📥 Received message:', data)
  } catch (error) {
    console.error('❌ Invalid JSON:', message.toString())
    ws.send(JSON.stringify({ error: 'Invalid JSON format' }))
    return
  }

  const room_id = data.room_id || FIXED_ROOM_ID

  if (!rooms.has(room_id)) {
    rooms.set(room_id, new Set())
  }

  if (data.type === 'phone' || data.type === 'pc') {
    logToFile({ data })
    const clients = rooms.get(room_id)
    if (!clients.has(ws)) {
      clients.add(ws)
      ws.room_id = room_id
      ws.clientType = data.type
      logToFile(`✅ ${data.type.toUpperCase()} joined room: ${room_id}`)

      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: `${data.type}_connected`,
              room_id,
              message: `${data.type.toUpperCase()} has joined the room`
            })
          )
        }
      })
    }
  }

  if (data.action_name && ws.room_id) {
    const clients = rooms.get(ws.room_id)
    if (clients) {
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          logToFile(
            `📤 Sending from ${ws.clientType} to ${client.clientType}:`,
            data
          )
          client.send(
            JSON.stringify({
              from: ws.clientType,
              action_name: data.action_name,
              data: data.data
            })
          )
        }
      })
    }
  }
}

logToFile('🚀 WebSocket server running on ws://localhost:7777')
