const { SlashCommandBuilder } = require('discord.js');
const db = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removetiktok')
    .setDescription('Remove a TikTok user from monitoring')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('TikTok username to remove')
        .setRequired(true)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const username = interaction.options.getString('username');

    const exists = db.prepare(
      'SELECT 1 FROM tiktok_users WHERE guild_id = ? AND username = ?'
    ).get(guildId, username);

    if (!exists) {
      return await interaction.reply({
        content: `⚠️ TikTok user **${username}** is not being monitored on this server.`,
        ephemeral: true
      });
    }

    db.prepare(
      'DELETE FROM tiktok_users WHERE guild_id = ? AND username = ?'
    ).run(guildId, username);

    await interaction.reply(`🗑️ Removed TikTok user **${username}** from monitoring.`);
  }
};
