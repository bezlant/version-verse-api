import prisma from '@/db'
import { type Update } from '@prisma/client'
import { type Request, type Response } from 'express'

const getProductByUpdateId = async (userId: string, updateId: string) => {
  const product = await prisma.product.findFirst({
    where: {
      userId,
      updates: {
        some: {
          id: updateId,
        },
      },
    },
  })

  return product
}

export const getUpdates = async (req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      updates: true,
    },
  })

  // NOTE: This is not good, probably need to updated the schema
  const updates = products.reduce((allUpdates: Update[], product) => {
    return [...allUpdates, ...product.updates]
  }, [])

  res.json({ data: updates })
}

export const getUpdateById = async (req: Request, res: Response) => {
  const { id: userId } = req.user
  const { id: updateId } = req.params

  const product = await getProductByUpdateId(userId, updateId)

  if (product === null) {
    res.json({ message: 'Product that has this update not found' })
    return
  }

  const update = prisma.update.findUnique({
    where: {
      id: updateId,
    },
  })

  res.json({ data: update })
}

export const createUpdate = async (req: Request, res: Response) => {
  const { productId, title, body } = req.body
  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (product === null) {
    res.json({ message: 'No product update found' })
    return
  }

  const update = await prisma.update.create({
    data: {
      title,
      body,
      product: { connect: { id: product.id } },
    },
  })

  res.json({ data: update })
}

export const updateUpdate = async (req: Request, res: Response) => {
  const { id: userId } = req.user
  const { id: updateId } = req.params

  const product = await getProductByUpdateId(userId, updateId)

  if (product === null) {
    res.json({ message: 'No product update found' })
    return
  }

  const updated = await prisma.update.update({
    where: {
      id_productId: {
        id: updateId,
        productId: product.id,
      },
    },
    data: req.body,
  })

  res.json({ data: updated })
}

export const deleteUpdate = async (req: Request, res: Response) => {
  const { id: userId } = req.user
  const { id: updateId } = req.params

  const product = await getProductByUpdateId(userId, updateId)

  if (product === null) {
    res.json({ message: 'No product update found' })
    return
  }

  const deleted = await prisma.update.delete({
    where: {
      id_productId: {
        id: updateId,
        productId: product?.id,
      },
    },
  })

  res.json({ data: deleted })
}
