import { Request, Response } from 'express'
import { obtenerOcupacion } from '../services/espacioService.js'

export const getOcupacionAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { start, end } = req.query

        if (!start || !end) {
            res.status(400).json({ error: 'Faltan los parámetros start y end (ej: ?start=2026-10-05&end=2026-10-11)' })
            return
        }

        const espacios = await obtenerOcupacion(start as string, end as string)
        
        res.json({ data: espacios })
    } catch (error) {
        console.error('Error al obtener la ocupación de los espacios:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}