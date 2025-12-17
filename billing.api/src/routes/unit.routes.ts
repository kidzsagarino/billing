import { FastifyInstance } from 'fastify';
import { UnitController } from '../controllers/unit.controller';

export default async function unitRoutes(fastify: FastifyInstance) {
  const controller = new UnitController();

  fastify.get('/', controller.getAll);
  fastify.get('/:id', controller.getById);
  fastify.post('/', controller.create);
  fastify.put('/:id', controller.update);
  fastify.delete('/:id', controller.delete);
  fastify.get('/getMoveinName', controller.getMoveinName);
}