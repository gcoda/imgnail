# imgnailer

Inspired by [Flyimg](https://github.com/flyimg/flyimg)

Deployed as cloud function.

You need to generate a signed url somewhere on you backend

```javascript
const { stringify } = require('json-cipher-url')('secret')
const source = { 
  url: 'http://pictures.com/header.png'
  resize: { width: 1000, format: "jpeg" } 
}
const encrypted = stringify(source)
// UqOw6x3eYV5aM3Oo4PV69kAQWud9uyuUa0pVQjxO6Om
```
and use it on frontend `https://region.cloudfunctions.net/send/UqOw6x3eYV5aM3Oo4PV69kAQWud9uyuUa0pVQjxO6Om`

You can configure a `NAIL_ACCESS_TOKEN` and hide it behind CDN or use `NAIL_REDIRECT` to redirect processed images to public bucket

I am using this with AWS CloudFront [Origin Groups](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/high_availability_origin_failover.html)

* It checks on storage endpoint and if getting error failing over to function witch resoponds with processed image, it might be a bit over redundant but cheap anyway

## As an alternative you can use `sign` function

it will parse querystring and return either redirect or url inside body
* configurable with env variable or request header

```
/sign?
    url=https%3A%2F%2Fexample.com%2Fimage.jpeg
    &resize[width]=200
    &resize[height]=150
    &resize[withoutEnlargement]=true
    &output[quality]=6
    &output[format]=jpeg
```
look at [example.php](examples/sign.usage.php)


## `send`
- checks if object exists on bucket
- send existing object(or redirect) if it does 
- generates thumbnail\resize\rotate of source image
- puts new object on bucket
- sends new object(or redirect) as response

# Deploy

Create `.env.sign.yaml` and `.env.sign.yaml` and `npm run deploy`

* you might want to change region and function name in [package.json](package.json#L9)

# Config

## .env.send.yaml
```yaml

# S3 "Folder" to keep files in
KEY_PREFIX: '.thumbnails/2mbnails/'

# Redirect if file already exists, and after thumbnail generated, 
# REDIRECT_PREFIX: https://storage.googleapis.com/anigen

# If defined will redirect to REDIRECT_PREFIX + S3.Key
# Contains KEY_PREFIX
# NAIL_REDIRECT: true

# Restict access by x-nail-access-token header
# You can keep it undefined
# Most CDN allow you to setup extra headers
NAIL_ACCESS_TOKEN: RejectStupidGET/.favicon

# Secret that encrypts 
NAIL_SECRET: SuperSecretValue

S3_KEY: KEYKEYKEYKEYKEYKEY
S3_SECRET: SECRETSECRETSECRETSECRETSECRETSECRET
S3_ENDPOINT: https://storage.googleapis.com
S3_BUCKET: anigen
```

## .env.sign.yaml
```yaml
# Same secret
NAIL_SECRET: SuperSecretValue

# Only requests with x-nail-sign-token header will be alowed
# You can keep it undefined
NAIL_SIGN_TOKEN: npm_install_json-cipher-url

# Prefix for generated/signed url 
# useful with 'x-nail-send: redirect' header
NAIL_SIGN_PREFIX: https://d1fofjl7fd4aao.cloudfront.net/

# if defined will resond with 301 redirects
# NAIL_SIGN_REDIRECT: yes
```