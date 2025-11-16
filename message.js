const config = require('./settings/config');
const fs = require('fs');
const crypto = require("crypto");
const path = require("path");
const os = require('os');
const chalk = require("chalk");
const axios = require('axios');
const { exec } = require('child_process');
const { dechtml, fetchWithTimeout } = require('./library/function');
const { tempfiles } = require("./library/uploader");
const { fquoted } = require('./library/quoted');
const Api = require('./library/Api');

const image = fs.readFileSync('./thumbnail/image.jpg');
const docu = fs.readFileSync('./thumbnail/document.jpg');

let jidNormalizedUser, getContentType, isPnUser;

const loadBaileysUtils = async () => {
    const baileys = await import('@whiskeysockets/baileys');
    jidNormalizedUser = baileys.jidNormalizedUser;
    getContentType = baileys.getContentType;
    isPnUser = baileys.isPnUser;
};

// Plugin Loader System with Menu Categorization
class PluginLoader {
    constructor() {
        this.plugins = new Map();
        this.categories = new Map();
        this.pluginsDir = path.join(__dirname, 'plugins');
        this.defaultCategories = {
            'ai': '🤖 AI MENU',
            'downloader': '📥 DOWNLOAD MENU',
            'fun': '🎮 FUN MENU',
            'general': '⚡ GENERAL MENU',
            'group': '👥 GROUP MENU',
            'owner': '👑 OWNER MENU',
            'other': '📦 OTHER MENU',
            'tools': '🛠️ TOOLS MENU',
            'video': '🎬 VIDEO MENU'
        };
        this.loadPlugins();
    }

    loadPlugins() {
        try {
            if (!fs.existsSync(this.pluginsDir)) {
                fs.mkdirSync(this.pluginsDir, { recursive: true });
                console.log(chalk.cyan('📁 Created plugins directory'));
                return;
            }

            const pluginFiles = fs.readdirSync(this.pluginsDir).filter(file =>
                file.endsWith('.js') && !file.startsWith('_')
            );

            this.plugins.clear();
            this.categories.clear();

            Object.keys(this.defaultCategories).forEach(cat => {
                this.categories.set(cat, []);
            });

            for (const file of pluginFiles) {
                try {
                    const pluginPath = path.join(this.pluginsDir, file);
                    const plugin = require(pluginPath);

                    if (plugin.command && typeof plugin.execute === 'function') {
                        if (!plugin.category) {
                            plugin.category = 'general';
                        }

                        if (!this.categories.has(plugin.category)) {
                            this.categories.set(plugin.category, []);
                        }

                        this.plugins.set(plugin.command, plugin);
                        this.categories.get(plugin.category).push(plugin.command);

                        console.log(chalk.green(`✅ Loaded plugin: ${plugin.command} (${plugin.category})`));
                    } else {
                        console.log(chalk.yellow(`⚠️ Invalid plugin structure in: ${file}`));
                    }
                } catch (error) {
                    console.log(chalk.red(`❌ Failed to load plugin ${file}:`, error.message));
                }
            }

            console.log(chalk.cyan(`📦 Loaded ${this.plugins.size} plugins across ${this.categories.size} categories`));
        } catch (error) {
            console.log(chalk.red('❌ Error loading plugins:', error.message));
        }
    }

    async executePlugin(command, sock, m, args, text, q, quoted, mime, qmsg, isMedia, groupMetadata,
        groupName, participants, groupOwner, groupAdmins, isBotAdmins, isAdmins, isGroupOwner, isCreator,
        prefix, reply, sender) {

        const plugin = this.plugins.get(command);
        if (!plugin) return false;

        try {
            if (plugin.owner && !isCreator) return true;
            if (plugin.group && !m.isGroup) return true;
            if (plugin.admin && m.isGroup && !isAdmins && !isCreator) return true;

            await plugin.execute(sock, m, {
                args, text, q, quoted, mime, qmsg, isMedia, groupMetadata, groupName,
                participants, groupOwner, groupAdmins, isBotAdmins, isAdmins,
                isGroupOwner, isCreator, prefix, reply, config, sender
            });

            return true;
        } catch (error) {
            console.log(chalk.red(`❌ Error executing plugin ${command}:`, error));
            return true;
        }
    }

    getMenuSections() {
        const sections = [];

        const sortedCategories = Array.from(this.categories.entries())
            .filter(([category, cmds]) => cmds.length > 0 && this.defaultCategories[category])
            .sort(([a], [b]) => this.defaultCategories[a].localeCompare(this.defaultCategories[b]));

        for (const [category, commands] of sortedCategories) {
            const categoryName = this.defaultCategories[category];
            const sortedCommands = commands.sort();
            const commandList = sortedCommands.map(cmd => {
                const plugin = this.plugins.get(cmd);
                return `   ▢ ${cmd}${plugin.description ? ` - ${plugin.description}` : ''}`;
            }).join('\n');

            sections.push(`💠 *${categoryName}*\n${commandList}`);
        }

        return sections.join('\n\n');
    }

    getPluginCount() {
        let count = 0;
        for (const cmds of this.categories.values()) {
            count += cmds.length;
        }
        return count;
    }

    reloadPlugins() {
        const pluginFiles = fs.readdirSync(this.pluginsDir).filter(file =>
            file.endsWith('.js') && !file.startsWith('_')
        );

        for (const file of pluginFiles) {
            const pluginPath = path.join(this.pluginsDir, file);
            delete require.cache[require.resolve(pluginPath)];
        }

        this.loadPlugins();
    }
}

const pluginLoader = new PluginLoader();

module.exports = sock = async (sock, m, chatUpdate, store) => {
    try {
        if (!jidNormalizedUser) await loadBaileysUtils();

        const body = (
            m.mtype === "conversation" ? m.message.conversation :
            m.mtype === "imageMessage" ? m.message.imageMessage.caption :
            m.mtype === "videoMessage" ? m.message.videoMessage.caption :
            m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text :
            m.mtype === "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId :
            m.mtype === "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
            m.mtype === "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId :
            m.mtype === "interactiveResponseMessage" ?
                JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson).id :
            m.mtype === "messageContextInfo" ?
                m.message.buttonsResponseMessage?.selectedButtonId ||
                m.message.listResponseMessage?.singleSelectReply.selectedRowId : m.text
        );

        const sender = m.key.fromMe ? sock.user.id.split(":")[0] + "@s.whatsapp.net" :
            m.key.participant || m.key.remoteJid;

        const senderNumber = sender.split('@')[0];
        const budy = typeof m.text === "string" ? m.text : "";
        const prefixRegex = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤Ω_&><`™©®Δ^βα~¦|/\\©^]/;
        const prefix = prefixRegex.test(body) ? body.match(prefixRegex)[0] : '.';

        const from = m.key.remoteJid;
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';

        const args = body.trim().split(/ +/).slice(1);
        const text = q = args.join(" ");
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';
        const qmsg = (quoted.msg || quoted);
        const isMedia = /image|video|sticker|audio/.test(mime);

        const groupMetadata = m.isGroup ? await sock.groupMetadata(from).catch(() => ({})) : {};
        const groupName = groupMetadata.subject || "";
        const participants = m.isGroup ? groupMetadata.participants || [] : [];

        const groupOwner = groupMetadata.owner || "";
        const groupAdmins = participants
            .filter(p => p.admin === "admin" || p.admin === "superadmin")
            .map(p => p.id);

        const botNumber = await sock.decodeJid(sock.user.id);
        const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false;
        const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;
        const isGroupOwner = m.isGroup ? groupOwner === m.sender : false;
        const isCreator = jidNormalizedUser(m.sender) === jidNormalizedUser(botNumber);

        async function reply(txt) {
            sock.sendMessage(from, { text: txt }, { quoted: m });
        }

        const pluginExecuted = await pluginLoader.executePlugin(
            command, sock, m, args, text, q, quoted, mime, qmsg, isMedia,
            groupMetadata, groupName, participants, groupOwner, groupAdmins,
            isBotAdmins, isAdmins, isGroupOwner, isCreator, prefix, reply, sender
        );

        if (pluginExecuted) return;

        switch (command) {

            case 'menu': {
                const usedMem = process.memoryUsage().heapUsed / 1024 / 1024;
                const totalMem = os.totalmem() / 1024 / 1024 / 1024;
                const memPercent = (usedMem / (totalMem * 1024)) * 100;
                const ramBar = '█'.repeat(Math.floor(memPercent / 20)) +
                    '▒'.repeat(5 - Math.floor(memPercent / 20));

                const uptimeSec = process.uptime();
                const days = Math.floor(uptimeSec / (3600 * 24));
                const hours = Math.floor((uptimeSec % (3600 * 24)) / 3600);
                const minutes = Math.floor((uptimeSec % 3600) / 60);
                const seconds = Math.floor(uptimeSec % 60);
                const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

                const ping = Date.now() - m.messageTimestamp * 1000;
                const host = os.platform();
                const mode = sock.public ? 'Public' : 'Self';

                const pluginMenuSections = pluginLoader.getMenuSections();
                const totalCommands = pluginLoader.getPluginCount();

                const K0MRAID = `
⧉══⧉ *MRVIRUSX BOT MENU* ⧉══⧉
┃👑 *Owner:* Mrvirusx
┃⌗ *Prefix:* .
┃💻 *Host:* ${host}
┃⚙️ *Mode:* ${mode}
┃📌 *Commands:* ${totalCommands}
┃⏳ *Uptime:* ${uptime}
┃⚡ *Ping:* ${ping.toFixed(0)} ms
┃📊 *RAM:* [${ramBar}] ${memPercent.toFixed(2)}%
⧉══════════════════════⧉

${pluginMenuSections}

⧉══⧉ Powered by *MRVIRUSX* ⧉══⧉`;

                await sock.sendMessage(from, {
                    image: image,
                    caption: K0MRAID
                }, { quoted: m });

                break;
            }

            case 'reload': {
                if (!isCreator) return;
                pluginLoader.reloadPlugins();
                await reply(`🔄 Plugins Reloaded!\n📦 Total Commands: ${pluginLoader.getPluginCount()}`);
                break;
            }
        }

    } catch (err) {
        console.log(err);
    }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log('Updated:', __filename);
    delete require.cache[file];
    require(file);
});