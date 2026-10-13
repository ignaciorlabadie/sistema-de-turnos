const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DNI_REGEX = /^\d{7,8}$/
const TELEFONO_REGEX = /^\+?\d{6,25}$/
const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/

export function esEmailValido(email: string): boolean {
    return EMAIL_REGEX.test(email)
}

export function esPasswordValida(password: string): boolean {
    return password.length >= 8
}

export function esDniValido(dni: string): boolean {
    return DNI_REGEX.test(dni)
}

export function esTelefonoValido(telefono: string): boolean {
    return TELEFONO_REGEX.test(telefono)
}

export function esFechaNacimientoValida(fecha: string): boolean {
    if (!FECHA_REGEX.test(fecha)) {
        return false
    }

    const fechaParseada = new Date(`${fecha}T00:00:00Z`)

    if (Number.isNaN(fechaParseada.getTime())) {
        return false
    }

    if (fechaParseada.toISOString().slice(0, 10) !== fecha) {
        return false
    }

    return fecha <= new Date().toISOString().slice(0, 10)
}
