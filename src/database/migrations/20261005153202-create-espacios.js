'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('espacios', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    nombre: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tipo: {
      type: Sequelize.ENUM('GIMNASIO', 'CONSULTORIO'),
      allowNull: false
    },
    ubicacion: {
      type: Sequelize.ENUM('ADELANTE', 'ATRAS'),
      allowNull: false
    },
    activo: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    }
  });
}
export async function down(queryInterface) {
  await queryInterface.dropTable('espacios');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_espacios_tipo";');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_espacios_ubicacion";');
}
