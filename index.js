require('dotenv').config();
const os = require('os');
const { execSync } = require('child_process');
const { Client, GatewayIntentBits } = require('discord.js');
const https = require('https');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// Function to get the public IP using an external service
function getPublicIP() {
    return new Promise((resolve, reject) => {
        https.get('https://api.ipify.org', (res) => {
            let data = '';
            res.on('data', chunk => (data += chunk));
            res.on('end', () => resolve(data.trim()));
        }).on('error', err => reject(err));
    });
}

// Get local IP address
function getPrivateIP() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '❌ Not found';
}

// Get exact CPU model
function getExactCpuModel() {
    try {
        if (process.platform === 'linux') {
            return execSync("lscpu | grep 'Model name' | awk -F ':' '{print $2}'").toString().trim();
        } else if (process.platform === 'win32') {
            return execSync("wmic cpu get Name").toString().split('\n')[1].trim();
        } else if (process.platform === 'darwin') {
            return execSync("sysctl -n machdep.cpu.brand_string").toString().trim();
        } else {
            return os.cpus()[0].model;
        }
    } catch (err) {
        return os.cpus()[0].model;
    }
}

client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}\n`);

    // CPU Info
    const exactCpuModel = getExactCpuModel();
    const coreCount = os.cpus().length;
    const cpuSpeed = os.cpus()[0].speed;

    // RAM Info
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const usedMem = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2);

    // Disk Info
    let diskInfo = '❌ Not available';
    try {
        const df = execSync("df -h / | tail -1").toString().split(/\s+/);
        diskInfo = `${df[2]} used / ${df[1]} total`;
    } catch (err) {
        console.warn('Disk usage not accessible in this environment.');
    }

    // IP Info
    let publicIP = '❌ Could not fetch';
    try {
        publicIP = await getPublicIP();
    } catch (err) {
        console.warn('Public IP fetch failed:', err.message);
    }

    const privateIP = getPrivateIP();

    // Benchmark Test
    const start = Date.now();
    let x = 0;
    for (let i = 0; i < 1e8; i++) {
        x += i;
    }
    const benchmarkTime = Date.now() - start;

    // Final Log
    console.log("📊 Server Specifications:");
    console.log(`🧠 CPU: ${exactCpuModel}`);
    console.log(`🔢 Cores: ${coreCount}`);
    console.log(`⚡ Speed: ${cpuSpeed} MHz`);
    console.log(`💾 RAM: ${usedMem} GB used / ${totalMem} GB total`);
    console.log(`🗄️ Disk: ${diskInfo}`);
    console.log(`🌐 Public IP: ${publicIP}`);
    console.log(`🏠 Private IP: ${privateIP}`);
    console.log(`🧮 CPU Benchmark (loop): ${benchmarkTime} ms`);
});

client.login(process.env.TOKEN);

