# fastify-close-idle-server

Fastify plugin to close the server after it's been idle (hasn't served any requests) for too long. This can be used as part of an application scaling solution, including scaling to zero.

## Install
```
npm i fastify-close-idle-server
```

## Usage
To use this plugin's default of calling `fastify.close()` after the server has been running for one consecutive minute without serving any requests:
```
const fastify = require('fastify')()
fastify.register(require('fastify-close-idle-server'))

// Register other plugins, add routes, etc. as normal.

fastify.listen({ port: 3000 })
```

To specify a different amount of idle time to wait before closing the server, set the `delay` option in milliseconds. For example, to close the server after 30 seconds of idle time:
```
fastify.register(require('fastify-close-idle-server'), {
  delay: 30000
})
```

This plugin's default close function, `fastify.close()`, does not exit the process unless you have added a separate [onClose hook](https://www.fastify.io/docs/latest/Reference/Hooks/#onclose) or other code to do that. To run a different close function, set the `closeFunction` option. For example, to run the close function returned by [closeWithGrace](https://github.com/mcollina/close-with-grace):
```
const {close} = require('close-with-grace')({ delay: 500 }, async function ({ signal, err, manual }) {
  await fastify.close()
})
fastify.register(require('fastify-close-idle-server'), {
  closeFunction: close
})
```
