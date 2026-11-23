***SNAKE IT***

## Build the client first

The bundle (`src/client/dist/main.js`) isn't committed, so build it once after cloning (requires Node.js):

```sh
cd src/client
npm install
npm run build
```

Rebuild after changing anything in `src/client/ts`.

## Single player

Open `src/client/index.html` in the browser and pick **Single**. No server needed.

## Multiplayer (2 players)

Requires Go ≥ 1.23.

```sh
cd src/server
go run .
```

Both players open `http://<server-host>:8080` and pick **Multiplayer**. On the machine running the server you can also use `http://localhost:8080` or open `src/client/index.html` directly.

The game starts when the second player joins. Snakes pass through each other; each snake speeds up only when it eats. A third player gets "Game is full".

Server flags:

- `-addr` — listen address (default `:8080`)
- `-static` — directory with the client files (default `../client`)

Server tests: `cd src/server && go test ./...`

## Client development

The client is written in TypeScript (`src/client/ts`) and bundled with esbuild into `src/client/dist/main.js` (git-ignored).

Run these from `src/client`:

```sh
npm install
npm run build      # bundle to src/client/dist/main.js
npm run watch      # rebuild on change
npm run typecheck  # tsc --noEmit (strict)
```

Enjoy!
