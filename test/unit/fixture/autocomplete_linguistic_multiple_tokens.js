
module.exports = {
  'query': {
    'filtered': {
      'query': {
        'bool': {
          'must': [{
            'match': {
              'phrase.default': {
                'analyzer': 'peliasPhrase',
                'type': 'phrase',
                'boost': 1,
                'slop': 2,
                'query': 'one two'
              }
            }
          },
          {
            'match': {
              'name.default': {
                'analyzer': 'peliasPhrase',
                'boost': 100,
                'query': 'three',
                'type': 'phrase',
                'operator': 'and'
              }
            }
          }],
          'should':[{
            'function_score': {
              'query': {
                'match': {
                  'name.default': {
                    'analyzer': 'peliasPhrase',
                    'boost': 100,
                    'query': 'one two three',
                    'type': 'phrase',
                    'operator': 'and'
                  }
                }
              },
              'max_boost': 20,
              'score_mode': 'first',
              'boost_mode': 'replace',
              'functions': [{
                'field_value_factor': {
                  'modifier': 'log1p',
                  'field': 'popularity',
                  'missing': 1
                },
                'weight': 1
              }]
            }
          },{
            'function_score': {
              'query': {
                'match': {
                  'name.default': {
                    'analyzer': 'peliasPhrase',
                    'boost': 100,
                    'query': 'one two three',
                    'type': 'phrase',
                    'operator': 'and'
                  }
                }
              },
              'max_boost': 20,
              'score_mode': 'first',
              'boost_mode': 'replace',
              'functions': [{
                'field_value_factor': {
                  'modifier': 'log1p',
                  'field': 'population',
                  'missing': 1
                },
                'weight': 3
              }]
            }
          }]
        }
      }
    }
  },
  'sort': [ '_score' ],
  'size': 20,
  'track_scores': true
};
