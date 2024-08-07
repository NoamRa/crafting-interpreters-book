import { AstPrinter } from "./parsing/AstPrinter.ts";
import { Parser } from "./parsing/Parser.ts";
import { Scanner } from "./scanning/Scanner.ts";
import { Token } from "./scanning/Token.ts";
import { TokenType } from "./scanning/TokenType.ts";

export class Lox {
  static hadError: boolean = false;

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

    Lox.run(source.trimEnd());
    if (this.hadError) Deno.exit(65);
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
    console.log("----- Source ---");
    console.log(source.trim());
    console.log("----- EOF ------");
    console.log("");

    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();

    // Print the tokens
    // tokens.forEach((token: Token) => {
    //   console.log(token);
    // });

    const parser = new Parser(tokens);
    const expression = parser.parse();

    if (this.hadError) return;

    console.log(new AstPrinter().print(expression!));
    
    // Done
    console.log("----- Done -----");
    console.log("");
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
}

new Lox();
