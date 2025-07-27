import { Server as SocketIOServer } from "socket.io";
import { registerAudioHandlers } from "./handlers/audio";
import { registerRoomHandlers } from "./handlers/room";

export function setupSocketIO(server:any) {
  const io = new SocketIOServer(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Novo cliente conectado:", socket.id);

    registerRoomHandlers(socket);
    registerAudioHandlers(socket);

    socket.on("disconnect", () => {
      console.log("Cliente desconectado:", socket.id);
    });
  });

  return io;
}