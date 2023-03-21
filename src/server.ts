import express, { type ErrorRequestHandler } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import router from './router'
import { protect } from './modules/auth'
import { createNewUser, signIn } from './handlers/user'

const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', protect, router)

app.post('/user', createNewUser)
app.post('/signin', signIn)

app.use(((err, req, res, next) => {
  if (err.name === 'auth')
    res.status(401).json({ message: 'Unauthorized access' })
  else if (err.name === 'input')
    res.status(400).json({ message: 'Invalid input' })
  else res.status(500).json({ message: 'Server error' })
}) as ErrorRequestHandler)

process.on('SIGINT', () => process.exit())
process.on('SIGTERM', () => process.exit())

export default app
