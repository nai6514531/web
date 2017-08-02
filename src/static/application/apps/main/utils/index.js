import _ from 'lodash'
const arrayToTree = (array, id = 'id', pid = 'parentId', children = 'children') => {
  let data = _.cloneDeep(array)
  let result = []
  let hash = {}
  data.forEach((item, index) => {
    item.value = item.id
    item.label = item.name
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

const transformMenu = (menu) => {
  const formatMenu = []
  const result = [{
    label: '根',
    value: 0
  }]
  menu.map( item => {
    if( !item.url || item.children ) {
      formatMenu.push(item)
      if(Array.isArray(item.children)) {
        item.children.map( subItem => {
          if( !subItem.url || subItem.children ) {
            formatMenu.push(subItem)
            delete subItem.children
          } else {
            delete item.children
          }
        })
      }
    }
  })
  result[0].children = (arrayToTree(formatMenu))
  return result
}

const transformUrl = (hashUrl) => {
  const result = _.chain(hashUrl).replace('#', '').split('&').map(_.ary(_.partial(_.split, _, '='), 1)).fromPairs().value()
  return result
}

export { arrayToTree, transformMenu, transformUrl }
