const { app, BrowserWindow, Menu } = require("electron");

const isDev = require("electron-is-dev");
const { ipcMain } = require("electron");
const exchangeController = require("./controllers/exchange");
const transactionsController = require("./controllers/transactions");
const configController = require("./controllers/config");
const dbController = require("./controllers/database");
const pjson = require("../package.json");

let mainWindow;
let timer = null;

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

  let pathURL = isDev
    ? "http://localhost:3000"
    : `file://${__dirname}/../build/index.html`;

  let menu = Menu.buildFromTemplate([
    {
      label: "Menu",
      submenu: [
        {
          label: "Inicio",
          click() {
            mainWindow.loadURL(pathURL);
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
    { label: "v " + pjson.version },
  ]);
  Menu.setApplicationMenu(menu);
  mainWindow.loadURL(pathURL);
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on("closed", () => {
    if (timer != null) {
      clearTimeout(timer);
    }
    mainWindow = null;
  });
  mainWindow.webContents.on("did-finish-load", () =>
    mainWindow.webContents.send("ping", "🤘")
  );
}

dbController.generateDB();
app.on("ready", createWindow);
transactionsController.updateBalance();

const autoUpdateBalance = async () => {
  let autoUpdate = await configController.getConfigValue("autoUpdate");
  if (autoUpdate && autoUpdate !== "off") {
    timer = setInterval(
      transactionsController.updateBalance(),
      60000 * autoUpdate
    );
  }
};

autoUpdateBalance();

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
  return await transactionsController.getBalance();
});

ipcMain.handle("getBalanceFromExchange", async (event, args) => {
  if (args != null && args.exchange != null) {
    return await transactionsController.getExchangeBalance(args.exchange);
  }
  return [];
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

ipcMain.handle("getCoinHistoryFormatedUSDT", async (event, args) => {
  if (args != null) {
    if (args.exchange != null && args.name != null) {
      let history = await transactionsController.getCoinHistoryFromDB(
        args.name,
        args.exchange
      );
      let historyData = [];

      if (history != null) {
        history.forEach((transaction) => {
          if (
            transaction.date != null &&
            transaction.quantity != null &&
            transaction.price != null
          ) {
            try {
              historyData.push({
                date: new Date(transaction.date),
                total: transaction.quantity * transaction.price,
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

ipcMain.handle("getConfigValue", async (event, args) => {
  if (args != null && args.configname != null) {
    return await configController.getConfigValue(args.configname);
  }
  return null;
});

ipcMain.handle("updateConfigValue", async (event, args) => {
  if (args != null && args.configname != null && args.configvalue != null) {
    return await configController.updateConfigValue(
      args.configname,
      args.configvalue
    );
  }
  return false;
});
