import { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { JWT_SECRET, PASSWORD_SALT } from '@/constants'

export const comparePasswords = (password: string, hash: string) =>
  bcrypt.compare(password, hash)

export const hashPassword = (password: string) =>
  bcrypt.hash(password, PASSWORD_SALT)

export const createJWT = (user: { id: string; username: string }) => {
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET)
  return token
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization

  if (!bearer) {
    res.status(401)
    res.send({ message: 'Not authorized' })
    return
  }

  const [, token] = bearer.split(' ')

  if (!token) {
    res.status(401)
    res.send({ message: 'Not valid token' })
    return
  }

  try {
    const user = jwt.verify(token, JWT_SECRET)
    req.user = user
  } catch (e) {
    console.error(e)
    res.status(401)
    res.send({ message: 'Not valid token' })
  }

  next()
}
