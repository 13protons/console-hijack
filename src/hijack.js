let methodsToHijack = ['log', 'info', 'warn', 'error'];
intercept(methodsToHijack, console, 'console');
let isBrowser = window && document;
let eventEmitter;

if (!isBrowser) {
  let events = require('events');
  eventEmitter = new events.EventEmitter();
}

function intercept(methods, target, targetName) {
  const levelOrder = ['any'].concat(methods);
  let level = 0;

  methods.forEach(function(method) {
    let isActive = true;
    let native = target[method];
    let lastCalledWith = null;
    let duplicateCalls = 0;
    let name = targetName + '.' + method;

    let replacement = function(...args) {
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
  if (isBrowser) {
    // browser
    let event = new CustomEvent(name, {
      detail: payload
    });
    document.dispatchEvent(event);
  } else {
    // node
    eventEmitter.emit(name, payload)
  }
}
