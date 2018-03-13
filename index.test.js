const assert = require('assert')
const pogo = require('./index')

describe('pogo', () => {
  it('can convert a string to a pojo', () => {
    assert.deepEqual(pogo('foo:bar'), { foo: { bar: {} } })
  })

  it('can convert a string to a pojo with data', () => {
    assert.deepEqual(pogo('foo:bar', { fizz: {} }), { foo: { bar: { fizz: {} } } })
  })

  it('can convert a string to a pojo with an array', () => {
    assert.deepEqual(pogo('foo:bar[]'), { foo: { bar: [] } })
  })

  it('can convert a string to a pojo with an array with data', () => {
    assert.deepEqual(pogo('foo:bar[]', { fizz: {} }), { foo: { bar: [{ fizz: {} }] } })
  })

  it('can add data to an existing pojo', () => {
    const pojo = pogo('foo:bar:fizz', { buzz: true }, { foo: { baz: true }, faz: {} })
    const expectation = {
      foo: { bar: { fizz: { buzz: true } }, baz: true },
      faz: {}
    }
    assert.deepEqual(pojo, expectation)
  })

  it('can add data to an existing pojo with the same key', () => {
    const pojo = pogo('foo:bar:fizz', { buzz: true }, { foo: { bar: { fizz: { baz: true } } }, faz: {} })
    const expectation = {
      foo: { bar: { fizz: { buzz: true, baz: true } } },
      faz: {}
    }
    assert.deepEqual(pojo, expectation)
  })

  it('can add data to an existing pojo with an array', () => {
    const pojo = pogo('foo:bar:fizz[]', { buzz: true }, { foo: { bar: { fizz: [{}] } }, faz: {} })
    const expectation = {
      foo: { bar: { fizz: [{}, { buzz: true }] } },
      faz: {}
    }
    assert.deepEqual(pojo, expectation)
  })

  it('can overwrite data correctly', () => {
    assert.deepEqual(pogo(`foo:bar`, true, { foo: { bar: false } }), { foo: { bar: true } })
    assert.deepEqual(pogo(`foo:bar`, true, { foo: { bar: 'fizz' } }), { foo: { bar: true } })
    assert.deepEqual(pogo(`foo:bar`, {}, { foo: { bar: 'fizz' } }), { foo: { bar: {} } })
    assert.deepEqual(pogo(`foo:bar`, { fizz: {} }, { foo: { bar: { buzz: {} } } }), { foo: { bar: { buzz: {}, fizz: {} } } })
    assert.deepEqual(pogo(`foo:bar[]`, 5, { foo: { bar: [9] } }), { foo: { bar: [9, 5] } })
  })

  it('can handle very complex objects', () => {
    const homepageTag = { slug: 'homepage' }
    const site = { name: 'BUSTLE' }
    const expectation = {
      bool: {
        must: [
          {
            function_score: {
              query: { more_like_this: { fields: ['title', 'bodies'], like: [{ _id: '8037001' }] } },
              functions: [
                { gauss: { publishedAt: { origin: 1520778472517, offset: 345600000, scale: 259200000, decay: 0.5 } } }
              ]
            }
          }
        ],
        should: [
          {
            nested: {
              path: 'tags',
              query: { bool: { should: { term: { 'tags.slug': { value: 'homepage', boost: 2.5 } } } } }
            }
          },
          {
            nested: {
              path: 'iabCategories',
              query: { bool: { should: { term: { 'iabCategories.slug': { value: 'parenting-k-6-kids', boost: 5 } } } } }
            }
          },
          {
            nested: {
              path: 'iabCategories',
              query: { bool: { should: { term: { 'iabCategories.slug': { value: 'hobbies-interests', boost: 3 } } } } }
            }
          },
          {
            nested: {
              path: 'iabCategories',
              query: { bool: { should: { term: { 'iabCategories.slug': { value: 'astrology', boost: 9 } } } } }
            }
          },
          {
            nested: {
              path: 'iabCategories',
              query: { bool: { should: { term: { 'iabCategories.slug': { value: 'marriage', boost: 4 } } } } }
            }
          }
        ],
        filter: [{ exists: { field: 'publishedAt' } }, { term: { site: 'BUSTLE' } }],
        must_not: [{ term: { rating: 'NSFA' } }, { term: { sponsored: true } }]
      }
    }
    const posts = [
      { weight: 1, node: { slug: `parenting-k-6-kids` } },
      { weight: 0.5, node: { slug: `hobbies-interests` } },
      { weight: 2, node: { slug: `astrology` } },
      { weight: 0.75, node: { slug: `marriage` } }
    ]
    // generate the related query
    const must = [
      pogo(
        'function_score:query:more_like_this',
        { fields: ['title', 'bodies'], like: [{ _id: '8037001' }] },
        pogo(
          'function_score:functions[]',
          pogo('gauss:publishedAt', { origin: 1520778472517, offset: 345600000, scale: 259200000, decay: 0.5 })
        )
      )
    ]
    const should = [
      pogo(
        'nested:query:bool:should:term:tags.slug',
        { value: homepageTag.slug, boost: 2.5 },
        { nested: { path: 'tags' } }
      ),
      ...posts.map(({ weight, node }) => {
        const { slug } = node
        return pogo(
          'nested:query:bool:should:term:iabCategories.slug',
          { value: slug, boost: 1 + weight * 4 },
          { nested: { path: 'iabCategories' } }
        )
      })
    ]

    const query = {
      bool: {
        must,
        should,
        filter: [{ exists: { field: 'publishedAt' } }, { term: { site: site.name } }],
        must_not: [{ term: { rating: 'NSFA' } }, { term: { sponsored: true } }]
      }
    }
    assert.deepEqual(query, expectation)
  })
})
