module.exports = {
    command: "autoreact",
    description: "Auto react to messages & view statuses automatically",
    category: "tools",
    owner: true,

    active: false,
    emoji: "🌠",

    async execute(sock, m, { reply }) {
        this.active = !this.active;
        await reply(`✅ Auto React & Status Viewer is now ${this.active ? "activated" : "deactivated"}.`);
    },

    async onMessage(sock, m) {
        if (!this.active) return;
        try {
            await sock.sendMessage(m.chat, { react: { text: this.emoji, key: m.key } });
        } catch (err) {
            console.log("[AUTO REACT] Error:", err.message);
        }
    },

    async checkStatuses(sock) {
        if (!this.active) return;

        try {
            const statuses = await sock.status?.get() || [];
            for (const story of statuses) {
                if (!story.viewed) await sock.status?.sendView(story.id).catch(() => {});
                const ownerJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
                await sock.sendMessage(ownerJid, { text: `[STATUS VIEW] ${story.senderName || story.id} status viewed.` });
            }
        } catch (err) {
            console.log("[STATUS VIEW] Error:", err.message);
        }
    }
};