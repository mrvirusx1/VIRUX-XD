module.exports = {
    command: 'randomreact', // can keep as plugin name
    description: 'Automatically react with a random emoji to every message',
    category: 'fun',
    execute: async (sock, m, {
        reply,
        isGroup,
        text,
        q,
        quoted,
        participants,
        isBot
    }) => {

        // Don't react to bot's own messages
        if (isBot) return;

        // List of random emojis
        const emojis = ['😂','🤣','😎','😍','😜','🤖','💀','🔥','💯','😏','🥶','🤯','👀','💡','✨','🎉','🙌','👍'];

        // Pick one randomly
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];

        // Reply with random emoji
        await reply(emoji);
    }
};