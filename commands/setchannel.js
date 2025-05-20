const db = require("../db");
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setchannel')
    .setDescription('Set the current channel for TikTok live alerts'),

  async execute(interaction) {
    try {
      const channelId = interaction.channelId;
      const guildId = interaction.guildId;

      db.prepare("INSERT OR REPLACE INTO guilds (guild_id, channel_id) VALUES (?, ?)").run(guildId, channelId);

      await interaction.reply(`✅ Notifications will be sent in <#${channelId}>.`);

    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Something went wrong.', ephemeral: true });
    }
  }
};
