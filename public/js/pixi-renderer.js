/**
 * pixi-renderer.js
 * 负责使用 PixiJS 渲染农场区域
 */

// 资源映射表
const ASSETS = {
    grass: 'assets/farm/grass.png',
    soil: 'assets/farm/soil.png',
    seed: 'assets/farm/seed.png',
    sprout: 'assets/farm/sprout.png',
    // 将在 loadAssets 中根据 data.js 或硬编码补充完整
    wheat: 'assets/farm/wheat.png',
    corn: 'assets/farm/corn.png',
    carrot: 'assets/farm/carrot.png',
    tomato: 'assets/farm/tomato.png',
    potato: 'assets/farm/potato.png',
    pumpkin: 'assets/farm/pumpkin.png',
    strawberry: 'assets/farm/strawberry.png',
    watermelon: 'assets/farm/watermelon.png',
    grape: 'assets/farm/grape.png',
    radish: 'assets/farm/radish.png',
};

// 预设作物生成时间 (ms) -> 对应 data.js (简单硬编码或从外部传入)
// 这里仅用于前端预判显示，实际逻辑由后端控制
// 为了解耦，FarmView 应该只负责显示 "种子/生长中/成熟" 三种状态，具体由传入的数据决定

class PlotNode extends PIXI.Container {
    constructor(x, y, onClick) {
        super();
        this.gridX = x;
        this.gridY = y;
        this.onClick = onClick;

        // 交互设置
        this.eventMode = 'static'; // Pixi 7+ 使用 eventMode
        this.cursor = 'pointer';
        this.on('pointerdown', () => this.onClick(this.gridX, this.gridY));

        // 图层
        this.bgSprite = new PIXI.Sprite();
        this.cropSprite = new PIXI.Sprite();
        this.overlaySprite = new PIXI.Sprite(); // 比如锁，或者倒计时背景

        this.addChild(this.bgSprite);
        this.addChild(this.cropSprite);
        this.addChild(this.overlaySprite);

        // 倒计时文本
        this.timerText = new PIXI.Text('', {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 2
        });
        this.timerText.anchor.set(0.5, 1); // 底部居中
        this.timerText.position.set(32, 60);
        this.addChild(this.timerText);

        // 移除 Container 的强制宽高设置，避免默认缩放为空的 Sprite
        // this.width = 64;
        // this.height = 64;
    }

    // 设置数据状态
    update(farmData, marketData) {
        this.currentFarmData = farmData; // 缓存数据用于 tick

        // 1. 设置背景 (解锁 vs 未解锁)
        if (!farmData || !farmData.isUnlocked) {
            this.setTexture(this.bgSprite, 'grass');
            this.cropSprite.visible = false;
            this.timerText.text = '';
            // 未解锁状态下，可以加一个半透明遮罩或者锁图标，这里简单用草地表示
            this.bgSprite.alpha = 1.0;
            return;
        }

        // 已解锁
        this.setTexture(this.bgSprite, 'soil');
        this.bgSprite.alpha = 1.0;

        // 2. 设置作物
        if (farmData.cropId) {
            this.cropSprite.visible = true;
            this.updateCropState(farmData, marketData);
        } else {
            this.cropSprite.visible = false;
            this.timerText.text = '';
        }
    }

    // 每帧调用，用于更新倒计时或状态
    tick(now, marketData) {
        if (this.currentFarmData && this.currentFarmData.cropId && this.currentFarmData.isUnlocked) {
            this.updateCropState(this.currentFarmData, marketData);
        }
    }

    updateCropState(farmData, marketData) {
        const seedId = farmData.cropId;
        const seedInfo = marketData.seeds[seedId]; // 需要从外部获取 marketData 或者 seedInfo

        if (!seedInfo) {
            this.setTexture(this.cropSprite, 'seed'); // 默认
            return;
        }

        // 计算生长进度
        const now = Date.now();
        const plantedAt = new Date(farmData.plantedAt).getTime();
        const elapsed = now - plantedAt;
        const growTime = seedInfo.growTime;
        const cropName = seedInfo.cropId; // e.g. 'wheat'

        if (elapsed >= growTime) {
            // 成熟
            this.setTexture(this.cropSprite, cropName); // 使用具体作物 ID
            this.timerText.text = '';

            // 简单的成熟动画效果 (可选，防止每帧重置)
            if (!this.isMatureAnimated) {
                this.cropSprite.scale.set(1);
                // 这里可以加 tween，暂时略过
                this.isMatureAnimated = true;
            }
        } else {
            // 生长中
            this.isMatureAnimated = false;
            // 简单分段：刚种下显示种子，过一会显示芽
            if (elapsed < growTime * 0.3) {
                this.setTexture(this.cropSprite, 'seed');
            } else {
                this.setTexture(this.cropSprite, 'sprout');
            }

            // 倒计时
            const remainingMin = Math.ceil((growTime - elapsed) / 1000 / 60);
            this.timerText.text = `${remainingMin}m`;
        }
    }

    setTexture(sprite, key) {
        // 尝试获取纹理，如果不存在则使用白色方块兜底
        if (PIXI.Assets.cache.has(key)) {
            sprite.texture = PIXI.Assets.get(key);
        } else {
            // 如果缓存里没有，可能是名字对不上或者加载失败
            // 尝试使用 PIXI.Texture.WHITE 并保持大小
            sprite.texture = PIXI.Texture.WHITE;
            sprite.width = 64;
            sprite.height = 64;
            sprite.tint = 0xCCCCCC;
        }

        // 如果是正常贴图，重置 tint 和大小 (假设贴图就是 64x64)
        if (sprite.texture !== PIXI.Texture.WHITE) {
            sprite.tint = 0xFFFFFF;
            // 强制缩放至标准大小，应对素材尺寸不一致的情况 (如 1024x1024)
            sprite.width = 64;
            sprite.height = 64;
        }
    }
}

class FarmView {
    constructor(containerId, callbacks) {
        this.containerId = containerId;
        this.callbacks = callbacks || {}; // { onInteract: (x, y) => ... }
        this.app = null;
        this.nodes = []; // 9x9 数组
        this.marketData = null; // 缓存市场数据以便计算生长时间
    }

    async init() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // 计算尺寸: 9 * 64，无间隙
        const size = 9 * 64;

        // 设置像素画缩放模式
        PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

        this.app = new PIXI.Application({
            width: size,
            height: size,
            backgroundAlpha: 1,
            backgroundColor: 0xFFFFFF, // 白色背景以显示间隙
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        container.appendChild(this.app.view);

        // 启用排序以便调整 z-index
        this.app.stage.sortableChildren = true;

        await this.loadAssets();
        this.createGrid();
    }

    async loadAssets() {
        // 构建加载列表
        const bundles = Object.keys(ASSETS).map(key => ({ alias: key, src: ASSETS[key] }));

        // 添加 Manifest
        await PIXI.Assets.init({ manifest: { bundles: [{ name: 'farm-assets', assets: bundles }] } });

        // 加载
        try {
            await PIXI.Assets.loadBundle('farm-assets');
            console.log('Farm assets loaded successfully');
        } catch (e) {
            console.error('Farm assets load failed:', e);
        }
    }

    createGrid() {
        const GAP = 0;
        const CELL_SIZE = 64;

        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                const node = new PlotNode(x, y, (gx, gy) => {
                    if (this.callbacks.onInteract) this.callbacks.onInteract(gx, gy);
                });

                // 计算屏幕位置
                // x: 0 -> left, y: 0 -> bottom (row 8 in visual)
                const screenX = x * (CELL_SIZE + GAP);
                const screenY = (8 - y) * (CELL_SIZE + GAP);

                node.position.set(screenX, screenY);

                this.app.stage.addChild(node);

                if (!this.nodes[x]) this.nodes[x] = [];
                this.nodes[x][y] = node;
            }
        }

        // 启动自动更新循环 (每秒更新一次显示的倒计时，或者每帧检测)
        this.app.ticker.add(() => {
            this.tick();
        });
    }

    tick() {
        if (!this.nodes.length || !this.marketData) return;
        const now = Date.now();
        // 只有当数据已经加载后才更新
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                // 我们调用 node.tick(now) - 需要在 Node 类中增加 tick 方法
                // 或者直接再次调用 updateCropState 如果数据被缓存了
                if (this.nodes[x][y]) this.nodes[x][y].tick(now, this.marketData);
            }
        }
    }

    /**
     * 渲染/更新农场
     * @param {Array} farmsList 后端返回的 Farm 对象列表
     * @param {Object} marketData 市场数据 (包含种子信息)
     */
    render(farmsList, marketData) {
        if (!this.nodes.length || !this.app) return; // 还没初始化完

        this.marketData = marketData;

        // 构建快速查找 map
        const farmMap = {};
        if (farmsList) {
            farmsList.forEach(f => {
                // 确保 x,y 是字符串或数字匹配
                farmMap[`${f.x},${f.y}`] = f;
            });
        }

        // console.log("[PixiRenderer] Rendering with farms:", farmsList ? farmsList.length : 0);
        // console.log("[PixiRenderer] FarmMap sample (0,0):", farmMap["0,0"]);

        let unlockedCount = 0;

        // 遍历所有节点更新
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                const node = this.nodes[x][y];
                const data = farmMap[`${x},${y}`];

                if (data && data.isUnlocked) {
                    unlockedCount++;
                }

                // 如果没有数据，默认代表未解锁且无作物 (或者 data 为 undefined)
                node.update(data, marketData);
            }
        }
    }
}

// 导出给全局使用
window.FarmRenderer = FarmView;
