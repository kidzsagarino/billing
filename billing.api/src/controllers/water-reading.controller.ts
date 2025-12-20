import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { findUnitId } from '../service/findUnitId';
import { Building } from '../models/Building';
import { Unit } from '../models/Unit';

interface WaterReadingBody {
  buildingNumber: number;
  unitNumber: number;
  billingMonth: string;
  previousReading: number;
  currentReading: number;
  totalAmount: number;
  ratePerCubic: number;
  readingDate: Date;
}

export class WaterReadingController {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }
  getAll = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const pageNumber = parseInt((request.query as any).pageNumber) || 1;
      const pageSize = parseInt((request.query as any).pageSize) || 10;
      const offset = (pageNumber - 1) * pageSize;

      const { count, rows } = await this.fastify.WaterReading.findAndCountAll({
        include: [
          {
            model: Unit,
            as: 'unit',
            attributes: ['UnitNumber'],
            include: [{ model: Building, as: 'building', attributes: ['BuildingNumber'] }],
          },
        ],
        limit: pageSize,
        offset,
        order: [['BillingMonth', 'DESC']],
      });

      reply.send({
        pageNumber,
        pageSize,
        totalRecords: count,
        totalPages: Math.ceil(count / pageSize),
        data: rows,
      });
    } catch (err) {
      console.error(err);
      reply.status(500).send({ error: 'Failed to fetch water readings' });
    }
  };

  getByBillingMonth = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const billingMonth = (request.params as any).billingMonth;
      const { count, rows } = await this.fastify.WaterReading.findAndCountAll({
        where: { BillingMonth: billingMonth },
        include: [
          {
            association: 'unit',
            required: false,
            include: [
              { association: 'building', required: false },
              { association: 'moveins', required: false },
            ],
          },
        ],
        order: [[{ model: Unit, as: 'unit' }, 'UnitNumber', 'ASC']],
      });

      reply.send({ totalRecords: count, data: rows });
    } catch (err) {
      console.error(err);
      reply.status(500).send({ error: 'Failed to fetch water readings' });
    }
  };

  search = async (request: FastifyRequest, reply: FastifyReply) => {
    const { q } = request.query as { q?: string };
    if (!q || !q.trim()) return reply.send([]);

    const readings = await this.fastify.WaterReading.findAll({
      include: [
        {
          association: 'unit',
          required: true,
          where: { UnitNumber: q.trim() },
          include: [
            { association: 'building', required: false },
            { association: 'moveins', required: false },
          ],
        },
      ],
      order: [[{ model: Unit, as: 'unit' }, 'UnitNumber', 'ASC']],
    });

    const result = readings.map((r) => {
      const plain = r.get({ plain: true }) as any;
      return {
        ...plain,
        UnitNumber: plain.unit?.UnitNumber || null,
        BuildingNumber: plain.unit?.building?.BuildingNumber || null,
      };
    });

    reply.send(result);
  };

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as WaterReadingBody;
      const unitId = await findUnitId(body.buildingNumber, body.unitNumber, this.fastify);
      if (!unitId) return reply.status(400).send({ error: 'Invalid building or unit number' });

      const exists = await this.fastify.WaterReading.findOne({
        where: { UnitId: unitId, BillingMonth: body.billingMonth },
      });
      if (exists) return reply.status(400).send({ error: 'Water reading for this unit and billing month already exists' });

      const newReading = await this.fastify.WaterReading.create({
        UnitId: unitId,
        BillingMonth: body.billingMonth,
        PreviousReading: body.previousReading,
        CurrentReading: body.currentReading,
        Consumption: Math.max(0, body.currentReading - body.previousReading),
        RatePerCubic: body.ratePerCubic,
        TotalAmount: body.totalAmount,
        ReadingDate: body.readingDate,
      });

      reply.status(200).send({ message: 'Water reading saved successfully', data: newReading });
    } catch (err) {
      console.error(err);
      reply.status(500).send({ error: 'Failed to save water reading' });
    }
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as WaterReadingBody;
      const consumption = Math.max(0, body.currentReading - body.previousReading);
      const total = consumption * body.ratePerCubic;

      const [updated] = await this.fastify.WaterReading.update(
        {
          PreviousReading: body.previousReading,
          CurrentReading: body.currentReading,
          RatePerCubic: body.ratePerCubic,
          TotalAmount: total,
        },
        { where: { Id: id } }
      );

      if (!updated) return reply.status(404).send({ message: 'Reading not found' });

      reply.send({ message: 'Water reading updated successfully' });
    } catch (err) {
      console.error(err);
      reply.status(500).send({ error: 'Failed to update water reading' });
    }
  };

  loadForBillingMonth = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { billingMonth } = request.body as { billingMonth: string };
      const allUnits = await this.fastify.Unit.findAll();
      const newReadings = allUnits
        .filter((u) => !this.fastify.WaterReading.findOne({ where: { UnitId: u.Id, BillingMonth: billingMonth } }))
        .map((u) => ({
          UnitId: u.Id,
          BillingMonth: billingMonth,
          PreviousReading: 0,
          CurrentReading: 0,
          Consumption: 0,
          RatePerCubic: 0,
          TotalAmount: 0,
          ReadingDate: new Date(),
        }));

      if (newReadings.length > 0) {
        await this.fastify.WaterReading.bulkCreate(newReadings);
        reply.send({ message: 'Water readings loaded for billing month successfully' });
      } else {
        reply.status(400).send({ message: 'All water readings for this billing month already exist' });
      }
    } catch (err) {
      console.error(err);
      reply.status(500).send({ error: 'Failed to load water readings for billing month' });
    }
  };

  updateConsumption = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { Consumption } = request.body as { Consumption: number };
      const reading = await this.fastify.WaterReading.findByPk(id);
      if (!reading) return reply.status(404).send({ error: 'Water reading not found' });

      await reading.update({ Consumption });
      reply.send({ message: 'Consumption updated successfully' });
    } catch (err) {
      console.error(err);
      reply.status(500).send({ error: 'Failed to update consumption' });
    }
  };

  searchByUnitNumber = async (request: FastifyRequest, reply: FastifyReply) => {
    const { UnitNumber } = request.body as { UnitNumber: string };
    const unit = await this.fastify.Unit.findOne({ where: { UnitNumber } });
    if (!unit) return reply.send([]);

    const readings = await this.fastify.WaterReading.findAll({
      where: { UnitId: unit.Id },
      include: [{ association: 'unit', required: true, include: [{ association: 'building', required: false }, { association: 'moveins', required: false }] }],
      order: [['BillingMonth', 'DESC']],
    });

    const result = readings.map((r) => {
      const plain = r.get({ plain: true }) as any;
      return {
        ...plain,
        UnitNumber: plain.unit?.UnitNumber || null,
        BuildingNumber: plain.unit?.building?.BuildingNumber || null,
      };
    });

    reply.send(result);
  };

  searchByBillingMonth = async (request: FastifyRequest, reply: FastifyReply) => {
    const { BillingMonth } = request.body as { BillingMonth: string };
    const readings = await this.fastify.WaterReading.findAll({
      where: { BillingMonth },
      include: [{ association: 'unit', required: true, include: [{ association: 'building', required: false }, { association: 'moveins', required: false }] }],
      order: [[{ model: Unit, as: 'unit' }, 'UnitNumber', 'ASC']],
    });

    const result = readings.map((r) => {
      const plain = r.get({ plain: true }) as any;
      return {
        ...plain,
        UnitNumber: plain.unit?.UnitNumber || null,
        BuildingNumber: plain.unit?.building?.BuildingNumber || null,
      };
    });

    reply.send(result);
  };
}
