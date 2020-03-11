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
    const property = paths[paths.length-1];
    const partialObjToChange = getPartialObjToChange(config,paths);
    updatePartialObj(partialObjToChange,property,value);
}

function getPartialObjToChange(config:object,paths:string[]){
    let partialObjToChange = config;
    const regex = new RegExp('\[[0-9]+\]\$');
    for ( let i = 0; i < paths.length-1; i++){   
        if (partialObjToChange.hasOwnProperty(paths[i])){
            partialObjToChange = partialObjToChange[paths[i]];
        }  else if (regex.test(paths[i])){
            let arrayToChange = partialObjToChange[paths[i].split('[')[0]];
            let index = paths[i].slice(paths[i].indexOf('[')+1,paths[i].indexOf(']'));
            partialObjToChange = arrayToChange[Number(index)-1];
        } 
    };
    return partialObjToChange;
}

function updatePartialObj(partialObjToChange:object,property:string,value:any){
    const regex = new RegExp('\[[0-9]+\]\$');
    if (partialObjToChange.hasOwnProperty(property)){
        Object.defineProperty(partialObjToChange,property,{value: value});
    } else if (regex.test(property)){
        let arrayToChange = partialObjToChange[property.split('[')[0]];
        let index = property.slice(property.indexOf('[')+1,property.indexOf(']'));
        arrayToChange[Number(index)-1] = value;
    }
}

function save(obj:object){
    const datas = JSON.stringify(obj);
    fs.writeFile('newConfig.json',datas,function(error) {
        if (error) {
            console.log(error);
        }
    });
}

