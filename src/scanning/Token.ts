import { TokenType } from "./TokenType.ts";

export class Token {
  type: TokenType;
  lexeme: string;
  literal: object | null; // TODO
  line: number;

  constructor(
    type: TokenType,
    lexeme: string,
    literal: object | null, // TODO
    line: number
  ) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  toString() {
    return [this.type, this.lexeme, this.literal].join(" ");
  }
}
