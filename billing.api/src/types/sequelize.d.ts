import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      DB_HOST: string;
      DB_USER: string;
      DB_PASSWORD: string;
      [key: string]: any;
      PORT: number;
      JWT_SECRET: string;
      DB_NAME: string;
      DB_PORT: number;
    };
    // Add Sequelize and models here
    sequelize: Sequelize;
    Unit: typeof Unit;
    MoveIn: typeof MoveIn;
    Billing: typeof Billing;
    WaterReading: typeof WaterReading;
    Payment: typeof Payment;
    User: typeof User;
    Building: typeof Building;
  }
}