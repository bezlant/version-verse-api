import { type NextFunction, type Request, type Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { JWT_SECRET, PASSWORD_SALT } from '@/constants'
import { type User } from '@prisma/client'

export const comparePasswords = async (password: string, hash: string) =>
  await bcrypt.compare(password, hash)

export const hashPassword = async (password: string) =>
  await bcrypt.hash(password, Number(PASSWORD_SALT))

export const createJWT = (user: User) =>
  jwt.sign({ id: user.id, username: user.username }, JWT_SECRET)

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization

  if (bearer == null) {
    res.status(401)
    res.send({ message: 'Not authorized' })
    return
  }

  const [, token] = bearer.split('=')

  if (token.length === 0) {
    res.status(401)
    res.send({ message: 'Not a valid token' })
    return
  }

  try {
    const user = jwt.verify(token, JWT_SECRET)
    req.user = user as User
    next()
  } catch (error) {
    res.status(401)
    res.send({ message: error })
  }
}
