export class AuditError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuditError";
  }
}

export class AuditCreationError extends AuditError {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "AuditCreationError";
  }
}
