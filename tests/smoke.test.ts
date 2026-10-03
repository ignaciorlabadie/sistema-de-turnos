import { describe, expect, it } from 'vitest'

import app from '../src/app.js'

describe('app', () => {
    it('exporta una app de Express', () => {
        expect(typeof app).toBe('function')
    })
})
