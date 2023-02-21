'use strict'

const fp = require('fastify-plugin')

const fastifyCloseIdleServer = fp(function (fastify, opts, done) {
  const delay = opts.delay || 60000
  const close = opts.closeFunction || fastify.close.bind(fastify)

  let timer = null
  function startIdleTimer() {
    if (!timer) {
      timer = setTimeout(idleTimeLimitReached, delay)
      timer.unref()
      fastify.log.info('Idle timer started')
    }
  }
  function stopIdleTimer() {
    if (timer) {
      clearTimeout(timer)
      timer = null
      fastify.log.info('Idle timer stopped')
    }
  }
  function idleTimeLimitReached() {
    fastify.log.info('Idle time limit reached')
    close()
  }
  fastify.addHook('onReady', (done) => {
    startIdleTimer()
    done()
  })

  let numActiveRequests = 0
  function onRequestStarted() {
    stopIdleTimer()
    numActiveRequests++
  }
  function onRequestFinished() {
    numActiveRequests--
    if (numActiveRequests === 0) {
      startIdleTimer()
    }
  }
  fastify.addHook('onRequest', (request, reply, done) => {
    onRequestStarted()
    reply.then(onRequestFinished, onRequestFinished)
    done()
  })

  done()
})

module.exports = fastifyCloseIdleServer
module.exports.default = fastifyCloseIdleServer
module.exports.fastifyIdleServerShutdown = fastifyCloseIdleServer
