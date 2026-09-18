/**
 * StellPlay - 메인 앱 컨트롤러 & UI 인터랙션 (v2.0 Modern)
 * - 이모지 제거 및 모던 SVG 벡터 아이콘 탑재
 * - 멤버별 컬러/이니셜 아바타 필터
 * - 트랙별 간편 대기열/플레이리스트 1클릭 추가
 * - 실시간 사용자 지정 사비(후렴구) 핀 & 튜너
 * - 피처링 & OST, 오리지널, 커버곡, 노래방송 라이브 전곡 지원
 */

document.addEventListener('DOMContentLoaded', () => {
    // 플레이어 인스턴스 초기화
    const player = new MusicPlayer();
    window.player = player;
    window.playerInstance = player;

    // UI 상태
    const state = {
        selectedMajor: 'all',
        selectedSub: null,
        currentFilterGen: 'all',
        currentFilterMember: 'all',
        currentFilterType: 'all', // 'all', 'original', 'cover', 'featuring', 'stream'
        sortOrder: 'latest', // 'latest', 'oldest', 'title'
        searchQuery: '',
        activeView: 'home', // 'home', 'sabi', 'favorites', 'playlist'
        selectedPlaylistId: null,
        fullPlayerViewMode: 'art', // 'art' or 'video'
        isQueueSelectMode: false,
        selectedQueueIndices: new Set()
    };

    // DOM 요소 캐싱
    const dom = {
        // 탑바
        searchInput: document.getElementById('search-input'),
        searchClearBtn: document.getElementById('search-clear-btn'),
        sabiQuickToggle: document.getElementById('btn-sabi-quick'),
        btnSyncNewSongs: document.getElementById('btn-sync-new-songs'),

        // 네비게이션 & 뷰 컨테이너
        navHome: document.getElementById('nav-home'),
        navPlaylists: document.getElementById('nav-playlists'),
        navSettings: document.getElementById('nav-settings'),
        btnAddSong: document.getElementById('btn-add-song'),
        viewHome: document.getElementById('view-home'),
        viewPlaylists: document.getElementById('view-playlists'),
        viewSettings: document.getElementById('view-settings'),
        modalSabiEditor: document.getElementById('modal-sabi-editor'),
        modalSelectPlaylist: document.getElementById('modal-select-playlist'),

        // 멤버 필터 바 및 라디오
        memberMajorRow: document.getElementById('member-major-row'),
        memberSubDivider: document.getElementById('member-sub-divider'),
        memberSubRow: document.getElementById('member-sub-row'),
        majorBtns: document.querySelectorAll('.member-major-btn'),
        btnMemberRadio: document.getElementById('btn-member-radio'),
        memberRadioText: document.getElementById('member-radio-text'),
        typeFilterBtns: document.querySelectorAll('.type-filter-btn'),
        trackCountText: document.getElementById('track-count-text'),
        sortOrderSelect: document.getElementById('sort-order-select'),
        btnShufflePlay: document.getElementById('btn-shuffle-play'),

        // 분위기 추천 & 모달
        modalMoodDetail: document.getElementById('modal-mood-detail'),
        moodModalIcon: document.getElementById('mood-modal-icon'),
        moodModalTitle: document.getElementById('mood-modal-title'),
        moodModalSub: document.getElementById('mood-modal-sub'),
        moodModalTrackList: document.getElementById('mood-modal-track-list'),
        btnMoodPlayAll: document.getElementById('btn-mood-play-all'),
        btnMoodSavePlaylist: document.getElementById('btn-mood-save-playlist'),
        btnMoodRefresh: document.getElementById('btn-mood-refresh'),
        btnCloseMoodModal: document.getElementById('btn-close-mood-modal'),

        // 트랙 리스트
        tracksListContainer: document.getElementById('tracks-list-container'),
        homeTopScrollbarWrap: document.getElementById('home-top-scrollbar-wrap'),
        homeTopScrollbarInner: document.getElementById('home-top-scrollbar-inner'),
        plDetailTopScrollbarWrap: document.getElementById('pl-detail-top-scrollbar-wrap'),
        plDetailTopScrollbarInner: document.getElementById('pl-detail-top-scrollbar-inner'),
        heroBanner: document.getElementById('hero-banner'),
        heroPlayAllBtn: document.getElementById('btn-hero-play-all'),
        heroSabiBtn: document.getElementById('btn-hero-sabi-mode'),

        // 미니 플레이어
        miniPlayerBar: document.getElementById('mini-player-bar'),
        miniThumb: document.getElementById('mini-thumb'),
        miniTitle: document.getElementById('mini-title'),
        miniArtist: document.getElementById('mini-artist'),
        miniPlayBtn: document.getElementById('mini-play-btn'),
        miniPrevBtn: document.getElementById('mini-prev-btn'),
        miniNextBtn: document.getElementById('mini-next-btn'),
        miniSabiBtn: document.getElementById('mini-sabi-btn'),
        miniSabiPinBtn: document.getElementById('mini-sabi-pin-btn'),
        miniShuffleBtn: document.getElementById('mini-shuffle-btn'),
        miniRepeatBtn: document.getElementById('mini-repeat-btn'),
        miniProgressTrack: document.getElementById('mini-progress-track'),
        miniProgressBar: document.getElementById('mini-progress-bar'),
        progressSliderContainer: document.getElementById('progress-slider-container'),
        progressBarFill: document.getElementById('progress-bar-fill'),
        progressSabiMarker: document.getElementById('progress-sabi-marker'),
        currentTimeText: document.getElementById('current-time-text'),
        totalDurationText: document.getElementById('total-duration-text'),
        volumeSlider: document.getElementById('volume-slider'),
        muteBtn: document.getElementById('btn-mute'),
        openFullPlayerBtn: document.getElementById('btn-open-fullplayer'),
        miniPlayerLeft: document.getElementById('mini-player-left'),
        btnToggleQueueDrawer: document.getElementById('btn-toggle-queue-drawer'),
        queueBadgeCount: document.getElementById('queue-badge-count'),

        // 전체화면 플레이어 모달
        fullPlayerModal: document.getElementById('full-player-modal'),
        btnCloseFull: document.getElementById('btn-close-full'),
        fullTrackTitle: document.getElementById('full-track-title'),
        fullTrackArtist: document.getElementById('full-track-artist'),
        btnFullEditSong: document.getElementById('btn-full-edit-song'),
        btnFullToggleQueue: document.getElementById('btn-full-toggle-queue'),
        btnFullSabiEditIcon: document.getElementById('btn-full-sabi-edit-icon'),
        fullAlbumImg: document.getElementById('full-album-img'),
        fullVideoContainer: document.getElementById('full-video-container'),
        btnVideoFullscreen: document.getElementById('btn-video-fullscreen'),
        btnViewArt: document.getElementById('btn-view-art'),
        btnViewVideo: document.getElementById('btn-view-video'),
        fullSabiIndicator: document.getElementById('full-sabi-indicator'),
        fullQueuePanel: document.getElementById('full-queue-panel'),
        fullQueueList: document.getElementById('full-queue-list'),
        fullQueueCount: document.getElementById('full-queue-count'),
        btnFullQueueSaveAll: document.getElementById('btn-full-queue-save-all'),
        btnFullQueueSelectMode: document.getElementById('btn-full-queue-select-mode'),
        fullQueueSelectBar: document.getElementById('full-queue-select-bar'),
        fullQueueSelectCount: document.getElementById('full-queue-select-count'),
        btnFullQueueSaveSelected: document.getElementById('btn-full-queue-save-selected'),
        btnFullQueueCancelSelect: document.getElementById('btn-full-queue-cancel-select'),
        btnClearQueue: document.getElementById('btn-clear-queue'),

        // 슬라이드 대기열 서랍장
        queueDrawer: document.getElementById('queue-drawer'),
        queueDrawerBackdrop: document.getElementById('queue-drawer-backdrop'),
        drawerQueueList: document.getElementById('drawer-queue-list'),
        drawerQueueCount: document.getElementById('drawer-queue-count'),
        btnDrawerClear: document.getElementById('btn-drawer-clear'),
        btnCloseDrawer: document.getElementById('btn-close-drawer'),

        // 곡 추가 모달
        modalAddSong: document.getElementById('modal-add-song'),
        formAddSong: document.getElementById('form-add-song'),
        selectSongType: document.getElementById('select-song-type'),
        rowStreamTimestamps: document.getElementById('row-stream-timestamps'),
        inputStreamStart: document.getElementById('input-stream-start'),
        inputStreamEnd: document.getElementById('input-stream-end'),
        btnCloseAddSong: document.getElementById('btn-close-add-song'),
        btnCancelAddSong: document.getElementById('btn-cancel-add-song'),

        // 곡 정보 직접 수정 모달
        modalEditSong: document.getElementById('modal-edit-song'),
        formEditSong: document.getElementById('form-edit-song'),
        editSongId: document.getElementById('edit-song-id'),
        editSongTitle: document.getElementById('edit-song-title'),
        editSongArtist: document.getElementById('edit-song-artist'),
        editSongOriginalArtist: document.getElementById('edit-song-original-artist'),
        editSongType: document.getElementById('edit-song-type'),
        editSongMember: document.getElementById('edit-song-member'),
        editSongGen: document.getElementById('edit-song-gen'),
        editSongPublishedAt: document.getElementById('edit-song-published-at'),
        editSabiStart: document.getElementById('edit-sabi-start'),
        editSabiEnd: document.getElementById('edit-sabi-end'),
        btnDeleteSong: document.getElementById('btn-delete-song'),
        btnCloseEditSong: document.getElementById('btn-close-edit-song'),
        btnCancelEditSong: document.getElementById('btn-cancel-edit-song'),
        btnResetSongEdit: document.getElementById('btn-reset-song-edit'),

        // 플레이리스트 모달
        modalPlaylist: document.getElementById('modal-playlist'),
        playlistListContainer: document.getElementById('playlist-list-container'),
        formCreatePlaylist: document.getElementById('form-create-playlist'),
        inputPlaylistName: document.getElementById('input-playlist-name'),
        btnClosePlaylistModal: document.getElementById('btn-close-playlist-modal'),

        // 토스트 컨테이너
        toastContainer: document.getElementById('toast-container')
    };

    // ===================================================================
    // ===================================================================
    // 1. 초기 렌더링 및 2단 계층형 멤버 필터 & 분위기 추천
    // ===================================================================
    const SUB_FILTER_CONFIG = {
        all: [],
        group: [
            { id: 'full-group', name: '단체곡', btnClass: 'btn-white' },
            { id: 'unit', name: '유닛 & 듀엣곡', btnClass: 'btn-gradient-stellive' }
        ],
        g1: [
            { id: 'mystic', name: '미스틱', btnClass: 'btn-white' },
            { id: 'kanna', name: '아이리 칸나', btnClass: 'btn-kanna' },
            { id: 'everlys', name: '에버리스', btnClass: 'btn-white' },
            { id: 'yuni', name: '아야츠노 유니', btnClass: 'btn-yuni' },
            { id: 'huya', name: '사키하네 후야', btnClass: 'btn-huya' }
        ],
        g2: [
            { id: 'universe', name: '유니버스', btnClass: 'btn-white' },
            { id: 'hina', name: '시라유키 히나', btnClass: 'btn-hina' },
            { id: 'mashiro', name: '네네코 마시로', btnClass: 'btn-mashiro' },
            { id: 'lize', name: '아카네 리제', btnClass: 'btn-lize' },
            { id: 'tabi', name: '아라하시 타비', btnClass: 'btn-tabi' }
        ],
        g3: [
            { id: 'cliche', name: '클리셰', btnClass: 'btn-white' },
            { id: 'shibuki', name: '텐코 시부키', btnClass: 'btn-shibuki' },
            { id: 'rin', name: '아오쿠모 린', btnClass: 'btn-rin' },
            { id: 'nana', name: '하나코 나나', btnClass: 'btn-nana' },
            { id: 'riko', name: '유즈하 리코', btnClass: 'btn-riko' }
        ]
    };

    const STELLIVE_WHOLE_GROUP_YOUTUBE_IDS = new Set([
        'YcyDo-jp4YM', // Milky Way
        '6mVByQMyxdY', // 추억의 투니버스 메들리
        'hGzklPRul4w', // SEKAI (세카이)
        '5kTp7SQCR_Y', // Tell Your World
        'tD9N1BhSrCI', // 너에게, 나의 빛
        'v094-E3Pmtk', // 스타트레일
        'm-rIYEw5uAs', // 히로인이 되고싶어
        'he2W_4xY5Zo', // 트윙클
        'DMk4_4Xytz4'  // Alice in Musicland
    ]);

    function isStelliveWholeGroupSong(s) {
        if (!s) return false;
        if (s.youtubeId && STELLIVE_WHOLE_GROUP_YOUTUBE_IDS.has(s.youtubeId)) return true;
        const artist = (s.artist || '').trim();
        if ((artist === '스텔라이브 (STELLIVE)' || artist === '스텔라이브') &&
            !artist.includes('&') && !artist.includes('x') && !artist.includes('X') &&
            !artist.includes('유니버스') && !artist.includes('클리셰')) {
            return true;
        }
        return false;
    }

    function initApp() {
        const initialSettings = window.StorageManager ? window.StorageManager.getSettings() : {};
        applyThemeMode(initialSettings.theme || 'dark');
        initMemberButtons();
        initMoodShelf();
        applyMemberTheme(player.currentSong?.members?.[0] || 'all');
        refreshTrackList();
        updatePlayerUIState();
        bindEvents();

        // PWA 서비스 워커 등록
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').catch(() => {});
        }

        // 앱 실행 4초 후 백그라운드 신곡 자동 동기화 (초기 로딩 0초 지연 보장, 12시간 주기)
        setTimeout(() => {
            triggerBackgroundSync(false);
        }, 4000);
    }

    function initMemberButtons() {
        const majorBtns = dom.majorBtns && dom.majorBtns.length > 0 ? dom.majorBtns : document.querySelectorAll('.member-major-btn');
        if (majorBtns && majorBtns.length > 0) {
            majorBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const majorKey = btn.dataset.major;
                    selectMajorFilter(majorKey);
                });
            });
        }
        renderSubFilterRow();
    }

    function selectMajorFilter(majorKey) {
        state.selectedMajor = majorKey;
        state.selectedSub = null;
        state.currentFilterMember = majorKey;

        const majorBtns = dom.majorBtns && dom.majorBtns.length > 0 ? dom.majorBtns : document.querySelectorAll('.member-major-btn');
        if (majorBtns) {
            majorBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.major === majorKey);
            });
        }

        selectMajorTheme(majorKey);

        // 라디오 버튼 텍스트 업데이트
        if (dom.memberRadioText) {
            let label = '스텔 라디오 믹스';
            if (majorKey === 'group') label = '스텔라이브 라디오';
            else if (majorKey === 'g1') label = '1기 컬렉션 라디오';
            else if (majorKey === 'g2') label = '2기 유니버스 라디오';
            else if (majorKey === 'g3') label = '3기 클리셰 라디오';
            dom.memberRadioText.textContent = label;
        }

        renderSubFilterRow();
        refreshTrackList();
    }

    function renderSubFilterRow() {
        if (!dom.memberSubRow) return;
        const items = SUB_FILTER_CONFIG[state.selectedMajor] || [];
        dom.memberSubRow.innerHTML = '';

        if (items.length === 0) {
            if (dom.memberSubDivider) dom.memberSubDivider.style.display = 'none';
            dom.memberSubRow.style.display = 'none';
            return;
        }

        if (dom.memberSubDivider) dom.memberSubDivider.style.display = 'block';
        dom.memberSubRow.style.display = 'flex';

        items.forEach(item => {
            const btn = document.createElement('button');
            btn.className = `member-text-btn member-sub-btn ${item.btnClass || 'btn-white'} ${state.selectedSub === item.id ? 'active' : ''}`;
            btn.dataset.sub = item.id;
            btn.textContent = item.name;

            btn.addEventListener('click', () => {
                if (state.selectedSub === item.id) {
                    state.selectedSub = null;
                    btn.classList.remove('active');
                    selectMajorTheme(state.selectedMajor);
                } else {
                    state.selectedSub = item.id;
                    dom.memberSubRow.querySelectorAll('.member-sub-btn').forEach(b => {
                        b.classList.toggle('active', b.dataset.sub === item.id);
                    });
                    if (window.MEMBERS && window.MEMBERS[item.id]) {
                        applyMemberTheme(item.id);
                    }
                }

                if (dom.memberRadioText) {
                    if (state.selectedSub && window.MEMBERS && window.MEMBERS[state.selectedSub]) {
                        dom.memberRadioText.textContent = `${window.MEMBERS[state.selectedSub].name} 라디오`;
                    } else if (state.selectedSub === 'unit') {
                        dom.memberRadioText.textContent = '유닛 & 듀엣 라디오';
                    } else if (state.selectedSub === 'full-group') {
                        dom.memberRadioText.textContent = '스텔라이브 단체 라디오';
                    }
                }

                refreshTrackList();
            });

            dom.memberSubRow.appendChild(btn);
        });
    }

    const MEMBER_BUTTON_COLORS = {
        all: { color: '#7c5cfc', glow: 'rgba(124, 92, 252, 0.45)' },
        group: { color: '#7c5cfc', glow: 'rgba(124, 92, 252, 0.45)' },
        g1: { color: '#a29bfe', glow: 'rgba(162, 155, 254, 0.45)' },
        g2: { color: '#6c5ce7', glow: 'rgba(108, 92, 231, 0.45)' },
        g3: { color: '#00cec9', glow: 'rgba(0, 206, 201, 0.45)' },
        yuni: { color: '#f472b6', glow: 'rgba(244, 114, 182, 0.5)' },
        huya: { color: '#7e22ce', glow: 'rgba(126, 34, 206, 0.55)' },
        kanna: { color: '#1e40af', glow: 'rgba(30, 64, 175, 0.6)' },
        hina: { color: '#eab308', glow: 'rgba(234, 179, 8, 0.5)' },
        mashiro: { color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.45)' },
        lize: { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.55)' },
        tabi: { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.55)' },
        shibuki: { color: '#c084fc', glow: 'rgba(192, 132, 252, 0.5)' },
        rin: { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.55)' },
        nana: { color: '#ff2a85', glow: 'rgba(255, 42, 133, 0.65)' },
        riko: { color: '#84cc16', glow: 'rgba(132, 204, 22, 0.55)' }
    };

    function applyThemeMode(theme) {
        const isLight = theme === 'light';
        if (isLight) {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        const selectTheme = document.getElementById('setting-theme-select');
        if (selectTheme) selectTheme.value = theme;

        // 사이드바 테마 전환 스위치 UI 동기화
        const btnToggle = document.getElementById('btn-theme-toggle');
        if (btnToggle) {
            btnToggle.setAttribute('title', isLight ? '다크 모드로 전환' : '라이트 모드로 전환');
            btnToggle.setAttribute('aria-checked', isLight ? 'true' : 'false');
        }

        const currentMember = state.currentFilterMember !== 'all' ? state.currentFilterMember : (state.selectedMajor !== 'all' ? state.selectedMajor : 'all');
        const themeObj = MEMBER_BUTTON_COLORS[currentMember] || MEMBER_BUTTON_COLORS.all;
        applyThemeColor(themeObj.color, themeObj.glow);
    }

    function selectMajorTheme(majorKey) {
        const theme = MEMBER_BUTTON_COLORS[majorKey] || MEMBER_BUTTON_COLORS.all;
        applyThemeColor(theme.color, theme.glow);
    }

    function applyThemeColor(color, glow) {
        const root = document.documentElement;
        const isLight = root.getAttribute('data-theme') === 'light';
        root.style.setProperty('--theme-color', color);
        root.style.setProperty('--theme-glow', glow);
        root.style.setProperty('--theme-gradient', `linear-gradient(135deg, ${color}, #3b82f6)`);
        root.style.setProperty('--theme-gradient-subtle', isLight ? `linear-gradient(135deg, ${glow}, rgba(0,0,0,0.02))` : `linear-gradient(135deg, ${glow}, rgba(255,255,255,0.02))`);
    }

    /**
     * 멤버의 고유 버튼 컬러로 전체 UI 발광 및 테마 컬러 동적 변경
     */
    function applyMemberTheme(memberKey) {
        const theme = MEMBER_BUTTON_COLORS[memberKey] || MEMBER_BUTTON_COLORS.all;
        applyThemeColor(theme.color, theme.glow);
    }

    // ===================================================================
    // 2. 분위기 & 바이브 추천 프리셋 설정
    // ===================================================================
    const MOOD_PRESETS = {
        upbeat: {
            id: 'upbeat',
            title: '파워풀',
            icon: '🔥',
            desc: '강렬한 비트와 폭발적인 락 & 고음 보컬 컬렉션',
            keywords: [
                'hit on shot', 'king', '에고 록', 'ego rock', 'star walkin', 'w●rk', 'apt.', 'apt ', '아이덴티티',
                '역몽', 'joker', '숙명', '언노운 마더구스', 'phony', '히비카세', 'hibikase', '왕가는 이상해',
                '절대적대', '자이언트', 'giant', 'god-ish', '신인류', '불꽃', 'flame', 'kick back', '괴수',
                'chu-bura', 'adrenaline', 'rock', 'metal', 'power', 'fire', 'blast', 'shout',
                'battle', 'chouwa', 'overdose', '격정', '폭발', '뜨거워', 'blaze', 'ignition', 'revolution',
                '카르마', 'karma', 'ready to', 'unravel', 'vampire', '우타카타', '괴도', '골리앗', 'goliath',
                '패배자', '로스트원의 호곡', '천본앵', '뇌융해', '멜트다운', '아지랑이 데이즈', '육조 년',
                '롤링걸', 'rolling girl', '월즈 엔드 댄스홀', '신시대', '역광', 'tot musica', '괴수의 꽃노래',
                'black rock shooter', '블랙 록 슈터', '텔레캐스터', 'telecaster', 'monster',
                'bocca della verità', '보카 델라 베리타', '엔비 베이비', 'envy baby', '더블 래리어트', 'double lariat',
                '하우투 세계정복', '아우터 사이언스', '러브 카오틱', '불협화음', '노심융해', '고스트 룰', 'ghost rule',
                '히바나', 'hibana', '판도라', '충동', '질주', '개화', '치사', '괴물', '괴수', 'bloodulator', '통증'
            ],
            exclude_titles: ['점묘', '사요나라', '자장가', '마음악보', 'dear my fairy', '편지', '눈물', '소나기', '취중진담']
        },
        chill: {
            id: 'chill',
            title: '감성힐링',
            icon: '🌙',
            desc: '새벽 감성과 따뜻한 위로를 전하는 잔잔한 발라드',
            keywords: [
                '점묘의 노래', '잿빛과 푸름', '여로', '별자리', '히로인', '그저 네게 맑아라', 'dear my fairy',
                '마음악보', '8.32', 'leo', 'constel', '사요나라', '산호초', 'melt', '야화', '소녀a',
                '호시아이', '마음 예보', '편지', '새벽', '달빛', '눈물', '기억', 'acoustic', 'ballad',
                'snow', '위로', '겨울', '가을', '추억', '개화', '치사',
                '어쿠스틱', '잔잔', '위안', '포근', '소나기', '노스탤지어', 'nostalgia', '꽃길',
                '너에게 닿기를', '바람기억', '눈의 꽃', '취중진담', '야상곡', 'moon', '달밤',
                '그리움', '회상', 'quiet', 'calm', 'peace', 'sleep', 'dream signal',
                '푸른 밤', '새벽달', '플라네타륨', 'planetarium', '첫눈', '너를 보내고', '서른 즈음에',
                '바람이 분다', '안개', '기억을 걷는 시간', '우주 비행사의 노래', '마음', '밤하늘',
                '비와 당신', '비가 내리는 날에는', '소녀', '너의 모든 순간', '스물다섯', '시간을 달리는 소녀'
            ],
            exclude_titles: ['rock', 'metal', 'kick back', '불꽃', 'god-ish', 'king', '신인류', 'hit on shot', 'w●rk', 'apt']
        },
        bright: {
            id: 'bright',
            title: '청량상쾌',
            icon: '☀️',
            desc: '맑고 투명한 청춘 에너지, 밝고 희망찬 멜로디',
            keywords: [
                'milky way', 'stars align', 'our tales', '유성우', 'summertime', '마음 예보', '보석과 어린 용',
                '네가 아니면 안 될 것 같아', '꿈의 신호', '봄꿈', 'step back', '달빛천사', '너의 이름은', 'shine',
                'summer', '청춘', '바다', '하늘', '바람', '햇살', 'smile', '희망',
                'rainbow', 'lulala', 'colorful', 'strokes', 'cliché', '기적', 'fly', '날개', 'sparkle',
                'spring', 'fresh', '푸른 하늘', '초여름', '드라이브', '행복', '설렘', '청량', '청춘가', '상큼',
                'sparkling', 'twinkle', 'starlight', '하늘바라기', '비행기', '여행', 'blue bird',
                '햇살처럼', '너와 나의 이야기', '해피 신디사이저', '푸른 하늘의 랩소디', '스마일', '피크닉', '스파클'
            ],
            exclude_titles: ['dark', 'gloom', '슬픔', '비극', '절망', 'metal', 'doom', '폭발', '우울', '언노운 마더구스']
        },
        groovy: {
            id: 'groovy',
            title: '그루비',
            icon: '🎧',
            desc: '트렌디한 비트와 감각적인 리듬, R&B & 힙합 스타일',
            keywords: [
                'golden', 'apt', 'beyond the way', 'joker', 'w●rk', '야화', 'jane doe', 'lonely universe',
                'getcha', 'trash', '분리수거단', '도쿄 플래시', 'groove', 'r&b', 'funk', 'hip hop', 'hiphop',
                'dance', 'trap', 'bounce', 'city pop', 'club', 'trendy', 'plastic love', 'stay with me',
                'mayonaka no door', 'telecaster b-boy', '스마트폰', 'chupa', '신인류', 'god-ish', '러브 카오틱',
                '리듬', '그루브', '바운스', 'hush trap', 'dancehall', '시티', 'night tempo', 'hype', '미드나잇',
                '찰나', 'city pop', '오버도즈', 'overdose', '루머', 'rumor', '댄스', 'beat'
            ],
            exclude_titles: ['ballad', '자장가', '동요', '어쿠스틱 잔잔', '눈물', '이별', '최종화', 'drivers license']
        },
        cute: {
            id: 'cute',
            title: '큐트',
            icon: '💖',
            desc: '사랑스럽고 통통 튀는 요정들의 깜찍한 보이스',
            keywords: [
                '팝핀 캔디', 'onegai darling', '오네가이 달링', 'chewing luv', '악마가 아닌걸', '네, 기꺼이', '해피 신디사이저',
                '텔레파시', '당신의 연인이 되고 싶어', '쿵쿵', 'booo', 'choco', '초코', '프랑크', 'frank', 'cute',
                'candy', 'sweet', '귀여운', '요정', '하트', 'magic', 'lulala',
                '애교', '발랄', '러블리', '달콤', 'chu', '츄', '냥', '고양이', '토끼',
                'strawberry', '딸기', '케이크', 'pink', '핑크', '슈가', 'sugar', 'marshmallow',
                '스위트', 'maid my way', '애교송', '큐티', '귀여워', '소악마', '마법소녀', '두근두근',
                'berry verry strawberry', '퐁퐁', '냥냥', '달링', '오시노코', '최애의 아이', '아이돌', '사인파'
            ],
            exclude_titles: ['death', 'metal', '비극', '절망', '괴수', '폭발', '격정', '어둠', '록', '사랑해줘']
        }
    };

    let currentMoodSongs = [];
    let currentMoodPreset = null;
    let currentMoodKey = null;

    function getMoodCandidates(moodKey) {
        const preset = MOOD_PRESETS[moodKey];
        if (!preset) return [];
        const all = window.getAllSongs ? window.getAllSongs() : [];
        const scored = [];

        all.forEach(song => {
            if (song.duration && song.duration > 0 && song.duration < 65) return;
            const titleLower = (song.title || '').toLowerCase();
            const fullText = `${titleLower} ${song.artist || ''} ${song.originalArtist || ''} ${song.id || ''}`.toLowerCase();

            if (preset.exclude_titles && preset.exclude_titles.some(ex => titleLower.includes(ex) || fullText.includes(ex))) {
                return;
            }

            let score = 0;
            for (const kw of preset.keywords) {
                if (fullText.includes(kw.toLowerCase())) {
                    score += 5;
                }
            }

            if (score > 0) {
                scored.push({ song, score });
            }
        });

        scored.sort((a, b) => b.score - a.score);
        return scored.map(item => item.song);
    }

    function rollRandomMoodPlaylist(moodKey, count = 20) {
        let pool = getMoodCandidates(moodKey);
        if (!pool || pool.length === 0) {
            const all = window.getAllSongs ? window.getAllSongs() : [];
            pool = all.filter(s => !s.duration || s.duration >= 65);
        }
        if (pool.length === 0) return [];
        const shuffled = [...pool];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(shuffled[i % shuffled.length]);
        }
        return result;
    }

    function renderMoodTrackList() {
        if (!dom.moodModalTrackList) return;
        dom.moodModalTrackList.innerHTML = '';
        if (!currentMoodSongs || currentMoodSongs.length === 0) {
            dom.moodModalTrackList.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">추천할 수 있는 곡이 없습니다.</div>';
            return;
        }

        currentMoodSongs.forEach((song, idx) => {
            const row = document.createElement('div');
            row.className = 'mood-track-row';
            row.dataset.songId = song.id;
            const thumbUrl = `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`;
            const durStr = formatTime(song.duration);

            row.innerHTML = `
                <div class="mood-track-left">
                    <img class="mood-track-thumb" src="${thumbUrl}" alt="${song.title}" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'40\\' height=\\'40\\' viewBox=\\'0 0 24 24\\' fill=\\'%236c5ce7\\'><rect width=\\'24\\' height=\\'24\\' fill=\\'%231e202e\\'/><polygon points=\\'10,8 16,12 10,16\\' fill=\\'%238b5cf6\\'/></svg>'">
                    <div class="mood-track-info">
                        <div class="mood-track-title">${song.title}</div>
                        <div class="mood-track-artist">${song.artist}</div>
                    </div>
                </div>
                <div class="mood-track-right">
                    <span style="font-size:0.8rem; color:var(--text-muted);">${durStr}</span>
                    <button class="btn-icon-action btn-mood-play-single" title="재생">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
                    </button>
                </div>
            `;

            row.addEventListener('click', () => {
                player.setQueue(currentMoodSongs, idx, true);
                showToast(`🎶 '${song.title}' 재생을 시작합니다.`);
                closeMoodModal();
            });

            dom.moodModalTrackList.appendChild(row);
        });
    }

    function openMoodModal(moodKey) {
        const preset = MOOD_PRESETS[moodKey];
        if (!preset) return;
        currentMoodKey = moodKey;
        currentMoodPreset = preset;

        currentMoodSongs = rollRandomMoodPlaylist(moodKey, 20);

        if (dom.moodModalIcon) dom.moodModalIcon.textContent = preset.icon;
        if (dom.moodModalTitle) dom.moodModalTitle.textContent = `${preset.icon} ${preset.title} (${currentMoodSongs.length}곡 추천)`;
        if (dom.moodModalSub) dom.moodModalSub.textContent = `${preset.desc} • 언제든 새로고침으로 새로운 조합을 만날 수 있습니다`;

        renderMoodTrackList();

        if (dom.modalMoodDetail) dom.modalMoodDetail.classList.add('open');
    }

    function closeMoodModal() {
        if (dom.modalMoodDetail) dom.modalMoodDetail.classList.remove('open');
    }

    function initMoodShelf() {
        document.querySelectorAll('.mood-chip-card').forEach(card => {
            card.addEventListener('click', () => {
                const mood = card.dataset.mood;
                openMoodModal(mood);
            });
        });

        if (dom.btnCloseMoodModal) {
            dom.btnCloseMoodModal.addEventListener('click', closeMoodModal);
        }
        if (dom.modalMoodDetail) {
            dom.modalMoodDetail.addEventListener('click', (e) => {
                if (e.target === dom.modalMoodDetail) closeMoodModal();
            });
        }
        if (dom.btnMoodRefresh) {
            dom.btnMoodRefresh.addEventListener('click', () => {
                if (!currentMoodKey) return;
                currentMoodSongs = rollRandomMoodPlaylist(currentMoodKey, 20);
                if (dom.moodModalTitle && currentMoodPreset) {
                    dom.moodModalTitle.textContent = `${currentMoodPreset.icon} ${currentMoodPreset.title} (${currentMoodSongs.length}곡 추천)`;
                }
                renderMoodTrackList();
                showToast(`🔀 새로운 '${currentMoodPreset ? currentMoodPreset.title : '분위기'}' 추천 곡 목록을 불러왔습니다!`);
            });
        }
        if (dom.btnMoodPlayAll) {
            dom.btnMoodPlayAll.addEventListener('click', () => {
                if (!currentMoodSongs || currentMoodSongs.length === 0) return;
                player.setQueue(currentMoodSongs, 0, true);
                showToast(`🎶 '${currentMoodPreset ? currentMoodPreset.title : '분위기'}' ${currentMoodSongs.length}곡을 재생합니다.`);
                closeMoodModal();
            });
        }
        if (dom.btnMoodSavePlaylist) {
            dom.btnMoodSavePlaylist.addEventListener('click', () => {
                if (!currentMoodSongs || currentMoodSongs.length === 0) return;
                const songIds = currentMoodSongs.map(s => s.id);
                openSelectPlaylistModal(songIds);
            });
        }
        let isLoadingMoreMood = false;
        function loadMoreMoodSongs() {
            if (isLoadingMoreMood || !currentMoodKey) return;
            isLoadingMoreMood = true;

            const moreSongs = rollRandomMoodPlaylist(currentMoodKey, 20);
            if (moreSongs.length === 0) {
                isLoadingMoreMood = false;
                return;
            }

            const startIndex = currentMoodSongs.length;
            currentMoodSongs = [...currentMoodSongs, ...moreSongs];

            if (dom.moodModalTitle && currentMoodPreset) {
                dom.moodModalTitle.textContent = `${currentMoodPreset.icon} ${currentMoodPreset.title} (${currentMoodSongs.length}곡 추천)`;
            }

            moreSongs.forEach((song, idx) => {
                const actualIndex = startIndex + idx;
                const row = document.createElement('div');
                row.className = 'mood-track-row';
                row.dataset.songId = song.id;
                const thumbUrl = `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`;
                const durStr = formatTime(song.duration);

                row.innerHTML = `
                    <div class="mood-track-left">
                        <img class="mood-track-thumb" src="${thumbUrl}" alt="${song.title}" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'40\\' height=\\'40\\' viewBox=\\'0 0 24 24\\' fill=\\'%236c5ce7\\'><rect width=\\'24\\' height=\\'24\\' fill=\\'%231e202e\\'/><polygon points=\\'10,8 16,12 10,16\\' fill=\\'%238b5cf6\\'/></svg>'">
                        <div class="mood-track-info">
                            <div class="mood-track-title">${song.title}</div>
                            <div class="mood-track-artist">${song.artist}</div>
                        </div>
                    </div>
                    <div class="mood-track-right">
                        <span style="font-size:0.8rem; color:var(--text-muted);">${durStr}</span>
                        <button class="btn-icon-action btn-mood-play-single" title="재생">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
                        </button>
                    </div>
                `;

                row.addEventListener('click', () => {
                    player.setQueue(currentMoodSongs, actualIndex, true);
                    showToast(`🎶 '${song.title}' 재생을 시작합니다.`);
                    closeMoodModal();
                });

                if (dom.moodModalTrackList) {
                    dom.moodModalTrackList.appendChild(row);
                }
            });

            setTimeout(() => { isLoadingMoreMood = false; }, 300);
        }

        if (dom.moodModalTrackList) {
            dom.moodModalTrackList.addEventListener('scroll', () => {
                const { scrollTop, scrollHeight, clientHeight } = dom.moodModalTrackList;
                if (scrollTop + clientHeight >= scrollHeight - 50) {
                    loadMoreMoodSongs();
                }
            });
        }
    }

    // ===================================================================
    // 3. 한국어 표준 제목 정규화 & 멤버 자동 감지 유틸리티
    // ===================================================================
    function cleanAndKoreanizeTitle(title) {
        if (!title) return '';
        let t = title;
        t = t.replace(/\s*-\s*YouTube$/i, '');

        const nameReplacements = [
            [/\bAiri\s+Kanna\b/gi, '아이리 칸나'],
            [/\bKanna\s+Airi\b/gi, '아이리 칸나'],
            [/\bAyatsuno\s+Yuni\b/gi, '아야츠노 유니'],
            [/\bYuni\s+Ayatsuno\b/gi, '아야츠노 유니'],
            [/\bHoshimiya\s+Huya\b/gi, '호시미야 후야'],
            [/\bSakihane\s+Huya\b/gi, '사키하네 후야'],
            [/\bHuya\s+Sakihane\b/gi, '사키하네 후야'],
            [/\bShirayuki\s+Hina\b/gi, '시라유키 히나'],
            [/\bHina\s+Shirayuki\b/gi, '시라유키 히나'],
            [/\bNeneko\s+Mashiro\b/gi, '네네코 마시로'],
            [/\bMashiro\s+Neneko\b/gi, '네네코 마시로'],
            [/\bAkane\s+Lize\b/gi, '아카네 리제'],
            [/\bLize\s+Akane\b/gi, '아카네 리제'],
            [/\bArahashi\s+Tabi\b/gi, '아라하시 타비'],
            [/\bTabi\s+Arahashi\b/gi, '아라하시 타비'],
            [/\bTenko\s+Shibuki\b/gi, '텐코 시부키'],
            [/\bShibuki\s+Tenko\b/gi, '텐코 시부키'],
            [/\bAokumo\s+Rin\b/gi, '아오쿠모 린'],
            [/\bRin\s+Aokumo\b/gi, '아오쿠모 린'],
            [/\bHanako\s+Nana\b/gi, '하나코 나나'],
            [/\bNana\s+Hanako\b/gi, '하나코 나나'],
            [/\bYuzuha\s+Riko\b/gi, '유즈하 리코'],
            [/\bRiko\s+Yuzuha\b/gi, '유즈하 리코'],
            [/\bStellive\b/gi, '스텔라이브'],
            [/\bMystic\b/gi, '미스틱'],
            [/\bEverlys\b/gi, '에버리스'],
            [/\bUniverse\b/gi, '유니버스'],
            [/\bClich[eé]\b/gi, '클리셰']
        ];

        nameReplacements.forEach(([pattern, kor]) => {
            t = t.replace(pattern, kor);
        });

        if (t.toLowerCase().includes('universe') && (t.toLowerCase().includes('유니버스') || t.trim() === 'Universe')) {
            return 'Universe (유니버스)';
        }

        t = t.replace(/【(?:MV|Music Video|COVER|Cover|커버|스텔라이브|오피셜|공식|4K)[^】]*】/gi, '');
        t = t.replace(/\[(?:MV|Music Video|COVER|Cover|커버|스텔라이브|4K)[^\]]*\]/gi, '');
        t = t.replace(/\s*[/ㅣ|]\s*(?:스텔라이브|클리셰|유니버스|미스틱|에버리스|아이리 칸나|아야츠노 유니|사키하네 후야|시라유키 히나|네네코 마시로|아카네 리제|아라하시 타비|텐코 시부키|아오쿠모 린|하나코 나나|유즈하 리코|cover|Cover|COVER|MV|Music Video|OFFICIAL MV)[\s\S]*$/i, '');
        t = t.replace(/^(?:스텔라이브|클리셰|유니버스|미스틱|에버리스)\s*(?:클리셰|유니버스)?\s*[/ㅣ|: -]\s*/i, '');
        t = t.replace(/^(?:아이리 칸나|아야츠노 유니|사키하네 후야|시라유키 히나|네네코 마시로|아카네 리제|아라하시 타비|텐코 시부키|아오쿠모 린|하나코 나나|유즈하 리코)(?:\s*(?:x|X|&|,)\s*(?:아이리 칸나|아야츠노 유니|사키하네 후야|시라유키 히나|네네코 마시로|아카네 리제|아라하시 타비|텐코 시부키|아오쿠모 린|하나코 나나|유즈하 리코))*\s*[/ㅣ|: -]\s*/i, '');
        t = t.replace(/^['"‘“「『]+|['"’”」』]+$/g, '');

        return t.trim();
    }

    function detectMembersFromText(text) {
        if (!text) return [];
        const t = text.toLowerCase();
        const detected = new Set();

        const rules = [
            { id: 'kanna', keywords: ['칸나', '아이리', 'kanna', 'airi', 'カンナ', '藍莉'] },
            { id: 'yuni', keywords: ['유니', '아야츠노', 'yuni', 'ayatsuno', 'ユニ', '綾津野'] },
            { id: 'huya', keywords: ['후야', '사키하네', '호시미야', 'huya', 'sakihane', 'hoshimiya', 'フヤ', '星宮'] },
            { id: 'hina', keywords: ['히나', '시라유키', 'hina', 'shirayuki', 'ヒナ', '白雪'] },
            { id: 'mashiro', keywords: ['마시로', '네네코', 'mashiro', 'neneko', 'マシロ', '音猫'] },
            { id: 'lize', keywords: ['리제', '아카네', 'lize', 'akane', 'リゼ', '朱音'] },
            { id: 'tabi', keywords: ['타비', '아라하시', 'tabi', 'arahashi', 'タビ', '荒橋'] },
            { id: 'shibuki', keywords: ['시부키', '텐코', 'shibuki', 'tenko', 'シブキ', '天狐'] },
            { id: 'rin', keywords: ['린', '아오쿠모', 'rin', 'aokumo', 'リン', '蒼雲'] },
            { id: 'nana', keywords: ['나나', '하나코', 'nana', 'hanako', 'ナナ', '花子'] },
            { id: 'riko', keywords: ['리코', '유즈하', 'riko', 'yuzuha', 'リコ', '柚葉'] }
        ];

        if (t.includes('스텔라이브') || t.includes('stellive') || t.includes('단체')) {
            detected.add('group');
        }
        if (t.includes('미스틱') || t.includes('mystic')) {
            detected.add('kanna');
            detected.add('yuni');
        }
        if (t.includes('에버리스') || t.includes('everlys') || t.includes("everly's")) {
            detected.add('yuni');
            detected.add('huya');
        }
        if (t.includes('유니버스') || t.includes('universe')) {
            detected.add('hina');
            detected.add('mashiro');
            detected.add('lize');
            detected.add('tabi');
        }
        if (t.includes('클리셰') || t.includes('cliche') || t.includes('cliché')) {
            detected.add('shibuki');
            detected.add('rin');
            detected.add('nana');
            detected.add('riko');
        }

        rules.forEach(rule => {
            for (const kw of rule.keywords) {
                if (t.includes(kw)) {
                    detected.add(rule.id);
                    break;
                }
            }
        });

        return Array.from(detected);
    }

    window.cleanAndKoreanizeTitle = cleanAndKoreanizeTitle;
    window.detectMembersFromText = detectMembersFromText;

    // ===================================================================
    // 4. 트랙 필터링 및 목록 렌더링
    // ===================================================================
    function getFilteredSongs() {
        let songs = window.getAllSongs ? window.getAllSongs() : [];

        // 0. 쇼츠 및 해시태그 영상 원천 배제
        songs = songs.filter(s => {
            const title = s.title || '';
            if (title.includes('#')) return false;
            const tl = title.toLowerCase();
            if (tl.includes('shorts') || tl.includes('#shorts') || tl.includes('chal') || tl.includes('틱톡')) return false;
            if (s.duration && s.duration > 0 && s.duration < 65) return false;
            return true;
        });

        // 1. 뷰 모드별 필터
        if (state.activeView === 'favorites') {
            const favs = window.StorageManager.getFavorites();
            songs = songs.filter(s => favs.includes(s.id));
        } else if (state.activeView === 'playlist' && state.selectedPlaylistId) {
            const playlists = window.StorageManager.getPlaylists();
            const pl = playlists.find(p => p.id === state.selectedPlaylistId);
            if (pl) {
                songs = songs.filter(s => pl.songIds.includes(s.id));
            }
        }

        // 2. 멤버 & 기수 계층형 필터 (대분류 & 소분류)
        if (state.selectedMajor && state.selectedMajor !== 'all') {
            if (state.selectedSub) {
                const sub = state.selectedSub;
                if (sub === 'mystic') {
                    // 미스틱: 칸나 & 유니 전용 곡
                    songs = songs.filter(s => s.members && s.members.includes('kanna') && s.members.includes('yuni') && s.members.length <= 3);
                } else if (sub === 'everlys') {
                    // 에버리스: 유니 & 후야 전용 곡
                    songs = songs.filter(s => s.members && s.members.includes('yuni') && s.members.includes('huya') && s.members.length <= 3);
                } else if (sub === 'universe') {
                    // 2기 단체 전용 (유니버스) - 전체 단체곡 제외
                    songs = songs.filter(s => !isStelliveWholeGroupSong(s) && ((s.gen === 'g2' && (s.artist && (s.artist.includes('유니버스') || s.artist.includes('Universe')))) ||
                        (s.members && ['hina', 'mashiro', 'lize', 'tabi'].every(m => s.members.includes(m)))));
                } else if (sub === 'cliche') {
                    // 3기 단체 전용 (클리셰)
                    songs = songs.filter(s => (s.gen === 'g3' && (s.artist && (s.artist.includes('클리셰') || s.artist.includes('Cliché') || s.artist.includes('Cliche')))) ||
                        (s.members && ['shibuki', 'rin', 'nana', 'riko'].every(m => s.members.includes(m))));
                } else if (sub === 'full-group') {
                    // 스텔라이브 공식 단체곡
                    songs = songs.filter(s => isStelliveWholeGroupSong(s));
                } else if (sub === 'unit') {
                    // 스텔라이브 유닛 & 듀엣곡 (전체 단체곡 제외)
                    songs = songs.filter(s => {
                        if (isStelliveWholeGroupSong(s)) return false;
                        const isMultiArtist = s.artist && (s.artist.includes('&') || s.artist.includes('x') || s.artist.includes('X') || s.artist.includes('feat') || s.artist.includes('Feat') || s.artist.includes('유니버스') || s.artist.includes('클리셰'));
                        const isMultiMember = s.members && s.members.filter(m => m !== 'group').length >= 2;
                        return isMultiArtist || isMultiMember || s.gen === 'group';
                    });
                } else {
                    // 개별 멤버
                    songs = songs.filter(s => s.members && s.members.includes(sub));
                }
            } else {
                // 대분류 전체
                if (state.selectedMajor === 'group') {
                    songs = songs.filter(s => isStelliveWholeGroupSong(s) || s.gen === 'group' || (s.members && s.members.filter(m => m !== 'group').length >= 2) || (s.artist && (s.artist.includes('스텔라이브') || s.artist.includes('유니버스') || s.artist.includes('클리셰') || s.artist.includes('&') || s.artist.includes('x'))));
                } else if (state.selectedMajor === 'g1') {
                    songs = songs.filter(s => (s.members && s.members.some(m => ['kanna', 'yuni', 'huya'].includes(m))) || s.gen === 'g1');
                } else if (state.selectedMajor === 'g2') {
                    songs = songs.filter(s => (s.members && s.members.some(m => ['hina', 'mashiro', 'lize', 'tabi'].includes(m))) || s.gen === 'g2');
                } else if (state.selectedMajor === 'g3') {
                    songs = songs.filter(s => (s.members && s.members.some(m => ['shibuki', 'rin', 'nana', 'riko'].includes(m))) || s.gen === 'g3');
                }
            }
        }

        // 3. 타입 필터 (오리지널 / 커버 / 피처링 / 노래방송)
        if (state.currentFilterType !== 'all') {
            songs = songs.filter(s => s.type === state.currentFilterType);
        }

        // 4. 검색어 필터
        if (state.searchQuery) {
            const q = state.searchQuery.toLowerCase();
            songs = songs.filter(s =>
                s.title.toLowerCase().includes(q) ||
                s.artist.toLowerCase().includes(q) ||
                (s.originalArtist && s.originalArtist.toLowerCase().includes(q)) ||
                (s.streamTitle && s.streamTitle.toLowerCase().includes(q))
            );
        }

        // 5. 정렬 (최신순 / 오래된순 / 곡명순)
        const sortOrder = state.sortOrder || 'latest';
        if (sortOrder === 'latest') {
            songs.sort((a, b) => {
                const dateA = a.publishedAt || a.releaseDate || '';
                const dateB = b.publishedAt || b.releaseDate || '';
                const timeA = dateA ? new Date(dateA).getTime() : (a.addedAt || (a._catalogIndex !== undefined ? a._catalogIndex : 0));
                const timeB = dateB ? new Date(dateB).getTime() : (b.addedAt || (b._catalogIndex !== undefined ? b._catalogIndex : 0));
                if (timeA !== timeB) return timeB - timeA;
                return (b._catalogIndex || 0) - (a._catalogIndex || 0);
            });
        } else if (sortOrder === 'oldest') {
            songs.sort((a, b) => {
                const dateA = a.publishedAt || a.releaseDate || '';
                const dateB = b.publishedAt || b.releaseDate || '';
                const timeA = dateA ? new Date(dateA).getTime() : (a.addedAt || (a._catalogIndex !== undefined ? a._catalogIndex : 0));
                const timeB = dateB ? new Date(dateB).getTime() : (b.addedAt || (b._catalogIndex !== undefined ? b._catalogIndex : 0));
                if (timeA !== timeB) return timeA - timeB;
                return (a._catalogIndex || 0) - (b._catalogIndex || 0);
            });
        } else if (sortOrder === 'title') {
            songs.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'ko'));
        }

        return songs;
    }

    // ===================================================================
    // 다중 선택 상태 및 플로팅 액션 바 제어
    // ===================================================================
    const selectedSongIds = new Set();
    let isMultiSelectMode = false;

    function toggleMultiSelectMode() {
        isMultiSelectMode = !isMultiSelectMode;
        const btn = document.getElementById('btn-toggle-multiselect');
        if (btn) btn.classList.toggle('active', isMultiSelectMode);
        document.body.classList.toggle('multiselect-active', isMultiSelectMode);

        if (isMultiSelectMode) {
            updateMultiSelectUI();
        } else {
            clearSongSelection();
        }
    }

    function toggleSongSelection(songId, isSelected) {
        if (isSelected) {
            selectedSongIds.add(songId);
        } else {
            selectedSongIds.delete(songId);
        }
        updateMultiSelectUI();
    }

    function clearSongSelection() {
        selectedSongIds.clear();
        isMultiSelectMode = false;
        updateMultiSelectUI();
        document.querySelectorAll('.track-select-chk').forEach(chk => { chk.checked = false; });
        document.querySelectorAll('.track-row.selected').forEach(row => { row.classList.remove('selected'); });
    }

    function updateMultiSelectUI() {
        const count = selectedSongIds.size;
        const bar = document.getElementById('multiselect-action-bar');
        const badge = document.getElementById('multiselect-count-badge');
        const btn = document.getElementById('btn-toggle-multiselect');

        if (isMultiSelectMode || count > 0) {
            if (bar) bar.style.display = 'flex';
            if (badge) badge.textContent = `${count}곡 선택됨`;
            document.body.classList.add('multiselect-active');
            if (btn) btn.classList.add('active');
        } else {
            if (bar) bar.style.display = 'none';
            document.body.classList.remove('multiselect-active');
            if (btn) btn.classList.remove('active');
        }
    }

    function refreshTrackList() {
        const songs = getFilteredSongs();
        if (dom.trackCountText) {
            dom.trackCountText.textContent = `총 ${songs.length}곡`;
        }

        if (songs.length === 0) {
            dom.tracksListContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                    </div>
                    <h3>해당 조건의 곡이 없습니다</h3>
                    <p>검색어나 필터를 변경하거나 우측 상단에서 신곡을 직접 추가해보세요!</p>
                </div>
            `;
            return;
        }

        const customSabis = window.StorageManager ? window.StorageManager.getCustomSabis() : {};

        let html = `
            <div class="tracks-table-header">
                <div>#</div>
                <div>곡 정보</div>
                <div>유형</div>
                <div class="track-col-sabi">사비(후렴구)</div>
                <div>재생시간</div>
                <div style="text-align: right;">퀵 액션</div>
            </div>
        `;

        songs.forEach((song, index) => {
            const isPlayingThis = player.currentSong?.id === song.id && player.isPlaying;
            const isCurrent = player.currentSong?.id === song.id;
            const thumbUrl = `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`;
            const durationStr = formatTime(song.duration);

            const isCustomSabi = !!customSabis[song.id];
            const effectiveSabi = customSabis[song.id] || song.sabi;
            const sabiStr = effectiveSabi ? `${formatTime(effectiveSabi.start)} ~ ${formatTime(effectiveSabi.end)}` : '전체';

            let badgeClass = 'badge-cover';
            let badgeText = '커버곡';
            if (song.type === 'original') {
                badgeClass = 'badge-original';
                badgeText = '오리지널';
            } else if (song.type === 'featuring') {
                badgeClass = 'badge-featuring';
                badgeText = '피처링 & OST';
            } else if (song.type === 'stream') {
                badgeClass = 'badge-stream';
                badgeText = '노래방송 Live';
            }

            const isSelected = selectedSongIds.has(song.id);

            html += `
                <div class="track-row ${isCurrent ? 'active' : ''} ${isPlayingThis ? 'playing' : ''} ${isSelected ? 'selected' : ''}" data-song-id="${song.id}" data-index="${index}">
                    <div class="track-col-index">
                        <input type="checkbox" class="track-select-chk" data-song-id="${song.id}" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation();">
                        <span class="track-number">${String(index + 1).padStart(2, '0')}</span>
                        <div class="track-playing-equalizer">
                            <span class="eq-bar"></span>
                            <span class="eq-bar"></span>
                            <span class="eq-bar"></span>
                        </div>
                    </div>
                    <div class="track-col-info">
                        <div class="track-thumb-box">
                            <img class="track-thumb-img" src="${thumbUrl}" alt="${song.title}" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'46\' height=\'46\' viewBox=\'0 0 24 24\' fill=\'%236c5ce7\'><rect width=\'24\' height=\'24\' fill=\'%231e202e\'/><polygon points=\'10,8 16,12 10,16\' fill=\'%238b5cf6\'/></svg>'">
                            <div class="track-thumb-play-overlay">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
                            </div>
                        </div>
                        <div class="track-title-meta">
                            <span class="track-title-text">${song.title}</span>
                            <span class="track-artist-text">${song.artist}</span>
                        </div>
                    </div>
                    <div>
                        ${song.isAutoAdded ? '<span class="badge-tag badge-new" style="margin-right: 4px;">NEW</span>' : ''}
                        <span class="badge-tag ${badgeClass}">
                            ${badgeText}
                        </span>
                    </div>
                    <div class="track-col-sabi" data-id="${song.id}" style="cursor: pointer;" title="클릭하여 사비(후렴구) 구간 편집">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                        </svg>
                        <span>${sabiStr}</span>
                        ${isCustomSabi ? '<span class="track-sabi-custom-tag">MY</span>' : ''}
                    </div>
                    <div class="track-col-duration">${durationStr}</div>
                    <div class="track-col-actions" onclick="event.stopPropagation();">
                        <button class="btn-icon-action btn-add-queue" data-id="${song.id}" title="대기열 다음 곡으로 추가">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        </button>
                        <button class="btn-icon-action btn-add-pl" data-id="${song.id}" title="플레이리스트에 담기">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                            </svg>
                        </button>
                        <button class="btn-icon-action btn-edit-sabi" data-id="${song.id}" title="사비(후렴구) 구간 편집">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fb923c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                            </svg>
                        </button>
                        <button class="btn-icon-action btn-edit-song" data-id="${song.id}" title="곡 정보 직접 수정">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        });

        dom.tracksListContainer.innerHTML = html;

        // 트랙 행 클릭 이벤트 (재생 또는 선택 모드 시 선택)
        dom.tracksListContainer.querySelectorAll('.track-row').forEach(row => {
            row.addEventListener('click', () => {
                if (isMultiSelectMode) {
                    const songId = row.dataset.songId;
                    const chk = row.querySelector('.track-select-chk');
                    const newState = !selectedSongIds.has(songId);
                    if (chk) chk.checked = newState;
                    toggleSongSelection(songId, newState);
                    row.classList.toggle('selected', newState);
                    return;
                }
                const songId = row.dataset.songId;
                const clickedSong = songs.find(s => s.id === songId);
                if (clickedSong) {
                    player.setQueue(songs, parseInt(row.dataset.index, 10), true);
                    if (clickedSong.members && clickedSong.members[0]) {
                        applyMemberTheme(clickedSong.members[0]);
                    }
                }
            });
        });

        // 다중 선택 체크박스 변경
        dom.tracksListContainer.querySelectorAll('.track-select-chk').forEach(chk => {
            chk.addEventListener('change', () => {
                const songId = chk.dataset.songId;
                toggleSongSelection(songId, chk.checked);
                const row = chk.closest('.track-row');
                if (row) row.classList.toggle('selected', chk.checked);
            });
        });

        // 1클릭 대기열 추가 버튼
        dom.tracksListContainer.querySelectorAll('.btn-add-queue').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const songId = btn.dataset.id;
                const songToAdd = songs.find(s => s.id === songId);
                if (songToAdd) {
                    player.addToQueueNext(songToAdd);
                    showToast(`[${songToAdd.title}] 다음 재생 대기열에 추가되었습니다!`);
                }
            });
        });

        // 플레이리스트 추가 버튼
        dom.tracksListContainer.querySelectorAll('.btn-add-pl').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const songId = btn.dataset.id;
                openSelectPlaylistModal([songId]);
            });
        });

        // 사비 편집 모달 버튼 (컬럼 또는 아이콘 버튼)
        dom.tracksListContainer.querySelectorAll('.track-col-sabi, .btn-edit-sabi').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const songId = el.dataset.id;
                const song = songs.find(s => s.id === songId);
                if (song) openSabiEditor(song);
            });
        });

        // 곡 정보 직접 수정 버튼
        dom.tracksListContainer.querySelectorAll('.btn-edit-song').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditSongModal(btn.dataset.id);
            });
        });

        if (window.syncHomeTopScrollbar) {
            setTimeout(window.syncHomeTopScrollbar, 20);
        }
    }

    // ===================================================================
    // 3. 플레이어 UI 업데이트 및 이벤트 연동
    // ===================================================================
    function updatePlayerUIState() {
        const song = player.currentSong;
        if (!song) return;

        const thumbUrl = `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`;
        dom.miniThumb.src = thumbUrl;
        dom.miniTitle.textContent = song.title;
        dom.miniArtist.textContent = song.artist;
        dom.totalDurationText.textContent = formatTime(song.duration);

        // 전체 플레이어
        dom.fullTrackTitle.textContent = song.title;
        dom.fullTrackArtist.textContent = `${song.artist} • ${song.originalArtist || '스텔라이브'}`;
        dom.fullAlbumImg.src = thumbUrl;

        // 사비 모드 마커 시크바 표시
        const customSabis = window.StorageManager ? window.StorageManager.getCustomSabis() : {};
        const effectiveSabi = customSabis[song.id] || song.sabi;

        if (effectiveSabi && song.duration > 0) {
            const startPct = (effectiveSabi.start / song.duration) * 100;
            const widthPct = ((effectiveSabi.end - effectiveSabi.start) / song.duration) * 100;
            dom.progressSabiMarker.style.left = `${startPct}%`;
            dom.progressSabiMarker.style.width = `${widthPct}%`;
            dom.progressSabiMarker.style.display = 'block';
        } else {
            dom.progressSabiMarker.style.display = 'none';
        }

        // 대기열 UI 갱신
        renderQueue();

        // 버튼 상태 갱신
        updatePlayPauseButtons();
        updateSabiButtons();
        updateShuffleRepeatButtons();
    }

    function updatePlayPauseButtons() {
        if (player.isPlaying) {
            dom.miniPlayBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                </svg>
            `;
        } else {
            dom.miniPlayBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="6 4 20 12 6 20 6 4"/>
                </svg>
            `;
        }
        dom.fullPlayerModal.classList.toggle('playing', player.isPlaying);
        refreshTrackListRowActive();
    }

    function updateSabiButtons() {
        const active = player.sabiMode;
        dom.miniSabiBtn.classList.toggle('active', active);
        dom.sabiQuickToggle.classList.toggle('active', active);
        dom.heroSabiBtn.classList.toggle('active', active);

        const flameSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
        dom.sabiQuickToggle.innerHTML = active ? `${flameSvg}<span>사비 모드 ON</span>` : `${flameSvg}<span>사비 메들리</span>`;
        dom.fullSabiIndicator.style.display = active ? 'flex' : 'none';
    }

    function updateShuffleRepeatButtons() {
        dom.miniShuffleBtn.classList.toggle('active', player.isShuffle);
        dom.miniRepeatBtn.classList.toggle('active', player.repeatMode !== 'off');

        if (player.repeatMode === 'one') {
            dom.miniRepeatBtn.title = '1곡 반복 모드 (단축키: R)';
            dom.miniRepeatBtn.innerHTML = `
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                    <text x="12" y="15" font-size="8" font-weight="bold" fill="currentColor" text-anchor="middle" stroke="none">1</text>
                </svg>
            `;
        } else {
            dom.miniRepeatBtn.title = player.repeatMode === 'all' ? '전체 반복 (단축키: R)' : '반복 끄기 (단축키: R)';
            dom.miniRepeatBtn.innerHTML = `
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                </svg>
            `;
        }
    }

    function refreshTrackListRowActive() {
        document.querySelectorAll('.track-row').forEach(row => {
            const isCurrent = row.dataset.songId === player.currentSong?.id;
            row.classList.toggle('active', isCurrent);
            row.classList.toggle('playing', isCurrent && player.isPlaying);
        });
    }

    // ===================================================================
    // 현재 재생목록 (대기열 / Queue) 렌더링 및 조작
    // ===================================================================
    function renderQueue() {
        const queue = player.queue || [];
        const curIdx = player.currentIndex;

        if (dom.fullQueueCount) dom.fullQueueCount.textContent = `총 ${queue.length}곡`;
        if (dom.drawerQueueCount) dom.drawerQueueCount.textContent = `${queue.length}곡`;
        if (dom.queueBadgeCount) dom.queueBadgeCount.textContent = `${queue.length}`;

        if (queue.length === 0) {
            const emptyHtml = '<div class="empty-state" style="padding: 36px 12px;"><div class="empty-state-icon" style="font-size:2rem;">📋</div><p>대기열이 비어있습니다.</p></div>';
            if (dom.fullQueueList) dom.fullQueueList.innerHTML = emptyHtml;
            if (dom.drawerQueueList) dom.drawerQueueList.innerHTML = emptyHtml;
            return;
        }

        const buildQueueHtml = (isFullQueue = false) => {
            return queue.map((song, idx) => {
                const isCurrent = idx === curIdx;
                const isPrev = idx < curIdx;
                const isNext = idx === curIdx + 1;
                const isSelected = isFullQueue && state.selectedQueueIndices.has(idx);

                let tagHtml = '';
                if (isCurrent) {
                    tagHtml = `<span class="queue-item-status-tag status-playing">
                        <span class="eq-bar" style="height:8px;"></span>
                        <span>재생 중</span>
                    </span>`;
                } else if (isNext) {
                    tagHtml = `<span class="queue-item-status-tag status-next">다음 곡</span>`;
                } else if (isPrev) {
                    tagHtml = `<span class="queue-item-status-tag status-prev">이전</span>`;
                }

                const thumbUrl = `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`;

                return `
                    <div class="queue-item ${isCurrent ? 'active' : ''} ${isSelected ? 'selected' : ''}" data-index="${idx}">
                        <div class="queue-item-left">
                            ${isFullQueue ? `<input type="checkbox" class="queue-select-chk" data-index="${idx}" ${isSelected ? 'checked' : ''}>` : ''}
                            <span class="queue-item-index">${idx + 1}</span>
                            <img class="queue-item-thumb" src="${thumbUrl}" alt="썸네일" loading="lazy">
                            <div class="queue-item-meta">
                                <div class="queue-item-title-row">
                                    <span class="queue-item-title" title="${song.title}">${song.title}</span>
                                    ${tagHtml}
                                </div>
                                <span class="queue-item-artist">${song.artist}</span>
                            </div>
                        </div>
                        <div class="queue-item-actions" onclick="event.stopPropagation();">
                            <button class="queue-btn-remove btn-queue-del" data-index="${idx}" title="대기열에서 제거">✕</button>
                            <div class="queue-handle" data-index="${idx}" draggable="true" title="핸들을 잡고 드래그하여 순서 변경">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        };

        if (dom.fullQueueList) dom.fullQueueList.innerHTML = buildQueueHtml(true);
        if (dom.drawerQueueList) dom.drawerQueueList.innerHTML = buildQueueHtml(false);

        const attachQueueListeners = (container) => {
            if (!container) return;

            // 클릭 시 해당 트랙 재생 혹은 대기열 선택 모드일 때 선택 토글
            container.querySelectorAll('.queue-item').forEach(item => {
                const idx = parseInt(item.dataset.index, 10);
                const leftArea = item.querySelector('.queue-item-left');

                const handleItemClick = (e) => {
                    if (container === dom.fullQueueList && state.isQueueSelectMode) {
                        e.stopPropagation();
                        toggleQueueItemSelect(idx);
                        return;
                    }
                    player.playQueueIndex(idx);
                };

                if (leftArea) {
                    leftArea.addEventListener('click', handleItemClick);
                } else {
                    item.addEventListener('click', handleItemClick);
                }

                // 체크박스 클릭
                const chk = item.querySelector('.queue-select-chk');
                if (chk) {
                    chk.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });
                    chk.addEventListener('change', (e) => {
                        e.stopPropagation();
                        toggleQueueItemSelect(idx, chk.checked);
                    });
                }
            });

            // 마우스 드래그앤드롭(Drag & Drop) 순서 실시간 재배치 (핸들 ☰ 전용)
            container.querySelectorAll('.queue-item').forEach(item => {
                const handle = item.querySelector('.queue-handle');
                if (handle) {
                    handle.setAttribute('draggable', 'true');

                    handle.addEventListener('dragstart', (e) => {
                        const fromIdx = parseInt(item.dataset.index, 10);
                        item.classList.add('dragging');
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', String(fromIdx));
                    });

                    handle.addEventListener('dragend', () => {
                        container.querySelectorAll('.queue-item').forEach(el => {
                            el.classList.remove('drag-over-top', 'drag-over-bottom', 'dragging');
                        });
                    });
                }

                item.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    const rect = item.getBoundingClientRect();
                    const midY = rect.top + rect.height / 2;
                    if (e.clientY < midY) {
                        item.classList.add('drag-over-top');
                        item.classList.remove('drag-over-bottom');
                    } else {
                        item.classList.add('drag-over-bottom');
                        item.classList.remove('drag-over-top');
                    }
                });

                item.addEventListener('dragleave', () => {
                    item.classList.remove('drag-over-top', 'drag-over-bottom');
                });

                item.addEventListener('drop', (e) => {
                    e.preventDefault();
                    item.classList.remove('drag-over-top', 'drag-over-bottom');
                    const toIdx = parseInt(item.dataset.index, 10);
                    const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);

                    if (!isNaN(fromIdx) && !isNaN(toIdx) && fromIdx !== toIdx) {
                        player.moveQueueItem(fromIdx, toIdx);
                    }
                });
            });

            // 개별 삭제 버튼
            container.querySelectorAll('.btn-queue-del').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = parseInt(btn.dataset.index, 10);
                    player.removeFromQueue(idx);
                });
            });
        };

        attachQueueListeners(dom.fullQueueList);
        attachQueueListeners(dom.drawerQueueList);

        // 재생 중인 트랙으로 스크롤
        if (dom.fullQueueList) {
            const activeFull = dom.fullQueueList.querySelector('.queue-item.active');
            if (activeFull) activeFull.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (dom.drawerQueueList) {
            const activeDrawer = dom.drawerQueueList.querySelector('.queue-item.active');
            if (activeDrawer) activeDrawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function toggleQueueItemSelect(idx, force) {
        if (typeof force === 'boolean') {
            if (force) state.selectedQueueIndices.add(idx);
            else state.selectedQueueIndices.delete(idx);
        } else {
            if (state.selectedQueueIndices.has(idx)) {
                state.selectedQueueIndices.delete(idx);
            } else {
                state.selectedQueueIndices.add(idx);
            }
        }
        updateQueueSelectCount();
        if (dom.fullQueueList) {
            const item = dom.fullQueueList.querySelector(`.queue-item[data-index="${idx}"]`);
            if (item) {
                const isSel = state.selectedQueueIndices.has(idx);
                item.classList.toggle('selected', isSel);
                const chk = item.querySelector('.queue-select-chk');
                if (chk) chk.checked = isSel;
            }
        }
    }

    function updateQueueSelectCount() {
        if (dom.fullQueueSelectCount) {
            dom.fullQueueSelectCount.textContent = `${state.selectedQueueIndices.size}곡 선택됨`;
        }
    }

    function toggleQueueSelectMode(force) {
        const nextMode = (typeof force === 'boolean') ? force : !state.isQueueSelectMode;
        state.isQueueSelectMode = nextMode;
        if (dom.fullQueuePanel) {
            dom.fullQueuePanel.classList.toggle('queue-select-active', nextMode);
        }
        if (dom.btnFullQueueSelectMode) {
            dom.btnFullQueueSelectMode.classList.toggle('active', nextMode);
        }
        if (dom.fullQueueSelectBar) {
            dom.fullQueueSelectBar.style.display = nextMode ? 'flex' : 'none';
        }
        if (!nextMode) {
            state.selectedQueueIndices.clear();
        }
        updateQueueSelectCount();
        updateQueueUI();
    }

    function openQueueDrawer() {
        if (dom.queueDrawer) dom.queueDrawer.classList.add('open');
        if (dom.queueDrawerBackdrop) dom.queueDrawerBackdrop.classList.add('open');
        if (dom.btnToggleQueueDrawer) dom.btnToggleQueueDrawer.classList.add('active');
        renderQueue();
    }

    function closeQueueDrawer() {
        if (dom.queueDrawer) dom.queueDrawer.classList.remove('open');
        if (dom.queueDrawerBackdrop) dom.queueDrawerBackdrop.classList.remove('open');
        if (dom.btnToggleQueueDrawer) dom.btnToggleQueueDrawer.classList.remove('active');
    }

    function toggleQueueDrawer() {
        if (dom.queueDrawer && dom.queueDrawer.classList.contains('open')) {
            closeQueueDrawer();
        } else {
            openQueueDrawer();
        }
    }

    // ===================================================================
    // 4. 이벤트 리스너 바인딩
    // ===================================================================
    function bindEvents() {
        // 플레이어 제어 버튼
        dom.miniPlayBtn.addEventListener('click', () => player.togglePlay());
        dom.miniPrevBtn.addEventListener('click', () => player.playPrev());
        dom.miniNextBtn.addEventListener('click', () => player.playNext());
        dom.miniShuffleBtn.addEventListener('click', () => player.toggleShuffle());
        dom.miniRepeatBtn.addEventListener('click', () => player.toggleRepeat());

        // 사비 메들리 모드 토글
        const toggleSabi = () => {
            player.toggleSabiMode();
            showToast(player.sabiMode
                ? '사비 메들리 ON: 곡들의 하이라이트만 연속 재생합니다!'
                : '사비 메들리가 해제되어 전곡 재생 모드로 전환되었습니다.'
            );
        };
        dom.miniSabiBtn.addEventListener('click', toggleSabi);
        dom.sabiQuickToggle.addEventListener('click', toggleSabi);
        dom.heroSabiBtn.addEventListener('click', toggleSabi);

        // 실시간 사용자 맞춤 사비 지정 핀 버튼
        if (dom.miniSabiPinBtn) {
            dom.miniSabiPinBtn.addEventListener('click', () => {
                if (!player.currentSong) {
                    showToast('먼저 곡을 재생해주세요!');
                    return;
                }
                const newSabi = player.pinCurrentAsSabi();
                if (newSabi) {
                    dom.miniSabiPinBtn.classList.add('pinned');
                    setTimeout(() => dom.miniSabiPinBtn.classList.remove('pinned'), 1500);
                    showToast(`📍 [${player.currentSong.title}] 사비 구간이 ${formatTime(newSabi.start)} ~ ${formatTime(newSabi.end)} 로 지정되었습니다!`);
                    updatePlayerUIState();
                    refreshTrackList();
                }
            });
        }

        // 멤버 라디오 무한 스트리밍 재생
        if (dom.btnMemberRadio) {
            dom.btnMemberRadio.addEventListener('click', () => {
                player.startRadio(state.currentFilterMember);
                const member = window.MEMBERS[state.currentFilterMember];
                const name = member?.name || '스텔라이브 전곡';
                showToast(`${name} 무한 라디오 믹스를 시작합니다!`);
            });
        }

        // 히어로 배너 전체 재생 버튼
        dom.heroPlayAllBtn.addEventListener('click', () => {
            const songs = getFilteredSongs();
            if (songs.length > 0) {
                player.setQueue(songs, 0, true);
                showToast(`총 ${songs.length}곡 재생을 시작합니다.`);
            }
        });

        // 시크바 인터랙션 (클릭 및 드래그 탐색 지원)
        let isScrubbingProgress = false;
        const setupScrubbing = (container, isMini = false) => {
            if (!container) return;
            let isDragging = false;

            const updateSeekFromEvent = (e, commit = false) => {
                const rect = container.getBoundingClientRect();
                if (rect.width <= 0) return;
                const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const duration = player.getDuration();
                const seekTime = duration * pos;

                // UI 실시간 반응 (드래그 중 매끄러운 진행바 및 시간 표시)
                if (dom.progressBarFill) dom.progressBarFill.style.width = `${pos * 100}%`;
                if (dom.miniProgressBar) dom.miniProgressBar.style.width = `${pos * 100}%`;
                if (!isMini && dom.currentTimeText) {
                    dom.currentTimeText.textContent = formatTime(seekTime);
                }

                if (commit) {
                    player.seekTo(seekTime);
                }
            };

            container.addEventListener('pointerdown', (e) => {
                if (e.button !== 0) return;
                isDragging = true;
                isScrubbingProgress = true;
                try {
                    container.setPointerCapture(e.pointerId);
                } catch (_) {}
                updateSeekFromEvent(e, false);
            });

            container.addEventListener('pointermove', (e) => {
                if (!isDragging) return;
                updateSeekFromEvent(e, false);
            });

            const handlePointerUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                isScrubbingProgress = false;
                try {
                    container.releasePointerCapture(e.pointerId);
                } catch (_) {}
                updateSeekFromEvent(e, true);
            };

            container.addEventListener('pointerup', handlePointerUp);
            container.addEventListener('pointercancel', handlePointerUp);
        };

        setupScrubbing(dom.progressSliderContainer, false);
        setupScrubbing(dom.miniProgressTrack, true);

        // 볼륨 & 음소거
        dom.volumeSlider.value = player.volume;
        dom.volumeSlider.addEventListener('input', (e) => {
            player.setVolume(parseInt(e.target.value, 10));
        });

        const updateMuteIcon = () => {
            dom.muteBtn.innerHTML = player.isMuted
                ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 .5 6.07"/></svg>`
                : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
        };

        dom.muteBtn.addEventListener('click', () => {
            player.toggleMute();
            updateMuteIcon();
        });

        // 전체화면 플레이어 열기/닫기 (토글 지원 & 좌측 곡 정보 영역 버블링 방지)
        if (dom.miniPlayerLeft) {
            dom.miniPlayerLeft.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFullPlayer();
            });
        }
        if (dom.openFullPlayerBtn) {
            dom.openFullPlayerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFullPlayer();
            });
        }
        if (dom.btnCloseFull) {
            dom.btnCloseFull.addEventListener('click', (e) => {
                e.stopPropagation();
                closeFullPlayer();
            });
        }

        // 미니 플레이어 바 빈 공간 클릭 시 전체화면 플레이어 토글 (요구사항 8)
        if (dom.miniPlayerBar) {
            dom.miniPlayerBar.addEventListener('click', (e) => {
                if (e.target.closest('button, input, a, .progress-slider-container, .player-progress-row, .volume-control-wrapper, #mini-player-left')) {
                    return;
                }
                toggleFullPlayer();
            });
        }

        // 전체화면 플레이어 빈 공간 아래로 드래그 시 닫기 제스처
        if (dom.fullPlayerModal) {
            let touchStartY = 0;
            let isDragging = false;
            dom.fullPlayerModal.addEventListener('touchstart', (e) => {
                if (e.target.closest('button, input, select, textarea, a, .queue-handle, iframe, #youtube-player-embed')) return;
                touchStartY = e.touches[0].clientY;
                isDragging = false;
            }, { passive: true });

            dom.fullPlayerModal.addEventListener('touchmove', (e) => {
                const currentY = e.touches[0].clientY;
                if (currentY - touchStartY > 60) {
                    isDragging = true;
                }
            }, { passive: true });

            dom.fullPlayerModal.addEventListener('touchend', () => {
                if (isDragging) {
                    closeFullPlayer();
                    isDragging = false;
                }
            });

            let mouseStartY = 0;
            let isMouseDown = false;
            let canDragModal = false;

            dom.fullPlayerModal.addEventListener('mousedown', (e) => {
                if (e.target.closest('button, input, select, textarea, a, .queue-handle, iframe, #youtube-player-embed')) return;
                if (e.target.closest('.full-queue-list') && e.target.closest('.queue-item')) return;
                mouseStartY = e.clientY;
                isMouseDown = true;
                canDragModal = true;
            });

            window.addEventListener('mousemove', (e) => {
                if (!isMouseDown || !canDragModal) return;
                if (e.clientY - mouseStartY > 70) {
                    closeFullPlayer();
                    isMouseDown = false;
                    canDragModal = false;
                }
            });

            window.addEventListener('mouseup', () => {
                isMouseDown = false;
                canDragModal = false;
            });
        }

        function updateFullPlayerQueueToggleBtn() {
            if (!dom.fullPlayerModal) return;
            const isHidden = dom.fullPlayerModal.classList.contains('hide-queue');
            if (dom.btnFullToggleQueue) {
                dom.btnFullToggleQueue.title = isHidden ? '재생목록 표시' : '재생목록 숨기기';
                dom.btnFullToggleQueue.classList.toggle('active', isHidden);
            }
            if (dom.btnToggleQueueDrawer) {
                dom.btnToggleQueueDrawer.classList.toggle('active', !isHidden);
            }
        }

        // 대기열 버튼 (메인화면: 서랍 토글 / 재생창: 대기열 패널 온오프 토글)
        if (dom.btnToggleQueueDrawer) {
            dom.btnToggleQueueDrawer.addEventListener('click', () => {
                if (dom.fullPlayerModal && dom.fullPlayerModal.classList.contains('open')) {
                    dom.fullPlayerModal.classList.toggle('hide-queue');
                    updateFullPlayerQueueToggleBtn();
                } else {
                    toggleQueueDrawer();
                }
            });
        }
        if (dom.btnFullToggleQueue) {
            dom.btnFullToggleQueue.addEventListener('click', (e) => {
                e.stopPropagation();
                dom.fullPlayerModal.classList.toggle('hide-queue');
                updateFullPlayerQueueToggleBtn();
            });
        }
        if (dom.btnCloseDrawer) {
            dom.btnCloseDrawer.addEventListener('click', () => closeQueueDrawer());
        }
        if (dom.queueDrawerBackdrop) {
            dom.queueDrawerBackdrop.addEventListener('click', () => closeQueueDrawer());
        }
        if (dom.btnClearQueue) {
            dom.btnClearQueue.addEventListener('click', () => {
                player.clearQueue();
                showToast('현재 재생 곡을 제외한 대기열이 비워졌습니다.');
            });
        }
        if (dom.btnDrawerClear) {
            dom.btnDrawerClear.addEventListener('click', () => {
                player.clearQueue();
                showToast('현재 재생 곡을 제외한 대기열이 비워졌습니다.');
            });
        }

        // 비디오 모드 vs 앨범 아트 모드 전환
        dom.btnViewArt.addEventListener('click', () => switchFullPlayerView('art'));
        dom.btnViewVideo.addEventListener('click', () => switchFullPlayerView('video'));
        if (dom.btnVideoFullscreen) {
            dom.btnVideoFullscreen.addEventListener('click', () => {
                const wrap = document.getElementById('pc-youtube-player-wrap');
                if (!wrap) return;
                if (!document.fullscreenElement) {
                    wrap.requestFullscreen().catch(e => console.warn(e));
                } else {
                    document.exitFullscreen().catch(e => console.warn(e));
                }
            });
        }
        window.addEventListener('resize', updatePcDockPosition);
        window.addEventListener('scroll', updatePcDockPosition);

        // 검색 (150ms 디바운스로 UI 렌더링 부하 최적화)
        let pcSearchDebounceTimer = null;
        dom.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            dom.searchClearBtn.style.display = query ? 'block' : 'none';
            clearTimeout(pcSearchDebounceTimer);
            pcSearchDebounceTimer = setTimeout(() => {
                state.searchQuery = query;
                refreshTrackList();
            }, 150);
        });
        dom.searchClearBtn.addEventListener('click', () => {
            dom.searchInput.value = '';
            state.searchQuery = '';
            dom.searchClearBtn.style.display = 'none';
            refreshTrackList();
        });

        // 곡 유형 필터 (전체 / 오리지널 / 커버 / 피처링 / 노래방송)
        dom.typeFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                dom.typeFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.currentFilterType = btn.dataset.type;
                refreshTrackList();
            });
        });

        // 정렬 드롭다운 & 랜덤 셔플 재생
        if (dom.sortOrderSelect) {
            dom.sortOrderSelect.addEventListener('change', (e) => {
                state.sortOrder = e.target.value;
                refreshTrackList();
            });
        }

        if (dom.btnShufflePlay) {
            dom.btnShufflePlay.addEventListener('click', () => {
                const songs = getFilteredSongs();
                if (!songs || songs.length === 0) {
                    showToast('재생할 곡이 없습니다.');
                    return;
                }
                const shuffled = [...songs];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                player.setQueue(shuffled, 0, true);
                showToast(`🔀 ${shuffled.length}곡을 랜덤 재생합니다.`);
            });
        }

        // 사이드바 네비게이션
        if (dom.navHome) {
            dom.navHome.addEventListener('click', () => {
                if (state.activeView === 'home') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    switchNavView('home', dom.navHome);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }
        if (dom.navPlaylists) dom.navPlaylists.addEventListener('click', () => switchNavView('playlists', dom.navPlaylists));
        if (dom.navSettings) dom.navSettings.addEventListener('click', () => switchNavView('settings', dom.navSettings));

        // 선택 모드 토글 버튼
        const btnToggleMulti = document.getElementById('btn-toggle-multiselect');
        if (btnToggleMulti) {
            btnToggleMulti.addEventListener('click', () => {
                toggleMultiSelectMode();
            });
        }

        // 다중 선택 하단 플로팅 바 버튼들
        const btnMultiPlay = document.getElementById('btn-multiselect-play');
        if (btnMultiPlay) {
            btnMultiPlay.addEventListener('click', () => {
                const allSongs = window.getAllSongs ? window.getAllSongs() : [];
                const toPlay = allSongs.filter(s => selectedSongIds.has(s.id));
                if (toPlay.length > 0) {
                    player.setQueue(toPlay, 0, true);
                    showToast(`${toPlay.length}곡 재생을 시작합니다.`);
                    clearSongSelection();
                }
            });
        }

        const btnMultiAddPl = document.getElementById('btn-multiselect-add-pl');
        if (btnMultiAddPl) {
            btnMultiAddPl.addEventListener('click', () => {
                if (selectedSongIds.size === 0) return;
                openSelectPlaylistModal(Array.from(selectedSongIds));
            });
        }

        const btnMultiCancel = document.getElementById('btn-multiselect-cancel');
        if (btnMultiCancel) {
            btnMultiCancel.addEventListener('click', () => {
                clearSongSelection();
            });
        }

        // 영상 모드 전체화면 버튼 (요구사항 4)
        if (dom.btnVideoFullscreen) {
            dom.btnVideoFullscreen.addEventListener('click', (e) => {
                e.stopPropagation();
                const container = dom.fullVideoContainer;
                if (!container) return;
                if (document.fullscreenElement) {
                    if (document.exitFullscreen) document.exitFullscreen();
                } else {
                    if (container.requestFullscreen) {
                        container.requestFullscreen();
                    } else if (container.webkitRequestFullscreen) {
                        container.webkitRequestFullscreen();
                    }
                }
            });
        }

        document.addEventListener('fullscreenchange', () => {
            const isFs = !!document.fullscreenElement;
            if (dom.btnVideoFullscreen) {
                dom.btnVideoFullscreen.classList.toggle('active', isFs);
                dom.btnVideoFullscreen.title = isFs ? '전체화면 종료' : '영상 전체화면 확대';
            }
        });

        // 재생중 창 대기열 플레이리스트 저장 액션들 (요구사항 3)
        if (dom.btnFullQueueSaveAll) {
            dom.btnFullQueueSaveAll.addEventListener('click', () => {
                if (!player.queue || player.queue.length === 0) {
                    showToast('저장할 대기열 곡이 없습니다.');
                    return;
                }
                const allSongIds = player.queue.map(s => s.id);
                openSelectPlaylistModal(allSongIds);
            });
        }

        if (dom.btnFullQueueSelectMode) {
            dom.btnFullQueueSelectMode.addEventListener('click', () => {
                toggleQueueSelectMode();
            });
        }

        if (dom.btnFullQueueCancelSelect) {
            dom.btnFullQueueCancelSelect.addEventListener('click', () => {
                toggleQueueSelectMode(false);
            });
        }

        if (dom.btnFullQueueSaveSelected) {
            dom.btnFullQueueSaveSelected.addEventListener('click', () => {
                if (state.selectedQueueIndices.size === 0) {
                    showToast('선택된 곡이 없습니다.');
                    return;
                }
                const selectedSongIds = Array.from(state.selectedQueueIndices)
                    .map(i => player.queue[i] ? player.queue[i].id : null)
                    .filter(Boolean);
                if (selectedSongIds.length === 0) {
                    showToast('선택된 곡이 없습니다.');
                    return;
                }
                openSelectPlaylistModal(selectedSongIds);
                toggleQueueSelectMode(false);
            });
        }

        // 전체화면 플레이어 사비 편집 버튼
        const handleOpenSabiFromFull = (e) => {
            e.stopPropagation();
            if (player.currentSong) {
                openSabiEditor(player.currentSong);
            } else {
                showToast('현재 재생 중인 곡이 없습니다.');
            }
        };
        const btnFullSabiEdit = document.getElementById('btn-full-sabi-edit');
        if (btnFullSabiEdit) btnFullSabiEdit.addEventListener('click', handleOpenSabiFromFull);
        if (dom.btnFullSabiEditIcon) dom.btnFullSabiEditIcon.addEventListener('click', handleOpenSabiFromFull);

        // 신곡 추가 모달
        dom.btnAddSong.addEventListener('click', () => openAddSongModal());
        dom.btnCloseAddSong.addEventListener('click', () => closeAddSongModal());
        dom.btnCancelAddSong.addEventListener('click', () => closeAddSongModal());
        dom.formAddSong.addEventListener('submit', (e) => handleAddSongSubmit(e));

        // 멤버 자동 감지 버튼
        const btnAutoDetect = document.getElementById('btn-auto-detect-members');
        if (btnAutoDetect) {
            btnAutoDetect.addEventListener('click', () => {
                const title = document.getElementById('input-song-title')?.value || '';
                const artist = document.getElementById('input-song-artist')?.value || '';
                const detected = detectMembersFromText(`${title} ${artist}`);
                if (detected && detected.length > 0) {
                    setMemberPickerState('add', { isStellive: false, units: [], members: detected }, document.getElementById('input-song-artist'));
                    syncArtistFromCheckboxes('add', document.getElementById('input-song-artist'));
                    showToast(`멤버 ${detected.length}명이 자동 감지되었습니다.`);
                } else {
                    showToast('감지된 멤버가 없습니다. 직접 체크해주세요.');
                }
            });
        }

        // 유튜브 링크 자동 분석 버튼
        const btnAutoFetch = document.getElementById('btn-auto-fetch-info');
        if (btnAutoFetch) {
            btnAutoFetch.addEventListener('click', async () => {
                const urlInput = document.getElementById('input-yt-url');
                const url = urlInput ? urlInput.value.trim() : '';
                if (!url) {
                    showToast('유튜브 링크 또는 영상 ID를 먼저 입력해주세요.');
                    return;
                }
                btnAutoFetch.disabled = true;
                btnAutoFetch.textContent = '분석 중...';
                try {
                    let data = null;
                    const isWeb = (window.location.port !== '8888');

                    if (!isWeb) {
                        try {
                            const resp = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
                            if (resp.ok) {
                                data = await resp.json();
                            }
                        } catch (e) {}
                    }

                    if (!data) {
                        // 웹 환경 폴백: YouTube oEmbed API 직접 조회
                        let vid = url;
                        if (vid.includes('v=')) {
                            vid = vid.split('v=')[1].split('&')[0];
                        } else if (vid.includes('youtu.be/')) {
                            vid = vid.split('youtu.be/')[1].split('?')[0];
                        }
                        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(vid)}&format=json`;
                        const oembedResp = await fetch(oembedUrl);
                        if (!oembedResp.ok) throw new Error('YouTube oEmbed 조회 실패');
                        const oembedData = await oembedResp.json();
                        data = {
                            title: oembedData.title,
                            artist: oembedData.author_name,
                            uploader: oembedData.author_name,
                            duration: 200
                        };
                    }
                    if (data.title) document.getElementById('input-song-title').value = cleanAndKoreanizeTitle(data.title);
                    if (data.artist) document.getElementById('input-song-artist').value = cleanAndKoreanizeTitle(data.artist);
                    if (data.duration) {
                        const sStart = Math.floor(data.duration * 0.25);
                        const sEnd = Math.floor(sStart + 35);
                        document.getElementById('input-sabi-start').value = sStart;
                        document.getElementById('input-sabi-end').value = sEnd;
                    }
                    const textToAnalyze = `${data.title || ''} ${data.artist || ''} ${data.uploader || ''} ${data.channelTitle || ''}`;
                    const detected = detectMembersFromText(textToAnalyze);
                    if (detected && detected.length > 0) {
                        document.querySelectorAll('#add-member-chips input[name="add-member"]').forEach(cb => {
                            cb.checked = detected.includes(cb.value);
                        });
                    }
                    showToast('유튜브 곡 정보를 성공적으로 불러왔습니다!');
                } catch (err) {
                    showToast('영상 정보를 가져오지 못했습니다. 직접 입력해주세요.');
                } finally {
                    btnAutoFetch.disabled = false;
                    btnAutoFetch.textContent = '자동 분석';
                }
            });
        }

        // 신곡 탐색 동기화 버튼
        if (dom.btnSyncNewSongs) {
            dom.btnSyncNewSongs.addEventListener('click', () => {
                triggerBackgroundSync(true);
            });
        }

        // 풀플레이어 현재 재생 곡 정보 수정 버튼
        if (dom.btnFullEditSong) {
            dom.btnFullEditSong.addEventListener('click', (e) => {
                e.stopPropagation();
                if (player.currentSong) {
                    openEditSongModal(player.currentSong.id);
                } else {
                    showToast('현재 재생 중인 곡이 없습니다.');
                }
            });
        }

        // 곡 정보 직접 수정 모달 이벤트
        if (dom.btnCloseEditSong) dom.btnCloseEditSong.addEventListener('click', closeEditSongModal);
        if (dom.btnCancelEditSong) dom.btnCancelEditSong.addEventListener('click', closeEditSongModal);
        if (dom.formEditSong) dom.formEditSong.addEventListener('submit', handleSaveSongEdit);
        if (dom.btnResetSongEdit) dom.btnResetSongEdit.addEventListener('click', handleResetSongEdit);
        if (dom.btnDeleteSong) dom.btnDeleteSong.addEventListener('click', handleDeleteSong);

        // 참여 멤버 2단계 선택 및 아티스트명 자동 동기화 초기화
        setupMemberPicker('add', document.getElementById('input-song-artist'));
        setupMemberPicker('edit', dom.editSongArtist);

        // 모달 배경 클릭 시 닫기
        if (dom.modalEditSong) {
            dom.modalEditSong.addEventListener('click', (e) => {
                if (e.target === dom.modalEditSong) closeEditSongModal();
            });
        }
        if (dom.modalAddSong) {
            dom.modalAddSong.addEventListener('click', (e) => {
                if (e.target === dom.modalAddSong) closeAddSongModal();
            });
        }
        if (dom.modalPlaylist) {
            dom.modalPlaylist.addEventListener('click', (e) => {
                if (e.target === dom.modalPlaylist) closePlaylistModal();
            });
        }

        // 플레이리스트 모달 (레거시 안전 처리)
        if (dom.btnClosePlaylistModal) dom.btnClosePlaylistModal.addEventListener('click', () => closePlaylistModal());
        if (dom.formCreatePlaylist) dom.formCreatePlaylist.addEventListener('submit', (e) => handleCreatePlaylist(e));

        // 플레이어 커스텀 이벤트 수신
        window.addEventListener('stellplay:trackChanged', () => {
            updatePlayerUIState();
            if (state.activeView === 'playlists') {
                if (state.currentPlaylistDetailId === 'pl-history') {
                    openPlaylistDetail('pl-history');
                } else if (!state.currentPlaylistDetailId) {
                    renderPlaylistsOverview();
                }
            }
        });

        window.addEventListener('stellplay:historyUpdated', () => {
            if (state.activeView === 'playlists') {
                if (state.currentPlaylistDetailId === 'pl-history') {
                    openPlaylistDetail('pl-history');
                } else if (!state.currentPlaylistDetailId) {
                    renderPlaylistsOverview();
                }
            }
        });

        window.addEventListener('stellplay:playlistsUpdated', () => {
            if (state.activeView === 'playlists') {
                if (state.currentPlaylistDetailId) {
                    openPlaylistDetail(state.currentPlaylistDetailId);
                } else {
                    renderPlaylistsOverview();
                }
            }
        });

        window.addEventListener('stellplay:volumeChanged', (e) => {
            if (dom.volumeSlider) dom.volumeSlider.value = e.detail.volume;
            updateMuteIcon();
        });

        window.addEventListener('stellplay:sabiUpdated', (e) => {
            if (player.currentSong?.id === e.detail.songId) {
                updatePlayerUIState();
            }
            refreshTrackList();
        });

        window.addEventListener('stellplay:engineChanged', (e) => {
            const mode = e.detail?.engineMode;
            if (mode) {
                const targetView = mode === 'video' ? 'video' : 'art';
                if (state.fullPlayerViewMode !== targetView) {
                    switchFullPlayerView(targetView);
                }
                const selectEngine = document.getElementById('setting-engine-select');
                if (selectEngine && selectEngine.value !== mode) {
                    selectEngine.value = mode;
                }
            }
        });

        window.addEventListener('stellplay:playStateChanged', () => {
            updatePlayPauseButtons();
        });

        window.addEventListener('stellplay:sabiModeChanged', () => {
            updateSabiButtons();
        });

        window.addEventListener('stellplay:shuffleChanged', () => {
            updateShuffleRepeatButtons();
        });

        window.addEventListener('stellplay:repeatChanged', () => {
            updateShuffleRepeatButtons();
        });

        window.addEventListener('stellplay:queueUpdated', () => {
            renderQueue();
        });

        window.addEventListener('stellplay:timeUpdate', (e) => {
            if (isScrubbingProgress) return;
            const { currentTime, duration, progress, sabiRemaining } = e.detail;

            // 시크바 진행도
            dom.progressBarFill.style.width = `${progress}%`;
            dom.miniProgressBar.style.width = `${progress}%`;
            dom.currentTimeText.textContent = formatTime(currentTime);

            // 사비 남은 시간 인디케이터
            if (sabiRemaining !== null) {
                dom.fullSabiIndicator.textContent = `후렴구 재생 중 (${sabiRemaining}초 남음)`;
            }
        });

        window.addEventListener('stellplay:error', (e) => {
            showToast(e.detail.message);
        });

        // ESC 키 단축키로 홈화면/모달/대기열/재생창 복귀 및 계층적 닫기 (요구사항 6)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.keyCode === 27) {
                // 1. 활성화된 모달 닫기
                if (dom.modalMoodDetail && dom.modalMoodDetail.classList.contains('open')) {
                    closeMoodModal();
                    return;
                }
                const modalSabi = document.getElementById('modal-sabi-editor');
                if (modalSabi && modalSabi.classList.contains('open')) {
                    closeSabiEditor();
                    return;
                }
                const modalSelectPl = document.getElementById('modal-select-playlist');
                if (modalSelectPl && modalSelectPl.classList.contains('open')) {
                    closeSelectPlaylistModal();
                    return;
                }
                if (dom.modalAddSong && dom.modalAddSong.classList.contains('open')) {
                    closeAddSongModal();
                    return;
                }
                if (dom.modalEditSong && dom.modalEditSong.classList.contains('open')) {
                    closeEditSongModal();
                    return;
                }
                if (dom.modalPlaylist && dom.modalPlaylist.classList.contains('open')) {
                    closePlaylistModal();
                    return;
                }

                // 2. 대기열 슬라이드 서랍 닫기
                if (dom.queueDrawer && dom.queueDrawer.classList.contains('open')) {
                    closeQueueDrawer();
                    return;
                }

                // 3. 전체화면 플레이어 닫기
                if (dom.fullPlayerModal && dom.fullPlayerModal.classList.contains('open')) {
                    closeFullPlayer();
                    return;
                }

                // 4. 플레이리스트 상세 화면에서 목록으로 복귀
                const detailContainer = document.getElementById('playlist-detail-container');
                if (state.activeView === 'playlists' && detailContainer && detailContainer.style.display !== 'none') {
                    renderPlaylistsOverview();
                    return;
                }

                // 5. 플레이리스트/설정 탭에서 메인 홈 화면으로 복귀
                if (state.activeView !== 'home') {
                    if (dom.navHome) switchNavView('home', dom.navHome);
                    return;
                }

                // 6. 다중 선택 모드 활성화 시 해제
                if (isMultiSelectMode || selectedSongIds.size > 0) {
                    clearSongSelection();
                    return;
                }
            }
        });

        // 상단 좌우 스크롤바 바인딩
        window.syncHomeTopScrollbar = setupTopScrollbar(
            dom.tracksListContainer,
            dom.homeTopScrollbarWrap,
            dom.homeTopScrollbarInner
        );

        const plDetailContainer = document.getElementById('playlist-detail-tracks-list');
        window.syncPlDetailTopScrollbar = setupTopScrollbar(
            plDetailContainer,
            dom.plDetailTopScrollbarWrap,
            dom.plDetailTopScrollbarInner
        );
    }

    // 상단 좌우 스크롤바 헬퍼
    function setupTopScrollbar(container, topWrap, topInner) {
        if (!container || !topWrap || !topInner) return () => {};

        function sync() {
            const scrollWidth = container.scrollWidth;
            const clientWidth = container.clientWidth;
            if (scrollWidth > clientWidth + 2) {
                topWrap.style.display = 'block';
                topInner.style.width = scrollWidth + 'px';
                topWrap.scrollLeft = container.scrollLeft;
            } else {
                topWrap.style.display = 'none';
            }
        }

        let isSyncingTop = false;
        let isSyncingContainer = false;

        topWrap.addEventListener('scroll', () => {
            if (!isSyncingTop) {
                isSyncingContainer = true;
                container.scrollLeft = topWrap.scrollLeft;
                isSyncingContainer = false;
            }
        }, { passive: true });

        container.addEventListener('scroll', () => {
            if (!isSyncingContainer) {
                isSyncingTop = true;
                topWrap.scrollLeft = container.scrollLeft;
                isSyncingTop = false;
            }
        }, { passive: true });

        window.addEventListener('resize', sync);
        if (window.ResizeObserver) {
            try {
                new ResizeObserver(sync).observe(container);
            } catch (_) {}
        }
        setTimeout(sync, 60);
        return sync;
    }

    // ===================================================================
    // 5. 뷰 전환 및 모달 제어
    // ===================================================================
    function switchNavView(viewName, activeBtn) {
        state.activeView = viewName;
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        if (activeBtn) activeBtn.parentElement.classList.add('active');

        const homeView = document.getElementById('view-home');
        const playlistsView = document.getElementById('view-playlists');
        const settingsView = document.getElementById('view-settings');

        if (homeView) homeView.style.display = (viewName === 'home') ? 'block' : 'none';
        if (playlistsView) {
            playlistsView.style.display = (viewName === 'playlists') ? 'block' : 'none';
            if (viewName === 'playlists') renderPlaylistsOverview();
        }
        if (settingsView) {
            settingsView.style.display = (viewName === 'settings') ? 'block' : 'none';
            if (viewName === 'settings') loadSettingsView();
        }

        if (viewName === 'home') {
            refreshTrackList();
        }
    }

    function updatePcDockPosition() {
        const wrap = document.getElementById('pc-youtube-player-wrap');
        const target = document.getElementById('pc-video-dock-target');
        if (!wrap) return;

        const isDocked = wrap.classList.contains('docked') &&
                         dom.fullPlayerModal &&
                         dom.fullPlayerModal.classList.contains('open') &&
                         state.fullPlayerViewMode === 'video' &&
                         target;

        if (isDocked) {
            const rect = target.getBoundingClientRect();
            wrap.style.position = 'fixed';
            wrap.style.top = rect.top + 'px';
            wrap.style.left = rect.left + 'px';
            wrap.style.width = rect.width + 'px';
            wrap.style.height = rect.height + 'px';
            wrap.style.bottom = 'auto';
            wrap.style.right = 'auto';
            wrap.style.opacity = '1';
            wrap.style.pointerEvents = 'auto';
            wrap.style.zIndex = '105';
            wrap.style.borderRadius = 'var(--radius-md, 12px)';
        } else {
            wrap.style.position = 'fixed';
            wrap.style.top = 'auto';
            wrap.style.left = 'auto';
            wrap.style.bottom = '0';
            wrap.style.right = '0';
            wrap.style.width = '240px';
            wrap.style.height = '135px';
            wrap.style.opacity = '0.01';
            wrap.style.pointerEvents = 'none';
            wrap.style.zIndex = '-10';
            wrap.style.borderRadius = '0';
        }
    }

    function openFullPlayer() {
        closeQueueDrawer();
        dom.fullPlayerModal.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (dom.openFullPlayerBtn) {
            dom.openFullPlayerBtn.innerHTML = `
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>
                </svg>`;
            dom.openFullPlayerBtn.title = '전체화면 접기';
            dom.openFullPlayerBtn.classList.add('active');
        }
        if (dom.btnToggleQueueDrawer) {
            updateFullPlayerQueueToggleBtn();
        }
        if (state.fullPlayerViewMode === 'video') {
            dockPcPlayer(true);
        }
    }

    function dockPcPlayer(isDocked) {
        const wrap = document.getElementById('pc-youtube-player-wrap');
        if (!wrap) return;

        if (isDocked) {
            wrap.classList.add('docked');
            let start = performance.now();
            function sync() {
                updatePcDockPosition();
                if (performance.now() - start < 450 && dom.fullPlayerModal && dom.fullPlayerModal.classList.contains('open')) {
                    requestAnimationFrame(sync);
                }
            }
            requestAnimationFrame(sync);
        } else {
            wrap.classList.remove('docked');
            updatePcDockPosition();
        }
    }

    function closeFullPlayer() {
        dom.fullPlayerModal.classList.remove('open');
        document.body.style.overflow = '';
        dockPcPlayer(false);
        if (dom.openFullPlayerBtn) {
            dom.openFullPlayerBtn.innerHTML = `
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                </svg>`;
            dom.openFullPlayerBtn.title = '전체화면 플레이어';
            dom.openFullPlayerBtn.classList.remove('active');
        }
        if (dom.btnToggleQueueDrawer) {
            dom.btnToggleQueueDrawer.classList.toggle('active', dom.queueDrawer && dom.queueDrawer.classList.contains('open'));
        }
    }

    function toggleFullPlayer() {
        if (dom.fullPlayerModal.classList.contains('open')) {
            closeFullPlayer();
        } else {
            openFullPlayer();
        }
    }

    function switchFullPlayerView(mode) {
        state.fullPlayerViewMode = mode;
        dom.btnViewArt.classList.toggle('active', mode === 'art');
        dom.btnViewVideo.classList.toggle('active', mode === 'video');

        const artBox = document.getElementById('full-art-box');
        if (mode === 'video') {
            if (artBox) artBox.style.display = 'none';
            dom.fullVideoContainer.classList.add('active');
            dockPcPlayer(true);
            player.setEngineMode('video');
        } else {
            dom.fullVideoContainer.classList.remove('active');
            if (artBox) artBox.style.display = 'flex';
            dockPcPlayer(false);
            player.setEngineMode('audio');
        }
    }

    // ===================================================================
    // 참여 멤버 2단계 선택 & 아티스트명 자동 동기화 헬퍼
    // ===================================================================
    const UNIT_MEMBERS_MAP = {
        everlys: ['yuni', 'huya', 'kanna'],
        universe: ['hina', 'mashiro', 'lize', 'tabi'],
        cliche: ['shibuki', 'rin', 'nana', 'riko']
    };

    const UNIT_NAMES_MAP = {
        everlys: '에버리스',
        universe: '유니버스',
        cliche: '클리셰'
    };

    const MEMBER_NAMES_MAP = {
        yuni: '아야츠노 유니',
        huya: '사키하네 후야',
        kanna: '아이리 칸나',
        hina: '시라유키 히나',
        mashiro: '네네코 마시로',
        lize: '아카네 리제',
        tabi: '아라하시 타비',
        shibuki: '텐코 시부키',
        rin: '아오쿠모 린',
        nana: '하나코 나나',
        riko: '유즈하 리코'
    };

    function setupMemberPicker(prefix, artistInput) {
        const scopeSelector = document.getElementById(`${prefix}-member-scope-selector`);
        const subSection = document.getElementById(`${prefix}-member-selection-sub`);
        if (!scopeSelector || !subSection) return;

        // 1분류 토글
        const scopeBtns = scopeSelector.querySelectorAll('.member-scope-btn');
        scopeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                scopeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const radio = btn.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;

                const scopeVal = radio ? radio.value : 'individual';
                if (scopeVal === 'stellive') {
                    subSection.style.display = 'none';
                    if (artistInput) artistInput.value = '스텔라이브 (STELLIVE)';
                } else {
                    subSection.style.display = 'flex';
                    syncArtistFromCheckboxes(prefix, artistInput);
                }
            });
        });

        // 2분류 체크박스 변경 시 아티스트 자동 반영
        subSection.addEventListener('change', (e) => {
            if (e.target.matches('input[type="checkbox"]')) {
                syncArtistFromCheckboxes(prefix, artistInput);
            }
        });
    }

    function syncArtistFromCheckboxes(prefix, artistInput) {
        if (!artistInput) return;
        const scopeRadio = document.querySelector(`input[name="${prefix}-member-scope"]:checked`);
        if (scopeRadio && scopeRadio.value === 'stellive') {
            artistInput.value = '스텔라이브 (STELLIVE)';
            return;
        }

        const checkedUnits = Array.from(document.querySelectorAll(`input[name="${prefix}-member-unit"]:checked`));
        const checkedMembers = Array.from(document.querySelectorAll(`input[name="${prefix}-member-item"]:checked`));

        const names = [];
        // 유닛명 추가
        checkedUnits.forEach(u => {
            const name = u.dataset.name || UNIT_NAMES_MAP[u.value];
            if (name && !names.includes(name)) names.push(name);
        });
        // 멤버명 추가
        checkedMembers.forEach(m => {
            const name = m.dataset.name || MEMBER_NAMES_MAP[m.value];
            if (name && !names.includes(name)) names.push(name);
        });

        if (names.length > 0) {
            artistInput.value = names.join(', ');
        }
    }

    function setMemberPickerState(prefix, { isStellive, units = [], members = [] }, artistInput) {
        const scopeSelector = document.getElementById(`${prefix}-member-scope-selector`);
        const subSection = document.getElementById(`${prefix}-member-selection-sub`);
        if (!scopeSelector || !subSection) return;

        const scopeRadios = scopeSelector.querySelectorAll(`input[name="${prefix}-member-scope"]`);
        const scopeBtns = scopeSelector.querySelectorAll('.member-scope-btn');

        scopeRadios.forEach(radio => {
            radio.checked = isStellive ? (radio.value === 'stellive') : (radio.value === 'individual');
        });
        scopeBtns.forEach(btn => {
            const radio = btn.querySelector('input[type="radio"]');
            btn.classList.toggle('active', radio && radio.checked);
        });

        if (isStellive) {
            subSection.style.display = 'none';
        } else {
            subSection.style.display = 'flex';
        }

        // 유닛 체크박스
        document.querySelectorAll(`input[name="${prefix}-member-unit"]`).forEach(cb => {
            cb.checked = units.includes(cb.value);
        });
        // 멤버 체크박스
        document.querySelectorAll(`input[name="${prefix}-member-item"]`).forEach(cb => {
            cb.checked = members.includes(cb.value);
        });
    }

    function getSelectedMemberData(prefix) {
        const scopeRadio = document.querySelector(`input[name="${prefix}-member-scope"]:checked`);
        const isStellive = scopeRadio && scopeRadio.value === 'stellive';

        if (isStellive) {
            return {
                isStellive: true,
                members: ['group'],
                gen: 'group'
            };
        }

        const checkedUnits = Array.from(document.querySelectorAll(`input[name="${prefix}-member-unit"]:checked`)).map(cb => cb.value);
        const checkedMembers = Array.from(document.querySelectorAll(`input[name="${prefix}-member-item"]:checked`)).map(cb => cb.value);

        let finalMembers = [...checkedMembers];
        let gen = 'group';

        if (checkedUnits.length === 1 && finalMembers.length === 0) {
            const unit = checkedUnits[0];
            if (unit === 'everlys') gen = 'g1';
            else if (unit === 'universe') gen = 'g2';
            else if (unit === 'cliche') gen = 'g3';
            finalMembers = UNIT_MEMBERS_MAP[unit] || ['group'];
        } else if (finalMembers.length > 0) {
            const g1 = ['yuni', 'huya', 'kanna'];
            const g2 = ['hina', 'mashiro', 'lize', 'tabi'];
            const g3 = ['shibuki', 'rin', 'nana', 'riko'];

            const allG1 = finalMembers.every(m => g1.includes(m));
            const allG2 = finalMembers.every(m => g2.includes(m));
            const allG3 = finalMembers.every(m => g3.includes(m));

            if (allG1) gen = 'g1';
            else if (allG2) gen = 'g2';
            else if (allG3) gen = 'g3';
            else gen = 'group';
        }

        if (finalMembers.length === 0) {
            finalMembers = ['group'];
            gen = 'group';
        }

        return {
            isStellive: false,
            members: finalMembers,
            gen: gen,
            units: checkedUnits
        };
    }

    // 신곡 추가 모달
    function openAddSongModal() {
        dom.modalAddSong.classList.add('open');
        setMemberPickerState('add', { isStellive: false, units: [], members: [] }, document.getElementById('input-song-artist'));
        if (dom.selectSongType) {
            dom.selectSongType.onchange = (e) => {
                if (dom.rowStreamTimestamps) {
                    dom.rowStreamTimestamps.style.display = e.target.value === 'stream' ? 'grid' : 'none';
                }
            };
        }
    }
    function closeAddSongModal() {
        dom.modalAddSong.classList.remove('open');
        dom.formAddSong.reset();
        if (dom.rowStreamTimestamps) dom.rowStreamTimestamps.style.display = 'none';
        setMemberPickerState('add', { isStellive: false, units: [], members: [] }, document.getElementById('input-song-artist'));
    }
    function handleAddSongSubmit(e) {
        e.preventDefault();
        const youtubeUrl = document.getElementById('input-yt-url').value;
        const title = document.getElementById('input-song-title').value;
        const artist = document.getElementById('input-song-artist').value;
        const type = document.getElementById('select-song-type').value;
        const sabiStart = document.getElementById('input-sabi-start').value;
        const sabiEnd = document.getElementById('input-sabi-end').value;
        const streamStart = dom.inputStreamStart ? parseInt(dom.inputStreamStart.value, 10) || 0 : 0;
        const streamEnd = dom.inputStreamEnd ? parseInt(dom.inputStreamEnd.value, 10) || 0 : 0;

        // 2단계 참여 멤버 선택 데이터 수집
        const memberData = getSelectedMemberData('add');

        try {
            const newSong = window.addCustomSong({
                youtubeUrlOrId: youtubeUrl,
                title: title,
                artist: artist,
                type: type,
                members: memberData.members,
                gen: memberData.gen,
                streamStart: streamStart,
                streamEnd: streamEnd,
                sabiStart: parseInt(sabiStart, 10) || (type === 'stream' ? streamStart + 30 : 45),
                sabiEnd: parseInt(sabiEnd, 10) || (type === 'stream' ? streamStart + 70 : 80)
            });

            closeAddSongModal();
            refreshTrackList();
            showToast(`"${newSong.title}" 곡이 라이브러리에 등록되었습니다!`);
            player.playSong(newSong);
        } catch (err) {
            alert(err.message || '곡 추가 실패');
        }
    }

    // ===================================================================
    // 5.1 인페이지 플레이리스트 탭 제어 (요구사항 14)
    // ===================================================================
    function renderPlaylistsOverview() {
        const overview = document.getElementById('playlists-overview-container') || document.getElementById('playlists-overview-view');
        const detail = document.getElementById('playlist-detail-container') || document.getElementById('playlist-detail-view');
        const grid = document.getElementById('playlists-grid') || document.getElementById('playlists-grid-container');
        if (overview) overview.style.display = 'block';
        if (detail) detail.style.display = 'none';
        if (!grid) return;

        const playlists = window.StorageManager.getPlaylists();
        const allSongs = window.getAllSongs ? window.getAllSongs() : [];

        const countBadge = document.getElementById('tab-playlist-count-text');
        if (countBadge) countBadge.textContent = `${playlists.length}개`;

        if (playlists.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
                    <div style="font-size: 2.5rem; margin-bottom: 12px;">📂</div>
                    <h3 style="color: var(--text-primary); margin-bottom: 6px;">생성된 플레이리스트가 없습니다</h3>
                    <p style="font-size: 0.9rem;">곡 목록에서 원하는 곡들을 선택하여 플레이리스트에 담거나, 새 플레이리스트를 만들어보세요!</p>
                </div>
            `;
            return;
        }

        let html = '';
        playlists.forEach(pl => {
            const firstSong = allSongs.find(s => pl.songIds && pl.songIds.includes(s.id));
            let coverHtml;
            if (firstSong) {
                coverHtml = `<img src="https://img.youtube.com/vi/${firstSong.youtubeId}/mqdefault.jpg" alt="${pl.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`;
            } else {
                coverHtml = pl.isHistory ? `<span style="font-size: 2.2rem;">🕒</span>` : `<span style="font-size: 2.2rem;">🎵</span>`;
            }

            const countText = pl.isHistory ? `${(pl.songIds || []).length}곡 기록 (최근 100곡)` : `${(pl.songIds || []).length}곡 수록`;

            html += `
                <div class="playlist-card ${pl.isHistory ? 'playlist-card-history' : ''}" data-pl-id="${pl.id}">
                    <div class="playlist-card-cover">
                        ${coverHtml}
                        <button class="playlist-card-play-btn" title="플레이리스트 바로 재생" onclick="event.stopPropagation(); playPlAction('${pl.id}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
                        </button>
                    </div>
                    <div class="playlist-card-info">
                        <div class="playlist-card-title">${pl.name}</div>
                        <div class="playlist-card-count">${countText}</div>
                    </div>
                </div>
            `;
        });
        grid.innerHTML = html;

        grid.querySelectorAll('.playlist-card').forEach(card => {
            card.addEventListener('click', () => {
                const plId = card.dataset.plId;
                openPlaylistDetail(plId);
            });
        });
    }

    function openPlaylistDetail(playlistId) {
        const playlists = window.StorageManager.getPlaylists();
        const pl = playlists.find(p => p.id === playlistId);
        if (!pl) return;

        state.currentPlaylistDetailId = playlistId;
        const overview = document.getElementById('playlists-overview-container') || document.getElementById('playlists-overview-view');
        const detail = document.getElementById('playlist-detail-container') || document.getElementById('playlist-detail-view');
        if (overview) overview.style.display = 'none';
        if (detail) detail.style.display = 'block';

        const nameEl = document.getElementById('playlist-detail-title') || document.getElementById('playlist-detail-name');
        const countEl = document.getElementById('playlist-detail-sub') || document.getElementById('playlist-detail-count');
        const coverEl = document.getElementById('playlist-detail-cover');
        const trackListEl = document.getElementById('playlist-detail-tracks-list') || document.getElementById('playlist-detail-track-list');

        const btnDelete = document.getElementById('btn-pl-detail-delete');
        const btnAddTracks = document.getElementById('btn-pl-detail-add-tracks');
        const btnClearHistory = document.getElementById('btn-pl-detail-clear-history');

        if (pl.isHistory) {
            if (btnAddTracks) btnAddTracks.style.display = 'none';
            if (btnDelete) btnDelete.style.display = 'none';
            if (btnClearHistory) btnClearHistory.style.display = 'inline-flex';
        } else {
            if (btnAddTracks) btnAddTracks.style.display = 'inline-flex';
            if (btnDelete) btnDelete.style.display = 'inline-flex';
            if (btnClearHistory) btnClearHistory.style.display = 'none';
        }

        if (nameEl) nameEl.textContent = pl.name;
        if (countEl) countEl.textContent = pl.isHistory ? `최근 감상 기록 총 ${(pl.songIds || []).length}곡 (최대 100곡)` : `총 ${(pl.songIds || []).length}곡 수록`;

        const allSongs = window.getAllSongs ? window.getAllSongs() : [];
        const songMap = new Map(allSongs.map(s => [s.id, s]));
        const plSongs = (pl.songIds || []).map(id => songMap.get(id)).filter(Boolean);

        if (coverEl) {
            if (plSongs.length > 0) {
                coverEl.innerHTML = `<img src="https://img.youtube.com/vi/${plSongs[0].youtubeId}/mqdefault.jpg" alt="${pl.name}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-md);">`;
            } else {
                coverEl.innerHTML = pl.isHistory ? `<span style="font-size:2rem;">🕒</span>` : `🎵`;
            }
        }

        if (plSongs.length === 0) {
            trackListEl.innerHTML = `
                <div style="padding: 40px; text-align: center; color: var(--text-muted);">
                    ${pl.isHistory ? '최근 감상한 곡 기록이 없습니다. 곡을 재생하면 자동으로 이곳에 최대 100곡까지 기록됩니다.' : '플레이리스트가 비어있습니다. [+ 곡 추가]를 눌러 원하는 곡을 담아보세요!'}
                </div>
            `;
        } else {
            let html = `
                <div class="tracks-table-header">
                    <div>#</div>
                    <div>곡 정보</div>
                    <div>유형</div>
                    <div>사비 구간</div>
                    <div>재생시간</div>
                    <div>관리</div>
                </div>
            `;
            plSongs.forEach((song, idx) => {
                const durationStr = formatTime(song.duration);
                const thumbUrl = `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`;
                const sabiStr = song.sabi ? `${formatTime(song.sabi.start)} ~ ${formatTime(song.sabi.end)}` : '전체';

                let plBadgeClass = 'badge-cover';
                let plBadgeText = '커버곡';
                if (song.type === 'original') {
                    plBadgeClass = 'badge-original';
                    plBadgeText = '오리지널';
                } else if (song.type === 'featuring') {
                    plBadgeClass = 'badge-featuring';
                    plBadgeText = '피처링 & OST';
                } else if (song.type === 'stream') {
                    plBadgeClass = 'badge-stream';
                    plBadgeText = '노래방송 Live';
                }

                const isPlaying = player.currentSong && player.currentSong.id === song.id;

                html += `
                    <div class="track-row ${isPlaying ? 'playing active' : ''}" data-song-id="${song.id}" data-index="${idx}">
                        <div class="track-col-index">
                            <span class="track-number">${String(idx + 1).padStart(2, '0')}</span>
                        </div>
                        <div class="track-col-info">
                            <div class="track-thumb-box">
                                <img class="track-thumb-img" src="${thumbUrl}" alt="${song.title}" loading="lazy">
                                <div class="track-thumb-play-overlay">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
                                </div>
                            </div>
                            <div class="track-title-meta">
                                <span class="track-title-text">${song.title}</span>
                                <span class="track-artist-text">${song.artist}</span>
                            </div>
                        </div>
                        <div>
                            <span class="badge-tag ${plBadgeClass}">${plBadgeText}</span>
                        </div>
                        <div class="track-col-sabi">
                            <span>${sabiStr}</span>
                        </div>
                        <div class="track-col-duration">${durationStr}</div>
                        <div class="track-col-actions" onclick="event.stopPropagation();">
                            <button class="btn-icon-action btn-remove-from-pl" data-song-id="${song.id}" title="${pl.isHistory ? '감상 기록에서 삭제' : '이 플레이리스트에서 제거'}" style="color: #f87171;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
            });
            trackListEl.innerHTML = html;

            trackListEl.querySelectorAll('.track-row').forEach(row => {
                row.addEventListener('click', () => {
                    const idx = parseInt(row.dataset.index, 10);
                    player.setQueue(plSongs, idx, true);
                });
            });

            trackListEl.querySelectorAll('.btn-remove-from-pl').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const sId = btn.dataset.songId;
                    window.StorageManager.removeSongFromPlaylist(playlistId, sId);
                    showToast(pl.isHistory ? '감상 기록에서 곡이 제거되었습니다.' : '플레이리스트에서 곡이 제거되었습니다.');
                    openPlaylistDetail(playlistId);
                });
            });
        }
        if (window.syncPlDetailTopScrollbar) {
            setTimeout(window.syncPlDetailTopScrollbar, 20);
        }
    }

    // 플레이리스트 상세 액션 버튼들
    const btnBackToPlaylists = document.getElementById('btn-back-to-playlists');
    if (btnBackToPlaylists) {
        btnBackToPlaylists.addEventListener('click', () => renderPlaylistsOverview());
    }

    const btnPlDetailPlay = document.getElementById('btn-pl-detail-play-all') || document.getElementById('btn-pl-detail-play');
    if (btnPlDetailPlay) {
        btnPlDetailPlay.addEventListener('click', () => {
            if (state.currentPlaylistDetailId) playPlAction(state.currentPlaylistDetailId);
        });
    }

    const btnPlDetailShuffle = document.getElementById('btn-pl-detail-shuffle');
    if (btnPlDetailShuffle) {
        btnPlDetailShuffle.addEventListener('click', () => {
            if (!state.currentPlaylistDetailId) return;
            const playlists = window.StorageManager.getPlaylists();
            const pl = playlists.find(p => p.id === state.currentPlaylistDetailId);
            if (pl && pl.songIds && pl.songIds.length > 0) {
                const allSongs = window.getAllSongs();
                const songMap = new Map(allSongs.map(s => [s.id, s]));
                const plSongs = (pl.songIds || []).map(id => songMap.get(id)).filter(Boolean);
                const shuffled = [...plSongs];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                player.setQueue(shuffled, 0, true);
                showToast(`🔀 "${pl.name}" ${shuffled.length}곡을 랜덤 재생합니다.`);
            }
        });
    }

    const btnPlDetailAddTracks = document.getElementById('btn-pl-detail-add-tracks');
    if (btnPlDetailAddTracks) {
        btnPlDetailAddTracks.addEventListener('click', () => {
            if (state.currentPlaylistDetailId) {
                openPlaylistAddTracksModal(state.currentPlaylistDetailId);
            }
        });
    }

    const btnPlDetailDelete = document.getElementById('btn-pl-detail-delete');
    if (btnPlDetailDelete) {
        btnPlDetailDelete.addEventListener('click', () => {
            if (state.currentPlaylistDetailId) deletePlAction(state.currentPlaylistDetailId);
        });
    }

    const btnPlDetailClearHistory = document.getElementById('btn-pl-detail-clear-history');
    if (btnPlDetailClearHistory) {
        btnPlDetailClearHistory.addEventListener('click', () => {
            if (confirm('최근 감상 기록을 모두 비우시겠습니까?')) {
                window.StorageManager.clearHistory();
                showToast('최근 감상 기록이 모두 지워졌습니다.');
                openPlaylistDetail('pl-history');
            }
        });
    }

    const btnCreatePlaylistTrigger = document.getElementById('btn-create-playlist-tab') || document.getElementById('btn-create-playlist-trigger');
    if (btnCreatePlaylistTrigger) {
        btnCreatePlaylistTrigger.addEventListener('click', () => {
            const name = prompt('새 플레이리스트의 이름을 입력해주세요:');
            if (name && name.trim()) {
                window.StorageManager.createPlaylist(name.trim());
                showToast(`플레이리스트 "${name.trim()}"가 생성되었습니다.`);
                renderPlaylistsOverview();
            }
        });
    }

    window.renderPlaylistsOverview = renderPlaylistsOverview;
    window.openPlaylistDetail = openPlaylistDetail;

    window.playPlAction = function(playlistId) {
        const playlists = window.StorageManager.getPlaylists();
        const pl = playlists.find(p => p.id === playlistId);
        if (pl && pl.songIds && pl.songIds.length > 0) {
            const allSongs = window.getAllSongs();
            const songMap = new Map(allSongs.map(s => [s.id, s]));
            const plSongs = (pl.songIds || []).map(id => songMap.get(id)).filter(Boolean);
            if (plSongs.length > 0) {
                player.setQueue(plSongs, 0, true);
                showToast(`"${pl.name}" (${plSongs.length}곡)을 재생합니다.`);
            }
        } else {
            showToast('플레이리스트가 비어있습니다.');
        }
    };

    window.deletePlAction = function(playlistId) {
        if (playlistId === 'pl-history') {
            showToast('최근 감상 기록은 삭제할 수 없습니다.');
            return;
        }
        if (confirm('해당 플레이리스트를 삭제하시겠습니까?')) {
            window.StorageManager.deletePlaylist(playlistId);
            showToast('플레이리스트가 삭제되었습니다.');
            renderPlaylistsOverview();
        }
    };

    // ===================================================================
    // 5.2.1 재생목록에 곡 추가 탐색 모달 (Playlist Add Tracks Modal)
    // ===================================================================
    let plAddModalTargetId = null;
    let plAddSelectedSongIds = new Set();
    let plAddTypeFilter = 'all';
    let plAddMemberFilter = 'all';
    let plAddSearchQuery = '';

    function openPlaylistAddTracksModal(playlistId) {
        const playlists = window.StorageManager.getPlaylists(false);
        const targetPl = playlists.find(p => p.id === playlistId);
        if (!targetPl) return;

        plAddModalTargetId = playlistId;
        plAddSelectedSongIds = new Set();
        plAddTypeFilter = 'all';
        plAddMemberFilter = 'all';
        plAddSearchQuery = '';

        const modal = document.getElementById('modal-playlist-add-tracks');
        if (!modal) return;

        const titleEl = document.getElementById('pl-add-modal-title');
        const subEl = document.getElementById('pl-add-modal-subtitle');
        if (titleEl) titleEl.textContent = `"${targetPl.name}"에 곡 추가`;
        if (subEl) subEl.textContent = `현재 ${(targetPl.songIds || []).length}곡 수록됨 · 추가할 곡을 선택하세요`;

        const searchInput = document.getElementById('pl-add-search-input');
        const searchClear = document.getElementById('pl-add-search-clear');
        if (searchInput) searchInput.value = '';
        if (searchClear) searchClear.style.display = 'none';

        document.querySelectorAll('#pl-add-type-filters button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === 'all');
        });
        document.querySelectorAll('#pl-add-member-filters button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.member === 'all');
        });

        renderPlaylistAddTracksList();
        updatePlaylistAddModalActions();
        modal.classList.add('open');
    }

    function closePlaylistAddTracksModal() {
        const modal = document.getElementById('modal-playlist-add-tracks');
        if (modal) modal.classList.remove('open');
        plAddModalTargetId = null;
        plAddSelectedSongIds.clear();
    }

    function getFilteredSongsForAddModal() {
        const allSongs = window.getAllSongs ? window.getAllSongs() : [];
        const q = (plAddSearchQuery || '').trim().toLowerCase();

        return allSongs.filter(song => {
            // 유형 필터
            if (plAddTypeFilter !== 'all' && song.type !== plAddTypeFilter) {
                return false;
            }

            // 멤버/기수 필터
            if (plAddMemberFilter !== 'all') {
                const members = song.members || [];
                if (plAddMemberFilter === 'gen-g1') {
                    if (!['kanna', 'yuni'].some(m => members.includes(m))) return false;
                } else if (plAddMemberFilter === 'gen-g2') {
                    if (!['hina', 'mashiro', 'lize', 'tabi'].some(m => members.includes(m))) return false;
                } else if (plAddMemberFilter === 'gen-g3') {
                    if (!['shibuki', 'rin', 'nana', 'riko'].some(m => members.includes(m))) return false;
                } else {
                    if (!members.includes(plAddMemberFilter)) return false;
                }
            }

            // 검색어 필터
            if (q) {
                const title = (song.title || '').toLowerCase();
                const artist = (song.artist || '').toLowerCase();
                const orig = (song.originalArtist || '').toLowerCase();
                if (!title.includes(q) && !artist.includes(q) && !orig.includes(q)) {
                    return false;
                }
            }

            return true;
        });
    }

    function renderPlaylistAddTracksList() {
        const listEl = document.getElementById('pl-add-tracks-list');
        if (!listEl || !plAddModalTargetId) return;

        const playlists = window.StorageManager.getPlaylists(false);
        const targetPl = playlists.find(p => p.id === plAddModalTargetId);
        const alreadySongIds = new Set(targetPl ? (targetPl.songIds || []) : []);

        const filtered = getFilteredSongsForAddModal();

        const filteredCountEl = document.getElementById('pl-add-filtered-count');
        if (filteredCountEl) filteredCountEl.textContent = `(검색 결과 ${filtered.length}곡)`;

        if (filtered.length === 0) {
            listEl.innerHTML = `
                <div style="padding: 40px; text-align: center; color: var(--text-muted);">
                    조건에 일치하는 곡이 없습니다.
                </div>
            `;
            return;
        }

        let html = '';
        filtered.forEach(song => {
            const isAlready = alreadySongIds.has(song.id);
            const isChecked = plAddSelectedSongIds.has(song.id);
            const thumbUrl = `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`;
            const durationStr = formatTime(song.duration);

            html += `
                <div class="pl-add-track-item ${isChecked ? 'selected' : ''} ${isAlready ? 'already-added' : ''}" data-song-id="${song.id}">
                    <input type="checkbox" class="pl-add-checkbox" ${isAlready ? 'disabled checked' : (isChecked ? 'checked' : '')} style="cursor: pointer;">
                    <img class="pl-add-thumb" src="${thumbUrl}" alt="${song.title}" loading="lazy">
                    <div class="pl-add-meta">
                        <div class="pl-add-title">${song.title}</div>
                        <div class="pl-add-artist">${song.artist}${song.originalArtist ? ' · ' + song.originalArtist : ''}</div>
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-muted); margin-right: 8px;">${durationStr}</div>
                    ${isAlready ? '<span class="badge-already-in-pl">✓ 이미 수록됨</span>' : ''}
                </div>
            `;
        });
        listEl.innerHTML = html;

        listEl.querySelectorAll('.pl-add-track-item').forEach(row => {
            row.addEventListener('click', (e) => {
                const songId = row.dataset.songId;
                if (alreadySongIds.has(songId)) return;

                const checkbox = row.querySelector('.pl-add-checkbox');
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                }

                if (checkbox.checked) {
                    plAddSelectedSongIds.add(songId);
                    row.classList.add('selected');
                } else {
                    plAddSelectedSongIds.delete(songId);
                    row.classList.remove('selected');
                }
                updatePlaylistAddModalActions();
            });
        });
    }

    function updatePlaylistAddModalActions() {
        const badge = document.getElementById('pl-add-selected-badge');
        const confirmBtn = document.getElementById('btn-confirm-pl-add-tracks');
        const confirmText = document.getElementById('btn-confirm-pl-add-text');

        const count = plAddSelectedSongIds.size;
        if (badge) badge.textContent = `${count}곡`;
        if (confirmBtn) {
            confirmBtn.disabled = count === 0;
            if (count > 0) {
                confirmBtn.style.opacity = '1';
                confirmBtn.style.pointerEvents = 'auto';
            } else {
                confirmBtn.style.opacity = '0.5';
                confirmBtn.style.pointerEvents = 'none';
            }
        }
        if (confirmText) {
            confirmText.textContent = count > 0 ? `선택한 ${count}곡 추가하기` : '선택한 곡 추가하기';
        }
    }

    // 곡 추가 모달 이벤트 바인딩
    const btnClosePlAddTracks = document.getElementById('btn-close-pl-add-tracks');
    if (btnClosePlAddTracks) btnClosePlAddTracks.addEventListener('click', closePlaylistAddTracksModal);

    const btnCancelPlAddTracks = document.getElementById('btn-cancel-pl-add-tracks');
    if (btnCancelPlAddTracks) btnCancelPlAddTracks.addEventListener('click', closePlaylistAddTracksModal);

    const modalPlAddTracks = document.getElementById('modal-playlist-add-tracks');
    if (modalPlAddTracks) {
        modalPlAddTracks.addEventListener('click', (e) => {
            if (e.target === modalPlAddTracks) closePlaylistAddTracksModal();
        });
    }

    const inputPlAddSearch = document.getElementById('pl-add-search-input');
    const btnPlAddSearchClear = document.getElementById('pl-add-search-clear');
    if (inputPlAddSearch) {
        inputPlAddSearch.addEventListener('input', (e) => {
            plAddSearchQuery = e.target.value;
            if (btnPlAddSearchClear) btnPlAddSearchClear.style.display = plAddSearchQuery ? 'block' : 'none';
            renderPlaylistAddTracksList();
        });
    }
    if (btnPlAddSearchClear) {
        btnPlAddSearchClear.addEventListener('click', () => {
            if (inputPlAddSearch) inputPlAddSearch.value = '';
            plAddSearchQuery = '';
            btnPlAddSearchClear.style.display = 'none';
            renderPlaylistAddTracksList();
        });
    }

    document.querySelectorAll('#pl-add-type-filters button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#pl-add-type-filters button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            plAddTypeFilter = btn.dataset.type || 'all';
            renderPlaylistAddTracksList();
        });
    });

    document.querySelectorAll('#pl-add-member-filters button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#pl-add-member-filters button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            plAddMemberFilter = btn.dataset.member || 'all';
            renderPlaylistAddTracksList();
        });
    });

    const btnPlAddSelectAll = document.getElementById('btn-pl-add-select-all');
    if (btnPlAddSelectAll) {
        btnPlAddSelectAll.addEventListener('click', () => {
            if (!plAddModalTargetId) return;
            const playlists = window.StorageManager.getPlaylists(false);
            const targetPl = playlists.find(p => p.id === plAddModalTargetId);
            const alreadySongIds = new Set(targetPl ? (targetPl.songIds || []) : []);
            const filtered = getFilteredSongsForAddModal();

            filtered.forEach(song => {
                if (!alreadySongIds.has(song.id)) {
                    plAddSelectedSongIds.add(song.id);
                }
            });
            renderPlaylistAddTracksList();
            updatePlaylistAddModalActions();
        });
    }

    const btnPlAddDeselectAll = document.getElementById('btn-pl-add-deselect-all');
    if (btnPlAddDeselectAll) {
        btnPlAddDeselectAll.addEventListener('click', () => {
            plAddSelectedSongIds.clear();
            renderPlaylistAddTracksList();
            updatePlaylistAddModalActions();
        });
    }

    const btnConfirmPlAddTracks = document.getElementById('btn-confirm-pl-add-tracks');
    if (btnConfirmPlAddTracks) {
        btnConfirmPlAddTracks.addEventListener('click', () => {
            if (plAddSelectedSongIds.size === 0 || !plAddModalTargetId) return;
            const targetId = plAddModalTargetId;
            const count = plAddSelectedSongIds.size;
            window.StorageManager.addSongsToPlaylist(targetId, Array.from(plAddSelectedSongIds));
            showToast(`선택한 ${count}곡이 플레이리스트에 추가되었습니다!`);
            closePlaylistAddTracksModal();
            openPlaylistDetail(targetId);
        });
    }

    // ===================================================================
    // 5.2 플레이리스트 담기 선택 모달 (Select Playlist Modal)
    // ===================================================================
    let pendingSongIdsForPlaylist = [];

    function openSelectPlaylistModal(songIds) {
        pendingSongIdsForPlaylist = songIds || [];
        const modal = document.getElementById('modal-select-playlist');
        const container = document.getElementById('select-playlist-items');
        if (!modal || !container) return;

        const playlists = window.StorageManager.getPlaylists(false);
        if (playlists.length === 0) {
            container.innerHTML = '<div style="padding: 12px; color: var(--text-muted); font-size: 0.85rem;">기존 플레이리스트가 없습니다. 위에서 새로 만들어보세요!</div>';
        } else {
            let html = '';
            playlists.forEach(pl => {
                html += `
                    <div class="select-pl-item" data-pl-id="${pl.id}">
                        <div>
                            <div style="font-weight: 700; font-size: 0.92rem;">${pl.name}</div>
                            <div style="font-size: 0.78rem; color: var(--text-muted);">${(pl.songIds || []).length}곡 수록</div>
                        </div>
                        <button class="btn-primary" style="padding: 5px 12px; font-size: 0.8rem;">이 목록에 담기</button>
                    </div>
                `;
            });
            container.innerHTML = html;

            container.querySelectorAll('.select-pl-item').forEach(item => {
                item.addEventListener('click', () => {
                    const plId = item.dataset.plId;
                    window.StorageManager.addSongsToPlaylist(plId, pendingSongIdsForPlaylist);
                    showToast(`선택한 ${pendingSongIdsForPlaylist.length}곡이 플레이리스트에 추가되었습니다!`);
                    closeSelectPlaylistModal();
                    clearSongSelection();
                    if (state.activeView === 'playlists') renderPlaylistsOverview();
                });
            });
        }

        modal.classList.add('open');
    }
    window.openSelectPlaylistModal = openSelectPlaylistModal;

    function closeSelectPlaylistModal() {
        const modal = document.getElementById('modal-select-playlist');
        if (modal) modal.classList.remove('open');
        const nameInput = document.getElementById('input-quick-playlist-name');
        if (nameInput) nameInput.value = '';
    }

    const btnCloseSelectPlaylist = document.getElementById('btn-close-select-playlist');
    if (btnCloseSelectPlaylist) {
        btnCloseSelectPlaylist.addEventListener('click', closeSelectPlaylistModal);
    }

    const formQuickCreatePl = document.getElementById('form-quick-create-playlist');
    if (formQuickCreatePl) {
        formQuickCreatePl.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('input-quick-playlist-name');
            const name = nameInput ? nameInput.value.trim() : '';
            if (!name) return;
            window.StorageManager.createPlaylist(name, pendingSongIdsForPlaylist);
            showToast(`새 플레이리스트 "${name}"에 ${pendingSongIdsForPlaylist.length}곡이 추가되었습니다!`);
            closeSelectPlaylistModal();
            clearSongSelection();
            if (state.activeView === 'playlists') renderPlaylistsOverview();
        });
    }

    // ===================================================================
    // 5.3 시각적 사비(후렴구) 구간 편집 모달 (Sabi Range Editor)
    // ===================================================================
    let currentSabiSong = null;
    let sabiPreviewTimer = null;

    function openSabiEditor(song) {
        currentSabiSong = song;
        const modal = document.getElementById('modal-sabi-editor');
        if (!modal || !song) return;

        const thumb = document.getElementById('sabi-editor-thumb');
        const title = document.getElementById('sabi-editor-title');
        const artist = document.getElementById('sabi-editor-artist');
        const duration = song.duration || 210;

        if (thumb) thumb.src = `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`;
        if (title) title.textContent = song.title;
        if (artist) artist.textContent = song.artist;

        const sliderStart = document.getElementById('sabi-slider-start');
        const sliderEnd = document.getElementById('sabi-slider-end');
        const endLabel = document.getElementById('sabi-timeline-end-label');

        const initialSabi = song.sabi || { start: Math.floor(duration * 0.25), end: Math.floor(duration * 0.25) + 35 };
        const sStart = Math.min(initialSabi.start, duration - 10);
        const sEnd = Math.min(initialSabi.end, duration);

        if (sliderStart) {
            sliderStart.max = duration - 5;
            sliderStart.value = sStart;
        }
        if (sliderEnd) {
            sliderEnd.max = duration;
            sliderEnd.value = sEnd;
        }
        if (endLabel) endLabel.textContent = formatTime(duration);

        updateSabiEditorVisuals();
        modal.classList.add('open');
    }

    function updateSabiEditorVisuals() {
        if (!currentSabiSong) return;
        const duration = currentSabiSong.duration || 210;
        const sliderStart = document.getElementById('sabi-slider-start');
        const sliderEnd = document.getElementById('sabi-slider-end');
        let start = parseInt(sliderStart?.value || 45, 10);
        let end = parseInt(sliderEnd?.value || 80, 10);

        if (start >= end) {
            end = Math.min(duration, start + 5);
            if (sliderEnd) sliderEnd.value = end;
        }

        const leftPercent = (start / duration) * 100;
        const widthPercent = Math.max(2, ((end - start) / duration) * 100);

        const region = document.getElementById('sabi-highlight-region');
        if (region) {
            region.style.left = `${leftPercent}%`;
            region.style.width = `${widthPercent}%`;
        }

        const valStart = document.getElementById('sabi-val-start');
        const valEnd = document.getElementById('sabi-val-end');
        const durBadge = document.getElementById('sabi-duration-badge');

        if (valStart) valStart.textContent = formatTime(start);
        if (valEnd) valEnd.textContent = formatTime(end);
        if (durBadge) durBadge.textContent = `구간 길이: ${end - start}초`;
    }

    function closeSabiEditor() {
        const modal = document.getElementById('modal-sabi-editor');
        if (modal) modal.classList.remove('open');
        if (sabiPreviewTimer) {
            clearTimeout(sabiPreviewTimer);
            sabiPreviewTimer = null;
        }
        currentSabiSong = null;
    }

    const sliderSabiStart = document.getElementById('sabi-slider-start');
    if (sliderSabiStart) {
        sliderSabiStart.addEventListener('input', () => updateSabiEditorVisuals());
    }
    const sliderSabiEnd = document.getElementById('sabi-slider-end');
    if (sliderSabiEnd) {
        sliderSabiEnd.addEventListener('input', () => updateSabiEditorVisuals());
    }

    document.querySelectorAll('.btn-chip-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-chip-preset').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const dur = parseInt(btn.dataset.dur, 10) || 35;
            const sliderStart = document.getElementById('sabi-slider-start');
            const sliderEnd = document.getElementById('sabi-slider-end');
            if (!sliderStart || !sliderEnd || !currentSabiSong) return;
            const start = parseInt(sliderStart.value, 10);
            const duration = currentSabiSong.duration || 210;
            const end = Math.min(duration, start + dur);
            sliderEnd.value = end;
            updateSabiEditorVisuals();
        });
    });

    const btnSabiPreview = document.getElementById('btn-sabi-preview');
    if (btnSabiPreview) {
        btnSabiPreview.addEventListener('click', () => {
            if (!currentSabiSong) return;
            const sliderStart = document.getElementById('sabi-slider-start');
            const sliderEnd = document.getElementById('sabi-slider-end');
            const start = parseInt(sliderStart?.value || 45, 10);
            const end = parseInt(sliderEnd?.value || 80, 10);
            const durMs = (end - start) * 1000;

            player.playSong(currentSabiSong);
            player.seekTo(start);
            showToast(`[${currentSabiSong.title}] 사비 구간(${end - start}초)을 미리 듣습니다.`);

            if (sabiPreviewTimer) clearTimeout(sabiPreviewTimer);
            sabiPreviewTimer = setTimeout(() => {
                player.pause();
                showToast('사비 구간 미리듣기가 완료되었습니다.');
            }, durMs);
        });
    }

    const btnSaveSabiEditor = document.getElementById('btn-save-sabi-editor');
    if (btnSaveSabiEditor) {
        btnSaveSabiEditor.addEventListener('click', () => {
            if (!currentSabiSong) return;
            const sliderStart = document.getElementById('sabi-slider-start');
            const sliderEnd = document.getElementById('sabi-slider-end');
            const start = parseInt(sliderStart?.value || 45, 10);
            const end = parseInt(sliderEnd?.value || 80, 10);

            const updatedSabi = { start, end, title: '사용자 맞춤 사비' };
            window.StorageManager.saveCustomSabi(currentSabiSong.id, updatedSabi);
            currentSabiSong.sabi = updatedSabi;

            if (player.currentSong && player.currentSong.id === currentSabiSong.id) {
                player.currentSong.sabi = updatedSabi;
                updatePlayerUIState();
            }

            showToast(`"${currentSabiSong.title}"의 사비 구간이 저장되었습니다!`);
            closeSabiEditor();
            refreshTrackList();
        });
    }

    const btnSabiReset = document.getElementById('btn-sabi-reset');
    if (btnSabiReset) {
        btnSabiReset.addEventListener('click', () => {
            if (!currentSabiSong) return;
            const customSabis = window.StorageManager.getCustomSabis();
            delete customSabis[currentSabiSong.id];
            localStorage.setItem('stellplay_custom_sabis', JSON.stringify(customSabis));
            showToast('사비 구간이 기본값으로 복원되었습니다.');
            closeSabiEditor();
            refreshTrackList();
        });
    }

    const btnCloseSabiEditor = document.getElementById('btn-close-sabi-editor');
    if (btnCloseSabiEditor) btnCloseSabiEditor.addEventListener('click', closeSabiEditor);
    const btnCancelSabiEditor = document.getElementById('btn-cancel-sabi-editor');
    if (btnCancelSabiEditor) btnCancelSabiEditor.addEventListener('click', closeSabiEditor);

    // ===================================================================
    // 5.4 인페이지 설정 탭 제어 (Settings Tab View)
    // ===================================================================
    function loadSettingsView() {
        const settings = window.StorageManager.getSettings();
        const crossfadeVal = settings.crossfade !== undefined ? settings.crossfade : 0;
        const sabiDurVal = settings.sabiDuration !== undefined ? settings.sabiDuration : 35;
        const engineVal = settings.engine || 'audio';

        const sliderCrossfade = document.getElementById('setting-crossfade-slider');
        const badgeCrossfade = document.getElementById('setting-crossfade-val');
        if (sliderCrossfade) sliderCrossfade.value = crossfadeVal;
        if (badgeCrossfade) badgeCrossfade.textContent = `${crossfadeVal}초`;

        const sliderSabiDur = document.getElementById('setting-sabi-dur-slider');
        const badgeSabiDur = document.getElementById('setting-sabi-dur-val');
        if (sliderSabiDur) sliderSabiDur.value = sabiDurVal;
        if (badgeSabiDur) badgeSabiDur.textContent = `${sabiDurVal}초`;

        const selectEngine = document.getElementById('setting-engine-select');
        if (selectEngine) selectEngine.value = engineVal;

    }

    // 좌측 사이드바 테마 전환 버튼 이벤트 바인딩
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    if (btnThemeToggle) {
        btnThemeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyThemeMode(newTheme);
            if (window.StorageManager) {
                window.StorageManager.setSetting('theme', newTheme);
            }
        });
    }

    const sliderCrossfade = document.getElementById('setting-crossfade-slider');
    if (sliderCrossfade) {
        sliderCrossfade.addEventListener('input', (e) => {
            const sec = parseInt(e.target.value, 10);
            const badge = document.getElementById('setting-crossfade-val');
            if (badge) badge.textContent = `${sec}초`;
            player.setCrossfade(sec);
            window.StorageManager.setSetting('crossfade', sec);
        });
    }

    const sliderSabiDur = document.getElementById('setting-sabi-dur-slider');
    if (sliderSabiDur) {
        sliderSabiDur.addEventListener('input', (e) => {
            const sec = parseInt(e.target.value, 10);
            const badge = document.getElementById('setting-sabi-dur-val');
            if (badge) badge.textContent = `${sec}초`;
            window.StorageManager.setSetting('sabiDuration', sec);
        });
    }

    const selectEngine = document.getElementById('setting-engine-select');
    if (selectEngine) {
        selectEngine.addEventListener('change', (e) => {
            window.StorageManager.setSetting('engine', e.target.value);
            player.setEngineMode(e.target.value);
            showToast(e.target.value === 'audio' ? '재생 엔진이 고음질 오디오로 설정되었습니다.' : '재생 엔진이 유튜브 MV 영상으로 설정되었습니다.');
        });
    }

    const btnSettingsSync = document.getElementById('btn-settings-sync-now');
    if (btnSettingsSync) {
        btnSettingsSync.addEventListener('click', () => {
            triggerBackgroundSync(true);
        });
    }

    const btnSettingsClearCache = document.getElementById('btn-settings-clear-cache');
    if (btnSettingsClearCache) {
        btnSettingsClearCache.addEventListener('click', () => {
            if (confirm('로컬에 저장된 재생 설정 및 임시 데이터를 초기화하시겠습니까?')) {
                localStorage.clear();
                alert('초기화가 완료되었습니다. 페이지를 새로고침합니다.');
                window.location.reload();
            }
        });
    }

    // ===================================================================
    // 5.1 곡 정보 직접 수정 (Metadata Editor)
    // ===================================================================
    function openEditSongModal(songId) {
        const song = window.getSongById(songId);
        if (!song) {
            showToast('곡 정보를 찾을 수 없습니다.');
            return;
        }

        dom.editSongId.value = song.id;
        dom.editSongTitle.value = song.title || '';
        dom.editSongArtist.value = song.artist || '';
        dom.editSongOriginalArtist.value = song.originalArtist || '';
        dom.editSongType.value = song.type || 'cover';
        dom.editSabiStart.value = song.sabi?.start ?? 45;
        dom.editSabiEnd.value = song.sabi?.end ?? 80;
        if (dom.editSongPublishedAt) {
            dom.editSongPublishedAt.value = song.publishedAt || song.releaseDate || '';
        }

        // 1분류/2분류 상태 판별
        const isStelliveGroup = (song.members && song.members.length === 1 && song.members[0] === 'group' && (!song.gen || song.gen === 'group')) ||
                               (song.artist && song.artist.includes('스텔라이브') && (!song.members || song.members.length === 0 || (song.members.length === 1 && song.members[0] === 'group')));

        let detectedUnits = [];
        if (song.gen === 'g1' || (song.artist && song.artist.includes('에버리스'))) detectedUnits.push('everlys');
        if (song.gen === 'g2' || (song.artist && song.artist.includes('유니버스'))) detectedUnits.push('universe');
        if (song.gen === 'g3' || (song.artist && song.artist.includes('클리셰'))) detectedUnits.push('cliche');

        const activeMembers = (song.members || []).filter(m => m !== 'group');

        setMemberPickerState('edit', {
            isStellive: isStelliveGroup && detectedUnits.length === 0 && activeMembers.length === 0,
            units: detectedUnits,
            members: activeMembers
        }, dom.editSongArtist);

        // 기존 저장된 아티스트명 텍스트 필드에 보존
        dom.editSongArtist.value = song.artist || '';

        dom.modalEditSong.classList.add('open');
    }

    function closeEditSongModal() {
        dom.modalEditSong.classList.remove('open');
        dom.formEditSong.reset();
        setMemberPickerState('edit', { isStellive: false, units: [], members: [] }, dom.editSongArtist);
    }

    function handleSaveSongEdit(e) {
        e.preventDefault();
        const songId = dom.editSongId.value;
        if (!songId) return;

        const memberData = getSelectedMemberData('edit');
        const updatedTitle = dom.editSongTitle.value.trim();
        const updatedArtist = dom.editSongArtist.value.trim();
        const updatedOriginal = dom.editSongOriginalArtist.value.trim();
        const updatedType = dom.editSongType.value;
        const updatedMembers = memberData.members;
        const updatedGen = memberData.gen;
        const sStart = parseInt(dom.editSabiStart.value, 10);
        const sEnd = parseInt(dom.editSabiEnd.value, 10);
        const updatedPublishedAt = dom.editSongPublishedAt ? dom.editSongPublishedAt.value.trim() : '';

        if (!updatedTitle) {
            showToast('곡 제목을 입력해주세요.');
            return;
        }

        const overrideData = {
            title: updatedTitle,
            artist: updatedArtist,
            originalArtist: updatedOriginal,
            type: updatedType,
            members: updatedMembers,
            gen: updatedGen,
            publishedAt: updatedPublishedAt,
            releaseDate: updatedPublishedAt,
            sabi: {
                start: isNaN(sStart) ? 45 : sStart,
                end: isNaN(sEnd) ? 80 : sEnd,
                title: '맞춤 후렴구'
            }
        };

        window.StorageManager.saveSongOverride(songId, overrideData);

        // 현재 재생 중인 곡이면 즉시 메타데이터 및 UI 갱신
        if (player.currentSong && player.currentSong.id === songId) {
            Object.assign(player.currentSong, overrideData);
            updatePlayerUIState();
        }

        closeEditSongModal();
        refreshTrackList();
        showToast(`"${updatedTitle}" 곡 정보가 저장되었습니다.`);
    }

    function handleDeleteSong() {
        const songId = dom.editSongId.value;
        if (!songId) return;
        const song = window.getSongById(songId);
        const title = song ? song.title : '이 곡';

        if (confirm(`정말로 "${title}" 곡을 라이브러리에서 완전히 삭제하시겠습니까?\n(삭제 후 재생 대기열 및 목록에서 모두 제외됩니다)`)) {
            window.StorageManager.hideSong(songId);
            window.StorageManager.deleteCustomSong(songId);

            // 대기열에서 제거
            if (player.queue) {
                const wasCurrent = player.currentSong && player.currentSong.id === songId;
                player.queue = player.queue.filter(s => s.id !== songId);
                if (wasCurrent) {
                    if (player.queue.length > 0) {
                        player.playTrack(Math.min(player.currentIndex, player.queue.length - 1));
                    } else {
                        player.stop();
                    }
                }
                updateQueueUI();
            }

            closeEditSongModal();
            refreshTrackList();
            showToast(`"${title}" 곡이 라이브러리에서 삭제되었습니다.`);
        }
    }

    function handleResetSongEdit() {
        const songId = dom.editSongId.value;
        if (!songId) return;

        if (confirm('이 곡의 수정한 정보를 초기화하고 원래 정규 기본값으로 되돌리시겠습니까?')) {
            window.StorageManager.resetSongOverride(songId);

            // 현재 재생 중인 곡이면 정규 기본 데이터로 갱신
            if (player.currentSong && player.currentSong.id === songId) {
                const freshSong = window.getSongById(songId);
                if (freshSong) {
                    player.currentSong = { ...freshSong };
                    updatePlayerUIState();
                }
            }

            closeEditSongModal();
            refreshTrackList();
            showToast('곡 정보가 기본값으로 복원되었습니다.');
        }
    }

    // ===================================================================
    // 5.2 백그라운드 신곡 자동 감지/동기화 (Zero-Lag Auto-Detect)
    // ===================================================================
    let isSyncing = false;
    async function triggerBackgroundSync(isManual = false) {
        if (isSyncing) return;

        // 자동 동기화 시 12시간 쿨다운 검사
        if (!isManual) {
            const lastSync = window.StorageManager.getLastSyncTime();
            const twelveHours = 12 * 60 * 60 * 1000;
            if (Date.now() - lastSync < twelveHours) {
                return;
            }
        }

        isSyncing = true;
        if (dom.btnSyncNewSongs) {
            dom.btnSyncNewSongs.classList.add('syncing');
            dom.btnSyncNewSongs.disabled = true;
        }

        if (isManual) {
            showToast('최신 스텔라이브 공식 신곡을 탐색 중입니다...');
        }

        try {
            let data = null;
            const isWeb = (window.location.port !== '8888');

            if (isWeb) {
                // 웹(GitHub Pages) 정적 호스팅 환경: GitHub 동기화 파일(songs-latest.json) 조회
                const res = await fetch(`./songs-latest.json?t=${Date.now()}`);
                if (!res.ok) throw new Error(`웹 신곡 데이터 로드 실패 (${res.status})`);
                data = await res.json();
            } else {
                // 로컬 PC 앱 환경: 파이썬 백엔드 API 호출
                const res = await fetch('/api/sync-new-songs');
                if (!res.ok) throw new Error('신곡 동기화 서버 응답 실패');
                data = await res.json();
            }

            if (data.success && Array.isArray(data.tracks)) {
                const currentSongs = window.getAllSongs();
                const existingYtIds = new Set(currentSongs.map(s => s.youtubeId).filter(Boolean));
                currentSongs.forEach(s => { if (s.id) existingYtIds.add(s.id); });

                const newTracks = [];
                for (const t of data.tracks) {
                    const ytId = t.id;
                    if (!existingYtIds.has(ytId) && !existingYtIds.has(`auto-${ytId}`)) {
                        const cleanedTitle = cleanAndKoreanizeTitle(t.title || '');
                        const textToAnalyze = `${t.title || ''} ${t.uploader || ''} ${t.channelTitle || ''}`;
                        let detected = detectMembersFromText(textToAnalyze);
                        if (detected.length === 0 && t.defaultMember && t.defaultMember !== 'group') {
                            detected = [t.defaultMember];
                        }
                        if (detected.length === 0) {
                            detected = ['group'];
                        }

                        let artistName = '스텔라이브';
                        let genKey = 'group';
                        if (detected.length === 1 && detected[0] !== 'group') {
                            const memberObj = window.MEMBERS ? window.MEMBERS[detected[0]] : null;
                            artistName = memberObj ? memberObj.name : detected[0];
                            genKey = memberObj ? memberObj.gen : 'group';
                        } else if (detected.length > 1) {
                            const memberNames = detected
                                .filter(m => m !== 'group')
                                .map(m => (window.MEMBERS && window.MEMBERS[m]) ? window.MEMBERS[m].name : m);
                            artistName = memberNames.length > 0 ? memberNames.join(', ') : '스텔라이브';
                            const gens = new Set(detected.map(m => (window.MEMBERS && window.MEMBERS[m]) ? window.MEMBERS[m].gen : null).filter(Boolean));
                            genKey = (gens.size === 1) ? Array.from(gens)[0] : 'group';
                        }

                        const dur = parseInt(t.duration, 10) || 200;
                        const sStart = Math.floor(dur * 0.25);
                        const sEnd = Math.min(dur - 5, sStart + 35);
                        const publishedAt = t.publishedAt || (t.upload_date ? `${t.upload_date.slice(0,4)}-${t.upload_date.slice(4,6)}-${t.upload_date.slice(6,8)}` : new Date().toISOString().split('T')[0]);

                        newTracks.push({
                            id: `auto-${ytId}`,
                            title: cleanedTitle,
                            artist: artistName,
                            originalArtist: t.defaultType === 'original' ? '스텔라이브 오리지널' : '커버곡',
                            type: t.defaultType || 'cover',
                            members: detected,
                            gen: genKey,
                            youtubeId: ytId,
                            duration: dur,
                            publishedAt: publishedAt,
                            sabi: {
                                start: sStart,
                                end: sEnd,
                                title: '하이라이트'
                            },
                            isAutoAdded: true
                        });
                        existingYtIds.add(ytId);
                    }
                }

                if (newTracks.length > 0) {
                    window.StorageManager.addAutoDetectedSongs(newTracks);
                    refreshTrackList();
                    showToast(`🎉 새로운 공식 신곡 ${newTracks.length}곡이 등록되었습니다!`);
                } else if (isManual) {
                    showToast('현재 모든 공식 신곡이 최신 상태입니다.');
                }

                window.StorageManager.setLastSyncTime();
            }
        } catch (err) {
            console.warn('[Sync] Auto-detection error:', err);
            if (isManual) {
                showToast('신곡 탐색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
        } finally {
            isSyncing = false;
            if (dom.btnSyncNewSongs) {
                dom.btnSyncNewSongs.classList.remove('syncing');
                dom.btnSyncNewSongs.disabled = false;
            }
        }
    }

    // ===================================================================
    // 6. 유틸리티 함수 (시간 포맷, 토스트)
    // ===================================================================
    function formatTime(seconds) {
        if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>${message}</span>`;
        dom.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    window.showToast = showToast;

    // 초기 실행
    initApp();
});
