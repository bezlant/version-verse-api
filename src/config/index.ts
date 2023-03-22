import { type Secret } from 'jsonwebtoken'
import merge from 'lodash.merge'
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */

interface Config {
  stage: string
  env: 'production' | 'testing' | 'development'
  port: number
  salt: number
  jwtSecret: Secret
}

process.env.NODE_ENV ??= 'development'

const stage = process.env.STAGE ?? 'local'

let envConfig: Config

if (stage === 'production') {
  envConfig = require('./prod').default
} else if (stage === 'testing') {
  envConfig = require('./testing').default
} else {
  envConfig = require('./local').default
}

const { JWT_SECRET, PASSWORD_SALT } = process.env

if (JWT_SECRET === undefined) throw new Error('JWT_SECRET must be defined')
if (PASSWORD_SALT === undefined)
  throw new Error('PASSWORD_SALT must be defined')

const defaultConfig: Config = {
  stage,
  env: process.env.NODE_ENV,
  port: 3001,
  salt: PASSWORD_SALT,
  jwtSecret: JWT_SECRET,
}

export default merge(defaultConfig, envConfig)
