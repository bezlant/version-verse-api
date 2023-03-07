import { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { JWT_SECRET, PASSWORD_SALT } from '@/constants'

interface User {
  id: string
  username: string
}

export const comparePasswords = (password: string, hash: string) =>
  bcrypt.compare(password, hash)

export const hashPassword = (password: string) =>
  bcrypt.hash(password, PASSWORD_SALT)

export const createJWT = ({ id, username }: User) => {
  const token = jwt.sign({ id, username }, JWT_SECRET)
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
    res.send({ message: 'Not a valid token' })
    return
  }

  try {
    const user = jwt.verify(token, JWT_SECRET)
    req.user = user
  } catch (e) {
    console.error(e)
    res.status(401)
    res.send({ message: 'Not a valid token' })
  }

  next()
}
