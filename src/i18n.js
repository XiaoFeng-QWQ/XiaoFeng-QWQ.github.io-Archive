let currentLang = localStorage.getItem('mc_decryptor_lang') || 'zh';
let translations = {};

/**
 * 翻译函数
 * @param {string} key 翻译键
 * @param {object} params 插值参数 { key: value }
 * @returns {string}
 */
export function t(key, params = {}) {
    let text = translations[currentLang]?.[key] || translations['zh']?.[key] || key;
    for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
}

/**
 * 切换语言
 * @param {string} lang 语言代码（如 'zh', 'en'）
 * @param {Function} [onUpdate] 更新后的回调
 */
export function setLanguage(lang, onUpdate) {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem('mc_decryptor_lang', lang);
    _updateDOM();
    document.documentElement.lang = lang === 'zh' ? 'zh-cn' : 'en';
    if (onUpdate) onUpdate();
}

/**
 * 初始化 i18n：加载语言文件并更新界面
 * @param {string} url 语言文件 URL（JSON 格式）
 * @returns {Promise<object>} 加载的语言数据
 */
export async function initI18n(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load language file: ${response.status}`);
    translations = await response.json();
    _updateDOM();
    document.documentElement.lang = currentLang === 'zh' ? 'zh-cn' : 'en';
    return translations;
}

/** 更新所有带有 data-i18n 属性的元素 */
function _updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (!key) return;
        const translation = t(key);
        if (el.tagName === 'TITLE') {
            document.title = translation;
        } else {
            el.innerHTML = translation; // 支持 HTML 标签
        }
    });
}