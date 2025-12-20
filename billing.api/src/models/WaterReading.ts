import { DataTypes, Model, Optional, Sequelize, CreationOptional } from 'sequelize';

interface WaterReadingAttributes {
  Id: string;
  UnitId: string;
  BillingMonth: string;
  PreviousReading: number;
  CurrentReading: number;
  RatePerCubic: number;
  TotalAmount: number;
  CreatedAt?: Date;
  UpdatedAt?: Date;
  ReadingDate: Date;
  Consumption: number;
}

type WaterReadingCreationAttributes = Optional<
  WaterReadingAttributes,
  'Id' | 'TotalAmount' | 'CreatedAt' | 'UpdatedAt'
>;

export class WaterReading
  extends Model<WaterReadingAttributes, WaterReadingCreationAttributes>
  implements WaterReadingAttributes
{
  public Id!: CreationOptional<string>;
  public UnitId!: string;
  public BillingMonth!: string;
  public PreviousReading!: number;
  public CurrentReading!: number;
  public RatePerCubic!: number;
  public TotalAmount!: number;
  public CreatedAt!: CreationOptional<Date>;
  public UpdatedAt!: CreationOptional<Date>;
  public ReadingDate!: Date;
  public Consumption!: number;
}

export function initWaterReading(sequelize: Sequelize) {
  WaterReading.init(
    {
      Id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      UnitId: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      BillingMonth: {
        type: DataTypes.STRING(7),
        allowNull: false,
      },
      PreviousReading: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      CurrentReading: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      RatePerCubic: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      TotalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      CreatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      UpdatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      ReadingDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      Consumption: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: 'WaterReadings',
      timestamps: false,
    }
  );

  return WaterReading;
}
