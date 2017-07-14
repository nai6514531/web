import 'babel-polyfill'
import createHistory from 'history/createBrowserHistory'
import {
  ConnectedRouter,
  routerMiddleware,
  routerReducer as routing,
} from 'react-router-redux'
import createDva from 'dva/lib/createDva'
import createLoading from 'dva-loading'

const history = createHistory()

const dva = createDva({
  mobile: false,
  initialReducer: {
    routing,
  },
  defaultHistory: history,
  routerMiddleware,
  setupHistory(history) {
    this._history = history
  }
})

const app = dva()

app.use(createLoading())

//一次性加载model
// require.context('./models/', true, /\.js$/).keys().forEach( file => app.model(require(`./models/${file.slice(2)}`)) )
// 也支持和路由的异步加载
app.model(require('./models/ui/'))
app.router(require('./router'))

app.start('#application-container')
