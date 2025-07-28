import { nanoid } from '@/lib';
import { Hono } from 'hono';

type Role = 'host' | 'player' | 'observer'
type Participant = { id: string; name: string; role: Role }
type Room = { id: string; createdAt: Date; participants: Participant[] }

const rooms = new Map<string, Room>()

export const roomRoutes = new Hono()

// Criar sala
roomRoutes.post('/create', async (c) => {
  const body = await c.req.json()
  const { hostName } = body
  const id = nanoid()
  const host: Participant = { id: nanoid(), name: hostName, role: 'host' }
  const room: Room = { id, createdAt: new Date(), participants: [host] }
  rooms.set(id, room)
  return c.json({ roomId: id, hostId: host.id })
})

// Buscar sala
roomRoutes.get('/:id', (c) => {
  const id = c.req.param('id')
  const room = rooms.get(id)
  if (!room) return c.json({ error: 'Sala não encontrada' }, 404)
  return c.json(room)
})

// Entrar na sala
roomRoutes.post('/:id/join', async (c) => {
  const id = c.req.param('id')
  console.log('Joining room:', id);
  const { name, role } = await c.req.json()
  const room = rooms.get(id)
  if (!room) return c.json({ error: 'Sala não encontrada' }, 404)
  const participant: Participant = { id: nanoid(8), name, role }
  console.log('Participant:', participant);
  room.participants.push(participant)
  return c.json({ participantId: participant.id })
})

// Listar participantes
roomRoutes.get('/:id/participants', (c) => {
  const id = c.req.param('id')
  const room = rooms.get(id)
  if (!room) return c.json({ error: 'Sala não encontrada' }, 404)
  return c.json(room.participants)
})