// Твои данные: username и repo (без .github.io)
const githubUsername = 'alexander-topilskii';
const githubRepo = 'Instructions';
const imagesFolder = 'imgs'; // Папка с изображениями
const contentFolder = 'rules'; // Новая папка с HTML

// Параметры эффекта ряби
const rippleDuration = 160; // Длительность эффекта в миллисекундах
const rippleMinDelay = 4000; // Минимальная задержка между срабатываниями
const rippleMaxDelay = 8000; // Максимальная задержка между срабатываниями
const rippleYMin = 8; // Минимальное значение Y для разрыва
const rippleYMax = 92; // Максимальное значение Y для разрыва
const rippleBaseXMin = 0.0005; // Минимальная базовая частота по X
const rippleBaseXMax = 0.1020; // Максимальная базовая частота по X
const rippleBaseYMin = 0.85; // Минимальная базовая частота по Y
const rippleBaseYMax = 1.85; // Максимальная базовая частота по Y
const rippleScaleMin = 8; // Минимальный масштаб искажения
const rippleScaleMax = 18; // Максимальный масштаб искажения

// Поддерживаемые расширения для изображений
const supportedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

// API URL для изображений (исправлено с /contents/)
const imagesApiUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${imagesFolder}`;

// API URL для контента
const contentApiUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${contentFolder}`;

// Массив для изображений и карта для HTML
let images = [];
let imageFiles = []; // Для хранения num
let htmlMap = new Map();
// Получаем параметры из URL
const urlParams = new URLSearchParams(window.location.search);
let pageParam = parseInt(urlParams.get('page'), 10);
let currentIndex = isNaN(pageParam) ? 0 : Math.max(pageParam - 1, 0);
const imageElement = document.getElementById('current-image');
const counterElement = document.getElementById('page-counter');
const loadingElement = document.getElementById('loading');
const contentElement = document.querySelector('.content');
const distortionElement = document.querySelector('.distortion');

// Массив месяцев на русском
const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

let fromDateStr = urlParams.get('from') || 'Засекречено'; // Дефолт
let toDateStr = urlParams.get('to') || 'Засекречено'; // Дефолт
let userName = urlParams.get('name') || 'гражданин'; // Новый параметр name, дефолт 'гражданин'

// Парсим даты
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('.').map(Number);
    return { day: day.toString().padStart(2, '0'), month: months[month - 1], year };
}

// Форматируем строки для плейсхолдеров
const startDate = parseDate(fromDateStr);
const endDate = parseDate(toDateStr);
const startFull = `${startDate.day} ${startDate.month} ${startDate.year}`;
const endFull = `${endDate.day} ${endDate.month} ${endDate.year}`;
const startShort = `${startDate.day} ${startDate.month}`;
const endShort = `${endDate.day} ${endDate.month}`;

// Функция замены плейсхолдеров
function replacePlaceholders(html) {
    return html
        .replace(/{user-name}/g, userName)
        .replace(/{start-full}/g, startFull)
        .replace(/{end-full}/g, endFull)
        .replace(/{start-short}/g, startShort)
        .replace(/{end-short}/g, endShort);
}

// Обновляет параметр страницы в URL без перезагрузки
function updateUrl() {
    const params = new URLSearchParams(window.location.search);
    params.set('page', currentIndex + 1);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
}

// Функция обновления изображения и контента
function updateImage() {
    if (images.length > 0) {
        currentIndex = Math.min(Math.max(currentIndex, 0), images.length - 1);
        imageElement.src = images[currentIndex];
        imageElement.style.display = 'block'; // Показываем изображение
        counterElement.textContent = `Страница ${currentIndex + 1}/${images.length}`;

        const num = imageFiles[currentIndex].num;
        let html = htmlMap.get(num) || '';
        html = replacePlaceholders(html);
        contentElement.innerHTML = html;
        contentElement.style.display = html ? 'block' : 'none';
        updateUrl();
    } else {
        counterElement.textContent = 'No images found';
    }
}

// Навигация
function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
}

function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
}

// Искажение эффект
distortionElement.addEventListener('animationend', () => {
    distortionElement.classList.remove('active');
});

function triggerDistortion() {
    distortionElement.classList.add('active');
    const delay = Math.floor(Math.random() * 2000) + 5000; // 5-7 сек
    setTimeout(triggerDistortion, delay);
}

// Загрузка изображений
fetch(imagesApiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('API request failed for images');
        }
        return response.json();
    })
    .then(data => {
        imageFiles = data
            .filter(item => {
                if (item.type === 'file' && item.name.includes('.')) {
                    const [name, ext] = item.name.split('.');
                    return /^\d+$/.test(name) && supportedExtensions.includes(ext.toLowerCase());
                }
                return false;
            })
            .map(item => ({
                num: parseInt(item.name.split('.')[0], 10),
                url: item.download_url
            }))
            .sort((a, b) => a.num - b.num); // Сортировка по номеру

        images = imageFiles.map(item => item.url);

        // Теперь загружаем контент
        return fetch(contentApiUrl);
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('API request failed for content');
        }
        return response.json();
    })
    .then(contentData => {
        const htmlFiles = contentData
            .filter(item => item.type === 'file' && item.name.endsWith('.html') && /^\d+\.html$/.test(item.name))
            .map(item => ({
                num: parseInt(item.name.split('.')[0], 10),
                url: item.download_url
            }));

        // Загружаем текст всех HTML
        return Promise.all(htmlFiles.map(file => 
            fetch(file.url)
                .then(res => res.text())
                .then(text => ({ num: file.num, html: text }))
        ));
    })
    .then(htmlArray => {
        htmlArray.forEach(h => htmlMap.set(h.num, h.html));

        // Инициализация после загрузки
        if (images.length > 0) {
            loadingElement.style.display = 'none'; // Скрываем loading
            updateImage();
            triggerDistortion(); // Запускаем искажение
        } else {
            loadingElement.textContent = 'No images found';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        loadingElement.textContent = 'Error loading images or content';
        counterElement.textContent = 'Error';
    });

// Эффект ряби с использованием шумового фильтра
(function () {
    const page = document.body;
  const tear = document.getElementById('tear');
  const noise = document.getElementById('noise');
  const disp = document.getElementById('disp');
  function random(min, max) { return Math.random() * (max - min) + min; }

  function triggerRipple() {
      const y = Math.round(random(rippleYMin, rippleYMax));
      tear.style.setProperty('--tearY', y + '%');

      const baseX = random(rippleBaseXMin, rippleBaseXMax).toFixed(4);
      const baseY = random(rippleBaseYMin, rippleBaseYMax).toFixed(2);
      noise.setAttribute('baseFrequency', `${baseX} ${baseY}`);

      const scale = Math.round(random(rippleScaleMin, rippleScaleMax));
      disp.setAttribute('scale', String(scale));

      page.classList.add('ripple');
      setTimeout(() => page.classList.remove('ripple'), rippleDuration);

      scheduleNext();
  }

  function scheduleNext() {
      const t = Math.round(random(rippleMinDelay, rippleMaxDelay));
      setTimeout(triggerRipple, t);
  }

  scheduleNext();
})();
