import React, { Component }from 'react'
import PropTypes from 'prop-types'
import _ from 'underscore'
import { parse as urlParse } from 'url'
import querystring from 'querystring'
import cx from 'classnames'
import { Input, Icon } from 'antd'

import { Scan } from '../../scan'
import styles from './index.pcss'

const DRINKING_URL_PATHNAME = '/sod.ac/d/'

class InputClear extends Component {
  static propTypes = {
    value: PropTypes.string
  }
  constructor(props) {
    super(props)
    this.state = {
      value: this.props.value || this.props.defaultValue
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value || nextProps.defaultValue !== this.state.value) {
      this.setState({ value: nextProps.value || nextProps.defaultValue})
    }
  }
  emitEmpty (e) {
    this.input.focus()
    this.onChangeValue(e)
  }
  onChangeValue(e) {
    this.setState({
      value: e.target.value || ''
    })
    if (this.props.onChange) {
      this.props.onChange(e)
    }
  }
  render() {
    let { value } = this.state
    let { addon, className } = this.props
    let suffix = value ? <Icon type="close-circle" onClick={this.emitEmpty.bind(this)} className={styles.close} /> : addon || null

    return (
      <Input
        {..._.omit(this.props, 'value', 'defaultValue', 'addon')}
        value={value}
        suffix={suffix}
        onChange={this.onChangeValue.bind(this)}
        className={cx(styles.closeInput, className)}
        ref={node => this.input = node}
      />
    );
  }
}

class InputScan extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: this.props.value || this.props.defaultValue
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value || nextProps.defaultValue !== this.state.value) {
      this.setState({ value: nextProps.value || nextProps.defaultValue})
    }
  }
  handleScanResult(value) {
    let serial = querystring.parse(urlParse(value).query).no
    if (!serial) {
      serial = (urlParse(value).pathname).split(DRINKING_URL_PATHNAME)[1]
    }
    this.setState({
      value: serial
    })
    if (this.props.onChange) {
      this.props.onChange({ target: { value: serial, type: 'scan' }})
    }
  }
  render() {
    let { className } = this.props

    return <InputClear
      {..._.omit(this.props, 'value', 'defaultValue', 'addon')}
      value={this.state.value}
      className={cx(styles.scan, className)}
      addon={<Scan handleScanResult={this.handleScanResult.bind(this)} />} />
  }
}

export { InputClear, InputScan }
