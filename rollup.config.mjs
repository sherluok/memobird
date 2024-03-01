import commonjsPlugin from '@rollup/plugin-commonjs';
import nodeResolvePlugin from '@rollup/plugin-node-resolve';
import terserPlugin from '@rollup/plugin-terser';
import typescriptPlugin from '@rollup/plugin-typescript';
import { rm } from 'fs/promises';
import packageJson from './package.json' with { type: 'json' };

export default {
  input: 'src/index.ts',
  output: [{
    file: 'dist/index.cjs',
    sourcemap: true,
    exports: 'default',
    format: 'cjs',
  }, {
    file: 'dist/index.mjs',
    sourcemap: true,
    format: 'es',
  }],
  external: [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
  ],
  plugins:[
    commonjsPlugin(),
    nodeResolvePlugin(),
    typescriptPlugin(),
    terserPlugin(),
    {
      name: 'publish-config-plugin',
      async buildStart() {
        if (!this.meta.watchMode) {
          await rm(new URL('./dist', import.meta.url), {
            force: true,
            recursive: true,
          });
        }
      },
      async buildEnd() {
        const { ...pkg } = packageJson;
        delete pkg.scripts;
        delete pkg.devDependencies;
        delete pkg.publishConfig.directory;
        pkg.main = 'index.cjs';
        pkg.module = 'index.mjs';
        pkg.types = 'index.d.ts';
        this.emitFile({
          type: 'asset',
          fileName: 'package.json',
          source: JSON.stringify(pkg, null, 2),
        });
      },
    }
  ],
};
