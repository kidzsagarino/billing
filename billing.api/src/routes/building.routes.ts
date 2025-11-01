import { FastifyInstance } from 'fastify';
import { Building } from '../models/Building';
import { Unit } from '../models/Unit';
import { v4 as uuidv4 } from 'uuid';

export default async function buildingRoutes(fastify: FastifyInstance) {
  // GET all buildings
  fastify.get('/', async (request, reply) => {
    const buildings = await Building.findAll();
    reply.send(buildings);
  });

  // GET units by building
  fastify.get('/:buildingId/units', async (request, reply) => {
    const { buildingId } = request.params as { buildingId: string };
    const units = await Unit.findAll({ where: { BuildingId: buildingId } });
    reply.send(units);
  });
}
