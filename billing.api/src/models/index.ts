import { sequelize } from '../config/db';
import { Unit } from './Unit';
import { MoveIn } from './MoveIn';
import { Billing } from './Billing';

// Ensure associations exist
Unit.hasMany(Billing, { foreignKey: 'UnitId', as: 'billings' });
Billing.belongsTo(Unit, { foreignKey: 'UnitId', as: 'unit' });

MoveIn.hasMany(Billing, { foreignKey: 'MoveInId', as: 'billings' });
Billing.belongsTo(MoveIn, { foreignKey: 'MoveInId', as: 'moveIn' });

export { sequelize, Unit, MoveIn, Billing };