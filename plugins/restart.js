module.exports = {
    command: 'restart',
    description: 'Restart the bot (owner only)',
    category: 'owner',
    execute: async (sock, m, { args, text, q, quoted, mime, qmsg, isMedia, groupMetadata, groupName, participants, groupOwner, groupAdmins, isBotAdmins, isAdmins, isGroupOwner, isCreator, prefix, reply, config, isOwner }) => {
        if (!isOwner) return await reply('❌ Owner only.');
        await reply('♻️ Restarting bot...');
        process.exit(0);
    }
};