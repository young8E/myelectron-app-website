const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 图形对象配置
const circle = {
    x: 100, y: 100, radius: 20,
    baseRadius: 20,
    visible: true,
    isAnimating: false,
    alpha: 1
};

const rect = {
    x: 400, y: 300, width: 50, height: 50,
    baseWidth: 50, baseHeight: 50,
    visible: true,
    isAnimating: false,
    alpha: 1
};

let isColliding = false;
let animationStartTime = 0;
const ANIMATION_DURATION = 1000;

// 新增鼠标控制变量
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// 监听键盘事件（速度提升至 15）
document.addEventListener('keydown', (e) => {
    if (circle.isAnimating || rect.isAnimating) return;
    const speed = 15; // 速度从 5 提升到 15
    switch (e.key) {
        case 'ArrowUp': rect.y -= speed; break;
        case 'ArrowDown': rect.y += speed; break;
        case 'ArrowLeft': rect.x -= speed; break;
        case 'ArrowRight': rect.x += speed; break;
    }
});

// 新增鼠标事件监听
canvas.addEventListener('mousedown', (e) => {
    if (circle.isAnimating || rect.isAnimating) return;

    // 转换鼠标坐标为画布内坐标
    const rectCanvas = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rectCanvas.left;
    const mouseY = e.clientY - rectCanvas.top;

    // 检测是否点击在矩形内部
    if (
        mouseX >= rect.x &&
        mouseX <= rect.x + rect.width &&
        mouseY >= rect.y &&
        mouseY <= rect.y + rect.height
    ) {
        isDragging = true;
        dragOffset.x = mouseX - rect.x;
        dragOffset.y = mouseY - rect.y;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging || circle.isAnimating || rect.isAnimating) return;

    const rectCanvas = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rectCanvas.left;
    const mouseY = e.clientY - rectCanvas.top;

    // 更新矩形位置（跟随鼠标）
    rect.x = mouseX - dragOffset.x;
    rect.y = mouseY - dragOffset.y;

    // 边界限制（可选）
    rect.x = Math.max(0, Math.min(rect.x, canvas.width - rect.width));
    rect.y = Math.max(0, Math.min(rect.y, canvas.height - rect.height));
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

// 碰撞检测（保持不变）
function checkCollision() {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    return (dx * dx + dy * dy) < (circle.radius * circle.radius);
}

// 双对象震动算法
function dualShake() {
    const intensity = 3; // 降低震动强度
    const now = Date.now();
    const timeFactor = (now - animationStartTime) / ANIMATION_DURATION;

    // 随时间衰减震动强度
    const currentIntensity = intensity * (1 - timeFactor);

    // 圆形震动
    circle.x += (Math.random() - 0.5) * currentIntensity;
    circle.y += (Math.random() - 0.5) * currentIntensity;

    // 矩形震动
    rect.x += (Math.random() - 0.5) * currentIntensity;
    rect.y += (Math.random() - 0.5) * currentIntensity;
}

// 双对象渐隐缩小
function dualFade() {
    const progress = (Date.now() - animationStartTime) / ANIMATION_DURATION;

    // 透明度变化
    circle.alpha = 1 - progress;
    rect.alpha = 1 - progress;

    // 尺寸变化
    circle.radius = circle.baseRadius * (1 - progress);
    rect.width = rect.baseWidth * (1 - progress);
    rect.height = rect.baseHeight * (1 - progress);

    // 动画结束处理
    if (progress >= 1) {
        circle.visible = false;
        rect.visible = false;
        circle.isAnimating = false;
        rect.isAnimating = false;
    }
}

// 渲染循环
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制矩形（带透明度）
    if (rect.visible) {
        ctx.save();
        ctx.globalAlpha = rect.alpha;
        ctx.fillStyle = 'blue';
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        ctx.restore();
    }

    // 绘制圆形（带透明度）
    if (circle.visible) {
        ctx.save();
        ctx.globalAlpha = circle.alpha;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.restore();
    }

    // 碰撞检测与动画触发
    if (checkCollision() && !circle.isAnimating) {
        animationStartTime = Date.now();
        circle.isAnimating = true;
        rect.isAnimating = true;
    }

    // 执行动画
    if (circle.isAnimating) {
        dualShake();
        dualFade();
    }

    requestAnimationFrame(draw);
}

draw();