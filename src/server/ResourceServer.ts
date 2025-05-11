import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import logger from "../utils/Logger";

dotenv.config();

export class ResourceServer {
  private app: express.Application;
  private port: number;
  private resourceDir: string;

  constructor() {
    this.app = express();
    this.app.use(cors());
    this.port = process.env.RESOURCE_PORT ? parseInt(process.env.RESOURCE_PORT) : 9999;
    this.resourceDir = path.join(__dirname, "../../resource");
    this.setupRoutes();
  }

  /**
   * Configures the Express routes to serve static files from the resource directory.
   */
  private setupRoutes(): void {
    // Serve arquivos estáticos do diretório resource
    this.app.use(express.static(this.resourceDir));

    // Rota padrão para verificar se o servidor está ativo
    this.app.get("/", (req: Request, res: Response) => {
      res.send("Resource Server is running");
    });

    // Tratamento de erro para rotas não encontradas
    this.app.use((req: Request, res: Response) => {
      res.status(404).send("Resource not found");
    });
  }

  /**
   * Starts the Express server.
   */
  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`Resource Server started`, { port: this.port, resourceDir: this.resourceDir });
    });
  }

  /**
   * Stops the Express server gracefully.
   * @returns A promise that resolves when the server is stopped.
   */
  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen().close(() => {
        logger.info("Resource Server stopped");
        resolve();
      });
    });
  }
}