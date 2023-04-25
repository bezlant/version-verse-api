import prisma from '@/db'
import app from '@/server'
import { type Update } from '@prisma/client'
import request from 'supertest'
import { createProduct, createUpdate, createUser, getJwt } from './utils'

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

  test('should get an update by id', async () => {
    const jwt: string = await getJwt(user1)
    const [product] = await createProduct({ name: productName }, jwt)

    const [update] = await createUpdate(
      {
        title: updateTitle,
        body: updateBody,
        productId: product.id,
      },
      jwt
    )

    const [gotUpdate, status] = await getUpdateById(update, jwt)

    expect(status).toBe(200)
    expect(gotUpdate.title).toBe(update.title)
    expect(gotUpdate.body).toBe(update.body)
  })

  test('should update an update by id', async () => {
    const jwt: string = await getJwt(user1)
    const [product] = await createProduct({ name: productName }, jwt)

    const [update] = await createUpdate(
      {
        title: updateTitle,
        body: updateBody,
        productId: product.id,
      },
      jwt
    )

    const newUpdate: Update = {
      ...update,
      title: 'Completely new update',
      status: 'DEPRECATED',
      body: 'Completely new body',
    }

    const [updatedUpdate, status] = await updateUpdateById(
      newUpdate,
      update,
      jwt
    )

    const [gotUpdate] = await getUpdateById(newUpdate, jwt)

    expect(updatedUpdate).not.toBeUndefined()

    expect(status).toBe(200)
    expect(gotUpdate.title).toBe(newUpdate.title)
    expect(gotUpdate.body).toBe(newUpdate.body)
  })

  test('should delete an update by id', async () => {
    const jwt: string = await getJwt(user1)
    const [product] = await createProduct({ name: productName }, jwt)

    const [update] = await createUpdate(
      {
        title: updateTitle,
        body: updateBody,
        productId: product.id,
      },
      jwt
    )

    const [deleted, status] = await deleteUpdateById(update.id, jwt)

    expect(deleted).toEqual(update)
    expect(status).toBe(200)

    const [gotUpdate] = await getUpdateById(update, jwt)

    expect(gotUpdate).toBeNull()
  })
})

const deleteUpdateById = async (
  updateId: string,
  jwt: string
): Promise<[Update, number]> => {
  const response = await request(app)
    .delete(`/api/update/${updateId}`)
    .set('Authorization', `Bearer ${jwt ?? ''}`)

  const deleted: Update = response.body.data
  const { status } = response

  return [deleted, status]
}

const updateUpdateById = async (
  newUpdate: Update,
  oldUpdate: Update,
  jwt: string
): Promise<[Update, number]> => {
  const response = await request(app)
    .put(`/api/update/${oldUpdate.id}`)
    .set('Authorization', `Bearer ${jwt ?? ''}`)
    .send(newUpdate)

  const updated: Update = response.body.data
  const { status } = response

  return [updated, status]
}

const getUpdateById = async (
  update: Update,
  jwt?: string
): Promise<[Update, number]> => {
  const response = await request(app)
    .get(`/api/update/${update.id}`)
    .set('Authorization', `Bearer ${jwt ?? ''}`)

  const gotUpdate: Update = response.body.data
  const { status } = response

  return [gotUpdate, status]
}
