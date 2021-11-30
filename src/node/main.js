const { app, BrowserWindow, Menu } = require("electron");

const path = require("path");
const isDev = require("electron-is-dev");
const { ipcMain } = require("electron");

const configController = require("./controllers/config");

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

ipcMain.handle("getExchanges", async () => {
  return configController.getExchanges();
});

ipcMain.handle("getOwnExchanges", async () => {
  return ["Binance", "Coinbase", "Kucoin"];
});

ipcMain.handle("addExchange", async (event, args) => {
  console.log(args);

  if (args.exchange) {
    return args.exchange;
  }
  return null;
});

ipcMain.handle("removeExchange", async (event, args) => {
  console.log(args);

  if (args) {
    return true;
  }

  return false;
});

ipcMain.handle("getOwnCoins", async () => {
  return [
    {
      name: "Bitcoin",
      exchange: "Coinbase",
      total: 0.00002,
      price: 57100.44,
      profit: 0,
    },
    {
      name: "Cardano",
      exchange: "Coinbase",
      total: 0.00002,
      price: 1.57,
      profit: 0,
    },
  ];
});

ipcMain.handle("getCoinHistory", async (event, args) => {
  if (args != null) {
    if (args.exchange != null && args.name != null) {
      if (args.exchange == "Coinbase" && args.name == "Bitcoin") {
        return {
          label: args.name + " - " + args.exchange,
          data: [
            {
              date: new Date("November 23, 2021 03:24:00"),
              total: 10,
            },
            {
              date: new Date("November 24, 2021 03:24:00"),
              total: 11,
            },
            {
              date: new Date("November 25, 2021 03:24:00"),
              total: 12,
            },
            {
              date: new Date("November 26, 2021 03:24:00"),
              total: 8,
            },
            {
              date: new Date("November 27, 2021 03:24:00"),
              total: 20,
            },
            {
              date: new Date("November 28, 2021 03:24:00"),
              total: 2,
            },
          ],
        };
      } else if (args.exchange == "Coinbase" && args.name == "Cardano") {
        return {
          label: args.name + " - " + args.exchange,
          data: [
            {
              date: new Date("November 23, 2021 03:24:00"),
              total: 1,
            },
            {
              date: new Date("November 24, 2021 03:24:00"),
              total: 2,
            },
            {
              date: new Date("November 25, 2021 03:24:00"),
              total: 50,
            },
            {
              date: new Date("November 26, 2021 03:24:00"),
              total: 38,
            },
            {
              date: new Date("November 27, 2021 03:24:00"),
              total: 21,
            },
            {
              date: new Date("November 28, 2021 03:24:00"),
              total: 45,
            },
          ],
        };
      }
    }
  }
  return null;
});
