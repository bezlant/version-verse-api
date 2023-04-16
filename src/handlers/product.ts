import { ERROR, PRODUCT_ERROR } from '@/constants'
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

  const product = await prisma.product.findUnique({
    where: {
      id_userId: { id, userId },
    },
  })

  if (product === null) {
    res.status(404).json({ message: PRODUCT_ERROR.NOT_FOUND })
    return
  }

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
    if (e instanceof Error) e.cause = ERROR.INTERNAL
    next(e)
  }
}

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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
  } catch (e) {
    if (e instanceof Error) e.cause = ERROR.INTERNAL
    next(e)
  }
}

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await prisma.product.delete({
      where: {
        id_userId: {
          id: req.params.id,
          userId: req.user.id,
        },
      },
    })

    res.status(200).json({ data: deleted })
  } catch (e) {
    if (e instanceof Error) e.cause = ERROR.INTERNAL
    next(e)
  }
}
