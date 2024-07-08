import { Response } from "express"

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = "HttpError"
  }

  respond(res: Response) {
    return res.status(this.statusCode).json({ message: this.message })
  }
}

export const httpError = (status: number, message: string) =>
  new HttpError(status, message)
