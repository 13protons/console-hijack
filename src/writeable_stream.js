// reimplement some features of node steams for the browser
let log = require('loglevel').getLogger('writeable');
log.setDefaultLevel(log.levels.SILENT);

module.exports = function(options, cb) {
  return new WriteableStream(options, cb);
}

function WriteableStream(options, writeCallback) {
  let callback = writeCallback;
  if (typeof(options) === 'function') {
    callback = options;
  }

  if (typeof(callback) !== 'function') {
    console.error('must supply write callback');
    return;
  }
  // The amount of data potentially buffered depends on the highWaterMark option passed into the streams constructor. For normal streams, the highWaterMark option specifies a total number of bytes.For streams operating in object mode, the highWaterMark specifies a total number of objects.
  let Buffer = [];
  let events = {};
  let state = new WriteableState(options);

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
    if (Buffer.length === 0 || state.isFlushing) {
      return;
    }
    log.info('WRITEABLE - flushing buffer');

    state.isFlushing = true;
    let writeResult;

    try {
      writeResult = callback(Buffer);
    } catch(err) {
      announce('error', err);
    }

    if (!state.hasCapacity) {
      log.info('WRITEABLE - buffer was previously over capacity');
      drain();
    } else if (state.corked) {
      log.info('WRITEABLE - buffer was corked');
      state.corked = false;
      drain();
    } else {
      next(writeResult, function(){
        Buffer = [];
        state.isFlushing = false;
      })
    }

    return writeResult;

    function drain() {
      next(writeResult, function (msg) {
        Buffer = [];
        setTimeout(function(){
          announce('drain', msg);
        });
        state.hasCapacity = true;
        state.isFlushing = false;
      });
    }
    function next(result, done) {
      if (result && typeof(result.then) === 'function') {
        log.info('WRITEABLE - init callback was a promise');
        // treat as promise
        result.then(done).catch(function(err){
          announce('error', err);
        })
      } else {
        done(Buffer);
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
    log.info('WRITEABLE - ending stream. No more writes possible after this one.');
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
    log.info('WRITEABLE - write object to stream - "', obj, '"');
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

    if (Buffer.length >= state.highWaterMark) {
      state.hasCapacity = false;
    }

    return state.hasCapacity;
  }

  function WriteableState(options) {
    log.info('WRITEABLE - initializing stream');
    options = typeof(options) === 'function' ? {} : options;
    let defaults = {
      objectMode: true, // always true. Changes will be ignored
      highWaterMark: 100 // objects to buffer
    }
    let params = Object.assign(defaults, options);

    let isCorked = false;
    let hasCapacity = true;
    let hasEnded = false;
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
      getBuffer: () => {
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
