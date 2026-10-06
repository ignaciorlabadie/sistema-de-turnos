import { Model, DataTypes } from "sequelize";
import sequelize from '../config/database.js'

class Estudio extends Model {
    public id!: number;
    public paciente_id!: number;
    public tipo!: string;
    public fecha!: Date;
    public descripcion?: string;
    public archivo_url?: string;
}

Estudio.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        paciente_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "paciente",
                key: "id"
            }
        },

        tipo: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },

        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        archivo_url: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: "estudio",
        timestamps: false
    }
);

export default Estudio;
