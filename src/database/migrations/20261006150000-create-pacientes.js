'use strict'

/** @type {import('sequelize-cli').Migration} */

export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('pacientes', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },

        usuarioId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'users',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },

        nombre: {
            type: Sequelize.STRING,
            allowNull: false,
        },

        apellido: {
            type: Sequelize.STRING,
            allowNull: false,
        },

        dni: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },

        telefono: {
            type: Sequelize.STRING,
            allowNull: false,
        },

        fechaNacimiento: {
            type: Sequelize.DATE,
            allowNull: false,
        },

        direccion: {
            type: Sequelize.STRING,
            allowNull: false,
        },

        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
        },

        updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
        },
    })
}

export async function down(queryInterface) {
    await queryInterface.dropTable('pacientes')
}
