import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
const cached = {}

function registerModel(app, model) {
  if (!cached[model.namespace]) {
    app.model(model);
    cached[model.namespace] = 1;
  }
}

class Bundle extends Component {
  state = {
    mod: null,
    permission: true
  }

  componentWillMount() {
    this.loadWithModel(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.load !== this.props.load) {
      this.loadWithModel(nextProps)
    }
  }

  componentDidMount() {
    // todo 是否有资格进入该页面
    // if(location.pathname !== '/login'){
    //   let result = this.checkOuth(location.pathname)
    //   this.setState({
    //     permission : result
    //   })
    // }
  }

  loadWithModel(props) {
    if(props.app && props.loadModel) {
      props.loadModel((mod) => {
        registerModel(props.app,mod)
        this.load(props)
      })
    } else {
      this.load(props)
    }
  }

  load(props) {
    this.setState({
      mod: null
    })
    props.load((mod) => {
      this.setState({
        mod: mod.default ? mod.default : mod
      })
    })
  }

  checkOuth(pathname) {
    return true
  }

  render() {
    // 可以通过this.props.match拿到路由匹配信息
    if( this.state.permission ) {
      return this.state.mod ? this.props.children(this.state.mod) : null
    } else {
      return <h1>您尚无权限进入此页面</h1>
    }
  }

}

//异步加载主要使用的方法
const BundlewithRouter = withRouter(Bundle)

function getComponent(source,app,sourceModel) {
  return (props) => (
    <BundlewithRouter load={source} app={app} loadModel={sourceModel}>
      {(Component) => <Component {...props}/>}
    </BundlewithRouter>
  )
}

export { getComponent }
