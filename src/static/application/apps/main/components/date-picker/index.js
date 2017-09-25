import React from 'react';
import _ from 'underscore';
import {
  DatePicker
} from 'antd';
import moment from 'moment';
import zhCN from 'antd/lib/date-picker/locale/zh_CN';

const CustomDatePicker = React.createClass({
  getInitialState() {
    let { startAt, endAt } = this.props.search
    let date = this.props.date
    const defaultStartDate = startAt ? moment(startAt, 'YYYY-MM-DD') : moment(new Date(date.getTime() - 31 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD')
    const defaultEndDate = endAt ? moment(endAt, 'YYYY-MM-DD') : moment(date, 'YYYY-MM-DD')
    if(!startAt) {
      this.props.search.startAt = moment(defaultStartDate).format('YYYY-MM-DD')
    }
    if(!endAt) {
      this.props.search.endAt = moment(defaultEndDate).format('YYYY-MM-DD')
    }
    return {
      startAt: defaultStartDate, //搜索结账开始时间
      endAt: defaultEndDate, //搜索结账结束时间
      defaultEndAt: defaultEndDate,
      endOpen: false,
    };
  },
  componentDidMount() {
    this.disabledStartDate(this.state.startAt)
    // this.disabledEndDate(this.state.endAt)
  },
  onStartChange(value) {
    this.handleBillAtChange('startAt', value);
    this.handleBillAtChange('endAt', value);
    this.setState({
      defaultEndAt: value
    })
  },
  onEndChange(value) {
    this.handleBillAtChange('endAt', value);
    this.setState({
      defaultEndAt: value
    })
  },
  handleBillAtChange(field, value) {
    this.props.search[field] = value ? moment(value).format('YYYY-MM-DD') : null
    // 此处需要对时间进行统一处理
    this.setState({
      [field]: value
    });
  },
  disabledStartDate(startAt) {
    const endAt = new Date(this.state.endAt ? this.state.endAt : null).getTime();
    let dateRange = startAt && startAt.valueOf() > Date.now();
    if (!startAt || !endAt) {
      return dateRange;
    }
    return dateRange;

  },
  disabledEndDate(endAt) {
    const startAt = new Date(this.state.startAt ? this.state.startAt : null).getTime();
    let second = 31 * 24 * 60 * 60 * 1000;
    let dateRange = (endAt && endAt.valueOf() >= startAt.valueOf() + second) || ( endAt && endAt.valueOf() > Date.now());
    if (!endAt || !startAt) {
      return dateRange;
    }
    return dateRange || endAt.valueOf() <= startAt.valueOf();
  },
  handleStartOpenChange(open) {
    if (!open) {
      this.setState({
        endOpen: true
      });
    }
  },
  handleEndOpenChange(open) {
    this.setState({
      endOpen: open
    });
  },
  getSearchCondition() {
    const {
      startAt,
      endAt,
    } = this.state;
    const searchCondition = {
      startAt: startAt,
      endAt: endAt,
    }
    return searchCondition;
  },
  render() {
    return (
      <span>
        <DatePicker
          style={{width:120,marginLeft:4}}
          value={this.state.startAt}
          disabledDate={this.disabledStartDate()}
          placeholder="开始日期"
          onChange={this.onStartChange}
          onOpenChange={this.handleStartOpenChange}
          className="item"
          locale={zhCN}
        />
        -
        <DatePicker
          style={{width:120,marginRight:4}}
          disabledDate={this.disabledEndDate}
          placeholder="结束日期"
          value={this.state.defaultEndAt}
          format="YYYY-MM-DD"
          onChange={this.onEndChange}
          open={this.state.endOpen}
          onOpenChange={this.handleEndOpenChange}
          className="item"
          locale={zhCN}
        />
      </span>
    )
  }
});

export default CustomDatePicker;
