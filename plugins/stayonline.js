module.exports = {
    command: "stayonline",
    description: "Keep the bot online with periodic activity",
    category: "owner",
    owner: true,
    intervalId: null,

    async execute(sock, m, { reply }) {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            await reply("🛑 Stay Online mode stopped.");
            return;
        }

        await reply("✅ Stay Online mode activated. The bot will now stay online.");

        this.intervalId = setInterval(async () => {
            try {
                await sock.sendPresenceUpdate('composing', m.chat);
                console.log(`[STAY ONLINE] Ping sent at ${new Date().toLocaleTimeString()}`);
            } catch (err) {
                console.log('[STAY ONLINE] Error:', err.message);
            }
        }, 300000);
    }
};