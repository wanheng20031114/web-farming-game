// 游戏数据配置

const SEEDS = {
    'wheat_seed': { name: '小麦种子', price: 10, cropId: 'wheat', growTime: 3600 * 1000 }, // 1小时
    'corn_seed': { name: '玉米种子', price: 20, cropId: 'corn', growTime: 3600 * 2000 }, // 2小时
    'carrot_seed': { name: '胡萝卜种子', price: 30, cropId: 'carrot', growTime: 3600 * 3000 },
    'tomato_seed': { name: '番茄种子', price: 40, cropId: 'tomato', growTime: 3600 * 4000 },
    'potato_seed': { name: '土豆种子', price: 25, cropId: 'potato', growTime: 3600 * 2500 },
    'pumpkin_seed': { name: '南瓜种子', price: 50, cropId: 'pumpkin', growTime: 3600 * 5000 },
    'strawberry_seed': { name: '草莓种子', price: 60, cropId: 'strawberry', growTime: 3600 * 6000 },
    'watermelon_seed': { name: '西瓜种子', price: 80, cropId: 'watermelon', growTime: 3600 * 8000 },
    'grape_seed': { name: '葡萄种子', price: 100, cropId: 'grape', growTime: 3600 * 8000 }, // 8小时 max
    'radish_seed': { name: '白萝卜种子', price: 15, cropId: 'radish', growTime: 3600 * 1500 },
};

const CROPS = {
    'wheat': { name: '小麦', basePrice: 20 },
    'corn': { name: '玉米', basePrice: 45 },
    'carrot': { name: '胡萝卜', basePrice: 70 },
    'tomato': { name: '番茄', basePrice: 90 },
    'potato': { name: '土豆', basePrice: 55 },
    'pumpkin': { name: '南瓜', basePrice: 120 },
    'strawberry': { name: '草莓', basePrice: 150 },
    'watermelon': { name: '西瓜', basePrice: 200 },
    'grape': { name: '葡萄', basePrice: 250 },
    'radish': { name: '白萝卜', basePrice: 35 },
};

// 预设二次元角色数据
// 图片文件名假设为 public/images/characters/eriri.jpg 等
const CHARACTERS = [
    { name: '泽村·斯宾塞·英梨梨', description: '金发双马尾，傲娇青梅竹马', imagePath: '/images/characters/eriri.jpg', price: 100000 },
    { name: '加藤惠', description: '路人女主，性格淡定', imagePath: '/images/characters/megumi.jpg', price: 100000 },
    { name: '霞之丘诗羽', description: '黑长直，毒舌学姐', imagePath: '/images/characters/utaha.jpg', price: 100000 },
    { name: '御坂美琴', description: '炮姐，Level 5', imagePath: '/images/characters/misaka.jpg', price: 100000 },
    { name: '雷姆', description: '蓝发女仆，温柔体贴', imagePath: '/images/characters/rem.jpg', price: 100000 },
    { name: '亚丝娜', description: '闪光的亚丝娜', imagePath: '/images/characters/asuna.jpg', price: 100000 },
    { name: 'Saber', description: '骑士王，阿尔托莉雅', imagePath: '/images/characters/saber.jpg', price: 100000 },
    { name: '初音未来', description: '世界第一公主殿下', imagePath: '/images/characters/miku.jpg', price: 100000 },
    { name: '时崎狂三', description: '最恶精灵', imagePath: '/images/characters/kurumi.jpg', price: 100000 },
    { name: '樱岛麻衣', description: '兔女郎学姐', imagePath: '/images/characters/mai.jpg', price: 100000 },

    // EVA 系列
    { name: '明日香·兰格雷', description: '红色战斗服，傲娇EVA驾驶员', imagePath: '/images/characters/asuka.jpg', price: 100000 },
    { name: '绫波丽', description: '蓝发冷淡EVA驾驶员', imagePath: '/images/characters/rei.jpg', price: 100000 },

    // 偶像/校园系
    { name: '小泉花阳', description: '阳光偶像系女高中生', imagePath: '/images/characters/hanayo.jpg', price: 100000 },
    { name: '矢泽妮可', description: '偶像社团活泼担当', imagePath: '/images/characters/nico.jpg', price: 100000 },
    { name: '高坂穗乃果', description: '元气偶像，μ\'s队长', imagePath: '/images/characters/honoka.jpg', price: 100000 },
    { name: '园田海未', description: '认真的学业偶像', imagePath: '/images/characters/umi.jpg', price: 100000 },
    { name: '星空凛', description: '活泼猫系少女', imagePath: '/images/characters/rin.jpg', price: 100000 },

    // 魔法少女
    { name: '鹿目圆', description: '温柔的魔法少女', imagePath: '/images/characters/madoka.jpg', price: 100000 },
    { name: '晓美焰', description: '冷静、理性的魔法少女', imagePath: '/images/characters/homura.jpg', price: 100000 },
    { name: '美树沙耶加', description: '勇敢的蓝发魔法少女', imagePath: '/images/characters/sayaka.jpg', price: 100000 },
    { name: '巴麻美', description: '射击魔法少女，温柔姐姐', imagePath: '/images/characters/mami.jpg', price: 100000 },

    // 文学少女/校园类
    { name: '千反田爱瑠', description: '好奇心旺盛的学园少女', imagePath: '/images/characters/chitanda.jpg', price: 100000 },
    { name: '长门有希', description: '沉默寡言，超能力学姐', imagePath: '/images/characters/yuki.jpg', price: 100000 },
    { name: '泉此方', description: '《幸运星》天然呆少女', imagePath: '/images/characters/konata.jpg', price: 100000 },
    { name: '藤原千花', description: '《辉夜大小姐想让我告白》聪明活泼', imagePath: '/images/characters/chika.jpg', price: 100000 },
    { name: '四宮かぐや', description: '高冷学园千金', imagePath: '/images/characters/kaguya.jpg', price: 100000 },

    // 游戏/奇幻类
    { name: '莉莉娜', description: '勇者系少女', imagePath: '/images/characters/lilina.jpg', price: 100000 },
    { name: '妮诺', description: '可爱的魔法少女', imagePath: '/images/characters/nino.jpg', price: 100000 },
    { name: '菲谢尔', description: '风神之子，幻想世界少女', imagePath: '/images/characters/fischl.jpg', price: 100000 },

    // 更多人气角色
    { name: '南小鸟', description: 'μ\'s偶像副队长', imagePath: '/images/characters/kotori.jpg', price: 100000 },
    { name: '高町奈叶', description: '魔法少女奈叶', imagePath: '/images/characters/nanoha.jpg', price: 100000 },
    { name: '雪之下雪乃', description: '聪慧冷静的学园少女', imagePath: '/images/characters/yukino.jpg', price: 100000 },
    { name: '由比滨结衣', description: '元气，善良的少女', imagePath: '/images/characters/yui.jpg', price: 100000 },
    { name: '八幡比企谷', description: '《我的青春恋爱物语》关键角色', imagePath: '/images/characters/hachiman.jpg', price: 100000 },
    { name: '铃原美沙', description: '可爱学妹', imagePath: '/images/characters/misa.jpg', price: 100000 },
    { name: '苍崎青子', description: '神秘魔法少女', imagePath: '/images/characters/aoko.jpg', price: 100000 },
    { name: '远坂凛', description: '红发魔术师', imagePath: '/images/characters/rin_tohsaka.jpg', price: 100000 },
    { name: '间桐樱', description: '温柔而神秘', imagePath: '/images/characters/sakura.jpg', price: 100000 },
    { name: '葛饰北斋', description: '历史奇幻角色', imagePath: '/images/characters/katsushika.jpg', price: 100000 },
    { name: '藤堂静', description: '学园少女角色', imagePath: '/images/characters/shizuka.jpg', price: 100000 },
    { name: '雾岛董香', description: '奇幻角色', imagePath: '/images/characters/touka.jpg', price: 100000 },
    { name: '大和抚子', description: '传统美少女形象', imagePath: '/images/characters/yamato.jpg', price: 100000 },
    { name: '小鸟游六花', description: '《中二病也要谈恋爱》少女', imagePath: '/images/characters/rokka.jpg', price: 100000 },
    { name: '黑雪姬', description: '《刀剑神域》神秘少女', imagePath: '/images/characters/kuroyukihime.jpg', price: 100000 },
    { name: '羽川翼', description: '《物语系列》冷静少女', imagePath: '/images/characters/tsubasa.jpg', price: 100000 },
    { name: '神原骏河', description: '《物语系列》运动少女', imagePath: '/images/characters/kanbaru.jpg', price: 100000 },
    { name: '八九寺真宵', description: '《物语系列》幽灵少女', imagePath: '/images/characters/mayoi.jpg', price: 100000 },
    { name: '忍野忍', description: '《物语系列》吸血少女', imagePath: '/images/characters/shinobu.jpg', price: 100000 },
    { name: '古手川唯', description: '《魔法老师》女主角', imagePath: '/images/characters/yui_furude.jpg', price: 100000 },
    { name: '神崎·堇', description: '偶像系少女', imagePath: '/images/characters/sumi.jpg', price: 100000 },
    { name: '岛风', description: '舰娘人气角色', imagePath: '/images/characters/shimakaze.jpg', price: 100000 },
    { name: '时雨', description: '舰娘角色', imagePath: '/images/characters/shigure.jpg', price: 100000 },
    { name: '赤城', description: '舰娘角色', imagePath: '/images/characters/akagi.jpg', price: 100000 },
    // 新增角色 51-100
    { name: '宫园薰', description: '《四月是你的谎言》小提琴天才少女', imagePath: '/images/characters/kaori.jpg', price: 100000 },
    { name: '日向雏田', description: '《火影忍者》温柔少女', imagePath: '/images/characters/hinata.jpg', price: 100000 },
    { name: '春野樱', description: '《火影忍者》活泼少女', imagePath: '/images/characters/sakura_n.jpg', price: 100000 },
    { name: '娜美', description: '《海贼王》航海士', imagePath: '/images/characters/nami.jpg', price: 100000 },
    { name: '罗宾', description: '《海贼王》考古学家', imagePath: '/images/characters/robin.jpg', price: 100000 },
    { name: '神乐', description: '《银魂》外星战斗少女', imagePath: '/images/characters/kagura.jpg', price: 100000 },
    { name: '艾米丽', description: '《Re:Zero》贵族少女', imagePath: '/images/characters/emilia.jpg', price: 100000 },
    { name: '拉姆', description: '《Re:Zero》红发女仆', imagePath: '/images/characters/ram.jpg', price: 100000 },
    { name: '露西·哈特菲利亚', description: '《妖精的尾巴》魔导士少女', imagePath: '/images/characters/lucy.jpg', price: 100000 },
    { name: '莉莎', description: '《原神》可爱法师少女', imagePath: '/images/characters/lisa.jpg', price: 100000 },

    { name: '芙兰', description: '《东方Project》吸血鬼少女', imagePath: '/images/characters/flandre.jpg', price: 100000 },
    { name: '蕾姆雷姆', description: '《Re:Zero》双胞胎人气女仆', imagePath: '/images/characters/ram_rem.jpg', price: 100000 },
    { name: '春日野穹', description: '《缘之空》美少女主角', imagePath: '/images/characters/sora.jpg', price: 100000 },
    { name: '白', description: '《兽娘动物园》温柔少女', imagePath: '/images/characters/shiro.jpg', price: 100000 },
    { name: '五更琉璃', description: '《我的妹妹哪有这么可爱》宅女', imagePath: '/images/characters/kuroneko.jpg', price: 100000 },
    { name: '结城明日奈', description: '《刀剑神域》女主角', imagePath: '/images/characters/asuna2.jpg', price: 100000 },
    { name: '绫波丽改', description: 'EVA冷淡少女特装版', imagePath: '/images/characters/rei2.jpg', price: 100000 },
    { name: '明日香·兰格雷改', description: 'EVA红发少女特装版', imagePath: '/images/characters/asuka2.jpg', price: 100000 },
    { name: '艾莉丝', description: '《刀剑神域》可爱少女', imagePath: '/images/characters/alice.jpg', price: 100000 },
    { name: '雾雨魔理沙', description: '《东方Project》魔法少女', imagePath: '/images/characters/marisa.jpg', price: 100000 },

    { name: '十六夜咲夜', description: '《东方Project》女仆时钟少女', imagePath: '/images/characters/sakuya.jpg', price: 100000 },
    { name: '铃仙·优昙华院·因幡', description: '《东方Project》兔女郎少女', imagePath: '/images/characters/reisen.jpg', price: 100000 },
    { name: '芙兰达', description: '《东方Project》吸血少女', imagePath: '/images/characters/flandre2.jpg', price: 100000 },
    { name: '雾雨魔理沙2', description: '《东方Project》魔法少女', imagePath: '/images/characters/marisa2.jpg', price: 100000 },
    { name: '十六夜咲夜2', description: '《东方Project》女仆少女', imagePath: '/images/characters/sakuya2.jpg', price: 100000 },
    { name: '高海千歌', description: '《LoveLive!》元气少女', imagePath: '/images/characters/chika2.jpg', price: 100000 },
    { name: '樱内梨子', description: '《LoveLive!》钢琴少女', imagePath: '/images/characters/riko.jpg', price: 100000 },
    { name: '松浦果南', description: '《LoveLive!》泳装少女', imagePath: '/images/characters/kanan.jpg', price: 100000 },
    { name: '渡边曜', description: '《LoveLive!》热血少女', imagePath: '/images/characters/you.jpg', price: 100000 },
    { name: '黑泽黛雅', description: '《LoveLive!》学姐气质', imagePath: '/images/characters/diya.jpg', price: 100000 },

    { name: '堀北铃音', description: '《轻音少女》活泼少女', imagePath: '/images/characters/suzune.jpg', price: 100000 },
    { name: '青山七海', description: '《偶像大师》可爱少女', imagePath: '/images/characters/nanami.jpg', price: 100000 },
    { name: '藤堂静香', description: '《学园少女》温柔学姐', imagePath: '/images/characters/shizuka2.jpg', price: 100000 },
    { name: '天使恵', description: '《游戏少女》魔法少女', imagePath: '/images/characters/megumi2.jpg', price: 100000 },
    { name: '白雪姬', description: '幻想少女角色', imagePath: '/images/characters/shirayuki.jpg', price: 100000 },
    { name: '草薙素子', description: '《攻壳机动队》女特工', imagePath: '/images/characters/motoko.jpg', price: 100000 },
    { name: '草壁千夏', description: '《青春校园》活泼少女', imagePath: '/images/characters/chinatsu.jpg', price: 100000 },
    { name: '篠宫可怜', description: '《校园少女》元气可爱', imagePath: '/images/characters/karen.jpg', price: 100000 },
    { name: '三千院凪', description: '《旋风管家》高冷少女', imagePath: '/images/characters/nagi.jpg', price: 100000 },
    { name: '夏娜', description: '《灼眼的夏娜》火焰少女', imagePath: '/images/characters/shana.jpg', price: 100000 },

    { name: '天羽雅音', description: '《偶像少女》温柔甜美', imagePath: '/images/characters/maon.jpg', price: 100000 },
    { name: '北条加蓮', description: '《偶像大师》可爱少女', imagePath: '/images/characters/karen2.jpg', price: 100000 },
    { name: '小鸟游六花2', description: '《中二病也要谈恋爱》少女', imagePath: '/images/characters/rokka2.jpg', price: 100000 },
    { name: '西园寺世界', description: '《School Days》经典少女', imagePath: '/images/characters/sekai.jpg', price: 100000 },
    { name: '桂言叶', description: '《School Days》温柔少女', imagePath: '/images/characters/kotonoha.jpg', price: 100000 },
    { name: '宫本茉莉', description: '《偶像少女》活泼少女', imagePath: '/images/characters/mari.jpg', price: 100000 },
    { name: '新垣绫濑', description: '《校园少女》甜美可爱', imagePath: '/images/characters/ayase2.jpg', price: 100000 },
    { name: '三笠·阿克曼', description: '《进击的巨人》冷酷少女', imagePath: '/images/characters/mikasa.jpg', price: 100000 },
    { name: '阿尔敏少女版', description: '《进击的巨人》可爱少女', imagePath: '/images/characters/armin_female.jpg', price: 100000 },
    { name: '艾伦少女版', description: '《进击的巨人》少女版本', imagePath: '/images/characters/eren_female.jpg', price: 100000 },
    { name: '三千院凪2', description: '《旋风管家》高冷少女', imagePath: '/images/characters/nagi2.jpg', price: 100000 },
];


module.exports = { SEEDS, CROPS, CHARACTERS };
