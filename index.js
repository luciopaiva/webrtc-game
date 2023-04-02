
let connection;

function createHostPeer() {
    const peer = new Peer();

    function composeUrl(peerId) {
        const params = new URLSearchParams();
        params.set("peer", peerId);
        return `${window.location.origin}${window.location.pathname}?${params}`;
    }

    function onOpen(id) {
        showMessage(`My peer ID is: ${id}`);
        const encodedMessage = encodeURIComponent("");
        const url = composeUrl(id);
        const encodedUrl = encodeURIComponent(url);
        const link = `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`;
        console.info(link);

        document.getElementById("invite-link").setAttribute("href", url);

        new QRCode(document.getElementById("invite-qr"), {
            text: link,
            width: 192,
            height: 192,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    }

    peer.on('open', onOpen);

    peer.on('connection', (conn) => {
        connection = conn;
        toggleInvitationCard(false);
        showMessage(`Peer connected: ${connection.peer}`);

        connection.on('data', (data) => {
            showMessage(`Other peer said: ${data}`);
        });
    });
}

function tryReadPeerId() {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const encodedPeer = params.get("peer");
    if (encodedPeer) {
        return decodeURIComponent(encodedPeer);
    }
    return undefined;
}

function createInvitedPeer(hostId) {
    const peer = new Peer();

    peer.on('open', (id) => {
        showMessage(`My peer ID is: ${id}`);

        connection = peer.connect(hostId);
        console.log('Connecting to peer:', hostId);

        connection.on('open', () => {
            showMessage(`Connected to peer: ${connection.peer}`);

            connection.on('data', (data) => {
                showMessage(`Other peer said: ${data}`);
            });
        });
    });
}

function toggleInvitationCard(toggle) {
    const card = document.getElementById("invite-card");
    if (toggle) {
        card.classList.remove("hidden");
    } else {
        card.classList.add("hidden");
    }
}

function showMessage(message) {
    const box = document.getElementById("message-box");
    const entry = document.createElement("div");
    const date = document.createElement("span");
    date.classList.add("date");
    date.innerText = (new Date()).toISOString();
    const msg = document.createElement("span");
    msg.classList.add("message");
    msg.innerText = message;
    entry.appendChild(date);
    entry.appendChild(msg);
    box.insertBefore(entry, box.firstChild);
}

function setupMessageInput() {
    const input = document.getElementById("input-msg");
    input.addEventListener("keyup", e => {
        if (e.key === "Enter") {
            const msg = input.value;
            connection.send(msg);
            showMessage(`You said: ${msg}`);
            input.value = "";
        }
    });
}

(function main() {
    console.info((new Date()).toISOString());

    const hostPeer = tryReadPeerId();
    if (hostPeer) {
        createInvitedPeer(hostPeer);
    } else {
        toggleInvitationCard(true);
        createHostPeer();
    }

    setupMessageInput();
})();
