const match = (actual, options) => {
  options.forEach(([pattern, callback]) => {
    if(Array.isArray(actual) && Array.isArray(pattern)) {
      if(actual.length === pattern.length) {
        let matches = true;
        let args = [];

        pattern.forEach((pat, i) => {
          if(pat === String) {
            args.push(actual[i]);
          } else if(pat === Number) {
            args.push(parseInt(actual[i]));
          } else {
            matches = matches && (actual[i] === pat)
          }
        });

        if(matches) {
          callback(...args);
          return;
        }
      }
    }
  });
};

/*
[
  'todo',
  'xxx',
  'xxx:yyy:zzz',
  'todo:done:1234',
  'todo:add:category:foo',
  'todo:add:item:foo:bar',
].forEach(data => {
  match(data.split(":"), [
    [['todo'], () => {
      console.log('todo');
    }],
    [['todo', 'add', 'category', String], (categoryCode) => {
      console.log('add category', categoryCode);
    }],
    [['todo', 'add', 'item', String, String], (categoryCode, itemCode) => {
      console.log('add item', categoryCode, itemCode);
    }],
    [['todo', 'done', Number], (todoId) => {
      console.log('mark as done', todoId);
    }],
  ]);
});
*/

module.exports = match;
