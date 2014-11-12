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
        nameRow: 1,
        typeRow: 3,
        ignoreRows: [2, 4],
        indexColumn: 1
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

###Add ignoreRows config(optional)
This is a array that contain row nums indicate which row will be ignored when parsing the csv file.

###Add nameRow config(necessary)
This config indicate which row the field name is in.

###Add typeRow config(necessary)
This config indicate which row the field type is in(using for type-cast,saving you from manual type-cast).

####type support:
int,float,string,bool,ts(timestamp),int[](delimeter is ',')

###Add indexColumn config(optional)
This config indicate which column is using for index. If indexColumn configed,then the idx config will be no effect.

note: row and column are all start from 1

###Add a new method:findByFunc(func) 
Use this method,you can define a testing function and pass it to findByFunc and will get a record that satisfies the conditions defined in testing function 

note:may be some bug, welcome raise an issue.
