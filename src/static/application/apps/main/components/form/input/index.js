import React, { Component, PropTypes }from 'react'
import { Input as ReactInput, Icon } from 'antd'

import styles from './index.pcss'

class Input extends React.Component {
  static propTypes = {
    value: PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value) {
      this.setState({ value: nextProps.value })
    }
  }
  emitEmpty (e) {
    this.input.focus();
    this.setState({ value: '' })
    this.onChangeValue(e)
  }
  onChangeValue(e) {
    if (this.props.onChange) {
      this.props.onChange(e)
    }
  }
  render() {
    const { value } = this.state
    const suffix = value ? <Icon type="close-circle" onClick={this.emitEmpty.bind(this)} className={styles.close} /> : null
    return (
      <ReactInput
        {...this.props}
        suffix={suffix}
        value={value}
        onChange={this.onChangeValue.bind(this)}
        ref={node => this.input = node}
      />
    );
  }
}

export { Input }
