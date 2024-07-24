class Lox {
  static main(): void {
    if (Deno.args.length >= 2) {
      console.error("Usage: lox [script]");
      Deno.exit(64);
    } else if (Deno.args.length == 1) {
      Lox.runFile(Deno.args[0]);
    } else {
      Lox.runPrompt();
    }
  }

  private static async runFile(path: string) {
    await Deno.readTextFile(path).then(Lox.run).catch(console.error);
  }

  private static async runPrompt() {
    console.log("> Lox REPL >>");
    const decoder = new TextDecoder();
    for await (const chunk of Deno.stdin.readable) {
      Lox.run(decoder.decode(chunk));
    }
  }

  private static run(source: string) {
    console.log("Code is:", source);
  }
}

Lox.main();
