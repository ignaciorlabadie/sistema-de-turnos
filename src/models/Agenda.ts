import { DataTypes, Model } from 'sequelize'
import type { DiaSemana } from '../types/DiaSemana.js'
import sequelize from '../config/database.js'

class Agenda extends Model {
    declare id: number
    declare profesionalId: number
    declare diaSemana: DiaSemana
    declare horaInicio: string
    declare horaFin: string
    declare duracionTurno: number
    declare activo: boolean
    declare createdAt: Date
    declare updatedAt: Date
}

Agenda.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
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

        diaSemana: {
            type: DataTypes.ENUM(
                'LUNES',
                'MARTES',
                'MIERCOLES',
                'JUEVES',
                'VIERNES',
                'SABADO',
                'DOMINGO',
            ),
            allowNull: false,
        },

        horaInicio: {
            type: DataTypes.TIME,
            allowNull: false,
        },

        horaFin: {
            type: DataTypes.TIME,
            allowNull: false,
        },

        duracionTurno: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isInt: true,
                min: 1,
            },
        },

        activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'agendas',
        timestamps: true,
    },
)

export default Agenda
