class PlaylistsHandler {
  constructor(service, validator) {
    this._validator = validator;
    this._service = service;
    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistHandler = this.getPlaylistHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
  }

  // POST playlist handler
  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const {name} = request.payload;
    const {id: credentialId} = request.auth.credentials;
    const playlistId = await this._service.addPlaylist(
        {
          name,
          owner: credentialId,
        },
    );
    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  // GET playlist handler
  async getPlaylistHandler(request) {
    const {id: credentialId} = request.auth.credentials;
    const playlists = await this._service.getPlaylist(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  // DELETE playlist handler
  async deletePlaylistByIdHandler(request) {
    const {id: credentialId} = request.auth.credentials;
    const id = request.params['playlistId'];
    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylistById(id, credentialId);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }
}

module.exports = PlaylistsHandler;

