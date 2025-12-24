const { DataTypes } = require('sequelize');
const sequelize = require('../database');

// 用户模型
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        comment: '用户名'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '密码'
    },
    gold: {
        type: DataTypes.INTEGER,
        defaultValue: 1000,
        comment: '金币数量'
    }
});

// 农田模型
const Farm = sequelize.define('Farm', {
    x: {
        type: DataTypes.INTEGER,
        comment: 'X坐标 (0-8)'
    },
    y: {
        type: DataTypes.INTEGER,
        comment: 'Y坐标 (0-8)'
    },
    isUnlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: '是否解锁'
    },
    cropId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '种植的作物ID'
    },
    plantedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '种植时间'
    }
});

// 库存模型
const Inventory = sequelize.define('Inventory', {
    type: {
        type: DataTypes.ENUM('seed', 'crop'),
        comment: '物品类型：种子或作物'
    },
    itemId: {
        type: DataTypes.STRING,
        comment: '物品ID'
    },
    count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '数量'
    }
});

// 角色模型
const Character = sequelize.define('Character', {
    name: {
        type: DataTypes.STRING,
        unique: true,
        comment: '角色名字'
    },
    description: {
        type: DataTypes.STRING,
        comment: '角色描述'
    },
    imagePath: {
        type: DataTypes.STRING,
        comment: '图片路径'
    },
    price: {
        type: DataTypes.INTEGER,
        comment: '价格'
    },
    isSold: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: '是否已售出'
    }
});

// 市场价格模型 (用于记录波动)
const Market = sequelize.define('Market', {
    multipliers: {
        type: DataTypes.JSON, // 存储所有作物的当前价格倍率
        comment: '当前价格倍率'
    },
    lastFluctuation: {
        type: DataTypes.DATE,
        comment: '上次波动时间'
    }
});

// 建立关联
User.hasMany(Farm);
Farm.belongsTo(User);

User.hasMany(Inventory);
Inventory.belongsTo(User);

// 角色被用户拥有 (如果 isSold 为 true, 则 UserId 不为空)
User.hasMany(Character);
Character.belongsTo(User);

module.exports = { User, Farm, Inventory, Character, Market, sequelize };
