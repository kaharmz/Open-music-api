const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('./../../exceptions/InvariantError');

class CollaborationService {
  constructor() {
    this._pool = new Pool();
  }

  // Add collaboration
  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  // Delete collaboration
  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: `DELETE FROM collabortions 
      WHERE playlist_id = $1 
      AND user_id = $2 
      RETURNING id`,
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal dihapus');
    }
  }

  // Verify collaboration
  async verifyCollabolator(playlistId, userId) {
    const query = {
      text: `SELECT FROM collaborations 
      WHERE playlist_id = $1 
      AND user_id = $2`,
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  }
}

module.exports = CollaborationService;
