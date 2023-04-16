import { PRODUCT_ERROR } from '@/constants'
import prisma from '@/db'
import app from '@/server'
import { type User, type Product } from '@prisma/client'
import request from 'supertest'

describe('/product endpoint tests', () => {
  let user: User | null
  const username = 'producttest'
  const password = 'producttestpassword'
  let product: Product | null
  const productName = 'New product'

  let jwt: string
  let anotherUserJwt: string

  beforeAll(async () => {
    await request(app).post('/signup').send({ username, password })

    const response = await request(app)
      .post('/signin')
      .send({ username, password })

    const anotherResponse = await request(app)
      .post('/signin')
      .send({ username: 'anotherUser', password: 'anotherPassword' })

    user = await prisma.user.findUnique({
      where: { username },
    })

    if (user !== null) {
      await prisma.product.createMany({
        data: [
          { name: 'Product 1', userId: user.id },
          { name: 'Product 2', userId: user.id },
          { name: 'Product 3', userId: user.id },
        ],
      })

      anotherUserJwt = anotherResponse.body.token
      jwt = response.body.token
    }
  })

  afterAll(async () => {
    await prisma.product.deleteMany({})
    await prisma.user.deleteMany({})
  })

  test('should create a new product', async () => {
    const response = await request(app)
      .post('/api/product')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ name: productName })

    product = await prisma.product.findFirst({
      where: { name: productName },
    })

    expect(response.status).toBe(200)
    expect(response.body.data.name).toBe(productName)
  })

  test('should return 401 if not authenticated', async () => {
    const response = await request(app)
      .post('/api/product')
      .send({ name: productName })

    expect(response.status).toBe(401)
  })

  test('should return 400 if name is missing', async () => {
    const response = await request(app)
      .post('/api/product')
      .set('Authorization', `Bearer ${jwt}`)
      .send({})

    expect(response.status).toBe(400)
  })

  test('should return a product with a valid id', async () => {
    if (product !== null) {
      const response = await request(app)
        .get(`/api/product/${product.id}`)
        .set('Authorization', `Bearer ${jwt}`)

      expect(response.status).toBe(200)
      expect(response.body.data.id).toBe(product.id)
    }
  })

  test('should return 404 if product is not found', async () => {
    const response = await request(app)
      .get('/api/product/123')
      .set('Authorization', `Bearer ${jwt}`)

    expect(response.status).toBe(404)
  })

  test('should return 401 if not authenticated', async () => {
    const response = await request(app).get('/api/product/123')

    expect(response.status).toBe(401)
  })

  test('should return 401 if product does not belong to user', async () => {
    const anotherUserProduct: Product = (
      await request(app)
        .post('/api/product')
        .set('Authorization', `Bearer ${jwt}`)
        .send({ name: productName })
    ).body.data

    const response = await request(app)
      .get(`/api/product/${anotherUserProduct.id}`)
      .set('Authorization', `Bearer ${anotherUserJwt}`)

    expect(response.status).toBe(401)
  })

  test('should return a list of products', async () => {
    const res = await request(app)
      .get('/api/product')
      .set('Authorization', `Bearer ${jwt}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.data.length).toBe(5)
  })

  test('should delete product and return 200', async () => {
    const userProduct = await prisma.user.findUnique({
      where: { username },
      include: { products: true },
    })
    if (userProduct !== null) {
      const response = await request(app)
        .delete(`/api/product/${userProduct.products[0].id}`)
        .set('Authorization', `Bearer ${jwt}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty(
        'id',
        userProduct.products[0].id
      )

      const deletedProduct = await prisma.product.findUnique({
        where: {
          id: userProduct.products[0].id,
        },
      })
      expect(deletedProduct).toBeNull()
    }
  })

  test('should return 404 if product not found', async () => {
    const response = await request(app)
      .delete(`/api/product/123`)
      .set('Authorization', `Bearer ${jwt}`)

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message', PRODUCT_ERROR.NOT_FOUND)
  })

  // test('should return 404 if user is not authorized to delete product', async () => {
  //   const userProduct = await prisma.user.findUnique({
  //     where: { username },
  //     include: { products: true },
  //   })
  //
  //   if (userProduct !== null) {
  //     const response = await request(app)
  //       .delete(`/product/${userProduct.products[0].id}`)
  //       .set('Authorization', `Bearer ${anotherUserJwt}`)
  //
  //     expect(response.status).toBe(404)
  //     expect(response.body).toHaveProperty('message', 'Product not found')
  //   }
  // })
})
