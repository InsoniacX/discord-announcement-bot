const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { TikTokLiveConnection } = require('tiktok-live-connector'); // Make sure this is installed
const db = require("./db");
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Load slash commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[WARN] Command at ${filePath} is missing "data" or "execute".`);
  }
}

// Handle slash command interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ Error executing command.', ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ Error executing command.', ephemeral: true });
    }
  }
});

// Log in and start bot
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  startMonitoring();
});

client.login(process.env.DISCORD_BOT_TOKEN);

// TikTok monitoring
const monitoredUsers = new Set();

function startMonitoring() {
  const users = db.prepare("SELECT DISTINCT username FROM tiktok_users").all();

  
    const tiktok = new TikTokLiveConnection(username);

    tiktok.on("streamStart", async () => {
      console.log(`🔴 ${username} is live`);

      const guilds = db.prepare(`
        SELECT g.channel_id, g.message
        FROM tiktok_users u
        JOIN guilds g ON g.guild_id = u.guild_id
        WHERE u.username = ?
      `).all(username);

      for (const { channel_id, message } of guilds) {
        try {
          const channel = await client.channels.fetch(channel_id);
          const msg = (message || "🔴 {username} is live! {url}")
            .replace(/{username}/g, username)
            .replace(/{url}/g, `https://www.tiktok.com/@${username}/live`);
          await channel.send(msg);
        } catch (err) {
          console.error(`❌ Failed to send message in ${channel_id}: ${err.message}`);
        }
      }
    });

    tiktok.on("streamEnd", () => {
      console.log(`⚫ ${username} went offline`);
    });

    tiktok.connect().then(() => {
      console.log(`✅ Connected to TikTok user: ${username}`);
    }).catch(err => {
      console.error(`❌ Failed to connect to ${username}:`, err.message);
    });
}


// Global error handler
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);
