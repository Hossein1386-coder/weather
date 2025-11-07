    /*
      Anime Weather — HTML/CSS/JS
      Usage:
      1) Replace API_KEY with your OpenWeatherMap API key below.
      2) Open this file in a browser (Chrome/Edge/Firefox). If using location, allow geolocation.
      3) This example uses the Current Weather and One Call 3.0 APIs (free tier available).
    */

      const API_KEY = 'f065c77f4e37b67741d6427f54abf8ac'; // <- place your OpenWeather API key here
      let units = 'metric'; // 'metric' or 'imperial'
  
      const el = {
        place: document.getElementById('place'),
        country: document.getElementById('country'),
        temp: document.getElementById('temp'),
        desc: document.getElementById('desc'),
        unit: document.getElementById('unit'),
        cityInput: document.getElementById('cityInput'),
        searchBtn: document.getElementById('searchBtn'),
        toggleUnit: document.getElementById('toggleUnit'),
        locBtn: document.getElementById('locBtn'),
        themeBtn: document.getElementById('themeBtn'),
        iconSVG: document.getElementById('iconSVG'),
        metricTemp: document.getElementById('metricTemp'),
        feels: document.getElementById('feels'),
        humidity: document.getElementById('humidity'),
        wind: document.getElementById('wind'),
        pressure: document.getElementById('pressure'),
        forecast: document.getElementById('forecast'),
        moodTitle: document.getElementById('moodTitle'),
        moodBody: document.getElementById('moodBody'),
      }
  
      const themes = ['night','dawn','neon'];
      let themeIndex = 0;
  
      function setLoading(state=true){
        if(state){
          el.temp.textContent = '...';
          el.metricTemp.textContent = '...';
        }
      }
  
      function kelvinToC(k){return Math.round(k - 273.15)}
  
      function applyFallbackUI(){
        el.place.textContent = '—';
        el.country.textContent = '—';
        el.temp.textContent = '--';
        el.metricTemp.textContent = '--';
        el.feels.textContent = 'اطلاعات موجود نیست';
        el.desc.textContent = '—';
        el.iconSVG.innerHTML = '';
        updateMood('default');
      }
  
      function updateMood(main, desc){
        const key = main?.includes('rain') ? 'rain' : main?.includes('cloud') ? 'cloud' : main?.includes('snow') ? 'snow' : main?.includes('thunder') ? 'storm' : main?.includes('clear') ? 'clear' : 'default';
        const suggestions = {
          clear: {
            title: 'هوای آفتابی — وقت بیرون رفتن!',
            text: 'یک نوشیدنی خنک آماده کن، آهنگ‌های پرانرژی پلی کن و بگذار نور خورشید تمام برنامه‌ریزی‌هات را روشن کند.'
          },
          rain: {
            title: 'باران رمانتیک',
            text: 'با یک فنجان قهوه و پلی‌لیست lo-fi یک فضای cozy بساز. بهترین زمان برای کتاب خواندن و برنامه‌ریزی خلاقانه است.'
          },
          cloud: {
            title: 'هوای ابری — آرامش و تمرکز',
            text: 'نور ملایم آسمان ابری برای تمرکز عالی است؛ موسیقی ملایم گوش بده و به کارهای عقب‌افتاده برس.'
          },
          snow: {
            title: 'برف و آرامش سفید',
            text: 'لباس گرم بپوش، چراغ‌های نرم روشن کن و یک فیلم الهام‌بخش ببین؛ این هوا حس آرامش و شروع دوباره می‌دهد.'
          },
          storm: {
            title: 'طوفان هیجان',
            text: 'کمی نور نئون یا LED روشن کن، موزیک‌های سینمایی گوش بده و اجازه بده انرژی هوا به ایده‌های جدید تبدیل شود.'
          },
          default: {
            title: 'حالت انتظار',
            text: desc && desc !== 'اطلاعات در دسترس نیست' ? desc : 'در انتظار دریافت داده‌ی معتبر هستیم. اتصال اینترنت یا کلید API را بررسی کن.'
          }
        };
  
        const mood = suggestions[key] || suggestions.default;
        el.moodTitle.textContent = mood.title;
        el.moodBody.textContent = mood.text;
      }
  
      async function fetchByCity(city){
        if(!city) return;
        setLoading(true);
        try{
          const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`);
          const d = await resp.json();
          if(resp.ok){
            handleCurrent(d);
            // fetch forecast (onecall requires lat/lon)
            getOneCall(d.coord.lat, d.coord.lon);
          } else {
            alert(d.message || 'خطا در دریافت داده');
            applyFallbackUI();
          }
        } catch(e){
          console.error(e); alert('خطا در ارتباط با سرور');
          applyFallbackUI();
        } finally{setLoading(false)}
      }
  
      async function fetchByCoords(lat,lon){
        setLoading(true);
        try{
          const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
          const d = await resp.json();
          if(resp.ok){
            handleCurrent(d);
            getOneCall(lat,lon);
          } else {
            alert(d.message || 'خطا');
            applyFallbackUI();
          }
        } catch(e){
          console.error(e);
          alert('خطا در شبکه');
          applyFallbackUI();
        } finally{setLoading(false)}
      }
  
      async function getOneCall(lat,lon){
        try{
          // Using One Call 3.0 (if not available, One Call 2.5 could be used)
          const resp = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=${units}&appid=${API_KEY}`);
          const d = await resp.json();
          if(resp.ok){
            renderForecast(d);
          } else {
            console.warn('onecall:',d);
          }
        }catch(e){console.error(e)}
      }
  
      function handleCurrent(d){
        if(!d || !d.main){
          applyFallbackUI();
          return;
        }
  
        const city = d.name || '';
        const country = d.sys && d.sys.country ? d.sys.country : '';
        const hasWeather = Array.isArray(d.weather) && d.weather.length;
        const desc = hasWeather ? d.weather[0].description : 'اطلاعات در دسترس نیست';
        const icon = hasWeather ? d.weather[0].icon : null;
        const main = hasWeather ? d.weather[0].main : '';
        const tC = Math.round(d.main.temp - 273.15);
        const tF = Math.round((d.main.temp - 273.15) * 9/5 + 32);
        const displayTemp = units==='metric' ? tC : tF;
  
        el.place.textContent = city || '—';
        el.country.textContent = country || '—';
        el.temp.textContent = displayTemp;
        el.unit.textContent = '°' + (units==='metric' ? 'C' : 'F');
        el.desc.textContent = desc || '—';
  
        el.metricTemp.textContent = displayTemp + (units==='metric' ? '°C' : '°F');
        el.feels.textContent = 'احساس واقعی: ' + (units==='metric' ? Math.round(d.main.feels_like - 273.15) + '°C' : Math.round((d.main.feels_like - 273.15)*9/5+32) + '°F');
        el.humidity.textContent = (d.main.humidity || '—') + '%';
        el.wind.textContent = (d.wind && d.wind.speed ? Math.round(d.wind.speed) + ' m/s' : '—');
        el.pressure.textContent = (d.main.pressure || '—') + ' hPa';
  
        if(hasWeather){
          const lowerMain = main.toLowerCase();
          renderIcon(icon, lowerMain);
          applyBackgroundByWeather(lowerMain);
          updateMood(lowerMain, desc);
        } else {
          renderIcon(null, '');
          updateMood('default', desc);
        }
      }
  
      function renderIcon(iconCode, main){
        // Simple inline SVG icons for style — can be extended
        const svg = {
          '01': '<circle cx="50" cy="50" r="18" fill="#ffd36b" />', // clear
          '02': '<g fill="#fff"><circle cx="46" cy="46" r="14" fill="#ffd36b" opacity="0.95"/><ellipse cx="70" cy="62" rx="22" ry="12" opacity="0.12"/></g>',
          '03': '<g fill="#fff"><ellipse cx="40" cy="54" rx="30" ry="16" opacity="0.12"/><ellipse cx="80" cy="56" rx="28" ry="14" opacity="0.12"/></g>',
          '09': '<g fill="#9bb7ff"><ellipse cx="60" cy="56" rx="34" ry="16" opacity="0.14"/></g>',
          '10': '<g fill="#9bb7ff"><circle cx="38" cy="46" r="12"/><path d="M18 70 q12-6 24 0 t24 0" fill="#9bb7ff" opacity="0.6"/></g>',
          '13': '<g fill="#c8f0ff"><ellipse cx="50" cy="54" rx="34" ry="18" opacity="0.18"/><path d="M22 68 q18 -16 56 0" stroke="#cbeffc" stroke-width="2" fill="none"/></g>',
          '11': '<g fill="#d1b3ff"><circle cx="36" cy="44" r="10"/><path d="M18 68 q20 -18 60 0" stroke="#b59bff" stroke-width="2" fill="none"/></g>'
        };
        let k = '01';
        if(iconCode) k = iconCode.slice(0,2);
        el.iconSVG.innerHTML = svg[k] || svg['01'];
      }
  
      function applyBackgroundByWeather(main){
        const root = document.documentElement;
        const m = main?.toLowerCase() || '';
        if(m.includes('cloud')){
          root.style.setProperty('--bg1','#0b1220');
        } else if(m.includes('rain')||m.includes('drizzle')){
          root.style.setProperty('--bg1','#06132a');
        } else if(m.includes('clear')){
          root.style.setProperty('--bg1','#0b1220');
        } else if(m.includes('snow')){
          root.style.setProperty('--bg1','#0a1b2b');
        } else if(m.includes('thunder')){
          root.style.setProperty('--bg1','#04040a');
        } else {
          root.style.setProperty('--bg1', getComputedStyle(document.body).getPropertyValue('--bg1') || '#0f172a');
        }
      }
  
      function renderForecast(d){
        // d.daily available from onecall — show next 3 days
        el.forecast.innerHTML = '';
        if(!d || !d.daily) return;
        const days = d.daily.slice(1,4);
        days.forEach(day =>{
          const dt = new Date(day.dt * 1000);
          const name = dt.toLocaleDateString('fa-IR', {weekday:'short'});
          const max = Math.round(day.temp.max);
          const min = Math.round(day.temp.min);
          const iconMain = day.weather && day.weather[0] ? day.weather[0].main : '—';
          const card = document.createElement('div');
          card.className='fcard';
          card.innerHTML = `<div style="font-weight:700">${name}</div><div style="font-size:20px;margin:8px 0">${max} / ${min}</div><div style="opacity:0.85">${iconMain}</div>`;
          el.forecast.appendChild(card);
        });
      }
  
      el.themeBtn.addEventListener('click', ()=>{
        themeIndex = (themeIndex + 1) % themes.length;
        document.body.dataset.theme = themes[themeIndex];
      });
  
      // events
      el.searchBtn.addEventListener('click', ()=>{fetchByCity(el.cityInput.value.trim())});
      el.cityInput.addEventListener('keydown', (e)=>{if(e.key==='Enter') fetchByCity(el.cityInput.value.trim())});
      el.toggleUnit.addEventListener('click', ()=>{units = units==='metric'?'imperial':'metric'; if(el.place.textContent && el.place.textContent!=='—') fetchByCity(el.place.textContent);});
      el.locBtn.addEventListener('click', ()=>{
        if(!navigator.geolocation) return alert('موقعیت‌یابی پشتیبانی نمی‌شود');
        navigator.geolocation.getCurrentPosition(pos=>{fetchByCoords(pos.coords.latitude,pos.coords.longitude)}, err=>{alert('خطا در دریافت موقعیت')});
      });
  
      // default city
      fetchByCity('Tokyo');
  
  