describe('WriteableStream', function() {
  let writeable;
  beforeAll(function() {
    writeable = require('../src/common/writeable_stream');
  });

  describe('signature', function() {
    let writer;
    beforeEach(function() {
      writer = writeable({}, function() {});
    });
    it('should expose a write method', function() {
      expect(writer.write).toBeDefined();
      expect(writer.write).toEqual(jasmine.any(Function));
    });

    it('should expose a push method', function() {
      expect(writer.push).toBeDefined();
      expect(writer.push).toEqual(jasmine.any(Function));
    });

    it('should expose a cork method', function() {
      expect(writer.cork).toBeDefined();
      expect(writer.cork).toEqual(jasmine.any(Function));
    });

    it('should expose a uncork method', function() {
      expect(writer.uncork).toBeDefined();
      expect(writer.uncork).toEqual(jasmine.any(Function));
    });
    describe('_writeableState', function() {
      it('should expose a _writableState utility method', function() {
        expect(writer._writableState).toBeDefined();
        expect(writer._writableState).toEqual(jasmine.any(Object));
      });
      it('should be uncorked by default', function() {
        expect(writer._writableState.corked).toBe(false);
      });
      it('should have capacity by default', function() {
        expect(writer._writableState.hasCapacity).toBe(true);
      });
      it('should have an empty buffer by default', function() {
        let buffer = writer._writableState.getBuffer();
        expect(buffer).toEqual(jasmine.any(Array));
        expect(buffer.length).toEqual(0);
      });
    });
  });

  describe('init', function() {
    it('should init with a default hwm of 100', function(){
      let writer = writeable({}, function() {});
      expect(writer._writableState.highWaterMark).toEqual(100);
    });
    it('can override high water mark at init', function(){
      let writer = writeable({highWaterMark: 42}, function() {});
      expect(writer._writableState.highWaterMark).toEqual(42);
    });
    it('high water mark readonly AFTER init', function(){
      let writer = writeable({highWaterMark: 42}, function() {});
      writer._writableState.highWaterMark = 100;
      expect(writer._writableState.highWaterMark).toEqual(42);
    });
  });
  describe('write method', function() {
    it('should stream chunks into write function', function(done) {
      let tracer = jasmine.createSpy('writeCb', function(){});
      let writer = writeable({highWaterMark: 42}, tracer);
      writer.write('hi mom');
      setTimeout(function(){
        expect(tracer.calls.any()).toBe(true);
        done();
      });
    });

    it('should wait to flush on next tick', function(done) {
      let tracer = jasmine.createSpy('writeCb', function(){});
      let writer = writeable({highWaterMark: 42}, tracer);
      writer.write('I love lamp');
      writer.write('hes got a spear');
      writer.write('stay classy san francisco');

      expect(writer._writableState.getBuffer().length).toEqual(3);

      setTimeout(function(){
        expect(writer._writableState.getBuffer().length).toEqual(0);
        done();
      });
    });

    it('push should be an alias for write', function() {
      let tracer = jasmine.createSpy('writeCb', function(){});
      let writer = writeable({highWaterMark: 42}, tracer);
      expect(writer.write).toEqual(writer.push);
    });

    it('should exert backpressure based on highWaterMark', function() {
      let tracer = jasmine.createSpy('writeCb', function(){});
      let writer = writeable({highWaterMark: 5}, tracer);
      'backpressure'.split().forEach(function(val, i){
        let hasCapcity = writer.write(val);
        if (i > writer._writableState.highWaterMark) {
          expect(hasCapcity).toBe(false);
        } else {
          expect(hasCapcity).toBe(true);
        }
      })

    })
  });

  describe('corking', function() {
    it('toggling corking without writing should not flush', function(done) {
      let tracer = jasmine.createSpy('writeCb', function(){});
      let writer = writeable({highWaterMark: 42}, tracer);
      writer.cork();
      writer.uncork();
      setTimeout(function(){
        expect(tracer.calls.any()).toBe(false);
        done();
      });
    });

    it('corked streams should not flush', function(done) {
      let tracer = jasmine.createSpy('writeCb', function(){});
      let writer = writeable({highWaterMark: 42}, tracer);
      writer.cork();
      writer.write('hi mom');
      setTimeout(function(){
        expect(tracer.calls.any()).toBe(false);
        done();
      });
    });

    it('uncorking stream will immediately flush', function(done) {
      let tracer = jasmine.createSpy('writeCb', function(){});
      let writer = writeable({highWaterMark: 42}, tracer);
      writer.cork();
      writer.write('hi mom');
      setTimeout(function(){
        expect(tracer.calls.any()).toBe(false);
        writer.uncork();
        expect(tracer.calls.any()).toBe(true);
        done();
      });
    });
  });
});
