const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('ciscoubot.sqlite');

repo = {
  getAllTodoItems: (chatId, cb) => {
    db.all("SELECT * FROM todos WHERE chat_id=? ORDER BY created_at", [chatId], cb);
  },

  createTodoItem: (chatId, name, cb) => {
    const now = new Date().getTime();

    db.run("INSERT INTO todos (chat_id, done, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", [chatId, 0, name, now, now], cb);
  },

  markTodoItemAs: (chatId, itemId, done, cb) => {
    const now = new Date().getTime();

    db.run("UPDATE todos SET done=?, updated_at=? WHERE chat_id=? and id=?", [done ? 1 : 0, new Date().getTime(), chatId, itemId], cb);
  },

  clearDoneTodoItems: (chatId, cb) => {
    db.run("DELETE FROM todos WHERE chat_id=? AND done=?", [chatId, 1], cb);
  },

  closeDb: (cb) => {
    db.close(cb)
  }
};

module.exports = repo;
