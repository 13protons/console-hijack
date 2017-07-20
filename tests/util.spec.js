import Util from '../src/util';


describe('Util', function(){
  // beforeEach(function(){
  //   Util = new Util();
  // })

  describe('signature', function(){
    it('should include a has method', function(){
      expect(Util.has).toBeDefined();
    });
    it('should include an emit method', function(){
      expect(Util.emit).toBeDefined();
    });
    it('should have a level property', function(){
      expect(Util.level).toBeDefined();
    });
    it('should have a LOG constant', function(){
      expect(Util.LOG).toBeDefined();
    });
    it('should have a INFO constant', function(){
      expect(Util.INFO).toBeDefined();
    });
    it('should have a WARN constant', function(){
      expect(Util.WARN).toBeDefined();
    });
    it('should have a ERROR constant', function(){
      expect(Util.ERROR).toBeDefined();
    });
    it('should have a TRACE constant', function(){
      expect(Util.TRACE).toBeDefined();
    });
  });

  describe('has', function() {
    it('should return true for console log method', function(){
      expect(Util.has('log')).toBeTruthy();
    });

    it('should return false for non-standard console methods', function(){
      expect(Util.has('Jurassic5')).toBeFalsy();
    });
  });

  describe('emit', function() {
    it('should trigger an event of type name with payload', function(done){
      let eName = Util.LOG;
      let message = {
        an: 'object'
      }
      document.addEventListener('console.log', cb)
      function cb(e){
        expect(e.detail).toEqual(message);
        done();
        document.removeEventListener(eName, cb);
      }
      Util.emit(eName, message);
    });

    it('should not trigger an event for unknown names', function(done){
      let eName = 'unknown';
      let message = 'hi mom';
      document.addEventListener(eName, cb)
      function cb(e){
        throw new Error('should not be here')
      }
      Util.emit(eName, message);
      setTimeout(function(){
        document.removeEventListener(eName, cb)
        done()
      }, 250)
    });
  });

  describe('verbocity', function(){
    it('should be quiet if level is too low', function(){
      Util.level = Util.TRACE;
      expect(Util.quiet(Util.LOG)).toBeTruthy();
    });
    it('should be active if level is high enough', function(){
      Util.level = Util.LOG;
      expect(Util.active(Util.TRACE)).toBeTruthy();
    })
  });

  describe('levels', function(){
    it('Utils are like onions, they have levels', function(){
      expect(Util.level).toBeTruthy();
    })
  })
})
