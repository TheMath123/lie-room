import { ServerWebSocket } from 'bun';
import { Hono } from 'hono';
import { createBunWebSocket } from 'hono/bun';
import { roomRoutes } from './room';

import { userRoutes } from './user';

const port = 5555;
const app = new Hono();

const { upgradeWebSocket, websocket } =
  createBunWebSocket<ServerWebSocket>()

app.route('/room', roomRoutes);
app.route('/user', userRoutes);
app.get('/', (c) => c.text('API is running!'));

app.get(
  '/ws',
  upgradeWebSocket((c) => {
    return {
      onMessage(event, ws) {
        console.log(`Message from client: ${event.data}`)
        ws.send('Hello from server!')
      },
      onClose: () => {
        console.log('Connection closed')
      },
    }
  })
)

export default {
  port,
  fetch: app.fetch,
  websocket
}
