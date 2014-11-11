pomelo-data-plugin

Config data plugin for Pomelo(a fast,scalable,distributed game server framework for Node.js. http://pomelo.netease.com), it can be used in Pomelo(>=0.7.0).

pomelo-data-plugin is a config data(.csv) plugin for Pomelo. pomelo-data-plugin can watch all config files in the given dir and reload the file automatically when it is modified.

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
      interval: 3000,
      ignoreRows:[2,4],
      nameRow:1,
      typeRow:3,
      indexColumn:0
    }
  });
  ...
});
... ...
... ...
var npcTalkConf = app.get('dataService').get('npc_talk');
... ...
... ...
```

Please refer to [pomelo-data-plugin-demo](https://github.com/palmtoy/pomelo-data-plugin-demo)

##ChangeLog

Add ignoreRows config.This is a array that contain row nums indicate which row will be ignored when parsing the csv file.

Add nameRow config.This config indicate which row the field name is in.

Add typeRow config.This config indicate which row the field type is in(using for type-cast,saving you from manual type-cast).

Add indexColumn config.This config indicate which column is using for index. If indexColumn configed,then the idx config will be no effect.

note: row and column are all start from 1