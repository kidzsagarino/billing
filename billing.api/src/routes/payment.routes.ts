import { FastifyInstance } from "fastify";
import { Payment } from "../models/Payment";
import { Billing, MoveIn, Unit } from "../models";
import { v4 as uuidv4 } from "uuid";
import { validateFields } from '../hooks/fieldValidator';
import isOverDue from "../service/isOverDue";

export default async function paymentRoutes(fastify: FastifyInstance) {
    // GET all payments
    fastify.get("/", async (request, reply) => {
        await Payment.findAll({
            include: [{
                model: Unit,
                as: 'unit',
                include: [{
                    model: MoveIn,
                    as: 'moveins'
                }],
            }],
        }).then((payments) => {
                reply.code(200).send(payments);
        });
    });

    fastify.post("/", {
        preHandler: validateFields(['UnitNumber', 'PaymentDate', 'Amount', 'ARNumber', 'PaymentType', 'RefNumber', 'BillingMonth'])
    }, async (request, reply) => {    
        const { UnitNumber, PaymentDate, Amount, ARNumber, PaymentType, RefNumber, BillingMonth } = request.body as any;
        
        const unitId = await Unit.findOne({ where: { UnitNumber: UnitNumber } });

        if(!unitId) {
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

        const bill = await Billing.findOne({
            where: {
                UnitId: unitId ? unitId.Id : null,
                BillingMonth: BillingMonth,
            },
        });


        if(bill){

            
            const paidAmount = Number(bill.PaidAmount) || 0;
            const amount = Number(Amount) || 0;
            const totalAmount = Number(bill.TotalAmount) || 0;

            const totalPaid = paidAmount + amount;
            const balance: number = totalAmount - totalPaid;

            let penalty = 0.00;
        
            if(isOverDue(PaymentDate, bill.DueDate.toString()) || balance > 0){
                penalty = 200.00;
            }

            let status = 'Unpaid';

            if(balance <= 0){
                status = 'Paid';
            }

            else{
                status = 'PartiallyPaid';    
            }

            await bill.update({
                PaidAmount: Number(totalPaid),
                Balance: Number(balance) + Number(penalty),
                TotalAmount: Number(bill.TotalAmount) + Number(penalty),
                Status: status,
                Penalty: penalty,
            });
        }

        reply.code(200).send(payment);
    });
    fastify.put("/:id", async (request, reply) => {
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

            reply.send(payment);
        }
    );
};
