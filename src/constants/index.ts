export const {JWT_SECRET, PASSWORD_SALT} = process.env

if (JWT_SECRET === undefined) throw new Error('JWT_SECRET must be defined')
if (PASSWORD_SALT === undefined)
  throw new Error('PASSWORD_SALT must be defined')
