export class AuditError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuditError";
  }
}

export class AuditCreationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "AuditCreationError";
  }
}

export class AuditListError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "AuditListError";
  }
}

export class InvalidSortingError extends AuditListError {
  constructor(column: string) {
    super(`Invalid sorting column: ${column}`);
    this.name = "InvalidSortingError";
  }
}
