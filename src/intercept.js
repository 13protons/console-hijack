export default function(method, Util) {
  let key = method.toUpperCase();
  if (Util.has(method)) {
    let native = console[method];
    console[method] = function(...args) {
      if (Util.active(Util[key])) {
        native(args);
        Util.emit(Util[key], {
          type: 'console.' + method,
          messages: args
        });
      }
    }

    return function() { // revert
      console[method] = native;
    }
  }
}
