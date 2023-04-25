import prisma from '@/db'
import app from '@/server'
import { type UpdatePoint } from '@prisma/client'
import request from 'supertest'
import { createProduct, createUpdate, createUser, getJwt } from './utils'

describe('/api/updatepoint tests', () => {
  const user1 = {
    username: '1updatepointtest1',
    password: '1updatepointtestpassword1',
  }
  const user2 = {
    username: '2updatepointtest2',
    password: '2updatepointtestpassword2',
  }
  const productName = 'New fancy product'
  const updateTitle = 'New update'
  const updateBody = 'This is a wonderful update'
  const updatePointName = 'New fancy update point'
  const updatePointDescription = 'New fancy update point description'

  beforeAll(async () => {
    await createUser(user1.username, user1.password)
    await createUser(user2.username, user2.password)
  })

  afterEach(async () => {
    await prisma.updatePoint.deleteMany({})
    await prisma.update.deleteMany({})
    await prisma.product.deleteMany({})
  })

  afterAll(async () => {
    await prisma.user.deleteMany({})
  })

  test('should create a new update point', async () => {
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

    const [updatePoint, status] = await createUpdatePoint(
      {
        name: updatePointName,
        description: updatePointDescription,
        updateId: update.id,
      },
      jwt
    )

    expect(status).toBe(200)
    expect(updatePoint.name).toBe(updatePointName)
    expect(updatePoint.description).toBe(updatePointDescription)
  })

  test('should get an update point by id', async () => {
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

    const [updatePoint] = await createUpdatePoint(
      {
        name: updatePointName,
        description: updatePointDescription,
        updateId: update.id,
      },
      jwt
    )

    const [gotUpdatePoint, status] = await getUpdatePointById(updatePoint, jwt)

    expect(status).toBe(200)
    expect(gotUpdatePoint.name).toBe(updatePoint.name)
    expect(gotUpdatePoint.description).toBe(updatePoint.description)
  })

  test('should update an update point by id', async () => {
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

    const [updatePoint] = await createUpdatePoint(
      {
        name: updatePointName,
        description: updatePointDescription,
        updateId: update.id,
      },
      jwt
    )

    const newUpdatePoint: UpdatePoint = {
      ...updatePoint,
      name: 'Completely new update point',
      description: 'Completely new update point description',
    }

    const [updatedUpdatePoint, status] = await updateUpdatePointById(
      newUpdatePoint,
      updatePoint,
      jwt
    )

    const [gotUpdatePoint] = await getUpdatePointById(updatePoint, jwt)

    expect(updatedUpdatePoint).not.toBeUndefined()

    expect(status).toBe(200)
    expect(gotUpdatePoint.name).toBe(newUpdatePoint.name)
    expect(gotUpdatePoint.description).toBe(newUpdatePoint.description)
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

    const [updatePoint] = await createUpdatePoint(
      {
        name: updatePointName,
        description: updatePointDescription,
        updateId: update.id,
      },
      jwt
    )

    const [deleted, status] = await deleteUpdatePointById(updatePoint.id, jwt)

    expect(deleted).toEqual(updatePoint)
    expect(status).toBe(200)

    const [gotUpdatePoint] = await getUpdatePointById(updatePoint, jwt)

    expect(gotUpdatePoint).toBeNull()
  })
})

const deleteUpdatePointById = async (
  updatePointId: string,
  jwt: string
): Promise<[UpdatePoint, number]> => {
  const response = await request(app)
    .delete(`/api/updatepoint/${updatePointId}`)
    .set('Authorization', `Bearer ${jwt ?? ''}`)

  const deleted: UpdatePoint = response.body.data
  const { status } = response

  return [deleted, status]
}

const updateUpdatePointById = async (
  newUpdate: UpdatePoint,
  oldUpdate: UpdatePoint,
  jwt: string
): Promise<[UpdatePoint, number]> => {
  const response = await request(app)
    .put(`/api/updatepoint/${oldUpdate.id}`)
    .set('Authorization', `Bearer ${jwt ?? ''}`)
    .send(newUpdate)

  const updated: UpdatePoint = response.body.data
  const { status } = response

  return [updated, status]
}

const getUpdatePointById = async (
  updatePoint: UpdatePoint,
  jwt?: string
): Promise<[UpdatePoint, number]> => {
  const response = await request(app)
    .get(`/api/updatepoint/${updatePoint.id}`)
    .set('Authorization', `Bearer ${jwt ?? ''}`)

  const gotUpdatePoint: UpdatePoint = response.body.data
  const { status } = response

  return [gotUpdatePoint, status]
}

const createUpdatePoint = async (
  updatePoint: Partial<UpdatePoint>,
  jwt?: string
): Promise<[UpdatePoint, number]> => {
  const response = await request(app)
    .post('/api/updatepoint')
    .set('Authorization', `Bearer ${jwt ?? ''}`)
    .send(updatePoint)

  const createdUpdatePoint: UpdatePoint = response.body.data
  const { status } = response

  return [createdUpdatePoint, status]
}
