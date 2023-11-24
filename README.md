# React + Vite + Module Federation

This is an example of using Nx's project and file graphs to make configuring module federation easier.

The goals are:

1. Start host and remotes in a single command.
2. Reduce boilerplate in `vite.config.ts` by using what Nx understands about our files and projects.

For (2), the configuration shouldn't need to provide `shared` for example, since Nx already knows what dependencies are being used by all the projects.

```ts
// ..
import { nxFederation } from '../nx-federation-plugin';
export default defineConfig({
  plugins: [
    react(),
    nxFederation({
      name: 'host',
      // no need to define full URL to remoteEntry.js since Nx can find the project by name and read the host+port.
      remotes: ['remote'] 
      // shared is missing but Nx will fill it in as ['react', 'react-dom', ...] 
    }),
    nxViteTsPaths()
  ],
  // ...
});
```

Since there isn't an official module federation plugin, we're using the `@originjs/vite-plugin-federation`. This is the most widely used solution, and the most stable.

Try it yourself!

```
npx nx run-many -t=serve --projects=host,remote
```

The above command will start the host at http://localhost:3000, and the remote at http://localhost:3001. The host app uses `react-router-dom` to provide the home (`/`) and remote (`/remote`) routes. Navigating to `/remote` will load the federated remote app.

## What's included

The following is a quick explanation of the files in this repo. Check out the `host/vite.config.ts` and `remote/vite.config.ts` to see how `nxFederation` is used.

```treeview
.
|-- host <- the host app that uses react-router-dom
|   |-- src
|   |   |-- app
|   |   |   |-- app.module.css
|   |   |   `-- app.tsx <- app component
|   |   |-- assets
|   |   |-- main.tsx    <- main entry
|   |   `-- styles.css
|   |-- ...
|   `-- vite.config.ts <- uses custom nxFederation plugin
|-- nx-federation-plugin <- this is a wrapper around nx and @originjs/vite-plugin-federation
|   |-- src
|   |   `-- index.ts     <- implementation
|   |-- ...
|   `-- tsconfig.spec.json
|-- remote <- the remote app that exposes `remote/Module` as a page component
|   |-- src
|   |   |-- app
|   |   |   |-- app.module.css
|   |   |   `-- app.tsx
|   |   |-- assets
|   |   |-- main.tsx
|   |   |-- remote-entry.ts <- what `remote/Module` points to
|   |   `-- styles.css
|   |-- ...
|   `-- vite.config.ts <- uses custom nxFederation plugin
|-- ...
`-- tsconfig.base.json
```

## Benefits

- Nx can automatically pick up shared dependencies so `shared` does not need to be define manually.
- Nx understands the projects in the repo, so we can link to a remote by name rather than manually configuring the full URL to `remoteEntry.js`.
- Nx task orchestration makes serving and build easier. Since remote has to run in preview mode (see painpoints), we can easily wire up `build --watch` at the same time.

**Note:** You can easily do away with `nx-federation-plugin` and manually configure `@originjs/vite-plugin-federation` by hand. You will some of the benefits of using Nx, but the tasks defined in `project.json` files are still useful.

## Painpoints

- No Nx plugin to support Vite module federation, so we have to roll our own.
- One of the utils used is from `@nx/webpack`, which isn't ideal. Maybe it should be inlined here.
- Remotes do not generate `remoteEntry.js` unless running in preview mode. This is a [known issue](https://github.com/originjs/vite-plugin-federation/issues/204)
- Cannot import our plugin as `@acme/nx-federation-plugin` since `vite.config.ts` does not understand tsconfig paths.


