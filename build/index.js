"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = require("./config.json");
var fs = require("fs");
var readline = require("readline");
var yaml = require("js-yaml");
var newConfig = JSON.parse(JSON.stringify(config));
var rl = readline.createInterface({
    input: fs.createReadStream('./changes')
});
rl.on('line', function (line) {
    update(newConfig, line);
});
rl.on('close', function () {
    console.log('Done changing configuration');
    save(newConfig);
});
function update(config, line) {
    var change = yaml.safeLoad(line);
    var propertyPath = Object.keys(change)[0];
    var value = Object.values(change)[0];
    var paths = propertyPath.split('.');
    var property = paths[paths.length - 1];
    var partialObjToChange = config;
    for (var i = 0; i < paths.length - 1; i++) {
        partialObjToChange = partialObjToChange[paths[i]];
    }
    ;
    Object.defineProperty(partialObjToChange, property, { value: value });
}
function save(obj) {
    var datas = JSON.stringify(obj);
    fs.writeFile('newConfig.json', datas, function (error) {
        if (error) {
            console.log(error);
        }
    });
}
