const Database = require("better-sqlite3");
const db = new Database("tiktok.sqlite");

// Initialize schema
db.prepare(`
  CREATE TABLE IF NOT EXISTS guilds (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT,
    message TEXT DEFAULT '🔴 {username} is live! Watch here: {url}'
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS tiktok_users (
    guild_id TEXT,
    username TEXT,
    PRIMARY KEY (guild_id, username),
    FOREIGN KEY (guild_id) REFERENCES guilds(guild_id)
  )
`).run();

module.exports = db;