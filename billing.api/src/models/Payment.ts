import { InferAttributes, InferCreationAttributes, Model, DataTypes } from "sequelize"
import { sequelize } from "../config/db";

export class Payment extends Model<
    InferAttributes<Payment>,  InferCreationAttributes<Payment>> {
        declare Id: string;
        declare BillingMonth: string;
        declare UnitID: string;
        declare PaymentDate: Date;
        declare Amount: number;
        declare ARNumber: string;
        declare PaymentType: number;
        declare RefNumber: string;
        declare CreatedAt: Date;
        declare UpdatedAt: Date;
    }

    Payment.init(
        {
            Id: { type: DataTypes.CHAR(36), primaryKey: true }, 
            UnitID: DataTypes.STRING,
            BillingMonth: DataTypes.STRING,
            PaymentDate: DataTypes.DATE,
            Amount: DataTypes.DECIMAL(10, 2),
            ARNumber: DataTypes.STRING, 
            PaymentType: {
                type: DataTypes.INTEGER,
                allowNull: false,
                get() {
                    const value = this.getDataValue('PaymentType');
                    const labels: Record<number, string> = {
                    1: 'Cash',
                    2: 'Online',
                    3: 'Dispute',
                    };
                    return labels[value] ?? null;
                }
            },
            RefNumber: DataTypes.STRING,
            CreatedAt: DataTypes.DATE,
            UpdatedAt: DataTypes.DATE,
        },
        { sequelize, tableName: 'payments' }
    );