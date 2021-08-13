require('dotenv').config()

const Hapi = require('@hapi/hapi')
const songs = require('./api/songs')
const SongsService = require('./services/postgres/SongsService')
const SongsValidator = require('./validator/songs')
const ClientError = require('./exceptions/ClientError')

const init = async () => {
  const songsService = new SongsService()
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  })

  await server.register({
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator,
    },
  })

  server.ext('onPreResponse', (request, h) => {
    const { response } = request
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      })
      newResponse.code(response.statusCode)
      return newResponse
    } else if (response instanceof Error) {
      const { statusCode, payload } = response.output
      if (statusCode === 401) {
        return h.response(payload).code(401)
      }
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      })
      console.log(response)
      newResponse.code(500)
      return newResponse
    }
    return response.continue || response
  })

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

init()