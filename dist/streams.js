/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

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

window.Stream = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  writeable: __webpack_require__(2)
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

// reimplement some features of node steams for the browser
var log = __webpack_require__(3);
log.setDefaultLevel(log.levels.SILENT);

module.exports = function(options, cb) {
  return new WriteableStream(options, cb);
}

function WriteableStream(options, writeCallback) {
  var callback = writeCallback;
  if (typeof(options) === 'function') {
    callback = options;
  }

  if (typeof(callback) !== 'function') {
    console.error('must supply write callback');
    return;
  }
  // The amount of data potentially buffered depends on the highWaterMark option passed into the streams constructor. For normal streams, the highWaterMark option specifies a total number of bytes.For streams operating in object mode, the highWaterMark specifies a total number of objects.
  var Buffer = [];
  var events = {};
  var state = new WriteableState(options);

  return {
    write: write,
    push: write,
    cork: cork,
    uncork: uncork,
    end: end,
    on: register,
    once: registerOnce,
    _loglevel: setLogLevel,
    _writableState: state
  }

  function setLogLevel(level) {
    log.setLevel(level, false);
  }

  function flush() {
    log.info('WRITEABLE - flushing buffer');
    var writeResult;
    if (Buffer.length === 0) {
      return;
    }
    var localBuffer = Buffer;

    try {
      writeResult = callback(localBuffer);
    } catch(err) {
      announce('error', err);
    }

    if (!state.hasCapacity) {
      log.info('WRITEABLE - buffer was previously over capacity');
      next(writeResult, function done(msg) {
        announce('drain', msg);
        state.hasCapacity = true;
      });
    }

    if (state.corked && state.hasCapacity) {
      log.info('WRITEABLE - buffer was corked');
      next(writeResult, function(msg) {
        console.log
        announce('drain', msg);
      });
    }

    Buffer = [];
    return writeResult;

    function next(result, done) {
      if (result && typeof(result.then) === 'function') {
        log.info('WRITEABLE - init callback was a promise');
        // treat as promise
        result.then(done).catch(function(err){
          announce('error', err);
        })
      } else {
        done();
      }
    }
  }

  function cork() {
    log.info('WRITEABLE - corking stream');
    state.corked = true;
  }

  function uncork() {
    log.info('WRITEABLE - uncorking stream');
    if (state.corked && state.getBuffer().length > 0) {
      flush();
    }
    state.corked = false;
  }

  function end(data, cb) {
    log.info('WRITEABLE - ending stream. No more write pssible');
    if (typeof(data) === 'function') {
      cb = data;
    } else if (data) {
      write(data);
    }
    if (typeof(cb) === 'function') {
      register('finish', cb);
    }
    state.finished = true;
    setTimeout(function(){
      flush();
      announce('finish')
    })
  }

  function register(eventName, cb) {
    log.info('WRITEABLE - registering callback for event', eventName);
    events[eventName] = {
      once: false,
      callback: cb
    }
  }

  function registerOnce(eventName, cb) {
    log.info('WRITEABLE - registering one time callback for event', eventName);
    events[eventName] = {
      once: true,
      callback: cb
    }
  }

  function write(obj) {
    log.info('WRITEABLE - write object to stream', obj);
    if (state.finished) {
      throw new Error('Stream has ended - writes are no longer allowed!');
      return;
    }
    // Data is buffered in Readable streams when the implementation calls stream.push(chunk).If the consumer of the Stream does not call stream.read(), the data will sit in the internal queue until it is consumed.

    // Data is buffered in Writable streams when the writable.write(chunk) method is called repeatedly. While the total size of the internal write buffer is below the threshold set by highWaterMark, calls to writable.write() will return true.Once the size of the internal buffer reaches or exceeds the highWaterMark, false will be returned.
    Buffer.push(obj);
    if (!state.corked) {
      setTimeout(flush)
    }
    state.hasCapacity = Buffer.length <= state.highWaterMark;
    return state.hasCapacity;
  }

  function WriteableState(options) {
    log.info('WRITEABLE - initializing stream');
    options = typeof(options) === 'function' ? {} : options;
    var defaults = {
      objectMode: true, // always true. Changes will be ignored
      highWaterMark: 100 // objects to buffer
    }
    var params = Object.assign(defaults, options);

    var isCorked = false;
    var hasCapacity = true;
    var hasEnded = false;
    return {
      get finished() {
        return hasEnded;
      },
      set finished(val) {
        // no turning back!
        hasEnded = true
      },
      get corked() {
        return isCorked;
      },
      set corked(val) {
        if (val && isCorked === false) {
          isCorked = true;
        }
        if (!val) {
          isCorked = false;
        }
      },
      get highWaterMark() {
        return params.highWaterMark;
      },
      get hasCapacity() {
        return hasCapacity;
      },
      set hasCapacity(val) {
        if (val && hasCapacity === false) {
          hasCapacity = true;
        }
        if (!val) {
          hasCapacity = false;
        }
      },
      getBuffer: function () {
        return Buffer;
      }
    }
  }

  function announce(name, data) {
    log.info('WRITEABLE - event triggered', name, data);
    if (events[name] && typeof(events[name].callback) === 'function') {
      if (name === 'error') {
        console.error(data);
      }
      events[name].callback(data);
      if (events[name].once) {
        delete events[name];
      }
    }
  }
}


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/
(function (root, definition) {
    "use strict";
    if (true) {
        !(__WEBPACK_AMD_DEFINE_FACTORY__ = (definition),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else if (typeof module === 'object' && module.exports) {
        module.exports = definition();
    } else {
        root.log = definition();
    }
}(this, function () {
    "use strict";
    var noop = function() {};
    var undefinedType = "undefined";

    function realMethod(methodName) {
        if (typeof console === undefinedType) {
            return false; // We can't build a real method without a console to log to
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj);
        } else {
            try {
                return Function.prototype.bind.call(method, obj);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function() {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    // these private functions always need `this` to be set properly

    function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
        return function () {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods.call(this, level, loggerName);
                this[methodName].apply(this, arguments);
            }
        };
    }

    function replaceLoggingMethods(level, loggerName) {
        var this$1 = this;

        /*jshint validthis:true */
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this$1[methodName] = (i < level) ?
                noop :
                this$1.methodFactory(methodName, level, loggerName);
        }
    }

    function defaultMethodFactory(methodName, level, loggerName) {
        /*jshint validthis:true */
        return realMethod(methodName) ||
               enableLoggingWhenConsoleArrives.apply(this, arguments);
    }

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    function Logger(name, defaultLevel, factory) {
      var self = this;
      var currentLevel;
      var storageKey = "loglevel";
      if (name) {
        storageKey += ":" + name;
      }

      function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

          // Use localStorage if available
          try {
              window.localStorage[storageKey] = levelName;
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {}
      }

      function getPersistedLevel() {
          var storedLevel;

          try {
              storedLevel = window.localStorage[storageKey];
          } catch (ignore) {}

          if (typeof storedLevel === undefinedType) {
              try {
                  var cookie = window.document.cookie;
                  var location = cookie.indexOf(
                      encodeURIComponent(storageKey) + "=");
                  if (location) {
                      storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                  }
              } catch (ignore) {}
          }

          // If the stored level is not valid, treat it as if nothing was stored.
          if (self.levels[storedLevel] === undefined) {
              storedLevel = undefined;
          }

          return storedLevel;
      }

      /*
       *
       * Public API
       *
       */

      self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
          "ERROR": 4, "SILENT": 5};

      self.methodFactory = factory || defaultMethodFactory;

      self.getLevel = function () {
          return currentLevel;
      };

      self.setLevel = function (level, persist) {
          if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
              level = self.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
              currentLevel = level;
              if (persist !== false) {  // defaults to true
                  persistLevelIfPossible(level);
              }
              replaceLoggingMethods.call(self, level, name);
              if (typeof console === undefinedType && level < self.levels.SILENT) {
                  return "No console available for logging";
              }
          } else {
              throw "log.setLevel() called with invalid level: " + level;
          }
      };

      self.setDefaultLevel = function (level) {
          if (!getPersistedLevel()) {
              self.setLevel(level, false);
          }
      };

      self.enableAll = function(persist) {
          self.setLevel(self.levels.TRACE, persist);
      };

      self.disableAll = function(persist) {
          self.setLevel(self.levels.SILENT, persist);
      };

      // Initialize with the right level
      var initialLevel = getPersistedLevel();
      if (initialLevel == null) {
          initialLevel = defaultLevel == null ? "WARN" : defaultLevel;
      }
      self.setLevel(initialLevel, false);
    }

    /*
     *
     * Package-level API
     *
     */

    var defaultLogger = new Logger();

    var _loggersByName = {};
    defaultLogger.getLogger = function getLogger(name) {
        if (typeof name !== "string" || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }

        var logger = _loggersByName[name];
        if (!logger) {
          logger = _loggersByName[name] = new Logger(
            name, defaultLogger.getLevel(), defaultLogger.methodFactory);
        }
        return logger;
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    return defaultLogger;
}));


/***/ })
/******/ ]);
//# sourceMappingURL=streams.js.map