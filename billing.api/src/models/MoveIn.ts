import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize } from 'sequelize';

export class MoveIn extends Model<InferAttributes<MoveIn>, InferCreationAttributes<MoveIn>> {
  declare Id: CreationOptional<string>;
  declare FullName: string;
  declare Email: string;
  declare Mobile: string;
  declare UnitId: string | null;
  declare MoveInDate: Date;
  declare MoveOutDate: Date | null;
  declare Status: string;
  declare CreatedAt: CreationOptional<Date>;
  declare UpdatedAt: CreationOptional<Date>;
}

// Factory function to initialize the model with a Sequelize instance
export function initMoveIn(sequelize: Sequelize) {
  MoveIn.init(
    {
      Id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      FullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Mobile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      UnitId: {
        type: DataTypes.CHAR(36),
        allowNull: true,
      },
      MoveInDate: {
        type: DataTypes.DATE,
        allowNull: false,
        get() {
          const raw = this.getDataValue('MoveInDate');
          return raw ? raw.toISOString().slice(0, 10) : null;
        }
      },
      MoveOutDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      Status: {
        type: DataTypes.STRING,
        defaultValue: 'Active',
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
      tableName: 'moveins',
      timestamps: false,
    }
  );

  return MoveIn;
}
