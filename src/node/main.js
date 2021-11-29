const { app, BrowserWindow, Menu } = require("electron");

const path = require("path");
const isDev = require("electron-is-dev");
const { ipcMain } = require("electron");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    titleBarStyle: "customButtonsOnHover",
    title: "YutePort",
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      preload: __dirname + "/preload.js",
      contextIsolation: false,
    },
  });

  let path = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "../build/index.html")}`;

  let menu = Menu.buildFromTemplate([
    {
      label: "Menu",
      submenu: [
        {
          label: "Portfolio",
          click() {
            mainWindow.loadURL(path);
          },
        },
        {
          label: "Config",
          click() {
            mainWindow.loadURL(path + "/config");
          },
        },
        { type: "separator" },
        {
          label: "Reload",
          click() {
            mainWindow.reload();
          },
        },
        { type: "separator" },
        {
          label: "Exit",
          click() {
            app.quit();
          },
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
  mainWindow.loadURL(path);
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on("closed", () => (mainWindow = null));
  mainWindow.webContents.on("did-finish-load", () =>
    mainWindow.webContents.send("ping", "🤘")
  );
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("message", (event, arg) => {
  console.log("message", arg);
});

ipcMain.handle("ipc-data", async (event, ...args) => {
  return "pong";
});
