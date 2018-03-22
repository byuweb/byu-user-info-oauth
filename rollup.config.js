import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';

const input = 'byu-user-info-oauth.js';
const out = 'dist/byu-user-info-oauth';

export default [
   {
    input,
    output: {
        file: `${out}.js`,
        format: 'es',
        sourcemap: true,
    },
},
  {
    input,
    output: {
        file: `${out}.min.js`,
        format: 'es',
        sourcemap: true,
    },
    plugins: [
        uglify(),
    ],
},
    {
    input,
    output: {
        file: `${out}.nomodule.js`,
        format: 'iife',
        name: 'ByuUserInfoOAuth',
        sourcemap: true,
    },
    plugins: [
        buble(),
    ],
},
{
    input,
    output: {
        file: `${out}.nomodule.min.js`,
        format: 'iife',
        name: 'ByuUserInfoOAuth',
        sourcemap: true,
    },
    plugins: [
        buble(),
        uglify(),
    ],
},
];