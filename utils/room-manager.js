const { v4: uuidv4 } = require('uuid')

const rooms = {}

const createRoom = (data, ws) => {
  const room_id = data.room_id || uuidv4()
  rooms[room_id] = { phone: ws, pc: null }
  ws.room_id = room_id
  return room_id
}

const joinRoom = (ws, room_id) => {
  if (rooms[room_id] && rooms[room_id].phone) {
    rooms[room_id].pc = ws
    ws.room_id = room_id
    return true
  }
  return false
}

const getPhoneSocket = (room_id) => {
  return rooms[room_id]?.phone || null
}

const removeRoom = (room_id) => {
  if (room_id && rooms[room_id]) {
    delete rooms[room_id]
  }
}

module.exports = {
  createRoom,
  joinRoom,
  getPhoneSocket,
  removeRoom
}
