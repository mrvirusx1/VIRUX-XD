module.exports = {
    command: "group",
    description: "All-in-one group management commands",
    category: "group",
    admin: true,
    owner: false,

    async execute(sock, m, { args, reply }) {
        if (!m.isGroup) return reply("❌ This command can only be used in groups.");

        const action = args[0]?.toLowerCase();
        const target = m.mentionedJid || (m.quoted ? [m.quoted.sender] : []);

        switch(action) {
            case "welcome":
                if (args[1] === "on") {
                    global.groupWelcome = global.groupWelcome || {};
                    global.groupWelcome[m.chat] = true;
                    await reply("✅ Welcome messages enabled.");
                } else if (args[1] === "off") {
                    global.groupWelcome = global.groupWelcome || {};
                    global.groupWelcome[m.chat] = false;
                    await reply("🛑 Welcome messages disabled.");
                } else {
                    await reply("Usage: .group welcome on/off");
                }
                break;

            case "kick":
                if (!target.length) return reply("Please mention the user to kick.");
                for (const jid of target) {
                    try {
                        await sock.groupParticipantsUpdate(m.chat, [jid], "remove");
                        await reply(`✅ Kicked @${jid.split("@")[0]}`);
                    } catch {
                        await reply(`❌ Failed to kick @${jid.split("@")[0]}`);
                    }
                }
                break;

            case "promote":
                if (!target.length) return reply("Please mention the user to promote.");
                for (const jid of target) {
                    try {
                        await sock.groupParticipantsUpdate(m.chat, [jid], "promote");
                        await reply(`✅ Promoted @${jid.split("@")[0]} to admin`);
                    } catch {
                        await reply(`❌ Failed to promote @${jid.split("@")[0]}`);
                    }
                }
                break;

            case "demote":
                if (!target.length) return reply("Please mention the user to demote.");
                for (const jid of target) {
                    try {
                        await sock.groupParticipantsUpdate(m.chat, [jid], "demote");
                        await reply(`✅ Demoted @${jid.split("@")[0]} from admin`);
                    } catch {
                        await reply(`❌ Failed to demote @${jid.split("@")[0]}`);
                    }
                }
                break;

            case "info":
                const groupMeta = await sock.groupMetadata(m.chat).catch(() => null);
                if (!groupMeta) return reply("❌ Unable to fetch group info.");
                const participants = groupMeta.participants.length;
                const admins = groupMeta.participants.filter(p => p.admin).length;
                const owner = groupMeta.owner.split("@")[0];

                await reply(`
👥 Group Name: ${groupMeta.subject}
🆔 Group ID: ${groupMeta.id}
📌 Owner: @${owner}
🧑‍🤝‍🧑 Participants: ${participants}
🛡️ Admins: ${admins}
📝 Description: ${groupMeta.desc || "No description"}
                `);
                break;

            case "mute":
                if (!["on","off"].includes(args[1])) return reply("Usage: .group mute on/off");
                try {
                    await sock.groupSettingUpdate(m.chat, args[1] === "on" ? "announcement" : "not_announcement");
                    await reply(`✅ Group messages ${args[1] === "on" ? "muted" : "unmuted"}`);
                } catch {
                    await reply("❌ Failed to update group settings.");
                }
                break;

            default:
                await reply(`
📌 *Group Manager Commands*
- .group welcome on/off : Enable or disable welcome messages
- .group kick @user : Kick a member
- .group promote @user : Promote a member
- .group demote @user : Demote a member
- .group info : Show group info
- .group mute on/off : Mute or unmute the group
                `);
        }
    }
};