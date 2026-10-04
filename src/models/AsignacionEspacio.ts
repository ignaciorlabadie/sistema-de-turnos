import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class AsignacionEspacio extends Model {
    declare id: number
    
    declare espacioId: number
    declare profesionalId: number

    declare tipo: 'FIJA' | 'ESPECIFICA'
    // fija son las horas designadas que tiene un profesional. Sería su MODULO
    // Especifica se usa cuando un profesional agrega una o varias horas para uno o varios dias en concreto.
    // Las dos se deben contar de igual forma para el valor del alquiler de c/u
    declare diaSemana: number | null
    declare fecha: Date | null
    
    declare horaInicio: string
    declare horaFin: string

    declare createdAt: Date
    declare updatedAt: Date
}

AsignacionEspacio.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        espacioId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        profesionalId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tipo: {
            type: DataTypes.ENUM('FIJA', 'ESPECIFICA'),
            allowNull: false,
        },
        diaSemana: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 0, // 0 = Domingo
                max: 6, // 6 = Sábado
            }
        },
        fecha: {
            type: DataTypes.DATEONLY, // DATEONLY guarda solo YYYY-MM-DD (sin hora)
            allowNull: true,
        },
        horaInicio: {
            type: DataTypes.TIME, // Guarda HH:mm:ss
            allowNull: false,
        },
        horaFin: {
            type: DataTypes.TIME,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'asignaciones_espacios',
        timestamps: true,
        validate: {
            // Esta validación asegura la coherencia de los datos antes de guardar
            validarTipoAsignacion() {
                if (this.tipo === 'FIJA' && this.diaSemana === null) {
                    throw new Error('Las asignaciones FIJAS deben tener un día de la semana asignado.')
                }
                if (this.tipo === 'ESPECIFICA' && this.fecha === null) {
                    throw new Error('Las asignaciones ESPECIFICAS deben tener una fecha exacta asignada.')
                }
            }
        }
    },
)

export default AsignacionEspacio