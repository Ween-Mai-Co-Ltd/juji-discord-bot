import { SlashCommandBuilder, EmbedBuilder, MessageFlags, Colors } from 'discord.js'
import type { Command } from '../types/command'

const ping: Command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription("Check the bot's latency to Discord."),
  cooldown: 5,
  async execute(interaction) {
    const before = Date.now()
    await interaction.deferReply({ flags: MessageFlags.Ephemeral })
    const apiLatency = Date.now() - before
    const wsLatency = interaction.client.ws.ping

    const latencyColor =
      apiLatency < 100 ? Colors.Green : apiLatency < 300 ? Colors.Yellow : Colors.Red

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setColor(latencyColor)
      .addFields(
        { name: 'API Latency', value: `\`${apiLatency}ms\``, inline: true },
        {
          name: 'WebSocket Ping',
          value: wsLatency === -1 ? '`Calculating...`' : `\`${wsLatency}ms\``,
          inline: true,
        },
      )
      .setTimestamp()

    await interaction.editReply({ embeds: [embed] })
  },
}

export default ping
