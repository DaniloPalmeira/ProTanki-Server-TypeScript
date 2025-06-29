import express, { Request, Response } from "express";
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
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: auto; max-width: 900px; padding: 2em; background-color: #f4f4f9; color: #333; }
        fieldset { border: 1px solid #ccc; border-radius: 8px; padding: 1em 1.5em; margin-bottom: 2em; background-color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        legend { font-weight: bold; font-size: 1.2em; padding: 0 0.5em; }
        label { display: block; margin-bottom: 0.5em; font-weight: 500; }
        input[type="text"], input[type="number"], textarea, select { width: 100%; padding: 10px; margin-bottom: 1em; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; background-color: white; }
        textarea { resize: vertical; min-height: 100px; font-family: monospace; }
        button { background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 1em; margin-right: 0.5em; }
        button:hover { background-color: #0056b3; }
        button.add-btn { background-color: #28a745; }
        button.add-btn:hover { background-color: #218838; }
        button.remove-btn { background-color: #dc3545; padding: 5px 10px; font-size: 0.8em; }
        button.remove-btn:hover { background-color: #c82333; }
        pre { background-color: #eee; padding: 1em; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word; font-family: monospace; }
        .result { margin-top: 1em; padding: 1em; border-radius: 4px; }
        .result.success { background-color: #e6ffed; border: 1px solid #b7e4c7; }
        .result.error { background-color: #ffebe6; border: 1px solid #e4b7b7; }
        .property-row { display: flex; align-items: center; gap: 1em; margin-bottom: 0.5em; }
        .property-row select { width: 150px; flex-shrink: 0; }
        .property-row .value { flex-grow: 1; background-color: #f8f9fa; padding: 8px; border-radius: 4px; border: 1px solid #e9ecef; min-height: 20px; font-family: monospace; }
        #builder-status { margin-top: 1em; font-weight: bold; }
    </style>
</head>
<body>
    <h1>ProTanki Dev Tools</h1>

    <fieldset>
        <legend>Packet Builder / Decoder</legend>
        <label for="packetIdBuilder">Packet ID:</label>
        <input type="number" id="packetIdBuilder" placeholder="e.g., -962759489">
        <label for="payloadHexBuilder">Payload (Hex):</label>
        <textarea id="payloadHexBuilder"></textarea>
        
        <div id="propertiesList"></div>
        <button type="button" id="addPropertyBtn" class="add-btn">+ Add Property</button>
        
        <div id="builder-status"></div>
        <div id="builder-error" class="result error" style="display:none;"></div>

        <hr style="margin: 2em 0;">
        <button type="button" id="generateCodeBtn">Generate Reader Code</button>
        <div id="generatedCode" style="margin-top: 1em;"></div>
    </fieldset>

    <fieldset>
        <legend>Packet Tester</legend>
        <form id="packetTestForm">
            <label for="packetId">Packet ID:</label>
            <input type="number" id="packetId" name="packetId" required>
            <label for="payloadHex">Payload (Hex):</label>
            <textarea id="payloadHexTest" name="payloadHex"></textarea>
            <button type="submit">Test Packet</button>
        </form>
        <div id="packetResult" class="result" style="display:none;"></div>
    </fieldset>

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

    <script>
        // --- Packet Builder Logic ---
        class JsBufferReader {
            constructor(buffer) {
                this.dataView = new DataView(buffer);
                this.uint8Array = new Uint8Array(buffer);
                this.offset = 0;
            }

            get hasRemaining() {
                return this.offset < this.dataView.byteLength;
            }
            
            checkCanRead(length) {
                if (this.offset + length > this.dataView.byteLength) {
                    throw new Error(\`Attempt to read \${length} bytes beyond buffer bounds (offset: \${this.offset}, length: \${this.dataView.byteLength})\`);
                }
            }

            readInt32BE() {
                this.checkCanRead(4);
                const value = this.dataView.getInt32(this.offset, false);
                this.offset += 4;
                return value;
            }

            readUInt8() {
                this.checkCanRead(1);
                const value = this.dataView.getUint8(this.offset);
                this.offset += 1;
                return value;
            }

            readOptionalString() {
                const isNull = this.readUInt8() === 1;
                if (isNull) return null;
                const length = this.readInt32BE();
                if (length < 0) throw new Error("Invalid string length: cannot be negative.");
                this.checkCanRead(length);
                const stringBuffer = this.uint8Array.subarray(this.offset, this.offset + length);
                this.offset += length;
                return new TextDecoder("utf-8").decode(stringBuffer);
            }
        }

        const propertyTypes = {
            'Int32BE': { read: 'readInt32BE', code: 'reader.readInt32BE()' },
            'UInt8': { read: 'readUInt8', code: 'reader.readUInt8()' },
            'String': { read: 'readOptionalString', code: 'reader.readOptionalString()' }
        };

        const hexInput = document.getElementById('payloadHexBuilder');
        const propertiesList = document.getElementById('propertiesList');
        const addPropertyBtn = document.getElementById('addPropertyBtn');
        const statusDiv = document.getElementById('builder-status');
        const errorDiv = document.getElementById('builder-error');
        const generateCodeBtn = document.getElementById('generateCodeBtn');
        const generatedCodeDiv = document.getElementById('generatedCode');

        const updateBuilderUI = () => {
            const hex = hexInput.value.replace(/\\s/g, '');
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
            
            if (hex.length === 0) {
                statusDiv.textContent = 'Waiting for Hex data...';
                return;
            }
            if (hex.length % 2 !== 0) {
                statusDiv.textContent = 'Invalid Hex data (odd length).';
                return;
            }

            let buffer;
            try {
                const bytes = hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
                buffer = new Uint8Array(bytes).buffer;
            } catch (e) {
                statusDiv.textContent = 'Invalid Hex data.';
                return;
            }
            
            const reader = new JsBufferReader(buffer);
            const propertyRows = propertiesList.querySelectorAll('.property-row');

            try {
                for (const row of propertyRows) {
                    const select = row.querySelector('select');
                    const valueDiv = row.querySelector('.value');
                    const type = select.value;

                    if (propertyTypes[type]) {
                        const readMethod = propertyTypes[type].read;
                        const value = reader[readMethod]();
                        valueDiv.textContent = JSON.stringify(value);
                    }
                }
                const remainingBytes = reader.dataView.byteLength - reader.offset;
                statusDiv.textContent = \`\${remainingBytes} bytes remaining\`;
            } catch(e) {
                errorDiv.style.display = 'block';
                errorDiv.innerHTML = '<pre>' + e.message + '</pre>';
                statusDiv.textContent = 'Decoding Error!';
            }
        };

        addPropertyBtn.addEventListener('click', () => {
            const row = document.createElement('div');
            row.className = 'property-row';

            const select = document.createElement('select');
            Object.keys(propertyTypes).forEach(key => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = key;
                select.appendChild(option);
            });
            select.addEventListener('change', updateBuilderUI);

            const valueDiv = document.createElement('div');
            valueDiv.className = 'value';

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', () => {
                row.remove();
                updateBuilderUI();
            });

            row.appendChild(select);
            row.appendChild(valueDiv);
            row.appendChild(removeBtn);
            propertiesList.appendChild(row);
            updateBuilderUI();
        });

        generateCodeBtn.addEventListener('click', () => {
            let code = '';
            const propertyRows = propertiesList.querySelectorAll('.property-row');
            propertyRows.forEach(row => {
                const select = row.querySelector('select');
                const type = select.value;
                if(propertyTypes[type]) {
                    code += propertyTypes[type].code + ';\\n';
                }
            });
            generatedCodeDiv.innerHTML = '<pre>' + code + '</pre>';
        });

        hexInput.addEventListener('input', updateBuilderUI);

        // --- Generic Form Handler ---
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

app.get("/", (req: Request, res: Response): void => {
    res.send(getPageHTML());
});

app.post("/api/convert-to-path", (req: Request, res: Response): void => {
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

app.post("/api/convert-to-idlow", (req: Request, res: Response): void => {
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

app.post("/api/test-packet", (req: Request, res: Response): void => {
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