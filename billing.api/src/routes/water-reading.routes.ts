import { FastifyInstance } from 'fastify';
import { WaterReadingController } from '../controllers/water-reading.controller';

export default async function waterReadingRoutes(fastify: FastifyInstance) {
  const controller = new WaterReadingController();

  fastify.get('/water-readings', controller.getAll);
  fastify.get('/water-readings/:billingMonth', controller.getByBillingMonth);
  fastify.get('/water-readings/search', controller.search);
  fastify.post('/water-readings', controller.create);
  fastify.put('/water-readings/:id', controller.update);
  fastify.post('/water-readings/loadForBillingMonth', controller.loadForBillingMonth);
  fastify.put('/water-readings/updateConsumption/:id', controller.updateConsumption);
  fastify.post('/water-readings/searchByUnit', controller.searchByUnitNumber);
  fastify.post('/water-readings/searchByBillingMonth', controller.searchByBillingMonth);
}