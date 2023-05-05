import commonjs from '@rollup/plugin-commonjs';
//import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import hashbang from 'rollup-plugin-hashbang';
import pkg from './package.json' assert { type: 'json' };
import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'src/main.ts',
    output: {
      format: 'es',
      dir: 'build',
      entryFileNames: '[name].js',
      sourcemap: true,
      exports: 'auto',
    },
    plugins: [
      hashbang.default(),
      typescript(),
      json(),
      commonjs(),
      //nodeResolve(),
      terser(),
    ],
    external: pkg.dependencies,
  },
];
