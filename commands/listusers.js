// commands/listusers.js
const db = require("../db");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listusers")
    .setDescription("List all TikTok usernames monitored in this server"),

  async execute(interaction) {
    const guildId = interaction.guild.id;

    try {
      const users = db.prepare("SELECT username FROM tiktok_users WHERE guild_id = ?").all(guildId);

      if (users.length === 0) {
        return interaction.reply("📭 No TikTok users are being monitored in this server.");
      }

      const list = users.map(u => `• ${u.username}`).join("\n");
      await interaction.reply(`📋 TikTok users monitored:\n${list}`);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: "❌ Failed to fetch list.", ephemeral: true });
    }
  }
};
