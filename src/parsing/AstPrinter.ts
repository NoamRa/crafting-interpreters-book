import { BinaryExpr, Expr, GroupingExpr, LiteralExpr } from "./Expression.ts";

export class AstPrinter {
  print(expr: Expr): string {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: BinaryExpr): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitGroupingExpr(expr: GroupingExpr): string {
    return this.parenthesize("group", expr.expression);
  }

  visitLiteralExpr(expr: LiteralExpr): string {
    if (expr.value === null || expr.value === undefined) return "nil";
    return expr.value.toString();
  }

  visitUnaryExpr(expr: BinaryExpr): string {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  private parenthesize(name: string, ...exprs: Expr[]) {
    const exprValues = exprs.map((expr) => expr.accept(this));
    return `(${name} ${exprValues.join(" ")})`;
  }
}
