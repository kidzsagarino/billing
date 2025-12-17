import { Billing } from "../models";

export default async function updateBillingAmount(billingId: string, amount: number) {
    const billingRecord = await Billing.findByPk(billingId);
    if (!billingRecord) {
        throw new Error('Billing record not found');
    }

    const newPaidAmount = parseFloat((billingRecord.PaidAmount + amount).toFixed(3));
}   
