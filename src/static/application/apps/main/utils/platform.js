const platform = () => {
	let ua = window.navigator.userAgent

	let app = {
		isWechat: () => /MicroMessenger/.test(ua)
	}

	let os = {
    isIOS: () => /iPhone|iPad|iPod/i.test(ua),
    isAndroid: () => /Android/i.test(ua),
    isOther: () => !os.isIOS() && !os.isAndroid(),
    value: function () {
      return os.isIOS() ? 'ios' :
        os.isAndroid() ? 'android' :
        'other'
    },
  }

	return {
		app: app,
		os: os,
	}
}

export default platform()