#POGO

###Installation
```
npm i pogo-builder
```
###Usage
The first argument is a path. It details a nested object structure delimited by `:`. It can also feature arrays using `[]` (currently `pogo` doesnt support an array as the mid path)
The second argument is any data you want to be stored at the end of the object described in the path
The third argument is the object to add to, defaults to an object
```js
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
###Reasoning
Having written so many elasticsearch queries out by hand I wanted a simple way to build them without being tied to orm or something bulky. See the tests for a more in depth example.
