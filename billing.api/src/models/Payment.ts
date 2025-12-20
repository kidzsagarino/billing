import { InferAttributes, InferCreationAttributes, Model, DataTypes, CreationOptional, Sequelize } from "sequelize";

export class Payment extends Model<InferAttributes<Payment>, InferCreationAttributes<Payment>> {
  declare Id: CreationOptional<string>;
  declare BillingMonth: string;
  declare UnitID: string;
  declare PaymentDate: Date;
  declare Amount: number;
  declare ARNumber: string;
  declare PaymentType: number;
  declare RefNumber: string;
  declare CreatedAt: CreationOptional<Date>;
  declare UpdatedAt: CreationOptional<Date>;
}

// Factory function to initialize the model
export function initPayment(sequelize: Sequelize) {
  Payment.init(
    {
      Id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      UnitID: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      BillingMonth: {
        type: DataTypes.STRING(7),
        allowNull: false,
      },
      PaymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      Amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      ARNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
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
        },
      },
      RefNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      UpdatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'payments',
      timestamps: false,
    }
  );

  return Payment;
}
