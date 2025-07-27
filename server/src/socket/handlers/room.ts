import type { Socket } from "socket.io";

export function registerRoomHandlers(socket: Socket) {
  socket.on("join-room", ({ roomId, from }) => {
    socket.join(roomId);
    console.log(`${socket.id} entrou na sala ${roomId} como ${from}`);
    // Você pode emitir eventos de presença, etc, aqui
  });
}