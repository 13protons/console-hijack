let methodsToHijack = ['log', 'info', 'warn', 'error', 'trace'];
intercept(methodsToHijack, 'console');

function intercept(methods, targetName) {
  const levelOrder = ['any'].concat(methods);
  let level = 0;
  let target = window[targetName];

  methods.forEach(function(method) {
    let native = target[method];
    let lastCalledWith = null;
    let duplicateCalls = 0;
    let name = targetName + '.' + method;


    let replacement = function(...args) {
      native('name', name, 'lastCalledWith', lastCalledWith, 'duplicateCalls', duplicateCalls, 'level', level, 'is', levelOrder.indexOf(method));

      if (levelOrder.indexOf(method) >= level) {
        if (args == lastCalledWith) {
          duplicateCalls++
        } else {
          duplicateCalls = 0;
        }
        lastCalledWith = args;
        if (duplicateCalls < 10) {
          native(args);
          emit(name, {
            type: name,
            messages: args
          });
        } else {
          throw new Error('Infinte recursion detected for ', name);
        }
      }
    }
    replacement.native = native;
    replacement.restore = function() {
      target[method] = native;
    }
    target[method] = replacement;
  });

  target.LOG_LEVELS ={}
  methods.forEach(function(item) {
    target.LOG_LEVELS[item.toUpperCase()] = item;
  })

  Object.defineProperty(target, 'LOG_LEVEL', {
    get: function() { return levelOrder[level]; },
    set: function(newValue) {
      let toFind = newValue.toString().toLowerCase();
      let index = levelOrder.indexOf(toFind);
      if (index > -1) {
        level = index;
      }
    },
    enumerable: true,
    configurable: true
  });
}

function emit(name, payload) {
  // let precedence = levelOrder.indexOf(name);
  // if (precedence === -1 || precedence < levelOrder.indexOf(logLevel)) {
  //   return
  // }
  let event = new CustomEvent(name, {
    detail: payload
  });
  document.dispatchEvent(event);
}
