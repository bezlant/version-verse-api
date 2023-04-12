import prisma from '@/db'
import { type Request, type Response } from 'express'

const getUpdateByUpdatePointId = async (
  userId: string,
  updatePointId: string
) => {
  const update = await prisma.update.findFirst({
    where: {
      updatePoints: {
        some: { updateId: { equals: updatePointId } },
      },
      product: {
        userId: {
          equals: userId,
        },
      },
    },
  })

  return update
}

export const getUpdatePointById = async (req: Request, res: Response) => {
  const { id: userId } = req.user
  const { id: updatePointId } = req.params

  const updatePoint = await prisma.updatePoint.findFirst({
    where: {
      id: { equals: updatePointId },
      update: {
        product: {
          userId: { equals: userId },
        },
      },
    },
  })

  res.json({ data: updatePoint })
}

export const createUpdatePoint = async (req: Request, res: Response) => {
  const { id: userId } = req.user
  const { name, description } = req.body

  const update = await prisma.update.findFirst({
    where: {
      product: {
        userId: {
          equals: userId,
        },
      },
    },
  })

  if (update === null) {
    res.json({ message: 'No update found' })
    return
  }

  const updatePoint = await prisma.updatePoint.create({
    data: {
      name,
      description,
      update: { connect: { id: update.id } },
    },
  })

  res.json({ data: updatePoint })
}

export const updateUpdatePoint = async (req: Request, res: Response) => {
  const { id: userId } = req.user
  const { id: updatePointId } = req.params

  const update = await getUpdateByUpdatePointId(userId, updatePointId)

  if (update === null) {
    res.json({ message: 'No update found' })
    return
  }

  const updatedPoint = await prisma.updatePoint.update({
    where: {
      id_updateId: {
        id: updatePointId,
        updateId: update.id,
      },
    },
    data: req.body,
  })

  res.json({ data: updatedPoint })
}

export const deleteUpdatePoint = async (req: Request, res: Response) => {
  const { id: userId } = req.user
  const { id: updatePointId } = req.params

  const update = await getUpdateByUpdatePointId(userId, updatePointId)

  if (update === null) {
    res.json({ message: 'No update found' })
    return
  }

  const deleted = await prisma.updatePoint.delete({
    where: {
      id_updateId: {
        id: updatePointId,
        updateId: update?.id,
      },
    },
  })

  res.json({ data: deleted })
}
