import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("teknofestDesktop", {
  platform: process.platform,
});
