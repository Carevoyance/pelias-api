var extend = require('extend'),
    search  = require('../../../sanitiser/search'),
    parser = require('../../../helper/query_parser'),
    sanitize = search.sanitize,
    middleware = search.middleware,
    defaultError = 'invalid param \'text\': text length, must be >0';
// these are the default values you would expect when no input params are specified.
var emptyClean = { private: false, size: 10, types: {} };

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('sanitize interface', function(t) {
    t.equal(typeof sanitize, 'function', 'sanitize is a function');
    t.equal(sanitize.length, 2, 'sanitize interface');
    t.end();
  });
  test('middleware interface', function(t) {
    t.equal(typeof middleware, 'function', 'middleware is a function');
    t.equal(middleware.length, 3, 'sanitize has a valid middleware');
    t.end();
  });
};

module.exports.tests.sanitisers = function(test, common) {
  test('check sanitiser list', function (t) {
    var expected = ['singleScalarParameters', 'text', 'size', 'layers', 'sources', 'private', 'geo_search', 'boundary_country' ];
    t.deepEqual(Object.keys(search.sanitiser_list), expected);
    t.end();
  });
};

module.exports.tests.sanitize_invalid_text = function(test, common) {
  test('invalid text', function(t) {
    var invalid = [ '', 100, null, undefined ];
    invalid.forEach( function( text ){
      var req = { query: { text: text } };
      sanitize(req, function(){
        t.equal(req.errors[0], 'invalid param \'text\': text length, must be >0', text + ' is an invalid text');
        t.deepEqual(req.clean, emptyClean, 'clean only has default values set');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitise_valid_text = function(test, common) {
  test('valid short text', function(t) {
    var req = { query: { text: 'a' } };
    sanitize(req, function(){
      t.equal(req.errors[0], undefined, 'no error');
    });
    t.end();
  });

  test('valid not-quite-as-short text', function(t) {
    var req = { query: { text: 'aa' } };
    sanitize(req, function(){
      t.equal(req.errors[0], undefined, 'no error');
    });
    t.end();
  });

  test('valid longer text', function(t) {
    var req = { query: { text: 'aaaaaaaa' } };
    sanitize(req, function(){
      t.equal(req.errors[0], undefined, 'no error');
    });
    t.end();
  });
};

module.exports.tests.sanitize_text_with_delim = function(test, common) {
  var texts = [ 'a,bcd', '123 main st, admin1', ',,,', ' ' ];

  test('valid texts with a comma', function(t) {
    texts.forEach( function( text ){
      var req = { query: { text: text } };
      sanitize( req, function( ){
        var expected_text = text;

        var expected_parsed_text = parser.get_parsed_address(text);
        t.equal(req.errors[0], undefined, 'no error');
        t.equal(req.clean.parsed_text.name, expected_parsed_text.name, 'clean name set correctly');
        t.equal(req.clean.text, expected_text, 'text should match');

      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_private_no_value = function(test, common) {
  test('default private should be set to true', function(t) {
    var req = { query: { text: 'test' } };
    sanitize(req, function(){
      t.equal(req.clean.private, false, 'private set to false');
    });
    t.end();
  });
};

module.exports.tests.sanitize_private_explicit_true_value = function(test, common) {
  test('explicit private should be set to true', function(t) {
    var req = { query: { text: 'test', private: true } };
    sanitize(req, function(){
      t.equal(req.clean.private, true, 'private set to true');
    });
    t.end();
  });
};

module.exports.tests.sanitize_private_explicit_false_value = function(test, common) {
  test('explicit private should be set to false', function(t) {
    var req = { query: { text: 'test', private: false } };
    sanitize(req, function(){
      t.equal(req.clean.private, false, 'private set to false');
    });
    t.end();
  });
};

module.exports.tests.sanitize_lat = function(test, common) {
  var valid_lats = [ 0, 45, 90, -0, '0', '45', '90', -181, -120, -91, 91, 120, 181  ];
  test('valid lat', function(t) {
    valid_lats.forEach( function( lat ){
      var req = { query: { text: 'test', 'focus.point.lat': lat, 'focus.point.lon': 0 } };
      sanitize(req, function(){
        var expected_lat = parseFloat( lat );
        t.equal(req.errors[0], undefined, 'no error');
        t.equal(req.clean['focus.point.lat'], expected_lat, 'clean lat set correctly (' + lat + ')');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_lon = function(test, common) {
  var lons = {
    valid: [ -381, -181, -180, -1, -0, 0, 45, 90, '-180', '0', '180', 181 ]
  };
  test('valid lon', function(t) {
    lons.valid.forEach( function( lon ){
      var req = { query: { text: 'test', 'focus.point.lat': 0, 'focus.point.lon': lon } };
      sanitize( req, function(){
        var expected_lon = parseFloat( lon );
        t.equal(req.errors[0], undefined, 'no error');
        t.deepEqual(req.clean['focus.point.lon'], expected_lon, 'clean set correctly (' + lon + ')');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_optional_geo = function(test, common) {
  test('no lat/lon', function(t) {
    var req = { query: { text: 'test' } };
    sanitize(req, function(){
      t.equal(req.errors[0], undefined, 'no error');
      t.equal(req.clean['focus.point.lat'], undefined, 'clean set without lat');
      t.equal(req.clean['focus.point.lon'], undefined, 'clean set without lon');
    });
    t.end();
  });
  test('no lat', function(t) {
    var req = { query: { text: 'test', 'focus.point.lon': 0 } };
    sanitize(req, function(){
      var expected_lon = 0;
      t.equal(req.errors[0], 'parameters focus.point.lat and focus.point.lon must both be specified');
      t.equal(req.clean['focus.point.lat'], undefined);
      t.equal(req.clean['focus.point.lon'], undefined);
    });
    t.end();
  });
  test('no lon', function(t) {
    var req = { query: { text: 'test', 'focus.point.lat': 0 } };
    sanitize(req, function(){
      var expected_lat = 0;
      t.equal(req.errors[0], 'parameters focus.point.lat and focus.point.lon must both be specified');
      t.equal(req.clean['focus.point.lat'], undefined);
      t.equal(req.clean['focus.point.lon'], undefined);
    });
    t.end();
  });
};

module.exports.tests.sanitize_bounding_rect = function(test, common) {

  // convernience function to avoid refactoring the succict geojson bbox
  // fixtures in to the more verbose bounding.rect format.
  var mapGeoJsonBboxFormatToBoundingRectFormat = function( bbox ){
    var split = bbox.split(',');
    return {
      'boundary.rect.min_lon': split[0],
      'boundary.rect.max_lat': split[1],
      'boundary.rect.max_lon': split[2],
      'boundary.rect.min_lat': split[3]
    };
  };

  var bboxes = {
    invalid: [
      '91;-181,-91,181', // invalid - semicolon between coordinates
      'these,are,not,numbers',
      '0,0,0,notANumber',
      ',,,',
      '91, -181, -91',   // invalid - missing a coordinate
      '123,12',          // invalid - missing coordinates
      ''                 // invalid - empty param
    ].map(mapGeoJsonBboxFormatToBoundingRectFormat),

    valid: [
      '-179,90,34,-80', // valid top_right lon/lat, bottom_left lon/lat
      '0,0,0,0',
      '10,20,30,40',
      '-40,-20,10,30',
      '-40,-20,10,30',
      '-1200,20,1000,20',
      '-1400,90,1400,-90',
      // wrapped latitude coordinates
      '-181,90,34,-180',
      '-170,91,-181,45',
      '-181,91,181,-91',
      '91, -181,-91,11',
      '91, -11,-91,181'
    ].map(mapGeoJsonBboxFormatToBoundingRectFormat)
  };

  test('invalid bounding rect', function(t) {
    bboxes.invalid.forEach( function( bbox ){
      var req = { query: { text: 'test' } };
      extend( req.query, bbox );
      sanitize(req, function(){
        t.equal(req.clean['boundary.rect.min_lon'], undefined);
        t.equal(req.clean['boundary.rect.max_lat'], undefined);
        t.equal(req.clean['boundary.rect.max_lon'], undefined);
        t.equal(req.clean['boundary.rect.min_lat'], undefined);
        t.equal(req.errors.length, 1, 'bounding error');
      });
    });
    t.end();
  });
  test('valid bounding rect', function(t) {
    bboxes.valid.forEach( function( bbox ){
      var req = { query: { text: 'test' } };
      extend( req.query, bbox );
      sanitize(req, function(){
        t.equal(req.errors[0], undefined, 'no error');
        t.equal(req.clean['boundary.rect.min_lon'], parseFloat(bbox['boundary.rect.min_lon']));
        t.equal(req.clean['boundary.rect.max_lat'], parseFloat(bbox['boundary.rect.max_lat']));
        t.equal(req.clean['boundary.rect.max_lon'], parseFloat(bbox['boundary.rect.max_lon']));
        t.equal(req.clean['boundary.rect.min_lat'], parseFloat(bbox['boundary.rect.min_lat']));
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_size = function(test, common) {
  test('invalid size value', function(t) {
    var req = { query: { size: 'a', text: 'test', lat: 0, lon: 0 } };
    sanitize(req, function(){
      t.equal(req.clean.size, 10, 'default size set');
      t.end();
    });
  });
  test('below min size value', function(t) {
    var req = { query: { size: -100, text: 'test', lat: 0, lon: 0 } };
    sanitize(req, function(){
      t.equal(req.clean.size, 1, 'min size set');
      t.end();
    });
  });
  test('above max size value', function(t) {
    var req = { query: { size: 9999, text: 'test', lat: 0, lon: 0 } };
    sanitize(req, function(){
      t.equal(req.clean.size, 40, 'max size set');
      t.end();
    });
  });
};

module.exports.tests.sanitize_private = function(test, common) {
  var invalid_values = [null, -1, 123, NaN, 'abc'];
  invalid_values.forEach(function(value) {
    test('invalid private param ' + value, function(t) {
      var req = { query: { text: 'test', lat: 0, lon: 0, 'private': value } };
      sanitize(req, function(){
        t.equal(req.clean.private, false, 'default private set (to false)');
        t.end();
      });
    });
  });

  var valid_values = ['true', true, 1, '1'];
  valid_values.forEach(function(value) {
    test('valid private ' + value, function(t) {
      var req = { query: { text: 'test', 'private': value } };
      sanitize(req, function(){
        t.equal(req.clean.private, true, 'private set to true');
        t.end();
      });
    });
  });

  var valid_false_values = ['false', false, 0, '0'];
  valid_false_values.forEach(function(value) {
    test('test setting false explicitly ' + value, function(t) {
      var req = { query: { text: 'test', 'private': value } };
      sanitize(req, function(){
        t.equal(req.clean.private, false, 'private set to false');
        t.end();
      });
    });
  });

  test('test default behavior', function(t) {
    var req = { query: { text: 'test' } };
    sanitize(req, function(){
      t.equal(req.clean.private, false, 'private set to false');
      t.end();
    });
  });
};

module.exports.tests.invalid_params = function(test, common) {
  test('invalid text params', function(t) {
    var req = { query: {} };
    sanitize( req, function(){
      t.equal(req.errors[0], defaultError, 'handle invalid params gracefully');
      t.end();
    });
  });
};

module.exports.tests.middleware_success = function(test, common) {
  test('middleware success', function(t) {
    var req = { query: { text: 'test' }};
    var next = function( message ){
      t.deepEqual(req.errors, [], 'no error messages set');
      t.end();
    };
    middleware( req, undefined, next );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANTIZE /search ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
