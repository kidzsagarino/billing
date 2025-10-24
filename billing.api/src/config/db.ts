import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize('saekyong_billing', 'root', '#Local2025', {
  host: 'localhost',
  dialect: 'mysql',
});