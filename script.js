// Основные переменные игры
let clicks = 0;
let clickPower = 1;
let autoClicks = 0;
let level = 1;
let prestigeLevel = 0;
let prestigeBonus = 1.0;

// Элементы DOM
const clickElement = document.getElementById('clicks');
const cpsElement = document.getElementById('cps');
const levelElement = document.getElementById('level');
const clicker = document.getElementById('clicker');
const clickSound = document.getElementById('click-sound');
const achievementSound = document.getElementById('achievement-sound');
const achievementNotification = document.getElementById('achievement-notification');
const prestigeModal = document.getElementById('prestige-modal');
const prestigeBonusElement = document.getElementById('prestige-bonus');

// Улучшения
const upgrades = [
    { id: 1, name: "Улучшенный клик", description: "Увеличивает силу клика", baseCost: 10, cost: 10, power: 1, level: 0 },
    { id: 2, name: "Автокликер", description: "Автоматически кликает за вас", baseCost: 50, cost: 50, power: 0.5, level: 0 },
    { id: 3, name: "Двойной клик", description: "Удваивает силу каждого клика", baseCost: 200, cost: 200, power: 2, level: 0, multiplier: true },
    { id: 4, name: "Золотая мышь", description: "Дает шанс на золотой клик", baseCost: 500, cost: 500, power: 10, level: 0, chance: 0.1 },
    { id: 5, name: "Клик буст", description: "Временно увеличивает клик в 3 раза", baseCost: 1000, cost: 1000, power: 3, level: 0, booster: true, duration: 30 }
];

// Бустеры
const boosters = [
    { id: 1, name: "x2 на 1 минуту", description: "Удваивает клики на 1 минуту", cost: 500, active: false, multiplier: 2, duration: 60 },
    { id: 2, name: "Автоклик x5", description: "Увеличивает автоклик в 5 раз на 2 минуты", cost: 1500, active: false, multiplier: 5, duration: 120, target: "auto" },
    { id: 3, name: "Удача", description: "Увеличивает шанс золотого клика на 20%", cost: 3000, active: false, chanceBonus: 0.2, duration: 180 }
];

// Достижения
const achievements = [
    { id: 1, name: "Первые шаги", description: "Сделать 10 кликов", goal: 10, unlocked: false },
    { id: 2, name: "Кликер-новичок", description: "Сделать 100 кликов", goal: 100, unlocked: false },
    { id: 3, name: "Опытный кликер", description: "Сделать 1000 кликов", goal: 1000, unlocked: false },
    { id: 4, name: "Мастер кликов", description: "Сделать 10000 кликов", goal: 10000, unlocked: false },
    { id: 5, name: "Улучшатель", description: "Купить первое улучшение", goal: 1, type: "upgrade", unlocked: false },
    { id: 6, name: "Бустер", description: "Активировать первый бустер", goal: 1, type: "booster", unlocked: false },
    { id: 7, name: "Престиж", description: "Совершить престиж", goal: 1, type: "prestige", unlocked: false }
];

// Инициализация игры
function initGame() {
    loadGame();
    renderUpgrades();
    renderBoosters();
    renderAchievements();
    updateUI();
    startAutoClicker();
    createParticles();
    
    // Обработчики событий
    clicker.addEventListener('click', handleClick);
    document.getElementById('prestige-btn').addEventListener('click', handlePrestige);
    document.getElementById('close-modal').addEventListener('click', () => {
        prestigeModal.classList.remove('show');
    });
    
    // Проверка достижений каждую секунду
    setInterval(checkAchievements, 1000);
}

// Обработка клика
function handleClick() {
    // Воспроизведение звука
    clickSound.currentTime = 0;
    clickSound.play();
    
    // Расчет силы клика с учетом улучшений и бустов
    let currentClickPower = clickPower;
    
    // Проверка на золотой клик
    const goldenChance = upgrades.find(u => u.id === 4)?.level * 0.01 || 0;
    if (Math.random() < goldenChance) {
        currentClickPower *= 10;
        showGoldenClick();
    }
    
    // Применение активных бустеров
    const clickBoosters = boosters.filter(b => b.active && b.target !== 'auto');
    clickBoosters.forEach(booster => {
        if (booster.multiplier) {
            currentClickPower *= booster.multiplier;
        }
    });
    
    // Добавление кликов
    clicks += currentClickPower;
    
    // Анимация клика
    animateClick(currentClickPower);
    
    // Обновление интерфейса
    updateUI();
    saveGame();
}

// Автокликер
function startAutoClicker() {
    setInterval(() => {
        if (autoClicks > 0) {
            let autoPower = autoClicks;
            
            // Применение бустеров к автоклику
            const autoBoosters = boosters.filter(b => b.active && b.target === 'auto');
            autoBoosters.forEach(booster => {
                if (booster.multiplier) {
                    autoPower *= booster.multiplier;
                }
            });
            
            clicks += autoPower;
            updateUI();
            saveGame();
        }
    }, 1000);
}

// Обновление интерфейса
function updateUI() {
    clickElement.textContent = formatNumber(clicks);
    cpsElement.textContent = formatNumber(autoClicks);
    levelElement.textContent = level;
    
    // Обновление кнопок улучшений
    document.querySelectorAll('.upgrade').forEach((element, index) => {
        const upgrade = upgrades[index];
        const btn = element.querySelector('.buy-btn');
        btn.disabled = clicks < upgrade.cost;
        element.querySelector('.upgrade-level').textContent = `Ур. ${upgrade.level}`;
        element.querySelector('.upgrade-cost').textContent = `${formatNumber(upgrade.cost)} кликов`;
    });
    
    // Обновление кнопок бустеров
    document.querySelectorAll('.booster').forEach((element, index) => {
        const booster = boosters[index];
        const btn = element.querySelector('.buy-btn');
        btn.disabled = clicks < booster.cost || booster.active;
        btn.textContent = booster.active ? 'Активен' : `Купить (${formatNumber(booster.cost)})`;
    });
    
    // Проверка престижа
    if (clicks >= 100000 && !prestigeModal.classList.contains('show')) {
        prestigeBonus = 1 + (prestigeLevel * 0.5);
        prestigeBonusElement.textContent = `${prestigeBonus.toFixed(1)}x`;
        prestigeModal.classList.add('show');
    }
}

// Рендер улучшений
function renderUpgrades() {
    const grid = document.querySelector('.upgrades-grid');
    grid.innerHTML = '';
    
    upgrades.forEach(upgrade => {
        const element = document.createElement('div');
        element.className = 'upgrade';
        element.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-name">${upgrade.name} <span class="upgrade-level">Ур. ${upgrade.level}</span></div>
                <div class="upgrade-description">${upgrade.description}</div>
            </div>
            <div>
                <span class="upgrade-cost">${formatNumber(upgrade.cost)} кликов</span>
                <button class="buy-btn" onclick="buyUpgrade(${upgrade.id})">Купить</button>
            </div>
        `;
        grid.appendChild(element);
    });
}

// Рендер бустеров
function renderBoosters() {
    const grid = document.querySelector('.boosters-grid');
    grid.innerHTML = '';
    
    boosters.forEach(booster => {
        const element = document.createElement('div');
        element.className = 'booster';
        element.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-name">${booster.name}</div>
                <div class="upgrade-description">${booster.description}</div>
            </div>
            <button class="buy-btn" onclick="activateBooster(${booster.id})">Купить (${formatNumber(booster.cost)})</button>
        `;
        grid.appendChild(element);
    });
}

// Рендер достижений
function renderAchievements() {
    const grid = document.querySelector('.achievements-grid');
    grid.innerHTML = '';
    
    achievements.forEach(achievement => {
        const element = document.createElement('div');
        element.className = `achievement ${achievement.unlocked ? 'unlocked' : ''}`;
        element.innerHTML = `
            <i class="fas fa-trophy achievement-icon"></i>
            <div class="upgrade-info">
                <div class="upgrade-name">${achievement.name}</div>
                <div class="upgrade-description">${achievement.description}</div>
            </div>
        `;
        grid.appendChild(element);
    });
}

// Покупка улучшения
function buyUpgrade(id) {
    const upgrade = upgrades.find(u => u.id === id);
    
    if (clicks >= upgrade.cost) {
        clicks -= upgrade.cost;
        
        if (upgrade.multiplier) {
            clickPower *= upgrade.power;
        } else if (upgrade.booster) {
            // Активация бустера из улучшения
            activateBoosterEffect(upgrade);
        } else if (upgrade.chance) {
            // Улучшение шанса (уже обрабатывается в handleClick)
            upgrade.level++;
        } else {
            if (upgrade.id === 2) {
                autoClicks += upgrade.power;
            } else {
                clickPower += upgrade.power;
            }
            upgrade.level++;
        }
        
        upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level));
        
        // Проверка достижения "Улучшатель"
        if (id === 1 && upgrades[0].level === 1) {
            unlockAchievement(5);
        }
        
        updateUI();
        saveGame();
        animateBuy();
    }
}

// Активация бустера
function activateBooster(id) {
    const booster = boosters.find(b => b.id === id);
    
    if (clicks >= booster.cost && !booster.active) {
        clicks -= booster.cost;
        booster.active = true;
        
        // Активация эффекта бустера
        activateBoosterEffect(booster);
        
        // Установка таймера отключения бустера
        setTimeout(() => {
            booster.active = false;
            updateUI();
        }, booster.duration * 1000);
        
        // Проверка достижения "Бустер"
        if (id === 1) {
            unlockAchievement(6);
        }
        
        updateUI();
        saveGame();
    }
}

// Эффект бустера
function activateBoosterEffect(item) {
    // Визуальный эффект
    document.body.style.backgroundColor = '#2a2a4e';
    setTimeout(() => {
        document.body.style.backgroundColor = '';
    }, 500);
}

// Престиж
function handlePrestige() {
    prestigeLevel++;
    prestigeBonus = 1 + (prestigeLevel * 0.5);
    
    // Бонус престижа
    clickPower *= prestigeBonus;
    autoClicks *= prestigeBonus;
    
    // Сброс игры, но сохранение престижа и бонусов
    clicks = 0;
    level = 1;
    
    // Сброс улучшений (но не всех)
    upgrades.forEach(upgrade => {
        if (upgrade.id !== 3) { // Не сбрасываем множители
            upgrade.level = 0;
            upgrade.cost = upgrade.baseCost;
        }
    });
    
    // Разблокировка достижения "Престиж"
    unlockAchievement(7);
    
    prestigeModal.classList.remove('show');
    updateUI();
    saveGame();
}

// Проверка достижений
function checkAchievements() {
    // Проверка кликов
    achievements.filter(a => a.goal && !a.type).forEach(achievement => {
        if (clicks >= achievement.goal && !achievement.unlocked) {
            unlockAchievement(achievement.id);
        }
    });
    
    // Проверка уровня
    const newLevel = Math.floor(clicks / 1000) + 1;
    if (newLevel > level) {
        level = newLevel;
        levelUp();
    }
}

// Разблокировка достижения
function unlockAchievement(id) {
    const achievement = achievements.find(a => a.id === id);
    if (!achievement.unlocked) {
        achievement.unlocked = true;
        
        // Уведомление
        achievementNotification.querySelector('span').textContent = `Достижение: ${achievement.name}`;
        achievementNotification.classList.add('show');
        achievementSound.play();
        
        setTimeout(() => {
            achievementNotification.classList.remove('show');
        }, 3000);
        
        // Награда за достижение
        if (id === 3) clicks += 1000;
        if (id === 4) clicks += 10000;
        if (id === 7) clicks += 50000;
        
        renderAchievements();
        saveGame();
    }
}

// Повышение уровня
function levelUp() {
    // Визуальные эффекты
    document.documentElement.style.setProperty('--main-color', `hsl(${level * 10}, 70%, 60%)`);
    
    // Создание конфетти
    createConfetti();
}

// Анимация клика
function animateClick(power) {
    const value = document.querySelector('.click-value');
    value.textContent = `+${formatNumber(power)}`;
    value.style.opacity = '1';
    value.style.transform = 'translateY(0)';
    
    setTimeout(() => {
        value.style.opacity = '0';
        value.style.transform = 'translateY(-20px)';
    }, 500);
    
    // Анимация кнопки
    clicker.style.transform = 'scale(0.95)';
    setTimeout(() => {
        clicker.style.transform = 'scale(1)';
    }, 100);
    
    // Создание частиц
    createClickParticles();
}

// Анимация покупки
function animateBuy() {
    const stats = document.querySelectorAll('.stat');
    stats.forEach(stat => {
        stat.style.transform = 'scale(1.1)';
        setTimeout(() => {
            stat.style.transform = 'scale(1)';
        }, 300);
    });
}

// Золотой клик
function showGoldenClick() {
    clicker.style.background = 'linear-gradient(145deg, #ffd700, #ffaa00)';
    clicker.style.boxShadow = '0 0 50px rgba(255, 215, 0, 0.6)';
    
    setTimeout(() => {
        clicker.style.background = 'linear-gradient(145deg, #4ecdc4, #45b7d1)';
        clicker.style.boxShadow = '0 0 50px rgba(79, 205, 196, 0.6)';
    }, 1000);
}

// Создание частиц
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 5 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.background = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.7)`;
        particle.style.animation = `float ${Math.random() * 10 + 5}s infinite ease-in-out`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(particle);
    }
}

// Частицы при клике
function createClickParticles() {
    const rect = clicker.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 8 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.background = `rgba(79, 205, 196, 0.8)`;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 100 + 50;
        const duration = Math.random() * 1000 + 500;
        
        particle.style.transition = `all ${duration}ms ease-out`;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
            particle.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
            particle.remove();
        }, duration);
    }
}

// Конфетти при уровне
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd700', '#aa77ff'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'particle';
        
        const size = Math.random() * 10 + 5;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.top = `${-size}px`;
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        
        document.getElementById('particles').appendChild(confetti);
        
        const animationDuration = Math.random() * 3000 + 2000;
        confetti.style.animation = `float ${animationDuration}ms ease-out forwards`;
        
        setTimeout(() => {
            confetti.remove();
        }, animationDuration);
    }
}

// Форматирование чисел
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return Math.floor(num);
}

// Сохранение игры
function saveGame() {
    const gameData = {
        clicks,
        clickPower,
        autoClicks,
        level,
        prestigeLevel,
        prestigeBonus,
        upgrades,
        boosters,
        achievements
    };
    
    localStorage.setItem('epicClickerSave', JSON.stringify(gameData));
}

// Загрузка игры
function loadGame() {
    const savedData = localStorage.getItem('epicClickerSave');
    
    if (savedData) {
        const gameData = JSON.parse(savedData);
        
        clicks = gameData.clicks || 0;
        clickPower = gameData.clickPower || 1;
        autoClicks = gameData.autoClicks || 0;
        level = gameData.level || 1;
        prestigeLevel = gameData.prestigeLevel || 0;
        prestigeBonus = gameData.prestigeBonus || 1.0;
        
        if (gameData.upgrades) {
            gameData.upgrades.forEach((savedUpgrade, i) => {
                if (upgrades[i]) {
                    upgrades[i].level = savedUpgrade.level;
                    upgrades[i].cost = savedUpgrade.cost;
                }
            });
        }
        
        if (gameData.boosters) {
            gameData.boosters.forEach((savedBooster, i) => {
                if (boosters[i]) {
                    boosters[i].active = savedBooster.active;
                }
            });
        }
        
        if (gameData.achievements) {
            gameData.achievements.forEach((savedAchievement, i) => {
                if (achievements[i]) {
                    achievements[i].unlocked = savedAchievement.unlocked;
                }
            });
        }
    }
}

// Запуск игры при загрузке страницы
window.onload = initGame;

// Глобальные функции для HTML
window.buyUpgrade = buyUpgrade;
window.activateBooster = activateBooster;
