export enum PaymentType {
    Cash = 1,
    Online = 2,
    Dispute = 3
}

export const PaymentTypeLabels: { [key in PaymentType]: string } = {
    [PaymentType.Cash]: 'Cash',
    [PaymentType.Online]: 'Online',
    [PaymentType.Dispute]: 'Dispute'
};


export const PaymentTypeOptions = Object.entries(PaymentTypeLabels).map(([key, label]) => ({
    value: Number(key),
    label
}));