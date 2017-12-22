import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Modal, Select, Row, Input, Popconfirm, message, Form} from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import history from '../../../utils/history.js'
import billboardService from '../../../services/game/billboard'
import styles from './index.pcss'
import { dropWhile, findIndex, trim } from 'lodash'
const Option = Select.Option
const confirm = Modal.confirm
const FormItem = Form.Item
const dateFormat = 'YYYY-MM-DD HH:mm:ss'

const breadItems = [
  {
    title: '游戏平台管理'
  },
  {
    title: '榜单管理'
  }
]
class Billboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      billboards: [],
      visible: false,
      record: {},
      isAdd: true,
    }
    // const search = transformUrl(location.search)
    // this.search = search
    this.columns = [
      {
        title: '序号',
        key: 'index',                
        render: (text, record, index) => {
          return index + 1
        }
      },
      { title: '榜单名', dataIndex: 'name', key: 'name' },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
            return (
                <span>
                  <a href='javascript:void(0)' onClick={this.handleUpdate.bind(this, record)}>编辑</a> |
                  <Popconfirm title='确认删除?' onConfirm={ this.delete.bind(this, record.id) } >
                    <a href='javascript:void(0)'>{'\u00A0'}删除</a>
                  </Popconfirm> | 
                  <Link to={`/game/billboard/${record.id}/games`}>{'\u00A0'}管理游戏</Link> 
                </span>
            )
        }
      }
    ]
  }
  billboards() {
    const self = this;
    billboardService.list().then(function(result){
      if(result.status == 'OK') {
        self.setState((prevState, props) => {
          return { billboards: result.data };
        });
      } else {
        result.message && message.error(result.message)
      }
    })
  }
  delete = (id) => {
    const self = this;
    billboardService.delete(id).then(function(result){
      if(result.status == 'OK') {
        var billboards = self.state.billboards;
        const index = findIndex(billboards, function(item) {
          return item.id == id;
        });
        billboards.splice(index, 1);
        self.setState({billboards: billboards });
      } else {
        result.message && message.error(result.message)
      }
    })
  }
  update = (id, data) => {
    const self = this;
    billboardService.update(id, data).then(function(result){
      if(result.status == 'OK') {
        const billboards = self.state.billboards;        
        const index = findIndex(billboards, function(item) {
          return item.id == id;
        });
        billboards[index] = result.data;
        self.setState({ billboards });
      } else {
        result.message && message.error(result.message)
      }
    })
  }
  add = (data) => {
    const self = this;
    billboardService.add(data).then(function(result){
      if(result.status == 'OK') {
        self.setState((prevState, props) => {
          return { billboards: [result.data, ...self.state.billboards] };
        });
      } else {
        result.message && message.error(result.message)
      }
    })
  }
  handleUpdate = (record, data) => {
    this.setState({record: record, isAdd: false})
    this.showModal()
  }
  handleAdd = (data) => {
    this.setState({isAdd: true, record: {}});
    this.showModal();
  }
  showModal = () => {
    this.setState({ visible: true });
  }
  handleCancel = () => {
    this.setState({ visible: false });
    const form = this.form;
    form.resetFields();
  }
  handleCreate = () => {
    const form = this.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      values.name = trim(values.name) 
      if (this.state.isAdd) {
        this.add(values);
      } else {
        const id = this.state.record.id;
        this.update(id, values);        
      }
      form.resetFields();
      this.setState({ visible: false });
    });
  }
  saveFormRef = (form) => {
    this.form = form;
  }
  componentDidMount() {
    this.billboards();
  }
  render() {
    const {  loading  } = this.props
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Row className={styles['input-wrap']}>
          <Button type="primary" onClick={this.handleAdd}>新增</Button>
        </Row>
        <DataTable
           dataSource={this.state.billboards}
           columns={this.columns}
           loading={loading}
           scroll={{ x: 800 }}
        />
          <LabelCreateForm
            ref={this.saveFormRef}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            onCreate={this.handleCreate}
            initialValue={this.state.record}
            isAdd={this.state.isAdd}
          />
      </div>
    )
  }
  componentWillUnmount() {
  }
}

const LabelCreateForm = Form.create()(
  (props) => {
    const { visible, onCancel, onCreate, form, initialValue } = props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        visible={visible}
        title="新增榜单"
        okText="确认"
        onCancel={onCancel}
        onOk={onCreate}
      >
        <Form layout="vertical">
          <FormItem label="榜单">
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: '请填写榜单名' },
                { max: 4, message: '长度最多10个字符'}],
              initialValue: initialValue.name
            })(
              <Input />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
);


function mapStateToProps(state,props) {
  return {
    loading: state.loading.global,
    common: state.common,
    ...props
  }
}
export default connect(mapStateToProps)(Billboard)
