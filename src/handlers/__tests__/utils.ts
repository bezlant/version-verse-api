import app from '@/server'
import { type Update, type Product } from '@prisma/client'
import request from 'supertest'

export const createUser = async (username: string, password: string) => {
  await request(app).post('/signup').send({ username, password })
}

export const getJwt = async (user: { username: string; password: string }) => {
  const { username, password } = user
  const signinResponse = await request(app)
    .post('/signin')
    .send({ username, password })

  const jwt: string = signinResponse.body.token
  return jwt
}

export const createProduct = async (
  product: { name?: string },
  jwt?: string
): Promise<[Product, number]> => {
  const response = await request(app)
    .post('/api/product')
    .set('Authorization', `Bearer ${jwt ?? ''}`)
    .send(product)

  const createdProduct: Product = response.body.data
  const { status } = response

  return [createdProduct, status]
}

export const createUpdate = async (
  update: { title: string; body: string; productId: string },
  jwt?: string
): Promise<[Update, number]> => {
  const response = await request(app)
    .post('/api/update')
    .set('Authorization', `Bearer ${jwt ?? ''}`)
    .send(update)

  const createdUpdate: Update = response.body.data
  const { status } = response

  return [createdUpdate, status]
}
