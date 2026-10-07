import Usuario from './Usuario.js'
import Paciente from './Paciente.js'
import Profesional from './Profesional.js'
import Espacio from './Espacio.js'
import AsignacionEspacio from './AsignacionEspacio.js'

// --- Relaciones de perfiles (1 a 1) ---
Usuario.hasOne(Paciente, { foreignKey: 'usuarioId', as : 'paciente' })
Paciente.belongsTo(Usuario, { foreignKey: 'usuarioId', as : 'usuario' })

Usuario.hasOne(Profesional, { foreignKey: 'usuarioId', as: 'profesional' })
Profesional.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' })

// --- Relaciones de ocupacion de Espacios (1 a N) ---
// Un espacio tiene muchas asignaciones de horarios
Espacio.hasMany(AsignacionEspacio, { foreignKey: 'espacioId', as: 'asignaciones' })
AsignacionEspacio.belongsTo(Espacio, { foreignKey: 'espacioId', as: 'espacio' })

// Un profesional tiene muchas asignaciones de espacios
Profesional.hasMany(AsignacionEspacio, { foreignKey: 'profesionalId', as: 'asignacionesEspacios' })
AsignacionEspacio.belongsTo(Profesional, { foreignKey: 'profesionalId', as: 'profesional' })

export {
    Usuario,
    Paciente,
    Profesional,
    Espacio,
    AsignacionEspacio
}