// (function(root, factory) {
//   if (typeof module === 'object' && module.exports) {
//     // Node. Does not work with strict CommonJS, but
//     // only CommonJS-like environments that support module.exports,
//     // like Node.
//     module.exports = factory();
//   } else {
//     // Browser globals (root is window)
//     console.log('add to browser');
//     console.log('root');
//     root.Stream = factory();
//   }
// }(window, function() {
//   return require('./src/module.js');
// }));

window.Stream = require('./src/module.js');
