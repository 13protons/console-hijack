import buble from 'rollup-plugin-buble';
// import uglify from 'rollup-plugin-uglify';

export default {
  entry: 'src/native.js',
  format: 'iife',
  dest: 'dist/console-hijack.js', // equivalent to --output
  plugins: [ buble()/*, uglify()*/ ],
  moduleName: 'consoleHijack'
};
