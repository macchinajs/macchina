import copy from 'rollup-plugin-copy'
import del from 'rollup-plugin-delete'
import execute from 'rollup-plugin-execute'
import replace from '@rollup/plugin-replace';


/** @type {import('rollup').RollupOptions} */
const config = {
  input: "server.js",
  output: {
    dir: "./.dist",
    format: "esm",
    plugins: [
      execute([
        // Copy index.html from src to public if index.html is not modified
        'cd .dist; npm i --production; node-prune'
      ]),
      // replace({
      //   "aws-sdk/clients/s3.js": "/var/runtime/node_modules/aws-sdk/clients/s3.js"
      // })
    ]
  },
  // treeshake: {
  //   moduleSideEffects: "no-external",
  // },
  plugins: [
    del({targets: '.dist/*'}),
    copy(
      {
        targets: [
          { src: './package.json', dest: '.dist' },
          { src: './.env.prod', dest: '.dist', rename: '.env' }
        ]
      }
    ),
    // nodeResolve({ modulesOnly: true, preferBuiltins: true, exportConditions: ["node"] }),
    // babel({
    //   babelHelpers: 'bundled',
    //   exclude: 'node_modules/**',
    // }),
    // json(),
  ],
};

export default config;
