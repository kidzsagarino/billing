import { Building, Unit } from "../models";

export async function findUnitId(buildingNumber: number, unitNumber: number): Promise<string | null> {
    const building = await Building.findOne({ where: { BuildingNumber: buildingNumber } });
    if (!building) return null;

    const unit = await Unit.findOne({ where: { UnitNumber: unitNumber, BuildingId: building.id } });
    return unit ? unit.Id : null;
}