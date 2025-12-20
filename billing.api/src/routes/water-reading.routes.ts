import { FastifyInstance } from 'fastify';
import { WaterReadingController } from '../controllers/water-reading.controller';

export default async function waterReadingRoutes(fastify: FastifyInstance) {
  const controller = new WaterReadingController(fastify);

  fastify.get('/water-readings', { preHandler: fastify.authenticate },  controller.getAll);
  fastify.get('/water-readings/:billingMonth', { preHandler: fastify.authenticate }, controller.getByBillingMonth);
  fastify.get('/water-readings/search', { preHandler: fastify.authenticate }, controller.search);
  fastify.post('/water-readings', { preHandler: fastify.authenticate }, controller.create);
  fastify.put('/water-readings/:id', { preHandler: fastify.authenticate }, controller.update);
  fastify.post('/water-readings/loadForBillingMonth', { preHandler: fastify.authenticate }, controller.loadForBillingMonth);
  fastify.put('/water-readings/updateConsumption/:id', { preHandler: fastify.authenticate },  controller.update);
  fastify.post('/water-readings/searchByUnit', { preHandler: fastify.authenticate }, controller.searchByUnitNumber);
  fastify.post('/water-readings/searchByBillingMonth', { preHandler: fastify.authenticate },  controller.searchByBillingMonth);
}