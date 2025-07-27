const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();

// Utility function to check if Docker is installed and locate its path
function findDockerPath(callback) {
  exec('which docker', (error, stdout, stderr) => {
    if (error || stderr) {
      return callback('Docker is not installed or not found in the PATH.');
    }
    callback(null, stdout.trim());  // Return the full path to the Docker executable
  });
}

// Utility function to get a list of all Docker containers (both running and stopped)
function listDockerContainers(dockerPath, callback) {
  exec(`${dockerPath} ps -a --format "{{.ID}}: {{.Names}} - {{.Status}} - {{.Image}}"`, (error, stdout, stderr) => {
    if (error || stderr) {
      return callback(`Error fetching container list: ${stderr || error.message}`);
    }
    // Clean up and return the list of containers
    const containers = stdout.split('\n').filter(line => line.trim().length > 0);
    callback(null, containers);
  });
}

// Utility function to stop a Docker container
function stopDockerContainer(containerId, dockerPath, callback) {
  exec(`${dockerPath} stop ${containerId}`, (error, stdout, stderr) => {
    if (error || stderr) {
      return callback(`Error stopping container: ${stderr || error.message}`);
    }
    callback(null, `Container stopped successfully: ${stdout}`);
  });
}

// Utility function to check if the Docker daemon is running
function checkDockerDaemon(callback) {
  exec('systemctl is-active docker', (error, stdout, stderr) => {
    if (stderr || error || stdout.trim() !== 'active') {
      return callback('Docker daemon is not running!');
    }
    callback(null, 'Docker daemon is running.');
  });
}

// API to check Docker installation and path
app.get('/check-docker', (req, res) => {
  findDockerPath((err, dockerPath) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send(`Docker is installed at: ${dockerPath}`);
  });
});

// API to list all Docker containers (running and stopped)
app.get('/list-containers', (req, res) => {
  findDockerPath((err, dockerPath) => {
    if (err) {
      return res.status(500).send(err);
    }

    checkDockerDaemon((daemonErr, daemonStatus) => {
      if (daemonErr) {
        return res.status(500).send(daemonErr);
      }

      listDockerContainers(dockerPath, (listErr, containers) => {
        if (listErr) {
          return res.status(500).send(listErr);
        }

        if (containers.length === 0) {
          return res.send('No Docker containers found.');
        }

        const containerList = containers.join('<br>');
        res.send(`
          <h3>List of Docker Containers:</h3>
          <pre>${containerList}</pre>
        `);
      });
    });
  });
});

// API to stop a Docker container using its ID
app.get('/stop-container/:containerId', (req, res) => {
  const { containerId } = req.params;

  findDockerPath((err, dockerPath) => {
    if (err) {
      return res.status(500).send(err);
    }

    checkDockerDaemon((daemonErr, daemonStatus) => {
      if (daemonErr) {
        return res.status(500).send(daemonErr);
      }

      stopDockerContainer(containerId, dockerPath, (stopErr, result) => {
        if (stopErr) {
          return res.status(500).send(stopErr);
        }
        res.send(result);
      });
    });
  });
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
