export class DomainValidationError extends Error {
  public readonly issues: readonly string[];

  public constructor(message: string, issues: readonly string[] = []) {
    super(message);
    this.name = "DomainValidationError";
    this.issues = issues;
  }
}

export interface DomainValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}
