import React, { Component } from 'react'
import { Breadcrumb } from 'antd'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import op from 'object-path'

import breadcrumbNameMap from './config'

import styles from './index.pcss'

class CustomBreadcrumb extends Component {
  render() {
    let { items } = this.props
    let pathname = (op(location).get('pathname') || '').split('/')[1]
    let title = breadcrumbNameMap[`/${pathname}`]
    items = title === items[0].title ? items : [ {title: title }, ...items ]

    return (
      <div className={styles.wrap}>
        <Breadcrumb>
          {items.map((item,key) => {
            return item.url ?
              <Breadcrumb.Item key={key}><Link to={item.url.replace('PATHNAME', pathname)} onClick={item.handleClick}>{item.title}</Link></Breadcrumb.Item> :
              <Breadcrumb.Item key={key}>{item.title}</Breadcrumb.Item>
          })}
        </Breadcrumb>
      </div>
    )
  }
}
CustomBreadcrumb.propTypes = {
  items: PropTypes.array,
}
export default CustomBreadcrumb
