// Твои данные: username и repo (без .github.io)
const githubUsername = 'YOUR_USERNAME';
const githubRepo = 'YOUR_REPO';
const imagesFolder = 'images'; // Папка с изображениями

// Поддерживаемые расширения
const supportedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

// API URL для получения содержимого папки
const apiUrl = `https://api.github.com/repos/alexander-topilskii/Instructions/contents/imgs`;

// Массив для изображений (будет заполнен динамически)
let images = [];
let currentIndex = 0;
const imageElement = document.getElementById('current-image');
const counterElement = document.getElementById('page-counter');

// Функция обновления изображения
function updateImage() {
    if (images.length > 0) {
        imageElement.src = images[currentIndex];
        counterElement.textContent = `Page ${currentIndex + 1}/${images.length}`;
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
        updateImage();
    })
    .catch(error => {
        console.error('Error fetching images:', error);
        counterElement.textContent = 'Error loading images';
    });