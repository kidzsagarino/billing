import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, HasManyGetAssociationsMixin } from 'sequelize';
import { sequelize } from '../config/db';

export class Unit extends Model<InferAttributes<Unit>, InferCreationAttributes<Unit>> {
  declare Id: string;
  declare UnitNumber: string;
  declare FloorNumber: number | null;
  declare BuildingId: string;
  declare UnitType: string | null;
  declare Area: number | null;
  declare CreatedAt: CreationOptional<Date>;
}

Unit.init(
  {
    Id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      allowNull: false,
    },
    UnitNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    FloorNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    BuildingId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
    },
    UnitType: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    Area: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'units',
    timestamps: false, // because CreatedAt is manually defined
  }
);
