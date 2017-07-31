import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';

let config = {
  entry: 'src/hijack.js',
  format: 'iife',
  dest: 'dist/console-hijack.js', // equivalent to --output
  plugins: [ buble() ],
  moduleName: 'consoleHijack'
};

if (process.env.PROD) {
  config.dest = 'dist/console-hijack.min.js';
  config.plugins.push( uglify() );
}

export default config;
