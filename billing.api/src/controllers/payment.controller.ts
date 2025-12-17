import { Payment } from "../models/Payment";
import { Billing, MoveIn, Unit } from "../models";
import { v4 as uuidv4 } from "uuid";

export class PaymentController {
  getAll = async (request, reply) => {
    const payments = await Payment.findAll({
      include: [{
        model: Unit,
        as: 'unit',
        include: [{
          model: MoveIn,
          as: 'moveins'
        }],
      }],
    });
    reply.code(200).send(payments);
  };

  create = async (request, reply) => {
    const { UnitNumber, PaymentDate, Amount, ARNumber, PaymentType, RefNumber, BillingMonth } = request.body as any;
    const unitId = await Unit.findOne({ where: { UnitNumber: UnitNumber } });

    if (!unitId) {
      return reply.code(400).send({ error: 'Invalid Unit Number' });
    }

    const payment = await Payment.create({
      Id: uuidv4(),
      UnitID: unitId ? unitId.Id : null,
      PaymentDate,
      Amount,
      ARNumber,
      PaymentType,
      RefNumber,
      BillingMonth
    });

    this.updateBillingPayment(unitId.Id, BillingMonth, Amount);

    reply.code(200).send(payment);
  };

  update = async (request, reply) => {
    const { id } = request.params as { id: string };
    const { UnitNumber, PaymentDate, Amount, ARNumber, PaymentType, RefNumber, BillingMonth } = request.body as any;
    const payment = await Payment.findByPk(id);
    if (!payment) return reply.status(404).send({ error: 'Payment not found' });

    const unitId = await Unit.findOne({ where: { UnitNumber: UnitNumber } });
    await payment.update({
      UnitID: unitId ? unitId.Id : null,
      PaymentDate,
      Amount,
      ARNumber,
      PaymentType,
      RefNumber,
      BillingMonth
    });

    this.updateBillingPayment(unitId.Id, BillingMonth, Amount);

    reply.send(payment);
  };

  updateBillingPayment = async(unitId: string, billingMonth: string, amount: number) => {
    const bill = await Billing.findOne({
      where: {
        UnitId: unitId,
        BillingMonth: billingMonth,
      },
    });

    if (bill) {

      const totalPaid = await Payment.sum('Amount', {
        where: {
          UnitID: unitId,
          BillingMonth: billingMonth,
        },
      });

      const totalAmount = Number(bill.TotalAmount) || 0;

      const balance: number = totalAmount - amount;

      let status = 'Unpaid';

      if (balance <= 0) {
        status = 'Paid';
      } else {
        status = 'PartiallyPaid';
      }

      await bill.update({
        PaidAmount: totalPaid,
        Balance: Number(balance),
        Status: status,
      });
    }
  }
  searchByUnitNumber = async (request, reply) => {
    const { UnitNumber } = request.body as { UnitNumber: string };
    const unit = await Unit.findOne({ where: { UnitNumber: UnitNumber } });
    if (!unit) {
      return reply.code(200).send([]);
    }
    const payments = await Payment.findAll({ 
      where: { UnitID: unit.Id },
      include: [{
        model: Unit,
        as: 'unit',
        include: [{
          model: MoveIn,
          as: 'moveins'
        }],
      }],
    });
    reply.code(200).send(payments);
  }

  searchByBillingMonth = async (request, reply) => {
    const { BillingMonth } = request.body as { BillingMonth: string };
    const payments = await Payment.findAll({ 
      where: { BillingMonth: BillingMonth },
      include: [{
        model: Unit,
        as: 'unit',
        include: [{
          model: MoveIn,
          as: 'moveins'
        }],
      }],
    });
    reply.code(200).send(payments);
  }
}