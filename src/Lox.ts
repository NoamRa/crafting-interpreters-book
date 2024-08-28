import { RuntimeError } from "./Errors/RuntimeError.ts";
import { AstPrinter } from "./AST/AstPrinter.ts";
import { Interpreter } from "./parsing/Interpreter.ts";
import { Parser } from "./parsing/Parser.ts";
import { Scanner } from "./scanning/Scanner.ts";
import { Token } from "./scanning/Token.ts";
import { TokenType } from "./scanning/TokenType.ts";

export class Lox {
  static hadError: boolean = false;
  static hadRuntimeError: boolean = false;
  private static interpreter = new Interpreter();

  constructor() {
    if (Deno.args.length >= 2) {
      console.error("Error: too many CLI arguments");
      console.log("Usage: lox [path_to_script] or lox for REPL mode");
      Deno.exit(64);
    } else if (Deno.args.length == 1) {
      Lox.runFile(Deno.args[0]);
    } else {
      Lox.runPrompt();
    }
  }

  private static async runFile(path: string) {
    const source = await Deno.readTextFile(path);

    Lox.run(source.trimEnd() + "\n");
    if (this.hadError) Deno.exit(65);
    if (this.hadRuntimeError) Deno.exit(70);
  }

  private static async runPrompt() {
    console.log(">> Lox REPL >");
    const decoder = new TextDecoder();
    for await (const chunk of Deno.stdin.readable) {
      Lox.run(decoder.decode(chunk));
      this.hadError = false;
    }
  }

  private static run(source: string) {
    // Print source
    // console.debug("----- Source ---");
    // console.debug(source.trim());
    // console.debug("----- EOF ------");
    // console.debug("");

    const tokens = new Scanner(source).scanTokens();

    // Print the tokens
    // tokens.forEach((token: Token) => {
    //   console.debug(token);
    // });

    const statements = new Parser(tokens).parse();

    if (this.hadError || !statements || statements.length === 0) return;

    // console.debug("----- Result ----");
    this.interpreter.interpret(statements);

    // Done
    // console.debug("----- Done -----");
    // console.debug("");
  }

  static lineError(line: number, message: string) {
    Lox.report(line, "", message);
  }

  private static report(line: number, where: string, message: string) {
    console.error(`[line ${line}] Error ${where}: ${message}`);
    this.hadError = true;
  }

  static tokenError(token: Token, message: string) {
    if (token.type === TokenType.EOF) {
      Lox.report(token.line, " at end", message);
    } else {
      Lox.report(token.line, ` at '${token.lexeme}'`, message);
    }
  }

  static runtimeError(error: RuntimeError) {
    this.hadRuntimeError = true;
    console.error(error.message);
    console.error(`[line ${error.token.line}]`);
  }
}

new Lox();
