import { Lox } from "../Lox.ts";
import { Token } from "../scanning/Token.ts";
import { TokenType } from "../scanning/TokenType.ts";
import {
  AssignExpr,
  BinaryExpr,
  Expr,
  GroupingExpr,
  LiteralExpr,
  LogicalExpr,
  UnaryExpr,
  VariableExpr,
} from "../AST/Expression.ts";
import {
  BlockStmt,
  ExpressionStmt,
  IfStmt,
  PrintStmt,
  Stmt,
  VariableStmt,
} from "../AST/Statement.ts";

export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Stmt[] {
    const statements: Stmt[] = [];
    while (!this.isAtEnd()) {
      statements.push(this.declaration() as Stmt);
    }

    return statements;
  }

  // #region expressions
  private expression(): Expr {
    return this.assignment();
  }

  private equality(): Expr {
    let expr: Expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator: Token = this.previous();
      const right = this.comparison();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private comparison(): Expr {
    let expr = this.term();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL
      )
    ) {
      const operator = this.previous();
      const right = this.term();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private term(): Expr {
    let expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private factor(): Expr {
    let expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new UnaryExpr(operator, right);
    }

    return this.primary();
  }

  private primary(): Expr {
    if (this.match(TokenType.FALSE)) return new LiteralExpr(false);
    if (this.match(TokenType.TRUE)) return new LiteralExpr(true);
    if (this.match(TokenType.NIL)) return new LiteralExpr(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new LiteralExpr(this.previous().literal);
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return new VariableExpr(this.previous());
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new GroupingExpr(expr);
    }

    throw this.error(this.peek(), "Expect expression.");
  }
  // #endregion

  // #region statements
  private statement(): Stmt {
    if (this.match(TokenType.IF)) return this.ifStatement();
    if (this.match(TokenType.PRINT)) return this.printStatement();
    if (this.match(TokenType.LEFT_BRACE)) return new BlockStmt(this.block());
    return this.expressionStatement();
  }

  private ifStatement() {
    this.consume(TokenType.LEFT_PAREN, "Expect '(', after 'if'.");
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')', after 'if'.");

    const thenBranch = this.statement();
    const elseBranch = this.match(TokenType.ELSE) ? this.statement() : null;

    return new IfStmt(condition, thenBranch, elseBranch);
  }

  private printStatement() {
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
    return new PrintStmt(value);
  }

  private expressionStatement() {
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
    return new ExpressionStmt(value);
  }

  private block(): Stmt[] {
    const statements: Stmt[] = [];
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      statements.push(this.declaration());
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
    return statements;
  }

  private assignment(): Expr {
    const expr = this.or();

    if (this.match(TokenType.EQUAL)) {
      const value = this.assignment();

      if (expr instanceof VariableExpr) {
        return new AssignExpr(expr.name, value);
      }

      const equals = this.previous();
      this.error(equals, "Invalid assignment target.");
    }

    return expr;
  }

  private or() {
    let expr = this.and();

    while (this.match(TokenType.OR)) {
      const operator = this.previous();
      const right = this.and();
      expr = new LogicalExpr(expr, operator, right);
    }

    return expr;
  }

  private and() {
    let expr = this.equality();

    while (this.match(TokenType.AND)) {
      const operator = this.previous();
      const right = this.equality();
      expr = new LogicalExpr(expr, operator, right);
    }

    return expr;
  }
  // #endregion

  // #region declarations
  // @ts-ignore always return Stmt, unless error... and then it's an error
  private declaration(): Stmt {
    try {
      return this.match(TokenType.VAR)
        ? this.varDeclaration()
        : this.statement();
    } catch (error) {
      this.synchronize();
    }
  }

  private varDeclaration(): Stmt {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.");

    let initializer: Expr = null as unknown as Expr;
    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
    return new VariableStmt(name, initializer);
  }

  // #endregion

  // #region helpers
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw this.error(this.peek(), message);
  }

  private error(token: Token, message: string) {
    Lox.tokenError(token, message);
  }

  private synchronize() {
    this.advance();

    while (!this.isAtEnd()) {
      // Statement ended (expect for for loops...)
      if (this.previous().type === TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        // Tokens that usually start a statement
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private isAtEnd(): boolean {
    return this.peek().type == TokenType.EOF;
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current += 1;
    }
    return this.previous();
  }

  private previous() {
    return this.tokens[this.current - 1];
  }
  // #endregion
}
