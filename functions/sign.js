const { stringify } = require('json-cipher-url')(process.env.NAIL_SECRET)
const inferValues = require('infer-values')

const prefix = process.env.NAIL_SIGN_PREFIX

module.exports = (req, res) => {
  if (
    !!process.env.NAIL_SIGN_TOKEN &&
    req.get('x-nail-sign-token') !== process.env.NAIL_SIGN_TOKEN
  ) {
    res
      .status(500)
      .set({ 'Cache-Control': 'no-cache, max-age=0' })
      .send({ error: true, message: 'invalid token' })
      .end()
  } else {
    const ciphered = stringify(inferValues(req.query))
    if (
      process.env.NAIL_SIGN_REDIRECT ||
      req.get('x-nail-send') === 'redirect'
    ) {
      res.redirect(301, prefix + ciphered)
    } else {
      res.send(prefix + ciphered)
    }
  }
  /** */
}
