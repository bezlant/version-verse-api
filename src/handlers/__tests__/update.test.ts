import prisma from '@/db'
import app from '@/server'
import { type Update } from '@prisma/client'
import request from 'supertest'
import { createProduct, createUser, getJwt } from './utils'

describe('/api/update tests', () => {
  const user1 = { username: '1updatetest1', password: '1updatetestpassword1' }
  const user2 = { username: '2updatetest2', password: '2updatetestpassword2' }
  const productName = 'New fancy product'
  const updateTitle = 'New update'
  const updateBody = 'This is a wonderful update'

  beforeAll(async () => {
    await createUser(user1.username, user1.password)
    await createUser(user2.username, user2.password)
  })

  afterEach(async () => {
    await prisma.update.deleteMany({})
    await prisma.product.deleteMany({})
  })

  afterAll(async () => {
    await prisma.user.deleteMany({})
  })

  test('should create a new update', async () => {
    const jwt: string = await getJwt(user1)
    const [product] = await createProduct({ name: productName }, jwt)

    const [update, status] = await createUpdate(
      {
        title: updateTitle,
        body: updateBody,
        productId: product.id,
      },
      jwt
    )

    expect(status).toBe(200)
    expect(update.title).toBe(updateTitle)
    expect(update.body).toBe(updateBody)
  })
})

const createUpdate = async (
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
