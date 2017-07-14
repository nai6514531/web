import React, { Component } from 'react'
import { withRouter } from "react-router-dom"
const cached = {}
function registerModel(app, model) {
  console.log("cached",cached)
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
    // 当前所在的页面和config下的页面做权限校验
    // 登录完成后获取一份可以访问页面的config
    if(location.pathname !== "/login" && location.pathname !== "/main"){
      let result = this.checkOuth(location.pathname)
      this.setState({
        permission : result
      })
    }
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
        // handle both es imports and cjs
        mod: mod.default ? mod.default : mod
      })
    })
  }

  checkOuth(pathname) {
    return true
  }

  render() {
    // 可以通过this.props.match拿到路由匹配信息
    // console.log("props",this.props)
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
