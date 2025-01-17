import { TokenType } from "./TokenType.ts";
import { Literal } from "./types.ts";

export class Token {
  type: TokenType;
  lexeme: string;
  literal: Literal;
  line: number;

  constructor(type: TokenType, lexeme: string, literal: Literal, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  toString() {
    return [this.type, this.lexeme, this.literal].join(" ");
  }
}
