const { app, BrowserWindow, Menu } = require("electron");

const isDev = require("electron-is-dev");
const { ipcMain } = require("electron");

const exchangeController = require("./controllers/exchange");
const transactionsController = require("./controllers/transactions");

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
  return exchangeController.getExchanges();
});

ipcMain.handle("getOwnExchanges", async () => {
  return await exchangeController.getOwnExchanges();
});

ipcMain.handle("addExchange", async (event, args) => {
  return await exchangeController.addExchange(args);
});

ipcMain.handle("removeExchange", async (event, args) => {
  return await exchangeController.removeExchange(args);
});

ipcMain.handle("getBalance", async (event, args) => {
  return await transactionsController.getBalance(args);
});

ipcMain.handle("getCoinHistory", async (event, args) => {
  if (args != null) {
    if (args.exchange != null && args.name != null) {
      let history = await transactionsController.getCoinHistoryFromDB(
        args.name,
        args.exchange
      );

      return history;
    }
  }
  return null;
});

ipcMain.handle("getCoinHistoryFormated", async (event, args) => {
  if (args != null) {
    if (args.exchange != null && args.name != null) {
      let history = await transactionsController.getCoinHistoryFromDB(
        args.name,
        args.exchange
      );
      let historyData = [];

      if (history != null) {
        history.forEach((transaction) => {
          if (transaction.date != null && transaction.quantity != null) {
            try {
              historyData.push({
                date: new Date(transaction.date),
                total: Number(transaction.quantity),
              });
            } catch (e) {
              console.error(e);
            }
          }
        });
      }

      let historyWithFormat = {
        label: args.name + " - " + args.exchange,
        data: historyData,
      };

      return historyWithFormat;
    }
  }
  return null;
});
