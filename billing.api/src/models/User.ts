import { Model, InferAttributes, InferCreationAttributes, DataTypes, CreationOptional, Sequelize } from "sequelize";

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare Id: CreationOptional<string>;
    declare Username: string;
    declare Email: string;
    declare PasswordHash: string;
    declare CreatedAt: CreationOptional<Date>;
    declare UpdatedAt: CreationOptional<Date>;
    declare Role: number;
}

// Factory function to initialize the model
export function initUser(sequelize: Sequelize) {
    User.init(
        {
            Id: {
                type: DataTypes.CHAR(36),
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
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
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize, // ✅ use the passed Sequelize instance
            tableName: 'users',
            timestamps: false, // manually defined timestamps
        }
    );

    return User;
}
