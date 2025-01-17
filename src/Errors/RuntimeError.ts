import { Token } from "../scanning/Token.ts";

export class RuntimeError extends Error {
  token: Token;

  constructor(token: Token, message: string, ) {
    super(message);
    this.token = token;
  }
}
