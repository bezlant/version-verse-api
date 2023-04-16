import { AUTH_ERROR } from '@/constants'
import prisma from '@/db'
import { comparePasswords } from '@/modules/auth'
import app from '@/server'
import { type User } from '@prisma/client'
import supertest from 'supertest'

describe('user handler', () => {
  let user: User | null

  const username = 'testuser'
  const password = 'testpassword'

  afterAll(async () => {
    if (user !== null) await prisma.user.deleteMany({ where: { id: user.id } })
  })

  test('should create a new user and return a token', async () => {
    const response = await supertest(app)
      .post('/signup')
      .send({ username, password })

    expect(response.status).toBe(200)
    expect(response.body.token).toBeDefined()

    user = await prisma.user.findUnique({
      where: { username },
    })

    const isValid = await comparePasswords(password, user?.password ?? '')

    expect(user).toBeDefined()
    expect(isValid).toBeTruthy()
    expect(user?.username).toBe(username)
  })

  test('should return an error if username or password is missing', async () => {
    const response = await supertest(app)
      .post('/signup')
      .send({ username: '', password: '' })

    expect(response.status).toBe(401)
    expect(response.body.message).toBe(AUTH_ERROR.MISSING_USERNAME_PASSWORD)
  })

  test('returns 401 if username or password are missing', async () => {
    const response = await supertest(app).post('/signin').send({})

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      message: AUTH_ERROR.MISSING_USERNAME_PASSWORD,
    })
  })

  test('returns 404 if user is not found', async () => {
    const response = await supertest(app)
      .post('/signin')
      .send({ username: 'nonexistentuser', password: 'password' })

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({ message: AUTH_ERROR.USER_NOT_FOUND })
  })

  test('returns 401 if password is incorrect', async () => {
    const response = await supertest(app)
      .post('/signin')
      .send({ username, password: 'incorrectpassword' })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({ message: AUTH_ERROR.INVALID_PASSWORD })
  })

  test('returns a JWT token if username and password are correct', async () => {
    const response = await supertest(app)
      .post('/signin')
      .send({ username, password })

    expect(response.statusCode).toBe(200)
    expect(response.body.token).toBeTruthy()
  })
})
