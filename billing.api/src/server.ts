import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import fp from './plugins/sequelize';
import billingRoutes from './routes/billing.routes';
import buildingRoutes from './routes/building.routes';
import unitRoutes from './routes/unit.routes';
import moveinRoutes from './routes/movein.routes';
import waterReadingRoutes from './routes/water-reading.routes';
import paymentRoutes from './routes/payment.routes';
import userRoutes from './routes/user.routes';
import { authPlugin } from './plugins/auth';
import fastifyJwt from '@fastify/jwt';

const app: FastifyInstance = Fastify({ logger: true });

// Enable CORS
app.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'default_secret',
});

app.register(authPlugin);

// Register routes with API prefix
app.register(billingRoutes, { prefix: '/api/billing' });
app.register(buildingRoutes, { prefix: '/api/buildings' });
app.register(unitRoutes, { prefix: '/api/units' });
app.register(moveinRoutes, { prefix: '/api/moveins' });
app.register(waterReadingRoutes, { prefix: '/api/water' });
app.register(paymentRoutes, { prefix: '/api/payments' });
app.register(userRoutes, { prefix: '/api/users' });



const start = async () => {

  await app.register(fastifyEnv, {
  dotenv: true,
  schema: {
    type: 'object',
    required: [
      'PORT',
      'JWT_SECRET',
      'DB_HOST',
      'DB_USER',
      'DB_PASSWORD',
      'DB_NAME'
    ],
    properties: {
      PORT: { type: 'number', default: 3000 },
      JWT_SECRET: { type: 'string' },
      DB_HOST: { type: 'string' },
      DB_USER: { type: 'string' },
      DB_PASSWORD: { type: 'string' },
      DB_NAME: { type: 'string' },
      DB_PORT: { type: 'number', default: 3306 }
    }
  }
});

app.register(fp);

  try {
    
    // Start server
    await app.listen({ port: app.config.PORT })
    console.log('🚀 Fastify server running at http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();