const AWS = require('aws-sdk')
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_KEY,
  secretAccessKey: process.env.S3_SECRET,
  ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT } : {}),
  ...(process.env.S3_REGION ? { region: process.env.S3_REGION } : {}),
})
module.exports = s3
