import bcrypt from 'bcryptjs'

import { Profesional, Usuario } from '../models/index.js'
import sequelize from '../config/database.js'

import { AppError } from '../errors/AppError.js'

import type { CrearProfesional } from '../types/CrearProfesional.js'
import type { ActualizarProfesional } from '../types/ActualizarProfesional.js'

const atributosUsuario = {
    attributes: { exclude: ['password'] },
}

export async function listarProfesionales(): Promise<Profesional[]> {
    return Profesional.findAll({
        include: [
            {
                model: Usuario,
                as: 'usuario',
                ...atributosUsuario,
            },
        ],
        order: [['id', 'ASC']],
    })
}

export async function buscarProfesionalPorId(
    id: number,
): Promise<Profesional | null> {
    return Profesional.findByPk(id, {
        include: [
            {
                model: Usuario,
                as: 'usuario',
                ...atributosUsuario,
            },
        ],
    })
}

export async function buscarProfesionalPorUsuarioId(
    usuarioId: number,
): Promise<Profesional | null> {
    return Profesional.findOne({
        where: { usuarioId },
        include: [
            {
                model: Usuario,
                as: 'usuario',
                ...atributosUsuario,
            },
        ],
    })
}

export async function crearProfesional(
    datos: CrearProfesional,
): Promise<Profesional | null> {
    const email = datos.email.trim().toLowerCase()

    const usuarioExistente = await Usuario.findOne({
        where: { email },
    })

    if (usuarioExistente) {
        throw new AppError(409, 'El email ya está registrado')
    }

    const profesionalConDni = await Profesional.findOne({
        where: { dni: datos.dni },
    })

    if (profesionalConDni) {
        throw new AppError(409, 'El DNI ya se encuentra registrado')
    }

    const profesionalConMatricula = await Profesional.findOne({
        where: { matricula: datos.matricula },
    })

    if (profesionalConMatricula) {
        throw new AppError(409, 'La matrícula ya existe')
    }

    const passwordHasheada = await bcrypt.hash(datos.password, 10)

    const profesional = await sequelize.transaction(async (transaction) => {
        const usuario = await Usuario.create(
            {
                email,
                password: passwordHasheada,
                rol: 'PROFESIONAL',
            },
            { transaction },
        )

        return Profesional.create(
            {
                usuarioId: usuario.id,
                nombre: datos.nombre,
                apellido: datos.apellido,
                dni: datos.dni,
                telefono: datos.telefono,
                matricula: datos.matricula,
                especialidad: datos.especialidad,
            },
            { transaction },
        )
    })

    return Profesional.findByPk(profesional.id, {
        include: [
            {
                model: Usuario,
                as: 'usuario',
                ...atributosUsuario,
            },
        ],
    })
}

export async function actualizarProfesional(
    id: number,
    datos: ActualizarProfesional,
): Promise<Profesional | null> {
    const profesional = await Profesional.findByPk(id)

    if (!profesional) {
        throw new AppError(404, 'Profesional no encontrado')
    }

    if ('usuarioId' in datos) {
        throw new AppError(400, 'El usuarioId no puede ser modificado')
    }

    if (datos.dni !== undefined && datos.dni !== profesional.dni) {
        const profesionalConDni = await Profesional.findOne({
            where: { dni: datos.dni },
        })

        if (profesionalConDni && profesionalConDni.id !== id) {
            throw new AppError(409, 'El DNI ya se encuentra registrado')
        }

        profesional.dni = datos.dni
    }

    if (
        datos.matricula !== undefined &&
        datos.matricula !== profesional.matricula
    ) {
        const profesionalConMatricula = await Profesional.findOne({
            where: { matricula: datos.matricula },
        })

        if (profesionalConMatricula && profesionalConMatricula.id !== id) {
            throw new AppError(409, 'La matrícula ya existe')
        }

        profesional.matricula = datos.matricula
    }

    if (datos.nombre !== undefined) {
        profesional.nombre = datos.nombre
    }

    if (datos.apellido !== undefined) {
        profesional.apellido = datos.apellido
    }

    if (datos.telefono !== undefined) {
        profesional.telefono = datos.telefono
    }

    if (datos.especialidad !== undefined) {
        profesional.especialidad = datos.especialidad
    }

    await profesional.save()

    return Profesional.findByPk(id, {
        include: [
            {
                model: Usuario,
                as: 'usuario',
                ...atributosUsuario,
            },
        ],
    })
}
