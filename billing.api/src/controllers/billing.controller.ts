import { Billing } from '../models/Billing';
import { Unit } from '../models/Unit';
import { v4 as uuidv4 } from 'uuid';
import WaterReading from '../models/WaterReading';
import { MoveIn, Payment } from '../models';
import isOverDue from '../service/isOverDue';

export class BillingController {

  private getDueDate = (billingMonth: string): Date => {
    const [year, month] = billingMonth.split('-').map(Number);
    const endOfMonth = new Date(year, month, 0);
    const dueDate = new Date(endOfMonth);
    dueDate.setDate(endOfMonth.getDate() + 7);
    return dueDate;
  };

  private getPrevMonthStr = (billingMonth: string): string => {
    const [year, month] = billingMonth.split('-').map(Number);
    const prevMonth = new Date(year, month - 2, 1);
    return `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
  };

  private async getUnits(): Promise<Unit[]> {
    return Unit.findAll();
  }

  private async getLastBill(unitId: string, prevMonthStr: string) {
    return Billing.findOne({
      where: { UnitId: unitId, BillingMonth: prevMonthStr } as any,
      order: [['CreatedAt', 'DESC']],
    });
  }

  private async getWaterReading(unitId: string, billingMonth: string) {
    return (
      (await WaterReading.findOne({
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
        (await Payment.max('PaymentDate', {
          where: {
            UnitID: unit.Id,
            BillingMonth: prevMonthStr,
          },
        })) || undefined;

      if (lastBillPaymentDate) {
        if (isOverDue(lastBillPaymentDate, lastBill!.DueDate)) {
          penalty = 200.0;
        }
      }
    }
    return { penalty, overdueAmount };
  }

  private async getPaidAmount(unitId: string, billingMonth: string) {
    return (
      (await Payment.sum('Amount', {
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

  generate = async (request, reply) => {
    try {
      const { billingMonth } = request.body as { billingMonth: string };
      const dueDate = this.getDueDate(billingMonth);
      const prevMonthStr = this.getPrevMonthStr(billingMonth);

      const units: Unit[] = await this.getUnits();

      if (units.length === 0) {
        return reply.code(400).send({ error: 'No active unit found with assigned units.' });
      }

      const bills: any[] = [];

      for (const unit of units) {
        const alreadyExists = await Billing.findOne({
          where: {
            UnitId: unit.Id,
            BillingMonth: billingMonth,
          },
        });

        if (alreadyExists) continue;

        const moveIn = await MoveIn.findOne({ where: { UnitId: unit.Id } });

        if(moveIn && moveIn.FullName == ''){
          continue;
        }

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

      await Billing.bulkCreate(bills);

      reply.send({
        message: `${bills.length} billing records generated for ${billingMonth}.`,
      });
    } catch (error) {
      console.error('Error generating billing:', error);
      reply.status(500).send({ error: 'Failed to generate billing records.' });
    }
  };

  getByMonth = async (request, reply) => {
    try {
      const { billingMonth } = request.params as { billingMonth: string };

      if (!billingMonth) {
        return reply.status(400).send({ error: 'Billing month is required (format: YYYY-MM)' });
      }

      const bills = await Billing.findAll({
        where: { BillingMonth: billingMonth },
        include: [
          { association: 'unit', required: false, include: [{ association: 'building', required: false }] },
          { association: 'moveIn', required: false },
        ],
        order: [
          [{ model: Unit, as: 'unit' }, 'FloorNumber', 'ASC'],
          [{ model: Unit, as: 'unit' }, 'UnitNumber', 'ASC']
        ],
      });

      if (bills.length === 0) {
        return reply.send({ message: `No billing records found for ${billingMonth}`, status: 0 });
      }

      const formatted = await Promise.all(
        bills.map(async (bill: any) => ({
          BillingId: bill.Id,
          BillingMonth: bill.BillingMonth,
          DueDate: bill.DueDate,
          FullName: bill.moveIn?.FullName ?? "Vacant",
          Email: bill.moveIn?.Email ?? "",
          Mobile: bill.moveIn?.Mobile ?? "",
          BuildingNumber: bill.unit?.building?.BuildingNumber ?? "",
          UnitNumber: bill.unit?.UnitNumber ?? "",
          CondoDues: bill.CondoDues,
          WaterBill: bill.WaterBill,
          OverdueAmount: bill.OverdueAmount,
          Penalty: bill.Penalty,
          TotalAmount: bill.TotalAmount,
          PaidAmount: bill.PaidAmount,
          Balance: bill.Balance,
          Status: bill.Status,
        }))
      );

      reply.send({
        billingMonth,
        totalRecords: formatted.length,
        data: formatted,
      });

    } catch (error) {
      console.error('Error fetching billing records:', error);
      reply.status(500).send({ error: 'Failed to fetch billing records.' });
    }
  };

  search = async (request, reply) => {
    try {
      const { q } = request.query as { q?: string };

      const bills = await Billing.findAll({
        where: {
          '$unit.UnitNumber$': q.trim()
        },
        include: [
          {
            association: 'unit',
            required: false,
            include: [{ association: 'building', required: false }]
          },
          { association: 'moveIn', required: false }
        ],
        order: [
        //   [{ model: Unit, as: 'unit' }, 'FloorNumber', 'ASC'],
        //   [{ model: Unit, as: 'unit' }, 'UnitNumber', 'ASC']
        ['CreatedAt', 'DESC']
        ]
      });

      const formatted = await Promise.all(bills.map(async (bill: any) => ({
        BillingId: bill.Id,
        BillingMonth: bill.BillingMonth,
        DueDate: bill.DueDate,
        FullName: bill.moveIn?.FullName ?? 'Vacant',
        Email: bill.moveIn?.Email ?? '',
        Mobile: bill.moveIn?.Mobile ?? '',
        BuildingNumber: bill.unit?.building?.BuildingNumber ?? '',
        UnitNumber: bill.unit?.UnitNumber ?? '',
        CondoDues: bill.CondoDues,
        WaterBill: bill.WaterBill,
        OverdueAmount: bill.OverdueAmount,
        Penalty: bill.Penalty,
        TotalAmount: bill.TotalAmount,
        PaidAmount: bill.PaidAmount,
        Balance: bill.Balance,
        Status: bill.Status
      })));

      reply.send({
        totalRecords: formatted.length,
        data: formatted,
      });

    } catch (error) {
      console.error('Error fetching billing records:', error);
      reply.status(500).send({ error: 'Failed to fetch billing records.' });
    }
  };
}