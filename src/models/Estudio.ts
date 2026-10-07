import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

class Estudio extends Model {
    declare id: number
    declare pacienteId: number
    declare tipo: string
    declare fecha: Date
    declare descripcion: string
    declare archivoUrl: string
    declare createdAt: Date
    declare updatedAt: Date
}

Estudio.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        pacienteId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'pacientes',
                key: 'id',
            },
        },

        tipo: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        archivoUrl: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'estudios',
        timestamps: true,
    },
)

export default Estudio
