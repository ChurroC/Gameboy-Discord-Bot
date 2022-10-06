const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageAttachment, MessageEmbed } = require('discord.js');
const axios = require('axios')
const Gameboy = require('../gameboy')
const fs = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start_gameboy')
        .setDescription('Starts a gameboy game.')
        .addAttachmentOption(game =>
            game.setName('gameboyfile')
                .setDescription('Upload game file'))
        .addNumberOption(fps =>
            fps.setName('fps')
                .setDescription('Frames Per Second (Frames outputted to discord every second)')
                .setMinValue(1)
                .setMaxValue(200))
        .addNumberOption(tickrate =>
            tickrate.setName('tickrate')
                .setDescription('Tickrate (Speed of the game)')
                .setMinValue(1)
                .setMaxValue(2000)),
    async execute(interaction) {
        const fileImage = interaction.options.getAttachment('gameboyfile') ? await axios.get(interaction.options.getAttachment('gameboyfile').attachment, { responseType: 'arraybuffer' }) : { data: fs.readFileSync('./Super_Mario_Land.gb') }
        const gameboy = new Gameboy(fileImage.data, interaction.options.getNumber('fps') || 15, interaction.options.getNumber('tickrate') || 800)
        
        let embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Gameboy Emulator')
            .setTimestamp()
        interaction.reply({ embeds: [embed] })
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        gameboy.run(frame => {
            const image = new MessageAttachment(frame, 'frame.png')
            embed = new MessageEmbed(embed).setImage('attachment://frame.png')
            interaction.editReply({ embeds: [embed], files: [image] })
            //interaction.channel.send({ files: [frame] })
        })
    }
}