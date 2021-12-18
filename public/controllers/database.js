const controller = {};

const fs = require("fs");
const Path = require("path");
const dbLocation = "./localdatabase.db";
const Database = require("better-sqlite3");
const logController = require("./logger");

controller.query = async (sql, params = []) => {
  const db = new Database(dbLocation);
  const stmt = db.prepare(sql);
  const result = stmt.all(params);

  return result;
};

controller.get = async (sql, params = []) => {
  const db = new Database(dbLocation);
  const stmt = db.prepare(sql);
  const result = stmt.get(params);

  return result;
};

controller.run = async (sql, params = []) => {
  try {
    const db = new Database(dbLocation);
    const stmt = db.prepare(sql);
    stmt.run(params);
    return true;
  } catch (e) {
    logController.error(e.message);
  }

  return false;
};

controller.generateDB = () => {
  try {
    const path = Path.join(dbLocation);
    if (fs.existsSync(path)) {
      return;
    }
  } catch (err) {
    logController.error(err.message);
  }
  let db = new Database(dbLocation);

  db.exec(
    "CREATE TABLE exchanges (ID INTEGER PRIMARY KEY AUTOINCREMENT, Name VARCHAR(50) NOT NULL, Key TEXT NULL, Secret TEXT NULL, Password TEXT NULL)"
  );
  db.exec(
    "CREATE TABLE transactions (ID INTEGER PRIMARY KEY AUTOINCREMENT, exchangeid INTEGER, coinname VARCHAR(50) NOT NULL, quantity REAL NULL, price REAL NULL, date TEXT NOT NULL)"
  );
  db.exec(
    "CREATE TABLE config (configname VARCHAR(50) NOT NULL PRIMARY KEY, value TEXT NULL)"
  );
};

module.exports = controller;
