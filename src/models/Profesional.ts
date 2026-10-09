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
            allowNull: false,
        },

        usuarioId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'users',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        },

        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 100],
            },
        },

        apellido: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 100],
            },
        },

        dni: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true,
        },

        telefono: {
            type: DataTypes.STRING(25),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [6, 25],
            },
        },

        matricula: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                len: [1, 30],
            },
        },

        especialidad: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 100],
            },
        },
    },
    {
        sequelize,
        tableName: 'profesionales',
        timestamps: true,
    },
)

export default Profesional
