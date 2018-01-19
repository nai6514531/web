const platform = () => {
	let ua = window.navigator.userAgent

	let app = {
		isWechat: () => /MicroMessenger/.test(ua)
	}

	return {
		app: app
	}
}

export default platform()