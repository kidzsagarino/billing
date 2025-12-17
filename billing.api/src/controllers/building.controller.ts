import { Building } from '../models/Building';
import { Unit } from '../models/Unit';

export class BuildingController {
  getAll = async (request, reply) => {
    const buildings = await Building.findAll();
    reply.send(buildings);
  };

  getUnitsByBuilding = async (request, reply) => {
    const { buildingId } = request.params as { buildingId: string };
    const units = await Unit.findAll({ where: { BuildingId: buildingId } });
    reply.send(units);
  };
}