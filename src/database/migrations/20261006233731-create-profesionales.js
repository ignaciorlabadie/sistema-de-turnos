'use strict'

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('profesionales', {
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
            onDelete: 'RESTRICT',
        },
        nombre: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        apellido: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        dni: {
            type: Sequelize.STRING(10),
            allowNull: false,
            unique: true,
        },
        telefono: {
            type: Sequelize.STRING(25),
            allowNull: false,
        },

        matricula: {
            type: Sequelize.STRING(30),
            allowNull: false,
            unique: true,
        },

        especialidad: {
            type: Sequelize.STRING(100),
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
    await queryInterface.dropTable('profesionales')
}
