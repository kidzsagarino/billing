import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { sequelize } from './models'; // Import from models/index.ts
import billingRoutes from './routes/billing.routes';
import buildingRoutes from './routes/building.routes';
import unitRoutes from './routes/unit.routes';
import moveinRoutes from './routes/movein.routes';
import waterReadingRoutes from './routes/water-reading.routes';
import paymentRoutes from './routes/payment.routes';
import userRoutes from './routes/user.routes';

const app: FastifyInstance = Fastify({ logger: true });

// Enable CORS
app.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// Register routes with API prefix
app.register(billingRoutes, { prefix: '/api/billing' });
app.register(buildingRoutes, { prefix: '/api/buildings' });
app.register(unitRoutes, { prefix: '/api/units' });
app.register(moveinRoutes, { prefix: '/api/moveins' });
app.register(waterReadingRoutes, { prefix: '/api/water' });
app.register(paymentRoutes, { prefix: '/api/payments' });
app.register(userRoutes, { prefix: '/api/users' });

const start = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Start server
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Fastify server running at http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Start the server
start();