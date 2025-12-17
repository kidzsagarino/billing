import { FastifyInstance } from 'fastify';
import { MoveInController } from '../controllers/movein.controller';

export default async function moveinRoutes(fastify: FastifyInstance) {
  const controller = new MoveInController();

  fastify.get('/', controller.getAll);
  fastify.get('/search', controller.search);
  fastify.get('/filter', controller.filter);
  fastify.get('/:id', controller.getById);
  fastify.post('/', controller.create);
  fastify.put('/:id', controller.update);
  fastify.delete('/:id', controller.delete);
}