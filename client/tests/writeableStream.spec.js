describe('WriteableStream', function(){
  let writeable;
  beforeAll(function(){
    writeable = require('../src/common/writeable_stream');
  });

  describe('signature', function(){
    let writer;
    beforeEach(function(){
      writer = writeable({}, function(){});
    });
    it('should expose a write method', function(){
      expect(writer.write).toBeDefined();
      expect(writer.write).toEqual(jasmine.any(Function));
    });

    it('should expose a push method', function(){
      expect(writer.push).toBeDefined();
      expect(writer.push).toEqual(jasmine.any(Function));
    });
    describe('_writeableState', function(){
      it('should expose a _writableState utility method', function(){
        expect(writer._writableState).toBeDefined();
        expect(writer._writableState).toEqual(jasmine.any(Object));
      });
      it('should be uncorked by default', function(){
        expect(writer._writableState.corked).toBe(false);
      });
      it('should have capacity by default', function(){
        expect(writer._writableState.hasCapacity).toBe(true);
      });
      it('should have an empty buffer by default', function(){
        let buffer = writer._writableState.getBuffer();
        expect(buffer).toEqual(jasmine.any(Array));
        expect(buffer.length).toEqual(0);
      });
    });
  });

  describe('write method', function(){
    let writer;
    beforeEach(function(){
      writer = writeable({}, function(){});
    });
  });
});
