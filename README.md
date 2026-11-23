***SNAKE IT***

To run the game simply open `src/client/index.html` in the browser.

## Development

The client is written in TypeScript (`src/client/ts`) and bundled with esbuild into `src/client/dist/main.js`.

Run these from `src/client`:

```sh
npm install
npm run build      # bundle to src/client/dist/main.js
npm run watch      # rebuild on change
npm run typecheck  # tsc --noEmit (strict)
```

Enjoy!
