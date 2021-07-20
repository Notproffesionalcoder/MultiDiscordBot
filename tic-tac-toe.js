const Discord = require('discord.js')
const nano = require('tic-tac-nano-2')
const fs = require('fs');
const DBL = require("dblapi.js");


var games = new Map()
var gameStates = new Map()
var no = 0;

let validMoves = new Set();
validMoves.add('A1')
validMoves.add('B1')
validMoves.add('C1')
validMoves.add('A2')
validMoves.add('B2')
validMoves.add('C2')
validMoves.add('A3')
validMoves.add('B3')
validMoves.add('C3')

const bot = new Discord.Client({fetchAllMembers: true})

bot.on('ready', async () => {
  console.log(`Logged in as ${bot.user.tag} in ${bot.guilds.cache.size} servers`)
  bot.guilds.cache.forEach(g => {
    console.log(g.name);
  })
})

bot.on('message', async message => {
  let prefix = 't!';
  let arr = message.content.split(' ')
  let cmd = arr[0];
  let args = arr.slice(1)
  if(!cmd.startsWith(prefix)) return;
  cmd = cmd.toLowerCase().split('').slice(prefix.length).join('')

  if(cmd === 'help'){
    message.channel.send(
      new Discord.MessageEmbed()
      .setTitle('Tic Tac Toe')
      .setDescription(`
      **${prefix}help** - Show this embed
      **${prefix}game <member>** - Start a game with another member
      **${prefix}move <square>** - Take your turn in the game
      **${prefix}end** - End your current game
      **${prefix}board** - Show your current game state
      **${prefix}say <something>** - Make the bot say something
      **${prefix}how** - Show a basic how to play
      `)
      .setFooter('Want to support the bot? Vote for it on top.gg')
      .setURL('https://top.gg/bot/762833969183326228/')
    )
  }

  if(cmd === 'game'){
    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    if(!member) return;
    if(games.has(`${message.author.id}`)){
      return message.channel.send('You are already in a game')
    }
    if(games.has(`${member.id}`)){
      return message.channel.send('The tagged person is in a game')
    }
    let g = fs.readFileSync('./games.txt').toString();
    fs.writeFile('./games.txt', `${g}\n\nNew Game in server ${message.guild.name} - ${message.guild.id}`, function(){})
    games.set(`${message.author.id}`, {
      game: true,
      gameId: no,
    })
    games.set(`${member.id}`, {
      game: true,
      gameId: no,
    })
    let x = args[1] || '❌';
    let o = args[2] || '⭕';
    gameStates.set(no, {
      game: new nano(message.member.user.username, member.user.username, x, o, '⬛'),
      xPlayer: [message.author.id, 'x'],
      oPlayer: [member.id, 'o'],
    })
    gameStates.get(no).turnPlayer = gameStates.get(no).xPlayer;
    let tic = gameStates.get(no);
    no++;
    message.channel.send(
      new Discord.MessageEmbed()
      .setTitle(`Tic Tac Toe`)
      .setDescription(`
      ${message.member.user.username} vs. ${member.user.username}
      ${tic.game.visualize()}
      `)
    )
  }

  if(cmd === 'move'){
    let move = args[0];
    if(!games.has(`${message.author.id}`)){
      return message.channel.send('You are not in a game!')
    }
    if(!args[0]){
      return message.channel.send('You must specify a move')
    }
    move = move.split('')
    move[0] = move[0].toUpperCase()
    let mo = move.join('')

    if(!validMoves.has(mo)){
      return message.channel.send('That is not a valid tic tac toe board square')
    }
    let player = games.get(`${message.author.id}`);
    let tic = gameStates.get(player.gameId)
    if(message.author.id != tic.turnPlayer[0]){
      return message.channel.send('It is not your turn')
    }else{
      let a = tic.game.turn(mo, tic.turnPlayer[1])
      if(a === false){
        return message.channel.send('Invalid Move')
      }else{
        message.channel.send(new Discord.MessageEmbed()
          .setTitle(`Tic Tac Toe`)
          .setDescription(`
          ${message.guild.members.cache.get(tic.xPlayer[0])} vs. ${message.guild.members.cache.get(tic.oPlayer[0])}
          ${tic.game.visualize()}
          `)
        )
        if(tic.game.didWin() != false && tic.game.didWin() != 'No one Wins'){
          message.channel.send(tic.game.didWin()+'\n***Game Movelog***\n'+tic.game.moveLog.join('\n'))
          games.delete(tic.xPlayer[0])
          games.delete(tic.oPlayer[0])
        //Turns out, I forgot to put the draw condition smh
        }else if(tic.game.board.A1!='' && tic.game.board.A2!='' && tic.game.board.A3!='' && tic.game.board.B1!='' && tic.game.board.B2!='' && tic.game.board.B3!='' && tic.game.board.C1!='' && tic.game.board.C2!='' && tic.game.board.C3!=''){
          message.channel.send('No Winner'+'\n***Game Movelog***\n'+tic.game.moveLog.join('\n'))
          games.delete(tic.xPlayer[0])
          games.delete(tic.oPlayer[0])
        }else{
          if(tic.turnPlayer === tic.xPlayer){
            tic.turnPlayer = tic.oPlayer
          }else{
            tic.turnPlayer = tic.xPlayer
          }
        }
      }
    }
  }

  if(cmd === 'end'){
    if(!games.has(`${message.author.id}`)){
      return message.channel.send('You are not in a game')
    }
    let p = games.get(`${message.author.id}`)
    let tic = gameStates.get(p.gameId)
    games.delete(`${tic.xPlayer[0]}`)
    games.delete(`${tic.oPlayer[0]}`)
    message.channel.send(
      new Discord.MessageEmbed()
      .setTitle(`Game Ended by ${message.author.username}`)
      .setDescription(`
        ${message.guild.members.cache.get(tic.xPlayer[0])} vs. ${message.guild.members.cache.get(tic.oPlayer[0])}
        ${tic.game.visualize()}
        **Movelog**
        ${tic.game.moveLog.join('\n')}
      `)
    )
  }

  if(cmd === 'board'){
    if(!games.has(`${message.author.id}`)){
      return message.channel.send('You are not in a game')
    }
    let p = games.get(`${message.author.id}`)
    let tic = gameStates.get(p.gameId)

    message.channel.send(
      new Discord.MessageEmbed()
      .setTitle(`Tic Tac Toe`)
      .setDescription(`
        ${message.guild.members.cache.get(tic.xPlayer[0])} vs. ${message.guild.members.cache.get(tic.oPlayer[0])}
        ${tic.game.visualize()}
      `)
    )
  }

  if(cmd === 'say'){
    if(!message.member.hasPermission('MANAGE_MESSAGES')){
      return message.channel.send('You must have permission to manage messages to use this command')
    }else{
      return message.channel.send(args.join(' '))
    }
  }

  if(cmd === 'how'){
    message.channel.send(
      new Discord.MessageEmbed()
      .setTitle('How to play Tic Tac Toe')
      .setDescription(`
      Tic Tac Toe is played on a 3x3 grid of squares:
      \` \` 1️⃣ 2️⃣ 3️⃣
      \`A\` ⬛|⬛|⬛
      \`B\` ⬛|⬛|⬛
      \`C\` ⬛|⬛|⬛
      One player is an x, and one player is an o. Both of you compete to have three letter in a row before the other player. You take turns by putting your letter in an empty square.
      When all 9 squares are occupied, the game is over. If neither player has three of their letters in a row, the game is a draw.
      `)
    )
  }
})

bot.login('TOKEN')
