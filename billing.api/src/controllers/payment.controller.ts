import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

export class PaymentController {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  getAll = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const payments = await this.fastify.Payment.findAll({
        include: [
          {
            association: 'unit',
            include: [
              { association: 'moveins', required: false }
            ],
          },
        ],
      });
      reply.code(200).send(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      reply.status(500).send({ error: 'Failed to fetch payments' });
    }
  };

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { UnitNumber, PaymentDate, Amount, ARNumber, PaymentType, RefNumber, BillingMonth } =
        request.body as any;

      const unit = await this.fastify.Unit.findOne({ where: { UnitNumber } });
      if (!unit) return reply.code(400).send({ error: 'Invalid Unit Number' });

      const payment = await this.fastify.Payment.create({
        Id: uuidv4(),
        UnitID: unit.Id,
        PaymentDate,
        Amount,
        ARNumber,
        PaymentType,
        RefNumber,
        BillingMonth
      });

      await this.updateBillingPayment(unit.Id, BillingMonth);

      reply.code(201).send(payment);
    } catch (error) {
      console.error('Error creating payment:', error);
      reply.status(500).send({ error: 'Failed to create payment' });
    }
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { UnitNumber, PaymentDate, Amount, ARNumber, PaymentType, RefNumber, BillingMonth } =
        request.body as any;

      const payment = await this.fastify.Payment.findByPk(id);
      if (!payment) return reply.status(404).send({ error: 'Payment not found' });

      const unit = await this.fastify.Unit.findOne({ where: { UnitNumber } });
      if (!unit) return reply.code(400).send({ error: 'Invalid Unit Number' });

      await payment.update({
        UnitID: unit.Id,
        PaymentDate,
        Amount,
        ARNumber,
        PaymentType,
        RefNumber,
        BillingMonth
      });

      await this.updateBillingPayment(unit.Id, BillingMonth);

      reply.code(200).send(payment);
    } catch (error) {
      console.error('Error updating payment:', error);
      reply.status(500).send({ error: 'Failed to update payment' });
    }
  };

  private updateBillingPayment = async (unitId: string, billingMonth: string) => {
    const bill = await this.fastify.Billing.findOne({
      where: { UnitId: unitId, BillingMonth: billingMonth }
    });

    if (!bill) return;

    const totalPaid = await this.fastify.Payment.sum('Amount', {
      where: { UnitID: unitId, BillingMonth: billingMonth }
    });

    const totalAmount = Number(bill.TotalAmount) || 0;
    const balance = totalAmount - (totalPaid || 0);

    let status: string = 'Unpaid';
    if (balance <= 0) status = 'Paid';
    else if (balance < totalAmount) status = 'PartiallyPaid';

    await bill.update({
      PaidAmount: totalPaid,
      Balance: balance,
      Status: status
    });
  };

  searchByUnitNumber = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { UnitNumber } = request.body as { UnitNumber: string };
      const unit = await this.fastify.Unit.findOne({ where: { UnitNumber } });
      if (!unit) return reply.code(200).send([]);

      const payments = await this.fastify.Payment.findAll({
        where: { UnitID: unit.Id },
        include: [
          {
            association: 'unit',
            include: [{ association: 'moveins', required: false }]
          }
        ],
      });

      reply.code(200).send(payments);
    } catch (error) {
      console.error('Error searching payments by unit:', error);
      reply.status(500).send({ error: 'Failed to search payments' });
    }
  };

  searchByBillingMonth = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { BillingMonth } = request.body as { BillingMonth: string };
      const payments = await this.fastify.Payment.findAll({
        where: { BillingMonth },
        include: [
          {
            association: 'unit',
            include: [{ association: 'moveins', required: false }]
          }
        ],
      });

      reply.code(200).send(payments);
    } catch (error) {
      console.error('Error searching payments by month:', error);
      reply.status(500).send({ error: 'Failed to search payments' });
    }
  };
}
