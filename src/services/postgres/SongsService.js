const { nanoid } = require("nanoid")
const { Pool } = require("pg")
const InvariantError = require("../../exceptions/InvariantError")
const NotFoundError = require("../../exceptions/NotFoundError")
const { mapDBToModel } = require("../../utils")

class SongService {
  constructor() {
    this._pool = new Pool()
  }

  // Add song
  async addSong({ title, year, performer, genre, duration }) {
    const id = `song-${nanoid(16)}`
    const insertedAt = new Date().toISOString()
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, insertedAt],
    }
    const result = await this._pool.query(query)
    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan')
    }
    return result.rows[0].id
  }

  // Get all song 
  async getSongs() {
    const result = await this._pool.query('SELECT id, title, performer FROM songs')
    return result.rows.map(mapDBToModel)
  }

  // Get song by id
  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    }
    const result = await this._pool.query(query)
    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }
    return result.rows.map(mapDBToModel)[0]
  }

  // Edit song by id
  async editSongById(id, {
    title,
    year,
    performer,
    genre,
    duration,
  }) {
    const updatedAt = new Date().toISOString;
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING id',
      values: [
        title,
        year,
        performer,
        genre,
        duration,
        updatedAt,
        id],
    }
    const result = await this._pool.query(query)
    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan')
    }
  }

  // Delete song by id
  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id]
    }
    const result = await this._pool.query(query)
    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan')
    }
  }
}

module.exports = SongService