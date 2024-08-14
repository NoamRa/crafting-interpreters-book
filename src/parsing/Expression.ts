import { Token } from "../scanning/Token.ts";
import { Literal } from "../scanning/types.ts";

export interface ExprVisitor<R> {
  visitBinaryExpr(expr: BinaryExpr): R;
  visitGroupingExpr(expr: GroupingExpr): R;
  visitLiteralExpr(expr: LiteralExpr): R;
  visitUnaryExpr(expr: UnaryExpr): R;
  //   visitVariableExpr(expr: VariableExpr): R;
  //   visitAssignExpr(expr: AssignExpr): R;
  //   visitLogicalExpr(expr: LogicalExpr): R;
  //   visitCallExpr(expr: CallExpr): R;
  //   visitGetExpr(expr: GetExpr): R;
  //   visitSetExpr(expr: SetExpr): R;
  //   visitThisExpr(expr: ThisExpr): R;
  //   visitSuperExpr(expr: SuperExpr): R;
}

export interface Expr {
  accept<R>(visitor: ExprVisitor<R>): R;
}

export class BinaryExpr implements Expr {
  left: Expr;
  operator: Token;
  right: Expr;

  constructor(left: Expr, operator: Token, right: Expr) {
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitBinaryExpr(this);
  }
}

export class GroupingExpr implements Expr {
  expression: Expr;

  constructor(expression: Expr) {
    this.expression = expression;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitGroupingExpr(this);
  }
}

type LiteralValue = true | false | Literal; // TODO expand
export class LiteralExpr implements Expr {
  value: LiteralValue;

  constructor(value: LiteralValue) {
    this.value = value;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitLiteralExpr(this);
  }
}

export class UnaryExpr implements Expr {
  operator: Token;
  right: Expr;

  constructor(operator: Token, right: Expr) {
    this.operator = operator;
    this.right = right;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitUnaryExpr(this);
  }
}
