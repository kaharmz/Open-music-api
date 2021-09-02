class PlaylistsSongHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this.addPlaylistSongHandler = this.addPlaylistSongHandler.bind(this);
    this.getPlaylistSongHandler = this.getPlaylistSongHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
  }

  // Add Playlist song handler
  async addPlaylistSongHandler(request, h) {
    const {playlistId} = request.params;
    const {songId} = request.payload;
    const {id: credentialId} = request.auth.credentials;
    this._validator.validatePlaylistSongPayload(request.payload);
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.addPlaylistSong({playlistId, songId});
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  // GET playlist song handler
  async getPlaylistSongHandler(request) {
    const {playlistId} = request.params;
    const {id: credentialId} = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const songs = await this._service.getPlaylistSongs(playlistId);
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  // DELETE playlist song handler
  async deletePlaylistSongHandler(request) {
    const {playlistId} = request.params;
    const {songId} = request.payload;
    const {id: credentialId} = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deletePlaylistSong(playlistId, songId);
    return {
      status: 'sucess',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistsSongHandler;

