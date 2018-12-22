const Bucket = process.env.S3_BUCKET

const s3 = require('../lib/s3')
const fetch = require('node-fetch')
const sharp = require('sharp')

const { parse } = require('json-cipher-url')(process.env.NAIL_SECRET)

const redirect = process.env.REDIRECT_PREFIX
const keyPrefix = process.env.KEY_PREFIX

const defaultParams = {
  output: { format: 'jpeg', quality: 90 },
}
const settings = {
  sendResult: !process.env.NAIL_REDIRECT,
  sendExisting: !process.env.NAIL_REDIRECT,
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
  }

  const sendResult = req.get('x-nail-send') || settings.sendResult
  const sendExisting = req.get('x-nail-send') || settings.sendExisting

  if (req.url.match(/\./)) {
    res
      .status(500)
      .set({ 'Cache-Control': 'no-cache, max-age=0' })
      .send({ error: true, message: 'invalid' })

    console.error('URL', { error: 'dot' })
  } else {
    const encoded = req.url.slice(1)
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
    console.log('PARSED', { parsedParams })
    if (parsedParams) {
      const params = { ...defaultParams, ...parsedParams }
      const Key = keyPrefix + encoded
      const s3Obj = sendExisting
        ? s3.getObject({ Bucket, Key })
        : s3.headObject({ Bucket, Key })

      const obj = await s3Obj.promise().catch(s3Error => {
        console.log('S3', { Key, s3Error })
        return s3Error.code
      })
      if (obj === 'NoSuchKey' || obj === 'NotFound') {
        const source = await fetch(params.url).then(res => res.buffer())
        const image = await sharp(source)

        let result = image

        if (params.resize) result = result.resize(params.resize)

        if (params.rotate)
          result = result.rotate(params.rotate.angle, params.rotate.options)

        if (params.sharpen) {
          const { sigma, flat, jagged } = params.sharpen
          result = result.sharpen(sigma, flat, jagged)
        }

        const { format, ...output } = params.output
        result = result.toFormat(format, output)

        const ContentType = `image/${format}`
        const Body = await result.toBuffer()
        const ACL = 'public-read'
        const CacheControl = 'public, max-age=31536000'

        s3.putObject({ Bucket, Key, ContentType, CacheControl, Body, ACL })
          .promise()
          .then(put => {
            console.log('S3', { put })
            if (sendResult) {
              res.set({ 'content-type': ContentType })
              res.send(Body)
            } else {
              console.log('REDIRECT', { put })
              res.redirect(301, `${redirect}/${Key}`)
            }
          })
          .catch(error => console.error('S3', { error }))
      } else {
        if (sendExisting) {
          console.log('SEND', { 'content-type': obj.ContentType, Key })
          res.set({ 'content-type': obj.ContentType })
          res.send(obj.Body)
        } else {
          console.log('REDIRECT', { redirect, Key })
          res.redirect(301, `${redirect}/${Key}`)
        }
      }
    }
  }
}
