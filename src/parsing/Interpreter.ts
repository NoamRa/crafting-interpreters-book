import { RuntimeError } from "../Errors/RuntimeError.ts";
import { Lox } from "../Lox.ts";
import { Token } from "../scanning/Token.ts";
import { TokenType } from "../scanning/TokenType.ts";
import { LiteralValue } from "../scanning/types.ts";
import {
  BinaryExpr,
  Expr,
  ExprVisitor,
  GroupingExpr,
  LiteralExpr,
  UnaryExpr,
} from "../AST/Expression.ts";
import { ExpressionStmt, PrintStmt, Stmt, StmtVisitor } from "../AST/Stmt.ts";

export class Interpreter
  implements ExprVisitor<LiteralValue>, StmtVisitor<void>
{
  public interpret(statements: Stmt[]) {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error: unknown) {
      Lox.runtimeError(error as RuntimeError);
    }
  }

  //#region Expr visitor
  public visitLiteralExpr(expr: LiteralExpr) {
    return expr.value;
  }

  public visitGroupingExpr(expr: GroupingExpr) {
    return this.evaluate(expr.expression);
  }

  public visitUnaryExpr(expr: UnaryExpr) {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG: {
        return !this.isTruthy(right);
      }
      case TokenType.MINUS: {
        this.checkNumberOperand(expr.operator, right);
        // @ts-ignore must be number
        return -right;
      }
    }

    // Unreachable.
    return null;
  }

  public visitBinaryExpr(expr: BinaryExpr) {
    const left = this.evaluate(expr.left) as number | string;
    const right = this.evaluate(expr.right) as number | string;

    switch (expr.operator.type) {
      case TokenType.GREATER: {
        this.checkNumberOperands(expr.operator, left, right);
        return left > right;
      }
      case TokenType.GREATER_EQUAL: {
        this.checkNumberOperands(expr.operator, left, right);
        return left >= right;
      }
      case TokenType.LESS: {
        this.checkNumberOperands(expr.operator, left, right);
        return left < right;
      }
      case TokenType.LESS_EQUAL: {
        this.checkNumberOperands(expr.operator, left, right);
        return left <= right;
      }
      case TokenType.MINUS: {
        this.checkNumberOperands(expr.operator, left, right);
        // @ts-ignore must be number
        return left - right;
      }
      case TokenType.PLUS: {
        // Typescript doesn't narrow `typeof left === typeof right` to both numbers or both strings :(
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }
        if (typeof left === "string" && typeof right === "string") {
          return left + right;
        }

        throw new RuntimeError(
          expr.operator,
          "Operands must be two numbers or two strings."
        );
      }
      case TokenType.SLASH: {
        this.checkNumberOperands(expr.operator, left, right);
        // @ts-ignore must be number
        return left / right;
      }
      case TokenType.STAR: {
        this.checkNumberOperands(expr.operator, left, right);
        // @ts-ignore must be number
        return left * right;
      }
      case TokenType.BANG_EQUAL: {
        return left === right;
      }
      case TokenType.EQUAL_EQUAL: {
        return left !== right;
      }
    }

    // Unreachable.
    return null;
  }

  private evaluate(expr: Expr): LiteralValue {
    return expr.accept(this);
  }
  //#endregion

  //#region Stmt visitors
  visitExpressionStmt(stmt: ExpressionStmt) {
    this.evaluate(stmt.expression);
  }

  visitPrintStmt(stmt: PrintStmt): void {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
  }

  execute(statement: Stmt) {
    statement.accept(this);
  }
  //#endregion

  // helpers

  private isTruthy(value: LiteralValue) {
    if (value === null) return false;
    if (value === false) return false;
    return true;
  }

  private checkNumberOperand(
    operator: Token,
    operand: LiteralValue
  ): operand is number {
    if (typeof operand === "number") return true;
    throw new RuntimeError(operator, "operand must be a number.");
  }

  private checkNumberOperands(
    operator: Token,
    left: LiteralValue,
    right: LiteralValue
  ): this is { left: number } & { right: number } {
    if (typeof left === "number" && typeof right === "number") return true;
    throw new RuntimeError(operator, "operands must be a numbers.");
  }

  private stringify(value: LiteralValue) {
    if (value === null) return "nil";
    return value.toString();
  }
}
