import fp from 'fastify-plugin'
import { Sequelize } from 'sequelize'
import { initBilling } from '../models/Billing'
import { initBuilding } from '../models/Building'
import { initMoveIn } from '../models/MoveIn'
import { initPayment } from '../models/Payment'
import { initUnit } from '../models/Unit'
import { initUser } from '../models/User'
import { initWaterReading } from '../models/WaterReading'

export default fp(async (fastify) => {
  const sequelize = new Sequelize(
    fastify.config.DB_NAME,
    fastify.config.DB_USER,
    fastify.config.DB_PASSWORD,
    {
      host: fastify.config.DB_HOST,
      port: fastify.config.DB_PORT,
      dialect: 'mysql',
      logging: false
    }
  );

  await sequelize.authenticate();
  fastify.log.info('✅ Database connected');
  
  const Billing = initBilling(sequelize);
  const Building = initBuilding(sequelize);
  const MoveIn = initMoveIn(sequelize);
  const Payment = initPayment(sequelize);
  const Unit = initUnit(sequelize);
  const User = initUser(sequelize);
  const WaterReading = initWaterReading(sequelize);

  Unit.hasMany(Billing, { foreignKey: 'UnitId', as: 'billings' });
  Billing.belongsTo(Unit, { foreignKey: 'UnitId', as: 'unit' });

  Building.hasMany(Unit, { foreignKey: 'BuildingId', as: 'units' });
  Unit.belongsTo(Building, { foreignKey: 'BuildingId', as: 'building' });

  Unit.hasMany(MoveIn, { foreignKey: 'UnitId', as: 'moveins' });
  MoveIn.belongsTo(Unit, { foreignKey: 'UnitId', as: 'unit' });

  Unit.hasMany(WaterReading, { foreignKey: 'UnitId', as: 'waterReadings' });
  WaterReading.belongsTo(Unit, { foreignKey: 'UnitId', as: 'unit' });

  Unit.hasMany(Payment, { foreignKey: 'UnitId', as: 'payments' });
  Payment.belongsTo(Unit, { foreignKey: 'UnitId', as: 'unit' });

  fastify.decorate('sequelize', sequelize);
  fastify.decorate('Billing', Billing);
  fastify.decorate('Building', Building);
  fastify.decorate('MoveIn', MoveIn);
  fastify.decorate('Payment', Payment);
  fastify.decorate('Unit', Unit);
  fastify.decorate('User', User);
  fastify.decorate('WaterReading', WaterReading);

  fastify.addHook('onClose', async () => {
    await sequelize.close()
  });
});