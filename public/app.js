const API_BASE = '/api';
const POLLING_INTERVAL = 3000;
let currentUser = null;

// Game State
let gameState = {
    isVisiting: false, // 是否在访问他人
    visitTarget: null, // 访问对象信息 {id, username}

    // My Data
    myGold: 0,
    myFarms: [],
    myInventory: [],
    myChars: [],

    // Visit Data
    visitFarms: [], // 别人的农田
};

let marketData = {
    seeds: {},
    crops: {},
    multipliers: {},
    characters: [],
    nextFluctuation: 0
};

let timerInterval = null;
let farmRenderer = null;

// --- Auth ---
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (!username || !password) return showAuthMsg('请输入用户名和密码');

    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.error) {
            showAuthMsg(data.error);
        } else {
            currentUser = data;
            enterGame();
        }
    } catch (e) {
        showAuthMsg('登录失败: ' + e.message);
    }
}

async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (!username || !password) return showAuthMsg('请输入用户名和密码');

    try {
        const res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.error) {
            showAuthMsg(data.error);
        } else {
            showAuthMsg('注册成功，请登录', 'green');
        }
    } catch (e) {
        showAuthMsg('注册失败: ' + e.message);
    }
}

function showAuthMsg(msg, color = 'red') {
    const el = document.getElementById('auth-message');
    el.innerText = msg;
    el.style.color = color === 'green' ? '#10b981' : '#f43f5e';
}

function logout() {
    currentUser = null;
    gameState.isVisiting = false;
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
    clearInterval(timerInterval);
}

async function enterGame() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('display-username').innerText = currentUser.username;

    // 初始化渲染器
    if (!farmRenderer) {
        farmRenderer = new FarmRenderer('farm-canvas-container', {
            onInteract: handleFarmInteraction
        });
        await farmRenderer.init();
    }

    refreshData();
    checkNotifications(); // 登录时检查通知

    timerInterval = setInterval(() => {
        refreshData();
        if (!gameState.isVisiting) checkNotifications(); // 只有在家才检查被偷通知
    }, POLLING_INTERVAL);

    setInterval(updateTimerUI, 1000);
}

// --- Data Fetching ---

async function refreshData() {
    if (!currentUser) return;

    // 1. 获取我的基础数据 (金币等) 始终需要，因为偷菜会增加库存
    try {
        const res = await fetch(`${API_BASE}/data?userId=${currentUser.id}`);
        const data = await res.json();
        gameState.myGold = data.gold;
        gameState.myFarms = data.farms;
        gameState.myInventory = data.inventory;
        gameState.myChars = data.characters;

        // 更新 UI
        document.getElementById('display-gold').innerText = gameState.myGold;
        renderCharacters(); // 始终显示我的角色
    } catch (e) { console.error(e); }

    // 2. 获取市场数据
    try {
        const res = await fetch(`${API_BASE}/market`);
        marketData = await res.json();
        renderShopContent(); // 更新商店价格
    } catch (e) { console.error(e); }

    // 3. 处理农田渲染
    if (gameState.isVisiting) {
        // 如果正在访问，刷新目标农场数据 (以便看到是否被别人偷了)
        await refreshVisitData();
    } else {
        console.log("App.js calling render. myFarms length:", gameState.myFarms ? gameState.myFarms.length : 0);
        if (gameState.myFarms && gameState.myFarms.length > 0) {
            console.log("First farm item:", gameState.myFarms[0]);
        }
        if (farmRenderer) farmRenderer.render(gameState.myFarms, marketData); // 渲染我的农场
    }
}

async function refreshVisitData() {
    if (!gameState.visitTarget) return;
    try {
        const res = await fetch(`${API_BASE}/social/farm/${gameState.visitTarget.id}`);
        const data = await res.json();
        gameState.visitFarms = data.farms;
        if (farmRenderer) farmRenderer.render(gameState.visitFarms, marketData); // 渲染别人农场
    } catch (e) { console.error(e); }
}

async function checkNotifications() {
    try {
        const res = await fetch(`${API_BASE}/social/notifications?userId=${currentUser.id}`);
        const notes = await res.json();
        notes.forEach(n => {
            showToast(`${n.message}`);
        });
    } catch (e) { console.error(e); }
}

// --- Social Logic ---

async function openSocial() {
    document.getElementById('social-modal').classList.remove('hidden');
    const list = document.getElementById('neighbor-list');
    list.innerHTML = '加载中...';

    try {
        const res = await fetch(`${API_BASE}/social/neighbors?userId=${currentUser.id}`);
        const neighbors = await res.json();
        list.innerHTML = '';

        if (neighbors.length === 0) {
            list.innerHTML = '<div style="padding:20px; text-align:center; color:#999">暂无其玩家</div>';
            return;
        }

        neighbors.forEach(n => {
            const div = document.createElement('div');
            div.className = 'neighbor-item';
            div.innerHTML = `
                <div style="font-weight:bold">👤 ${n.username}</div>
                <button class="btn btn-sm btn-primary">去偷菜 →</button>
            `;
            div.onclick = () => visitFarm(n);
            list.appendChild(div);
        });
    } catch (e) { list.innerHTML = '加载失败'; }
}

function visitFarm(targetUser) {
    gameState.isVisiting = true;
    gameState.visitTarget = targetUser;

    closeModal('social-modal');
    closeModal('shop-modal'); // 也可以关掉商店

    // UI 切换
    document.getElementById('farm-mode-indicator').classList.remove('hidden');
    document.getElementById('visiting-name').innerText = targetUser.username;
    document.getElementById('btn-home').classList.remove('hidden');

    // 立即加载数据
    refreshVisitData();
}

function backToMyFarm() {
    gameState.isVisiting = false;
    gameState.visitTarget = null;

    document.getElementById('farm-mode-indicator').classList.add('hidden');
    document.getElementById('btn-home').classList.add('hidden');

    refreshData();
}

// 交互处理函数
function handleFarmInteraction(x, y) {
    if (gameState.isVisiting) {
        // 访问模式：尝试偷菜
        const farm = gameState.visitFarms.find(f => f.x === x && f.y === y);
        if (farm && farm.isUnlocked && farm.cropId) {
            // 检查是否成熟
            const seed = marketData.seeds[farm.cropId];
            if (seed) {
                const now = Date.now();
                const planted = new Date(farm.plantedAt).getTime();
                if (now - planted >= seed.growTime) {
                    steal(x, y);
                } else {
                    alert("还没熟呢，不能偷！");
                }
            }
        }
    } else {
        // 自己的农场
        const farm = gameState.myFarms.find(f => f.x === x && f.y === y);
        if (!farm) return; // 异常

        if (farm.isUnlocked) {
            if (farm.cropId) {
                // 有作物：尝试收获
                const seed = marketData.seeds[farm.cropId];
                if (seed) {
                    const now = Date.now();
                    const planted = new Date(farm.plantedAt).getTime();
                    if (now - planted >= seed.growTime) {
                        harvest(x, y);
                    } else {
                        alert("还没熟呢");
                    }
                }
            } else {
                // 空地：种植
                openPlantMenu(x, y);
            }
        } else {
            // 未解锁：购买
            buyLand(x, y);
        }
    }
}

// Actions
async function buyLand(x, y) {
    if (!confirm(`花费 100 金币解锁 (${x},${y})?`)) return;
    apiCall('/farm/buy', { userId: currentUser.id, x, y });
}

async function harvest(x, y) {
    apiCall('/farm/harvest', { userId: currentUser.id, x, y });
}

async function plant(x, y, seedId) {
    apiCall('/farm/plant', { userId: currentUser.id, x, y, seedId });
}

async function steal(x, y) {
    if (!confirm('发现成熟作物！确定要偷走吗？(收益归你)')) return;
    try {
        const res = await fetch(`${API_BASE}/social/steal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                targetUserId: gameState.visitTarget.id,
                x, y
            })
        });
        const data = await res.json();
        if (data.success) {
            showToast('😈 ' + data.message);
            refreshVisitData(); // 刷新显示空地
        } else {
            showToast(data.error);
        }
    } catch (e) { showToast(e.message); }
}

// Helper: Format Time
function formatTime(ms) {
    if (!ms) return '';
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `(${hours}小时${minutes > 0 ? minutes + '分' : ''})`;
    return `(${minutes}分钟)`;
}

async function apiCall(endpoint, body) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
            refreshData();
        } else {
            alert(data.error);
        }
    } catch (e) { alert(e.message); }
}

function openPlantMenu(x, y) {
    const seeds = gameState.myInventory.filter(i => i.type === 'seed' && i.count > 0);
    if (seeds.length === 0) {
        if (confirm('还没种子，去商店买点？')) openShop();
        return;
    }
    // Simple prompt
    let msg = "选择种子:\n";
    seeds.forEach((s, idx) => {
        const seedData = marketData.seeds[s.itemId];
        const name = seedData?.name || s.itemId;
        const time = seedData ? formatTime(seedData.growTime) : '';
        msg += `${idx + 1}. ${name} (x${s.count}) ${time}\n`;
    });
    const choice = prompt(msg);
    if (choice) {
        const index = parseInt(choice) - 1;
        if (seeds[index]) plant(x, y, seeds[index].itemId);
    }
}


// --- UI Helpers ---

function updateTimerUI() {
    if (!marketData.nextFluctuation) return;
    const diff = marketData.nextFluctuation - Date.now();
    if (diff <= 0) {
        document.getElementById('timer').innerText = "波动中...";
        return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById('timer').innerText =
        `${h.toString().padStart(2, 0)}:${m.toString().padStart(2, 0)}:${s.toString().padStart(2, 0)}`;
}

function renderCharacters() {
    const left = document.getElementById('char-list-left');
    const right = document.getElementById('char-list-right');
    const chars = gameState.myChars || [];

    left.innerHTML = ''; right.innerHTML = '';
    chars.forEach((c, i) => {
        const div = document.createElement('div');
        div.className = 'char-card';
        div.innerHTML = `
            <img src="${c.imagePath}" class="char-avatar" onerror="this.src='https://placehold.co/50'">
            <div class="char-info">
                <h4>${c.name}</h4>
                <p>${c.description}</p>
            </div>
        `;
        if (i % 2 === 0) left.appendChild(div); else right.appendChild(div);
    });
}

// Shop Logic
function openShop() { document.getElementById('shop-modal').classList.remove('hidden'); switchShopTab('buy'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function switchShopTab(tab) {
    document.querySelectorAll('.tab-item').forEach(e => e.classList.remove('active'));
    // active logic simplified
    event.target.classList.add('active'); // assuming click event

    document.querySelectorAll('.shop-grid').forEach(e => e.classList.add('hidden'));
    document.getElementById(`shop-content-${tab}`).classList.remove('hidden');

    renderShopTabContent(tab);
}

function renderShopContent() {
    // 刷新当前 Tab
    const activeTab = document.querySelector('.tab-item.active');
    if (activeTab) {
        if (activeTab.innerHTML.includes('购买')) renderShopTabContent('buy');
        if (activeTab.innerHTML.includes('出售')) renderShopTabContent('sell');
        if (activeTab.innerHTML.includes('角色')) renderShopTabContent('chars');
    }
}

function renderShopTabContent(tab) {
    const container = document.getElementById(`shop-content-${tab}`);
    container.innerHTML = '';

    if (tab === 'buy') {
        Object.keys(marketData.seeds).forEach(k => {
            const s = marketData.seeds[k];
            container.innerHTML += `
                <div class="shop-card">
                    <h4>${s.name}</h4>
                    <p style="color:#eab308;font-weight:bold">💰 ${s.price}</p>
                    <button class="btn btn-sm btn-primary" onclick="apiCall('/market/buy/seed', {userId:currentUser.id, seedId:'${k}', amount:1})">购买</button>
                    <button class="btn btn-sm btn-secondary" onclick="apiCall('/market/buy/seed', {userId:currentUser.id, seedId:'${k}', amount:10})">买10个</button>
                </div>
            `;
        });
    } else if (tab === 'sell') {
        Object.keys(marketData.crops).forEach(k => {
            const c = marketData.crops[k];
            const m = marketData.multipliers[k] || 1;
            const price = Math.floor(c.basePrice * m);
            const owned = gameState.myInventory.find(i => i.type === 'crop' && i.itemId === k)?.count || 0;

            container.innerHTML += `
                <div class="shop-card">
                    <h4>${c.name}</h4>
                    <p class="${m >= 1 ? 'trend-up' : 'trend-down'}">现价: ${price} (${Math.round(m * 100)}%)</p>
                    <p style="font-size:0.8rem;color:#666">库存: ${owned}</p>
                    <button class="btn btn-sm btn-primary" ${owned <= 0 ? 'disabled' : ''} onclick="apiCall('/market/sell/crop', {userId:currentUser.id, cropId:'${k}', amount:1})">卖出</button>
                    <button class="btn btn-sm btn-secondary" ${owned <= 0 ? 'disabled' : ''} onclick="apiCall('/market/sell/crop', {userId:currentUser.id, cropId:'${k}', amount:${owned}})">全卖</button>
                </div>
            `;
        });
    } else if (tab === 'chars') {
        marketData.characters.forEach(c => {
            container.innerHTML += `
                <div class="shop-card">
                    <img src="${c.imagePath}" style="width:60px;height:60px;border-radius:50%;object-fit:cover" onerror="this.src='https://placehold.co/60'">
                    <h4>${c.name}</h4>
                    <p style="color:#eab308">💰 ${c.price}</p>
                     <button class="btn btn-sm btn-danger" onclick="apiCall('/market/buy/character', {userId:currentUser.id, characterId:${c.id}})">签约</button>
                </div>
                </div>
            `;
        });
    }
}

// Toast
function showToast(msg) {
    const list = document.getElementById('toast-container');
    const div = document.createElement('div');
    div.className = 'toast';
    div.innerHTML = `<div class="toast-title">消息</div><div class="toast-msg">${msg}</div>`;
    list.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}