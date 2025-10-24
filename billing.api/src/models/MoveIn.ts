import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, HasManyGetAssociationsMixin } from 'sequelize';

import { sequelize } from '../config/db';
import { Billing } from './Billing';

export class MoveIn extends Model<
  InferAttributes<MoveIn>,
  InferCreationAttributes<MoveIn>
> {
  declare Id: string;
  declare FullName: string;
  declare Email: string;
  declare Mobile: string;
  declare UnitId: string | null;
  declare MoveInDate: Date;
  declare MoveOutDate: Date | null;
  declare Status: string;
  declare CreatedAt: Date;
  declare UpdatedAt: Date;

}

MoveIn.init(
  {
    Id: { type: DataTypes.CHAR(36), primaryKey: true },
    FullName: DataTypes.STRING,
    Email: DataTypes.STRING,
    Mobile: DataTypes.STRING,
    UnitId: DataTypes.STRING,
    MoveInDate: DataTypes.DATE,
    MoveOutDate: DataTypes.DATE,
    Status: DataTypes.STRING,
    CreatedAt: DataTypes.DATE,
    UpdatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'moveins' }
);