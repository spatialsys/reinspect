
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./reinspect.cjs.production.min.js')
} else {
  module.exports = require('./reinspect.cjs.development.js')
}
