import { Unit } from '../models/Unit';
import { v4 as uuidv4 } from 'uuid';
import { MoveIn } from '../models';

export class UnitController {
  getAll = async (request, reply) => {
    const units = await Unit.findAll();
    reply.send(units);
  };

  getById = async (request, reply) => {
    const { id } = request.params as { id: string };
    const unit = await Unit.findByPk(id);
    if (!unit) return reply.status(404).send({ error: 'Unit not found' });
    reply.send(unit);
  };

  create = async (request, reply) => {
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
  };

  update = async (request, reply) => {
    const { id } = request.params as { id: string };
    const { UnitNumber, FloorNumber, BuildingId, UnitType, Area } = request.body as any;
    const unit = await Unit.findByPk(id);
    if (!unit) return reply.status(404).send({ error: 'Unit not found' });
    await unit.update({ UnitNumber, FloorNumber, BuildingId, UnitType, Area });
    reply.send(unit);
  };

  delete = async (request, reply) => {
    const { id } = request.params as { id: string };
    const unit = await Unit.findByPk(id);
    if (!unit) return reply.status(404).send({ error: 'Unit not found' });
    await unit.destroy();
    reply.send({ message: 'Unit deleted' });
  };

  getMoveinName = async (request, reply) => {
    const { unitNumber } = request.query as { unitNumber: string };
    const unit = await Unit.findOne({
      where: { UnitNumber: unitNumber },
      include: ['moveins']
    });
    if (!unit) return reply.status(200).send({ FullName: '' });
    const movein = await MoveIn.findOne({ where: { UnitId: unit.Id } });
    const FullName = movein?.FullName || '';
    reply.code(200).send({ FullName });
  };
}