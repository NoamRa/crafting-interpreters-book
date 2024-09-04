import { RuntimeError } from "../Errors/RuntimeError.ts";
import { Token } from "../scanning/Token.ts";
import { LiteralValue } from "../scanning/types.ts";

export class Environment {
  private values = new Map<string, LiteralValue>();

  define(name: string, value: LiteralValue) {
    this.values.set(name, value);
  }

  get(name: Token) {
    if (this.values.has(name.lexeme)) return this.values.get(name.lexeme);

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'`);
  }

  assign(name: Token, value: LiteralValue) {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }
}
