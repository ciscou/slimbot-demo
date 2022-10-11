const process = require('process');

const Slimbot = require('slimbot');
const slimbot = new Slimbot(process.env.SLIMBOT_TOKEN);

const repo = require('./repo');

const shoppingListMenu = require('./shopping_list_menu');

const match = require('./match');

const buildTodoListReplyMarkup = (items) => {
  return JSON.stringify({
    inline_keyboard: items.map(item => {
      return [
        {
          text: [item.done ? "✅" : "❌", item.name].join(" "),
          callback_data: ["todo", item.done ? "todo" : "done", item.id].join(":")
        }
      ];
    })
  });
}

const todo = (chatId, messageId) => {
  const replyMarkup = JSON.stringify({
    inline_keyboard: [
      [{ text: "📋 List", callback_data: 'todo:list' }],
      [{ text: "🧹 Clear", callback_data: 'todo:clear' }],
      [{ text: "➕ Add", callback_data: 'todo:add' }],
    ]
  });

  if(messageId) {
    slimbot.editMessageReplyMarkup(chatId, messageId, replyMarkup);
  } else {
    slimbot.sendMessage(chatId, "Choose an option", { reply_markup: replyMarkup });
  }
}

const todoList = (chatId, messageId) => {
  const cb = (error, items) => {
    if(error) {
      console.log(error);
      return;
    }

    if(items.length > 0) {
      const replyMarkup = buildTodoListReplyMarkup(items);

      if(messageId) {
        slimbot.editMessageReplyMarkup(chatId, messageId, replyMarkup);
      } else {
        slimbot.sendMessage(chatId, "Your TODO list", { reply_markup: replyMarkup });
      }
    } else {
      slimbot.sendMessage(chatId, "Nothing TODO! 🎉");
    }
  }

  repo.getAllTodoItems(chatId, cb);
}

const todoClear = chatId => {
  const cb = (error, items) => {
    if(error) {
      console.log(error);
      return;
    }
  }

  repo.clearDoneTodoItems(chatId, cb);
}

const todoAdd = (chatId, name) => {
  const cb = (error) => {
    if(error) {
      console.log(error);
      return;
    }
  }

  repo.createTodoItem(chatId, name, cb);
}

const markTodoItemAs = (chatId, messageId, itemId, done) => {
  const cb = (error, items) => {
    if(error) {
      console.log(error);
      return;
    }

    todoList(chatId, messageId);
  }

  repo.markTodoItemAs(chatId, itemId, done, cb);
}

slimbot.on('message', message => {
  if(!message.text) return;

  if(message.text === "/todo") {
    todo(message.chat.id);
  }

  if(message.text === "/todo list") {
    todoList(message.chat.id);
  }

  if(message.text === "/todo clear") {
    todoClear(message.chat.id);
  }

  if(message.text.startsWith("/todo add ")) {
    todoAdd(message.chat.id, message.text.slice(10));
  }
});

slimbot.on('callback_query', query => {
  if(!query.data) return;

  const message = query.message;

  match(query.data.split(':'), [
    [['todo'], () => {
      todo(message.chat.id, message.message_id);
      slimbot.answerCallbackQuery(query.id);
    }],
    [['todo', 'list'], () => {
      todoList(message.chat.id);
      slimbot.answerCallbackQuery(query.id);
    }],
    [['todo', 'clear'], () => {
      todoClear(message.chat.id);
      slimbot.answerCallbackQuery(query.id, { text: "Done items have been cleared! 🎉" });
    }],
    [['todo', 'add'], () => {
      const inlineKeyboard = shoppingListMenu.categories.map(category => {
        return [{ text: category.name, callback_data: `todo:add:category:${category.code}` }];
      });

      inlineKeyboard.push([{ text: "⬅️ Back", callback_data: 'todo' }]);

      const replyMarkup = JSON.stringify({
        inline_keyboard: inlineKeyboard
      });

      slimbot.editMessageReplyMarkup(message.chat.id, message.message_id, replyMarkup);
      slimbot.answerCallbackQuery(query.id);
    }],
    [['todo', 'add', 'category', String], (categoryCode) => {
      const category = shoppingListMenu.categoriesByCode[categoryCode];

      const inlineKeyboard = category.items.map(item => {
        return [{ text: item.name, callback_data: `todo:add:item:${category.code}:${item.code}` }];
      });

      inlineKeyboard.push([{ text: "⬅️ Back", callback_data: 'todo:add' }]);

      const replyMarkup = JSON.stringify({
        inline_keyboard: inlineKeyboard
      });

      slimbot.editMessageReplyMarkup(message.chat.id, message.message_id, replyMarkup);
      slimbot.answerCallbackQuery(query.id);
    }],
    [['todo', 'add', 'item', String, String], (categoryCode, itemCode) => {
      const category = shoppingListMenu.categoriesByCode[categoryCode];
      const item = category.itemsByCode[itemCode];

      todoAdd(message.chat.id, item.name)
      slimbot.answerCallbackQuery(query.id, { text: `Done! ${item.name} has been added to the list` });
    }],
    [['todo', 'done', Number], (itemId) => {
      markTodoItemAs(message.chat.id, message.message_id, itemId, true);
      slimbot.answerCallbackQuery(query.id);
    }],
    [['todo', 'todo', Number], (itemId) => {
      markTodoItemAs(message.chat.id, message.message_id, itemId, false);
      slimbot.answerCallbackQuery(query.id);
    }],
  ]);
});

process.on('SIGINT', () => {
  console.log("Processing signal...");
  slimbot.close(() => {
    console.log("closed slimbot");
    repo.closeDb(() => {
      console.log("closed db");
      process.exit();
    });
  });
});

slimbot.startPolling();
