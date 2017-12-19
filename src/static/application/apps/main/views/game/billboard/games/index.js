import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Modal, Select, Row, Input, Popconfirm, message, Form} from 'antd'
import DataTable from '../../../../components/data-table/'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../../utils/'
import history from '../../../../utils/history.js'
import billboardService from '../../../../services/game/billboard'
import gameService from '../../../../services/game/game'
import styles from '../index.pcss'
import { dropWhile, findIndex, trim } from 'lodash'
import moment from 'moment'
const Option = Select.Option
const confirm = Modal.confirm
const FormItem = Form.Item
const dateFormat = 'YYYY-MM-DD HH:mm:ss'

const breadItems = [
  {
    title: '榜单管理'
  },
  {
    title: '游戏管理'
  }
]
class BillboardGames extends Component {
  constructor(props) {
    super(props)
    this.state = {
      billboard: {},
      billboardGames: [],
      visible: false,
      allGames: [],
      id: 0,
      gameId: 0,
    }
    this.columns = [
        { 
            title: '游戏名', 
            dataIndex: 'name', 
            key: 'name',
            render: (text, record, index) => {
                return record.game.title
            }
        },
        { 
            title: '所属榜单', 
            dataIndex: 'billboard', 
            key: 'billboard',
            render: (text, record, index) => {
                return this.state.billboard.name
            }
        },
        {
            title: '展示时间',
            key: 'time',
            render: (text, record, index) => {
              return (
                `${moment(record.game.startedAt).format('YYYY-MM-DD HH:mm:ss')}  ~  ${moment(record.game.endedAt).format('YYYY-MM-DD HH:mm:ss')}`
              )
            }
          }, 
          {
            title: '上下架',
            key: 'status',        
            render: (text, record, index) => {
              return record.game.status ? '下架' : '上架'
            }
          },
        {
            title: '操作',
            key: 'operation',
            render: (text, record, index) => {
                return (
                    <span>
                    <Popconfirm title='确认移除?' onConfirm={ this.delete.bind(this, this.state.id, record.game.id) } >
                        <a href='javascript:void(0)'>{'\u00A0'}移除榜单</a>
                    </Popconfirm>
                    </span>
                )
            }
        }
    ]
  }
  componentWillMount() {
  }
  billboard(id) {
    const self = this;
    billboardService.detail(id).then(function(result){
      if(result.status == 'OK') {
        self.setState((prevState, props) => {
          return { billboard: result.data };
        });
      } else {
        result.message && message.error(result.message)
      }
    })
  }
  billboardGames(id) {
    const self = this;
    billboardService.gamesList(id).then(function(result){
      if(result.status == 'OK') {
        self.setState((prevState, props) => {
          return { billboardGames: result.data };
        });
      } else {
        result.message && message.error(result.message)
      }
    })
  }
  delete = (id, gameId) => {
    const self = this;
    billboardService.deleteGame(id, gameId).then(function(result){
      if(result.status == 'OK') {
        var billboardGames = self.state.billboardGames;
        const index = findIndex(billboardGames, function(item) {
          return item.game.id == gameId;
        });
        billboardGames.splice(index, 1);
        self.setState({billboardGames: billboardGames });
      } else {
        result.message && message.error(result.message)
      }
    })
  }
  add = (id, gameId) => {
    const self = this;
    billboardService.addGame(id, gameId).then(function(result){
      if(result.status == 'OK') {
        self.setState((prevState, props) => {
          return { billboardGames: [result.data, ...self.state.billboardGames] };
        });
      } else {
        result.message && message.error(result.message)
      }
    })
  }
  handleAdd = (data) => {
    this.showModal();
  }
  showModal = () => {
    this.setState({ visible: true });
  }
  handleCancel = () => {
    this.setState({ visible: false });
  }
  handleCreate = () => {
    const { id, gameId } = this.state
    this.add(id, gameId);
    this.setState({ visible: false });
  }
  saveFormRef = (form) => {
    this.form = form;
  }
  allGames = () => {
    const self = this
    gameService.list().then(function(result){
        if(result.status == 'OK') {
          self.setState((prevState, props) => {
            return { allGames: result.data.objects };
          });
        } else {
          result.message && message.error(result.message)
        }
      })
  }
  componentDidMount() {
    const {  match: { params: { id } } } = this.props
    this.setState({id})
    this.billboardGames(id);
    this.billboard(id);
    this.allGames();
  }
  handleChange(gameId) {
    this.setState({gameId}) 
  }
  render() {
    const {  loading  } = this.props
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Row className={styles['input-wrap']}>
          <Button type="primary" onClick={this.handleAdd}>添加游戏</Button>
        </Row>
        <DataTable
           dataSource={this.state.billboardGames}
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
            allGames={this.state.allGames}
            onChange={this.handleChange.bind(this)}
          />
      </div>
    )
  }
  componentWillUnmount() {
  }
}

const LabelCreateForm = Form.create()(
  (props) => {
    const { visible, onCancel, onCreate, form, initialValue, allGames, onChange } = props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        visible={visible}
        title="新增游戏"
        okText="确认"
        onCancel={onCancel}
        onOk={onCreate}
      >
        <Select
            showSearch
            allowClear
            style={{ width: 150, marginRight: 10 }}          
            placeholder="游戏名"
            optionFilterProp="children"
            onChange={onChange}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
            {
            allGames.map(value => {
            return (
                <Option value={value.id + ''} key={value.id}>{value.title}</Option>
            )
            })
        }
        </Select>
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
export default connect(mapStateToProps)(BillboardGames)
