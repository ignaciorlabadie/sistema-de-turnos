import { describe, expect, it } from 'vitest'

import { validarId } from '../../src/utils/validarId.js'
import { AppError } from '../../src/errors/AppError.js'

describe('validarId', () => {
    it('devuelve el número cuando el valor es un entero positivo', () => {
        expect(validarId('5')).toBe(5)
        expect(validarId(5)).toBe(5)
    })

    it('usa "ID" como nombre de campo por defecto', () => {
        expect(() => validarId('abc')).toThrowError(
            'El ID debe ser un número entero positivo',
        )
    })

    it('usa el nombre de campo indicado en el mensaje', () => {
        expect(() => validarId(0, 'ID del turno')).toThrowError(
            'El ID del turno debe ser un número entero positivo',
        )
    })

    it('rechaza valores inválidos con un AppError 400', () => {
        for (const valor of ['abc', undefined, 0, -1, 1.5]) {
            expect(() => validarId(valor)).toThrowError(AppError)

            try {
                validarId(valor)
            } catch (error) {
                expect(error).toMatchObject({ statusCode: 400 })
            }
        }
    })
})
