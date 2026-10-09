'use strict'

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('espacios', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        nombre: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        tipo: {
            type: Sequelize.ENUM('GIMNASIO', 'CONSULTORIO'),
            allowNull: false,
        },
        ubicacion: {
            type: Sequelize.ENUM('ADELANTE', 'ATRAS'),
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
    await queryInterface.sequelize.query(`
        ALTER TABLE "espacios"
        ADD CONSTRAINT "check_espacios_nombre_no_vacio"
        CHECK (length(trim("nombre")) > 0);
    `)
}
export async function down(queryInterface) {
    await queryInterface.dropTable('espacios')
    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_espacios_tipo";',
    )
    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_espacios_ubicacion";',
    )
}
