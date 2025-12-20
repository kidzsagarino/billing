import { FastifyInstance } from 'fastify';
import { MoveInController } from '../controllers/movein.controller';

export default async function moveinRoutes(fastify: FastifyInstance) {
  const controller = new MoveInController(fastify);

  fastify.get('/', { preHandler: fastify.authenticate }, controller.getAll);
  fastify.get('/search', { preHandler: fastify.authenticate }, controller.search);
  fastify.get('/filter', { preHandler: fastify.authenticate }, controller.filter);
  fastify.get('/:id', { preHandler: fastify.authenticate }, controller.getById);
  fastify.post('/', { preHandler: fastify.authenticate }, controller.create);
  fastify.put('/:id', { preHandler: fastify.authenticate }, controller.update);
  fastify.delete('/:id', { preHandler: fastify.authenticate }, controller.delete);
}