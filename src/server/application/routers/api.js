import Router from 'koa-router'
import { getTimestamp } from '../controllers/api/basic'

const router = Router()

router.get('/now', getTimestamp)

export default router
