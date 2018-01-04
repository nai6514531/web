import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Modal, Select, Row, Input, Popconfirm, message, Form} from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import history from '../../../utils/history.js'
import labelService from '../../../services/game/label'
import styles from './index.pcss'
import { dropWhile, findIndex, trim } from 'lodash'
const Option = Select.Option
const confirm = Modal.confirm
const FormItem = Form.Item
const dateFormat = 'YYYY-MM-DD HH:mm:ss'

const breadItems = [
  {
    title: '游戏管理系统'
  },
  {
    title: '游戏管理',
    url: '/game/game'
  },
  {
    title: '标签管理'
  }
]
class Label extends Component {
  constructor(props) {
    super(props)
    this.state = {
      labels: [],
      visible: false,
      record: {},
      isAdd: true,
    }
    const search = transformUrl(location.search)
    this.search = search
    this.columns = [
      {
        title: '序号',
        key: 'index',                
        render: (text, record, index) => {
          return index + 1
        }
      },
      { title: '标签', dataIndex: 'name', key: 'name' },
      { title: '色值', dataIndex: 'color', key: 'color' },
      {
        title: '预览',
        key: 'preview',        
        render: (text, record, index) => {
          return <p style={{ color: '#' + record.color}}> {record.name} </p>
        }
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
            return (
                <span>
                  <a href='javascript:void(0)' onClick={this.handleUpdate.bind(this, record)}>编辑</a> |
                  <Popconfirm title='确认删除?' onConfirm={ this.delete.bind(this, record.id) } >
                    <a href='javascript:void(0)'>{'\u00A0'}删除</a>
                  </Popconfirm>
                </span>
            )
        }
      }
    ]
  }
  getLabels() {
    const self = this;
    labelService.list().then(function(result){
      if(result.status == 'OK') {
        self.setState((prevState, props) => {
          return { labels: result.data };
        });
      } else {
        result.message && message.error(result.message)
      }
    })
  }
  delete = (id) => {
    const self = this;
    labelService.delete(id).then(function(result){
      if(result.status == 'OK') {
        var labels = self.state.labels;
        const index = findIndex(labels, function(item) {
          return item.id == id;
        });
        labels.splice(index, 1);
        self.setState({labels: labels });
      } else {
        result.message && message.error(result.message)
      }
    })
  }
  update = (id, data) => {
    const self = this;
    labelService.update(id, data).then(function(result){
      if(result.status == 'OK') {
        const labels = self.state.labels;        
        const index = findIndex(labels, function(item) {
          return item.id == id;
        });
        labels[index] = result.data;
        self.setState({ labels });
        self.hideModal()        
      } else {
        result.message && message.error(result.message)
      }
    })
  }
  add = (data) => {
    const self = this;
    labelService.add(data).then(function(result){
      if(result.status == 'OK') {
        self.setState((prevState, props) => {
          return { labels: [result.data, ...self.state.labels] };
        });
        self.hideModal()
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
  hideModal = () => {
    this.setState({ visible: false });
  }
  handleCancel = () => {
    this.hideModal();
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
      values.color = trim(values.color)       
      if (this.state.isAdd) {
        this.add(values);
      } else {
        const id = this.state.record.id;
        this.update(id, values);        
      }
      form.resetFields();
    });
  }
  saveFormRef = (form) => {
    this.form = form;
  }
  componentDidMount() {
    this.getLabels();
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
           dataSource={this.state.labels}
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
    const { visible, onCancel, onCreate, form, initialValue, isAdd } = props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        visible={visible}
        title={isAdd ? "新增标签": "编辑标签"}
        okText="确认"
        onCancel={onCancel}
        onOk={onCreate}
      >
        <Form layout="vertical">
          <FormItem label="标签内容">
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: '请填写标签内容' },
                { max: 4, message: '长度最多4个字符'}],
              initialValue: initialValue.name
            })(
              <Input />
            )}
          </FormItem>
          <FormItem label="色值">
            {getFieldDecorator('color', {
              rules: [
                { pattern: "^([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$", message: '请输入正确的颜色格式'},
                { required: true, message: '请填写标签色值' },
                { max: 6, message: '长度最多6个字符' }                
              ],
              initialValue: initialValue.color              
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
export default connect(mapStateToProps)(Label)
