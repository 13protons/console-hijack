
describe('will it blend?', function(){
  let Telem;
  beforeAll(function(){
    Telem = require('../src/index.js');
  });

  describe('signature', function(){
    it('should expose interfaces', function(){
      expect(Telem.interfaces).toBeDefined();
    })
  })
})
