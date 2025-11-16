module.exports = {
    command: 'addprem',
    description: 'Add premium user',
    category: 'owner',
    execute: async (sock, m, { reply, args, isCreator }) => {

        if (!isCreator) return reply("Owner Only.");

        const num = args[0];
        if (!num) return reply("Use: .addprem 263xxxxxxxxx");

        await reply(`✔ Premium Added: ${num}`);
    }
};