export default function isOverDue(paymentDateStr: string | Date, dueDateStr: string | Date): boolean {

    const paymentDate = new Date(paymentDateStr);
    const dueDate = new Date(dueDateStr);
    return paymentDate > dueDate;
}