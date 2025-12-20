import { Unit } from './Unit';
import { MoveIn } from './MoveIn';
import { Billing } from './Billing';
import { Building } from './Building';
import { WaterReading } from './WaterReading';
import { Payment } from './Payment';

// Ensure associations exist
Unit.hasMany(Billing, { foreignKey: 'UnitId', as: 'billings' });
Billing.belongsTo(Unit, { foreignKey: 'UnitId', as: 'unit' });

Building.hasMany(Unit, { foreignKey: 'BuildingId', as: 'units' });
Unit.belongsTo(Building, { foreignKey: 'BuildingId', as: 'building' });

// Add MoveIn <-> Unit association for eager loading
Unit.hasMany(MoveIn, { foreignKey: 'UnitId', as: 'moveins' });
MoveIn.belongsTo(Unit, { foreignKey: 'UnitId', as: 'unit' });

Unit.hasMany(WaterReading, { foreignKey: 'UnitId', as: 'unit' });
WaterReading.belongsTo(Unit, { foreignKey: 'UnitId', as: 'unit' });

Unit.hasMany(Payment, { foreignKey: 'UnitId', as: 'payments' });
Payment.belongsTo(Unit, { foreignKey: 'UnitId', as: 'unit' });

export {Unit, MoveIn, Billing, WaterReading, Building, Payment };