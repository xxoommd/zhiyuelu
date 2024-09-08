#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 目录路径

const directoryPath = path.join(__dirname, '../scroll_13');
let startID = 376

// 读取目录内容
fs.readdir(directoryPath, (err, files) => {
    if (err) {
        console.error('读取目录时出错:', err);
        return;
    }

    // 过滤并列出文件
    files.forEach(file => {
        const oldPath = path.join(directoryPath, file);
        fs.stat(oldPath, (err, stats) => {
            if (err) {
                console.error('获取文件信息时出错:', err);
                return;
            }

            if (stats.isFile()) {
                let [id, name] = file.split('、')
                let newID = parseInt(id) + startID
                let newFile = `${String(newID).padStart(3, '0')}_${name}`
                // console.log(`${file} -> ${newFile}`)

                const newPath = path.join(directoryPath, newFile)

                try {
                    fs.renameSync(oldPath, newPath);
                    console.log(`文件成功从 ${oldPath} 重命名为 ${newPath}`);
                } catch (err) {
                    console.error('重命名文件时出错:', err);
                }

            }
        });
    });
});
