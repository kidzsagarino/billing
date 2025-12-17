import { FastifyInstance } from 'fastify';
import { BillingController } from '../controllers/billing.controller';

export default async function billingRoutes(fastify: FastifyInstance) {
  const controller = new BillingController();

  fastify.post('/generate', controller.generate);
  fastify.get('/billingMonth/:billingMonth', controller.getByMonth);
  fastify.get('/search', controller.search);
}