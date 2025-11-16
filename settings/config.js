
// 漏 2025 MRVIRUSX. All Rights Reserved.
// respect the work, don鈥檛 just copy-paste.

const fs = require('fs')

const config = {
    owner: "MRVIRUSX",
    botNumber: "263714373922",
    setPair: "K0MRAID1",
    thumbUrl: "https://imgur.com/a/4OJ6BIz",
    session: "sessions",
    status: {
        public: true,
        terminal: true,
        reactsw: false
    },
    message: {
        owner: "no, this is for owners only",
        group: "this is for groups only",
        admin: "this command is for admin only",
        private: "this is specifically for private chat"
    },
    mess: {
        owner: 'This command is only for the bot owner!',
        done: 'Mode changed successfully!',
        error: 'Something went wrong!',
        wait: 'Please wait...'
    },
    settings: {
        title: "Simple WA Base Bot",
        packname: 'MRVIRUSX-BOT',
        description: "this script was created by Mrvirusx",
        author: 'https://github.com/mrvirusx1',
        footer: "饾棈饾柧饾梾饾柧饾梹饾棆饾柡饾梿: @mrvirusxxx"
    },
    newsletter: {
        name: "MRVIRUSX-BOT",
        id: "0@newsletter"
    },
    api: {
        baseurl: "https://hector-api.vercel.app/",
        apikey: "hector"
    },
    sticker: {
        packname: "MRVIRUSX-BOT",
        author: "MRVIRUSX"
    }
}

module.exports = config;

let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
  require('fs').unwatchFile(file)
  console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m')
  delete require.cache[file]
  require(file)
})
