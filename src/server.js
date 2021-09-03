require('dotenv').config();

const Hapi = require('@hapi/hapi');
const songs = require('./api/songs');
const Jwt = require('@hapi/jwt');

// Song
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');
const ClientError = require('./exceptions/ClientError');

// User
const users = require('./api/users');
const UserService = require('./services/postgres/UserService');
const UsersValidator = require('./validator/users');

// Authentications
const authentications = require('./api/authentications');
const AuthenticationService =
require('./services/postgres/AuthenticationService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// Collaborations
const collaborations = require('./api/collaborations');
const CollaborationService =
require('./services/postgres/CollaborationService');
const CollaborationsValidator = require('./validator/collaborations');

// Playlist
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistService');
const PlaylistsValidator = require('./validator/playlists');

// Playlist song
const playlistsongs = require('./api/playlistsongs');
const PlaylistsSongService = require('./services/postgres/PlaylistSongService');
const PlaylistsSongValidator = require('./validator/playlistsongs');

const init = async () => {
  const songsService = new SongsService();
  const usersService = new UserService();
  const authenticationsService = new AuthenticationService();
  const collaborationsService = new CollaborationService();
  const playlistsService = new PlaylistsService();
  const playlistsSongService = new PlaylistsSongService(collaborationsService);

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('musicapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // Add Plugin
  await server.register([
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: playlistsongs,
      options: {
        service: playlistsSongService,
        validator: PlaylistsSongValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsSongService,
        validator: CollaborationsValidator,
      },
    },
  ]);

  // Error handling
  server.ext('onPreResponse', (request, h) => {
    const {response} = request;
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    } else if (response instanceof Error) {
      const {statusCode, payload} = response.output;
      if (statusCode === 401) {
        return h.response(payload).code(401);
      }
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      console.log(response);
      newResponse.code(500);
      return newResponse;
    }
    return response.continue || response;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
