const express = require('express');
const router = express.Router();
const { User, Farm, Inventory, Character, Market, Notification, sequelize } = require('../models');
const { SEEDS, CROPS, CHARACTERS } = require('../data');
const { Op } = require('sequelize');

// --- 辅助函数 ---

// 获取当前市场倍率
async function getMarketMultipliers() {
    const market = await Market.findOne();
    if (market) {
        // 检查是否过期 (每4小时波动一次，London时间 0, 4, 8 ...)
        // 我们可以简单地检查当前小时 block 是否与上次更新时的 block 一致
        const now = new Date();
        const currentBlock = Math.floor(now.getUTCHours() / 4);
        const lastBlock = market.lastFluctuation ? Math.floor(market.lastFluctuation.getUTCHours() / 4) : -1;
        const sameDay = market.lastFluctuation && now.toDateString() === market.lastFluctuation.toDateString();

        if (sameDay && currentBlock === lastBlock) {
            return market.multipliers;
        }
    }

    // 需要更新市场
    const newMultipliers = {};
    for (const cropId of Object.keys(CROPS)) {
        // 0.5 到 1.5 之间的随机浮动
        newMultipliers[cropId] = parseFloat((Math.random() * 1.0 + 0.5).toFixed(2));
    }

    if (market) {
        market.multipliers = newMultipliers;
        market.lastFluctuation = new Date();
        await market.save();
    } else {
        await Market.create({
            multipliers: newMultipliers,
            lastFluctuation: new Date()
        });
    }
    return newMultipliers;
}

// 倒计时辅助
function getNextFluctuationTime() {
    const now = new Date();
    const currentBlock = Math.floor(now.getUTCHours() / 4); // 0, 1, 2, 3, 4, 5
    const nextBlock = (currentBlock + 1) * 4;

    const nextTime = new Date(now);
    nextTime.setUTCHours(nextBlock, 0, 0, 0);

    // 如果跨天了
    if (nextTime <= now) {
        nextTime.setDate(nextTime.getDate() + 1);
        nextTime.setUTCHours(0, 0, 0, 0);
    }

    return nextTime.getTime();
}


// --- 认证接口 ---

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ where: { username } });
        if (!user) {
            // 如果用户不存在，直接注册 (简化流程，符合要求中的"注册能力"但为了方便测试合并)
            // 或者我们按照严格要求分开。既然用户说要有注册能力，我们最好分开或做成自动注册
            // 这里做成：如果没找到，就返回错误，需要调用注册
            return res.status(401).json({ error: '用户不存在' });
        }
        if (user.password !== password) {
            return res.status(401).json({ error: '密码错误' });
        }
        res.json({ id: user.id, username: user.username, gold: user.gold });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.create({ username, password });

        // 初始化农田 (9x9)
        // 只有左下角 3x3 解锁
        // 假设 (0,0) 是左下角，(8,8) 是右上角
        const farms = [];
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                // 解锁条件: x < 3 && y < 3
                const isUnlocked = x < 3 && y < 3;
                farms.push({
                    UserId: user.id,
                    x,
                    y,
                    isUnlocked
                });
            }
        }
        await Farm.bulkCreate(farms);

        res.json({ success: true, user: { id: user.id, username: user.username, gold: user.gold } });
    } catch (e) {
        res.status(500).json({ error: '注册失败，用户名可能已存在' });
    }
});

// --- 游戏数据接口 ---

// 获取用户数据（包括库存、农田、角色、金币）
router.get('/data', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: '缺少 userId' });

    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: '用户未找到' });

        let farms = await Farm.findAll({ where: { UserId: userId } });

        // 延迟初始化: 如果因为某种原因该用户没有农田数据 (比如是旧账号)，则在这里创建
        if (farms.length === 0) {
            const newFarms = [];
            for (let x = 0; x < 9; x++) {
                for (let y = 0; y < 9; y++) {
                    const isUnlocked = x < 3 && y < 3;
                    newFarms.push({
                        UserId: userId,
                        x,
                        y,
                        isUnlocked
                    });
                }
            }
            farms = await Farm.bulkCreate(newFarms);
        }
        const inventory = await Inventory.findAll({ where: { UserId: userId } });
        const characters = await Character.findAll({ where: { UserId: userId } });

        res.json({
            gold: user.gold,
            farms,
            inventory,
            characters
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- 农田操作 ---

// 购买地块
router.post('/farm/buy', async (req, res) => {
    const { userId, x, y } = req.body;
    const PRICE = 1000;

    const t = await sequelize.transaction();
    try {
        const user = await User.findByPk(userId, { transaction: t });
        const farm = await Farm.findOne({ where: { UserId: userId, x, y }, transaction: t });

        if (!user || !farm) throw new Error('无效请求');
        if (farm.isUnlocked) throw new Error('该地块已解锁');
        if (user.gold < PRICE) throw new Error('金币不足');

        user.gold -= PRICE;
        await user.save({ transaction: t });

        farm.isUnlocked = true;
        await farm.save({ transaction: t });

        await t.commit();
        res.json({ success: true, gold: user.gold });
    } catch (e) {
        await t.rollback();
        res.status(400).json({ error: e.message });
    }
});

// 种植
router.post('/farm/plant', async (req, res) => {
    const { userId, x, y, seedId } = req.body; // seedId e.g. 'wheat_seed'

    const t = await sequelize.transaction();
    try {
        const farm = await Farm.findOne({ where: { UserId: userId, x, y }, transaction: t });
        const inventory = await Inventory.findOne({ where: { UserId: userId, type: 'seed', itemId: seedId }, transaction: t });

        if (!farm || !farm.isUnlocked) throw new Error('地块不可用');
        if (farm.cropId) throw new Error('地块已有作物');
        if (!inventory || inventory.count <= 0) throw new Error('没有种子');

        inventory.count -= 1;
        if (inventory.count === 0) {
            await inventory.destroy({ transaction: t });
        } else {
            await inventory.save({ transaction: t });
        }

        const seedData = SEEDS[seedId];
        farm.cropId = seedId; // 存储种子ID作为作物标识
        farm.plantedAt = new Date();
        await farm.save({ transaction: t });

        await t.commit();
        res.json({ success: true });
    } catch (e) {
        await t.rollback();
        res.status(400).json({ error: e.message });
    }
});

// 收获
router.post('/farm/harvest', async (req, res) => {
    const { userId, x, y } = req.body;

    const t = await sequelize.transaction();
    try {
        const farm = await Farm.findOne({ where: { UserId: userId, x, y }, transaction: t });
        if (!farm || !farm.cropId) throw new Error('没有作物');

        const seedData = SEEDS[farm.cropId];
        const growTime = seedData.growTime;
        const now = new Date();
        if (now - new Date(farm.plantedAt) < growTime) {
            throw new Error('作物未成熟');
        }

        // 获得作物
        const cropId = seedData.cropId; // 'wheat'
        let inventory = await Inventory.findOne({ where: { UserId: userId, type: 'crop', itemId: cropId }, transaction: t });

        if (inventory) {
            inventory.count += 1;
            await inventory.save({ transaction: t });
        } else {
            await Inventory.create({ UserId: userId, type: 'crop', itemId: cropId, count: 1 }, { transaction: t });
        }

        // 清空农田
        farm.cropId = null;
        farm.plantedAt = null;
        await farm.save({ transaction: t });

        await t.commit();
        res.json({ success: true });
    } catch (e) {
        await t.rollback();
        res.status(400).json({ error: e.message });
    }
});

// --- 商店接口 ---

// 获取商店数据 (种子列表, 当前价格, 角色列表, 倒计时)
router.get('/market', async (req, res) => {
    try {
        const multipliers = await getMarketMultipliers();
        const nextFluctuation = getNextFluctuationTime();

        // 获取所有未售出的角色
        const availableCharacters = await Character.findAll({ where: { isSold: false } });

        res.json({
            seeds: SEEDS,
            crops: CROPS,
            multipliers,
            nextFluctuation,
            characters: availableCharacters
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 购买种子
router.post('/market/buy/seed', async (req, res) => {
    const { userId, seedId, amount } = req.body;
    const count = parseInt(amount) || 1;
    const seed = SEEDS[seedId];

    const t = await sequelize.transaction();
    try {
        const user = await User.findByPk(userId, { transaction: t });
        if (!user) throw new Error('用户不存在');
        if (!seed) throw new Error('种子不存在');

        const totalCost = seed.price * count;
        if (user.gold < totalCost) throw new Error('金币不足');

        user.gold -= totalCost;
        await user.save({ transaction: t });

        let inventory = await Inventory.findOne({ where: { UserId: userId, type: 'seed', itemId: seedId }, transaction: t });
        if (inventory) {
            inventory.count += count;
            await inventory.save({ transaction: t });
        } else {
            await Inventory.create({ UserId: userId, type: 'seed', itemId: seedId, count: count }, { transaction: t });
        }

        await t.commit();
        res.json({ success: true, gold: user.gold });
    } catch (e) {
        await t.rollback();
        res.status(400).json({ error: e.message });
    }
});

// 出售作物
router.post('/market/sell/crop', async (req, res) => {
    const { userId, cropId, amount } = req.body;
    const count = parseInt(amount) || 1;

    const t = await sequelize.transaction();
    try {
        const multipliers = await getMarketMultipliers();
        const user = await User.findByPk(userId, { transaction: t });
        const inventory = await Inventory.findOne({ where: { UserId: userId, type: 'crop', itemId: cropId }, transaction: t });

        if (!user || !inventory || inventory.count < count) throw new Error('库存不足');

        const basePrice = CROPS[cropId].basePrice;
        const multiplier = multipliers[cropId] || 1;
        const unitPrice = Math.floor(basePrice * multiplier);
        const totalEarnings = unitPrice * count;

        user.gold += totalEarnings;
        inventory.count -= count;

        if (inventory.count <= 0) {
            await inventory.destroy({ transaction: t });
        } else {
            await inventory.save({ transaction: t });
        }
        await user.save({ transaction: t });

        await t.commit();
        res.json({ success: true, gold: user.gold });
    } catch (e) {
        await t.rollback();
        res.status(400).json({ error: e.message });
    }
});

// 购买角色
router.post('/market/buy/character', async (req, res) => {
    const { userId, characterId } = req.body;

    const t = await sequelize.transaction();
    try {
        const user = await User.findByPk(userId, { transaction: t });
        // 注意: 这里用行锁可能更好，但 Sequelize 的 findOne 默认不加锁，
        // 我们依赖 isSold 字段和事务的一致性
        const character = await Character.findOne({
            where: { id: characterId, isSold: false },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!user) throw new Error('用户不存在');
        if (!character) throw new Error('角色已被抢走或不存在');
        if (user.gold < character.price) throw new Error('金币不足');

        user.gold -= character.price;
        await user.save({ transaction: t });

        character.isSold = true;
        character.UserId = userId; // 设置拥有者
        await character.save({ transaction: t });

        await t.commit();
        res.json({ success: true, gold: user.gold });
    } catch (e) {
        await t.rollback();
        res.status(400).json({ error: e.message });
    }
});

// --- 社交接口 ---

// 获取邻居列表 (其他玩家)
router.get('/social/neighbors', async (req, res) => {
    const currentUserId = req.query.userId;
    try {
        const neighbors = await User.findAll({
            where: {
                id: { [Op.ne]: currentUserId } // Exclude self
            },
            attributes: ['id', 'username'],
            limit: 10 // 简单展示10个
        });
        res.json(neighbors);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 访问他人农场
router.get('/social/farm/:targetUserId', async (req, res) => {
    const { targetUserId } = req.params;
    try {
        const user = await User.findByPk(targetUserId, { attributes: ['id', 'username'] });
        if (!user) return res.status(404).json({ error: '用户不存在' });

        const farms = await Farm.findAll({ where: { UserId: targetUserId, isUnlocked: true } });
        // 只返回已解锁的，未解锁的对于访问者来说不重要或者是空的

        res.json({
            user,
            farms
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 偷菜
router.post('/social/steal', async (req, res) => {
    const { userId, targetUserId, x, y } = req.body;

    if (userId == targetUserId) return res.status(400).json({ error: '不能偷自己的' });

    const t = await sequelize.transaction();
    try {
        const thief = await User.findByPk(userId, { transaction: t });
        const victim = await User.findByPk(targetUserId, { transaction: t });
        const farm = await Farm.findOne({ where: { UserId: targetUserId, x, y }, transaction: t });

        if (!farm || !farm.cropId) throw new Error('没有作物可偷');

        // 检查成熟
        const seedData = SEEDS[farm.cropId];
        const growTime = seedData.growTime;
        const now = new Date();
        if (now - new Date(farm.plantedAt) < growTime) {
            throw new Error('作物未成熟，不能偷');
        }

        // 偷取逻辑: 100% 收成给小偷，地块变空
        const cropId = seedData.cropId;

        // 1. 给小偷加库存
        let inventory = await Inventory.findOne({ where: { UserId: userId, type: 'crop', itemId: cropId }, transaction: t });
        if (inventory) {
            inventory.count += 1;
            await inventory.save({ transaction: t });
        } else {
            await Inventory.create({ UserId: userId, type: 'crop', itemId: cropId, count: 1 }, { transaction: t });
        }

        // 2. 清空受害者农田
        farm.cropId = null;
        farm.plantedAt = null;
        await farm.save({ transaction: t });

        // 3. 创建通知
        const cropName = CROPS[cropId].name;
        await Notification.create({
            UserId: targetUserId,
            message: `你的【${cropName}】被 ${thief.username} 偷走了！`,
            type: 'theft'
        }, { transaction: t });

        await t.commit();
        res.json({ success: true, message: `成功偷取了 ${cropName}!` });
    } catch (e) {
        await t.rollback();
        res.status(400).json({ error: e.message });
    }
});

// 获取我的通知
router.get('/social/notifications', async (req, res) => {
    const { userId } = req.query;
    try {
        // 获取所有未读，或者最近的通知
        const notes = await Notification.findAll({
            where: { UserId: userId, isRead: false },
            order: [['createdAt', 'DESC']]
        });

        // 标记为已读 (简单处理: 获取即已读，或者前端发请求标记。为了方便，这里获取即标记)
        if (notes.length > 0) {
            await Notification.update({ isRead: true }, {
                where: {
                    id: { [Op.in]: notes.map(n => n.id) }
                }
            });
        }

        res.json(notes);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


module.exports = router;
