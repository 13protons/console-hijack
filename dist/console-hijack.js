(function () {
'use strict';

var methodsToHijack = ['log', 'info', 'warn', 'error', 'trace'];
intercept(methodsToHijack, 'console');

function intercept(methods, targetName) {
  var levelOrder = ['any'].concat(methods);
  var level = 0;
  var target = window[targetName];

  methods.forEach(function(method) {
    var native = target[method];
    var lastCalledWith = null;
    var duplicateCalls = 0;
    var name = targetName + '.' + method;

    var replacement = function() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      // native('name', name, 'lastCalledWith', lastCalledWith, 'nowCalledWith', args, 'duplicateCalls', 'isDuplicate?', args == lastCalledWith, duplicateCalls, 'level', level, 'is', levelOrder.indexOf(method));

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
      target[method] = native;
    };
    target[method] = replacement;
  });

  target.LOG_LEVELS ={};
  levelOrder.forEach(function(item) {
    target.LOG_LEVELS[item.toUpperCase()] = item;
  });

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
  var event = new CustomEvent(name, {
    detail: payload
  });
  document.dispatchEvent(event);
}

}());
