pomelo-data-plugin

Config data plugin for Pomelo, it can be used in Pomelo(>=0.7.0).

pomelo-data-plugin is a config data(.csv) plugin for Pomelo(a fast, scalable,distributed game server framework for Node.js  http://pomelo.netease.com).

##Installation

```
npm install pomelo-data-plugin
```

##Usage

```
var dataPlugin = require('pomelo-data-plugin');
... ...
app.configure('production|development', function() {
  ...
  app.use(dataPlugin, {
    watcher: {
      dir: __dirname + '/config/data',
      idx: 'id',
      interval: 3000
    }
  });
  ...
});
```

