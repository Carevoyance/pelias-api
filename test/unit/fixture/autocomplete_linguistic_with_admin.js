
module.exports = {
  'query': {
    'filtered': {
      'query': {
        'bool': {
          'must': [
            {
              'match': {
                'phrase.default': {
                  'analyzer': 'peliasPhrase',
                  'type': 'phrase',
                  'boost': 1,
                  'slop': 2,
                  'query': 'one two'
                }
              }
            }
          ],
          'should': [
            {
              'match': {
                'parent.country': {
                  'analyzer': 'peliasAdmin',
                  'boost': 800,
                  'query': 'three'
                }
              }
            },
            {
              'match': {
                'parent.region': {
                  'analyzer': 'peliasAdmin',
                  'boost': 600,
                  'query': 'three'
                }
              }
            },
            {
              'match': {
                'parent.region_a': {
                  'analyzer': 'peliasAdmin',
                  'boost': 600,
                  'query': 'three'
                }
              }
            },
            {
              'match': {
                'parent.county': {
                  'analyzer': 'peliasAdmin',
                  'boost': 400,
                  'query': 'three'
                }
              }
            },
            {
              'match': {
                'parent.localadmin': {
                  'analyzer': 'peliasAdmin',
                  'boost': 200,
                  'query': 'three'
                }
              }
            },
            {
              'match': {
                'parent.locality': {
                  'analyzer': 'peliasAdmin',
                  'boost': 200,
                  'query': 'three'
                }
              }
            },
            {
              'match': {
                'parent.neighbourhood': {
                  'analyzer': 'peliasAdmin',
                  'boost': 200,
                  'query': 'three'
                }
              }
            },
            {
              'function_score': {
                'query': {
                  'match': {
                    'name.default': {
                      'analyzer': 'peliasPhrase',
                      'boost': 100,
                      'query': 'one two',
                      'type': 'phrase',
                      'operator': 'and'
                    }
                  }
                },
                'max_boost': 20,
                'functions': [
                  {
                    'field_value_factor': {
                      'modifier': 'log1p',
                      'field': 'popularity',
                      'missing': 1
                    },
                    'weight': 1
                  }
                ],
                'score_mode': 'first',
                'boost_mode': 'replace'
              }
            },
            {
              'function_score': {
                'query': {
                  'match': {
                    'name.default': {
                      'analyzer': 'peliasPhrase',
                      'boost': 100,
                      'query': 'one two',
                      'type': 'phrase',
                      'operator': 'and'
                    }
                  }
                },
                'max_boost': 20,
                'functions': [
                  {
                    'field_value_factor': {
                      'modifier': 'log1p',
                      'field': 'population',
                      'missing': 1
                    },
                    'weight': 3
                  }
                ],
                'score_mode': 'first',
                'boost_mode': 'replace'
              }
            }
          ]
        }
      }
    }
  },
  'size': 20,
  'track_scores': true,
  'sort': [
    '_score'
  ]
};
