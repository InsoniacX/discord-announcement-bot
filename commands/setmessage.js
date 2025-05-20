// commands/setmessage.js
const db = require("../db");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setmessage")
    .setDescription("Set the custom alert message for TikTok live notifications")
    .addStringOption(option =>
      option.setName("message")
        .setDescription("Custom message (use {username} and {url})")
        .setRequired(true)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const message = interaction.options.getString("message");

    try {
      db.prepare("INSERT OR REPLACE INTO guilds (guild_id, message) VALUES (?, ?)").run(guildId, message);
      await interaction.reply("✅ Custom alert message has been set.");
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: "❌ Failed to set message.", ephemeral: true });
    }
  }
};
