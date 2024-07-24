# crafting-interpreters-book

Lox implementation, following the book [Crafting Interpreters](https://craftinginterpreters.com/) by Robert Nystrom

## Tasks

### Develop (watch mode)

```sh
deno task dev
```

### Run (once)

```sh
deno task run
```

### Compile to `.build` folder

```sh
deno task compile
```

## Modes

Lox has two modes: REPL and source. `deno task dev` will start REPL mode, and `deno task dev ./examples/01_language.lox` will read path from source.
