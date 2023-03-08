import {type NextFunction, type Request, type Response} from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {JWT_SECRET, PASSWORD_SALT} from '@/constants'

interface User {
  id: string
  username: string
}

export const comparePasswords = async (password: string, hash: string) =>
  await bcrypt.compare(password, hash)

export const hashPassword = async (password: string) =>
  await bcrypt.hash(password, Number(PASSWORD_SALT))

export const createJWT = ({id, username}: User) => {
  const token = jwt.sign({id, username}, JWT_SECRET)
  return token
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization

  if (bearer == null) {
    res.status(401)
    res.send({message: 'Not authorized'})
    return
  }

  const [, token] = bearer.split(' ')

  if (token.length === 0) {
    res.status(401)
    res.send({message: 'Not a valid token'})
    return
  }

  try {
    const user = jwt.verify(token, JWT_SECRET)
    req.user = user
    next()
  } catch (error) {
    res.status(401)
    res.send({message: error})
  }
}
