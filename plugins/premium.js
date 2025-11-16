const fs = require("fs");
const path = require("path");

let premium = [];
const premiumFile = path.join(__dirname, "premium.json");
const EXPIRE_MS = 4 * 24 * 60 * 60 * 1000; // 4 days

// Load premium users
if (fs.existsSync(premiumFile)) {
    try {
        const data = fs.readFileSync(premiumFile);
        premium = JSON.parse(data);
    } catch (e) { console.error(e); }
}

const savePremium = () => fs.writeFileSync(premiumFile, JSON.stringify(premium, null, 2));

const cleanExpired = () => {
    const now = Date.now();
    premium = premium.filter(p => p.expiry > now);
    savePremium();
};
setInterval(cleanExpired, 60*60*1000); // clean every hour

module.exports = {
    command: 'premium',
    description: 'Manage premium users (4 days expiry)',
    category: 'owner',
    execute: async (sock, m, { args, reply }) => {
        cleanExpired();
        const sub = args[0];
        const jid = args[1];
        if (!sub || !jid) return reply("Usage: .premium <add|remove|list> <jid>");

        if (sub === 'add') {
            premium.push({ jid, expiry: Date.now() + EXPIRE_MS });
            savePremium();
            return reply(`✅ Added premium: ${jid} (expires in 4 days)`);
        }

        if (sub === 'remove') {
            premium = premium.filter(p => p.jid !== jid);
            savePremium();
            return reply(`❌ Removed premium: ${jid}`);
        }

        if (sub === 'list') {
            let list = premium.map(p => `${p.jid} — Expires: ${new Date(p.expiry).toLocaleString()}`);
            return reply(`📌 Premium users:\n${list.join("\n")}`);
        }

        reply("❌ Invalid subcommand. Use add, remove, or list.");
    }
};