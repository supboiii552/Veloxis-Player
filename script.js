const API_KEY = 'a337c4966975cd811dcbed50db511baf';
let CURRENT_ID = '1622'; // Default: Supernatural
let CURRENT_TYPE = 'tv';

const sSelect = document.getElementById('seasonSelect');
const eSelect = document.getElementById('episodeSelect');
const qSelect = document.getElementById('qualitySelect');
const vContainer = document.getElementById('videoContainer');
const nBtn = document.getElementById('nextBtn');
const sInput = document.getElementById('epSearch');
const rBox = document.getElementById('searchResults');

// 1. TMDB Search Logic
sInput.oninput = async (e) => {
    const term = e.target.value;
    rBox.innerHTML = '';
    if (term.length < 3) return;

    const resp = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(term)}`);
    const data = await resp.json();

    data.results.slice(0, 6).forEach(item => {
        if (item.media_type === 'person') return;
        const div = document.createElement('div');
        div.className = 'search-item';
        const name = item.name || item.title;
        const poster = item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : 'https://via.placeholder.com/92x138';
        div.innerHTML = `<img src="${poster}"><div><strong>${name}</strong><br><small>${item.media_type.toUpperCase()}</small></div>`;
        div.onclick = () => { loadContent(item.id, item.media_type); rBox.innerHTML = ''; sInput.value = name; };
        rBox.appendChild(div);
    });
};

// 2. Load Show/Movie Logic
async function loadContent(id, type) {
    CURRENT_ID = id; CURRENT_TYPE = type;
    sSelect.innerHTML = '<option value="">Season</option>';
    eSelect.innerHTML = '<option value="">Episode</option>';
    if (type === 'tv') {
        const resp = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}`);
        const data = await resp.json();
        data.seasons.forEach(s => { if(s.season_number > 0) {
            let opt = document.createElement('option'); opt.value = s.season_number; opt.innerText = `Season ${s.season_number}`; sSelect.appendChild(opt);
        }});
    } else { loadVideo(); }
}

// 3. Player Engine
function loadVideo(s = 1, e = 1) {
    const quality = qSelect.value; 
    // Vidlink handles quality mostly via their own UI, but we provide the downloader for specific files
    const url = (CURRENT_TYPE === 'tv') ? `https://vidlink.pro/tv/${CURRENT_ID}/${s}/${e}` : `https://vidlink.pro/movie/${CURRENT_ID}`;
    vContainer.innerHTML = `<iframe src="${url}" allowfullscreen allow="autoplay"></iframe>`;
    nBtn.style.display = (CURRENT_TYPE === 'tv') ? 'block' : 'none';
}

// 4. Download / Quality Logic
document.getElementById('downloadBtn').onclick = () => {
    const q = qSelect.value;
    let dlUrl = (CURRENT_TYPE === 'tv') 
        ? `https://vidlink.pro/download/tv/${CURRENT_ID}/${sSelect.value}/${eSelect.value}`
        : `https://vidlink.pro/download/movie/${CURRENT_ID}`;
    
    window.open(dlUrl, '_blank');
    alert(`FLIGHT PREP:\nQuality targeted: ${q}p\nSave the file to your iPad Files app when the next page loads!`);
};

// Controls
sSelect.onchange = async () => {
    const resp = await fetch(`https://api.themoviedb.org/3/tv/${CURRENT_ID}/season/${sSelect.value}?api_key=${API_KEY}`);
    const data = await resp.json();
    eSelect.innerHTML = '<option value="">Episode</option>'; eSelect.disabled = false;
    data.episodes.forEach(ep => {
        let opt = document.createElement('option'); opt.value = ep.episode_number; opt.innerText = `${ep.episode_number}. ${ep.name}`; eSelect.appendChild(opt);
    });
};
eSelect.onchange = () => loadVideo(sSelect.value, eSelect.value);
document.getElementById('fullscreenBtn').onclick = () => document.body.classList.toggle('theater-mode');

loadContent('1622', 'tv'); // Initialize
