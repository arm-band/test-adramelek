const path          = require('path');
const request       = require('request');
const { spawnSync } = require('child_process');
const fs            = require('fs');
const marakOwnedUrl = 'https://gist.githubusercontent.com/azu/11b105a9e35dc9d5f07312c24a35c82b/raw/000a0c728ac1748b6fb3c80c8a0753fb1f6a57e8/marak-packages.md';

if(process.argv.length < 3) {
    console.log('Error: プロジェクトのパスを指定してください');
    return false;
}
else if(process.argv.length > 3) {
    console.log('Error: 引数の数が多過ぎます');
    return false;
}

const projectPathStr   = process.argv[2];
const projectPathArray = path.parse(projectPathStr);
const projectName      = projectPathArray.base;

if(!fs.existsSync(projectPathStr)) {
    console.log('Error: プロジェクトのディレクトリが存在していません');
    return false;
}
else if(!fs.existsSync(path.join(projectPathStr, 'node_modules'))) {
    console.log('Error: プロジェクトの中に node_modulesディレクトリ が存在していません');
    return false;
}

request.get({
    url: marakOwnedUrl,
}, function (error, response, body) {
    const mdStream = body.split("\n");
    const packageNamesArray = mdStream.filter((val) => {
        return val.length > 0 && !val.startsWith('http');
    });
    let cnt = {
        found: 0,
        notfound: 0,
    }
    let resultStr = `Project: ${projectPathStr}
`;
    for (let i = 0; i < packageNamesArray.length; i++) {
        console.log(`yarn why ${packageNamesArray[i]}`);
        resultStr += `Package "${packageNamesArray[i]}":  ${i + 1} / ${packageNamesArray.length}

> yarn why ${packageNamesArray[i]}
`;
        console.log(`package "${packageNamesArray[i]}":  ${i + 1} / ${packageNamesArray.length}`);
        const spawn = spawnSync(`yarn why ${packageNamesArray[i]} --cwd ${projectPathStr}`, { shell: true });
        console.log(spawn.stdout.toString());
        resultStr += `${spawn.stdout.toString()}
`;
        console.log(spawn.stderr.toString());
        resultStr += `${spawn.stderr.toString()}
`;
        spawn.stderr.toString().length > 0 ? cnt.notfound++ : cnt.found++;
    }
    const cntMsg = `
Found packages: ${cnt.found}
Not found packages: ${cnt.notfound}`;
    console.log(cntMsg);
    resultStr += cntMsg;
    try{
        fs.writeFileSync(path.join(path.join('.', 'dist'), `scan-result-${projectName}.log`), resultStr);
      }
      catch(e){
        console.log(e.message);
      }
});
