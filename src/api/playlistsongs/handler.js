class PlaylistsSongHandler {
  constructor(playlistSongsService, playlistsService, validator) {
    this._playlistSongsService = playlistSongsService;
    this._playlistService = playlistsService;
    this._validator = validator;
    this.addPlaylistSongHandler = this.addPlaylistSongHandler.bind(this);
    this.getPlaylistSongHandler = this.getPlaylistSongHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
  }

  // ADD playlist song
  async addPlaylistSongHandler(request, h) {
    const {playlistId} = request.params;
    const {songId} = request.payload;
    const {id: credentialId} = request.auth.credentials;
    this._validator.validatePlaylistSongPayload(request.payload);
    await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistSongsService.addPlaylistSong({playlistId, songId});
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  // GET playlist song
  async getPlaylistSongHandler(request) {
    const {playlistId} = request.params;
    const {id: credentialId} = request.auth.credentials;
    await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
    const songs = await this._playlistSongsService.getPlaylistSongs(playlistId);
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  // DELETE playlist song
  async deletePlaylistSongHandler(request) {
    const {playlistId} = request.params;
    const {songId} = request.payload;
    const {id: credentialId} = request.auth.credentials;
    await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistSongsService.deletePlaylistSong(playlistId, songId);
    return {
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
    };
  }
}

module.exports = PlaylistsSongHandler;

