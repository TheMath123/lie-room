import { Hono } from 'hono'
import { createBunWebSocket } from 'hono/bun'
import { roomRoutes } from "./room"

import { broadcastToRoom, joinRoom, leaveRoom } from '@/ws/room'
import { userRoutes } from "./user"


const port = 5555
const app = new Hono()

const { upgradeWebSocket, websocket } = createBunWebSocket<WebSocket>()

app.route('/room', roomRoutes)
app.route('/user', userRoutes)
app.get('/', (c) => c.text('API is running!'))

app.get(
  '/ws',
  upgradeWebSocket((c) => {
    const url = new URL(c.req.url)
    const roomId = url.searchParams.get("roomId") || ""
    const participantId = url.searchParams.get("participantId") || ""

    return {
      onOpen(evt, ws) {
        joinRoom(roomId, ws, participantId);
      },
      onMessage(evt, ws) {
        if (evt.data instanceof ArrayBuffer) {
          broadcastToRoom(roomId, evt.data, participantId);
        }
      },
      onClose(evt, ws) {
        leaveRoom(roomId, ws, participantId);
      },
    }
  })
)

export default {
  port,
  fetch: app.fetch,
  websocket
}