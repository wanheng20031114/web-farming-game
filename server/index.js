const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { sequelize, Character } = require('./models');
const { CHARACTERS } = require('./data');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = 40003;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// 路由
app.use('/api', apiRoutes);

// 读取证书
let options = {};
try {
    options = {
        key: fs.readFileSync(path.join(__dirname, 'server.key')),
        cert: fs.readFileSync(path.join(__dirname, 'server.crt'))
    };
} catch (e) {
    console.error("加载证书失败，请确保 server.key 和 server.crt 存在。", e);
    process.exit(1);
}

// 初始化数据库并启动服务器
async function startServer() {
    try {
        await sequelize.sync(); // 同步数据库结构
        console.log('数据库已同步');

        // 检查并初始化角色数据 (如果为空)
        // 同步角色数据 (确保 data.js 中的所有角色都存在于数据库)
        console.log('正在同步角色数据...');
        for (const charData of CHARACTERS) {
            // 查找是否已存在 (根据名字)
            const exists = await Character.findOne({ where: { name: charData.name } });
            if (!exists) {
                await Character.create(charData);
                console.log(`添加新角色: ${charData.name}`);
            } else {
                // 可选：更新价格或描述 (如果需要保持数据完全同步)
                // exists.price = charData.price;
                // exists.imagePath = charData.imagePath;
                // await exists.save();
            }
        }
        console.log(`角色数据同步完成。总库存: ${CHARACTERS.length} (数据库实际: ${await Character.count()})`);

        https.createServer(options, app).listen(PORT, () => {
            console.log(`HTTPS 服务器运行在 https://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('无法启动服务器:', error);
    }
}

startServer();
