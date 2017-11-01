import React, { Component } from 'react'
import { render } from 'react-dom'
import PropTypes from 'prop-types'
import { Input, Icon } from 'antd'

class InputWithClear extends Component {
  constructor(props) {
    super(props)
    this.state = {
     show: false
   }
  }
  componentDidMount() {
    this._mounted = true
  }
  emitEmpty = () => {
    this.refs.searchInput.refs.input.value = ''
    this.setState({
      show: false
    })
    this.props.onChange(undefined)
  }

  change = (v) => {
    this.setState({
      show: !!v.target.value
    })
    this.props.onChange(v.target.value || undefined)
  }
  show = (v) => {
    this.setState({
      show: !!v.target.value
    })
  }
  hide = (v) => {
    setTimeout(()=>{
      if(this._mounted) {
        this.setState({
          show: false
        })
      }
    },250)
  }
  render() {
    const { placeholder, className, onPressEnter, defaultValue } = this.props
    return(
      <Input
        ref="searchInput"
        placeholder={placeholder}
        className={className}
        onPressEnter={onPressEnter}
        defaultValue={defaultValue}
        onFocus={this.show}
        onBlur={this.hide}
        onChange={this.change}
        suffix={this.state.show && <Icon type="close-circle" onClick={this.emitEmpty} />}
      />
    )
  }
  componentWillUnmount() {
    this._mounted = false
  }
}

export default InputWithClear
