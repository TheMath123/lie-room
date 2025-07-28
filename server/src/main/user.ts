import { Hono } from 'hono'

export const userRoutes = new Hono()

userRoutes.get('/', (c) => c.text('Listar usuários'))
userRoutes.get('/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ userId: id })
})