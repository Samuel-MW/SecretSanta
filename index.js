const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

// Create an Express app
const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create an HTTP server for Express
const server = http.createServer(app);

// Create a WebSocket server that shares the same HTTP server
const wss = new WebSocket.Server({ server });

users = []
function addUser(name, uuid, ws) {
    users.push({
        "name": name,
        "uuid": uuid,
        "websocket": ws,
        "assignedUser": ""
    });
}

wss.on('connection', (ws) => {
    console.log('Recived connection!');
    
    // When the server receives a message from the client
    ws.on('message', (message) => {
        console.log('Received:', message.toString());
        text = message.toString();

        if (text.startsWith("NewUser")) {
            data = text.split(";");

            userName = data[1];
            userUUID = data[2];
            console.log("new user with uuid " + userUUID + " and name " + userName)
            addUser(userName, userUUID, ws);
            ws.send("Joined as '"+ userName +"'");
        }
    });

    ws.send('Successfully connected!');
});

server.listen(8080, () => {
    console.log('Server is listening on port 8080 (HTTP + WebSocket)');
    waitForPrompt();
});

const readline = require('readline');

const readLineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise((resolve) => readLineInterface.question(query, resolve));
}
  
async function waitForPrompt() {
    try {
        const _ = await askQuestion('Press enter when you are ready to start the selection\n');

        console.log("Beginning the selection");
        const usersCopy = [...users];
        
        for (let i = usersCopy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [usersCopy[i], usersCopy[j]] = [usersCopy[j], usersCopy[i]];
        }

        for (let i = 0; i < users.length; i++) {
            if (users[i].uuid == usersCopy[i].uuid) {
                for (let j = i + 1; j < users.length; j++) {
                    if (users[j].uuid != usersCopy[j].uuid) {
                        [usersCopy[i], usersCopy[j]] = [usersCopy[j], usersCopy[i]];
                        break;
                    }
                }
            }
            users[i].assignedUser = usersCopy[i].name;
        }
        console.log("Selected users");

        for (user of users) {
            user.websocket.send("/clear")
            user.websocket.send("/biggerText")
            user.websocket.send("Drumroll please")
            user.websocket.send("/dotDotDot")
        }
        console.log("Drumrolling");
        setTimeout(
            () => {
                for (user of users) {
                    user.websocket.send("/clear")
                    user.websocket.send("Your secret santa is: " + user.assignedUser + ".")
                }
                console.log("Sent out user picks!");
            },
        5000);

        readLineInterface.close();
    } catch (err) {
        console.error('Error reading input:', err);
    }
}
