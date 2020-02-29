import config = require('./config.json');
import fs   = require('fs'); 
import readline = require('readline');
import yaml = require('js-yaml');

let newConfig:object = JSON.parse(JSON.stringify(config));

const rl = readline.createInterface({
    input: fs.createReadStream('./changes')
});

rl.on('line', (line:string) => {
    update(newConfig,line);
});

rl.on('close', () => {
    console.log('Done changing configuration');
    save(newConfig);
});

function update(config:object,line:string){
    const change:object = yaml.safeLoad(line);
    const propertyPath:string = Object.keys(change)[0];
    const value:any = Object.values(change)[0];
    const paths:string[] = propertyPath.split('.');
    let property = paths[paths.length-1];
    let partialObjToChange = config;
    for ( let i = 0; i < paths.length-1; i++){
        partialObjToChange = partialObjToChange[paths[i]];
    };
    Object.defineProperty(partialObjToChange,property,{value: value});
}

function save(obj:object){
    const datas = JSON.stringify(obj);
    fs.writeFile('newConfig.json',datas,function(error) {
        if (error) {
            console.log(error)}
    });
}

