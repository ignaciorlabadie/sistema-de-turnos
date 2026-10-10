'use strict'

/** @type {import('sequelize-cli').Migration} */

export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('agendas', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
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

        diaSemana: {
            type: Sequelize.ENUM(
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
            type: Sequelize.TIME,
            allowNull: false,
        },

        horaFin: {
            type: Sequelize.TIME,
            allowNull: false,
        },

        duracionTurno: {
            type: Sequelize.INTEGER,
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

    await queryInterface.addConstraint('agendas', {
        fields: ['duracionTurno'],
        type: 'check',
        name: 'check_agendas_duracion_positiva',
        where: {
            duracionTurno: {
                [Sequelize.Op.gt]: 0,
            },
        },
    })

    await queryInterface.sequelize.query(`
        ALTER TABLE "agendas"
        ADD CONSTRAINT "check_agendas_horario"
        CHECK ("horaFin" > "horaInicio");
    `)
}

export async function down(queryInterface) {
    await queryInterface.dropTable('agendas')

    await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS "enum_agendas_diaSemana";
    `)
}
