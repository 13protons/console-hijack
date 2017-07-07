// reimplement some features of node steams for the browser

module.exports = function(options, cb) {
  return new WriteableStream(options, cb);
}

function WriteableStream(options, writeCallback) {
  // The amount of data potentially buffered depends on the highWaterMark option passed into the streams constructor. For normal streams, the highWaterMark option specifies a total number of bytes.For streams operating in object mode, the highWaterMark specifies a total number of objects.
  let defaults = {
    objectMode: true, // always true. Changes will be ignored
    highWaterMark: 20 // objects to buffer
  }
  let params = Object.assign(defaults, options);

  let Buffer = [];
  let state = new WriteableState(params);

  return {
    write: write,
    push: write,
    // read
    // cork
    // uncork
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

  function write(obj) {
    // Data is buffered in Readable streams when the implementation calls stream.push(chunk).If the consumer of the Stream does not call stream.read(), the data will sit in the internal queue until it is consumed.

    // Data is buffered in Writable streams when the writable.write(chunk) method is called repeatedly. While the total size of the internal write buffer is below the threshold set by highWaterMark, calls to writable.write() will return true.Once the size of the internal buffer reaches or exceeds the highWaterMark, false will be returned.
    Buffer.push(obj);
    if (!writeableState.corked) {
      setTimeout(flush)
    }
    state.hasCapacity = Buffer.length <= state.highWaterMark;
    return state.hasCapacity;
  }

  function WriteableState(options) {
    let isCorked = false;
    let hasCapacity = true;
    return {
      get corked() {
        return isCorked;
      },
      set corked(val) {
        if (val && corked === false) {
          flush();
          isCorked = true;
        } else {
          isCorked = false;
        }
      },
      get highWaterMark() {
        return options.highWaterMark;
      },
      get hasCapacity() {
        return hasCapacity;
      },
      set hasCapacity(val) {
        if (val && hasCapacity === false) {
          announce('drain');
          hasCapacity = true;
        } else {
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
