/**
 * 主题管理器
 */
import { initI18n, t, setLanguage } from './i18n.js';

class VisualEngine {
    constructor() {
        this.grid = document.querySelectorAll('.bento-grid');
        this.initParallax();
    }

    initParallax() {
        // 鼠标跟随视差：让页面有深度感，脱离平面模版
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 30;
            const y = (e.clientY / window.innerHeight - 0.5) * 30;

            gsap.to('.bento-item', {
                x: (i) => x * (i % 3 === 0 ? 0.5 : 1),
                y: (i) => y * (i % 2 === 0 ? 0.5 : 1),
                duration: 1.5,
                ease: "power2.out"
            });
        });
    }
}

class ThemeManager {
    constructor() {
        this.htmlEl = document.documentElement;
        this.themeSwitch = document.getElementById('theme-switch');
        this.storageKey = 'bento-theme-preference';
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem(this.storageKey);

        if (savedTheme) {
            this.applyTheme(savedTheme === 'dark');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.applyTheme(prefersDark, true); // true 代表保持 auto 状态
        }

        if (this.themeSwitch) {
            this.themeSwitch.addEventListener('change', (e) => {
                const isDark = e.target.checked;
                this.applyTheme(isDark);
                localStorage.setItem(this.storageKey, isDark ? 'dark' : 'light');
            });
        }
    }

    applyTheme(isDark, isAuto = false) {
        if (this.themeSwitch) {
            this.themeSwitch.checked = isDark;
        }

        this.htmlEl.classList.remove('mdui-theme-auto', 'mdui-theme-dark', 'mdui-theme-light');

        if (isAuto) {
            this.htmlEl.classList.add('mdui-theme-auto');
        } else {
            this.htmlEl.classList.add(isDark ? 'mdui-theme-dark' : 'mdui-theme-light');
        }
    }
}

/**
 * 文章加载器
 */
class BlogLoader {
    constructor() {
        this.apiUrl = 'https://blog.xiaofengqwq.com/api/posts';
        this.listElement = $('#blog-posts-list');
        this.init();
    }

    init() {
        this.loadPosts();
    }

    loadPosts() {
        $.ajax({
            url: this.apiUrl,
            method: 'GET',
            dataType: 'json',
            success: (response) => {
                if (response && response.status === 'success' && response.data && response.data.dataSet) {
                    this.renderPosts(response.data.dataSet);
                } else {
                    this.showError(t('blog_error_format'));
                }
            },
            error: (xhr, status, error) => {
                console.error('AJAX 错误:', status, error);
                this.showError(t('blog_error_fetch'));
            }
        });
    }

    /**
     * 格式化时间戳为可读日期
     * @param {number} timestamp - Unix 时间戳（秒）
     * @returns {string} 格式化的日期字符串 (YYYY-MM-DD)
     */
    formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    renderPosts(posts) {
        this.listElement.empty();

        if (!posts || posts.length === 0) {
            this.listElement.append(`
                <mdui-list-item>
                    <div class="text-center w-100">${t('blog_no_posts')}</div>
                </mdui-list-item>
            `);
            return;
        }

        const displayPosts = posts.slice(0, 10);

        displayPosts.forEach(post => {
            const formattedDate = this.formatDate(post.created);
            const postUrl = post.permalink || `https://blog.xiaofengqwq.com/p/${post.cid}`;

            const title = post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title;

            const listItem = $(`
                <mdui-list-item 
                    href="${postUrl}" 
                    target="_blank"
                    headline="${title}" 
                    description="${formattedDate}" 
                    icon="article">
                </mdui-list-item>
            `);

            this.listElement.append(listItem);
        });
    }

    showError(message) {
        this.listElement.empty();
        this.listElement.append(`
            <mdui-list-item>
                <div class="text-center w-100 text-error">
                    ${message}
                </div>
            </mdui-list-item>
        `);
    }
}

/**
 * 实验室项目加载器
 */
class LabLoader {
    constructor() {
        this.apiUrl = 'https://api.xiaofengqwq.com/api/v1/my/labs';
        this.container = $('#work');
        this.init();
    }

    init() {
        this.loadProjects();
    }

    loadProjects() {
        this.showLoading();

        $.ajax({
            url: this.apiUrl,
            method: 'GET',
            dataType: 'json',
            success: (response) => {
                if (response && response.code === 200 && response.data && Array.isArray(response.data)) {
                    this.renderProjects(response.data);
                } else {
                    this.showError(t('lab_error_format'));
                }
            },
            error: (xhr, status, error) => {
                console.error('AJAX 错误:', status, error);
                this.showError(t('lab_error_fetch'));
            }
        });
    }

    showLoading() {
        const loadingHTML = `
            <div class="bento-item item-full animate-pop">
                <h1 class="hero-name" data-i18n="lab_title">${t('lab_title')}</h1>
                <mdui-list-item>
                    <div class="text-center w-100">
                        <mdui-circular-progress></mdui-circular-progress>
                        <span data-i18n="blog_loading">${t('blog_loading')}</span>
                    </div>
                </mdui-list-item>
            </div>
        `;
        this.container.html(loadingHTML);
    }

    renderProjects(projects) {
        if (!projects || projects.length === 0) {
            this.container.html(`
            <div class="bento-item item-full animate-pop">
                <h1 class="hero-name" data-i18n="lab_title">${t('lab_title')}</h1>
                <p class="opacity-70 text-center p-40" data-i18n="lab_no_projects">${t('lab_no_projects')}</p>
            </div>
        `);
            return;
        }

        let projectsHTML = `
        <div class="bento-item item-full animate-pop">
            <h1 class="hero-name" data-i18n="lab_title">${t('lab_title')}</h1>
            <p class="opacity-70" data-i18n="lab_subtitle">${t('lab_subtitle')}</p>
        </div>
    `;

        projects.forEach(project => {
            const progress = project.progress || 0;
            const isCompleted = progress >= 100;
            const badgeKey = isCompleted ? 'lab_completed' : 'lab_developing';
            const badgeVariant = isCompleted ? 'success' : '';

            const cardClass = isCompleted ? 'item-lab-small' : 'item-lab-card';

            if (cardClass === 'item-lab-card') {
                projectsHTML += `
                <div class="bento-item ${cardClass} animate-pop">
                    <div class="lab-card-header">
                        <h3 class="m-0">${project.name}</h3>
                        <mdui-badge ${badgeVariant ? `variant="${badgeVariant}"` : ''} 
                                    data-i18n="${badgeKey}">${t(badgeKey)}</mdui-badge>
                    </div>
                    <p class="lab-card-description">${project.description}</p>
                    <div class="mt-auto">
                        <div class="lab-progress-labels">
                            <span data-i18n="lab_progress">${t('lab_progress')}</span>
                            <span>${progress}%</span>
                        </div>
                        <mdui-linear-progress value="${progress}"></mdui-linear-progress>
                    </div>
                </div>
            `;
            } else {
                projectsHTML += `
                <div class="bento-item ${cardClass} animate-pop">
                    <mdui-icon name="done" class="icon-large text-success"></mdui-icon>
                    <h4 class="lab-small-title">${project.name}</h4>
                    <p class="lab-small-description">${project.description}</p>
                    <mdui-badge variant="dot" class="mt-12"></mdui-badge>
                </div>
            `;
            }
        });

        projectsHTML += `
        <div class="bento-item item-lab-card animate-pop coop-card">
            <h3 class="m-0" data-i18n="lab_collab_title">${t('lab_collab_title')}</h3>
            <p class="opacity-80" data-i18n="lab_collab_desc">${t('lab_collab_desc')}</p>
        </div>
    `;

        this.container.html(projectsHTML);
    }

    showError(message) {
        this.container.html(`
            <div class="bento-item item-full animate-pop">
                <h1 class="hero-name" data-i18n="lab_title">${t('lab_title')}</h1>
                <p class="opacity-70 text-center p-40 text-error">${message}</p>
            </div>
        `);
    }
}

/**
 * 天气小组件
 */
class WeatherWidget {
    constructor() {
        this.weatherApiUrl = 'https://api.xiaofengqwq.com/api/v1/tools/weather';
        this.root = document.getElementById('weather-widget');

        if (!this.root) return;

        this.cityEl = document.getElementById('weather-city');
        this.tempEl = document.getElementById('weather-temp');
        this.textEl = document.getElementById('weather-text');
        this.rangeEl = document.getElementById('weather-range');
        this.humidityEl = document.getElementById('weather-humidity');
        this.windEl = document.getElementById('weather-wind');
        this.updatedEl = document.getElementById('weather-updated');
        this.statusEl = document.getElementById('weather-status');
        this.warningEl = document.getElementById('weather-warning');
        this.iconEl = document.getElementById('weather-icon');
        this.feelsLikeEl = document.getElementById('weather-feels-like');
        this.visibilityEl = document.getElementById('weather-visibility');

        this.init();
    }

    async init() {
        try {
            this.setStatus(t('weather_status_fetching'));
            const weatherData = await this.fetchWeatherData();
            this.renderWeather(weatherData);
            this.setStatus(t('weather_status_success'));
        } catch (error) {
            console.error('天气组件加载失败:', error);
            this.setStatus(error.message || t('weather_fallback'));
            this.renderFallback();
        }
    }

    async fetchWeatherData() {
        const requestUrl = `${this.weatherApiUrl}?type=now`;
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`天气 API 请求失败: ${response.status}`);
        }

        const result = await response.json();

        if (result && result.code === 200 && result.data) {
            return result.data;
        } else {
            throw new Error(result.message || '天气 API 数据格式错误');
        }
    }

    renderWeather(data) {
        const city = data.city || '--';
        const temp = data.temp || '--';
        const weatherText = data.weather || '--';

        // 使用API返回的字段
        const humidity = data.humidity || '--';
        const visibility = data.visibility || '--';
        const windDirection = data.wind_direction || '';
        const windScale = data.wind_scale || '';
        const windSpeed = data.wind_speed || '';
        const feelsLike = data.feels_like || '--';
        const obsTime = data.obs_time || '--';

        // 格式化风力显示
        let windText = '--';
        if (windDirection && windScale) {
            windText = `${windDirection} ${windScale}级`;
            if (windSpeed) {
                windText += ` (${windSpeed}m/s)`;
            }
        } else if (windDirection) {
            windText = windDirection;
        } else if (windScale) {
            windText = `${windScale}级`;
        }

        console.debug('天气数据:', data);

        // 处理温度范围（如果living数据存在）
        let highTemp = '--', lowTemp = '--';
        if (data.living && Array.isArray(data.living)) {
            const dressIndex = data.living.find(item => item.name === '穿衣指数');
            if (dressIndex && dressIndex.text) {
                const match = dressIndex.text.match(/(\d+)℃~(\d+)℃/);
                if (match) {
                    lowTemp = match[1];
                    highTemp = match[2];
                }
            }
        }

        // 填充DOM元素
        if (this.cityEl) this.cityEl.textContent = city;
        if (this.tempEl) this.tempEl.textContent = `${temp}°C`;
        if (this.textEl) this.textEl.textContent = weatherText;

        // 更新温度范围
        if (this.rangeEl) {
            const template = t('weather_high_low', { high: highTemp, low: lowTemp });
            this.rangeEl.textContent = template;
        }

        // 更新湿度
        if (this.humidityEl) {
            const template = t('weather_humidity', { humidity: `${humidity}%` });
            this.humidityEl.textContent = template;
        }

        // 更新风力
        if (this.windEl) {
            const template = t('weather_wind', { wind: windText });
            this.windEl.textContent = template;
        }

        // 更新体感温度（如果存在对应DOM元素）
        if (this.feelsLikeEl && feelsLike !== '--') {
            const template = t('weather_feels_like', { feelsLike: `${feelsLike}°C` });
            this.feelsLikeEl.textContent = template;
            this.feelsLikeEl.hidden = false;
        }

        // 更新能见度（如果存在对应DOM元素）
        if (this.visibilityEl && visibility !== '--') {
            const template = t('weather_visibility', { visibility: `${visibility}km` });
            this.visibilityEl.textContent = template;
            this.visibilityEl.hidden = false;
        }

        // 更新时间
        if (this.updatedEl) {
            const template = t('weather_updated', { time: obsTime });
            this.updatedEl.textContent = template;
        }

        // 新接口没有直接提供图标URL，可以选择隐藏图标或使用一个默认图标
        if (this.iconEl) {
            this.iconEl.hidden = true;
        }

        // 新接口没有预警信息，直接隐藏预警区域
        if (this.warningEl) {
            this.warningEl.hidden = true;
            this.warningEl.textContent = '';
        }
    }

    renderFallback() {
        if (this.cityEl) this.cityEl.textContent = '--';
        if (this.tempEl) this.tempEl.textContent = '--°C';
        if (this.textEl) this.textEl.textContent = '--';
        if (this.rangeEl) this.rangeEl.innerHTML = t('weather_high_low', { high: '--', low: '--' });
        if (this.humidityEl) this.humidityEl.innerHTML = t('weather_humidity', { humidity: '--' });
        if (this.windEl) this.windEl.innerHTML = t('weather_wind', { wind: '--' });
        if (this.feelsLikeEl) this.feelsLikeEl.innerHTML = t('weather_feels_like', { feelsLike: '--' });
        if (this.visibilityEl) this.visibilityEl.innerHTML = t('weather_visibility', { visibility: '--' });
        if (this.warningEl) {
            this.warningEl.hidden = true;
            this.warningEl.textContent = '';
        }
        if (this.iconEl) {
            this.iconEl.hidden = true;
        }
    }

    setStatus(text) {
        if (this.statusEl) {
            this.statusEl.textContent = text;
        }
    }
}

/**
 * 路由管理器
 */
class HashRouter {
    constructor(routes, defaultRoute) {
        this.routes = routes;
        this.currentRoute = null;
        this.defaultRoute = defaultRoute;
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.handleRouteChange());
        if (!window.location.hash) {
            window.location.hash = `#${this.defaultRoute}`;
        } else {
            this.handleRouteChange();
        }
    }

    handleRouteChange() {
        let hash = window.location.hash.replace('#', '');
        if (!this.routes.includes(hash)) hash = this.defaultRoute;
        if (hash === this.currentRoute) return;

        this.transitionPage(this.currentRoute, hash);
        this.updateDockState(hash);
        this.currentRoute = hash;
    }

    transitionPage(oldRoute, newRoute) {
        const newPage = document.getElementById(newRoute);
        const oldPage = oldRoute ? document.getElementById(oldRoute) : null;

        if (oldPage) {
            gsap.to(oldPage.querySelectorAll('.animate-pop'), {
                opacity: 0,
                filter: "blur(20px)",
                scale: 0.9,
                y: -20,
                duration: 0.4,
                stagger: 0.05,
                onComplete: () => {
                    oldPage.style.display = 'none';
                    this.enterPage(newPage);
                }
            });
        } else {
            this.enterPage(newPage);
        }
    }

    enterPage(pageElement) {
        pageElement.style.display = 'grid';
        // 模糊->清晰，收缩->正常的进场效果，非常有电影感
        gsap.fromTo(pageElement.querySelectorAll('.animate-pop'),
            {
                opacity: 0,
                filter: "blur(30px)",
                scale: 1.1,
                y: 30
            },
            {
                opacity: 1,
                filter: "blur(0px)",
                scale: 1,
                y: 0,
                duration: 1.2,
                stagger: 0.1,
                ease: "expo.out"
            }
        );
    }

    updateDockState(activeRoute) {
        document.querySelectorAll('#dock mdui-button-icon').forEach(btn => {
            btn.setAttribute('variant', btn.getAttribute('data-route') === activeRoute ? 'filled' : 'text');
        });
    }
}

/**
 * 交互空间应用核心类 (App)
 */
class BentoApp {
    constructor() {
        this.setupTheme();
        this.setupEntrance();

        this.visualEngine = new VisualEngine();
        this.themeManager = new ThemeManager();
        this.blogLoader = new BlogLoader();
        this.labLoader = new LabLoader();
        this.weatherWidget = new WeatherWidget();
        this.router = new HashRouter(['home', 'about', 'work', 'settings'], 'home');

        this.setupLanguageSwitcher();
    }

    setupTheme() {
        mdui.setColorScheme('#0061a4');
    }

    setupEntrance() {
        const dock = document.getElementById('dock');
        if (!dock) return;

        dock.classList.add('is-entering');

        gsap.fromTo(
            dock,
            {
                y: 100,
                opacity: 0
            },
            {
                y: 0,
                opacity: 1,
                duration: 0.32,
                ease: "power1.out",
                delay: 0.5,
                onComplete: () => {
                    // 清掉 GSAP 注入的内联样式，恢复 CSS 原生定位 transform
                    gsap.set(dock, { clearProps: 'opacity,transform' });
                    dock.classList.remove('is-entering');
                    this.setupDockAutoHide();
                }
            }
        );
    }

    setupDockAutoHide() {
        const dock = document.getElementById('dock');
        if (!dock) return;

        let lastScrollY = window.scrollY;
        let isTicking = false;
        const deltaThreshold = 10;

        const updateDockVisibility = () => {
            const currentScrollY = window.scrollY;
            const delta = currentScrollY - lastScrollY;

            if (currentScrollY <= 8) {
                dock.classList.remove('is-hidden');
                lastScrollY = currentScrollY;
                isTicking = false;
                return;
            }

            if (Math.abs(delta) >= deltaThreshold) {
                if (delta > 0) {
                    dock.classList.add('is-hidden');
                } else {
                    dock.classList.remove('is-hidden');
                }
                lastScrollY = currentScrollY;
            }

            isTicking = false;
        };

        window.addEventListener('scroll', () => {
            if (isTicking) return;
            isTicking = true;
            window.requestAnimationFrame(updateDockVisibility);
        }, { passive: true });
    }

    setupLanguageSwitcher() {
        const menuItems = document.querySelectorAll('mdui-menu-item[data-lang]');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const lang = e.target.getAttribute('data-lang');
                setLanguage(lang, () => {
                    if (this.weatherWidget) {
                        this.weatherWidget.init();
                    }
                });
            });
        });
    }
}

// 等待 DOM 加载并初始化 i18n，然后启动应用
window.addEventListener('DOMContentLoaded', async () => {
    try {
        await initI18n('./src/lang.json');
    } catch (e) {
        console.error('Failed to load language file:', e);
    }
    new BentoApp();
});