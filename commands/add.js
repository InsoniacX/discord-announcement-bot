const db = require("../db");
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addtiktok')
    .setDescription('Add a TikTok user to monitor')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('TikTok username')
        .setRequired(true)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const username = interaction.options.getString('username');

    try {
      db.prepare("INSERT OR IGNORE INTO guilds (guild_id) VALUES (?)").run(guildId);
      const result = db.prepare("SELECT 1 FROM tiktok_users WHERE guild_id = ? AND username = ?").get(guildId, username);

      if (result) {
        return interaction.reply({ content: "⚠️ That user is already monitored.", ephemeral: true });
      }

      db.prepare("INSERT INTO tiktok_users (guild_id, username) VALUES (?, ?)").run(guildId, username);
      await interaction.reply(`✅ Added TikTok user **${username}** for this server.`);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Error adding TikTok user.', ephemeral: true });
    }
  }
};
