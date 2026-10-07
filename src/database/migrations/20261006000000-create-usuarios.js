'use strict'

/** @type {import('sequelize-cli').Migration} */

export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },

        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },

        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },

        rol: {
            type: Sequelize.ENUM('PACIENTE', 'PROFESIONAL', 'ADMIN'),
            allowNull: false,
        },

        activo: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
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
    await queryInterface.dropTable('users')

    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_users_rol";',
    )
}
