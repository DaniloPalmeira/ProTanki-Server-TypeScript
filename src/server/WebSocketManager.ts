import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { ProTankiServer } from "./ProTankiServer";
import { ConfigService } from "../services/ConfigService";
import logger from "../utils/Logger";
import dotenv from "dotenv";
dotenv.config();

export class WebSocketManager {
  private httpServer: HTTPServer;
  private wss: WebSocketServer | null = null;
  private proTankiServer: ProTankiServer;
  private config: { [key: string]: string };

  constructor(
    httpServer: HTTPServer,
    proTankiServer: ProTankiServer,
    initialConfig: { [key: string]: string }
  ) {
    this.httpServer = httpServer;
    this.proTankiServer = proTankiServer;
    this.config = { ...initialConfig };
  }

  public start(): void {
    const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT
      ? parseInt(process.env.WEBSOCKET_PORT)
      : 9998;
    this.wss = new WebSocketServer({ server: this.httpServer });
    this.httpServer.listen(WEBSOCKET_PORT, () => {
      logger.info(`WebSocket Server started`, { port: WEBSOCKET_PORT });
    });

    this.wss.on("connection", (ws: WebSocket) => {
      logger.info("New WebSocket connection established for admin panel");

      // Enviar configuração inicial
      ws.send(JSON.stringify({ type: "config", ...this.config }));

      ws.on("message", (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString());
          if (data.type === "updateConfig") {
            const newConfig: { [key: string]: string } = {};

            // Processar todas as chaves recebidas
            for (const key of Object.keys(data)) {
              if (key !== "type" && data[key] !== undefined) {
                const value = String(data[key]); // Converter para string

                // Salvar no banco de dados
                ConfigService.setConfig(key, value, (error) => {
                  if (error) {
                    logger.error(`Error saving config for key ${key}`, {
                      error,
                    });
                    // Enviar feedback de erro ao cliente
                    ws.send(
                      JSON.stringify({
                        type: "updateFeedback",
                        key,
                        status: "error",
                        error: error.message,
                      })
                    );
                  } else {
                    logger.info(`Configuration ${key} updated via WebSocket`, {
                      value,
                    });
                    newConfig[key] = value;

                    // Enviar feedback de sucesso ao cliente
                    ws.send(
                      JSON.stringify({
                        type: "updateFeedback",
                        key,
                        status: "success",
                        value,
                      })
                    );

                    // Atualizar configurações específicas do ProTankiServer
                    if (key === "needInviteCode") {
                      this.proTankiServer.updateNeedInviteCode(
                        value === "true"
                      );
                    } else if (key === "maxClients") {
                      const maxClients = parseInt(value);
                      if (!isNaN(maxClients) && maxClients >= 0) {
                        this.proTankiServer.updateMaxClients(maxClients);
                      }
                    }
                  }
                });
              }
            }

            if (Object.keys(newConfig).length > 0) {
              this.config = { ...this.config, ...newConfig };
              logger.info("Configuration updated", newConfig);
              // Notificar todos os clientes WebSocket
              this.wss!.clients.forEach((client) => {
                if (client.readyState === client.OPEN) {
                  client.send(
                    JSON.stringify({ type: "config", ...this.config })
                  );
                }
              });
            }
          }
        } catch (error) {
          logger.error("Error processing WebSocket message", { error });
          // Enviar feedback de erro geral ao cliente
          ws.send(
            JSON.stringify({
              type: "updateFeedback",
              key: null,
              status: "error",
              error: error instanceof Error ? error.message : String(error),
            })
          );
        }
      });

      ws.on("close", () => {
        logger.info("WebSocket connection closed for admin panel");
      });
    });

    this.wss.on("error", (error) => {
      logger.error("WebSocket server error", { error });
    });
  }

  public stop(callback: (error?: Error) => void): void {
    if (!this.wss) {
      logger.info("WebSocket server not running");
      return callback();
    }

    this.wss.close((err) => {
      if (err) {
        logger.error("Error closing WebSocket server", { error: err });
        return callback(err);
      }

      this.httpServer.close((httpErr) => {
        if (httpErr) {
          logger.error("Error closing HTTP server for WebSocket", {
            error: httpErr,
          });
          return callback(httpErr);
        }

        logger.info("WebSocket server stopped");
        this.wss = null;
        callback();
      });
    });
  }
}
