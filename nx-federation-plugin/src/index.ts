import { join } from 'path';
import { readFileSync } from 'fs';
import federation from '@originjs/vite-plugin-federation'
import { workspaceRoot, readCachedProjectGraph } from '@nx/devkit';
import { readFileMapCache } from 'nx/src/project-graph/nx-deps-cache';
import { findNpmDependencies } from '@nx/js/src/utils/find-npm-dependencies';
// We shouldn't be using @nx/webpack, consider inlining the mapRemotes function here.
import {
  mapRemotes,
} from '@nx/webpack/src/utils/module-federation';

export interface Configuration {
  name: string;
  remotes?: string[];
  exposes?: Record<string, string>;
}

export function nxFederation(options: Configuration) {
  // These graphs are guaranteed to exist as long as we run from Nx CLI.
  const fileGraph = readFileMapCache()!.fileMap.projectFileMap;
  const projectGraph = readCachedProjectGraph();

  const shared = findNpmDependencies(workspaceRoot, projectGraph.nodes[options.name], projectGraph, fileGraph, 'build', {
    ignoredFiles: ['{projectRoot}/vite.config.ts']
  });

  const remotes = options.remotes ? mapRemotes(
    options.remotes,
    'js', 
    function determineRemoteUrl(remote: string) {
      if (remote.startsWith('http')) return remote;
      const projectNode = projectGraph.nodes[remote];
      // This is not super clean, but import() or Vite's loadConfigFromFile() are async so we cannot use them.
      if (projectNode) {
        const viteConfig = readFileSync(join(workspaceRoot, projectNode.data.root, 'vite.config.ts')).toString();
        const port = viteConfig.match(/port:\s+(\d+)/)?.[1];
        if (port) {
          return `http://localhost:${port}/assets/remoteEntry.js`;
        }
      }
      throw new Error(`Could not find port for remote: ${remote}`);
    }
  ) : {};

  return federation({
    ...options,
    remotes,
    shared: Object.keys(shared),
  })
}

