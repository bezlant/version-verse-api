import { type NextFunction, type Request, type Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { type User } from '@prisma/client'
import config from '@/config'
import { ERROR } from '@/constants'

export const comparePasswords = async (password: string, hash: string) =>
  await bcrypt.compare(password, hash)

export const hashPassword = async (password: string) =>
  await bcrypt.hash(password, Number())

export const createJWT = (user: User) =>
  jwt.sign({ id: user.id, username: user.username }, config.jwtSecret)

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization

  if (bearer == null) {
    res.status(401).send({ message: 'Not authorized' })
    return
  }

  const [, token] = bearer.split(' ')

  if (token === undefined || token.length === 0) {
    res.status(401).send({ message: 'Not a valid token' })
    return
  }

  try {
    const user = jwt.verify(token, config.jwtSecret)
    req.user = user as User
    next()
  } catch (e) {
    if (e instanceof Error) e.cause = ERROR.AUTH
    next(e)
  }
}
