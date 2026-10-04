import { DataTypes, Model } from 'sequelize'
import type { Rol } from '../types/Rol.js'
import sequelize from '../config/database.js'

class Usuario extends Model {
    declare id: number
    declare email: string
    declare password: string
    declare rol: Rol
    declare activo: boolean
    declare createdAt: Date
    declare updatedAt: Date
}
Usuario.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        rol: {
            type: DataTypes.ENUM('PACIENTE', 'PROFESIONAL', 'ADMIN'),
            allowNull: false,
        },
        activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
    },
)
export default Usuario
