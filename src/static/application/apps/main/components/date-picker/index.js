import React from 'react';
import _ from 'underscore';
import {
  DatePicker
} from 'antd';
import moment from 'moment';
import zhCN from 'antd/lib/date-picker/locale/zh_CN';

const CustomDatePicker = React.createClass({
  getInitialState() {
    const defaultValue = this.props.search
    const defaultStartDate = defaultValue.startAt ? moment(defaultValue.startAt, 'YYYY-MM-DD') : null
    const defaultEndDate = defaultValue.endAt ? moment(defaultValue.endAt, 'YYYY-MM-DD') : null
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
    value = value ? moment(value).format('YYYY-MM-DD') : ""
    this.props.search[field] = value
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
    let defaultValue = this.props.search
    const defaultStartDate = defaultValue.startAt ? {
      defaultValue: moment(defaultValue.startAt, 'YYYY-MM-DD')
    } : {}
    const defaultEndDate = defaultValue.endAt ? {
      defaultValue: moment(defaultValue.endAt, 'YYYY-MM-DD')
    } : {}
    return (
      <span>
        <DatePicker
          style={{width:120,marginLeft:4}}
          {...defaultStartDate}
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
          {...defaultEndDate}
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
