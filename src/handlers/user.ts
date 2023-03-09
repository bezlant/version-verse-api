import {type Request, type Response} from 'express'
import prisma from '@/db'
import {comparePasswords, createJWT, hashPassword} from '@/modules/auth'

export const createNewUser = async (req: Request, res: Response) => {
  const [username, password] = [req.body.username, req.body.password]

  if (username === undefined || password === undefined) {
    res.status(401).json({message: 'Missing username or password'})
    return
  }

  const userData = {
    username,
    password: await hashPassword(password),
  }

  const user = await prisma.user.create({data: userData})

  const token = createJWT(user)
  res.status(200).json({token})
}

export const signIn = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: {
      username: req.body.username,
    },
  })

  if (user == null) {
    res.status(404).json({message: 'User not found'})
    return {}
  }

  const isValid = await comparePasswords(req.body.password, user?.password)

  if (!isValid) {
    res.status(401).json({message: 'Invalid Password'})
    return {}
  }

  const token = createJWT(user)
  return token
}
