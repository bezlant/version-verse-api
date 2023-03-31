import express, { type ErrorRequestHandler } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import swaggerFile from 'swagger.json'
import router from './router'
import { protect } from './modules/auth'
import { createNewUser, signIn } from './handlers/user'
import { ERROR } from './constants'

const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerFile, {
    explorer: true,
    swaggerOptions: { persistAuthorization: true },
  })
)

app.use('/api', protect, router)

app.post('/signup', createNewUser)
app.post('/signin', signIn)

// TODO: Testing all endpoints
// TODO: Deploy on render

app.use(((err, _, res) => {
  if (err.cause === ERROR.AUTH)
    res.status(401).json({ message: 'Unauthorized access' })
  else if (err.cause === ERROR.INPUT)
    res.status(400).json({ message: 'Invalid input' })
  else res.status(500).json({ message: 'Server error' })
}) as ErrorRequestHandler)

// not a Graceful shutdown
process.on('SIGINT', () => process.exit())
process.on('SIGTERM', () => process.exit())

export default app
