import { WSContext } from "hono/ws";

type RoomClient = { ws: WSContext, participantId: string }
type RoomMap = Map<string, Set<RoomClient>>;

export const rooms: RoomMap = new Map();

export function joinRoom(roomId: string, ws: WSContext, participantId: string) {
  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  rooms.get(roomId)!.add({ ws, participantId });
}

export function leaveRoom(roomId: string, ws: WSContext, participantId: string) {
  if (rooms.has(roomId)) {
    const clients = rooms.get(roomId)!;
    for (const client of clients) {
      if (client.participantId === participantId) {
        clients.delete(client);
        break;
      }
    }
    if (clients.size === 0) rooms.delete(roomId);
  }
}

export function broadcastToRoom(roomId: string, data: ArrayBuffer, exceptParticipantId?: string) {
  if (!rooms.has(roomId)) return;
  for (const client of rooms.get(roomId)!) {
    if (client.participantId !== exceptParticipantId && client.ws.readyState === 1) {
      client.ws.send(data);
    }
  }
}