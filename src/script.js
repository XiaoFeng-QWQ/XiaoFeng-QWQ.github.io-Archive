/**
 * 主题管理器
 */
import { initI18n, t, setLanguage } from './i18n.js';

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
        this.ipApiUrl = 'https://api.pearktrue.cn/api/ip/high';
        this.weatherApiUrl = 'https://api.lolimi.cn/API/weather/api';
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

        this.init();
    }

    async init() {
        try {
            this.setStatus(t('weather_status_ip'));
            const ipData = await this.fetchIpData();
            const city = ipData?.data?.city;

            if (!city) {
                throw new Error('未获取到城市信息');
            }

            const weatherData = await this.fetchWeatherByCity(city);
            this.renderWeather(ipData, weatherData);
            this.setStatus(`${ipData?.data?.detail || city}`);
        } catch (error) {
            console.error('天气组件加载失败:', error);
            this.setStatus(t('weather_fallback'));
            this.renderFallback();
        }
    }

    async fetchIpData() {
        const response = await fetch(this.ipApiUrl, {
            method: 'GET',
            headers: {
                Accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`IP API 请求失败: ${response.status}`);
        }

        const data = await response.json();
        if (!data || data.code !== 200 || !data.data) {
            throw new Error('IP API 数据格式错误');
        }

        return data;
    }

    async fetchWeatherByCity(rawCity) {
        const cityCandidates = this.getCityCandidates(rawCity);
        let lastError = null;

        for (const city of cityCandidates) {
            try {
                const requestUrl = `${this.weatherApiUrl}?city=${encodeURIComponent(city)}`;
                const response = await fetch(requestUrl, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`天气 API 请求失败: ${response.status}`);
                }

                const result = await response.json();
                if (result && result.code === 1 && result.data) {
                    return result.data;
                }

                throw new Error(result?.text || '天气 API 数据格式错误');
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError || new Error('天气 API 请求失败');
    }

    getCityCandidates(city) {
        const trimmed = String(city || '').trim();
        const noSuffix = trimmed.replace(/市$/, '');
        return [...new Set([trimmed, noSuffix].filter(Boolean))];
    }

    renderWeather(ipData, weatherData) {
        const current = weatherData?.current || {};
        const cityText = weatherData?.city || current?.city || ipData?.data?.city || '--';
        const weatherText = current?.weather || weatherData?.weather || '--';
        const tempText = current?.temp ? `${current.temp}°C` : '--°C';
        const highText = weatherData?.temp || '--';
        const lowText = weatherData?.tempn || '--';
        const humidityText = current?.humidity || '--';
        const windText = `${current?.wind || weatherData?.wind || '--'} ${current?.windSpeed || weatherData?.windSpeed || ''}`.trim();
        const updateTime = current?.time || weatherData?.time || '--';
        const warningText = weatherData?.warning?.warning || '';
        const iconUrl = current?.image || '';

        if (this.cityEl) this.cityEl.textContent = cityText;
        if (this.tempEl) this.tempEl.textContent = tempText;
        if (this.textEl) this.textEl.textContent = weatherText;
        if (this.rangeEl) this.rangeEl.innerHTML = t('weather_high_low', { high: highText, low: lowText });
        if (this.humidityEl) this.humidityEl.innerHTML = t('weather_humidity', { humidity: humidityText });
        if (this.windEl) this.windEl.innerHTML = t('weather_wind', { wind: windText });
        if (this.updatedEl) this.updatedEl.textContent = t('weather_updated', { time: updateTime });

        if (this.iconEl) {
            if (iconUrl) {
                this.iconEl.src = iconUrl;
                this.iconEl.hidden = false;
            } else {
                this.iconEl.hidden = true;
            }
        }

        if (this.warningEl) {
            if (warningText) {
                this.warningEl.innerHTML = t('weather_warning', { warning: warningText });
                this.warningEl.hidden = false;
            } else {
                this.warningEl.hidden = true;
                this.warningEl.textContent = '';
            }
        }
    }

    renderFallback() {
        if (this.cityEl) this.cityEl.textContent = '--';
        if (this.tempEl) this.tempEl.textContent = '--°C';
        if (this.textEl) this.textEl.textContent = '--';
        if (this.rangeEl) this.rangeEl.innerHTML = t('weather_high_low', { high: '--', low: '--' });
        if (this.humidityEl) this.humidityEl.innerHTML = t('weather_humidity', { humidity: '--' });
        if (this.windEl) this.windEl.innerHTML = t('weather_wind', { wind: '--' });
        if (this.updatedEl) this.updatedEl.textContent = t('weather_updated', { time: '--' });
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
        this.isAnimating = false;

        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.handleRouteChange());

        // 页面加载时初始化路由
        if (!window.location.hash) {
            window.location.hash = `#${this.defaultRoute}`;
        } else {
            this.handleRouteChange();
        }
    }

    handleRouteChange() {
        let hash = window.location.hash.replace('#', '');

        // 如果输入的路由不存在，则回退到默认路由
        if (!this.routes.includes(hash)) {
            hash = this.defaultRoute;
            window.location.hash = `#${hash}`;
            return;
        }

        if (hash === this.currentRoute) return;

        this.transitionPage(this.currentRoute, hash);
        this.updateDockState(hash);
        this.currentRoute = hash;
    }

    transitionPage(oldRoute, newRoute) {
        const newPage = document.getElementById(newRoute);
        const oldPage = oldRoute ? document.getElementById(oldRoute) : null;

        this.isAnimating = true;

        if (oldPage) {
            // 离场动画
            gsap.to(oldPage.querySelectorAll('.animate-pop'), {
                scale: 0.9,
                opacity: 0,
                duration: 0.3,
                stagger: 0.05,
                ease: "power2.in",
                onComplete: () => {
                    oldPage.style.display = 'none';
                    this.enterPage(newPage);
                }
            });
        } else {
            // 初次加载，直接入场
            this.enterPage(newPage);
        }
    }

    enterPage(pageElement) {
        pageElement.style.display = 'grid';

        // 还原动画初始状态然后入场
        gsap.fromTo(pageElement.querySelectorAll('.animate-pop'),
            { scale: 0.8, opacity: 0 },
            {
                scale: 1,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: "elastic.out(1, 0.8)",
                onComplete: () => {
                    this.isAnimating = false;
                }
            }
        );
    }

    updateDockState(activeRoute) {
        const dockButtons = document.querySelectorAll('#dock mdui-button-icon');
        dockButtons.forEach(btn => {
            if (btn.getAttribute('data-route') === activeRoute) {
                btn.setAttribute('variant', 'filled');
            } else {
                btn.setAttribute('variant', 'text');
            }
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