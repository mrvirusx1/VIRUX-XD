const fs = require("fs");
const path = require("path");

// Owner list
let owners = ["263714373922", "263780667006"];
const ownersFile = path.join(__dirname, "owners.json");

// Load from JSON if exists
if (fs.existsSync(ownersFile)) {
    try {
        const data = fs.readFileSync(ownersFile);
        const arr = JSON.parse(data);
        if (Array.isArray(arr)) owners = arr;
    } catch (e) { console.error(e); }
}

// Save owners
const saveOwners = () => fs.writeFileSync(ownersFile, JSON.stringify(owners, null, 2));

module.exports = {
    command: 'owner',
    description: 'Manage bot owners',
    category: 'owner',
    execute: async (sock, m, { args, reply }) => {
        const sub = args[0];
        const jid = args[1];
        if (!sub || !jid) return reply("Usage: .owner <add|remove|list> <jid>");

        if (sub === 'add') {
            if (!owners.includes(jid)) owners.push(jid);
            saveOwners();
            return reply(`✅ Added owner: ${jid}`);
        }

        if (sub === 'remove') {
            owners = owners.filter(o => o !== jid);
            saveOwners();
            return reply(`❌ Removed owner: ${jid}`);
        }

        if (sub === 'list') {
            return reply(`📌 Owners:\n${owners.join("\n")}`);
        }

        reply("❌ Invalid subcommand. Use add, remove, or list.");
    }
};