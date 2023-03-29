const swaggerAutogen = require('swagger-autogen')()

// TODO: Add auth to swagger

const options = {
  info: {
    title: 'VersionVerse API made with Express and Swagger',
    version: '0.1.0',
  },
  host: 'localhost:3001',
  basePath: '/api',
  schemes: ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],
  securityDefinitions: {
    Bearer: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Please input a valid JWT token',
    },
  },
}

const outputFile = 'swagger.json'
const endpointsFiles = ['./src/server.ts']

swaggerAutogen(outputFile, endpointsFiles, options).then(() => {
  require('./src/index.ts')
})
