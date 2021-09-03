class CollaborationsHandler {
  constructor(
      collaborationsService,
      PlaylistsSongService,
      validator,
  ) {
    this._collaborationsService = collaborationsService;
    this._playlistsSongService = PlaylistsSongService;
    this._validator = validator;
    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler =
    this.deleteCollaborationHandler.bind(this);
  }

  // POST collaboration handler
  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const {id: credentialId} = request.auth.credentials;
    const {playlistId, userId} = request.payload;
    await
    this._playlistsSongService.verifyPlaylistOwner(playlistId, credentialId);
    const collaborationId =
    await this._collaborationsService.addCollaboration(playlistId, userId);
    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  // DELETE collaboration handler
  async deleteCollaborationHandler(request) {
    this._validator.validateCollaborationPayload(request.payload);
    const {id: credentialId} = request.auth.credentials;
    const {playlistId, userId} = request.payload;
    await
    this._playlistsSongService.verifyPlaylistOwner(playlistId, credentialId);
    await
    this._collaborationsService.deleteCollaboration(playlistId, userId);
    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
