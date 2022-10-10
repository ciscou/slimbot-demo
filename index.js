const process = require('process');

const Slimbot = require('slimbot');
const slimbot = new Slimbot(process.env.SLIMBOT_TOKEN);

const repo = require('./repo');

const buildTodoListReplyMarkup = (items) => {
  return JSON.stringify({
    inline_keyboard: items.map((item, index) => {
      return [
        {
          text: [item.done ? "✅" : "❌", item.name].join(" "),
          callback_data: ["todo", item.done ? "todo" : "done", item.id].join(":")
        }
      ];
    })
  });
}

const todo = chatId => {
  const replyMarkup = JSON.stringify({
    inline_keyboard: [
      [{ text: '📋 List', callback_data: 'todo:list' }],
      [{ text: '➕ Add', callback_data: 'todo:add' }],
    ]
  });

  slimbot.sendMessage(chatId, "Choose an option", { reply_markup: replyMarkup });
}

const todoList = chatId => {
  const cb = (error, items) => {
    if(error) {
      console.log(error);
      return;
    }

    if(items.length > 0) {
      slimbot.sendMessage(chatId, "Your TODO list", { reply_markup: buildTodoListReplyMarkup(items) });
    } else {
      slimbot.sendMessage(chatId, "Nothing TODO! 🎉");
    }
  }

  repo.getAllTodoItems(chatId, cb);
}

const todoAdd = (chatId, name) => {
  const cb = (error) => {
    if(error) {
      console.log(error);
      return;
    }

    slimbot.sendMessage(chatId, `Done! ${name} has been added to the list`);
  }

  repo.createTodoItem(chatId, name, cb);
}

const markTodoItemAs = (chatId, messageId, itemId, done) => {
  const cb1 = (error, items) => {
    if(error) {
      console.log(error);
      return;
    }

    slimbot.editMessageReplyMarkup(chatId, messageId, buildTodoListReplyMarkup(items));
  }

  const cb2 = (error, items) => {
    if(error) {
      console.log(error);
      return;
    }

    repo.getAllTodoItems(chatId, cb1);
  }

  repo.markTodoItemAs(chatId, itemId, done, cb2);
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
    const cb = (error, items) => {
      if(error) {
        console.log(error);
        return;
      }

      slimbot.sendMessage(message.chat.id, "Done items have been cleared! 🎉");
    }

    repo.clearDoneTodoItems(message.chat.id, cb);
  }

  if(message.text.startsWith("/todo add ")) {
    todoAdd(message.chat.id, message.text.slice(10));
  }
});

slimbot.on('callback_query', query => {
  if(!query.data) return;

  const message = query.message;

  if(query.data === "todo:list") {
    // slimbot.deleteMessage(message.chat.id, message.message_id);
    todoList(message.chat.id);
  }

  if(query.data === "todo") {
    const replyMarkup = JSON.stringify({
      inline_keyboard: [
        [{ text: '📋 List', callback_data: 'todo:list' }],
        [{ text: '➕ Add', callback_data: 'todo:add' }],
      ]
    });

    slimbot.editMessageReplyMarkup(message.chat.id, message.message_id, replyMarkup);
  }

  if(query.data === "todo:add") {
    const replyMarkup = JSON.stringify({
      inline_keyboard: [
        [{ text: '🥬 frutas y verduras', callback_data: 'todo:add:category:fruits_and_vegetables' }],
        [{ text: '🍗 carne y pescado', callback_data: 'todo:add:category:meat_and_fish' }],
        [{ text: '⬅️ back', callback_data: 'todo' }],
      ]
    });

    slimbot.editMessageReplyMarkup(message.chat.id, message.message_id, replyMarkup);
  }

  if(query.data === "todo:add:category:fruits_and_vegetables") {
    const replyMarkup = JSON.stringify({
      inline_keyboard: [
        [{ text: '🍅 Tomate', callback_data: 'todo:add:item:tomato' }],
        [{ text: '🍌 Plátano', callback_data: 'todo:add:item:banana' }],
        [{ text: '⬅️ back', callback_data: 'todo:add' }],
      ]
    });

    slimbot.editMessageReplyMarkup(message.chat.id, message.message_id, replyMarkup);
  }

  if(query.data === "todo:add:category:meat_and_fish") {
    const replyMarkup = JSON.stringify({
      inline_keyboard: [
        [{ text: '🍗 pollo', callback_data: 'todo:add:item:chicken' }],
        [{ text: '🐟 lubina', callback_data: 'todo:add:item:seabass' }],
        [{ text: '⬅️ back', callback_data: 'todo:add' }],
      ]
    });

    slimbot.editMessageReplyMarkup(message.chat.id, message.message_id, replyMarkup);
  }

  if(query.data === "todo:add:item:tomato") {
    todoAdd(message.chat.id, "Tomate")
  }

  if(query.data === "todo:add:item:banana") {
    todoAdd(message.chat.id, "Platanos")
  }

  if(query.data === "todo:add:item:chicken") {
    todoAdd(message.chat.id, "Pollo")
  }

  if(query.data === "todo:add:item:seabass") {
    todoAdd(message.chat.id, "Lubina")
  }

  if(query.data.startsWith('todo:done:')) {
    const itemId = parseInt(query.data.slice(10));

    markTodoItemAs(message.chat.id, message.message_id, itemId, true);
  }

  if(query.data.startsWith('todo:todo:')) {
    const itemId = parseInt(query.data.slice(10));

    markTodoItemAs(message.chat.id, message.message_id, itemId, false);
  }
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
