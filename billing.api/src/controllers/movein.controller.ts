import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

export class MoveInController {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  getAll = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { page = 1, limit = 10, unitNumber } = request.query as any;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where: any = {};

      if (unitNumber?.trim()) {
        where['$unit.UnitNumber$'] = { [Op.like]: `%${unitNumber.trim()}%` };
      }

      const { count, rows } = await this.fastify.MoveIn.findAndCountAll({
        where,
        include: [
          {
            association: 'unit',
            required: false,
            include: [{ association: 'building', required: false }]
          }
        ],
        offset,
        limit: parseInt(limit),
        order: [[{ model: this.fastify.Unit, as: 'unit' }, 'UnitNumber', 'ASC']]
      });

      const result = rows.map((m: any) => {
        const plain = m.get({ plain: true });
        return {
          ...plain,
          UnitNumber: plain.unit?.UnitNumber || null,
          BuildingNumber: plain.unit?.building?.BuildingNumber || null
        };
      });

      reply.send({
        data: result,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      console.error('Error fetching move-ins:', error);
      reply.status(500).send({ error: 'Failed to fetch move-ins' });
    }
  };

  search = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { q } = request.query as { q?: string };
      if (!q?.trim()) return reply.send([]);

      const moveins = await this.fastify.MoveIn.findAll({
        include: [
          {
            association: 'unit',
            required: true,
            where: { UnitNumber: q.trim() },
            include: [{ association: 'building', required: false }]
          }
        ],
        order: [[{ model: this.fastify.Unit, as: 'unit' }, 'UnitNumber', 'ASC']]
      });

      const result = moveins.map((m: any) => {
        const plain = m.get({ plain: true });
        return {
          ...plain,
          UnitNumber: plain.unit?.UnitNumber || null,
          BuildingNumber: plain.unit?.building?.BuildingNumber || null
        };
      });

      reply.send(result);
    } catch (error) {
      console.error('Error searching move-ins:', error);
      reply.status(500).send({ error: 'Failed to search move-ins' });
    }
  };

  filter = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { page = 1, limit = 10, buildingId, unitId } = request.query as any;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where: any = {};

      if (buildingId) where['$unit.BuildingId$'] = buildingId;
      if (unitId) where['UnitId'] = unitId;

      const { count, rows } = await this.fastify.MoveIn.findAndCountAll({
        where,
        include: [
          {
            association: 'unit',
            required: false,
            include: [{ association: 'building', required: false }]
          }
        ],
        offset,
        limit: parseInt(limit),
        order: [[{ model: this.fastify.Unit, as: 'unit' }, 'UnitNumber', 'ASC']]
      });

      const result = rows.map((m: any) => {
        const plain = m.get({ plain: true });
        return {
          ...plain,
          UnitNumber: plain.unit?.UnitNumber || null,
          BuildingNumber: plain.unit?.building?.BuildingNumber || null
        };
      });

      reply.send({
        data: result,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      console.error('Error filtering move-ins:', error);
      reply.status(500).send({ error: 'Failed to filter move-ins' });
    }
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const movein = await this.fastify.MoveIn.findByPk(id, {
        include: [
          {
            association: 'unit',
            required: false,
            include: [{ association: 'building', required: false }]
          }
        ]
      });
      if (!movein) return reply.status(404).send({ error: 'Move-in not found' });
      reply.send(movein);
    } catch (error) {
      console.error('Error fetching move-in by ID:', error);
      reply.status(500).send({ error: 'Failed to fetch move-in' });
    }
  };

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { FullName, Email, Mobile, UnitId, MoveInDate, MoveOutDate, Status } =
        request.body as any;

      const movein = await this.fastify.MoveIn.create({
        Id: uuidv4(),
        FullName,
        Email,
        Mobile,
        UnitId,
        MoveInDate,
        MoveOutDate,
        Status
      });

      reply.code(201).send(movein);
    } catch (error) {
      console.error('Error creating move-in:', error);
      reply.status(500).send({ error: 'Failed to create move-in' });
    }
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { FullName, Email, Mobile, UnitId, MoveInDate, MoveOutDate, Status } =
        request.body as any;

      const movein = await this.fastify.MoveIn.findByPk(id);
      if (!movein) return reply.status(404).send({ error: 'Move-in not found' });

      await movein.update({
        FullName,
        Email,
        Mobile,
        UnitId,
        MoveInDate,
        MoveOutDate,
        Status,
        UpdatedAt: new Date()
      });

      reply.code(200).send(movein);
    } catch (error) {
      console.error('Error updating move-in:', error);
      reply.status(500).send({ error: 'Failed to update move-in' });
    }
  };

  delete = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const movein = await this.fastify.MoveIn.findByPk(id);
      if (!movein) return reply.status(404).send({ error: 'Move-in not found' });

      await movein.destroy();
      reply.send({ message: 'Move-in deleted' });
    } catch (error) {
      console.error('Error deleting move-in:', error);
      reply.status(500).send({ error: 'Failed to delete move-in' });
    }
  };
}
