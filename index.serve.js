const {readFileSync, writeFileSync} = require('fs')
const sendEnv = readFileSync('./.env.send.yaml','utf8')
const signEnv = readFileSync('./.env.sign.yaml','utf8')
const buf = `# .env.send.yaml
${sendEnv}
# .env.sign.yaml
${signEnv}
`.replace(/\: /g, '=')
writeFileSync('./.env', buf)
require('dotenv').config()

const express = require('express')

const sign = require('./functions/sign')
const send = require('./functions/send')
const server = express()
server.get('/sign', sign)
server.get('*', send)
server.listen(8989)
console.log('dev')
