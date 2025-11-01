import { FastifyInstance } from 'fastify';
import { Billing } from '../models/Billing';
import { MoveIn } from '../models/MoveIn';
import { Unit } from '../models/Unit';
import { v4 as uuidv4 } from 'uuid';
import WaterReading from '../models/WaterReading';


export default async function billingRoutes(fastify: FastifyInstance) {
  fastify.post('/generate', async (request, reply) => {
    try {
        const { billingMonth } = request.body as { billingMonth: string };
        // ✅ Compute end of billing month
        const [year, month] = billingMonth.split('-').map(Number);
        const endOfMonth = new Date(year, month, 0); // last day of the billing month

        // ✅ Compute due date = end of month + 7 days
        const dueDate = new Date(endOfMonth);
        dueDate.setDate(endOfMonth.getDate() + 7);
        
        const prevMonth = new Date(year, month - 2, 1);
        const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

        // Fetch only active tenants with assigned UnitId
        const units: Unit[] = await Unit.findAll({
        });

        if (units.length === 0) {
            return reply.send({ message: 'No active unit found with assigned units.' });
        }

        const bills: any[] = [];

         for (const unit of units) {
            const alreadyExists = await Billing.findOne({
                where: {
                    UnitId: unit.Id,
                    BillingMonth: billingMonth,
                },
            });
    
            if(alreadyExists) {
              continue;
            }
        
            const lastBill = await Billing.findOne({
                where: {
                    UnitId: unit.Id,
                    BillingMonth: prevMonthStr,
                } as any,
                order: [['CreatedAt', 'DESC']],
            });

            let penalty = 0.00;
            let overdueAmount = 0;
            if (lastBill && (lastBill.Status === 'Unpaid' || lastBill.Status === 'PartiallyPaid')) {
                overdueAmount = parseFloat((lastBill?.Balance).toString()) || 0;
                penalty = 200.00;
            }

            // ✅ Compute total
            const condoDues = 2000.00;
            const waterBill = await(WaterReading.findOne({
                where: {
                    UnitId: unit.Id,
                    BillingMonth: billingMonth,
                }
            }).then(reading => {
                return reading ? parseFloat(reading.TotalAmount.toString()) : 0.00;
            }));
           
            const total = condoDues + waterBill + overdueAmount + penalty;

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
                PaidAmount: 0.00,
                Balance: total,
                Status: 'Unpaid',
            });
        }
        if(bills.length === 0) {
          return reply.status(400).send(`Billing records for ${billingMonth} already generated.`);
        }
        // Insert all in one go
        await Billing.bulkCreate(bills);

        reply.send({
          message: `${bills.length} billing records generated for ${billingMonth}.`,
        });

    } catch (error) {
      console.error('Error generating billing:', error);
      reply.status(500).send({ error: 'Failed to generate billing records.' });
    }
  });

  // ✅ GET billing statement for a given month
  fastify.get('/billingMonth/:billingMonth', async (request, reply) => {
    try {
      const { billingMonth } = request.params as { billingMonth: string };

      if (!billingMonth) {
        return reply.status(400).send({ error: 'Billing month is required (format: YYYY-MM)' });
      }
      
      // ✅ Query billing records for that month with tenant + unit details
      const bills = await Billing.findAll({
        where: { BillingMonth: billingMonth },
        include: [
          { association: 'unit', required: false, 
            include: [ { association: 'building', required: false }] },
          { association: 'moveIn', required: false },
        ],
        order: [[{ model: Unit, as: 'unit' }, 'FloorNumber', 'ASC'],  [{ model: Unit, as: 'unit' }, 'UnitNumber', 'ASC']], // sort by floor
      });

      if (bills.length === 0) {
        return reply.send({ message: `No billing records found for ${billingMonth}`, status: 0 });
      }

      // ✅ Transform data for cleaner output
      const formatted = bills.map((bill: any) => ({
        BillingId: bill.Id,
        BillingMonth: bill.BillingMonth,
        DueDate: bill.DueDate,
        FullName: bill.moveIn?.FullName ?? 'Vacant',    // lowercase alias
        Email: bill.moveIn?.Email ?? '',
        Mobile: bill.moveIn?.Mobile ?? '',
        BuildingNumber: bill.unit?.building?.BuildingNumber ?? '', // lowercase alias
        UnitNumber: bill.unit?.UnitNumber ?? '',        // lowercase alias
        CondoDues: bill.CondoDues,
        WaterBill: bill.WaterBill,
        OverdueAmount: bill.OverdueAmount,
        Penalty: bill.Penalty,
        TotalAmount: bill.TotalAmount,
        PaidAmount: bill.PaidAmount,
        Balance: bill.Balance,
        Status: bill.Status
    }));

    reply.send({
      billingMonth,
      totalRecords: formatted.length,
      data: formatted,
    });

    } catch (error) {
      console.error('Error fetching billing records:', error);
      reply.status(500).send({ error: 'Failed to fetch billing records.' });
    }
  });

  fastify.get('/search', async (request, reply) => {
    try {
      const { q } = request.query as { q?: string };
      
      // ✅ Query billing records for that month with tenant + unit details
      const bills = await Billing.findAll({
        include: [
          { association: 'unit', required: true, include: [ { association: 'building', required: false } ],
          where: {
            UnitNumber: q.trim()
          }
         },
          { association: 'moveIn', required: false },
        ],
        order: [[{ model: Unit, as: 'unit' }, 'FloorNumber', 'ASC'],  [{ model: Unit, as: 'unit' }, 'UnitNumber', 'ASC']], // sort by floor
      });

      // ✅ Transform data for cleaner output
      const formatted = bills.map((bill: any) => ({
        BillingId: bill.Id,
        BillingMonth: bill.BillingMonth,
        DueDate: bill.DueDate,
        FullName: bill.moveIn?.FullName ?? 'Vacant',    // lowercase alias
        Email: bill.moveIn?.Email ?? '',
        Mobile: bill.moveIn?.Mobile ?? '',
        BuildingNumber: bill.unit?.building?.BuildingNumber ?? '', // lowercase alias
        UnitNumber: bill.unit?.UnitNumber ?? '',        // lowercase alias
        CondoDues: bill.CondoDues,
        WaterBill: bill.WaterBill,
        OverdueAmount: bill.OverdueAmount,
        Penalty: bill.Penalty,
        TotalAmount: bill.TotalAmount,
        PaidAmount: bill.PaidAmount,
        Balance: bill.Balance,
        Status: bill.Status
    }));

    reply.send({
      totalRecords: formatted.length,
      data: formatted,
    });

    } catch (error) {
      console.error('Error fetching billing records:', error);
      reply.status(500).send({ error: 'Failed to fetch billing records.' });
    }
  });

}