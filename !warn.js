
module.exports = {
    name: 'warn',
    description: 'Warn Command',
    usage: 'Used to warn the trollers.',
    execute(message, args, Discord) {
        if (message.member.hasPermission('MANAGE_MESSAGES')) {
        const warnedRecently = new Set();
            if (warnedRecently.has(message.mentions.users.first())) {
                message.reply("He/She Has Been Warned Before")
            } else {
                warnedRecently.add(message.mentions.users.first());
            }

            let victim = message.mentions.users.first();
            if (!victim) message.reply('mention someone to warn.');
            else {
                let embed = new Discord.MessageEmbed()
                    .setTitle('Warnings')
                    .setDescription(`${victim} got warned by ${message.author}!`)
                    .setColor('YELLOW')
                    .setFooter(`Moderater : ${message.author.username}`)
                    .setTimestamp();

                let embedDMS = new Discord.MessageEmbed()
                    .setTitle('Warnings')
                    .setDescription(`You got warned by ${message.author}!`)
                    .setColor('YELLOW')
                    .setFooter(`Moderater : ${message.author.username}`)
                    .setTimestamp();

                message.channel.send(embed);
                victim.send(embedDMS);
            }
        } else {
            message.reply("You cannot use this command!")
        }
    }
}
