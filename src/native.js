let methodsToHijack = ['log', 'info', 'warn', 'error'];
intercept(methodsToHijack, 'console');

function intercept(methods, targetName) {
  const levelOrder = ['any'].concat(methods);
  let level = 0;
  let target = window[targetName];

  methods.forEach(function(method) {
    let isActive = true;
    let native = target[method];
    let lastCalledWith = null;
    let duplicateCalls = 0;
    let name = targetName + '.' + method;

    let replacement = function(...args) {
      // native('name', name, 'lastCalledWith', lastCalledWith, 'nowCalledWith', args, 'duplicateCalls', 'isDuplicate?', args == lastCalledWith, duplicateCalls, 'level', level, 'is', levelOrder.indexOf(method));
      if (!isActive) {
        native(args);
        return;
      }

      if (levelOrder.indexOf(method) >= level) {
        if (JSON.stringify(args) == JSON.stringify(lastCalledWith)) {
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
      isActive = false;
    }
    replacement.hijack = function() {
      isActive = true;
    }
    target[method] = replacement;
  });

  target.LOG_LEVELS ={}
  levelOrder.forEach(function(item) {
    target.LOG_LEVELS[item.toUpperCase()] = item;
  })

  target.restoreAll = function() {
    methods.forEach(function(method) {
      target[method].restore();
    })
  }

  target.hijackAll = function() {
    methods.forEach(function(method) {
      target[method].hijack();
    })
  }

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
  let event = new CustomEvent(name, {
    detail: payload
  });
  document.dispatchEvent(event);
}
