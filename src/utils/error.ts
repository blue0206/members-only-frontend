export class ValidationError extends Error {
  details: unknown;
  constructor(message: string, details: unknown) {
    super(message);
    this.details = details;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ValidationError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
