import { DataTypes, Model } from 'sequelize'

import type { DatosPersona } from '../types/DatosPersona.js'

import sequelize from '../config/database.js'

class Paciente extends Model implements DatosPersona {
    declare id: number
    declare usuarioId: number

    declare nombre: string
    declare apellido: string
    declare dni: string
    declare telefono: string

    declare fechaNacimiento: Date
    declare direccion: string

    declare createdAt: Date
    declare updatedAt: Date
}

Paciente.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        usuarioId: {
            type: DataTypes.INTEGER,
            allowNull: false,
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

        fechaNacimiento: {
            type: DataTypes.DATE,
            allowNull: false,
        },

        direccion: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'pacientes',
        timestamps: true,
    },
)

export default Paciente
