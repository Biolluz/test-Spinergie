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
    var partialObjToChange = getPartialObjToChange(config, paths);
    updatePartialObj(partialObjToChange, property, value);
}
function getPartialObjToChange(config, paths) {
    var partialObjToChange = config;
    var regex = new RegExp('\[[0-9]+\]\$');
    for (var i = 0; i < paths.length - 1; i++) {
        if (partialObjToChange.hasOwnProperty(paths[i])) {
            partialObjToChange = partialObjToChange[paths[i]];
        }
        else if (regex.test(paths[i])) {
            var arrayToChange = partialObjToChange[paths[i].split('[')[0]];
            var index = paths[i].slice(paths[i].indexOf('[') + 1, paths[i].indexOf(']'));
            partialObjToChange = arrayToChange[Number(index) - 1];
        }
    }
    ;
    return partialObjToChange;
}
function updatePartialObj(partialObjToChange, property, value) {
    var regex = new RegExp('\[[0-9]+\]\$');
    if (partialObjToChange.hasOwnProperty(property)) {
        Object.defineProperty(partialObjToChange, property, { value: value });
    }
    else if (regex.test(property)) {
        var arrayToChange = partialObjToChange[property.split('[')[0]];
        var index = property.slice(property.indexOf('[') + 1, property.indexOf(']'));
        arrayToChange[Number(index) - 1] = value;
    }
}
function save(obj) {
    var datas = JSON.stringify(obj);
    fs.writeFile('newConfig.json', datas, function (error) {
        if (error) {
            console.log(error);
        }
    });
}
