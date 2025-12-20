import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize } from 'sequelize';

export class Building extends Model<InferAttributes<Building>, InferCreationAttributes<Building>> {
  declare id: CreationOptional<string>;
  declare BuildingName: string;
  declare BuildingNumber: string;
  declare Floors: number;
  declare Address: string;
  declare CreatedAt: CreationOptional<Date>;
}

// Use a factory function to initialize the model with a Sequelize instance
export function initBuilding(sequelize: Sequelize) {
  Building.init(
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        field: 'id',
      },
      BuildingName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'BuildingName',
      },
      BuildingNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'BuildingNumber',
      },
      Floors: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Floors',
      },
      Address: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'Address',
      },
      CreatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'CreatedAt',
      },
    },
    {
      tableName: 'buildings',
      timestamps: false,
      sequelize, // ✅ Use the passed Sequelize instance
    }
  );

  return Building;
}
