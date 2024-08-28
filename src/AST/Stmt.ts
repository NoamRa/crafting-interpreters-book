import { Expr } from "./Expression.ts";

export interface StmtVisitor<R> {
  //   visitBlockStmt(stmt: Block): R;
  //   visitClassStmt(stmt: Class): R;
  visitExpressionStmt(stmt: ExpressionStmt): R;
  //   visitFunctionStmt(stmt: Function): R;
  //   visitIfStmt(stmt: If): R;
  visitPrintStmt(stmt: PrintStmt): R;
  //   visitReturnStmt(stmt: Return): R;
  //   visitVarStmt(stmt: Var): R;
  //   visitWhileStmt(stmt: While): R;
}

export interface Stmt {
  accept<R>(visitor: StmtVisitor<R>): R;
}

export class ExpressionStmt implements Stmt {
  expression: Expr;

  constructor(expression: Expr) {
    this.expression = expression;
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitExpressionStmt(this);
  }
}

export class PrintStmt implements Stmt {
  expression: Expr;

  constructor(expression: Expr) {
    this.expression = expression;
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitPrintStmt(this);
  }
}
