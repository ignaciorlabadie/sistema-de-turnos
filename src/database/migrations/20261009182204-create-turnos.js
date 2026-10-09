'use strict'

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('turnos', {
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

        profesionalId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'profesionales',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        },

        agendaId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'agendas',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        },

        fecha: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },

        hora: {
            type: Sequelize.TIME,
            allowNull: false,
        },

        estado: {
            type: Sequelize.ENUM(
                'PENDIENTE',
                'CONFIRMADO',
                'CANCELADO',
                'ATENDIDO',
            ),
            allowNull: false,
            defaultValue: 'PENDIENTE',
        },

        motivo: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },

        observaciones: {
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
        ALTER TABLE "turnos"
        ADD CONSTRAINT "check_turnos_motivo_no_vacio"
        CHECK (length(trim("motivo")) > 0);
    `)
}

export async function down(queryInterface) {
    await queryInterface.dropTable('turnos')

    await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS "enum_turnos_estado";
    `)
}
