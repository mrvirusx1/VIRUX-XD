const CHANNEL_JID = "0029VbBcAeSGOj9hYmE5WZ1s@s.whatsapp.net"; // Your channel/group JID

module.exports = {
    command: 'forcejoin',
    description: 'Users must join a specific group/channel to use the bot',
    category: 'general',
    execute: async (sock, m, { reply, text }) => {
        try {
            // Fetch group metadata
            const meta = await sock.groupMetadata(CHANNEL_JID).catch(() => null);
            if (!meta) return reply(`❌ Channel not found. Please join: https://whatsapp.com/channel/0029VbBcAeSGOj9hYmE5WZ1s`);

            const participants = meta.participants.map(p => p.id);
            if (!participants.includes(m.sender)) {
                return reply(`⚠️ You must join the official channel to use this bot:\nhttps://whatsapp.com/channel/0029VbBcAeSGOj9hYmE5WZ1s`);
            }

            // If user is in the channel
            await reply(`✅ You are a member! You can use the bot now.`);
        } catch (err) {
            console.error("Force join error:", err);
            await reply("❌ Error verifying channel membership. Try again later.");
        }
    }
};