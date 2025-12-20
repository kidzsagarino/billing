import { FastifyInstance } from 'fastify';
import { UnitController } from '../controllers/unit.controller';

export default async function unitRoutes(fastify: FastifyInstance) {
  const controller = new UnitController();

  fastify.get('/', { preHandler: fastify.authenticate },  controller.getAll);
  fastify.get('/:id', { preHandler: fastify.authenticate },  controller.getById);
  fastify.post('/', { preHandler: fastify.authenticate },  controller.create);
  fastify.put('/:id', { preHandler: fastify.authenticate },  controller.update);
  fastify.delete('/:id', { preHandler: fastify.authenticate },  controller.delete);
  fastify.get('/getMoveinName', { preHandler: fastify.authenticate },  controller.getMoveinName);
}