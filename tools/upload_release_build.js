const fs = require('fs');
const path = require('path');
let dirName = path.basename(process.cwd())

var targetPath = 'D:/Program Files (x86)/Jenkins/workspace/'
    + dirName
    + '/build'

console.log(targetPath);

//! 将srcDir文件下的文件、文件夹递归的复制到tarDir下
var copyFile = function (srcPath, tarPath, cb) {
    var rs = fs.createReadStream(srcPath);
    rs.on('error', function (err) {
        if (err) {
            console.log('read error', srcPath);
        }
        cb && cb(err);
    })

    var ws = fs.createWriteStream(tarPath);
    ws.on('error', function (err) {
        if (err) {
            console.log('write error', tarPath);
        }
        cb && cb(err);
    })
    ws.on('close', function (ex) {
        cb && cb(ex);
    })

    rs.pipe(ws);
}

function delDir(path) {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                delDir(curPath); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        fs.rmdirSync(path);
    }
}

var copyFolder = function (srcDir, tarDir, cb) {
    fs.readdir(srcDir, function (err, files) {
        var count = 0;
        var checkEnd = function () {
            ++count == files.length && cb && cb();
        }

        if (err) {
            checkEnd();
            return;
        }

        files.forEach(function (file) {
            var srcPath = path.join(srcDir, file);
            var tarPath = path.join(tarDir, file);

            fs.stat(srcPath, function (err, stats) {
                if (stats.isDirectory()) {
                    console.log('mkdir', tarPath);
                    fs.mkdir(tarPath, function (err) {
                        if (err) {
                            console.log(err);
                            return;
                        }

                        copyFolder(srcPath, tarPath, checkEnd);
                    });
                } else {
                    copyFile(srcPath, tarPath, checkEnd);
                }
            });
        });

        //为空时直接回调
        files.length === 0 && cb && cb();
    });
}


// 创建所有目录
var mkdirs = function (dirpath, mode, callback) {
    //console.log(123);

    fs.exists(dirpath, function (exists) {
        if (exists) {
            callback(dirpath);
        } else {
            //尝试创建父目录，然后再创建当前目录
            mkdirs(path.dirname(dirpath), mode, function () {
                fs.mkdir(dirpath, mode, callback);
            });
        }
    });
};

function doUpload() {
    let exists = fs.existsSync(targetPath);
    if (!exists) {
        mkdirs(targetPath, null, function () {
            copyFolder('build', targetPath);
        })
    } else {
        delDir(targetPath);
        mkdirs(targetPath, null, function () {
            copyFolder('build', targetPath);
        })
    }
}

var c = require('child_process');
c.exec('cd ../gulp/gztool')
var res = c.exec('gulp --game ' + dirName, { cwd: "../gulp/gztool" }, function (err, stdout, stderr) {
    if (err) {
        console.error(err.toString())
    } else {
        console.log(stdout.toString());
    }
})
res.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
});
res.on('exit', function (code) {
    doUpload();
});
//