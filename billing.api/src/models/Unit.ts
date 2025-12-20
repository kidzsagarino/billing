import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize } from 'sequelize';

export class Unit extends Model<InferAttributes<Unit>, InferCreationAttributes<Unit>> {
  declare Id: CreationOptional<string>;
  declare UnitNumber: string;
  declare FloorNumber: number | null;
  declare BuildingId: string;
  declare UnitType: string | null;
  declare Area: number | null;
  declare CreatedAt: CreationOptional<Date>;
}

// Factory function to initialize the model
export function initUnit(sequelize: Sequelize) {
  Unit.init(
    {
      Id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
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
      sequelize, // ✅ use the passed Sequelize instance
      tableName: 'units',
      timestamps: false, // Because CreatedAt is manually defined
    }
  );

  return Unit;
}
