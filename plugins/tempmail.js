const axios = require("axios");

module.exports = {
    command: 'tempmail',
    description: 'Generate a temporary email and check inbox',
    category: 'tools',

    execute: async (sock, m, {
        args,
        text,
        q,
        quoted,
        mime,
        qmsg,
        isMedia,
        groupMetadata,
        groupName,
        participants,
        groupOwner,
        groupAdmins,
        isBotAdmins,
        isAdmins,
        isGroupOwner,
        isCreator,
        prefix,
        reply,
        config
    }) => {

        try {
            // If user wants a new temp email
            if (args[0] === "new") {
                const dom = await axios.get("https://api.mail.gw/domains");
                const domain = dom.data.domains[0].domain;

                const email = `mrvirusx_${Math.random().toString(36).slice(2)}@${domain}`;
                const password = Math.random().toString(36).slice(2);

                // Create account
                const acc = await axios.post("https://api.mail.gw/accounts", {
                    address: email,
                    password
                });

                global.tempMail = { email, password };

                return reply(
                    `📮 *TEMP MAIL CREATED*\n\n` +
                    `📧 Email: *${email}*\n` +
                    `🔑 Password: *${password}*\n\n` +
                    `👉 Use *${prefix}tempmail inbox* to check messages`
                );
            }

            // If user wants inbox
            if (args[0] === "inbox") {
                if (!global.tempMail) return reply("❗ No tempmail created yet.\nUse: *!tempmail new*");

                // Login + get token
                const login = await axios.post("https://api.mail.gw/token", {
                    address: global.tempMail.email,
                    password: global.tempMail.password
                });

                const token = login.data.token;

                // Fetch inbox
                const inbox = await axios.get("https://api.mail.gw/messages", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (inbox.data.total === 0) return reply("📭 Inbox empty.");

                let list = `📬 *TEMPMAIL INBOX (${inbox.data.total})*\n\n`;
                
                inbox.data.messages.forEach(msg => {
                    list += `📨 *From:* ${msg.from.address}\n`;
                    list += `📌 *Subject:* ${msg.subject}\n`;
                    list += `🆔 ID: ${msg.id}\n\n`;
                });

                return reply(list);
            }

            // Help message
            return reply(
                `📧 *TEMPMAIL COMMANDS*\n\n` +
                `🔹 *${prefix}tempmail new* — Generate a temp email\n` +
                `🔹 *${prefix}tempmail inbox* — Check inbox messages\n`
            );

        } catch (e) {
            console.log(e);
            return reply("❌ Error fetching temp mail API.");
        }
    }
};