/* =============================================================
   QUICK QUIZ AI — app.js
   ============================================================= */

// ---- Sound ----
class SFX {
    constructor() { try { this.c = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {} }
    t(f, d, v = 0.15, tp = 'sine') {
        if (!this.c) return;
        const o = this.c.createOscillator(), g = this.c.createGain();
        o.connect(g); g.connect(this.c.destination);
        o.frequency.setValueAtTime(f, this.c.currentTime); o.type = tp;
        g.gain.setValueAtTime(0, this.c.currentTime);
        g.gain.linearRampToValueAtTime(v, this.c.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, this.c.currentTime + d);
        o.start(); o.stop(this.c.currentTime + d);
    }
    click() { this.t(800, 0.06, 0.03, 'square'); }
    ok() { this.t(523, 0.1); setTimeout(() => this.t(659, 0.1), 100); setTimeout(() => this.t(784, 0.12), 200); }
    ng() { this.t(200, 0.2, 0.15, 'sawtooth'); }
    go() { [523, 587, 659, 784].forEach((f, i) => setTimeout(() => this.t(f, 0.1), i * 80)); }
    pop() {
        // パン！= 短い高音 + ノイズ感
        this.t(880, 0.04, 0.12, 'square');
        setTimeout(() => this.t(1200, 0.03, 0.06, 'sine'), 30);
        setTimeout(() => this.t(600, 0.04, 0.04, 'sawtooth'), 55);
    }
}
const sfx = new SFX();
document.addEventListener('click', () => { if (sfx.c?.state === 'suspended') sfx.c.resume(); }, { once: true });

// ---- Voice ----
const voice = {
    enabled: true,
    speak(t) {
        if (!this.enabled || !t || !('speechSynthesis' in window)) return;
        const u = new SpeechSynthesisUtterance(t);
        const v = speechSynthesis.getVoices().filter(v => v.lang.startsWith('en-'));
        if (v.length) {
            const s = v.find(v => v.name.toLowerCase().includes('samantha')) || v[0];
            u.voice = s; u.lang = s.lang;
        } else u.lang = 'en-US';
        u.rate = 0.9; speechSynthesis.cancel(); speechSynthesis.speak(u);
    }
};

// ---- Categories ----
const categories = {
    geography: [
        { id: 'geo_world_overview', name: '1.世界の姿' }, { id: 'geo_japan_overview', name: '2.日本の姿' },
        { id: 'geo_world_life', name: '3.世界各地の人々の生活と環境' }, { id: 'geo_asia', name: '4.アジア州' },
        { id: 'geo_europe', name: '5.ヨーロッパ州' }, { id: 'geo_africa', name: '6.アフリカ州' },
        { id: 'geo_north_america', name: '7.北アメリカ州' }, { id: 'geo_south_america', name: '8.南アメリカ州' },
        { id: 'geo_oceania', name: '9.オセアニア' }, { id: 'geo_japan_features', name: '10.日本の地域的特色' },
        { id: 'geo_japan_kyushu', name: '11.九州地方' }, { id: 'geo_japan_chugoku', name: '12.中国・四国地方' },
        { id: 'geo_japan_kinki', name: '13.近畿地方' }, { id: 'geo_japan_chubu', name: '14.中部地方' },
        { id: 'geo_japan_kanto', name: '15.関東地方' }, { id: 'geo_japan_tohoku', name: '16.東北地方' },
        { id: 'geo_japan_hokkaido', name: '17.北海道地方' }
    ],
    history: [
        { id: 'hist_ancient', name: '1.文明のおこりと日本の成り立ち' }, { id: 'hist_ancient_state', name: '2.古代国家の歩みと東アジア' },
        { id: 'hist_kamakura', name: '3.武士のおこりと鎌倉幕府' }, { id: 'hist_muromachi', name: '4.モンゴルの襲来と室町幕府' },
        { id: 'hist_unification', name: '5.ヨーロッパ人との出会いと全国統一' }, { id: 'hist_edo_early', name: '6.江戸幕府の成立と鎖国' },
        { id: 'hist_edo_develop', name: '7.産業の発達と幕府政治の展開' }, { id: 'hist_opening', name: '8.欧米の進出と日本の開国' },
        { id: 'hist_meiji', name: '9.明治維新' }, { id: 'hist_wars', name: '10.日清・日露戦争と日本の産業革命' },
        { id: 'hist_wwi', name: '11.第一次世界大戦と日本' }, { id: 'hist_wwii', name: '12.世界恐慌と第二次世界大戦' },
        { id: 'hist_postwar', name: '13.戦後の日本の発展と国際社会' }
    ],
    civics: [
        { id: 'civics_modern', name: '1.現代社会と私たち' }, { id: 'civics_constitution', name: '2.人間の尊重と日本国憲法' },
        { id: 'civics_democracy', name: '3.現代の民主政治' }, { id: 'civics_economy', name: '4.暮らしと経済' }
    ],
    chemistry: [
        { id: 'chemistry_basic', name: '1.物質とその性質' }, { id: 'chemistry_gas', name: '2.気体の性質' },
        { id: 'chemistry_solution', name: '3.水溶液の性質' }, { id: 'chemistry_state', name: '4.状態変化' },
        { id: 'chemistry_change', name: '5.物質の変化' }, { id: 'chemistry_structure', name: '6.物質の成り立ち' },
        { id: 'chemistry_reaction', name: '7.物質どうしの化学変化' }, { id: 'chemistry_mass', name: '8.化学変化と質量' },
        { id: 'chemistry_ion', name: '9.イオンと電池' }, { id: 'chemistry_acid', name: '10.酸、アルカリ、塩' },
        { id: 'chemistry_formula', name: '11.化学式' }, { id: 'chemistry_reaction_equation', name: '12.化学反応式' },
        { id: 'chemistry_ion_formula', name: '13.イオンの化学式' }, { id: 'chemistry_ion_reaction', name: '14.イオンの化学反応式' }
    ],
    biology: [
        { id: 'biology_flower', name: '1.花のつくり' }, { id: 'biology_plant', name: '2.根・葉のつくり' },
        { id: 'biology_animal', name: '3.動物の特徴と分類' }, { id: 'biology_microscope', name: '4.顕微鏡の使い方' },
        { id: 'biology_cell', name: '5.生物と細胞' }, { id: 'biology_plant_body', name: '6.植物のからだのつくり' },
        { id: 'biology_digestion', name: '7.消化と吸収' }, { id: 'biology_breathing', name: '8.呼吸' },
        { id: 'biology_circulation', name: '9.血液の循環' }, { id: 'biology_response', name: '10.刺激と反応' },
        { id: 'biology_growth', name: '11.生物の成長' }, { id: 'biology_reproduction', name: '12.生物の生殖' },
        { id: 'biology_heredity', name: '13.遺伝の規則性' }, { id: 'biology_evolution', name: '14.生物の進化' },
        { id: 'biology_environment', name: '15.自然と環境' }
    ],
    physics: [
        { id: 'physics_light', name: '1.光による現象' }, { id: 'physics_sound', name: '2.音による現象' },
        { id: 'physics_force', name: '3.力による現象' }, { id: 'physics_current', name: '4.電流と電圧' },
        { id: 'physics_energy', name: '5.電気エネルギー' }, { id: 'physics_magnetic', name: '6.電流と磁界' },
        { id: 'physics_balance', name: '7.力のつり合い' }, { id: 'physics_motion', name: '8.物体の運動' },
        { id: 'physics_pressure', name: '9.水圧と浮力' }, { id: 'physics_work', name: '10.エネルギーと仕事' },
        { id: 'physics_energy_change', name: '11.エネルギーの移り変わり' }, { id: 'physics_resources', name: '12.エネルギー資源の利用' }
    ],
    earth: [
        { id: 'earth_volcano', name: '1.火山' }, { id: 'earth_earthquake', name: '2.地震' },
        { id: 'earth_strata', name: '3.地層のでき方' }, { id: 'earth_weather', name: '4.気象の観測' },
        { id: 'earth_front', name: '5.気団と前線' }, { id: 'earth_cloud', name: '6.雲のでき方' },
        { id: 'earth_celestial', name: '7.天体の動き' }, { id: 'earth_solar', name: '8.太陽系の天体' },
        { id: 'earth_moon', name: '9.月と惑星の見え方' }
    ],
    english_words: [
        { id: 'words_time', name: '月・序数' }, { id: 'words_week', name: '曜日' },
        { id: 'words_timeday', name: '時・時間帯' }, { id: 'words_season', name: '季節・家族' },
        { id: 'words_sports', name: 'スポーツ・教科' }, { id: 'words_job', name: '職業・人・建物' },
        { id: 'words_uncountable', name: '数えられない名詞' }, { id: 'words_verb_important', name: '入試必出重要動詞' },
        { id: 'words_verb_various', name: 'いろいろな意味をもつ動詞' }, { id: 'words_verb_set', name: 'セットで覚えておきたい動詞' },
        { id: 'words_verb_other', name: 'その他の重要動詞' }, { id: 'words_adj_quantity', name: '数・量を表す形容詞' },
        { id: 'words_adj_various', name: 'いろいろな形容詞' }, { id: 'words_adj_adv', name: 'その他の重要形容詞・副詞' },
        { id: 'words_adv_manner', name: '様子を表す副詞' }
    ],
    english_phrases: [
        { id: 'phrases_verb', name: 'よく出る動詞の熟語' }, { id: 'phrases_set', name: 'セットで覚えておきたい熟語' },
        { id: 'phrases_similar', name: '意味の似ている熟語' }, { id: 'phrases_verb_other', name: 'その他の動詞の熟語' },
        { id: 'phrases_be', name: 'be 動詞を使った熟語' }, { id: 'phrases_quantity', name: '数や量を表す熟語' },
        { id: 'phrases_time_place', name: '時・場所を表す熟語' }, { id: 'phrases_important', name: 'その他の重要熟語' }
    ],
    english_grammar: [
        { id: 'grammar_irregular_past', name: '不規則動詞 - 過去形・過去分詞' }, { id: 'grammar_irregular_same', name: '不規則動詞 - 過去形と過去分詞が同じ' },
        { id: 'grammar_irregular_special', name: '不規則動詞 - 特殊なケース' }, { id: 'grammar_be_past', name: 'be 動詞 - 過去形・過去分詞' },
        { id: 'grammar_regular', name: '規則動詞 - 過去形・過去分詞' }, { id: 'grammar_third_person', name: '三人称単数現在形' },
        { id: 'grammar_ing', name: '動詞の -ing 形' }, { id: 'grammar_comparative', name: '形容詞 - 比較級・最上級' },
        { id: 'grammar_more_most', name: 'more、most をつける形容詞' }, { id: 'grammar_noun_plural', name: '名詞の複数形' },
        { id: 'grammar_irregular_plural', name: '不規則な複数形' }, { id: 'grammar_pronoun', name: '人称代名詞' }
    ]
};

const gradeMap = {
    chemistry: { '中1': [0, 4], '中2': [4, 8], '中3': [8, 10], '化学式・反応式': [10, 14] },
    biology: { '中1': [0, 4], '中2': [4, 10], '中3': [10, 15] },
    physics: { '中1': [0, 3], '中2': [3, 6], '中3': [6, 12] },
    earth: { '中1': [0, 3], '中2': [3, 6], '中3': [6, 9] }
};

// ---- State ----
let sel = [], cc = 0, wc = 0, tc = 0, used = [], qMode = 'random', seqIdx = 0, curSubj = '', curLabel = '', curQuiz = null;

// ---- 会話履歴 & 弱点トラッカー ----
let chatHistory = [];      // [{role:'user'|'assistant', content:'...'}]
let weakTracker = {};      // {categoryId: {correct:0, wrong:0}}

// ---- AIモード設定 ----
let aiMode = {
    style: 'friend',   // 'teacher' | 'friend' | 'exam'
    depth: 'normal',   // 'easy' | 'normal' | 'deep'
    autoAnalyze: true  // 不正解時に自動分析するか
};

function loadAiMode() {
    // 毎回デフォルト（友達・ふつう）でリセット
    aiMode = { style: 'friend', depth: 'normal', autoAnalyze: true };
}
function saveAiMode() { /* localStorageは使わない */ }

const aiStylePrompt = {
    teacher: 'やや丁寧な先生口調で話してください（「〜ですよ」「〜ですね」）。わかりやすく体系立てて説明してください。',
    friend:  'タメ口で友達みたいに話してください（「〜だよ」「〜じゃん」「そうそう！」など）。明るくフレンドリーに。',
    exam:    '試験対策向けに端的に説明してください。余分な会話は省き、要点・覚えるべき事項・頻出パターンだけ伝えてください。'
};

const aiDepthPrompt = {
    easy:   'とにかくわかりやすさ最優先。難しい言葉は使わず、日常的な例え話や語呂合わせを使って覚え方だけ伝えてください。背景や理由の説明は最小限で。',
    normal: '用語の意味と重要ポイントをバランスよく説明してください。ある程度の背景も含めてください。',
    deep:   'なぜそうなるかの背景・因果関係・歴史的経緯まで踏み込んで説明してください。関連する概念との繋がりも含めてください。'
};

function loadTracker() {
    try { weakTracker = JSON.parse(localStorage.getItem('weakTracker') || '{}'); } catch(e) {}
}
function saveTracker() {
    try { localStorage.setItem('weakTracker', JSON.stringify(weakTracker)); } catch(e) {}
}
function recordResult(categoryIds, isCorrect) {
    categoryIds.forEach(id => {
        if (!weakTracker[id]) weakTracker[id] = { correct: 0, wrong: 0 };
        if (isCorrect) weakTracker[id].correct++;
        else weakTracker[id].wrong++;
    });
    saveTracker();
    renderWeakTop();
}
function getCategoryName(id) {
    for (const [, cats] of Object.entries(categories)) {
        const found = cats.find(c => c.id === id);
        if (found) return found.name;
    }
    return id;
}
function getWeakRate(stat) {
    const total = stat.correct + stat.wrong;
    if (total === 0) return 0;
    return stat.wrong / total;
}
function renderWeakTop() {
    const el = document.getElementById('weakTopList');
    if (!el) return;
    const entries = Object.entries(weakTracker)
        .filter(([, s]) => s.wrong > 0)
        .sort((a, b) => getWeakRate(b[1]) - getWeakRate(a[1]))
        .slice(0, 3);
    if (entries.length === 0) {
        el.innerHTML = '<p class="weak-empty">まだデータがないよ。問題を解いてみよう！</p>';
        return;
    }
    el.innerHTML = entries.map(([id, s], i) => {
        const total = s.correct + s.wrong;
        const rate = Math.round((s.wrong / total) * 100);
        const emoji = i === 0 ? '🔴' : i === 1 ? '🟠' : '🟡';
        return `<div class="weak-item">
            <span class="weak-rank">${emoji}</span>
            <div class="weak-info">
                <div class="weak-name">${getCategoryName(id)}</div>
                <div class="weak-bar-wrap"><div class="weak-bar" style="width:${rate}%"></div></div>
            </div>
            <span class="weak-pct">${rate}%<br><small>不正解</small></span>
        </div>`;
    }).join('');
}

// ---- Helpers ----
function toast(t) {
    const e = document.getElementById('toast');
    e.textContent = t; e.classList.add('show');
    setTimeout(() => e.classList.remove('show'), 2200);
}

function hideAll() {
    document.querySelectorAll('.overlay').forEach(m => m.classList.remove('show'));
    document.getElementById('quizModal').classList.remove('show');
    // AI先生バーを常時表示
    const bar = document.getElementById('aiBar');
    if (bar) { bar.style.display = 'flex'; bar.style.visibility = 'visible'; bar.style.opacity = '1'; }
}

function show(id) {
    hideAll();
    if (id !== 'quizModal') clearSel();
    document.getElementById(id).classList.add('show');
}
function goBackToMain() { curQuiz = null; renderQuickChips(); hideAll(); clearSel(); sel = []; seqIdx = 0; used = []; sfx.click(); }
function goBackFromGame() {
    sfx.click();
    clearSel(); sel = []; seqIdx = 0; used = [];
    curQuiz = null; renderQuickChips();
    hideAll();
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('mainScreen').classList.remove('hidden');
}
function goBackToSocial() { show('socialModal'); sfx.click(); }
function goBackToScience() { show('scienceModal'); sfx.click(); }
function goBackToEnglish() { show('englishModal'); sfx.click(); }

function updateStats() {
    document.getElementById('correctCount').textContent = cc;
    document.getElementById('wrongCount').textContent = wc;
    document.getElementById('totalCount').textContent = tc;
}

// ---- Category Init ----
function initCats() {
    const simple = ['geography', 'history', 'civics', 'english_words', 'english_phrases', 'english_grammar'];
    simple.forEach(s => {
        const cId = s.split('_').map((w, i) => i ? w[0].toUpperCase() + w.slice(1) : w).join('') + 'Categories';
        const c = document.getElementById(cId);
        if (!c) return;
        c.innerHTML = ''; // 二重登録防止：既存ボタンをクリア
        categories[s].forEach(cat => {
            const b = document.createElement('button');
            b.className = 'cat-item'; b.textContent = cat.name;
            b.dataset.categoryId = cat.id;
            b.onclick = () => togCat(s, cat.id, b);
            c.appendChild(b);
        });
    });

    Object.entries(gradeMap).forEach(([s, grades]) => {
        const c = document.getElementById(s + 'Categories');
        if (!c) return;
        c.innerHTML = ''; // 二重登録防止：既存ボタンをクリア
        Object.entries(grades).forEach(([label, [start, end]]) => {
            const d = document.createElement('div');
            d.className = 'grade-div'; d.textContent = label;
            c.appendChild(d);
            categories[s].slice(start, end).forEach(cat => {
                const b = document.createElement('button');
                b.className = 'cat-item'; b.textContent = cat.name;
                b.dataset.categoryId = cat.id;
                b.onclick = () => togCat(s, cat.id, b);
                c.appendChild(b);
            });
        });
    });
}

function clearSel() {
    sel = [];
    document.querySelectorAll('.cat-item.active').forEach(b => b.classList.remove('active'));
    // 決定ボタンも無効化
    document.querySelectorAll('[id^="start"][id$="Quiz"]').forEach(b => b.disabled = true);
}

function togCat(subj, id, btn) {
    sfx.click();
    const i = sel.indexOf(id);
    if (i > -1) {
        sel.splice(i, 1);
        btn.classList.remove('active');
    } else {
        sel.push(id);
        btn.classList.add('active');
    }
    const sid = 'start' + subj.charAt(0).toUpperCase() + subj.slice(1).replace(/_(\w)/g, (_, c) => c.toUpperCase()) + 'Quiz';
    const sb = document.getElementById(sid);
    if (sb) sb.disabled = sel.length === 0;
}

// ---- Quiz Flow ----
function startQuiz(subj, label) {
    sfx.go(); curSubj = subj; curLabel = label;
    hideAll();
    document.getElementById('mainScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    document.getElementById('currentCategory').textContent = label;
    cc = wc = tc = 0; seqIdx = 0; used = []; updateStats();
    // チャット履歴リセット（新しいセッション開始）
    chatHistory = [];
    const box = document.getElementById('chatMs');
    if (box) box.innerHTML = '<div class="chat-m standby">👋 問題を解いているときはそばにいます！<br>気になったことがあれば何でも聞いてね。</div>';
}

function openQuiz() {
    const pool = [];
    sel.forEach(id => { if (problemDatabase[id]) pool.push(...problemDatabase[id]); });
    if (!pool.length) { toast('問題が見つかりません'); return; }

    let q;
    if (qMode === 'sequential') {
        if (seqIdx >= pool.length) seqIdx = 0;
        q = pool[seqIdx]; seqIdx++;
    } else {
        const av = pool.filter(p => !used.includes(p.q));
        if (!av.length) { used = []; q = pool[Math.floor(Math.random() * pool.length)]; }
        else q = av[Math.floor(Math.random() * av.length)];
        used.push(q.q);
    }
    curQuiz = q; showQuizUI(q);
}

function showQuizUI(q) {
    document.getElementById('quizCounter').textContent = 'QUESTION — ' + curLabel;
    document.getElementById('quizQ').textContent = q.q;
    const od = document.getElementById('quizOptions'); od.innerHTML = '';
    const rs = document.getElementById('quizResult'); rs.className = 'quiz-res';
    const mg = document.getElementById('quizMsg'); mg.innerHTML = '';
    const nb = document.getElementById('quizNext'); nb.disabled = true;

    const isEng = sel.some(c => c.startsWith('words_') || c.startsWith('phrases_') || c.startsWith('grammar_'));
    if (isEng) voice.speak(q.q);

    // Shuffle options
    const sh = [...q.opts];
    const correctText = q.opts[q.ans];
    for (let i = sh.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sh[i], sh[j]] = [sh[j], sh[i]];
    }
    const ci = sh.indexOf(correctText);
    const letters = ['A', 'B', 'C', 'D'];

    let answered = false;
    sh.forEach((txt, i) => {
        const b = document.createElement('button');
        b.className = 'quiz-opt';
        b.innerHTML = '<span class="quiz-let">' + letters[i] + '</span><span>' + txt + '</span>';
        b.onclick = () => {
            if (isEng) voice.speak(txt);
            if (!answered) {
                answered = true; tc++;
                const isCorrect = (i === ci);
                if (isCorrect) { cc++; sfx.ok(); toast('🎉 正解！'); }
                else { wc++; sfx.ng(); }
                updateStats(); nb.disabled = false;
                recordResult(sel, isCorrect);
                // 正解・不正解どちらでもリアクション送信
                setTimeout(() => sendReaction(q, txt, correctText, isCorrect), 400);
            }
            if (i === ci) {
                mg.innerHTML = '🎉 正解！' + (q.exp ? '<br><span style="color:var(--mid);font-size:12px">' + q.exp + '</span>' : '');
                rs.className = 'quiz-res ok';
            } else {
                mg.innerHTML = '❌ 不正解。正解は「' + correctText + '」です。' + (q.exp ? '<br><span style="color:var(--mid);font-size:12px">' + q.exp + '</span>' : '');
                rs.className = 'quiz-res ng';
            }
            updateChips();
            renderQuickChips();
        };
        od.appendChild(b);
    });

    nb.onclick = () => { sfx.click(); openQuiz(); };
    document.getElementById('quizBack').onclick = () => { sfx.click(); clearSel(); curQuiz = null; renderQuickChips(); hideAll(); };
    show('quizModal');
}

// ---- クイックチップ ----
const defaultChips = ['教えて', 'どう覚える？', 'もっと分かりやすく'];

function renderQuickChips() {
    const el = document.getElementById('quickChips');
    if (!el) return;
    el.innerHTML = '';

    // 問題を解いていない時はチップを非表示
    if (!curQuiz) {
        el.classList.remove('visible');
        return;
    }

    const chips = [
        '教えて',
        '「' + curQuiz.opts[curQuiz.ans] + '」って何？',
        'どう覚える？'
    ];

    chips.forEach(text => {
        const b = document.createElement('button');
        b.className = 'qchip';
        b.textContent = text;
        b.onclick = () => { sendChat(text); };
        el.appendChild(b);
    });

    requestAnimationFrame(() => el.classList.add('visible'));
}

// ---- テキスト改行変換 ----
function formatBubbleText(text) {
    // \n\n → 段落スペース、\n → 改行
    return text
        .replace(/\n\n+/g, '<br><br>')
        .replace(/\n/g, '<br>');
}

// ---- 浮遊バブル表示 ----
let activeBubbles = []; // 無制限モードで生きているバブルを管理

function spawnBubble(text, type = 'ai') {
    const isInfinite = document.getElementById('bubbleInfinite')?.checked;

    // 無制限モードの場合、既存バブルを半透明にフェード
    if (isInfinite) {
        activeBubbles.forEach(b => {
            b.style.transition = 'opacity .4s';
            b.style.opacity = '0.25';
        });
        // 完全に透過したら削除
        activeBubbles.forEach(b => {
            setTimeout(() => { if (b.parentNode) b.remove(); }, 3000);
        });
        activeBubbles = [];
    }

    const el = document.createElement('div');
    el.className = `float-bubble ${type}`;
    el.innerHTML = type === 'user' ? text : formatBubbleText(text);
    el.style.bottom = '100px';
    el.style.pointerEvents = 'auto';
    el.style.cursor = 'pointer';
    document.body.appendChild(el);

    // クリック／タップで即消去（ポップ！）
    function dismissBubble() {
        // 二重発火防止
        el.removeEventListener('click', dismissBubble);
        el.removeEventListener('touchend', touchDismiss);
        // パン！効果音
        sfx.pop();
        // ポップアニメ
        el.style.animation = 'bubblePop .32s cubic-bezier(.22,1,.36,1) forwards';
        el.style.pointerEvents = 'none';
        setTimeout(() => { if (el.parentNode) el.remove(); }, 320);
        const idx = activeBubbles.indexOf(el);
        if (idx > -1) activeBubbles.splice(idx, 1);
    }
    function touchDismiss(e) { e.preventDefault(); dismissBubble(); }
    el.addEventListener('click', dismissBubble);
    el.addEventListener('touchend', touchDismiss);

    if (isInfinite) {
        // 無制限：アニメ後に消えないよう固定表示
        el.style.animation = 'bubbleIn .3s cubic-bezier(.22,1,.36,1) forwards';
        activeBubbles.push(el);
    } else {
        el.addEventListener('animationend', () => { if (el.parentNode) el.remove(); });
    }
}

// ---- 履歴管理 ----
let historyLog = []; // {role:'user'|'ai', text:string}

function addToHistory(role, text) {
    historyLog.push({ role, text });
    if (historyLog.length > 60) historyLog = historyLog.slice(-60);
}

function renderHistory() {
    const list = document.getElementById('histList');
    if (!list) return;
    if (historyLog.length === 0) {
        list.innerHTML = '<div class="hist-empty">まだ会話がないよ！</div>';
        return;
    }
    list.innerHTML = '';
    historyLog.forEach(({ role, text }) => {
        const el = document.createElement('div');
        el.className = 'hist-m ' + (role === 'user' ? 'u' : 'a');
        el.innerHTML = role === 'ai' ? md2html(text) : text;
        list.appendChild(el);
    });
    list.scrollTop = list.scrollHeight;
}

// ---- AI リアクション ----
const fallbackOk = ['👍 よくできました！', '🎯 完璧！', '✨ さすが！', '🙌 正解！', '💪 その調子！'];
const fallbackNg = ['💪 次は大丈夫！', '🤔 惜しかった！', '😤 次こそ！', '🔥 ドンマイ！', '👊 負けるな！'];

async function sendReaction(q, chosenTxt, correctText, isCorrect) {
    // タイピングバブル（仮）
    const typingBubble = document.createElement('div');
    typingBubble.className = 'float-bubble ai' + (isCorrect ? ' ok' : ' ng');
    typingBubble.style.cssText = 'animation:none;bottom:100px;opacity:0;right:16px;transition:opacity .2s;z-index:496';
    typingBubble.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    document.body.appendChild(typingBubble);
    requestAnimationFrame(() => { typingBubble.style.opacity = '1'; });

    const reactionPrompt = isCorrect
        ? `生徒が「${q.q}」に正解した。短く一言だけ褒めて。絵文字1つ使って15字以内。「よくできました」「さすが」「完璧」「正解」「その調子」などのバリエーションで毎回違う表現にすること。`
        : `生徒が「${q.q}」を「${chosenTxt}」と間違えた（正解:${correctText}）。短く一言だけ励まして。絵文字1つ使って20字以内。「惜しい」「ドンマイ」「次こそ」「大丈夫」「負けるな」などのバリエーションで毎回違う表現にすること。絶対に「惜しい」だけで始めないこと。`;

    try {
        const r = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: reactionPrompt,
                history: [],
                quizContext: '',
                modePrompt: `${aiStylePrompt[aiMode.style]}\n超短い一言リアクションだけ返す。説明不要。`
            })
        });
        const d = await r.json();
        const fb = isCorrect ? fallbackOk : fallbackNg;
        const replyText = d.reply || fb[Math.floor(Math.random() * fb.length)];
        typingBubble.remove();
        spawnBubble(replyText, 'ai' + (isCorrect ? ' ok' : ' ng'));
        addToHistory('ai', replyText);
    } catch(e) {
        typingBubble.remove();
        const fb = isCorrect ? fallbackOk : fallbackNg;
        spawnBubble(fb[Math.floor(Math.random() * fb.length)], 'ai' + (isCorrect ? ' ok' : ' ng'));
    }
}

// ---- チップ更新 ----
function updateChips() {
    const el = document.getElementById('chips');
    if (!el) return;
    el.innerHTML = '';
    if (!curQuiz) return;
    const corr = curQuiz.opts[curQuiz.ans];
    const suggestions = [
        '「' + corr + '」をもっと分かりやすく教えて',
        'この問題の覚え方は？',
        '入試でどう出題される？',
        '関連する重要用語は？'
    ];
    suggestions.forEach(t => {
        const c = document.createElement('button');
        c.className = 'chip'; c.textContent = t;
        c.onclick = () => { document.getElementById('histOv').classList.remove('show'); sendChat(t); };
        el.appendChild(c);
    });
}

function getCtx() {
    return curQuiz
        ? '問題: ' + curQuiz.q + '\n正解: ' + curQuiz.opts[curQuiz.ans] + '\n解説: ' + (curQuiz.exp || 'なし') + '\n教科: ' + curLabel + '\n選択肢: ' + curQuiz.opts.join(', ')
        : '';
}

function getModePrompt() {
    return `【AIの話し方】${aiStylePrompt[aiMode.style]}
【説明の深さ】${aiDepthPrompt[aiMode.depth]}
【返答スタイル】3〜5文の会話文で答えてください。必ず2文ごとに改行を2回（空行）入れて段落を分けること。これは絶対に守ること。箇条書き・見出し・記号（**、##、・など）は一切使わないこと。`;
}

function md2html(md) {
    let h = md
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/^### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^## (.+)$/gm, '<h3>$1</h3>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
    h = h.replace(/((?:<li>.+<\/li>\n?)+)/g, '<ul>$1</ul>');
    h = h.split('\n\n').map(p => {
        p = p.trim();
        if (!p || p.startsWith('<')) return p;
        return '<p>' + p + '</p>';
    }).join('');
    return h;
}

async function sendChat(message, isAuto = false) {
    if (!message.trim()) return;
    const inp = document.getElementById('chatIn');
    const btn = document.getElementById('chatSd');
    const displayText = isAuto ? '🤖 もっと分かりやすく教えて' : message;

    if (!isAuto) { inp.value = ''; btn.disabled = true; }

    // ユーザーバブル
    spawnBubble(displayText, 'user');
    addToHistory('user', displayText);

    // タイピングバブル（固定・アニメなし）
    const typingBubble = document.createElement('div');
    typingBubble.className = 'float-bubble ai';
    typingBubble.style.cssText = 'animation:none;bottom:100px;opacity:0;right:16px;transition:opacity .2s;z-index:496';
    typingBubble.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    document.body.appendChild(typingBubble);
    requestAnimationFrame(() => { typingBubble.style.opacity = '1'; });

    chatHistory.push({ role: 'user', content: message });
    if (chatHistory.length > 10) chatHistory = chatHistory.slice(-10);

    try {
        const r = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history: chatHistory, quizContext: getCtx(), modePrompt: getModePrompt() })
        });
        const d = await r.json();
        const replyText = d.reply || d.error || 'エラーが発生しました';
        typingBubble.remove();
        spawnBubble(replyText, 'ai');
        addToHistory('ai', replyText);
        chatHistory.push({ role: 'assistant', content: replyText });
        if (chatHistory.length > 10) chatHistory = chatHistory.slice(-10);
    } catch (e) {
        typingBubble.remove();
        spawnBubble('通信エラーが発生しました。', 'ai');
    }
    btn.disabled = false;
}

// ---- モードUI初期化 ----
function initModeUI() {
    document.querySelectorAll('[data-style]').forEach(btn => {
        btn.addEventListener('click', () => {
            aiMode.style = btn.dataset.style;
            document.querySelectorAll('[data-style]').forEach(b => b.classList.remove('mode-active'));
            btn.classList.add('mode-active');
            sfx.click();
        });
    });
    document.querySelectorAll('[data-depth]').forEach(btn => {
        btn.addEventListener('click', () => {
            aiMode.depth = btn.dataset.depth;
            document.querySelectorAll('[data-depth]').forEach(b => b.classList.remove('mode-active'));
            btn.classList.add('mode-active');
            sfx.click();
        });
    });
    const tog = document.getElementById('autoAnalyzeTog');
    if (tog) {
        tog.addEventListener('change', () => { aiMode.autoAnalyze = tog.checked; });
    }

    // バブル表示時間スライダー
    const slider = document.getElementById('bubbleDurSlider');
    const durLabel = document.getElementById('bubbleDurLabel');
    const infiniteChk = document.getElementById('bubbleInfinite');
    function applyDuration() {
        if (infiniteChk && infiniteChk.checked) {
            durLabel.textContent = '無制限';
            document.documentElement.style.setProperty('--bubble-duration', '9999s');
            slider.disabled = true;
            slider.style.opacity = '0.4';
        } else {
            const val = parseInt(slider.value);
            durLabel.textContent = val + '秒';
            document.documentElement.style.setProperty('--bubble-duration', val + 's');
            slider.disabled = false;
            slider.style.opacity = '1';
        }
    }
    if (slider && durLabel) {
        // デフォルト10秒を反映
        document.documentElement.style.setProperty('--bubble-duration', '10s');
        slider.addEventListener('input', () => { applyDuration(); sfx.click(); });
    }
    if (infiniteChk) {
        infiniteChk.addEventListener('change', () => { applyDuration(); sfx.click(); });
    }
}

// ---- Event Listeners ----
document.addEventListener('DOMContentLoaded', () => {
    loadTracker();
    loadAiMode();
    renderWeakTop();
    initCats();
    initModeUI();

    // 起動時の待機バブル
    setTimeout(() => spawnBubble('👋 問題を解いているときはそばにいます！<br>気になったことがあれば何でも聞いてね。', 'ai'), 800);
    renderQuickChips();

    // Subject buttons
    document.querySelectorAll('[data-subject]').forEach(b => {
        b.addEventListener('click', () => { sfx.click(); b.blur(); show(b.dataset.subject + 'Modal'); });
    });

    // Category buttons
    document.querySelectorAll('[data-category]').forEach(b => {
        b.addEventListener('click', () => {
            sfx.click(); b.blur();
            const cat = b.dataset.category;
            const mid = cat.split('_').map((w, i) => i ? w[0].toUpperCase() + w.slice(1) : w).join('') + 'Modal';
            show(mid);
        });
    });

    // Quiz start buttons
    const starts = {
        startGeographyQuiz: ['geography', '🗺️ 地理'],
        startHistoryQuiz: ['history', '🏛️ 歴史'],
        startCivicsQuiz: ['civics', '⚖️ 公民'],
        startChemistryQuiz: ['chemistry', '🧪 化学'],
        startBiologyQuiz: ['biology', '🧬 生物'],
        startPhysicsQuiz: ['physics', '⚛️ 物理'],
        startEarthQuiz: ['earth', '🌍 地学'],
        startEnglishWordsQuiz: ['english_words', '📝 英単語'],
        startEnglishPhrasesQuiz: ['english_phrases', '💬 英熟語'],
        startEnglishGrammarQuiz: ['english_grammar', '📘 語形変化']
    };
    Object.entries(starts).forEach(([id, [s, l]]) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', () => startQuiz(s, l));
    });

    document.getElementById('startQuizButton').addEventListener('click', () => { sfx.go(); openQuiz(); });

    document.getElementById('randomModeBtn').addEventListener('click', () => {
        sfx.click(); qMode = 'random';
        document.getElementById('randomModeBtn').classList.add('mode-active');
        document.getElementById('sequentialModeBtn').classList.remove('mode-active');
    });
    document.getElementById('sequentialModeBtn').addEventListener('click', () => {
        sfx.click(); qMode = 'sequential';
        document.getElementById('sequentialModeBtn').classList.add('mode-active');
        document.getElementById('randomModeBtn').classList.remove('mode-active');
    });

    // 入力欄の変化でsendボタン有効化
    document.getElementById('chatIn').addEventListener('input', e => {
        document.getElementById('chatSd').disabled = !e.target.value.trim();
    });

    // Chat send
    document.getElementById('chatSd').addEventListener('click', () => {
        sendChat(document.getElementById('chatIn').value);
    });
    document.getElementById('chatIn').addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.isComposing) sendChat(document.getElementById('chatIn').value);
    });

    // 設定オーバーレイ
    document.getElementById('settingBtn').addEventListener('click', () => {
        sfx.click();
        document.getElementById('settingOv').classList.add('show');
    });
    document.getElementById('settingClose').addEventListener('click', () => {
        document.getElementById('settingOv').classList.remove('show');
    });
    document.getElementById('settingOv').addEventListener('click', e => {
        if (e.target === e.currentTarget) e.currentTarget.classList.remove('show');
    });

    // 履歴オーバーレイ
    document.getElementById('histBtn').addEventListener('click', () => {
        sfx.click();
        updateChips();
        renderHistory();
        document.getElementById('histOv').classList.add('show');
    });
    document.getElementById('histClose').addEventListener('click', () => {
        document.getElementById('histOv').classList.remove('show');
    });
    document.getElementById('histOv').addEventListener('click', e => {
        if (e.target === e.currentTarget) e.currentTarget.classList.remove('show');
    });
});
