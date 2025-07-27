const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = process.env.PORT || 3000;

// Homepage
app.get('/', (req, res) => {
  res.send('<h1>Hello from inside Docker!</h1><p>Go to <a href="/docker/stop">/docker/stop</a> to stop this container.</p>');
});

// Stop the container
app.get('/docker/stop', (req, res) => {
  res.send('Stopping container...');

  // Find this container ID from hostname and stop it using docker CLI
  const containerId = require('os').hostname();

  console.log(`[INFO] Attempting to stop container ID: ${containerId}`);

  exec(`docker stop ${containerId}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`[ERROR] Failed to stop container: ${stderr}`);
      return;
    }
    console.log(`[SUCCESS] Docker said: ${stdout}`);
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
