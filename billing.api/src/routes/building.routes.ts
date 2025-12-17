import { FastifyInstance } from 'fastify';
import { BuildingController } from '../controllers/building.controller';

export default async function buildingRoutes(fastify: FastifyInstance) {
  const controller = new BuildingController();

  fastify.get('/', controller.getAll);
  fastify.get('/:buildingId/units', controller.getUnitsByBuilding);
}