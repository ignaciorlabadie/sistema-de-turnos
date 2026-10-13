import { Profesional, Usuario } from '../models/index.js'

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

    private normalizarId(valor: string | number): number | null {
        const numero = typeof valor === 'number' ? valor : Number(valor)

        return Number.isInteger(numero) && numero > 0 ? numero : null
    }
}

export const profesionalService = new ProfesionalService()
