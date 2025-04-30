const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 加载图片资源
const images = {
    hero: new Image(),
    monster: new Image()
};

images.hero.src = 'images/monster.png';
images.monster.src = 'images/hero.png';

// 游戏对象配置
const hero = {
    x: 100,
    y: 100,
    width: 50,   // 根据图片实际尺寸调整
    height: 50,  // 根据图片实际尺寸调整
    baseSize: 50,
    visible: true,
    isAnimating: false,
    alpha: 1
};

const monster = {
    x: 400,
    y: 300,
    width: 60,   // 根据图片实际尺寸调整
    height: 60,  // 根据图片实际尺寸调整
    baseSize: 60,
    visible: true,
    isAnimating: false,
    alpha: 1
};

let isColliding = false;
let animationStartTime = 0;
const ANIMATION_DURATION = 1000;

// 鼠标控制变量
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// 键盘控制（控制怪物移动）
document.addEventListener('keydown', (e) => {
    if (hero.isAnimating || monster.isAnimating) return;
    const speed = 15;
    switch (e.key) {
        case 'ArrowUp': monster.y -= speed; break;
        case 'ArrowDown': monster.y += speed; break;
        case 'ArrowLeft': monster.x -= speed; break;
        case 'ArrowRight': monster.x += speed; break;
    }
});

// 鼠标控制（控制英雄）
canvas.addEventListener('mousedown', (e) => {
    if (hero.isAnimating || monster.isAnimating) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 检测是否点击在英雄范围内
    if (
        mouseX >= hero.x &&
        mouseX <= hero.x + hero.width &&
        mouseY >= hero.y &&
        mouseY <= hero.y + hero.height
    ) {
        isDragging = true;
        dragOffset.x = mouseX - hero.x;
        dragOffset.y = mouseY - hero.y;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging || hero.isAnimating || monster.isAnimating) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 更新英雄位置
    hero.x = mouseX - dragOffset.x;
    hero.y = mouseY - dragOffset.y;

    // 边界限制
    hero.x = Math.max(0, Math.min(hero.x, canvas.width - hero.width));
    hero.y = Math.max(0, Math.min(hero.y, canvas.height - hero.height));
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

// 碰撞检测（基于包围盒）
function checkCollision() {
    return (
        hero.x < monster.x + monster.width &&
        hero.x + hero.width > monster.x &&
        hero.y < monster.y + monster.height &&
        hero.y + hero.height > monster.y
    );
}

// 震动效果
function shake() {
    const intensity = 3;
    const now = Date.now();
    const timeFactor = (now - animationStartTime) / ANIMATION_DURATION;
    const currentIntensity = intensity * (1 - timeFactor);

    hero.x += (Math.random() - 0.5) * currentIntensity;
    hero.y += (Math.random() - 0.5) * currentIntensity;
    monster.x += (Math.random() - 0.5) * currentIntensity;
    monster.y += (Math.random() - 0.5) * currentIntensity;
}

// 渐隐效果
function fadeOut() {
    const progress = (Date.now() - animationStartTime) / ANIMATION_DURATION;

    // 更新透明度
    hero.alpha = 1 - progress;
    monster.alpha = 1 - progress;

    // 更新尺寸
    const scale = Math.max(0.1, 1 - progress);
    hero.width = hero.baseSize * scale;
    hero.height = hero.baseSize * scale;
    monster.width = monster.baseSize * scale;
    monster.height = monster.baseSize * scale;

    if (progress >= 1) {
        hero.visible = false;
        monster.visible = false;
        hero.isAnimating = false;
        monster.isAnimating = false;
    }
}

// 渲染循环
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制怪物
    if (monster.visible) {
        ctx.save();
        ctx.globalAlpha = monster.alpha;
        ctx.drawImage(
            images.monster,
            monster.x,
            monster.y,
            monster.width,
            monster.height
        );
        ctx.restore();
    }

    // 绘制英雄
    if (hero.visible) {
        ctx.save();
        ctx.globalAlpha = hero.alpha;
        ctx.drawImage(
            images.hero,
            hero.x,
            hero.y,
            hero.width,
            hero.height
        );
        ctx.restore();
    }

    // 碰撞检测与动画处理
    if (checkCollision() && !hero.isAnimating) {
        animationStartTime = Date.now();
        hero.isAnimating = true;
        monster.isAnimating = true;
    }

    if (hero.isAnimating) {
        shake();
        fadeOut();
    }

    requestAnimationFrame(draw);
}

// 等待图片加载完成后启动
let imagesLoaded = 0;
Object.values(images).forEach(img => {
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === Object.keys(images).length) {
            draw();
        }
    };
});
