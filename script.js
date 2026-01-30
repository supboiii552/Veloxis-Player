const API_KEY = 'a337c4966975cd811dcbed50db511baf';
const IMG_PATH = 'https://image.tmdb.org/t/p/w92';
let CURRENT_ID = '1622'; 
let CURRENT_TYPE = 'tv';

const sSelect = document.getElementById('seasonSelect');
const eSelect = document.getElementById('episodeSelect');
const vContainer = document.getElementById('videoContainer');
const nBtn = document.getElementById('nextBtn');
const fBtn = document.getElementById('fullscreenBtn');
const sInput = document.getElementById('epSearch');
const rBox = document.getElementById('searchResults');
const controls = document.querySelector('.player-controls');

// 1. Initial Load (Supernatural)
async function loadContent(id, type) {
    CURRENT_ID = id;
    CURRENT_TYPE = type;
    sSelect.innerHTML = '<option value="">Season</option>';
    eSelect.innerHTML = '<option value="">Episode</option>';
    eSelect.disabled = true;
    nBtn.style.display = "none";

    if (type === 'tv') {
        sSelect.style.display = "inline-block";
        eSelect.style.display = "inline-block";
        const resp = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}`);
        const data = await resp.json();
        data.seasons.forEach(s => {
            if (s.season_number > 0) {
                let opt = document.createElement('option');
                opt.value = s.season_number;
                opt.innerText = `Season ${s.season_number}`;
                sSelect.appendChild(opt);
            }
        });
    } else {
        // Movies hide selectors and load immediately
        sSelect.style.display = "none";
        eSelect.style.display = "none";
        loadVideo();
    }
}

// 2. Search Multi (Movies + TV with Posters)
sInput.oninput = async (e) => {
    const term = e.target.value;
    rBox.innerHTML = '';
    if (term.length < 3) return;

    try {
        const resp = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(term)}`);
        const data = await resp.json();

        data.results.slice(0, 6).forEach(item => {
            if (item.media_type === 'person') return;
            const div = document.createElement('div');
            div.className = 'search-item';
            const name = item.name || item.title;
            const date = (item.first_air_date || item.release_date || "").split('-')[0];
            const poster = item.poster_path ? IMG_PATH + item.poster_path : 'https://via.placeholder.com/45x68?text=?';

            div.innerHTML = `
                <img src="${poster}">
                <div class="search-info">
                    <strong>${name}</strong>
                    <small>${date} • ${item.media_type.toUpperCase()}</small>
                </div>`;
            div.onclick = () => {
                loadContent(item.id, item.media_type);
                rBox.innerHTML = '';
                sInput.value = name;
            };
            rBox.appendChild(div);
        });
    } catch (err) { console.error(err); }
};

// 3. Load Video Logic
function loadVideo(s = 1, e = 1) {
    let url = (CURRENT_TYPE === 'tv') 
        ? `https://vidlink.pro/tv/${CURRENT_ID}/${s}/${e}` 
        : `https://vidlink.pro/movie/${CURRENT_ID}`;
    
    vContainer.innerHTML = `<iframe src="${url}" allowfullscreen allow="autoplay"></iframe>`;
    if (CURRENT_TYPE === 'tv') nBtn.style.display = "inline-block";
}

// 4. Update Episodes List
sSelect.onchange = async () => {
    const seasonNum = sSelect.value;
    eSelect.innerHTML = '<option value="">Loading...</option>';
    const resp = await fetch(`https://api.themoviedb.org/3/tv/${CURRENT_ID}/season/${seasonNum}?api_key=${API_KEY}`);
    const data = await resp.json();
    eSelect.innerHTML = '<option value="">Episode</option>';
    eSelect.disabled = false;
    data.episodes.forEach(ep => {
        let opt = document.createElement('option');
        opt.value = ep.episode_number;
        opt.innerText = `${ep.episode_number}. ${ep.name}`;
        eSelect.appendChild(opt);
    });
};

eSelect.onchange = () => loadVideo(sSelect.value, eSelect.value);

// 5. Theater Mode & Next Logic
fBtn.onclick = () => {
    document.body.classList.toggle('theater-mode');
    fBtn.innerText = document.body.classList.contains('theater-mode') ? "✕ CLOSE" : "⛶ FULLSCREEN";
};

nBtn.onclick = async () => {
    let s = parseInt(sSelect.value), e = parseInt(eSelect.value);
    const nextEp = eSelect.querySelector(`option[value="${e + 1}"]`);
    if (nextEp) {
        eSelect.value = e + 1;
        loadVideo(s, e + 1);
    } else {
        let nextS = s + 1;
        if (sSelect.querySelector(`option[value="${nextS}"]`)) {
            sSelect.value = nextS;
            await sSelect.onchange();
            eSelect.value = 1;
            loadVideo(nextS, 1);
        }
    }
};

loadContent('1622', 'tv');
