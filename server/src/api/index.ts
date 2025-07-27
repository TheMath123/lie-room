import { setupSocketIO } from '@/socket';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { roomRoutes } from './room';
import { userRoutes } from './user';
const port = 5555

const app = new Hono()
const server = serve({ fetch: app.fetch, port: 5555 });
const io = new Server(server as HttpServer);

app.route('/room', roomRoutes)
app.route('/user', userRoutes)

app.get('/', (c) => c.text('API is running!'))

io.on("connection", (socket) => {
  console.log("client connected");
});

setupSocketIO(io)

console.log(`🚀 API + Socket.IO rodando em http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}