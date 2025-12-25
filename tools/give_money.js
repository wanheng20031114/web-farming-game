const { User, sequelize } = require('../server/models');

async function giveSubsidyToUser(userId) {
    try {
        await sequelize.sync();
        // 仅对 ID 为 userId 的用户执行更新
        await User.increment('gold', { by: 50000, where: { id: userId } });
        
        console.log(`操作成功！已给用户 ID ${userId} 发放 5000 补助金。`);
    } catch (error) {
        console.error('操作失败:', error);
    }
}

// 修改这里的数字为你想要的用户 ID
giveSubsidyToUser(11);