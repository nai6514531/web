const pkg = require('../package.json')

module.exports = Object.assign({}, { package: pkg }, {
  "server": {
    "host": "0.0.0.0",
    "port": 3004,
    "keys": ["jwe1a5vqcm35gnlx8cux7h6xciq908ou"],
    "log": {
      "path": "./log/log.log",
    },
  },
  "resource": {
    "analytics": {
      "google-analytics": {
        "id": "",
      },
    },
    "wechat": {
      "app-id": "",
    },
    "cdn": {
      "static": {
        "domain": "//static.sodalife.xyz",
        "path": "/soda/m.sodalife.xyz/"
      },
    },
  },
})
