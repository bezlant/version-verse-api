export const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET must be defined')

export const PASSWORD_SALT = process.env.PASSWORD_SALT
if (!PASSWORD_SALT) throw new Error('PASSWORD_SALT must be defined')
