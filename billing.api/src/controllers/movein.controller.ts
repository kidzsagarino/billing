import { MoveIn } from '../models/MoveIn';
import { Unit } from '../models/Unit';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

export class MoveInController {
  // GET all move-ins (paginated)
  getAll = async (request, reply) => {
    const { page = 1, limit = 10, unitNumber } = request.query as any;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where: any = {};
    if (unitNumber && unitNumber.trim()) {
      where['$unit.UnitNumber$'] = { [Op.like]: `%${unitNumber.trim()}%` };
    }
    const { count, rows } = await MoveIn.findAndCountAll({
      where,
      include: [
        {
          association: 'unit',
          required: false,
          include: [
            {
              association: 'building',
              required: false
            }
          ]
        }
      ],
      offset,
      limit: parseInt(limit),
      order: [[{ model: Unit, as: 'unit' }, 'UnitNumber', 'ASC']]
    });
    const result = rows.map(m => {
      const plain = m.get({ plain: true }) as any;
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
  };

  // SEARCH move-ins by unit number
  search = async (request, reply) => {
    const { q } = request.query as { q?: string };
    if (!q || !q.trim()) {
      return reply.send([]);
    }
    const moveins = await MoveIn.findAll({
      include: [
        {
          association: 'unit',
          required: true,
          where: { UnitNumber: q.trim() },
          include: [
            {
              association: 'building',
              required: false
            }
          ]
        }
      ],
      order: [[{ model: Unit, as: 'unit' }, 'UnitNumber', 'ASC']]
    });
    const result = moveins.map(m => {
      const plain = m.get({ plain: true }) as any;
      return {
        ...plain,
        UnitNumber: plain.unit?.UnitNumber || null,
        BuildingNumber: plain.unit?.building?.BuildingNumber || null
      };
    });
    reply.send(result);
  };

  // FILTER move-ins by buildingId and/or unitId
  filter = async (request, reply) => {
    const { page = 1, limit = 10, buildingId, unitId } = request.query as any;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where: any = {};
    if (buildingId) {
      where['$unit.BuildingId$'] = buildingId;
    }
    if (unitId) {
      where['UnitId'] = unitId;
    }
    const { count, rows } = await MoveIn.findAndCountAll({
      where,
      include: [
        {
          association: 'unit',
          required: false,
          include: [
            {
              association: 'building',
              required: false
            }
          ]
        }
      ],
      offset,
      limit: parseInt(limit),
      order: [[{ model: Unit, as: 'unit' }, 'UnitNumber', 'ASC']]
    });
    const result = rows.map(m => {
      const plain = m.get({ plain: true }) as any;
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
  };

  // GET move-in by id
  getById = async (request, reply) => {
    const { id } = request.params as { id: string };
    const movein = await MoveIn.findByPk(id, {
      include: [
        {
          association: 'unit',
          required: false,
          include: [
            {
              association: 'building',
              required: false
            }
          ]
        }
      ]
    });
    if (!movein) return reply.status(404).send({ error: 'Move-in not found' });
    reply.send(movein);
  };

  // CREATE move-in
  create = async (request, reply) => {
    const { FullName, Email, Mobile, UnitId, MoveInDate, MoveOutDate, Status } = request.body as any;
    const movein = await MoveIn.create({
      Id: uuidv4(),
      FullName,
      Email,
      Mobile,
      UnitId,
      MoveInDate,
      MoveOutDate,
      Status
    });
    reply.code(200).send(movein);
  };

  // UPDATE move-in
  update = async (request, reply) => {
    const { id } = request.params as { id: string };
    const { FullName, Email, Mobile, UnitId, MoveInDate, MoveOutDate, Status } = request.body as any;
    const movein = await MoveIn.findByPk(id);
    if (!movein) return reply.status(404).send({ error: 'Move-in not found' });
    await movein.update({ FullName, Email, Mobile, UnitId, MoveInDate, MoveOutDate, Status, UpdatedAt: new Date() });
    reply.code(200).send(movein);
  };

  // DELETE move-in
  delete = async (request, reply) => {
    const { id } = request.params as { id: string };
    const movein = await MoveIn.findByPk(id);
    if (!movein) return reply.status(404).send({ error: 'Move-in not found' });
    await movein.destroy();
    reply.send({ message: 'Move-in deleted' });
  };
}