const PlaylistsSongHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistsongs',
  version: '1.0.0',
  register: async (server, {
    playlistsSongService,
    playlistsService,
    validator,
  }) => {
    const playlistSongHandler = new PlaylistsSongHandler(
        playlistsSongService,
        playlistsService,
        validator,
    );
    server.route(routes(playlistSongHandler));
  },
};

