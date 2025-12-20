import { v4 as uuidv4 } from 'uuid';
import isOverDue from '../service/isOverDue';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export class BillingController {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  private getDueDate(billingMonth: string): Date {
    const [year, month] = billingMonth.split('-').map(Number);
    const endOfMonth = new Date(year, month, 0);
    const dueDate = new Date(endOfMonth);
    dueDate.setDate(endOfMonth.getDate() + 7);
    return dueDate;
  }

  private getPrevMonthStr(billingMonth: string): string {
    const [year, month] = billingMonth.split('-').map(Number);
    const prevMonth = new Date(year, month - 2, 1);
    return `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
  }

  private async getUnits() {
    return this.fastify.Unit.findAll();
  }

  private async getLastBill(unitId: string, prevMonthStr: string) {
    return this.fastify.Billing.findOne({
      where: { UnitId: unitId, BillingMonth: prevMonthStr } as any,
      order: [['CreatedAt', 'DESC']],
    });
  }

  private async getWaterReading(unitId: string, billingMonth: string) {
    return (
      (await this.fastify.WaterReading.findOne({
        where: { UnitId: unitId, BillingMonth: billingMonth },
      })) || { Consumption: 0 }
    );
  }

  private async getPenaltyAndOverdue(unit: any, prevMonthStr: string, lastBill: any) {
    let penalty = 0.0;
    let overdueAmount = lastBill?.Balance ? Number(lastBill?.Balance) : 0;

    if (overdueAmount > 0) {
      penalty = 200.0;
    } else {
      const lastBillPaymentDate: string =
        (await this.fastify.Payment.max('PaymentDate', {
          where: {
            UnitID: unit.Id,
            BillingMonth: prevMonthStr,
          },
        })) || undefined;

      if (lastBillPaymentDate && isOverDue(lastBillPaymentDate, lastBill!.DueDate)) {
        penalty = 200.0;
      }
    }

    return { penalty, overdueAmount };
  }

  private async getPaidAmount(unitId: string, billingMonth: string) {
    return (
      (await this.fastify.Payment.sum('Amount', {
        where: {
          UnitID: unitId,
          BillingMonth: billingMonth,
        },
      })) || 0.0
    );
  }

  private getStatus(balance: number, paidAmount: number): string {
    if (balance <= 0) return 'Paid';
    if (paidAmount !== 0.0 && balance > 0) return 'PartiallyPaid';
    return 'Unpaid';
  }

  generate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { billingMonth } = request.body as { billingMonth: string };
      const dueDate = this.getDueDate(billingMonth);
      const prevMonthStr = this.getPrevMonthStr(billingMonth);

      const units = await this.getUnits();

      if (units.length === 0) {
        return reply.code(400).send({ error: 'No active unit found with assigned units.' });
      }

      const bills: any[] = [];

      for (const unit of units) {
        const alreadyExists = await this.fastify.Billing.findOne({
          where: { UnitId: unit.Id, BillingMonth: billingMonth },
        });

        if (alreadyExists) continue;

        const moveIn = await this.fastify.MoveIn.findOne({ where: { UnitId: unit.Id } });
        if (moveIn && !moveIn.FullName) continue;

        const lastBill = await this.getLastBill(unit.Id, prevMonthStr);
        const lastWaterReading = await this.getWaterReading(unit.Id, prevMonthStr);
        const { penalty, overdueAmount } = await this.getPenaltyAndOverdue(unit, prevMonthStr, lastBill);

        const condoDues = 2000.0;
        const currentReading = await this.getWaterReading(unit.Id, billingMonth);

        const consumption =
          parseFloat(currentReading.Consumption.toString()) -
          parseFloat(lastWaterReading.Consumption.toString());
        const waterBill = consumption > 2 ? consumption * 82.5 : 165.0;

        const total = condoDues + waterBill + overdueAmount + penalty;
        const paidAmount = await this.getPaidAmount(unit.Id, billingMonth);
        const balance = total - paidAmount;
        const status = this.getStatus(balance, paidAmount);

        bills.push({
          Id: uuidv4(),
          UnitId: unit.Id,
          BillingMonth: billingMonth,
          DueDate: dueDate,
          CondoDues: condoDues,
          WaterBill: waterBill,
          OverdueAmount: overdueAmount,
          Penalty: penalty,
          TotalAmount: total,
          PaidAmount: paidAmount,
          Balance: balance,
          Status: status,
        });
      }

      if (bills.length === 0) {
        return reply.status(400).send(`Billing records for ${billingMonth} already generated.`);
      }

      await this.fastify.Billing.bulkCreate(bills);

      reply.send({ message: `${bills.length} billing records generated for ${billingMonth}.` });
    } catch (error) {
      console.error('Error generating billing:', error);
      reply.status(500).send({ error: 'Failed to generate billing records.' });
    }
  };

  getByMonth = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { billingMonth } = request.params as { billingMonth: string };
      if (!billingMonth) return reply.status(400).send({ error: 'Billing month is required (format: YYYY-MM)' });

      const bills = await this.fastify.Billing.findAll({
        where: { BillingMonth: billingMonth },
        include: [
          {
            association: 'unit',
            required: false,
            include: [
              { association: 'building', required: false },
              { association: 'moveins', required: false },
            ],
          },
        ],
        order: [
          [{ model: this.fastify.Unit, as: 'unit' }, 'FloorNumber', 'ASC'],
          [{ model: this.fastify.Unit, as: 'unit' }, 'UnitNumber', 'ASC'],
        ],
      });

      if (bills.length === 0) return reply.send({ message: `No billing records found for ${billingMonth}`, status: 0 });

      const formatted = bills.map((bill: any) => ({
        BillingId: bill.Id,
        BillingMonth: bill.BillingMonth,
        DueDate: bill.DueDate,
        FullName: bill.unit?.moveins?.[0]?.FullName ?? 'Vacant',
        Email: bill.unit?.moveins?.[0]?.Email ?? '',
        Mobile: bill.unit?.moveins?.[0]?.Mobile ?? '',
        BuildingNumber: bill.unit?.building?.BuildingNumber ?? '',
        UnitNumber: bill.unit?.UnitNumber ?? '',
        CondoDues: bill.CondoDues,
        WaterBill: bill.WaterBill,
        OverdueAmount: bill.OverdueAmount,
        Penalty: bill.Penalty,
        TotalAmount: bill.TotalAmount,
        PaidAmount: bill.PaidAmount,
        Balance: bill.Balance,
        Status: bill.Status,
      }));

      reply.send({ billingMonth, totalRecords: formatted.length, data: formatted });
    } catch (error) {
      console.error('Error fetching billing records:', error);
      reply.status(500).send({ error: 'Failed to fetch billing records.' });
    }
  };

  search = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { q } = request.query as { q?: string };
      if (!q) return reply.send({ totalRecords: 0, data: [] });

      const bills = await this.fastify.Billing.findAll({
        where: { '$unit.UnitNumber$': q.trim() },
        include: [
          {
            association: 'unit',
            required: false,
            include: [
              { association: 'building', required: false },
              { association: 'moveins', required: false },
            ],
          },
        ],
        order: [['CreatedAt', 'DESC']],
      });

      const formatted = bills.map((bill: any) => ({
        BillingId: bill.Id,
        BillingMonth: bill.BillingMonth,
        DueDate: bill.DueDate,
        FullName: bill.unit?.moveins?.[0]?.FullName ?? 'Vacant',
        Email: bill.unit?.moveins?.[0]?.Email ?? '',
        Mobile: bill.unit?.moveins?.[0]?.Mobile ?? '',
        BuildingNumber: bill.unit?.building?.BuildingNumber ?? '',
        UnitNumber: bill.unit?.UnitNumber ?? '',
        CondoDues: bill.CondoDues,
        WaterBill: bill.WaterBill,
        OverdueAmount: bill.OverdueAmount,
        Penalty: bill.Penalty,
        TotalAmount: bill.TotalAmount,
        PaidAmount: bill.PaidAmount,
        Balance: bill.Balance,
        Status: bill.Status,
      }));

      reply.send({ totalRecords: formatted.length, data: formatted });
    } catch (error) {
      console.error('Error fetching billing records:', error);
      reply.status(500).send({ error: 'Failed to fetch billing records.' });
    }
  };
}
