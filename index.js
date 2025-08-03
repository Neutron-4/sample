require('dotenv').config();
const os = require('os');
const { execSync } = require('child_process');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}\n`);
    
    // CPU Info
    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const coreCount = cpus.length;
    const cpuSpeed = cpus[0].speed;

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

    // Benchmark Test
    const start = Date.now();
    let x = 0;
    for (let i = 0; i < 1e8; i++) {
        x += i;
    }
    const benchmarkTime = Date.now() - start;

    // Final Log
    console.log("📊 Server Specifications:");
    console.log(`🧠 CPU: ${cpuModel}`);
    console.log(`🔢 Cores: ${coreCount}`);
    console.log(`⚡ Speed: ${cpuSpeed} MHz`);
    console.log(`💾 RAM: ${usedMem} GB used / ${totalMem} GB total`);
    console.log(`🗄️ Disk: ${diskInfo}`);
    console.log(`🧮 CPU Benchmark (loop): ${benchmarkTime} ms`);



    let exactCpuModel = 'Unknown';

try {
    if (process.platform === 'linux') {
        exactCpuModel = execSync("lscpu | grep 'Model name' | awk -F ':' '{print $2}'").toString().trim();
    } else if (process.platform === 'win32') {
        exactCpuModel = execSync("wmic cpu get Name").toString().split('\n')[1].trim();
    } else if (process.platform === 'darwin') {
        exactCpuModel = execSync("sysctl -n machdep.cpu.brand_string").toString().trim();
    }
} catch (err) {
    console.warn('Unable to fetch exact CPU model:', err.message);
}


    console.log(`🧠 CPU: ${exactCpuModel}`);

});

client.login(process.env.TOKEN);
