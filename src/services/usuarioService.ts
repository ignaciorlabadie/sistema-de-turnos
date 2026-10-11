import Usuario from '../models/Usuario.js'
import bcrypt from 'bcryptjs'
import type { CrearUsuario } from '../types/CrearUsuario.js'
import type { ActualizarUsuario } from '../types/ActualizarUsuario.js'
import { AppError } from '../errors/AppError.js'

export async function listarUsuarios() {
    return Usuario.findAll({
        attributes: { exclude: ['password'] },
    })
}

export async function buscarUsuarioPorId(id: number) {
    return Usuario.findByPk(id, {
        attributes: { exclude: ['password'] },
    })
}

export async function buscarUsuarioPorEmail(email: string) {
    const usuarioMail = email.trim().toLowerCase()

    return Usuario.findOne({
        where: { email: usuarioMail },
        attributes: { exclude: ['password'] },
    })
}

export async function crearUsuario(datos: CrearUsuario) {
    const email = datos.email.trim().toLowerCase()

    const usuarioExistente = await Usuario.findOne({
        where: { email },
    })

    if (usuarioExistente) {
        throw new AppError(409, 'El email ya está registrado')
    }

    const passwordHasheada = await bcrypt.hash(datos.password, 10)

    const usuario = await Usuario.create({
        email,
        password: passwordHasheada,
        rol: datos.rol,
    })

    return {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        activo: usuario.activo,
    }
}

export async function actualizarUsuario(id: number, datos: ActualizarUsuario) {
    const usuario = await Usuario.findByPk(id)

    if (!usuario) {
        throw new AppError(404, 'Usuario no encontrado')
    }

    if (datos.email !== undefined) {
        const email = datos.email.trim().toLowerCase()

        const usuarioExistente = await Usuario.findOne({
            where: { email },
        })

        if (usuarioExistente && usuarioExistente.id !== id) {
            throw new AppError(409, 'El email ya está registrado')
        }

        usuario.email = email
    }

    if (datos.activo !== undefined) {
        usuario.activo = datos.activo
    }

    if (datos.password !== undefined) {
        usuario.password = await bcrypt.hash(datos.password, 10)
    }

    await usuario.save()

    return Usuario.findByPk(id, {
        attributes: { exclude: ['password'] },
    })
}

export async function desactivarUsuario(id: number) {
    // El usuario no se elimina, cambia el campo 'activo' a false.
    const usuario = await Usuario.findByPk(id)

    if (!usuario) {
        throw new AppError(404, 'Usuario no encontrado')
    }

    if (!usuario.activo) {
        throw new AppError(409, 'El usuario ya está desactivado')
    }

    usuario.activo = false

    await usuario.save()

    return Usuario.findByPk(id, {
        attributes: { exclude: ['password'] },
    })
}

export async function reactivarUsuario(id: number) {
    const usuario = await Usuario.findByPk(id)

    if (!usuario) {
        throw new AppError(404, 'Usuario no encontrado')
    }

    if (usuario.activo) {
        throw new AppError(409, 'El usuario ya está activo')
    }

    usuario.activo = true

    await usuario.save()

    return Usuario.findByPk(id, {
        attributes: { exclude: ['password'] },
    })
}
