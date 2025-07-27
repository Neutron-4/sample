require('dotenv').config();
const os = require('os');
const { execSync } = require('child_process');
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios'); // Install axios: npm install axios

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
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

    // Get Local IP Address (Machine IP)
    const networkInterfaces = os.networkInterfaces();
    let localIP = '❌ Not available';
    for (const interfaceName in networkInterfaces) {
        for (const interfaceDetails of networkInterfaces[interfaceName]) {
            if (interfaceDetails.family === 'IPv4' && !interfaceDetails.internal) {
                localIP = interfaceDetails.address;
                break;
            }
        }
    }

    // Get Public IP Address (via ipify API)
    let publicIP = '❌ Not available';
    try {
        const response = await axios.get('https://api.ipify.org?format=json');
        publicIP = response.data.ip;
    } catch (err) {
        console.warn('Unable to fetch public IP address.');
    }

    // Get Port (using environment variable or default to 3000 for HTTP server)
    const port = process.env.PORT ; // Default port to 3000 if not specified (common for web servers)

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
    console.log(`🌐 Local IP: ${localIP}`);
    console.log(`🌍 Public IP: ${publicIP}`);
    console.log(`🔌 Port: ${port}`);
});

client.login(process.env.TOKEN);