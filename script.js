// Твои данные: username и repo (без .github.io)
const githubUsername = 'alexander-topilskii';
const githubRepo = 'Instructions';
const imagesFolder = 'imgs'; // Папка с изображениями

// Поддерживаемые расширения
const supportedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

// API URL для получения содержимого папки
const apiUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/${imagesFolder}`;

// Массив для изображений (будет заполнен динамически)
let images = [];
let currentIndex = 0;
const imageElement = document.getElementById('current-image');
const counterElement = document.getElementById('page-counter');
const loadingElement = document.getElementById('loading');
const infoElement = document.querySelector('.info');

// Массив месяцев на русском
const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

// Получаем параметры из URL
const urlParams = new URLSearchParams(window.location.search);
let fromDateStr = urlParams.get('from') || '28.07.2025'; // Дефолт
let toDateStr = urlParams.get('to') || '30.07.2025'; // Дефолт
let userName = urlParams.get('name') || 'гражданин'; // Новый параметр name, дефолт 'гражданин'

// Устанавливаем имя
document.getElementById('user-name').textContent = userName;

// Парсим даты
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('.').map(Number);
    return { day: day.toString().padStart(2, '0'), month: months[month - 1], year };
}

// Форматируем
const startDate = parseDate(fromDateStr);
const endDate = parseDate(toDateStr);

// Устанавливаем текст в DOM
document.getElementById('start-full').textContent = `${startDate.day} ${startDate.month} ${startDate.year} года, 08:00`;
document.getElementById('end-full').textContent = `${endDate.day} ${endDate.month} ${endDate.year} года, 20:00`;
document.getElementById('start-short').textContent = `${startDate.day} ${startDate.month}`;
document.getElementById('end-short').textContent = `${endDate.day} ${endDate.month}`;

// Функция обновления изображения
function updateImage() {
    if (images.length > 0) {
        imageElement.src = images[currentIndex];
        imageElement.style.display = 'block'; // Показываем изображение
        counterElement.textContent = `Page ${currentIndex + 1}/${images.length}`;
        infoElement.style.display = (currentIndex === 0) ? 'block' : 'none'; // Текст только на первой странице
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

// Загрузка списка изображений через GitHub API
fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('API request failed');
        }
        return response.json();
    })
    .then(data => {
        // Фильтруем файлы: только изображения с именем как число.расширение
        const imageFiles = data
            .filter(item => {
                if (item.type === 'file' && item.name.includes('.')) {
                    const [name, ext] = item.name.split('.');
                    return /^\d+$/.test(name) && supportedExtensions.includes(ext.toLowerCase());
                }
                return false;
            })
            .map(item => ({
                num: parseInt(item.name.split('.')[0], 10),
                url: item.download_url // Прямая ссылка на файл
            }))
            .sort((a, b) => a.num - b.num); // Сортировка по номеру

        images = imageFiles.map(item => item.url);

        // Инициализация после загрузки
        if (images.length > 0) {
            loadingElement.style.display = 'none'; // Скрываем loading
            updateImage();
        } else {
            loadingElement.textContent = 'No images found';
        }
    })
    .catch(error => {
        console.error('Error fetching images:', error);
        loadingElement.textContent = 'Error loading images';
        counterElement.textContent = 'Error';
    });