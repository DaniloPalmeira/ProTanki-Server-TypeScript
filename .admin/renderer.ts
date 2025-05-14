const needInviteCodeCheckbox = document.getElementById("needInviteCode") as HTMLInputElement;
const maxClientsInput = document.getElementById("maxClients") as HTMLInputElement;
const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => {
  console.log("Connected to WebSocket server");
};

ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    if (data.type === "config") {
      needInviteCodeCheckbox.checked = data.needInviteCode;
      maxClientsInput.value = data.maxClients.toString();
    }
  } catch (error) {
    console.error("Error processing WebSocket message:", error);
  }
};

ws.onclose = () => {
  console.log("WebSocket connection closed");
};

function updateConfig() {
  const needInviteCode = needInviteCodeCheckbox.checked;
  const maxClients = parseInt(maxClientsInput.value);
  if (isNaN(maxClients) || maxClients < 0) {
    console.error("Invalid maxClients value");
    return;
  }
  ws.send(JSON.stringify({
    type: "updateConfig",
    needInviteCode,
    maxClients,
  }));
}