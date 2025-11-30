import { FastifyInstance } from 'fastify';
import { Unit } from '../models/Unit';
import { v4 as uuidv4 } from 'uuid';
import { MoveIn } from '../models';

export default async function unitRoutes(fastify: FastifyInstance) {
  // GET all units
  fastify.get('/', async (request, reply) => {
    const units = await Unit.findAll();
    reply.send(units);
  });

  // GET unit by id
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const unit = await Unit.findByPk(id);
    if (!unit) return reply.status(404).send({ error: 'Unit not found' });
    reply.send(unit);
  });

  // POST create unit
  fastify.post('/', async (request, reply) => {
    const { UnitNumber, FloorNumber, BuildingId, UnitType, Area } = request.body as any;
    const unit = await Unit.create({
      Id: uuidv4(),
      UnitNumber,
      FloorNumber,
      BuildingId,
      UnitType,
      Area
    });
    reply.send(unit);
  });

  // PUT update unit
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { UnitNumber, FloorNumber, BuildingId, UnitType, Area } = request.body as any;
    const unit = await Unit.findByPk(id);
    if (!unit) return reply.status(404).send({ error: 'Unit not found' });
    await unit.update({ UnitNumber, FloorNumber, BuildingId, UnitType, Area });
    reply.send(unit);
  });

  // DELETE unit
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const unit = await Unit.findByPk(id);
    if (!unit) return reply.status(404).send({ error: 'Unit not found' });
    await unit.destroy();
    reply.send({ message: 'Unit deleted' });
  });

  fastify.get('/getMoveinName', async (request, reply) => {
    const { unitNumber } = request.query as { unitNumber: string };
   const unit = await Unit.findOne({
    where: { UnitNumber: unitNumber },
    include: ['moveins']
  });
    if (!unit) return reply.status(200).send({FullName: ''});
      const { FullName } = await (MoveIn.findOne({ where: { UnitId: unit.Id } }))
      console.log('FullName found:', FullName);
    reply.code(200).send({FullName});
  });

}
