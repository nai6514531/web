import Router from 'koa-router'
import { connectWechat } from '../policies/connect'
import { app } from '../controllers/web'

const router = Router()

// router.use(connectWechat);
router.get('/', app)

export default router
