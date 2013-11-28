pomelo-data-plugin
======================

Config data plugin for Pomelo, it can be used in Pomelo(>=0.7.4).

pomelo-data-plugin is a config data plugin for Pomelo.

##Installation

```
npm install pomelo-data-plugin
```

##Usage

```
var dataPlugin = require('pomelo-data-plugin');
... ...
app.configure('production|development', function() {
  app.use(dataPlugin, {
    ...
  });
});
```

