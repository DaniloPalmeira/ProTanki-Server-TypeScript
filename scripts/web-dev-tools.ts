import express from "express";
import { PacketService } from "../src/packets/PacketService";
import { ResourcePathUtils } from "../src/utils/ResourcePathUtils";
import logger from "../src/utils/Logger";

const app = express();
const port = 8081;

logger.transports.forEach((t) => (t.silent = true));

const packetService = new PacketService();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const getPageHTML = () => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ProTanki Dev Tools</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: auto; max-width: 800px; padding: 2em; background-color: #f4f4f9; color: #333; }
        fieldset { border: 1px solid #ccc; border-radius: 8px; padding: 1em 1.5em; margin-bottom: 2em; background-color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        legend { font-weight: bold; font-size: 1.2em; padding: 0 0.5em; }
        label { display: block; margin-bottom: 0.5em; font-weight: 500; }
        input[type="text"], input[type="number"], textarea { width: 100%; padding: 10px; margin-bottom: 1em; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        textarea { resize: vertical; min-height: 100px; }
        button { background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 1em; }
        button:hover { background-color: #0056b3; }
        pre { background-color: #eee; padding: 1em; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word; }
        .result { margin-top: 1em; padding: 1em; border-radius: 4px; }
        .result.success { background-color: #e6ffed; border: 1px solid #b7e4c7; }
        .result.error { background-color: #ffebe6; border: 1px solid #e4b7b7; }
    </style>
</head>
<body>
    <h1>ProTanki Dev Tools</h1>

    <fieldset>
        <legend>Resource Path Converter</legend>
        <form id="toPathForm">
            <label for="idLow">ID Low:</label>
            <input type="number" id="idLow" name="idLow" required>
            <label for="versionLow">Version Low:</label>
            <input type="number" id="versionLow" name="versionLow" value="1" required>
            <button type="submit">Convert to Path</button>
        </form>
        <hr style="margin: 2em 0;">
        <form id="toIdLowForm">
            <label for="resourcePath">Resource Path:</label>
            <input type="text" id="resourcePath" name="resourcePath" required placeholder="/0/301/123/315/1/">
            <button type="submit">Convert to ID Low</button>
        </form>
        <div id="resourceResult" class="result" style="display:none;"></div>
    </fieldset>

    <fieldset>
        <legend>Packet Tester</legend>
        <form id="packetTestForm">
            <label for="packetId">Packet ID:</label>
            <input type="number" id="packetId" name="packetId" required>
            <label for="payloadHex">Payload (Hex):</label>
            <textarea id="payloadHex" name="payloadHex"></textarea>
            <button type="submit">Test Packet</button>
        </form>
        <div id="packetResult" class="result" style="display:none;"></div>
    </fieldset>

    <script>
        const handleFormSubmit = async (formId, url, resultId) => {
            const form = document.getElementById(formId);
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const body = Object.fromEntries(formData.entries());
                const resultDiv = document.getElementById(resultId);

                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body),
                    });
                    const data = await response.json();
                    
                    resultDiv.style.display = 'block';
                    if (response.ok) {
                        resultDiv.className = 'result success';
                        
                        let output = '';
                        for (const key in data) {
                            if (Object.prototype.hasOwnProperty.call(data, key)) {
                                const value = data[key];
                                const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
                                output += \`\${formattedKey}:\\n\`;
                                if (typeof value === 'object') {
                                    output += JSON.stringify(value, null, 2);
                                } else {
                                    output += value;
                                }
                                output += '\\n\\n';
                            }
                        }
                        
                        resultDiv.innerHTML = '<pre>' + output.trim() + '</pre>';
                    } else {
                        throw new Error(data.error || 'Unknown error');
                    }
                } catch (err) {
                    resultDiv.style.display = 'block';
                    resultDiv.className = 'result error';
                    resultDiv.innerHTML = '<pre>Error: ' + err.message + '</pre>';
                }
            });
        };

        handleFormSubmit('toPathForm', '/api/convert-to-path', 'resourceResult');
        handleFormSubmit('toIdLowForm', '/api/convert-to-idlow', 'resourceResult');
        handleFormSubmit('packetTestForm', '/api/test-packet', 'packetResult');
    </script>
</body>
</html>
`;

app.get("/", (req, res) => {
  res.send(getPageHTML());
});

app.post("/api/convert-to-path", (req, res) => {
  try {
    const idLow = parseInt(req.body.idLow, 10);
    const versionLow = parseInt(req.body.versionLow, 10);

    if (isNaN(idLow) || isNaN(versionLow)) {
      res.status(400).json({ error: "idLow e versionLow devem ser números." });
      return;
    }

    const path = ResourcePathUtils.getResourcePath({ idLow, versionLow });
    res.json({ idLow, versionLow, path });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/convert-to-idlow", (req, res) => {
  try {
    const path = req.body.resourcePath;
    if (!path || typeof path !== "string") {
      res.status(400).json({ error: "O caminho do recurso é obrigatório." });
      return;
    }

    const { idLow } = ResourcePathUtils.parseResourcePath(path);
    res.json({ path, idLow });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/test-packet", (req, res) => {
  try {
    const packetId = parseInt(req.body.packetId, 10);
    const payloadHex = req.body.payloadHex || "";

    if (isNaN(packetId)) {
      res.status(400).json({ error: "O ID do pacote deve ser um número." });
      return;
    }

    let payload;
    try {
      payload = Buffer.from(payloadHex, "hex");
    } catch (error) {
      res.status(400).json({ error: "Payload hexadecimal inválido." });
      return;
    }

    const packetInstance = packetService.createPacket(packetId);

    if (!packetInstance) {
      res.status(404).json({ error: `Pacote com ID ${packetId} não encontrado.` });
      return;
    }

    packetInstance.read(payload);
    const result = packetInstance.toString();

    res.json({
      packetName: packetInstance.constructor.name,
      result: result,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

app.listen(port, () => {
  console.log(`Development tools server running at http://localhost:${port}`);
});
