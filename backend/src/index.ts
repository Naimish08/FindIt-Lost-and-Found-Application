import express from 'express'
import { createRouter } from './routes'

const app = express()
app.use(express.json())
app.use('/api', createRouter())

const port = process.env.PORT ? Number(process.env.PORT) : 4000
app.listen(port, () => {})

