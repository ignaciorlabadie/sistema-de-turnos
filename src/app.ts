import 'dotenv/config'
import cors from 'cors'
import express from 'express'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
})

app.listen(PORT, () => {
    console.log(`Servidor del sistema de turnos corriendo en puerto ${PORT}`)
})

export const mensaje: string = 'Sistema de turnos'

console.log(mensaje)
