import Router from 'koa-router'
import api from './api'
import web from './web'

const router = Router()

router.use('/api', api.routes())
router.use(web.routes())

export default router
