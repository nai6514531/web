import cookie from 'component-cookie'
import querystring from 'querystring'

import { COOKIE } from '../constant/cookie'
import { storage } from '../utils/storage.js'

const qs = querystring.parse(window.location.search.slice(1))

/* hard code for ISO wx.config */
if (!window.entryUrl) {
	if (!storage.val('token')) {
		window.entryUrl = 'http://erp.sodalife.dev/'
	} else {
		// let url = window.location.href.split('#')[0]
		window.entryUrl = window.location.href.split('#')[0]
	}
}

/* set debug */
if ('debug' in qs) {
	// 设置debug状态标记
	cookie(COOKIE.DEBUG, 1)
}