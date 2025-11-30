import { FastifyInstance } from "fastify";
import { Payment } from "../models/Payment";
import { MoveIn, Unit } from "../models";
import { v4 as uuidv4 } from "uuid";

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

    fastify.post("/", async (request, reply) => {    
        const { UnitNumber, PaymentDate, Amount, ARNumber, PaymentType, RefNumber, BillingMonth } = request.body as any;
        
        const unitId = await Unit.findOne({ where: { UnitNumber: UnitNumber } });
        
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
