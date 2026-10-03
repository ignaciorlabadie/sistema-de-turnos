import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import sequelize from './config/database.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', async (_req, res) => {
    try {
        await sequelize.authenticate()
        res.json({
            status: 'ok',
            db: 'connected',
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error(error)
        res.status(503).json({
            status: 'error',
            db: 'disconnected',
        })
    }
})

export default app
