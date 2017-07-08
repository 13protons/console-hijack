(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.Stream = factory();
  }
}(this, function() {
  return {
    interfaces: require('./src/module.js')
  };
}));
