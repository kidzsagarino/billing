import { FastifyInstance } from 'fastify';
import { BuildingController } from '../controllers/building.controller';

export default async function buildingRoutes(fastify: FastifyInstance) {
  const controller = new BuildingController();

  fastify.get('/', { preHandler: fastify.authenticate }, controller.getAll);
  fastify.get('/:buildingId/units', { preHandler: fastify.authenticate }, controller.getUnitsByBuilding);
}