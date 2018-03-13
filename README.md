# POGO

### Installation
```
npm i pogo-builder
```
### Usage
Path: The first argument is a path string. With in the `path` a `:` represents a seperate key and defaults to an object. The terminal key in a `path` defaults to an object if no `data` is provided. `[]` at the end of a key represents an array; to have an array mid path, prefix the `:` with a `[]`.
ex: `foo:bar[]:fizz` becomes `{ foo: bar: [{ fizz: { } }] }`.

Data: The second argument is any data you want to be stored at the end of the object described in the path.

Reducing Object: The third argument is the object to add to, defaults to an object. If the terminal keys overlap with existing data in both, the `data` argument will overwrite other values. However, if both are objects or both are arrays they will be combined. (Order preference to the data in the reducing object's array.)
```js
// ex:
pogo(`foo:bar`, true, { foo: { bar: false } }) // => { foo: { bar: true } }
pogo(`foo:bar`, { fizz: {} }, { foo: { bar: { buzz: {} } } }) // => { foo: { bar: { buzz: {}, fizz: {} } } }
pogo(`foo:bar[]`, 5, { foo: { bar: [9] } }) // => { foo: { bar: [9, 5] } }

// more examples
const pogo = require('pogo')
// simple object
pogo('foo:bar') // => { foo: { bar: {} } }
// simple object with arr
const pojo = pogo('foo:bar[]') // => { foo: { bar: [] } }
pogo('foo:bar') // => { foo: { bar: {} } }
// simple object with arr and with data
const pojo = pogo('foo:bar[]', { fizz: true }) // => { foo: { bar: [{bar: true}] } }
// can add to and merge complex objects or arrays
pogo('foo:bar[]', { buzz: true }, pojo) // => { foo: { bar: [{ fizz: true }, { buzz: true }] })
```
### Motivation
Having written so many elasticsearch queries out by hand I wanted a simple way to build them without being tied to orm or something bulky. Pogo allows you to maintain fine control over queries while simplifying writing them.
