import { describe, expect, it } from 'vitest'

import { mensaje } from '../src/app.js'

describe('smoke', () => {
    it('resuelve el modulo de src con extension .js', () => {
        expect(mensaje).toBe('Sistema de turnos')
    })
})
