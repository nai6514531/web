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
  menu.map(item => {
    if(!item.url) {
      formatMenu.push(item)
    }
  })
  // menu.map( item => {
  //   if( !item.url || item.children ) {
  //     formatMenu.push(item)
  //     const cloneChildren = _.cloneDeep(item.children)
  //     delete item.children
  //     if(Array.isArray(cloneChildren)) {
  //       cloneChildren.map( (subItem,index) => {
  //         if( !subItem.url || subItem.children ) {
  //           formatMenu.push(subItem)
  //           delete subItem.children
  //         }
  //       })
  //     }
  //   }
  // })
  result[0].children = (arrayToTree(formatMenu))
  return result
}

const transformUrl = (hashUrl) => {
  if(!hashUrl) {
    return {}
  }
  const result = _.chain(hashUrl.slice(1)).split('&').map(_.ary(_.partial(_.split, _, '='), 1)).fromPairs().value()
  for(let key in result) {
    result[key] = decodeURIComponent(result[key])
  }
  return result
}

const toQueryString = (paramsObject) => {
  return Object
    .keys(paramsObject)
    .map(key => {
      return key + '=' + encodeURIComponent(paramsObject[key])
    })
    .join('&')
}

const createKey = ( data ) => {
  data.map((value, index) => {
    value.key = index + 1
  })
  return data
}
export { arrayToTree, transformMenu, transformUrl, toQueryString, createKey }
