export function conversionUnit (value, num) {
	num = typeof num === 'undefined' ? 2 : num
	return (value / 100).toFixed(num)
}

// 将对象中无值的属性移除，参数可直接接受对象或一个列表
export function trimList (list) {
  var trimObject = function (item) {
    _.each(item, function (val, key) {
      if (val === '') {
        delete item[key];
      }
    });
    return item;
  };
  if (list instanceof Array) {
    _.each(list, trimObject);
  } else {
    trimObject(list);
  }
  return list;
};