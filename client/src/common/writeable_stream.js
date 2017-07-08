// reimplement some features of node steams for the browser

module.exports = function(options, cb) {
  return new WriteableStream(options, cb);
}

function WriteableStream(options, writeCallback) {
  // The amount of data potentially buffered depends on the highWaterMark option passed into the streams constructor. For normal streams, the highWaterMark option specifies a total number of bytes.For streams operating in object mode, the highWaterMark specifies a total number of objects.
  let Buffer = [];
  let state = new WriteableState(options);

  return {
    write: write,
    push: write,
    // read
    cork: cork,
    uncork: uncork,
    // end
    // destroy
    _writableState: state
  }

  function flush() {
    writeCallback(Buffer);
    if (!state.hasCapacity) {
      announce('drain');
      state.hasCapacity = true;
    }
    Buffer = [];
  }

  function cork() {
    state.corked = true;
  }

  function uncork() {
    if (state.corked && state.getBuffer().length > 0) {
      flush();
      announce('drain');
    }
    state.corked = false;
  }

  function write(obj) {
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
    let defaults = {
      objectMode: true, // always true. Changes will be ignored
      highWaterMark: 100 // objects to buffer
    }
    let params = Object.assign(defaults, options);

    let isCorked = false;
    let hasCapacity = true;
    return {
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
}

function announce(name, data) {
  console.log('announce: ', name);
  // let event = new CustomEvent(name, {
  //   detail: data
  // });
  // document.dispatchEvent(event);
}

// events:
//   close
//   drain
//   error
//   finish
//   pipe
//   unpipe
