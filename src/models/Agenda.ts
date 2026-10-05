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
        },

        profesionalId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'profesionales',
                key: 'id',
            },
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
