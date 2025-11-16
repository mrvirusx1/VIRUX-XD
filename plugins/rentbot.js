module.exports = {
    command: 'rentbot',
    description: 'Rent MRVIRUSX bot for $1/week',
    category: 'owner',
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
        config,
        isOwner
    }) => {

        const message = `
[ ⚠ RENT MRVIRUSX BOT ⚠ ]

PRICE: $1 / Week
PAYMENT NUMBER: +263714373922
NAME: MRVIRUSX

AFTER PAYMENT:
• Send screenshot of payment
• Send your WhatsApp number
• Bot will be deployed to your group

[ STATUS: WAITING FOR PAYMENT ✔ ]
        `.trim();

        await reply(message);
    }
};