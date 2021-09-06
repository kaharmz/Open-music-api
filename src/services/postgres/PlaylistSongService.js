const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const NotFoundError = require('../../exceptions/NotFoundError');
const PlaylistsService = require('./PlaylistService');

class PlaylistSongService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
    this.playlistsService = new PlaylistsService;
  }

  // Add playlist song
  async addPlaylistSong({playlistId, songId}) {
    const id = `playlist-song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
    return result.rows[0].id;
  }

  // Get playlist song
  async getPlaylistSongs(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlistsongs
      LEFT JOIN songs ON songs.id = playlistsongs.song_id
      WHERE playlistsongs.playlist_id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
    return result.rows;
  }

  // Delete playlist song
  async deletePlaylistSong(playlistId, songId) {
    const query = {
      text: `DELETE FROM playlistsongs
      WHERE playlist_id = $1 
      AND song_id = $2 
      RETURNING id`,
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new
      InvariantError('Lagu gagal dihapus dari playlist. Id tidak ditemukan');
    }
  }

  // Verify playlist
  async verifyPlaylistSong(playlistId, owner) {
    // Call playlist service to verify owner
    await this.playlistsService.verifyPlaylistOwner(playlistId, owner);
  }

  // Verify playlist access
  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistSong(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistSongService;

