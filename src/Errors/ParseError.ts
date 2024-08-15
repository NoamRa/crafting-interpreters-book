export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
  }

  public toString() {
    return this.message;
  }
}
