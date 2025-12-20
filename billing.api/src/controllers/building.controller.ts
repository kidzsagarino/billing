import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export class BuildingController {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  getAll = async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const buildings = await this.fastify.Building.findAll();
      reply.send(buildings);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      reply.status(500).send({ error: 'Failed to fetch buildings.' });
    }
  };

  getUnitsByBuilding = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { buildingId } = request.params as { buildingId: string };
      if (!buildingId) {
        return reply.status(400).send({ error: 'Building ID is required' });
      }

      const units = await this.fastify.Unit.findAll({ where: { BuildingId: buildingId } });
      reply.send(units);
    } catch (error) {
      console.error('Error fetching units by building:', error);
      reply.status(500).send({ error: 'Failed to fetch units.' });
    }
  };
}
