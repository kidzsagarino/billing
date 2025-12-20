import { FastifyInstance } from 'fastify';
import { BillingController } from '../controllers/billing.controller';

export default async function billingRoutes(fastify: FastifyInstance) {
  
  const controller = new BillingController(fastify);

  fastify.post('/generate',  { preHandler: fastify.authenticate} , controller.generate);
  fastify.get('/billingMonth/:billingMonth', { preHandler: fastify.authenticate }, controller.getByMonth);
  fastify.get('/search', { preHandler: fastify.authenticate }, controller.search);
}