const match = (actual, options) => {
  let matched;

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
          matched = pattern;
          callback(...args);
          return;
        }
      }
    }
  });

  return matched;
};

module.exports = match;
