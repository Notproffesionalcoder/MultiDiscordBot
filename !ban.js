module.exports = {
    name: 'ban',
    description: 'Ban Command',
    usage: 'Used to ban the naughty.',
    execute(message, args, Discord) {
        if (message.member.hasPermission("BAN_MEMBERS")) {
            // Assuming we mention someone in the message, this will return the user
            // Read more about mentions over at http//discord.js.org/#/docs/main/master/class/MessageMentions
            const user = message.mentions.users.first();
            // If we have a user mentioned
            if (user) {
                // Now we get the member from the user
                const member = message.guild.member(user);

                // If the member is in the guild
                if (member) {
                    /**
                     * Kick the member
                     * Make sure you run this on a member, not a user!
                     * There are big differences between a user and a member
                     */

                    member

                        .ban()
                        .then(() => {
                            // We let the message author know we were able to ban the person
                            const banSuccessDM = new Discord.MessageEmbed()
                                .setColor('RANDOM')
                                .setTitle('BANNED!')
                                .setDescription(`You have been banned forever`)
                                .setFooter(`Moderator : @${message.author.tag}`)
                                .setTimestamp();
                            member.send(banSuccessDM);
                            message.reply(`Successfully Banned ${user.tag}`);

                        })
                        .catch(err => {
                            // An error happened
                            // This is generally due to the bot not being able to kick the member,
                            // either due to missing permissions or role hierarchy
                            message.reply('I was unable to ban the member');
                            // Log the error
                            console.error(err);
                        });
                } else {
                    // The mentioned user isn't in this guild
                    message.reply("That user isn't in this guild!");
                }
                // Otherwise, if no user was mentioned
            } else {
                message.reply("You didn't mention the user to ban!");
            }
        } else {
            message.reply("You cannot use this command!")
        }
    }
}
