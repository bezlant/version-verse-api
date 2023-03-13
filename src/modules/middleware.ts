import {type NextFunction, type Request, type Response} from 'express'
import {validationResult} from 'express-validator'

export const handleInputErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) res.status(400).json({error: errors.array()})
  else next()
}
