# Crafting Interpreters

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

### Compile (to `.build/lox`)

```sh
deno task compile
```

## Modes

Lox has two modes: REPL and source.
* REPL - `deno task dev` will start REPL mode
* SOURCE - `deno task dev ./examples/01_language.lox` will read path from source
