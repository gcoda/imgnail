const Bucket = process.env.S3_BUCKET
const s3 = require('../lib/s3')
const { parse, hash } = require('json-cipher-url')(process.env.NAIL_SECRET)
const keyPrefix = process.env.KEY_PREFIX

const deleteKeys = (Prefix, MaxKeys = 1000) =>
  s3
    .listObjects({ Bucket, Prefix, MaxKeys })
    .promise()
    .then(({ Contents }) =>
      Promise.all(
        Contents.map(({ Key }) => s3.deleteObject({ Bucket, Key }).promise())
      )
    )
    .then(deleted => deleted.length)

const deleteByHash = async hashUrl => {
  let exist = true
  let counter = 0
  while (exist) {
    const count = await deleteKeys(keyPrefix + hashUrl)
    counter += count
    if (count === 0) exist = false
  }
  return counter
}

module.exports = async (req, res) => {
  if (
    !!process.env.NAIL_ACCESS_TOKEN &&
    req.get('x-nail-access-token') !== process.env.NAIL_ACCESS_TOKEN
  ) {
    res
      .status(500)
      .set({ 'Cache-Control': 'no-cache, max-age=0' })
      .send({ error: true, message: 'invalid token x-nail-access-token' })
      .end()
    console.error('TOKEN', { error: 'x-nail-access-token' })
    throw 'throw invalid token'
    return false
  } else {
    const encoded = req.url.split('/').slice(-1)[0]
    console.log(encoded)
    let parsedParams = {}
    try {
      parsedParams = parse(encoded)
    } catch (error) {
      console.error('PARSE', { error })
      res
        .status(500)
        .set({ 'Cache-Control': 'no-cache, max-age=0' })
        .send({ error: true })
        .end()
      return false
    }
    const { purge, url } = parsedParams
    if (purge) {
      const deleted = await deleteByHash(hash(url))

      res.set({ 'Cache-Control': 'no-cache, max-age=0' })
      .set({ 'Content-Type': 'application/json' })
      .send({deleted})
    }
  }
}
