import prisma from '@/db'
import app from '@/server'
import { type Product } from '@prisma/client'
import request from 'supertest'

describe('/api/product tests', () => {
  const user1 = { username: '1producttest1', password: '1producttestpassword1' }
  const user2 = { username: '2producttest2', password: '2producttestpassword2' }
  const productName = 'New product'

  beforeAll(async () => {
    await createUser(user1.username, user1.password)
    await createUser(user2.username, user2.password)
  })

  afterEach(async () => {
    await prisma.product.deleteMany({})
  })

  afterAll(async () => {
    await prisma.user.deleteMany({})
  })

  test('should create a new product', async () => {
    const jwt: string = await getJwt(user1)

    const [product, status] = await createProduct({ name: productName }, jwt)

    expect(status).toBe(200)
    expect(product.name).toBe(productName)
  })

  test('create new Product should return 401 if not authenticated', async () => {
    const [gotProduct, status] = await createProduct({
      name: 'Nice shiny product',
    })

    expect(status).toBe(401)
    expect(gotProduct).toBeUndefined()
  })

  test('should return 400 if name is missing', async () => {
    const jwt: string = await getJwt(user1)

    const [product, status] = await createProduct({}, jwt)

    expect(status).toBe(400)
    expect(product).toBeUndefined()
  })

  test('should return a product with a valid id', async () => {
    const jwt: string = await getJwt(user1)
    const [product] = await createProduct({ name: 'Valid product' }, jwt)
    const [gotProduct, gotStatus] = await getProductById(product.id, jwt)

    expect(gotStatus).toBe(200)
    expect(gotProduct.id).toBe(product.id)
  })

  test('should return 404 if product is not found', async () => {
    const jwt: string = await getJwt(user1)
    const [, gotStatus] = await getProductById('123', jwt)

    expect(gotStatus).toBe(404)
  })

  test('should return 401 if not authenticated', async () => {
    const jwt: string = await getJwt(user1)
    const [product] = await createProduct({ name: 'Nice shiny product' }, jwt)
    const [gotProduct, status] = await getProductById(product.id)

    expect(status).toBe(401)
    expect(gotProduct).toBeUndefined()
  })

  test('should return 401 if product does not belong to user', async () => {
    const user1Jwt: string = await getJwt(user1)
    const [product] = await createProduct(
      { name: 'My very own product' },
      user1Jwt
    )

    const user2Jwt: string = await getJwt(user2)
    const [gotProduct, gotStatus] = await getProductById(product.id, user2Jwt)

    expect(gotStatus).toBe(404)
    expect(gotProduct).toBeUndefined()
  })

  test('should return an empty list of products', async () => {
    const jwt: string = await getJwt(user1)
    const [products, status] = await getProducts(jwt)

    expect(status).toBe(200)
    expect(products.length).toBe(0)
  })

  test('should return a list of products', async () => {
    const jwt: string = await getJwt(user1)
    const user = await prisma.user.findUnique({
      where: { username: user1.username },
    })

    expect(user).not.toBeNull()

    if (user !== null) {
      await prisma.product.createMany({
        data: [
          { name: 'Product One', userId: user.id },
          { name: 'Product Two', userId: user.id },
          { name: 'Product Three', userId: user.id },
        ],
      })
    }

    const [products, status] = await getProducts(jwt)

    expect(status).toBe(200)
    expect(products.length).toBe(3)
  })

  test('should delete product and return 200', async () => {
    const jwt: string = await getJwt(user1)

    const [product] = await createProduct({ name: 'Product to delete' }, jwt)

    const [, status] = await deleteProduct(product, jwt)

    expect(status).toBe(200)

    const deletedProduct = await prisma.product.findUnique({
      where: {
        id: product.id,
      },
    })

    expect(deletedProduct).toBeNull()
  })

  test('should return 500 if user is not authorized to delete product', async () => {
    const user1Jwt: string = await getJwt(user1)
    const user2Jwt: string = await getJwt(user2)

    const [user1Product] = await createProduct(
      { name: 'Product to delete' },
      user1Jwt
    )

    const [deletedProduct, status] = await deleteProduct(user1Product, user2Jwt)

    expect(status).toBe(500)
    expect(deletedProduct).toBeUndefined()
  })
})

const deleteProduct = async (
  product: Product,
  jwt: string
): Promise<[Product, number]> => {
  const response = await request(app)
    .delete(`/api/product/${product.id}`)
    .set('Authorization', `Bearer ${jwt}`)

  const { status } = response
  const deletedProduct: Product = response.body.data

  return [deletedProduct, status]
}

const getProducts = async (jwt: string): Promise<[Product[], number]> => {
  const response = await request(app)
    .get('/api/product')
    .set('Authorization', `Bearer ${jwt}`)

  const { status } = response
  const products: Product[] = response.body.data

  return [products, status]
}
const getJwt = async (user: { username: string; password: string }) => {
  const { username, password } = user
  const signinResponse = await request(app)
    .post('/signin')
    .send({ username, password })

  const jwt: string = signinResponse.body.token
  return jwt
}

const createProduct = async (
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

const getProductById = async (
  productId: string,
  jwt?: string
): Promise<[Product, number]> => {
  const response = await request(app)
    .get(`/api/product/${productId}`)
    .set('Authorization', `Bearer ${jwt ?? ''}`)

  const product: Product = response.body.data
  const { status } = response

  return [product, status]
}

const createUser = async (username: string, password: string) => {
  await request(app).post('/signup').send({ username, password })
}
