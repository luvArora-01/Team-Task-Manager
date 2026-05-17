const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const { users: usersDB } = connectDB.db;

const now = () => new Date().toISOString();
const normalizeEmail = (email) => email.toLowerCase().trim();

function makeUserRef(row) {
  if (!row) return null;
  return { _id: row._id, name: row.name, email: row.email, role: row.role, toString() { return this._id; } };
}

function makeUser(row, includePassword = false) {
  if (!row) return null;
  const user = {
    _id: row._id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatar: row.avatar || '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    toString() { return this._id; },
    toJSON() {
      return { _id: this._id, name: this.name, email: this.email, role: this.role, avatar: this.avatar, createdAt: this.createdAt, updatedAt: this.updatedAt };
    },
  };
  if (includePassword && row.password) {
    user.password = row.password;
    user.comparePassword = (candidate) => bcrypt.compare(candidate, row.password);
  }
  return user;
}

const User = {
  async findById(id) {
    const row = await usersDB.findOneAsync({ _id: id });
    return makeUser(row);
  },
  async findOne({ email }) {
    const row = await usersDB.findOneAsync({ email: normalizeEmail(email) });
    return makeUser(row);
  },
  async findOneWithPassword({ email }) {
    const row = await usersDB.findOneAsync({ email: normalizeEmail(email) });
    return makeUser(row, true);
  },
  async findAdmin() {
    const rows = await usersDB.findAsync({ role: 'admin' });
    rows.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    return makeUser(rows[0]);
  },
  async adminExists() {
    const admin = await this.findAdmin();
    return Boolean(admin);
  },
  async findAll() {
    const rows = await usersDB.findAsync({});
    rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return rows.map((r) => makeUser(r));
  },
  async create({ name, email, password, role = 'member', avatar = '' }) {
    const hashed = await bcrypt.hash(password, 12);
    const ts = now();
    const doc = await usersDB.insertAsync({ name: name.trim(), email: normalizeEmail(email), password: hashed, role, avatar, createdAt: ts, updatedAt: ts });
    return makeUser(doc);
  },
  async updateById(id, { name }) {
    await usersDB.updateAsync({ _id: id }, { $set: { name: name.trim(), updatedAt: now() } }, {});
    return this.findById(id);
  },
  async enforceSingleAdmin() {
    const admins = await usersDB.findAsync({ role: 'admin' });
    admins.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));

    if (admins.length <= 1) {
      return { admin: makeUser(admins[0]), demoted: [] };
    }

    const duplicates = admins.slice(1);
    const ts = now();
    await Promise.all(
      duplicates.map((admin) =>
        usersDB.updateAsync({ _id: admin._id }, { $set: { role: 'member', updatedAt: ts } }, {})
      )
    );

    return {
      admin: makeUser(admins[0]),
      demoted: duplicates.map((admin) => makeUser({ ...admin, role: 'member', updatedAt: ts })),
    };
  },
  makeUserRef,
};

module.exports = User;
