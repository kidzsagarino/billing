import { Model, InferAttributes, InferCreationAttributes, DataTypes } from "sequelize";
import { sequelize } from '../config/db';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    // User model attributes would go here
    declare Id: string;
    declare Username: string;
    declare Email: string;
    declare PasswordHash: string;
    declare CreatedAt: Date;
    declare UpdatedAt: Date;
    declare Role: number;
}

User.init(
    {
        Id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
            allowNull: false,
        },
        Username: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        Email: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        PasswordHash: { 
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        CreatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        UpdatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        Role: {
            type: DataTypes.NUMBER,
            allowNull: false,
        }
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: false, // because CreatedAt and UpdatedAt are manually defined
    }
);
