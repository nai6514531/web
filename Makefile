DEBUG = erp:*
NODE_ENV = "production"

PM2_PROCESS_FILE = "ecosystem.json"

# dependency
install:
	@yarn && cd src/static && yarn

# server
node:
	@DEBUG=${DEBUG} NODE_ENV=development node ./babel-entry

development:
	@DEBUG=${DEBUG} NODE_ENV=development node-dev ./babel-entry

server: stop
	@DEBUG=${DEBUG} NODE_ENV=${NODE_ENV} pm2 start ${PM2_PROCESS_FILE}

stop:
	-pm2 delete ${PM2_PROCESS_FILE}


# build
build:
	@cd ./src/static/ && gulp build
	@./node_modules/.bin/babel ./src/server  -d ./build/server -s


# alias
dev: development


.PHONY: install node development server stop build dev
