import { Token } from "../scanning/Token.ts";
import { Expr } from "./Expression.ts";

export interface StmtVisitor<R> {
  visitBlockStmt(stmt: BlockStmt): R;
  //   visitClassStmt(stmt: ClassStmt): R;
  visitExpressionStmt(stmt: ExpressionStmt): R;
  //   visitFunctionStmt(stmt: FunctionStmt): R;
  visitIfStmt(stmt: IfStmt): R;
  visitPrintStmt(stmt: PrintStmt): R;
  //   visitReturnStmt(stmt: ReturnStmt): R;
  visitVariableStmt(stmt: VariableStmt): R;
  //   visitWhileStmt(stmt: WhileStmt): R;
}

export interface Stmt {
  accept<R>(visitor: StmtVisitor<R>): R;
}

export class BlockStmt implements Stmt {
  statements: Stmt[];

  constructor(statements: Stmt[]) {
    this.statements = statements;
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitBlockStmt(this);
  }
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

export class IfStmt implements Stmt {
  condition: Expr;
  thenBranch: Stmt;
  elseBranch: Stmt | null;
  
  constructor(condition: Expr, thenBranch: Stmt, elseBranch: Stmt | null) {
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitIfStmt(this);
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

export class VariableStmt implements Stmt {
  name: Token;
  initializer: Expr;

  constructor(name: Token, initializer: Expr) {
    this.name = name;
    this.initializer = initializer;
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitVariableStmt(this);
  }
}
