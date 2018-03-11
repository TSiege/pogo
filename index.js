const keyIsArray = key => key[key.length - 2] === '[' && key[key.length - 1] === ']'
const parseArrayKey = key => key.slice(0, key.length - 2)

function buildObject(keys, data, obj) {
  if (!keys.length) {
    return data
  }
  let key = keys.pop()
  if (keyIsArray(key)) {
    key = parseArrayKey(key)
    const arrData = { [key]: [] }
    Array.isArray(data) ? arrData[key].push(...data) : arrData[key].push(data)
    return buildObject(keys, arrData)
  }
  return buildObject(keys, { [key]: data })
}

function mergeSubsets(objA, objB, keys, prevKey) {
  let key = keys.shift()
  if (key && keyIsArray(key)) {
    key = parseArrayKey(key)
  }
  if (objA[key] && objB[key]) {
    const subTrees = mergeSubsets(objA[key], objB[key], keys, key)
    return prevKey ? { [prevKey]: subTrees } : subTrees
  }
  if (Array.isArray(objA) || Array.isArray(objB)) {
    const leaf = [...objB, ...objA]
    return prevKey ? { [prevKey]: leaf } : leaf
  }
  const leaf = Object.assign({}, objB, objA)
  return prevKey ? { [prevKey]: leaf } : leaf
}

function merge(objA, objB, keys) {
  return Object.assign({}, objB, objA, mergeSubsets(objA, objB, keys))
}

/**
 * Given a string path it returns a pojo with a matching datastructure
 *
 * @param {string} path the string path describing the pojo structure
 * @param {any} [data] the data to come at the end of the path structure [defaults to {} or [] if path ends in an array]
 * @param {object} [data] the object that the result is added to, defaults to an empty object
 * @returns {object} the resulting object of building the path, combined with any data or previous object provided
 */
module.exports = function pogo(path, data, obj) {
  if (!data) {
    data = keyIsArray(path) ? [] : {}
  }
  if (!obj) {
    obj = {}
  }
  const keys = path.split(':')

  return merge(buildObject([...keys], data), obj, [...keys])
}
