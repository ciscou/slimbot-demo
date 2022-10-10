# slimbot-demo

## Create DB

```bash
$ sqlite3 ciscoubot.sqlite
sqlite> create table todos (id integer primary key autoincrement, chat_id integer, done integer, name text, created_at integer, updated_at integer);
sqlite> create index todos_chat_id on todos (chat_id);
```

## Download dependencies

```bash
$ npm i
```

## Run

```bash
$ node index.js
```
