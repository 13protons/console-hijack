const LOG = 'LOG';
const INFO = 'INFO';
const WARN = 'WARN';
const ERROR = 'ERROR';
const TRACE = 'TRACE';

const levelOrder = [LOG, INFO, WARN, ERROR, TRACE];

let eventNames = {
  LOG: 'console.log',
  INFO: 'console.info',
  WARN: 'console.warn',
  ERROR: 'console.error',
  TRACE: 'console.trace',
}


let logLevel = LOG;
let isBrowser = true;
if (typeof window === undefined) {
  isBrowser = false;
}

let levelSet = {
  set level(name) {
    logLevel = levelOrder.indexOf(name) >= 0 ? name : LOG;
  },
  get level() {
    return logLevel;
  },
  get LOG(){ return LOG },
  get INFO(){ return INFO },
  get WARN(){ return WARN },
  get ERROR(){ return ERROR },
  get TRACE(){ return TRACE }
}

let output = Object.assign({
  has: function(name) {
    return typeof console !== "undefined" && console[name] !== undefined;
  },
  emit: function(name, payload) {
    // let precedence = levelOrder.indexOf(name);
    // if (precedence === -1 || precedence < levelOrder.indexOf(logLevel)) {
    //   return
    // }
    let event = new CustomEvent(eventNames[name], {
      detail: payload
    });
    document.dispatchEvent(event);
  },
  quiet: function(name) {
    return levelOrder.indexOf(name) < levelOrder.indexOf(logLevel)
  },
  active: function(name) {
    return levelOrder.indexOf(name) >= levelOrder.indexOf(logLevel)
  }
}, levelSet);

export {output as default};
export {levelSet};
