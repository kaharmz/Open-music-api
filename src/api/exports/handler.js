class ExportHandler {
  constructor(producersService, playlistsService, validator) {
    this._producersService = producersService;
    this._playlistsService = playlistsService;
    this._validator = validator;
    this.postExportPlaylistsHandler = this.postExportPlaylistsHandler;
  }

  // POST Export playlists
  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);
    const {playlistId} = request.params;
    const {id: credentialId} = request.auth.credentials;
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const message = {
      playlistId,
      credentialId,
      targetEmail: request.payload.targetEmail,
    };
    await this._producersService.sendMessage(
        'export:playlists', JSON.stringify(message));
    const response = h.response({
      status: 'success',
      message: 'Permintaan anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportHandler;

