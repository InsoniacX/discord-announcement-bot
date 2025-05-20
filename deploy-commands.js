require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

if (!process.env.CLIENT_ID || !process.env.DISCORD_BOT_TOKEN) {
  throw new Error('❌ Missing CLIENT_ID or DISCORD_BOT_TOKEN in .env file');
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`[WARN] The command at ${filePath} is missing "data" or "execute".`);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log("✅ CLIENT_ID loaded from .env:", process.env.CLIENT_ID);
    console.log(`🔄 Started refreshing ${commands.length} application (/) commands globally.`);

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log('✅ Successfully reloaded global application (/) commands.');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
})();