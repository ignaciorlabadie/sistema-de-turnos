'use strict'

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('estudios', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },

        pacienteId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'pacientes',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        },

        tipo: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },

        fecha: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },

        descripcion: {
            type: Sequelize.TEXT,
            allowNull: true,
        },

        archivoUrl: {
            type: Sequelize.TEXT,
            allowNull: true,
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

    await queryInterface.sequelize.query(`
        ALTER TABLE "estudios"
        ADD CONSTRAINT "check_estudios_tipo_no_vacio"
        CHECK (length(trim("tipo")) > 0);
    `)
}

export async function down(queryInterface) {
    await queryInterface.dropTable('estudios')
}
