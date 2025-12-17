import { FastifyInstance } from "fastify";
import { validateFields } from '../hooks/fieldValidator';
import { PaymentController } from '../controllers/payment.controller';

export default async function paymentRoutes(fastify: FastifyInstance) {
  const controller = new PaymentController();

  fastify.get("/", controller.getAll);

  fastify.post("/", {
    preHandler: validateFields(['UnitNumber', 'PaymentDate', 'Amount', 'ARNumber', 'PaymentType', 'RefNumber', 'BillingMonth'])
  }, controller.create);

  fastify.put("/:id", {
    preHandler: validateFields(['UnitNumber', 'PaymentDate', 'Amount', 'ARNumber', 'PaymentType', 'RefNumber', 'BillingMonth'])
  } ,controller.update);

  fastify.post("/searchByUnit", controller.searchByUnitNumber);
  fastify.post("/searchByBillingMonth", controller.searchByBillingMonth);
}