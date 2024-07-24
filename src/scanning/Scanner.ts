import { Lox } from "../Lox.ts";
import { Token } from "./Token.ts";
import { TokenType } from "./TokenType.ts";

export class Scanner {
  private source: string;
  private tokens: Set<Token> = new Set();
  private start: number = 0;
  private current: number = 0;
  private line: number = 1;

  constructor(source: string) {
    this.source = source;
  }

  scanTokens(): Set<Token> {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.add(new Token(TokenType.EOF, "", null, this.line));
    return this.tokens;
  }

  scanToken() {
    const char = this.advance();
    switch (char) {
      case "(": {
        this.addToken(TokenType.LEFT_PAREN, null);
        break;
      }
      case ")": {
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      }
      case "{": {
        this.addToken(TokenType.LEFT_BRACE);
        break;
      }
      case "}": {
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      }
      case ",": {
        this.addToken(TokenType.COMMA);
        break;
      }
      case ".": {
        this.addToken(TokenType.DOT);
        break;
      }
      case "-": {
        this.addToken(TokenType.MINUS);
        break;
      }
      case "+": {
        this.addToken(TokenType.PLUS);
        break;
      }
      case ";": {
        this.addToken(TokenType.SEMICOLON);
        break;
      }
      case "*": {
        this.addToken(TokenType.STAR);
        break;
      }

      default:
        Lox.error(this.line, `Unexpected character >> ${char} <<`);
        break;
    }
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  // returns next character and (afterwards) increment current
  private advance(): string {
    return this.source.charAt(this.current++);
  }

  private addToken(type: TokenType, literal: object | null = null) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.add(new Token(type, text, literal, this.line));
  }
}
