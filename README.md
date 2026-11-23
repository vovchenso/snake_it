***SNAKE IT***

Requires Node.js (client build) and Go ≥ 1.23 (multiplayer server).

## Quick start

```sh
make run
```

This installs the client dependencies, builds the client and starts the server. Open `http://localhost:8080`, then pick **Single** or **Multiplayer**.

## Single player

Build the client once (`make build`), then open `client/index.html` in the browser and pick **Single**. No server needed.

## Multiplayer (2 players)

Start the server with `make run`. Both players open `http://<server-host>:8080` and pick **Multiplayer**. On the machine running the server you can also use `http://localhost:8080` or open `client/index.html` directly.

The game starts when the second player joins. Snakes pass through each other; each snake speeds up only when it eats. A third player gets "Game is full".

Server flags (pass them with `make run ARGS="..."`):

- `-addr` — listen address (default `:8080`)
- `-static` — directory with the client files (default `../client`)

## Make targets

| Target | What it does |
|--------|--------------|
| `make build` | install client dependencies and bundle `client/src` into `client/dist/main.js` |
| `make run` | build, then start the server on `:8080` |
| `make test` | client typecheck, then server `go vet` and `go test` |
| `make typecheck` | strict TypeScript check of the client |
| `make clean` | remove `client/dist` |

## Client development

The client is written in TypeScript (`client/src`) and bundled with esbuild into `client/dist/main.js` (git-ignored, so build after cloning and after every change). For a rebuild on every save, run `npm run watch` in `client`.

Enjoy!
