import { Lox } from "../Lox.ts";
import { Token } from "./Token.ts";
import { TokenType } from "./TokenType.ts";
import { Literal } from "./types.ts";

export class Scanner {
  private source: string;
  private tokens: Token[] = [];
  private start: number = 0;
  private current: number = 0;
  private line: number = 1;

  private keywords: Record<string, TokenType> = {
    and: TokenType.AND,
    class: TokenType.CLASS,
    else: TokenType.ELSE,
    false: TokenType.FALSE,
    for: TokenType.FOR,
    fun: TokenType.FUN,
    if: TokenType.IF,
    nil: TokenType.NIL,
    or: TokenType.OR,
    print: TokenType.PRINT,
    return: TokenType.RETURN,
    super: TokenType.SUPER,
    this: TokenType.THIS,
    true: TokenType.TRUE,
    var: TokenType.VAR,
    while: TokenType.WHILE,
  };

  constructor(source: string) {
    this.source = source;
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
    return this.tokens;
  }

  private scanToken(): void {
    const char = this.consume();

    // Single-character tokens.
    if (char === "(") {
      this.addToken(TokenType.LEFT_PAREN, null);
      return;
    }
    if (char === ")") {
      this.addToken(TokenType.RIGHT_PAREN);
      return;
    }
    if (char === "{") {
      this.addToken(TokenType.LEFT_BRACE);
      return;
    }
    if (char === "}") {
      this.addToken(TokenType.RIGHT_BRACE);
      return;
    }
    if (char === ",") {
      this.addToken(TokenType.COMMA);
      return;
    }
    if (char === ".") {
      this.addToken(TokenType.DOT);
      return;
    }
    if (char === "-") {
      this.addToken(TokenType.MINUS);
      return;
    }
    if (char === "+") {
      this.addToken(TokenType.PLUS);
      return;
    }
    if (char === ";") {
      this.addToken(TokenType.SEMICOLON);
      return;
    }
    if (char === "*") {
      this.addToken(TokenType.STAR);
      return;
    }

    // One or two character tokens.
    if (char === "!") {
      this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
      return;
    }
    if (char === "=") {
      this.addToken(this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
      return;
    }
    if (char === "<") {
      this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
      return;
    }
    if (char === ">") {
      this.addToken(
        this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER
      );
      return;
    }
    if (char === "/") {
      if (this.match("/")) {
        // It's a comment
        while (this.look(0) !== "\n" && !this.isAtEnd()) this.advanceCurrent();
      } else {
        this.addToken(TokenType.SLASH);
      }
      return;
    }

    // Whitespace and new line
    if (char === " " || char === "\r" || char === "\t") {
      return;
    }

    if (char === "\n") {
      this.advanceLine();
      return;
    }

    if (char === "\0") {
      // ignore NULL character. Without this REPL will mark error at the end of type
      return;
    }

    // Literals
    if (char === '"') {
      this.string();
      return;
    }
    if (this.isDigit(char)) {
      this.number();
      return;
    }
    if (this.isAlpha(char)) {
      this.identifier();
      return;
    }

    // Womp Womp
    const lines = this.source.split("\n");
    let charCounter = 0;
    for (const line of lines) {
      const lineLength = line.length + 1;
      if (lineLength + charCounter >= this.current) break;
      charCounter += lineLength;
    }
    Lox.lineError(
      this.line,
      [
        `Unexpected character >>${char}<< ${[
          `charcode: ${char.charCodeAt(0)}`,
          `line: ${this.line}`,
          `character: ${this.start - charCounter}`,
          `position: ${this.start}`,
        ].join(", ")}`,
        lines[this.line - 1],
        `${" ".repeat(this.start - charCounter)}^`,
      ].join("\n")
    );
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private look(index = 0): string {
    if (this.isAtEnd()) return "\0";
    return this.source.charAt(this.current + index);
  }

  private advanceCurrent(): void {
    this.current += 1;
  }

  private advanceLine(): void {
    this.line += 1;
  }

  private consume(): string {
    this.advanceCurrent();
    return this.look(-1);
  }

  private addToken(type: TokenType, literal: Literal = null) {
    const lexeme = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, lexeme, literal, this.line));
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.look() !== expected) return false;

    this.advanceCurrent();
    return true;
  }

  private string() {
    // At this point, the first double-quote was already consumed.
    while (this.look() !== '"' && !this.isAtEnd()) {
      if (this.look(1) === "\n") this.advanceLine();
      this.advanceCurrent();
    }

    if (this.isAtEnd()) {
      Lox.lineError(this.line, "Unterminated string.");
      return;
    }

    // Found the closing double-quote:
    this.advanceCurrent();

    // Trim the surrounding quotes.
    const literal = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, literal);
  }

  private isDigit(char: string): boolean {
    return char.length === 1 && !isNaN(Number.parseInt(char));
  }

  private isAlpha(char: string): boolean {
    // does not support
    return /[a-zA-Z_]/.test(char);
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private number() {
    // At this point, the first digit was already consumed.
    while (this.isDigit(this.look())) {
      this.advanceCurrent();
    }

    if (this.look() === "." && this.isDigit(this.look(1))) {
      this.advanceCurrent();
      while (this.isDigit(this.look())) {
        this.advanceCurrent();
      }
    }

    this.addToken(
      TokenType.NUMBER,
      Number(this.source.substring(this.start, this.current))
    );
  }

  identifier() {
    while (this.isAlphaNumeric(this.look())) {
      this.advanceCurrent();
    }

    const text = this.source.substring(this.start, this.current);
    const type: TokenType = this.keywords[text] ?? TokenType.IDENTIFIER;
    this.addToken(type);
  }
}
