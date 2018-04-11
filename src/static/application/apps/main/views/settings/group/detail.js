import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Form, Modal, Input, Button, Popconfirm, Tag, Checkbox, Row, Col, Card, Spin } from 'antd'
import { trim, difference, uniq } from 'lodash'
import { transformUrl, toQueryString } from '../../../utils/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import barStyles from '../../../assets/css/search-bar.pcss'
import styles from '../../../assets/css/page-detail.pcss'

const FormItem = Form.Item
const formItemLayout = {
   labelCol: {
     xs: { span: 24 },
     sm: { span: 6 },
   },
   wrapperCol: {
     xs: { span: 24 },
     sm: { span: 14 },
   }
}

class App extends Component {
  constructor(props) {
    super(props)
    this.search = {}
    this.breadItems = [
      {
        title: '设置'
      },
      {
        title: '权限分组',
        url: '/admin/settings/permission-group'
      },
      {
        title: `配置权限（${transformUrl(location.search).name}）`
      }
    ]
  }
  componentDidMount() {
    this.fetchAllPermission()
    this.fetchPermissionByMenuId()
  }
  fetchAllPermission = () => {
    this.props.dispatch({
      type: 'group/permissionList',
      payload: {
        data: {
          noPagination: true,
          ...this.search
        }
      }
    })
  }
  fetchPermissionByMenuId = () => {
    this.props.dispatch({
      type: 'group/permissionByMenuId',
      payload: {
        data: {
          menuId: this.props.match.params.id
        }
      }
    })
  }
  changeHandler = (type, e) => {
    if(e.target.value) {
      this.search = { ...this.search, [type]: trim(e.target.value) }
    } else {
      delete this.search[type]
    }
  }
  searchHandler = () => {
    this.fetchAllPermission()
  }
  onCheckAllChange = (e) => {
    const {  group: { allPermission, checkedList }  } = this.props
    const allCheckedList = allPermission.map(value => value.id)
    this.props.dispatch({
      type: 'group/updateData',
      payload: {
        checkedList: e.target.checked ? uniq([...checkedList, ...allCheckedList]) : difference(checkedList, allCheckedList),
        indeterminate: false,
        checkAll: e.target.checked,
      }
    })
  }
  checkboxChangeHandler = (checkedList) => {
    const {  group: { allPermission }  } = this.props
    this.props.dispatch({
      type: 'group/updateData',
      payload: {
        checkedList: checkedList,
        indeterminate: !!checkedList.length && (checkedList.length < allPermission.length),
        checkAll: checkedList.length === allPermission.length,//判断checkedList包含allPermission才算全选状态(因为有筛选)
      }
    })
  }
  cancelHandler = () => {
    this.props.history.goBack()
  }
  handleSubmit = () => {
    const {match: { params: { id } }, group: { checkedList, defaultCheckedList, defaultMenuPermissionData }, history } = this.props
    // 删除需要通过permissionId找到菜单权限对应关系表中的id
    const deleteList = []
    difference(defaultCheckedList,checkedList).map(permissionId => {
      return defaultMenuPermissionData.map(item => {
        if(permissionId == item.permissionId) {
          deleteList.push(item.id)
        }
      })
    })
    const createList = difference(checkedList,defaultCheckedList).map(permissionId => {
      return {
        menuId: Number(id),
        permissionId
      }
    })

    this.props.dispatch({
      type: 'group/updatePermission',
      payload: {
        data: {
          delete: deleteList,
          create: createList,
        },
        history
      }
    })
  }
  renderChenckBox = (data = []) => {
    const checkedList = this.props.group.checkedList
    return (
      <Checkbox.Group style={{ width: '100%' }} onChange={this.checkboxChangeHandler} value={checkedList}>
        <Row>
          {
            data.map(value =>  <Col span={8} key={value.id}><Checkbox value={value.id}>{value.name}</Checkbox></Col>)
          }
        </Row>
      </Checkbox.Group>
    )
  }
  render() {
    const {  group: { api, menu, element, unAssignedPermission, indeterminate, checkAll }, loading  } = this.props
    return(
      <Spin
        tip='加载中...'
        spinning={loading}>
        <Breadcrumb items={this.breadItems} />
        <Input
          placeholder='权限关键字'
          className={barStyles.input}
          onChange={this.changeHandler.bind(this, 'name')}
          onPressEnter={this.searchHandler}
          defaultValue={this.search.userId}
        />
        <Button
          type='primary'
          onClick={this.searchHandler}
          className={barStyles.button}
          icon='search'
          >
          筛选
        </Button>
        {/* <Checkbox
            indeterminate={indeterminate}
            onChange={this.onCheckAllChange}
            checked={checkAll}
          >
            全选
        </Checkbox> */}
        <Card className={styles.card} style={{ marginTop: '0px' }}>
          <div className={styles.header}>
              <h1>未分组权限:</h1>
          </div>
          <div className={styles['sub-card']}>
            <div className={styles['card-item']}>
            {this.renderChenckBox(unAssignedPermission)}
            </div>
          </div>
        </Card>
        <Card className={styles.card} style={{ marginTop: '0px' }}>
          <div className={styles.header}>
              <h1>元素权限:</h1>
          </div>
          <div className={styles['sub-card']}>
            <div className={styles['card-item']}>
            {this.renderChenckBox(element)}
            </div>
          </div>
        </Card>
        <Card className={styles.card}>
          <div className={styles.header}>
              <h1>菜单权限:</h1>
          </div>
          <div className={styles['sub-card']}>
            <div className={styles['card-item']}>
              {this.renderChenckBox(menu)}
            </div>
          </div>
        </Card>
        <Card className={styles.card}>
          <div className={styles.header}>
              <h1>接口权限:</h1>
          </div>
          <div className={styles['sub-card']}>
            <div className={styles['card-item']}>
              {this.renderChenckBox(api)}
            </div>
          </div>
        </Card>
        <div style={{textAlign: 'center'}}>
          <Button
            style={{margin: '20px 50px 0 0'}}
            loading={loading}
            onClick={this.cancelHandler}>
            返回
          </Button>
          <Button
            type='primary'
            loading={loading}
            onClick={this.handleSubmit}>
            保存
          </Button>
        </div>
      </Spin>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'group/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    group: state.group,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(App)
