import Util from '../src/util';
import intercept from '../src/intercept.js';


describe('interceptor', function() {
  let revert;
  beforeEach(function(){
    revert = intercept('warn', Util);
  })
  afterEach(function(){
    revert();
  });

  it('should intercept warn', function(done){
    document.addEventListener('console.warn', cb);
    function cb(e) {
      document.removeEventListener('console.warn', cb);
      done();
    }
    console.warn('testing');
  })

  it('revert should remove mods', function(done){
    // intercept('warn', Util);
    document.addEventListener('console.warn', cb);
    function cb(e) {
      throw new Error('not supposed to be here');
    }
    revert();
    console.warn('testing');

    setTimeout(function(){
      document.removeEventListener('console.warn', cb);
      done();
    }, 250)
  })
})
