import { FastifyInstance } from 'fastify';
import WaterReading from '../models/WaterReading';
import { findUnitId } from '../service/findUnitId';
import { Building } from '../models/Building';
import { Unit } from '../models/Unit';
import { dateMonth } from '../service/dateMonth';


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

export default async function waterReadingRoutes(fastify: FastifyInstance) {
  
    fastify.get('/water-readings', async (request, reply) => {
        try {
            // Get query parameters with default values
            const pageNumber = parseInt((request.query as any).pageNumber) || 1;
            const pageSize = parseInt((request.query as any).pageSize) || 10;

            // Calculate offset
            const offset = (pageNumber - 1) * pageSize;

            // Fetch paginated readings
            const { count, rows } = await WaterReading.findAndCountAll({
            include: [
                { model: Unit, as: 'unit', attributes: ['UnitNumber'],
                    include: [
                        {
                            model: Building,
                            as: 'building',       // alias used in association
                            attributes: ['BuildingNumber'],
                        },
                    ],
                },
            ],
            limit: pageSize,
            offset: offset,
            order: [['BillingMonth', 'DESC']], // optional ordering
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
    });

    // SEARCH water readings by unit number or building number
    fastify.get('/water-readings/search', async (request, reply) => {
        const { q } = request.query as { q?: string };

        if (!q || !q.trim()) {
            return reply.send([]);
        }

        const readings = await WaterReading.findAll({
            include: [
            {
                association: 'unit', // Make sure your WaterReading model has "unit" association
                required: true,
                where: {
                UnitNumber: q.trim()
                },
                include: [
                {
                    association: 'building', // Ensure "building" association exists on Unit model
                    required: false
                }
                ]
            }
            ],
            order: [[{ model: Unit, as: 'unit' }, 'UnitNumber', 'ASC']]
        });

        // Flatten the response to include UnitNumber and BuildingNumber at top level
        const result = readings.map(r => {
            const plain = r.get({ plain: true }) as any;
            return {
            ...plain,
            UnitNumber: plain.unit?.UnitNumber || null,
            BuildingNumber: plain.unit?.building?.BuildingNumber || null
            };
        });

        reply.send(result);
    });

  // 🔹 Get by billing month
  fastify.get('/water-readings/:billingMonth', async (request, reply) => {
    const { billingMonth } = request.params as { billingMonth: string };
    const readings = await WaterReading.findAll({ where: { BillingMonth: billingMonth } });
    reply.send(readings);
  });

  // 🔹 Create new water reading
  fastify.post('/water-readings', async (request, reply) => {
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
  });

  // 🔹 Update existing water reading
  fastify.put('/water-readings/:id', async (request, reply) => {
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
  });
}