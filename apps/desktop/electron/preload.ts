import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("epms", {
  appVersion: process.env.npm_package_version ?? "1.0.0",
});
