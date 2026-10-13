import { Profesional, Usuario } from '../models/index.js'

import { AppError } from '../errors/AppError.js'

export interface CrearProfesionalDTO {
    usuarioId: number

    nombre: string
    apellido: string
    dni: string
    telefono: string

    matricula: string
    especialidad: string
}

export interface ActualizarProfesionalDTO {
    nombre?: string
    apellido?: string
    dni?: string
    telefono?: string
    matricula?: string
    especialidad?: string
}

const atributosUsuario = {
    attributes: { exclude: ['password'] },
}

export class ProfesionalService {
    async listar(): Promise<Profesional[]> {
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

    async buscarPorId(id: string | number): Promise<Profesional | null> {
        const idNumerico = this.normalizarId(id)

        if (idNumerico === null) {
            return null
        }

        return Profesional.findByPk(idNumerico, {
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    ...atributosUsuario,
                },
            ],
        })
    }

    async buscarPorUsuarioId(
        usuarioId: string | number,
    ): Promise<Profesional | null> {
        const idNumerico = this.normalizarId(usuarioId)

        if (idNumerico === null) {
            return null
        }

        return Profesional.findOne({
            where: { usuarioId: idNumerico },
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    ...atributosUsuario,
                },
            ],
        })
    }

    async crear(datos: CrearProfesionalDTO): Promise<Profesional | null> {
        const usuario = await Usuario.findByPk(datos.usuarioId)

        if (!usuario) {
            throw new AppError(404, 'Usuario no encontrado')
        }

        if (usuario.rol !== 'PROFESIONAL') {
            throw new AppError(400, 'El usuario no posee el rol PROFESIONAL')
        }

        const perfilExistente = await Profesional.findOne({
            where: { usuarioId: datos.usuarioId },
        })

        if (perfilExistente) {
            throw new AppError(
                409,
                'El usuario ya tiene un perfil profesional asignado',
            )
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

        const profesional = await Profesional.create({
            usuarioId: datos.usuarioId,
            nombre: datos.nombre,
            apellido: datos.apellido,
            dni: datos.dni,
            telefono: datos.telefono,
            matricula: datos.matricula,
            especialidad: datos.especialidad,
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

    async actualizar(
        id: string | number,
        datos: ActualizarProfesionalDTO,
    ): Promise<Profesional | null> {
        const idNumerico = this.normalizarId(id)

        if (idNumerico === null) {
            throw new AppError(404, 'Profesional no encontrado')
        }

        const profesional = await Profesional.findByPk(idNumerico)

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

            if (profesionalConDni && profesionalConDni.id !== idNumerico) {
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

            if (
                profesionalConMatricula &&
                profesionalConMatricula.id !== idNumerico
            ) {
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

        return Profesional.findByPk(idNumerico, {
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                    ...atributosUsuario,
                },
            ],
        })
    }

    private normalizarId(valor: string | number): number | null {
        const numero = typeof valor === 'number' ? valor : Number(valor)

        return Number.isInteger(numero) && numero > 0 ? numero : null
    }
}

export const profesionalService = new ProfesionalService()
