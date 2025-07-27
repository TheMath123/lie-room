import type { Socket } from "socket.io";

export function registerAudioHandlers(socket: Socket) {
  socket.on("audio-chunk", ({ roomId, chunk, from }) => {
    socket.to(roomId).emit("audio-chunk", { chunk, from });
  });
}