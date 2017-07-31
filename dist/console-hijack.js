(function () {
'use strict';

var methodsToHijack = ['log', 'info', 'warn', 'error'];
intercept(methodsToHijack, console, 'console');
var isBrowser = window && document;
var eventEmitter;

if (!isBrowser) {
  var events = require('events');
  eventEmitter = new events.EventEmitter();
}

function intercept(methods, target, targetName) {
  var levelOrder = ['any'].concat(methods);
  var level = 0;

  methods.forEach(function(method) {
    var isActive = true;
    var native = target[method];
    var lastCalledWith = null;
    var duplicateCalls = 0;
    var name = targetName + '.' + method;

    var replacement = function() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      if (!isActive) {
        native(args);
        return;
      }

      if (levelOrder.indexOf(method) >= level) {
        if (JSON.stringify(args) == JSON.stringify(lastCalledWith)) {
          duplicateCalls++;
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
    };
    replacement.native = native;
    replacement.restore = function() {
      isActive = false;
    };
    replacement.hijack = function() {
      isActive = true;
    };
    target[method] = replacement;
  });

  target.LOG_LEVELS ={};
  levelOrder.forEach(function(item) {
    target.LOG_LEVELS[item.toUpperCase()] = item;
  });

  target.restoreAll = function() {
    methods.forEach(function(method) {
      target[method].restore();
    });
  };

  target.hijackAll = function() {
    methods.forEach(function(method) {
      target[method].hijack();
    });
  };

  Object.defineProperty(target, 'LOG_LEVEL', {
    get: function() { return levelOrder[level]; },
    set: function(newValue) {
      var toFind = newValue.toString().toLowerCase();
      var index = levelOrder.indexOf(toFind);
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
    var event = new CustomEvent(name, {
      detail: payload
    });
    document.dispatchEvent(event);
  } else {
    // node
    eventEmitter.emit(name, payload);
  }
}

}());
