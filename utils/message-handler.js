const { createRoom, joinRoom, getPhoneSocket } = require('./room-manager')

const handleMessage = (ws, message) => {
  let data
  try {
    data = JSON.parse(message)
  } catch (error) {
    console.error('Invalid JSON received:', message.toString())
    ws.send(JSON.stringify({ error: 'Invalid JSON format' }))
    return
  }

  if (data.type === 'phone') {
    console.log(data)
    const room_id = createRoom(data, ws)
    console.log(`📱 Phone connected to room: ${room_id}`)
    ws.send(JSON.stringify({ cc: 'cc' }))
  } else if (data.type === 'pc') {
    const room_id = data.room_id
    if (joinRoom(ws, room_id)) {
      console.log(`💻 PC connected to room: ${room_id}`)
      ws.send(JSON.stringify({ status: 'connected', room_id }))
    } else {
      ws.send(JSON.stringify({ error: 'Room not found' }))
      ws.close()
    }
  }

  if (data.action && ws.room_id) {
    const phoneSocket = getPhoneSocket(ws.room_id)
    if (phoneSocket) {
      phoneSocket.send(JSON.stringify({ action: data.action }))
    }
  }
}

module.exports = {
  handleMessage
}
