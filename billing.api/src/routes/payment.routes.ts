import { FastifyInstance } from "fastify";
import { validateFields } from '../hooks/fieldValidator';
import { PaymentController } from '../controllers/payment.controller';

export default async function paymentRoutes(fastify: FastifyInstance) {
  const controller = new PaymentController(fastify);

  fastify.get("/", { preHandler: fastify.authenticate }, controller.getAll);

  fastify.post("/", {
    preHandler: [validateFields(['UnitNumber', 'PaymentDate', 'Amount', 'ARNumber', 'PaymentType', 'BillingMonth']), fastify.authenticate],
  }, controller.create);

  fastify.put("/:id", {
    preHandler: [validateFields(['UnitNumber', 'PaymentDate', 'Amount', 'ARNumber', 'PaymentType', 'BillingMonth']), fastify.authenticate],
  }, controller.update);

  fastify.post("/searchByUnit", { preHandler: fastify.authenticate }, controller.searchByUnitNumber);
  fastify.post("/searchByBillingMonth", { preHandler: fastify.authenticate }, controller.searchByBillingMonth);
}