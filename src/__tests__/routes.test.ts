import app from '@/server'
import supertest from 'supertest'

describe('GET /', () => {
  it('should fail with 500', async () => {
    const response = await supertest(app).get('/')
    expect(response.status).toBe(500)
  })
})
