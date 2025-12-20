import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { Unit, MoveIn } from '../models';

export class UnitController {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  // GET all units
  getAll = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const units = await this.fastify.Unit.findAll();
      reply.code(200).send(units);
    } catch (error) {
      console.error('Error fetching units:', error);
      reply.status(500).send({ error: 'Failed to fetch units' });
    }
  };

  // GET unit by ID
  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const unit = await this.fastify.Unit.findByPk(id);
      if (!unit) return reply.status(404).send({ error: 'Unit not found' });
      reply.code(200).send(unit);
    } catch (error) {
      console.error('Error fetching unit by ID:', error);
      reply.status(500).send({ error: 'Failed to fetch unit' });
    }
  };

  // CREATE a new unit
  create = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { UnitNumber, FloorNumber, BuildingId, UnitType, Area } = request.body as any;

      const unit = await this.fastify.Unit.create({
        Id: uuidv4(),
        UnitNumber,
        FloorNumber,
        BuildingId,
        UnitType,
        Area
      });

      reply.code(201).send(unit);
    } catch (error) {
      console.error('Error creating unit:', error);
      reply.status(500).send({ error: 'Failed to create unit' });
    }
  };

  // UPDATE unit
  update = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { UnitNumber, FloorNumber, BuildingId, UnitType, Area } = request.body as any;

      const unit = await this.fastify.Unit.findByPk(id);
      if (!unit) return reply.status(404).send({ error: 'Unit not found' });

      await unit.update({ UnitNumber, FloorNumber, BuildingId, UnitType, Area });
      reply.code(200).send(unit);
    } catch (error) {
      console.error('Error updating unit:', error);
      reply.status(500).send({ error: 'Failed to update unit' });
    }
  };

  // DELETE unit
  delete = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const unit = await this.fastify.Unit.findByPk(id);
      if (!unit) return reply.status(404).send({ error: 'Unit not found' });

      await unit.destroy();
      reply.code(200).send({ message: 'Unit deleted' });
    } catch (error) {
      console.error('Error deleting unit:', error);
      reply.status(500).send({ error: 'Failed to delete unit' });
    }
  };

  // GET the current MoveIn FullName by unit number
  getMoveinName = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { unitNumber } = request.query as { unitNumber: string };
      const unit = await this.fastify.Unit.findOne({
        where: { UnitNumber: unitNumber },
        include: [
          {
            association: 'moveins',
            required: false,
            limit: 1,
            order: [['MoveInDate', 'DESC']]
          }
        ]
      });

      const FullName = unit?.moveins?.[0]?.FullName || '';
      reply.code(200).send({ FullName });
    } catch (error) {
      console.error('Error fetching move-in name:', error);
      reply.status(500).send({ error: 'Failed to fetch move-in name' });
    }
  };
}
