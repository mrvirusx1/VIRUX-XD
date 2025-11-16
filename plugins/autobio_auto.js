module.exports = {
    command: 'autobio_auto',
    description: 'Auto-run bio changer on bot startup',
    category: 'system',
    execute: async (sock, m, {
        isBot
    }) => {
        // Only trigger once (when bot boots)
        if (!isBot) return;

        const bios = [
            '⚡ MRVIRUSX Bot Online',
            '🤖 Powering Chats',
            '🔥 Cybersecurity Mode',
            '💻 Xevision Hackers',
            '👑 Owner: MRVIRUSX',
            '💯 Always Active',
            '🛡 System Secured'
        ];

        console.log("🚀 AutoBio Started (Auto Triggered)");

        setInterval(async () => {
            const bio = bios[Math.floor(Math.random() * bios.length)];
            try {
                await sock.updateProfileStatus(bio);
                console.log(`[AUTO-BIO] Updated to: ${bio}`);
            } catch (err) {
                console.log("❌ AutoBio Error:", err.message);
            }
        }, 3000);
    }
};