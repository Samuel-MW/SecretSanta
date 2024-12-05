userName = ""
userUUID = ""
entered = false
connected = false

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}  

function getId(id) {
    return document.getElementById(id);
}

function nameChanged(element) {
    userName = element.value;
    getId("connectSocket").disabled = userName == "";
}

function addMessage(message) {
    if (getId("serverMessages").innerText != "") {
        getId("serverMessages").innerHTML += "</br>";
    }
    getId("serverMessages").innerText += message;
}

function clearMessages() {
    getId("serverMessages").innerHTML = "";
}


document.getElementById('connectSocket').addEventListener('click', () => {

    getId("preConnection").style.display = "None";

    addMessage("Connecting to server...");

    const socket = new WebSocket('wss://' + window.location.hostname);

    socket.onopen = () => {
        console.log('Connected to WebSocket server!');
        userName = userName.replaceAll(";", " ");
        userUUID = uuidv4();

        socket.send('NewUser;' + userName + ";" + userUUID);
    };
    
    socket.onmessage = (event) => {
        console.log('Message from server:', event.data);
        if (event.data == "/clear") {
            clearMessages();
        } else if (event.data == "/biggerText") {
            getId("serverMessages").classList.remove("smallerText");
            getId("serverMessages").classList.add("biggerText");
        } else if (event.data == "/dotDotDot") {
            setTimeout(()=>{
                getId("serverMessages").innerText += ".";
            }, 1000);
            setTimeout(()=>{
                getId("serverMessages").innerText += ".";
            }, 2000);
            setTimeout(()=>{
                getId("serverMessages").innerText += ".";
            }, 3000);
        } else {
            addMessage(event.data);
        }
    };
    
    socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
    };
    
    socket.onclose = () => {
        console.log('WebSocket connection closed');
    };
});
