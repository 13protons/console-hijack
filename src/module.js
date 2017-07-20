import Util from './util';
import {levelSet} from './util';
import intercept from './intercept.js';

let methods = ['log', 'info', 'warn', 'error', 'trace'];
let undo;

console.hijack = levelSet;
console.hijack.stop = Revert;
console.hijack.start = Start;

function Start() {
  undo = methods.map(function(name) {
    return intercept(name, Util);
  });
}

function Revert() {
  undo.forEach(function(reset){
    reset();
  })
}

Start();

export {Revert, Start};
