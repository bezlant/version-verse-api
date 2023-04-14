import { type NextFunction, type Request, type Response } from 'express'
import prisma from '@/db'
import { comparePasswords, createJWT, hashPassword } from '@/modules/auth'
import { ERROR, ERROR_MESSAGE } from '@/constants'

const isUsernamePasswordValid = (username: string, password: string) => {
  let isValid = true

  if (
    username === undefined ||
    password === undefined ||
    username.length === 0 ||
    password.length === 0
  )
    isValid = false

  return isValid
}
export const createNewUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const [username, password]: string[] = [req.body.username, req.body.password]

  if (!isUsernamePasswordValid(username, password)) {
    res.status(401).json({ message: ERROR_MESSAGE.MISSING_USERNAME_PASSWORD })
    return
  }

  const data = {
    username,
    password: await hashPassword(password),
  }

  try {
    const user = await prisma.user.create({ data })

    const token = createJWT(user)
    res.status(200).json({ token })
  } catch (e) {
    if (e instanceof Error) e.cause = ERROR.INPUT
    next(e)
  }
}

export const signIn = async (req: Request, res: Response) => {
  const [username, password] = [req.body.username, req.body.password]

  if (!isUsernamePasswordValid(username, password)) {
    res.status(401).json({ message: ERROR_MESSAGE.MISSING_USERNAME_PASSWORD })
    return
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (user == null) {
    res.status(404).json({ message: ERROR_MESSAGE.USER_NOT_FOUND })
    return
  }

  const isValid = await comparePasswords(password, user?.password)

  if (!isValid) {
    res.status(401).json({ message: ERROR_MESSAGE.INVALID_PASSWORD })
    return
  }

  const token = createJWT(user)
  res.status(200).json({ token })
}
