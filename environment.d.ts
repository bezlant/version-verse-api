import { type Secret } from 'jsonwebtoken'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string
      JWT_SECRET: Secret
      PASSWORD_SALT: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
