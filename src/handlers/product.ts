import prisma from '@/db'
import { type NextFunction, type Request, type Response } from 'express'

export const getProducts = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    include: {
      products: true,
    },
  })

  res.status(200).json({ data: user?.products })
}

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params
  const userId = req.user.id

  const product = prisma.product.findFirst({
    where: {
      id,
      userId,
    },
  })

  res.status(200).json({ data: product })
}

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await prisma.product.create({
      data: {
        name: req.body.name,
        userId: req.user.id,
      },
    })

    res.status(200).json({ data: product })
  } catch (e) {
    next(e)
  }
}

export const updateProduct = async (req: Request, res: Response) => {
  const updated = await prisma.product.update({
    where: {
      id_userId: {
        id: req.params.id,
        userId: req.user.id,
      },
    },
    data: {
      name: req.body.name,
    },
  })

  res.status(200).json({ data: updated })
}

export const deleteProduct = async (req: Request, res: Response) => {
  const deleted = await prisma.product.delete({
    where: {
      id_userId: {
        id: req.params.id,
        userId: req.user.id,
      },
    },
  })

  res.status(200).json({ data: deleted })
}
