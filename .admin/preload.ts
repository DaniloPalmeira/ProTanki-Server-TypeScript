import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // Aqui você pode adicionar métodos para comunicação entre renderer e main, se necessário
});