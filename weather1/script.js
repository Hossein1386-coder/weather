const weatherData = {};

let currentCity = null;
let isNight = false;

// Set your OpenWeatherMap API key here or via localStorage.setItem('OWM_API_KEY', '...') in console
const API_KEY = 'f065c77f4e37b67741d6427f54abf8ac';
const API_BASE = 'https://api.openweathermap.org/data/2.5';
const API_GEO = 'https://api.openweathermap.org/geo/1.0';
const isMobile = window.matchMedia('(max-width: 640px)').matches;

function scaleCount(base) {
    return Math.max(1, Math.floor(isMobile ? base * 0.35 : base));
}

function getStatusEl() {
    return document.getElementById('statusMessage');
}

function setStatus(message, type = 'info') {
    const el = getStatusEl();
    if (!el) return;
    el.textContent = message || '';
    el.className = `status-message ${type}`;
}

function clearStatus() {
    setStatus('', '');
}

const icons = {
    sun: '<svg class="icon-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>',
    cloud: '<svg class="icon-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>',
    rain: '<svg class="icon-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 19v2m5-2v2m5-2v2"></path></svg>',
    snow: '<svg class="icon-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path><circle cx="8" cy="20" r="1" fill="currentColor"/><circle cx="12" cy="21" r="1" fill="currentColor"/><circle cx="16" cy="20" r="1" fill="currentColor"/></svg>',
    sunSmall: '<svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>',
    cloudSmall: '<svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>',
    rainSmall: '<svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 19v2m5-2v2m5-2v2"></path></svg>',
    snowSmall: '<svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path><circle cx="8" cy="20" r="1" fill="currentColor"/><circle cx="12" cy="21" r="1" fill="currentColor"/><circle cx="16" cy="20" r="1" fill="currentColor"/></svg>',
};

const conditionTexts = {
    sunny: 'آفتابی',
    rainy: 'بارانی',
    snowy: 'برفی',
    cloudy: 'ابری',
};

function init() {
    renderCityButtons();
    if (currentCity && weatherData[currentCity]) {
        updateWeather();
    } else {
        setStatus('نام شهر را جستجو کنید.', 'info');
    }
    setupEventListeners();
}

function renderCityButtons() {
    const container = document.getElementById('cityButtons');
    const cities = Object.keys(weatherData);
    container.innerHTML = cities.map(city => 
        `<button class="city-button ${city === currentCity ? 'active' : ''}" data-city="${city}">${city}</button>`
    ).join('');
}

function updateWeather() {
    if (!currentCity || !weatherData[currentCity]) return;
    const data = weatherData[currentCity];
    
    document.getElementById('cityName').textContent = data.city;
    document.getElementById('temperature').textContent = data.temperature;
    document.getElementById('condition').textContent = conditionTexts[data.condition];
    document.getElementById('high').textContent = data.high + '°';
    document.getElementById('low').textContent = data.low + '°';
    document.getElementById('humidity').textContent = data.humidity + '%';
    document.getElementById('windSpeed').textContent = data.windSpeed + ' km/h';
    document.getElementById('visibility').textContent = data.visibility + ' km';
    
    const iconMap = {
        sunny: icons.sun,
        rainy: icons.rain,
        snowy: icons.snow,
        cloudy: icons.cloud,
    };
    document.getElementById('weatherIcon').innerHTML = iconMap[data.condition];
    
    renderForecast(data.forecast);
    updateBackground(data.condition);
    updateParticles(data.condition);
}

function renderForecast(forecast) {
    const container = document.getElementById('forecastGrid');
    const iconMap = {
        sunny: icons.sunSmall,
        rainy: icons.rainSmall,
        snowy: icons.snowSmall,
        cloudy: icons.cloudSmall,
    };
    
    container.innerHTML = forecast.map(day => `
        <div class="forecast-card">
            <div class="forecast-day">${day.day}</div>
            <div class="forecast-icon">${iconMap[day.condition]}</div>
            <div class="forecast-temp">
                <span class="forecast-high">${day.high}°</span>
                <span class="forecast-low">${day.low}°</span>
            </div>
        </div>
    `).join('');
}

function updateBackground(condition) {
    const bgGradient = document.getElementById('bgGradient');
    bgGradient.className = 'background-gradient';
    
    if (isNight) {
        bgGradient.classList.add(`bg-night-${condition}`);
    } else {
        bgGradient.classList.add(`bg-${condition}`);
    }
}

function updateParticles(condition) {
    const container = document.getElementById('particlesContainer');
    container.innerHTML = '';
    
    if (condition === 'sunny') {
        if (isNight) {
            createMoon(container);
        } else {
            createSun(container);
        }
    } else if (condition === 'rainy') {
        createRain(container);
    } else if (condition === 'snowy') {
        createSnow(container);
    } else if (condition === 'cloudy') {
        createClouds(container);
    }
}

function createSun(container) {
    const sun = document.createElement('div');
    sun.className = 'sun';
    const sunCore = document.createElement('div');
    sunCore.className = 'sun-core';
    sun.appendChild(sunCore);
    container.appendChild(sun);
    
    for (let i = 0; i < scaleCount(16); i++) {
        const ray = document.createElement('div');
        ray.className = 'sun-ray';
        ray.style.transform = `rotate(${i * (360 / 16)}deg)`;
        ray.style.left = '80px';
        ray.style.top = '80px';
        ray.style.animationDelay = `${i * 0.15}s`;
        container.appendChild(ray);
    }
    
    for (let i = 0; i < scaleCount(8); i++) {
        const godRay = document.createElement('div');
        godRay.className = 'god-ray';
        godRay.style.transform = `rotate(${i * 45 + 22.5}deg)`;
        godRay.style.left = '80px';
        godRay.style.top = '80px';
        godRay.style.animationDelay = `${i * 0.4}s`;
        container.appendChild(godRay);
    }
    
    for (let i = 0; i < scaleCount(30); i++) {
        const particle = document.createElement('div');
        particle.className = 'light-particle';
        particle.style.width = `${2 + Math.random() * 4}px`;
        particle.style.height = particle.style.width;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 3}s`;
        particle.style.animationDuration = `${3 + Math.random() * 3}s`;
        container.appendChild(particle);
    }
}

function createMoon(container) {
    const moon = document.createElement('div');
    moon.className = 'moon';
    container.appendChild(moon);
    
    for (let i = 0; i < scaleCount(50); i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 70}%`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        star.style.animationDuration = `${2 + Math.random() * 3}s`;
        container.appendChild(star);
    }
}

function createRain(container) {
    for (let i = 0; i < scaleCount(150); i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        const size = 1 + Math.random() * 2;
        drop.style.width = `${size}px`;
        drop.style.height = `${25 + size * 5}px`;
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDuration = `${0.4 + Math.random() * 0.3}s`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(drop);
    }
    
    for (let i = 0; i < scaleCount(60); i++) {
        const streak = document.createElement('div');
        streak.className = 'rain-streak';
        streak.style.height = `${40 + Math.random() * 30}px`;
        streak.style.left = `${Math.random() * 100}%`;
        streak.style.animationDuration = `${0.3 + Math.random() * 0.2}s`;
        streak.style.animationDelay = `${Math.random() * 1.5}s`;
        container.appendChild(streak);
    }
    
    const lightning = document.createElement('div');
    lightning.className = 'lightning';
    container.appendChild(lightning);
    
    for (let i = 0; i < scaleCount(40); i++) {
        const splash = document.createElement('div');
        splash.className = 'rain-splash';
        splash.style.left = `${Math.random() * 100}%`;
        splash.style.animationDelay = `${Math.random() * 1.5}s`;
        container.appendChild(splash);
    }
    
    for (let i = 0; i < scaleCount(20); i++) {
        const ripple = document.createElement('div');
        ripple.className = 'rain-ripple';
        ripple.style.left = `${Math.random() * 100}%`;
        ripple.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(ripple);
    }
}

function createSnow(container) {
    for (let i = 0; i < scaleCount(80); i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        const size = 2 + Math.random() * 3;
        flake.style.width = `${size}px`;
        flake.style.height = `${size}px`;
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.boxShadow = `0 0 ${size * 2}px rgba(255,255,255,0.8)`;
        flake.style.animationDuration = `${2.5 + Math.random() * 1.5}s`;
        flake.style.animationDelay = `${Math.random() * 4}s`;
        container.appendChild(flake);
    }
    
    for (let i = 0; i < scaleCount(25); i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake-detailed';
        flake.innerHTML = '❄';
        const size = 4 + Math.random() * 6;
        flake.style.fontSize = `${size}px`;
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.animationDuration = `${6 + Math.random() * 4}s`;
        flake.style.animationDelay = `${Math.random() * 4}s`;
        container.appendChild(flake);
    }
    
    for (let i = 0; i < scaleCount(40); i++) {
        const flake = document.createElement('div');
        flake.className = 'snow-blur';
        const size = 6 + Math.random() * 8;
        flake.style.width = `${size}px`;
        flake.style.height = `${size}px`;
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.animationDuration = `${8 + Math.random() * 4}s`;
        flake.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(flake);
    }
}

function createClouds(container) {
    for (let i = 0; i < scaleCount(3); i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.style.top = `${10 + i * 20}%`;
        cloud.style.animationDuration = `${40 + Math.random() * 20}s`;
        cloud.style.animationDelay = `${i * 5}s`;
        
        for (let j = 0; j < 4; j++) {
            const part = document.createElement('div');
            part.className = 'cloud-part';
            const size = 60 + Math.random() * 40;
            part.style.width = `${size}px`;
            part.style.height = `${size}px`;
            part.style.left = `${j * 30}px`;
            part.style.top = `${Math.random() * 20}px`;
            cloud.appendChild(part);
        }
        
        container.appendChild(cloud);
    }
    
    for (let i = 0; i < scaleCount(4); i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.style.top = `${20 + i * 18}%`;
        cloud.style.animationDuration = `${30 + Math.random() * 15}s`;
        cloud.style.animationDelay = `${i * 3}s`;
        
        for (let j = 0; j < 3; j++) {
            const part = document.createElement('div');
            part.className = 'cloud-part';
            const size = 40 + Math.random() * 30;
            part.style.width = `${size}px`;
            part.style.height = `${size}px`;
            part.style.left = `${j * 25}px`;
            part.style.top = `${Math.random() * 15}px`;
            cloud.appendChild(part);
        }
        
        container.appendChild(cloud);
    }
    
    for (let i = 0; i < scaleCount(6); i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.style.top = `${5 + Math.random() * 70}%`;
        cloud.style.opacity = '0.5';
        cloud.style.animationDuration = `${15 + Math.random() * 10}s`;
        cloud.style.animationDelay = `${i * 2}s`;
        
        const part = document.createElement('div');
        part.className = 'cloud-part';
        const size = 60 + Math.random() * 80;
        part.style.width = `${size}px`;
        part.style.height = `${size * 0.5}px`;
        cloud.appendChild(part);
        
        container.appendChild(cloud);
    }
}

function setupEventListeners() {
    document.getElementById('searchForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const queryRaw = document.getElementById('searchInput').value.trim();
        if (!queryRaw) return;
        setStatus('در حال دریافت اطلاعات...', 'loading');
        await performSearch(queryRaw);
        document.getElementById('searchInput').value = '';
    });
    
    document.getElementById('cityButtons').addEventListener('click', (e) => {
        if (e.target.classList.contains('city-button')) {
            currentCity = e.target.dataset.city;
            renderCityButtons();
            updateWeather();
        }
    });
    
    document.getElementById('toggleNight').addEventListener('click', () => {
        isNight = !isNight;
        
        const icon = isNight 
            ? '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>'
            : '<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>';
        
        document.getElementById('nightIcon').innerHTML = icon;
        const btn = document.getElementById('toggleNight');
        if (btn) btn.setAttribute('aria-pressed', String(isNight));
        updateWeather();
    });
}

init();

async function performSearch(cityQuery) {
    const city = cityQuery;
    if (!API_KEY) {
        // Fallback to mock data if API key not set
        const foundCity = Object.keys(weatherData).find(c => city.includes(c));
        if (foundCity) {
            currentCity = foundCity;
            renderCityButtons();
            updateWeather();
            clearStatus();
        } else {
            setStatus('شهر پیدا نشد. کلید API تنظیم نشده است.', 'error');
        }
        return;
    }

    try {
        // Use geocoding for robust search (supports Persian/English names)
        const geo = await fetchJson(`${API_GEO}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`);
        if (!Array.isArray(geo) || geo.length === 0) {
            setStatus('شهر پیدا نشد.', 'error');
            return;
        }
        const { lat, lon, local_names, name, country } = geo[0];
        const displayName = (local_names && (local_names.fa || local_names.ar)) || name || city;

        const current = await fetchJson(`${API_BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fa`);
        const forecast = await fetchJson(`${API_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fa`);
        const mapped = mapApiToData({ ...current, name: `${displayName}${country ? ' - ' + country : ''}` }, forecast);
        currentCity = mapped.city;
        weatherData[currentCity] = mapped;
        renderCityButtons();
        updateWeather();
        clearStatus();
    } catch (err) {
        console.error(err);
        if (err && err.status === 401) {
            setStatus('کلید API نامعتبر است یا دسترسی ندارید (401).', 'error');
        } else if (err && err.status === 429) {
            setStatus('محدودیت تعداد درخواست‌ها (429). کمی بعد دوباره تلاش کنید.', 'error');
        } else if (String(err).includes('Failed to fetch')) {
            setStatus('عدم دسترسی به سرور. اتصال اینترنت یا VPN را بررسی کنید.', 'error');
        } else {
            setStatus('بازیابی اطلاعات با خطا مواجه شد یا شهر پیدا نشد.', 'error');
        }
    }
}

async function fetchJson(url) {
    const res = await fetch(url);
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch (_) { data = text; }
    if (!res.ok) {
        const message = typeof data === 'object' && data && data.message ? data.message : (text || 'Network error');
        const err = new Error(message);
        err.status = res.status;
        throw err;
    }
    return data;
}

function mapApiToData(current, forecast) {
    const cityName = current.name || 'شهر';
    const condition = mapWeatherToCondition(current.weather && current.weather[0] && current.weather[0].main);
    const high = Math.round(current.main.temp_max);
    const low = Math.round(current.main.temp_min);
    const humidity = Math.round(current.main.humidity);
    const windSpeed = Math.round(current.wind.speed * 3.6); // m/s to km/h
    const visibility = current.visibility ? Math.round(current.visibility / 1000) : 10;

    const daily = buildDailyForecast(forecast);

    return {
        city: cityName,
        temperature: Math.round(current.main.temp),
        condition,
        humidity,
        windSpeed,
        visibility,
        high,
        low,
        forecast: daily,
    };
}

function mapWeatherToCondition(main) {
    const m = (main || '').toLowerCase();
    if (m.includes('rain') || m.includes('drizzle') || m.includes('thunder')) return 'rainy';
    if (m.includes('snow')) return 'snowy';
    if (m.includes('cloud')) return 'cloudy';
    return 'sunny';
}

function buildDailyForecast(forecast) {
    if (!forecast || !forecast.list) return [];
    const byDay = new Map();
    forecast.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toLocaleDateString('fa-IR', { weekday: 'long' });
        const temp = item.main.temp;
        const cond = mapWeatherToCondition(item.weather && item.weather[0] && item.weather[0].main);
        if (!byDay.has(dayKey)) {
            byDay.set(dayKey, { highs: [], lows: [], conds: [] });
        }
        const entry = byDay.get(dayKey);
        entry.highs.push(temp);
        entry.lows.push(temp);
        entry.conds.push(cond);
    });

    const days = Array.from(byDay.entries()).slice(0, 5).map(([day, data]) => {
        const high = Math.round(Math.max(...data.highs));
        const low = Math.round(Math.min(...data.lows));
        const cond = mostCommon(data.conds) || 'sunny';
        return { day, condition: cond, high, low };
    });
    return days;
}

function mostCommon(arr) {
    const freq = {};
    for (const v of arr) freq[v] = (freq[v] || 0) + 1;
    return Object.entries(freq).sort((a,b) => b[1]-a[1])[0]?.[0];
}