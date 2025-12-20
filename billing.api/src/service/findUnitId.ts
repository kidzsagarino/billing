import { FastifyInstance } from "fastify";

export async function findUnitId(buildingNumber: number, unitNumber: number, fastify: FastifyInstance): Promise<string | null> {
    const building = await fastify.Building.findOne({ where: { BuildingNumber: buildingNumber } });
    if (!building) return null;

    const unit = await fastify.Unit.findOne({ where: { UnitNumber: unitNumber, BuildingId: building.id } });
    return unit ? unit.Id : null;
}