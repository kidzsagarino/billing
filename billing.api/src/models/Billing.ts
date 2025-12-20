import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Sequelize,
} from 'sequelize';
import { MoveIn } from './MoveIn';
export class Billing extends Model<
  InferAttributes<Billing>,
  InferCreationAttributes<Billing>
> {
  declare Id: CreationOptional<string>;
  declare UnitId: string;
  declare MoveInId: ForeignKey<MoveIn['Id']> | null;
  declare BillingMonth: string;
  declare DueDate: Date;
  declare CondoDues: number;
  declare WaterBill: number;
  declare OverdueAmount: number;
  declare Penalty: number;
  declare TotalAmount: number;
  declare PaidAmount: number;
  declare Balance: number;
  declare Status: string;
  declare CreatedAt: CreationOptional<Date>;
  declare UpdatedAt: CreationOptional<Date>;
}

export function initBilling(sequelize: Sequelize){
  Billing.init(
    {
      Id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      UnitId: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      MoveInId: {
        type: DataTypes.CHAR(36),
        allowNull: true,
      },
      BillingMonth: {
        type: DataTypes.STRING(7),
        allowNull: false,
      },
      DueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      CondoDues: {
        type: DataTypes.DECIMAL(10, 3),
        defaultValue: 2000.0,
      },
      WaterBill: {
        type: DataTypes.DECIMAL(10, 3),
        defaultValue: 0.0,
      },
      OverdueAmount: {
        type: DataTypes.DECIMAL(10, 3),
        defaultValue: 0.0,
      },
      Penalty: {
        type: DataTypes.DECIMAL(10, 3),
        defaultValue: 0.0,
      },
      TotalAmount: {
        type: DataTypes.DECIMAL(10, 3),
        defaultValue: 0.0,
      },
      PaidAmount: {
        type: DataTypes.DECIMAL(10, 3),
        defaultValue: 0.0,
      },
      Balance: {
        type: DataTypes.DECIMAL(10, 3),
        defaultValue: 0.00,
      },
      Status: {
        type: DataTypes.STRING(20),
        defaultValue: 'Unpaid',
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
      tableName: 'Billings',
      timestamps: false,
    }
  );
  
  return Billing;
}

