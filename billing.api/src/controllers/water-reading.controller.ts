import WaterReading from '../models/WaterReading';
import { findUnitId } from '../service/findUnitId';
import { Building } from '../models/Building';
import { Unit } from '../models/Unit';

interface WaterReadingBody {
  buildingNumber: number;
  unitNumber: number;
  unitId: string;
  billingMonth: string;
  previousReading: number;
  currentReading: number;
  totalAmount: number;
  ratePerCubic: number;
  readingDate: Date;
}

export class WaterReadingController {
  getAll = async (request, reply) => {
    try {
      const pageNumber = parseInt((request.query as any).pageNumber) || 1;
      const pageSize = parseInt((request.query as any).pageSize) || 10;
      const offset = (pageNumber - 1) * pageSize;

      const { count, rows } = await WaterReading.findAndCountAll({
        include: [
          {
            model: Unit,
            as: 'unit',
            attributes: ['UnitNumber'],
            include: [
              {
                model: Building,
                as: 'building',
                attributes: ['BuildingNumber'],
              },
            ],
          },
        ],
        limit: pageSize,
        offset: offset,
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

  getByBillingMonth = async (request, reply) => {
    try {
      const billingMonth = (request.params as any).billingMonth;
      const { count, rows } = await WaterReading.findAndCountAll({
        where: { BillingMonth: billingMonth },
        include: [
          {
            model: Unit,
            as: 'unit',
            attributes: ['UnitNumber'],
            include: [
              {
                model: Building,
                as: 'building',
                attributes: ['BuildingNumber'],
              },
            ],
          },
        ],
        order: [[{ model: Unit, as: 'unit' }, 'UnitNumber', 'ASC']],
      });

      reply.send({
        totalRecords: count,
        data: rows,
      });
    } catch (err) {
      console.error(err);
      reply.status(500).send({ error: 'Failed to fetch water readings' });
    }
  };

  search = async (request, reply) => {
    const { q } = request.query as { q?: string };
    if (!q || !q.trim()) {
      return reply.send([]);
    }

    const readings = await WaterReading.findAll({
      include: [
        {
          association: 'unit',
          required: true,
          where: { UnitNumber: q.trim() },
          include: [
            {
              association: 'building',
              required: false,
            },
          ],
        },
      ],
      order: [[{ model: Unit, as: 'unit' }, 'UnitNumber', 'ASC']],
    });

    const result = readings.map(r => {
      const plain = r.get({ plain: true }) as any;
      return {
        ...plain,
        UnitNumber: plain.unit?.UnitNumber || null,
        BuildingNumber: plain.unit?.building?.BuildingNumber || null,
      };
    });

    reply.send(result);
  };

  create = async (request, reply) => {
    try {
      const body = request.body as WaterReadingBody;
      const unitId = await findUnitId(body.buildingNumber, body.unitNumber);

      const alreadyExists = await WaterReading.findOne({
        where: {
          UnitId: unitId,
          BillingMonth: body.billingMonth,
        },
      });

      if (alreadyExists) {
        return reply.status(400).send({ error: 'Water reading for this unit and billing month already exists' });
      }

      if (!unitId) {
        return reply.status(400).send({ error: 'Invalid building or unit number' });
      }

      const newReading = await WaterReading.create({
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

  update = async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as WaterReadingBody;

      const consumption = Math.max(0, body.currentReading - body.previousReading);
      const total = consumption * body.ratePerCubic;

      const [updated] = await WaterReading.update(
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

  loadForBillingMonth = async (request, reply) => {
    try {
      const { billingMonth } = request.body as { billingMonth: string };
      const allUnits = await Unit.findAll();
      const newReadings = [];

      for (const unit of allUnits) {
        const existingReading = await WaterReading.findOne({
          where: {
            UnitId: unit.Id,
            BillingMonth: billingMonth,
          },
        });

        if (existingReading) {
          continue;
        }

        newReadings.push({
          UnitId: unit.Id,
          BillingMonth: billingMonth,
          Consumption: 0,
          PreviousReading: 0,
          CurrentReading: 0,
          ratePerCubic: 0,
          TotalAmount: 0,
        });
      }

      if (newReadings.length > 0) {
        await WaterReading.bulkCreate(newReadings);
        reply.send({ message: 'Water readings loaded for billing month successfully' });
      } else {
        reply.status(400).send({ message: 'All water readings for this billing month already exist' });
      }
    } catch (err) {
      console.error(err);
      reply.status(500).send({ error: 'Failed to load water readings for billing month' });
    }
  };

  updateConsumption = async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { Consumption } = request.body as { Consumption: number };
      const reading = await WaterReading.findByPk(id);
      if (!reading) {
        return reply.status(404).send({ error: 'Water reading not found' });
      }
      await reading.update({ Consumption });
      reply.send({ message: 'Consumption updated successfully' });
    } catch (err) {
      console.error(err);
      reply.status(500).send({ error: 'Failed to update consumption' });
    }
  };

  searchByUnitNumber = async (request, reply) => {
    const { UnitNumber } = request.body as { UnitNumber: string };
    const unit = await Unit.findOne({ where: { UnitNumber: UnitNumber } });
    if (!unit) {
      return reply.send([]);
    }
    const readings = await WaterReading.findAll({
      where: { UnitId: unit.Id },
      include: [
        {
          association: 'unit',
          required: true,
          include: [
            {
              association: 'building',
              required: false,
            },
          ],
        },
      ],
      order: [['BillingMonth', 'DESC']],
    });
    const result = readings.map(r => {
      const plain = r.get({ plain: true }) as any;
      return {
        ...plain,
        UnitNumber: plain.unit?.UnitNumber || null,
        BuildingNumber: plain.unit?.building?.BuildingNumber || null,
      };
    });
    reply.send(result);
  };

  searchByBillingMonth = async (request, reply) => {
    const { BillingMonth } = request.body as { BillingMonth: string };
    const readings = await WaterReading.findAll({
      where: { BillingMonth: BillingMonth },
      include: [
        {
          association: 'unit',
          required: true,
          include: [
            { 
              association: 'building',
              required: false 
            },
          ],
        },
      ],
      order: [[{ model: Unit, as: 'unit' }, 'UnitNumber', 'ASC']],
    });
    const result = readings.map(r => {
      const plain = r.get({ plain: true }) as any;
      return {
        ...plain,
        UnitNumber: plain.unit?.UnitNumber || null,
        BuildingNumber: plain.unit?.building?.BuildingNumber || null,
      };
    }
    );
    reply.send(result);
  };
}