import { DataTypes, Model } from 'sequelize'
import type { EstadoAutorizacionEstudio } from '../types/EstadoAutorizacionEstudio.js'
import sequelize from '../config/database.js'

class AutorizacionEstudio extends Model {
    declare id: number
    declare estudioId: number
    declare profesionalId: number
    declare fechaAutorizacion: string
    declare fechaVencimiento: string
    declare estado: EstadoAutorizacionEstudio
    declare createdAt: Date
    declare updatedAt: Date
}

AutorizacionEstudio.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        estudioId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'estudios',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        },

        profesionalId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'profesionales',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        },

        fechaAutorizacion: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        fechaVencimiento: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        estado: {
            type: DataTypes.ENUM('DISPONIBLE', 'VENCIDO'),
            allowNull: false,
            defaultValue: 'DISPONIBLE',
        },
    },
    {
        sequelize,
        tableName: 'autorizaciones_estudios',
        timestamps: true,
    },
)

export default AutorizacionEstudio
