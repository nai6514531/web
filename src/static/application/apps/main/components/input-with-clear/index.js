import React, { Component }from 'react'
import PropTypes from 'prop-types'
import { Input as ReactInput, Icon } from 'antd'

import styles from './index.pcss'

class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.defaultValue,
    };
  }
  emitEmpty (e) {
    this.input.focus();
    this.setState({ value: '' })
    this.onChangeValue(e)
  }
  onChangeValue(e) {
    this.setState({
      value: e.target.value
    })
    this.props.onChange(e.target.value || undefined)
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
        className={styles.closeInput}
        ref={node => this.input = node}
      />
    );
  }
}


export default Input
