import prisma from '@/db'
import { type Update } from '@prisma/client'
import { type Request, type Response } from 'express'

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
  // NOTE: What if it doesn't belong to the user?

  const update = prisma.update.findUnique({
    where: {
      id: req.body.id,
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
    res.json({ message: 'No product found to update' })
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
  const product = await prisma.product.findFirst({
    where: {
      userId: req.user.id,
      updates: {
        some: {
          id: req.params.id,
        },
      },
    },
  })

  if (product === null) {
    res.json({ message: 'No update found with that id' })
    return
  }

  const updated = await prisma.update.update({
    where: {
      id_productId: {
        id: req.params.id,
        productId: product.id,
      },
    },
    data: req.body,
  })

  res.status(200).json({ data: updated })
}

export const deleteUpdate = async (req: Request, res: Response) => {
  const product = await prisma.product.findFirst({
    where: {
      userId: req.user.id,
      updates: {
        some: {
          id: req.body.id,
        },
      },
    },
  })

  if (product === null) {
    res.json({ message: 'Product that has this update not found' })
    return
  }

  const deleted = await prisma.update.delete({
    where: {
      id_productId: {
        id: req.params.id,
        productId: product?.id,
      },
    },
  })

  res.status(200).json({ data: deleted })
}
