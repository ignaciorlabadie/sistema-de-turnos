import { DataTypes, Model } from 'sequelize'

import type { DatosPersona } from '../types/DatosPersona.js'

import sequelize from '../config/database.js'

class Profesional extends Model implements DatosPersona {
    declare id: number
    declare usuarioId: number

    declare nombre: string
    declare apellido: string
    declare dni: string
    declare telefono: string

    declare matricula: string
    declare especialidad: string

    declare createdAt: Date
    declare updatedAt: Date
}

Profesional.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        usuarioId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'users',
                key: 'id',
            },
        },

        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        apellido: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        dni: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        telefono: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        matricula: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        especialidad: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'profesionales',
        timestamps: true,
    },
)

export default Profesional
