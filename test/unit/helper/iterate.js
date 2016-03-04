var iterate = require('../../../helper/iterate');

module.exports.tests = {};

module.exports.tests.singleton = function(test, common) {
  test('singleton', function(t) {
    var called = 0;
    iterate({a: 1, b: 2}, function(a, index) {
      called++;
      t.deepEqual({a: 1, b: 2}, a, 'object should be passed in');
      t.equal(index, 0, 'index should be 0');
    });

    t.equal(called, 1, 'should be called once');
    t.end();
  });
};

module.exports.tests.twosingletons = function(test, common) {
  test('two singletons', function(t) {
    var called = 0;
    iterate({a: 1, b: 2}, {c:3, d:4}, function(a, b, index) {
      t.equal(index, called, 'index should be ' + called);
      called++;
      t.deepEqual({a: 1, b: 2}, a, 'first object should be correct');
      t.deepEqual({c: 3, d: 4}, b, 'second object should be correct');
    });

    t.equal(called, 1, 'should be called once');
    t.end();
  });
};

module.exports.tests.array = function(test, common) {
  test('array', function(t) {
    var called = 0;
    iterate([1, 2, 3], function(a, index) {
      t.equal(index, called, 'index should be ' + called);
      t.equal(a, index + 1, 'item should be correct');
      called++;
    });

    t.equal(called, 3, 'called 3 times');
    t.end();
  });
};

module.exports.tests.twoarrays = function(test, common) {
  test('two arrays', function(t) {
    var called = 0;
    iterate([1, 2, 3], [4, 5, 6], function(a, b, index) {
      t.equal(index, called, 'index should be correct');
      t.equal(a, index + 1, 'first item should be correct');
      t.equal(b, index + 4, 'second item should be correct');
      called++;
    });

    t.equal(called, 3, 'called 3 times');
    t.end();
  });
};

module.exports.all = function(tape, common) {

  function test(name, testFunction) {
    return tape('iterate: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
