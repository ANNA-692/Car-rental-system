import { validationResult } from "express-validator";
import { AppError } from "./errorHandler.js";

export function validate(validations) {
  return async (req, _res, next) => {
    try {
      for (const validation of validations) {
        await validation.run(req);
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const messages = errors
          .array()
          .map((e) => e.msg)
          .join(", ");
        throw new AppError(messages, 400);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
