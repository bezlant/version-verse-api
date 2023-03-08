import {type Request, type Response} from 'express'
import prisma from '@/db'
import {comparePasswords, createJWT, hashPassword} from '@/modules/auth'

export const createNewUser = async (req: Request, res: Response) => {
  const user = await prisma.user.create({
    data: {
      username: req.body.username,
      password: await hashPassword(req.body.password),
    },
  })
  const token = createJWT(user)
  res.status(200)
  res.json({token})
}

export const signIn = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: {
      username: req.body.username,
    },
  })

  if (user == null) {
    res.status(404)
    res.json({message: 'User not found'})
    return {}
  }

  const isValid = await comparePasswords(req.body.password, user?.password)

  if (!isValid) {
    res.status(401)
    res.json({message: 'Invalid Password'})
    return {}
  }

  const token = createJWT(user)
  return token
}
