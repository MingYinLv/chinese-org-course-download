/**
 * Created by MingYin Lv on 2017/1/14.
 */

const http = require('http');
const fs = require('fs');
const url = 'http://v1.chinesemooc.org/4747/497069/497069-1449228076.mp4';
const option = {
    host: 'v1.chinesemooc.org',
    path: '/4747/497069/497069-1449228076.mp4'
};

http.get(option, (res) => {
    res.setEncoding('binary');
    const file = fs.createWriteStream('1.mp4');
    file.setDefaultEncoding('binary');
    res.on('data', function (thunk) {
        console.log(thunk instanceof Buffer);
        file.write(thunk, 'binary');
    });

    res.on('end', function () {
        file.end();
    });

});

