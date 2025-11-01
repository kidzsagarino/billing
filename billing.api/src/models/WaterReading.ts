import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
// Define attributes
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

// Define optional fields for creation
type WaterReadingCreationAttributes = Optional<
  WaterReadingAttributes,
  'Id' | 'TotalAmount' | 'CreatedAt' | 'UpdatedAt'
>;

// Define class model
class WaterReading
  extends Model<WaterReadingAttributes, WaterReadingCreationAttributes>
  implements WaterReadingAttributes
{
  public Id!: string;
  public UnitId!: string;
  public BillingMonth!: string;
  public PreviousReading!: number;
  public CurrentReading!: number;
  public RatePerCubic!: number;
  public TotalAmount!: number;
  public CreatedAt!: Date;
  public UpdatedAt!: Date;
  public ReadingDate!: Date;
  public Consumption!: number;
}

// Initialize model
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
      type: DataTypes.STRING(7), // e.g., "2025-10"
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

export default WaterReading;