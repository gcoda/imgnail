require('dotenv').config()

const { stringify, parse } = require('json-cipher-url')(process.env.NAIL_SECRET)

const source = {
  url: 'https://storage.googleapis.com/anigen/screenshot/1/260/firstFrame.jpg',
  resize: {
    width: '300',
    height: '300',
    fit: 'cover',
  },
  output: { format: 'jpeg', quality: 9 },
}

const prefix = 'https://d1fofjl7fd4aao.cloudfront.net/'
const n = stringify(source)
console.log(prefix + n, parse(n))
