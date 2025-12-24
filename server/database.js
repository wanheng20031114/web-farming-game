const { Sequelize } = require('sequelize');
const path = require('path');

// 初始化 SQLite 数据库连接
// 使用 storage 参数指定数据库文件路径
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database/farming.sqlite'), // 数据库文件存储在 database 目录
  logging: false, // 关闭 SQL 日志输出，保持控制台整洁
});

module.exports = sequelize;
