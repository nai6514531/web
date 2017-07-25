import _ from 'lodash'
const arrayToTree = (array, id = 'id', pid = 'pid', children = 'children') => {
  let data = _.cloneDeep(array)
  let result = []
  let hash = {}
  data.forEach((item, index) => {
    hash[item[id]] = item
  })
  data.forEach((item) => {
    let hashVP = hash[item[pid]]
    if (hashVP) {
      !hashVP[children] && (hashVP[children] = [])
      hashVP[children].push(item)
    } else {
      result.push(item)
    }
  })
  return result
}

const transformUrl = (hashUrl) => {
  const result = _.chain(hashUrl).replace('#', '').split('&').map(_.ary(_.partial(_.split, _, '='), 1)).fromPairs().value()
  return result
}

export { arrayToTree, transformUrl }
