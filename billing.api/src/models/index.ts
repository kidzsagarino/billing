import { sequelize } from '../config/db';
import { Unit } from './Unit';
import { MoveIn } from './MoveIn';
import { Billing } from './Billing';
import { Building } from './Building';
import WaterReading from './WaterReading';

// Ensure associations exist
Unit.hasMany(Billing, { foreignKey: 'UnitId', as: 'billings' });
Billing.belongsTo(Unit, { foreignKey: 'UnitId', as: 'unit' });

MoveIn.hasMany(Billing, { foreignKey: 'MoveInId', as: 'billings' });
Billing.belongsTo(MoveIn, { foreignKey: 'MoveInId', as: 'moveIn' });

Building.hasMany(Unit, { foreignKey: 'BuildingId', as: 'units' });
Unit.belongsTo(Building, { foreignKey: 'BuildingId', as: 'building' });

// Add MoveIn <-> Unit association for eager loading
Unit.hasMany(MoveIn, { foreignKey: 'UnitId', as: 'moveins' });
MoveIn.belongsTo(Unit, { foreignKey: 'UnitId', as: 'unit' });

Unit.hasMany(WaterReading, { foreignKey: 'UnitId', as: 'unit' });
WaterReading.belongsTo(Unit, { foreignKey: 'UnitId', as: 'unit' });

export { sequelize, Unit, MoveIn, Billing, Building };