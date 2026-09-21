/**
 * StellPlay Mobile - 앱 컨트롤러 (App Controller v2.0)
 * - 4행 텍스트 전용 멤버 & 기수 컬렉션 필터 (화면 짤림 방지 반응형 랩핑)
 * - 실시간 재생목록(대기열) 슬라이드 시트 & 핸들(☰) 전용 터치/마우스 드래그 순서 재배치
 * - 트랙 옵션 메뉴(⋮) 바텀시트: 곡 수정, 곡 삭제/숨김, 오프라인 다운로드, 보관함
 * - 모바일 전용 곡 추가 / 곡 정보 수정 모달
 * - 신곡 자동 탐색 & 숨긴 곡 전체 복원 기능 연동
 * - 오프라인 Blob 음원 및 독립형 재생 연동
 * - 뷰 전환 (홈, 사비, 오프라인, 보관함, 설정)
 */

document.addEventListener('DOMContentLoaded', async () => {
    const player = new window.MobilePlayer();
    window.player = player;

    // 모바일 상태
    const state = {
        activeView: 'view-home',
        selectedMember: 'all',
        selectedMajor: 'all',
        selectedSub: null,
        sortOrder: 'latest',
        selectedType: 'all',
        searchQuery: '',
        downloadingIds: new Set(),
        offlineSongIds: new Set(),
        cachedSongIds: new Set(),
        favorites: window.StorageManager ? window.StorageManager.getFavorites() : JSON.parse(localStorage.getItem('stellplay_m_favs') || '[]'),
        selectedActionSong: null,
        isSyncing: false,
        selectedSongIds: new Set(),
        isMultiSelectHome: false,
        offlineSelectedSongIds: new Set(),
        isOfflineSelectMode: false,
        activePlaylistDetailId: null
    };

    // DOM 캐싱
    const dom = {
        // 헤더 & 계층형 멤버 필터
        searchInput: document.getElementById('m-search-input'),
        searchClear: document.getElementById('m-search-clear'),
        searchBarWrap: document.querySelector('.search-bar-wrap'),
        membersContainer: document.getElementById('m-members-filter-container') || document.getElementById('m-members-grid'),
        membersGrid: document.getElementById('m-members-grid') || document.getElementById('m-members-filter-container'),
        majorBtns: document.querySelectorAll('.member-major-btn'),
        membersSubRow: document.getElementById('m-members-sub-row'),
        memberBtns: document.querySelectorAll('.member-text-btn'),
        networkBadge: document.getElementById('network-badge'),
        headerSabiBtn: document.getElementById('m-header-sabi-btn'),
        headerSabiText: document.getElementById('m-header-sabi-text'),
        btnSwitchPc: document.getElementById('m-btn-switch-pc'),
        sortSelect: document.getElementById('m-sort-select'),
        btnRandomPlayFiltered: document.getElementById('btn-random-play-filtered'),

        // 뷰
        viewSections: document.querySelectorAll('.view-section'),
        typePills: document.querySelectorAll('.type-pill'),
        trackCountHome: document.getElementById('m-track-count'),
        trackListHome: document.getElementById('m-track-list-home'),
        trackCountSabi: document.getElementById('m-sabi-count'),
        trackListSabi: document.getElementById('m-track-list-sabi'),
        btnPlaySabiAll: document.getElementById('btn-play-sabi-all'),

        // 홈 퀵 액션 바 & 멀티선택
        btnOpenQueueHome: document.getElementById('btn-open-queue-home'),
        btnQueueHomeText: document.getElementById('btn-queue-home-text'),
        btnOpenAddSongHome: document.getElementById('btn-open-add-song-home'),
        btnSyncSongsHome: document.getElementById('btn-sync-songs-home'),
        btnToggleMultiselectHome: document.getElementById('btn-toggle-multiselect-home'),
        multiselectBar: document.getElementById('m-multiselect-bar'),
        multiselectCount: document.getElementById('m-multiselect-count'),
        btnMultiselectAll: document.getElementById('btn-multiselect-all'),
        btnMultiselectPlay: document.getElementById('btn-multiselect-play'),
        btnMultiselectAddPlaylist: document.getElementById('btn-multiselect-add-playlist'),
        btnMultiselectCancel: document.getElementById('btn-multiselect-cancel'),

        // 오프라인
        offlineStatsCount: document.getElementById('offline-stats-count'),
        offlineStatsSize: document.getElementById('offline-stats-size'),
        offlineTrackCount: document.getElementById('offline-track-count'),
        trackListOffline: document.getElementById('m-track-list-offline'),
        btnOfflinePlayAll: document.getElementById('btn-offline-play-all'),
        btnOfflineSelectMode: document.getElementById('btn-offline-select-mode'),
        btnOfflineClearAll: document.getElementById('btn-offline-clear-all'),
        offlineDeleteBar: document.getElementById('m-offline-delete-bar'),
        offlineDeleteCount: document.getElementById('m-offline-delete-count'),
        btnOfflineDeleteSelectAll: document.getElementById('btn-offline-delete-select-all'),
        btnOfflineDeleteConfirm: document.getElementById('btn-offline-delete-confirm'),
        btnOfflineDeleteCancel: document.getElementById('btn-offline-delete-cancel'),
        tabBadgeOffline: document.getElementById('tab-badge-offline'),

        // 재생목록 탭 (Playlists)
        playlistsListContainer: document.getElementById('m-playlists-list-container'),
        playlistDetailContainer: document.getElementById('m-playlist-detail-container'),
        cardPlaylistFavorites: document.getElementById('card-playlist-favorites'),
        btnPlayFavPlaylist: document.getElementById('btn-play-fav-playlist'),
        favPlaylistCount: document.getElementById('fav-playlist-count'),
        playlistsGrid: document.getElementById('m-playlists-grid'),
        playlistsCustomCount: document.getElementById('playlists-custom-count'),
        btnPlaylistDetailBack: document.getElementById('btn-playlist-detail-back'),
        btnPlaylistDetailPlayAll: document.getElementById('btn-playlist-detail-play-all'),
        btnPlaylistDetailDelete: document.getElementById('btn-playlist-detail-delete'),
        btnPlaylistDetailClearHistory: document.getElementById('btn-playlist-detail-clear-history'),
        btnPlaylistDetailAddTracks: document.getElementById('btn-playlist-detail-add-tracks'),
        detailPlaylistTitle: document.getElementById('detail-playlist-title'),
        detailPlaylistCount: document.getElementById('detail-playlist-count'),
        detailPlaylistIcon: document.getElementById('detail-playlist-icon'),
        detailPlaylistTracks: document.getElementById('m-playlist-detail-tracks'),
        btnCreatePlaylistTop: document.getElementById('btn-create-playlist'),

        // 재생목록 모달
        modalSelectPlaylist: document.getElementById('m-modal-select-playlist'),
        modalPlaylistList: document.getElementById('m-modal-playlist-list'),
        btnCloseSelectPlaylist: document.getElementById('m-btn-close-select-playlist'),
        inputNewPlaylistQuick: document.getElementById('m-input-new-playlist-quick'),
        btnCreateAndAddPlaylist: document.getElementById('m-btn-create-and-add-playlist'),

        modalCreatePlaylist: document.getElementById('m-modal-create-playlist'),
        formCreatePlaylist: document.getElementById('m-form-create-playlist'),
        inputCreatePlaylistName: document.getElementById('m-input-create-playlist-name'),
        btnCloseCreatePlaylist: document.getElementById('m-btn-close-create-playlist'),
        btnCancelCreatePlaylist: document.getElementById('m-btn-cancel-create-playlist'),

        // 대기열 저장
        btnSaveQueuePlaylist: document.getElementById('m-btn-save-queue-playlist'),

        // 보관함 & 설정
        favTrackCount: document.getElementById('fav-track-count'),
        trackListFav: document.getElementById('m-track-list-fav'),
        settingsStorageInfo: document.getElementById('settings-storage-info'),
        btnClearCacheSettings: document.getElementById('btn-clear-cache-settings'),
        btnToggleDataSaverSettings: document.getElementById('btn-toggle-datasaver-settings'),
        dataSaverStatus: document.getElementById('m-datasaver-status'),
        cacheSizeBadge: document.getElementById('m-cache-size-badge'),
        crossfadeBadge: document.getElementById('m-crossfade-current-badge'),
        crossfadeSlider: document.getElementById('m-crossfade-slider'),
        crossfadeToggle: document.getElementById('m-crossfade-toggle'),
        crossfadeToggleSwitch: document.getElementById('m-crossfade-toggle-switch'),
        crossfadeToggleKnob: document.getElementById('m-crossfade-toggle-knob'),
        crossfadeSliderWrap: document.getElementById('m-crossfade-slider-wrap'),
        btnThemeDark: document.getElementById('m-btn-theme-dark'),
        btnThemeLight: document.getElementById('m-btn-theme-light'),
        btnTopTheme: document.getElementById('m-btn-top-theme'),
        topThemeIcon: document.getElementById('m-top-theme-icon'),
        qualityBtns: document.querySelectorAll('.quality-opt-btn'),
        btnSyncSongsSettings: document.getElementById('btn-sync-songs-settings'),
        btnRestoreHiddenSettings: document.getElementById('btn-restore-hidden-settings'),

        // 하단 탭
        tabBtns: document.querySelectorAll('.tab-btn'),

        // 미니 플레이어
        miniPlayer: document.getElementById('m-mini-player'),
        miniThumbImg: document.getElementById('mini-thumb-img'),
        miniTitle: document.getElementById('mini-title'),
        miniArtist: document.getElementById('mini-artist'),
        miniPlayBtn: document.getElementById('mini-play-btn'),
        miniNextBtn: document.getElementById('mini-next-btn'),
        miniQueueBtn: document.getElementById('mini-queue-btn'),
        miniProgressFill: document.getElementById('mini-progress-fill'),
        miniLeftContent: document.getElementById('mini-left-content'),

        // 전체화면 시트
        fullscreenSheet: document.getElementById('m-fullscreen-sheet'),
        sheetCloseBtn: document.getElementById('sheet-close-btn'),
        sheetQueueBtn: document.getElementById('sheet-queue-btn'),
        sheetMenuBtn: document.getElementById('sheet-menu-btn'),
        sheetDownloadBtn: document.getElementById('sheet-download-btn'),
        sheetVinylDisc: document.getElementById('sheet-vinyl-disc'),
        sheetAlbumImg: document.getElementById('sheet-album-img'),
        vinylContainer: document.querySelector('.vinyl-album-container'),
        sheetSongTitle: document.getElementById('sheet-song-title'),
        sheetSongArtist: document.getElementById('sheet-song-artist'),
        sheetSeekSlider: document.getElementById('sheet-seek-slider'),
        sheetCurrentTime: document.getElementById('sheet-current-time'),
        sheetTotalDuration: document.getElementById('sheet-total-duration'),
        sheetShuffleBtn: document.getElementById('sheet-shuffle-btn'),
        sheetPrevBtn: document.getElementById('sheet-prev-btn'),
        sheetPlayBtn: document.getElementById('sheet-play-btn'),
        sheetNextBtn: document.getElementById('sheet-next-btn'),
        sheetSabiBtn: document.getElementById('sheet-sabi-btn'),
        sheetModeBadge: document.getElementById('sheet-mode-badge'),
        btnViewArt: document.getElementById('m-btn-view-art'),
        btnViewVideo: document.getElementById('m-btn-view-video'),
        sheetArtBox: document.getElementById('m-sheet-art-box'),
        sheetVideoBox: document.getElementById('m-sheet-video-box'),
        videoDockTarget: document.getElementById('m-video-dock-target'),
        adFloatingBanner: document.getElementById('m-ad-floating-banner'),
        btnOpenAdSkip: document.getElementById('m-btn-open-ad-skip'),

        // 대기열 시트
        queueSheet: document.getElementById('m-queue-sheet'),
        queueBackdrop: document.getElementById('m-queue-backdrop'),
        queueTopZone: document.getElementById('m-queue-top-zone'),
        queueSheetHandle: document.getElementById('m-queue-sheet-handle'),
        queueCount: document.getElementById('m-queue-count'),
        queueList: document.getElementById('m-queue-list'),
        btnClearQueue: document.getElementById('m-btn-clear-queue'),
        btnCloseQueue: document.getElementById('m-btn-close-queue'),

        // PC 서버 연동 설정
        pcServerInput: document.getElementById('m-pc-server-input'),
        pcServerSaveBtn: document.getElementById('m-pc-server-save-btn'),
        pcServerBadge: document.getElementById('m-pc-server-badge'),

        // 트랙 액션 바텀시트
        sheetTrackActions: document.getElementById('m-sheet-track-actions'),
        actionsBackdrop: document.getElementById('m-actions-backdrop'),
        actionTrackThumb: document.getElementById('m-action-track-thumb'),
        actionTrackTitle: document.getElementById('m-action-track-title'),
        actionTrackArtist: document.getElementById('m-action-track-artist'),
        btnCloseActions: document.getElementById('m-btn-close-actions'),
        actEdit: document.getElementById('m-act-edit'),
        actPlaylist: document.getElementById('m-act-playlist') || document.getElementById('m-act-fav'),
        actSabi: document.getElementById('m-act-sabi'),
        actDownload: document.getElementById('m-act-download'),
        actDownloadText: document.getElementById('m-act-download-text'),
        actFav: document.getElementById('m-act-fav'),
        actFavText: document.getElementById('m-act-fav-text'),
        actDelete: document.getElementById('m-act-delete'),
        actDeleteText: document.getElementById('m-act-delete-text'),

        // 곡 추가 모달
        modalAddSong: document.getElementById('m-modal-add-song'),
        btnCloseAddModal: document.getElementById('m-btn-close-add-modal'),
        btnCancelAdd: document.getElementById('m-btn-cancel-add'),
        btnAutoFetchAdd: document.getElementById('m-btn-auto-fetch-add'),
        formAddSong: document.getElementById('m-form-add-song'),
        addYoutube: document.getElementById('m-add-youtube'),
        addTitle: document.getElementById('m-add-title'),
        addArtist: document.getElementById('m-add-artist'),
        addType: document.getElementById('m-add-type'),
        addMember: document.getElementById('m-add-member'),
        addSabiStart: document.getElementById('m-add-sabi-start'),
        addSabiEnd: document.getElementById('m-add-sabi-end'),

        // 곡 수정 모달
        modalEditSong: document.getElementById('m-modal-edit-song'),
        btnCloseEditModal: document.getElementById('m-btn-close-edit-modal'),
        btnCancelEdit: document.getElementById('m-btn-cancel-edit'),
        formEditSong: document.getElementById('m-form-edit-song'),
        editSongId: document.getElementById('m-edit-song-id'),
        editTitle: document.getElementById('m-edit-title'),
        editArtist: document.getElementById('m-edit-artist'),
        editOriginalArtist: document.getElementById('m-edit-original-artist'),
        editType: document.getElementById('m-edit-type'),
        editPublishedAt: document.getElementById('m-edit-published-at'),
        editMember: document.getElementById('m-edit-member'),
        editSabiStart: document.getElementById('m-edit-sabi-start'),
        editSabiEnd: document.getElementById('m-edit-sabi-end'),
        btnResetSongEdit: document.getElementById('m-btn-reset-song-edit'),

        // 사비 에디터 모달
        modalSabiEditor: document.getElementById('m-modal-sabi-editor'),
        btnCloseSabiEditor: document.getElementById('m-btn-close-sabi-editor'),
        btnCancelSabiEditor: document.getElementById('m-btn-cancel-sabi-editor'),
        btnSaveSabiEditor: document.getElementById('m-btn-save-sabi-editor'),
        sabiThumb: document.getElementById('m-sabi-thumb'),
        sabiTitle: document.getElementById('m-sabi-title'),
        sabiArtist: document.getElementById('m-sabi-artist'),
        sabiDurationBadge: document.getElementById('m-sabi-duration-badge'),
        sabiHighlightBar: document.getElementById('m-sabi-highlight-bar'),
        sabiPlayhead: document.getElementById('m-sabi-playhead'),
        sabiTimeMin: document.getElementById('m-sabi-time-min'),
        sabiTimeMax: document.getElementById('m-sabi-time-max'),
        sabiStartLabel: document.getElementById('m-sabi-start-label'),
        sabiEndLabel: document.getElementById('m-sabi-end-label'),
        sabiStartSlider: document.getElementById('m-sabi-start-slider'),
        sabiEndSlider: document.getElementById('m-sabi-end-slider'),
        btnSabiStartSub1: document.getElementById('btn-sabi-start-sub1'),
        btnSabiStartAdd1: document.getElementById('btn-sabi-start-add1'),
        btnSabiStartAdd5: document.getElementById('btn-sabi-start-add5'),
        btnSabiEndSub5: document.getElementById('btn-sabi-end-sub5'),
        btnSabiEndSub1: document.getElementById('btn-sabi-end-sub1'),
        btnSabiEndAdd1: document.getElementById('btn-sabi-end-add1'),
        btnSabiPreviewToggle: document.getElementById('btn-sabi-preview-toggle'),
        // 분위기 추천 & 모달
        moodCardsList: document.getElementById('m-mood-cards-list'),
        modalMoodDetail: document.getElementById('m-modal-mood-detail'),
        moodModalIcon: document.getElementById('m-mood-modal-icon'),
        moodModalTitle: document.getElementById('m-mood-modal-title'),
        moodModalSub: document.getElementById('m-mood-modal-sub'),
        moodTrackList: document.getElementById('m-mood-track-list'),
        btnMoodPlayAll: document.getElementById('btn-mood-play-all'),
        btnMoodRefresh: document.getElementById('btn-mood-refresh'),
        btnMoodSavePlaylist: document.getElementById('btn-mood-save-playlist'),
        btnCloseMoodModal: document.getElementById('m-btn-close-mood-modal'),

        toastContainer: document.getElementById('toast-container')
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // 화면 테마 설정 (라이트 / 다크 모드)
    function applyMobileTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (dom.btnThemeDark) dom.btnThemeDark.classList.toggle('active', theme === 'dark');
        if (dom.btnThemeLight) dom.btnThemeLight.classList.toggle('active', theme === 'light');
        if (dom.topThemeIcon) {
            dom.topThemeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        if (dom.btnTopTheme) {
            dom.btnTopTheme.setAttribute('title', theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환');
        }
        if (window.StorageManager && typeof window.StorageManager.setSetting === 'function') {
            window.StorageManager.setSetting('theme', theme);
        } else {
            localStorage.setItem('stellplay_theme', theme);
        }
    }

    // ===================================================================
    // 1. 초기화 (Init)
    // ===================================================================
    async function init() {
        // 화면 테마 모드 복원 (다크 / 라이트)
        const savedTheme = (window.StorageManager && typeof window.StorageManager.getSettings === 'function')
            ? (window.StorageManager.getSettings().theme || 'dark')
            : (localStorage.getItem('stellplay_theme') || 'dark');
        applyMobileTheme(savedTheme);

        await refreshOfflineCacheState();
        initMemberButtons();
        syncSabiUI();
        renderHomeTracks();
        renderOfflineTracks();
        renderPlaylists();
        updateQueueBadge();
        initPcServerSettings();
        bindEvents();
        updateNetworkStatus();
        updateSettingsCacheInfo();

        // PWA 서비스 워커 등록
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').catch(() => {});
        }

        // 초기 실행 시 첫 곡을 대기열 및 미니 플레이어에 장착하여 즉시 재생 준비
        if (player && !player.currentSong) {
            const defaultSongs = (state.currentHomeSongs && state.currentHomeSongs.length > 0)
                ? state.currentHomeSongs
                : (window.getAllSongs ? window.getAllSongs() : []);
            if (defaultSongs.length > 0) {
                const firstSong = defaultSongs[0];
                player.queue = [...defaultSongs];
                player.queueIndex = 0;
                player.currentSong = firstSong;
                updatePlayerUI(firstSong, false);
            }
        }

        // 백그라운드 재생 중인 네이티브 서비스 상태 동기화
        if (player && typeof player.syncFromNative === 'function') {
            player.syncFromNative();
        }

        // 앱 실행 3초 후 백그라운드 신곡 자동 동기화 (초기 로딩 0초 지연 보장, 15분 주기)
        setTimeout(() => {
            syncNewSongs(false);
        }, 3000);
    }

    // 갤럭시 Z 폴드 등 화면 접기/펼침(Configuration 변경) 시 UI 리렌더링 및 네이티브 재생상태 동기화
    window.onFoldConfigurationChanged = function() {
        renderAllViews();
        if (player && typeof player.syncFromNative === 'function') {
            player.syncFromNative();
        }
    };

    function initPcServerSettings() {
        const savedIp = localStorage.getItem('stellplay_pc_server') || '';
        if (dom.pcServerInput) dom.pcServerInput.value = savedIp;
        updatePcServerBadge(savedIp);

        if (dom.pcServerSaveBtn) {
            dom.pcServerSaveBtn.addEventListener('click', async () => {
                const val = (dom.pcServerInput?.value || '').trim().replace(/\/+$/, '');
                if (!val) {
                    localStorage.removeItem('stellplay_pc_server');
                    updatePcServerBadge('');
                    showToast('PC 서버 연동이 해제되었습니다.');
                    return;
                }
                const formatted = val.startsWith('http://') || val.startsWith('https://') ? val : `http://${val}`;
                localStorage.setItem('stellplay_pc_server', formatted);
                if (dom.pcServerInput) dom.pcServerInput.value = formatted;
                updatePcServerBadge(formatted);
                showToast('PC 서버 IP가 저장되었습니다. 연결 상태를 확인 중...');

                try {
                    const res = await fetch(`${formatted}/api/songs`, { signal: AbortSignal.timeout(3000) });
                    if (res.ok) {
                        showToast('🎉 PC 서버와 정상 연결되었습니다! (고음질 스트리밍 & 다운로드 활성화)');
                    } else {
                        showToast('⚠️ PC 서버 응답 확인 필요 (PC에서 서버가 켜져 있는지 확인)');
                    }
                } catch (e) {
                    showToast('ℹ️ IP 저장 완료 (같은 Wi-Fi 공유기에 연결되어 있는지 확인해주세요)');
                }
            });
        }
    }

    function updatePcServerBadge(serverUrl) {
        if (!dom.pcServerBadge) return;
        if (serverUrl) {
            dom.pcServerBadge.textContent = '연동 활성 (Wi-Fi 스트리밍)';
            dom.pcServerBadge.style.background = 'rgba(56, 189, 248, 0.15)';
            dom.pcServerBadge.style.color = '#38bdf8';
            dom.pcServerBadge.style.border = '1px solid rgba(56, 189, 248, 0.3)';
        } else {
            dom.pcServerBadge.textContent = '미연동 (직접 재생)';
            dom.pcServerBadge.style.background = 'rgba(255, 255, 255, 0.08)';
            dom.pcServerBadge.style.color = 'var(--text-muted)';
            dom.pcServerBadge.style.border = 'none';
        }
    }

    async function refreshOfflineCacheState() {
        state.offlineSongIds = new Set();
        state.cachedSongIds = new Set();
        if (dom.offlineStatsCount) dom.offlineStatsCount.textContent = '0곡 저장됨';
        if (dom.offlineStatsSize) dom.offlineStatsSize.textContent = '0 MB 사용 중';
        if (dom.offlineTrackCount) dom.offlineTrackCount.textContent = '0곡';
        if (dom.tabBadgeOffline) dom.tabBadgeOffline.style.display = 'none';
        if (dom.settingsStorageInfo) dom.settingsStorageInfo.textContent = '0 MB';
    }

    function updateNetworkStatus() {
        if (!dom.networkBadge) return;
        const isOnline = navigator.onLine;
        if (isOnline) {
            dom.networkBadge.innerHTML = '<span style="width:6px; height:6px; border-radius:50%; background:#10b981;"></span><span>ONLINE</span>';
            dom.networkBadge.style.color = '#10b981';
        } else {
            dom.networkBadge.innerHTML = '<span style="width:6px; height:6px; border-radius:50%; background:#ef4444;"></span><span>OFFLINE</span>';
            dom.networkBadge.style.color = '#ef4444';
        }
    }

    function updateQueueBadge() {
        const count = player.queue ? player.queue.length : 0;
        if (dom.btnQueueHomeText) {
            dom.btnQueueHomeText.textContent = `대기열 (${count})`;
        }
        if (dom.queueCount) {
            dom.queueCount.textContent = `${count}곡`;
        }
    }

    // ===================================================================
    // 2. 계층형 2줄 멤버 필터 초기화 (대분류 & 소분류)
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

    function initMemberButtons() {
        if (dom.majorBtns && dom.majorBtns.length > 0) {
            dom.majorBtns.forEach(btn => {
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
        state.selectedMember = majorKey;

        if (dom.majorBtns) {
            dom.majorBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.major === majorKey);
            });
        }

        renderSubFilterRow();
        requestAnimationFrame(() => {
            renderAllViews();
        });
    }

    function renderSubFilterRow() {
        if (!dom.membersSubRow) return;
        const items = SUB_FILTER_CONFIG[state.selectedMajor] || [];
        dom.membersSubRow.innerHTML = '';

        if (items.length === 0) {
            dom.membersSubRow.classList.remove('has-items');
            dom.membersSubRow.style.display = 'none';
            return;
        }

        dom.membersSubRow.classList.add('has-items');
        dom.membersSubRow.style.display = 'flex';

        items.forEach(item => {
            const btn = document.createElement('button');
            btn.className = `member-sub-btn ${item.btnClass || 'btn-white'} ${state.selectedSub === item.id ? 'active' : ''}`;
            btn.dataset.sub = item.id;
            btn.textContent = item.name;

            btn.addEventListener('click', () => {
                if (state.selectedSub === item.id) {
                    state.selectedSub = null;
                    btn.classList.remove('active');
                } else {
                    state.selectedSub = item.id;
                    dom.membersSubRow.querySelectorAll('.member-sub-btn').forEach(b => {
                        b.classList.toggle('active', b.dataset.sub === item.id);
                    });
                }
                requestAnimationFrame(() => {
                    renderAllViews();
                });
            });

            dom.membersSubRow.appendChild(btn);
        });
    }

    // ===================================================================
    // 3. 트랙 행 렌더러 생성
    // ===================================================================
    function createTrackRowElement(song, songsArray, index) {
        const row = document.createElement('div');
        row.className = 'm-track-row';
        row.dataset.songId = song.id;

        const isPlaying = player.currentSong && player.currentSong.id === song.id;
        if (isPlaying) row.classList.add('playing');

        const isDownloaded = state.offlineSongIds.has(song.id);
        const isDownloading = state.downloadingIds.has(song.id);
        const isCached = !isDownloaded && (
            (state.cachedSongIds && (state.cachedSongIds.has(song.youtubeId) || state.cachedSongIds.has(song.id))) ||
            (window.AndroidBridge && typeof window.AndroidBridge.isSongCached === 'function' && window.AndroidBridge.isSongCached(song.id, song.youtubeId || ''))
        );

        let statusBadge = '';
        if (isDownloaded) {
            statusBadge = '<span class="m-track-status-badge offline">OFFLINE</span>';
        } else if (isCached) {
            statusBadge = '<span class="m-track-status-badge cache">CACHE</span>';
        }

        const thumbUrl = `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`;
        const isSelected = state.isMultiSelectHome ? state.selectedSongIds.has(song.id) : (state.isOfflineSelectMode ? state.offlineSelectedSongIds.has(song.id) : false);

        let typeBadge = '';
        if (song.type === 'original') typeBadge = '<span class="m-track-type-badge original">ORIGINAL</span>';
        else if (song.type === 'cover') typeBadge = '<span class="m-track-type-badge cover">COVER</span>';
        else if (song.type === 'featuring') typeBadge = '<span class="m-track-type-badge feat">FEAT</span>';

        row.innerHTML = `
            <div class="m-track-select-box">
                <div class="m-custom-checkbox ${isSelected ? 'checked' : ''}" data-id="${song.id}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
            </div>
            <div class="m-track-left">
                <div class="m-track-thumb-wrap">
                    <img class="m-track-thumb" src="${thumbUrl}" alt="" loading="lazy">
                    <div class="m-track-playing-indicator">
                        <span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span>
                    </div>
                </div>
                <div class="m-track-meta">
                    <div class="m-track-title-row">
                        <span class="m-track-title">${escapeHtml(song.title)}</span>
                        ${typeBadge}
                    </div>
                    <div class="m-track-sub-row">
                        <span class="m-track-artist">${escapeHtml(song.artist)}</span>
                        ${statusBadge}
                    </div>
                </div>
            </div>
            <div class="m-track-actions">
                <button class="m-btn-action btn-add-to-playlist" data-id="${song.id}" title="재생목록에 추가">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                </button>
                <button class="m-btn-action m-btn-track-menu" data-id="${song.id}" title="추가 옵션">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                    </svg>
                </button>
            </div>
        `;

        row.dataset.index = index;
        return row;
    }

    // ===================================================================
    // 트랙 컨테이너 레벨 이벤트 위임 (개별 리스너 1,650개 -> 컨테이너 1개로 압축)
    // ===================================================================
    function handleTrackContainerClick(e, getSongsFn) {
        const row = e.target.closest('.m-track-row');
        if (!row) return;
        const songId = row.dataset.songId;
        if (!songId) return;

        const songs = typeof getSongsFn === 'function' ? getSongsFn() : (getSongsFn || state.currentHomeSongs || []);
        const song = (songs && songs.find(s => s.id === songId)) || (window.getAllSongs && window.getAllSongs().find(s => s.id === songId));
        if (!song) return;

        // 1. 체크박스 클릭
        const chk = e.target.closest('.m-custom-checkbox') || e.target.closest('.m-track-select-box');
        if (chk) {
            e.stopPropagation();
            if (state.isMultiSelectHome) {
                toggleSongSelection(song.id);
            } else if (state.isOfflineSelectMode) {
                toggleOfflineSongSelection(song.id);
            }
            return;
        }

        // 3. 재생목록에 추가 버튼 (+)
        const addPl = e.target.closest('.btn-add-to-playlist');
        if (addPl) {
            e.stopPropagation();
            openAddToPlaylistModal([song.id]);
            return;
        }

        // 4. 추가 메뉴 버튼 (⋮)
        const menuBtn = e.target.closest('.m-btn-track-menu');
        if (menuBtn) {
            e.stopPropagation();
            openTrackActions(song);
            return;
        }

        // 5. 재생목록 상세 화면 내 제거 버튼
        const rmBtn = e.target.closest('.btn-remove-from-playlist');
        if (rmBtn) {
            e.stopPropagation();
            const plId = state.activePlaylistDetailId;
            if (plId) {
                const isFav = (plId === 'pl-favorites' || plId === 'card-playlist-favorites');
                StorageManager.removeSongFromPlaylist(isFav ? 'pl-favorites' : plId, song.id);
                showToast(`'${song.title}' 곡이 재생목록에서 제거되었습니다.`);
                openPlaylistDetail(plId);
                renderPlaylists();
            }
            return;
        }

        // 6. 트랙 행 본체 클릭 (.m-track-left 또는 기타 비액션 영역)
        if (!e.target.closest('.m-track-actions')) {
            if (state.isMultiSelectHome) {
                toggleSongSelection(song.id);
                return;
            }
            if (state.isOfflineSelectMode) {
                toggleOfflineSongSelection(song.id);
                return;
            }
            const songsList = (songs && songs.length > 0) ? songs : [song];
            const idx = songsList.findIndex(s => s.id === song.id);
            player.setQueue(songsList, idx >= 0 ? idx : 0, true);
        }
    }

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

    // ===================================================================
    // 4. 각 뷰별 목록 렌더러 및 공통 필터
    // ===================================================================
    function filterSongList(list, applyType = true) {
        if (!list || !Array.isArray(list)) return [];
        let res = [...list];

        // 0. 해시태그(#) 및 쇼츠(Shorts) 영상 원천 제외
        res = res.filter(s => {
            const title = s.title || '';
            if (title.includes('#')) return false;
            const tl = title.toLowerCase();
            if (tl.includes('shorts') || tl.includes('#shorts') || tl.includes('chal') || tl.includes('틱톡')) return false;
            if (s.duration && s.duration > 0 && s.duration < 65) return false;
            return true;
        });

        // 1. 멤버 & 기수 필터 (대분류 & 소분류)
        if (state.selectedMajor && state.selectedMajor !== 'all') {
            if (state.selectedSub) {
                const sub = state.selectedSub;
                if (sub === 'mystic') {
                    // 미스틱: 칸나 & 유니 전용 곡 (2인 또는 유닛)
                    res = res.filter(s => s.members && s.members.includes('kanna') && s.members.includes('yuni') && s.members.length <= 3);
                } else if (sub === 'everlys') {
                    // 에버리스: 유니 & 후야 전용 곡 (2인 또는 유닛)
                    res = res.filter(s => s.members && s.members.includes('yuni') && s.members.includes('huya') && s.members.length <= 3);
                } else if (sub === 'universe') {
                    // 2기 단체 전용 (유니버스) - 전체 단체곡 제외
                    res = res.filter(s => !isStelliveWholeGroupSong(s) && ((s.gen === 'g2' && (s.artist && (s.artist.includes('유니버스') || s.artist.includes('Universe')))) ||
                        (s.members && ['hina', 'mashiro', 'lize', 'tabi'].every(m => s.members.includes(m)))));
                } else if (sub === 'cliche') {
                    // 3기 단체 전용 (클리셰)
                    res = res.filter(s => (s.gen === 'g3' && (s.artist && (s.artist.includes('클리셰') || s.artist.includes('Cliché') || s.artist.includes('Cliche')))) ||
                        (s.members && ['shibuki', 'rin', 'nana', 'riko'].every(m => s.members.includes(m))));
                } else if (sub === 'full-group') {
                    // 스텔라이브 공식 단체곡 (전체곡 전용)
                    res = res.filter(s => isStelliveWholeGroupSong(s));
                } else if (sub === 'unit') {
                    // 스텔라이브 유닛 & 듀엣곡 (전체 단체곡 제외, 2인 이상 유닛/듀엣)
                    res = res.filter(s => {
                        if (isStelliveWholeGroupSong(s)) return false;
                        const isMultiArtist = s.artist && (s.artist.includes('&') || s.artist.includes('x') || s.artist.includes('X') || s.artist.includes('feat') || s.artist.includes('Feat') || s.artist.includes('유니버스') || s.artist.includes('클리셰'));
                        const isMultiMember = s.members && s.members.filter(m => m !== 'group').length >= 2;
                        return isMultiArtist || isMultiMember || s.gen === 'group';
                    });
                } else {
                    // 개별 멤버 (칸나, 유니, 후야, 히나, 마시로, 리제, 타비, 시부키, 린, 나나, 리코)
                    // 해당 멤버가 참여한 모든 곡 (솔로 + 유닛/듀엣 + 단체) 포함!
                    res = res.filter(s => s.members && s.members.includes(sub));
                }
            } else {
                // 소분류 미선택 시 대분류 전체 포함
                if (state.selectedMajor === 'group') {
                    res = res.filter(s => isStelliveWholeGroupSong(s) || s.gen === 'group' || (s.members && s.members.filter(m => m !== 'group').length >= 2) || (s.artist && (s.artist.includes('스텔라이브') || s.artist.includes('유니버스') || s.artist.includes('클리셰') || s.artist.includes('&') || s.artist.includes('x'))));
                } else if (state.selectedMajor === 'g1') {
                    res = res.filter(s => (s.members && s.members.some(m => ['kanna', 'yuni', 'huya'].includes(m))) || s.gen === 'g1');
                } else if (state.selectedMajor === 'g2') {
                    res = res.filter(s => (s.members && s.members.some(m => ['hina', 'mashiro', 'lize', 'tabi'].includes(m))) || s.gen === 'g2');
                } else if (state.selectedMajor === 'g3') {
                    res = res.filter(s => (s.members && s.members.some(m => ['shibuki', 'rin', 'nana', 'riko'].includes(m))) || s.gen === 'g3');
                }
            }
        }

        // 2. 타입 필터 (홈 뷰 등에서 적용)
        if (applyType && state.selectedType !== 'all') {
            res = res.filter(s => s.type === state.selectedType);
        }

        // 3. 검색 쿼리
        if (state.searchQuery) {
            const q = state.searchQuery.toLowerCase();
            res = res.filter(s =>
                (s.title && s.title.toLowerCase().includes(q)) ||
                (s.artist && s.artist.toLowerCase().includes(q)) ||
                (s.originalArtist && s.originalArtist.toLowerCase().includes(q))
            );
        }

        // 4. 정렬 (최신순 / 오래된순 / 곡명순 - 유튜브 업로드일자 publishedAt 우선)
        const sortOrder = state.sortOrder || 'latest';
        if (sortOrder === 'latest') {
            res.sort((a, b) => {
                const dateA = a.publishedAt || a.releaseDate || '';
                const dateB = b.publishedAt || b.releaseDate || '';
                const timeA = dateA ? new Date(dateA).getTime() : (a.addedAt || (a._catalogIndex !== undefined ? a._catalogIndex : 0));
                const timeB = dateB ? new Date(dateB).getTime() : (b.addedAt || (b._catalogIndex !== undefined ? b._catalogIndex : 0));
                if (timeA !== timeB) return timeB - timeA;
                return (b._catalogIndex || 0) - (a._catalogIndex || 0);
            });
        } else if (sortOrder === 'oldest') {
            res.sort((a, b) => {
                const dateA = a.publishedAt || a.releaseDate || '';
                const dateB = b.publishedAt || b.releaseDate || '';
                const timeA = dateA ? new Date(dateA).getTime() : (a.addedAt || (a._catalogIndex !== undefined ? a._catalogIndex : 0));
                const timeB = dateB ? new Date(dateB).getTime() : (b.addedAt || (b._catalogIndex !== undefined ? b._catalogIndex : 0));
                if (timeA !== timeB) return timeA - timeB;
                return (a._catalogIndex || 0) - (b._catalogIndex || 0);
            });
        } else if (sortOrder === 'title') {
            res.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'ko'));
        }

        return res;
    }

    function getFilteredSongs() {
        const all = window.getAllSongs ? window.getAllSongs() : [];
        return filterSongList(all, true);
    }

    let currentHomeRenderId = 0;
    function renderHomeTracks() {
        const songs = getFilteredSongs();
        state.currentHomeSongs = songs;
        dom.trackCountHome.textContent = `총 ${songs.length}곡`;
        dom.trackListHome.innerHTML = '';

        if (songs.length === 0) {
            dom.trackListHome.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-muted);">조건에 맞는 곡이 없습니다.</div>';
            return;
        }

        currentHomeRenderId++;
        const renderId = currentHomeRenderId;
        const INITIAL_CHUNK = 35;
        const firstChunk = songs.slice(0, INITIAL_CHUNK);

        const frag = document.createDocumentFragment();
        firstChunk.forEach((song, idx) => {
            frag.appendChild(createTrackRowElement(song, songs, idx));
        });
        dom.trackListHome.appendChild(frag);

        if (songs.length > INITIAL_CHUNK) {
            let curIdx = INITIAL_CHUNK;
            const CHUNK_SIZE = 50;
            function appendNextChunk() {
                if (renderId !== currentHomeRenderId) return;
                if (curIdx >= songs.length) return;

                const chunk = songs.slice(curIdx, curIdx + CHUNK_SIZE);
                const nextFrag = document.createDocumentFragment();
                chunk.forEach((song, i) => {
                    nextFrag.appendChild(createTrackRowElement(song, songs, curIdx + i));
                });
                dom.trackListHome.appendChild(nextFrag);
                curIdx += CHUNK_SIZE;

                if (curIdx < songs.length) {
                    requestAnimationFrame(appendNextChunk);
                }
            }
            requestAnimationFrame(appendNextChunk);
        }
    }

    function renderSabiTracks() {
        if (!dom.trackListSabi || !dom.trackCountSabi) return;
        const all = window.getAllSongs ? window.getAllSongs() : [];
        const sabiSongs = all.filter(s => s.sabi && typeof s.sabi.start === 'number');
        const filteredSabi = filterSongList(sabiSongs, true);
        state.currentSabiSongs = filteredSabi;
        dom.trackCountSabi.textContent = `${filteredSabi.length}곡`;
        dom.trackListSabi.innerHTML = '';

        if (filteredSabi.length === 0) {
            dom.trackListSabi.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-muted);">조건에 맞는 사비 곡이 없습니다.</div>';
            return;
        }

        const frag = document.createDocumentFragment();
        filteredSabi.forEach((song, idx) => {
            frag.appendChild(createTrackRowElement(song, filteredSabi, idx));
        });
        dom.trackListSabi.appendChild(frag);
    }

    async function renderOfflineTracks() {
        if (!dom.trackListOffline) return;
        dom.trackListOffline.innerHTML = '';
    }

    // ===================================================================
    // 4.1 재생목록 탭 (Playlists) & 상세 화면 렌더러
    // ===================================================================
    function renderPlaylists() {
        if (!dom.playlistsGrid) return;
        const all = window.getAllSongs ? window.getAllSongs() : [];
        const songMap = new Map(all.map(s => [s.id, s]));

        // 커스텀 플레이리스트 목록
        const playlists = StorageManager.getPlaylists().filter(p => p.id !== 'pl-favorites');
        if (dom.playlistsCustomCount) {
            dom.playlistsCustomCount.textContent = `${playlists.length}개`;
        }

        dom.playlistsGrid.innerHTML = '';
        if (playlists.length === 0) {
            dom.playlistsGrid.innerHTML = `
                <div style="text-align:center; padding:30px 10px; color:var(--text-muted); background:rgba(255,255,255,0.02); border-radius:12px; border:1px dashed var(--border-glass);">
                    <div style="font-size:1.6rem; margin-bottom:6px;">📑</div>
                    <div style="font-size:0.85rem; font-weight:700; color:var(--text-primary); margin-bottom:4px;">생성된 재생목록이 없습니다</div>
                    <div style="font-size:0.75rem;">상단의 '+ 새 목록' 버튼 또는 홈 화면에서 곡을 선택하여 나만의 재생목록을 만들어보세요!</div>
                </div>
            `;
            return;
        }

        playlists.forEach(pl => {
            const card = document.createElement('div');
            card.className = `playlist-card ${pl.isHistory ? 'playlist-card-history' : ''}`;
            const count = pl.songIds ? pl.songIds.length : 0;
            const icon = pl.isHistory ? '🕒' : '🎵';
            const countText = pl.isHistory ? `${count}곡 기록 (최근 100곡)` : `${count}곡 수록됨`;

            card.innerHTML = `
                <div class="playlist-card-left" style="flex:1;">
                    <div class="playlist-card-icon">${icon}</div>
                    <div class="playlist-card-meta">
                        <div class="playlist-card-title">${escapeHtml(pl.name)}</div>
                        <div class="playlist-card-sub">${countText}</div>
                    </div>
                </div>
                <button class="playlist-card-play-btn" title="전체 재생">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
                </button>
            `;

            card.querySelector('.playlist-card-left').addEventListener('click', () => {
                openPlaylistDetail(pl.id);
            });

            card.querySelector('.playlist-card-play-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                playPlaylistAll(pl.id);
            });

            dom.playlistsGrid.appendChild(card);
        });
    }

    function openPlaylistDetail(playlistId) {
        state.activePlaylistDetailId = playlistId;
        const all = window.getAllSongs ? window.getAllSongs() : [];
        const songMap = new Map(all.map(s => [s.id, s]));

        let playlistName = '';
        let songIds = [];
        let isFavList = false;
        let isHistory = false;

        if (playlistId === 'pl-favorites' || playlistId === 'card-playlist-favorites') {
            playlistName = '좋아요한 곡';
            songIds = StorageManager.getFavorites();
            isFavList = true;
        } else {
            const playlists = StorageManager.getPlaylists();
            const pl = playlists.find(p => p.id === playlistId);
            if (!pl) return;
            playlistName = pl.name;
            songIds = pl.songIds || [];
            isHistory = !!pl.isHistory;
        }

        if (dom.detailPlaylistTitle) dom.detailPlaylistTitle.textContent = playlistName;
        if (dom.detailPlaylistCount) {
            dom.detailPlaylistCount.textContent = isHistory ? `최근 감상 기록 총 ${songIds.length}곡 (최대 100곡)` : `${songIds.length}곡 수록됨`;
        }
        if (dom.detailPlaylistIcon) {
            dom.detailPlaylistIcon.textContent = isFavList ? '❤️' : (isHistory ? '🕒' : '🎵');
        }

        if (dom.btnPlaylistDetailDelete) {
            dom.btnPlaylistDetailDelete.style.display = (isFavList || isHistory) ? 'none' : 'flex';
        }
        if (dom.btnPlaylistDetailClearHistory) {
            dom.btnPlaylistDetailClearHistory.style.display = isHistory ? 'flex' : 'none';
        }
        if (dom.btnPlaylistDetailAddTracks) {
            dom.btnPlaylistDetailAddTracks.style.display = (isFavList || isHistory) ? 'none' : 'flex';
        }

        const tracks = songIds.map(id => songMap.get(id)).filter(Boolean);
        dom.detailPlaylistTracks.innerHTML = '';

        if (tracks.length === 0) {
            const emptyMsg = isHistory ? '최근 감상한 곡 기록이 없습니다.<br>곡을 재생하면 자동으로 이곳에 최대 100곡까지 기록됩니다.' : '재생목록이 비어있습니다.<br>상단 [+ 곡 추가] 또는 홈 화면에서 곡을 추가해보세요!';
            dom.detailPlaylistTracks.innerHTML = `
                <div style="text-align:center; padding:40px 20px; color:var(--text-muted);">
                    <div style="font-size:1.8rem; margin-bottom:8px;">${isFavList ? '❤️' : (isHistory ? '🕒' : '🎵')}</div>
                    <div style="font-weight:700; color:var(--text-primary); margin-bottom:4px;">${isHistory ? '감상 기록이 없습니다' : '재생목록이 비어있습니다'}</div>
                    <div style="font-size:0.8rem; line-height:1.4;">${emptyMsg}</div>
                </div>
            `;
        } else {
            state.currentPlaylistTracks = tracks;
            const frag = document.createDocumentFragment();
            tracks.forEach((song, idx) => {
                const row = createTrackRowElement(song, tracks, idx);
                const actionsDiv = row.querySelector('.m-track-actions');
                if (actionsDiv) {
                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'm-btn-action btn-remove-from-playlist';
                    removeBtn.title = isHistory ? '기록에서 삭제' : '목록에서 제거';
                    removeBtn.style.color = 'var(--text-muted)';
                    removeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
                    removeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        StorageManager.removeSongFromPlaylist(playlistId, song.id);
                        showToast(isHistory ? '감상 기록에서 곡이 제거되었습니다.' : '재생목록에서 곡이 제거되었습니다.');
                        openPlaylistDetail(playlistId);
                    });
                    actionsDiv.appendChild(removeBtn);
                }
                frag.appendChild(row);
            });
            dom.detailPlaylistTracks.appendChild(frag);
        }

        if (dom.playlistsListContainer) dom.playlistsListContainer.style.display = 'none';
        if (dom.playlistDetailContainer) dom.playlistDetailContainer.style.display = 'block';
    }
    window.openPlaylistDetail = openPlaylistDetail;

    function closePlaylistDetail() {
        state.activePlaylistDetailId = null;
        if (dom.playlistsListContainer) dom.playlistsListContainer.style.display = 'block';
        if (dom.playlistDetailContainer) dom.playlistDetailContainer.style.display = 'none';
        renderPlaylists();
    }

    function playPlaylistAll(playlistId) {
        const all = window.getAllSongs ? window.getAllSongs() : [];
        const songMap = new Map(all.map(s => [s.id, s]));

        let songIds = [];
        if (playlistId === 'pl-favorites' || playlistId === 'card-playlist-favorites') {
            songIds = StorageManager.getFavorites();
        } else {
            const playlists = StorageManager.getPlaylists();
            const pl = playlists.find(p => p.id === playlistId);
            if (pl) songIds = pl.songIds || [];
        }

        const tracks = songIds.map(id => songMap.get(id)).filter(Boolean);
        if (tracks.length === 0) {
            showToast('재생할 곡이 없습니다.');
            return;
        }

        player.setQueue(tracks, 0, true);
        showToast(`${tracks.length}곡 전체 재생을 시작합니다.`);
    }

    function deletePlaylistConfirm(playlistId) {
        if (playlistId === 'pl-history') {
            showToast('최근 감상 기록은 삭제할 수 없습니다.');
            return;
        }
        const playlists = StorageManager.getPlaylists();
        const pl = playlists.find(p => p.id === playlistId);
        if (!pl) return;

        if (confirm(`'${pl.name}' 재생목록을 완전히 삭제하시겠습니까?`)) {
            StorageManager.deletePlaylist(playlistId);
            showToast(`'${pl.name}' 재생목록이 삭제되었습니다.`);
            closePlaylistDetail();
        }
    }

    // ===================================================================
    // 4.1.1 모바일 재생목록 곡 추가 탐색 모달
    // ===================================================================
    let mPlAddTargetId = null;
    let mPlAddSelectedSongIds = new Set();
    let mPlAddTypeFilter = 'all';
    let mPlAddMemberFilter = 'all';
    let mPlAddSearchQuery = '';

    function openMobilePlaylistAddTracksModal(playlistId) {
        const playlists = StorageManager.getPlaylists(false);
        const targetPl = playlists.find(p => p.id === playlistId);
        if (!targetPl) return;

        mPlAddTargetId = playlistId;
        mPlAddSelectedSongIds.clear();
        mPlAddTypeFilter = 'all';
        mPlAddMemberFilter = 'all';
        mPlAddSearchQuery = '';

        const modal = document.getElementById('m-modal-playlist-add-tracks');
        if (!modal) return;

        const titleEl = document.getElementById('m-pl-add-title');
        const subEl = document.getElementById('m-pl-add-subtitle');
        if (titleEl) titleEl.textContent = `➕ '${targetPl.name}'에 곡 추가`;
        if (subEl) subEl.textContent = `현재 ${(targetPl.songIds || []).length}곡 수록됨 · 추가할 곡을 선택하세요`;

        const searchInput = document.getElementById('m-pl-add-search-input');
        const searchClear = document.getElementById('m-pl-add-search-clear');
        if (searchInput) searchInput.value = '';
        if (searchClear) searchClear.style.display = 'none';

        document.querySelectorAll('#m-pl-add-type-filters button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === 'all');
        });
        document.querySelectorAll('#m-pl-add-member-filters button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.member === 'all');
        });

        renderMobilePlaylistAddTracksList();
        updateMobilePlaylistAddModalActions();
        modal.classList.add('open');
    }

    function closeMobilePlaylistAddTracksModal() {
        const modal = document.getElementById('m-modal-playlist-add-tracks');
        if (modal) modal.classList.remove('open');
        mPlAddTargetId = null;
        mPlAddSelectedSongIds.clear();
    }

    function getMobileFilteredSongsForAddModal() {
        const allSongs = window.getAllSongs ? window.getAllSongs() : [];
        const q = (mPlAddSearchQuery || '').trim().toLowerCase();

        return allSongs.filter(song => {
            // 유형 필터
            if (mPlAddTypeFilter !== 'all' && song.type !== mPlAddTypeFilter) {
                return false;
            }

            // 멤버/기수 필터
            if (mPlAddMemberFilter !== 'all') {
                const members = song.members || [];
                if (mPlAddMemberFilter === 'gen-g1') {
                    if (!['kanna', 'yuni'].some(m => members.includes(m))) return false;
                } else if (mPlAddMemberFilter === 'gen-g2') {
                    if (!['hina', 'mashiro', 'lize', 'tabi'].some(m => members.includes(m))) return false;
                } else if (mPlAddMemberFilter === 'gen-g3') {
                    if (!['shibuki', 'rin', 'nana', 'riko'].some(m => members.includes(m))) return false;
                } else {
                    if (!members.includes(mPlAddMemberFilter)) return false;
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

    function renderMobilePlaylistAddTracksList() {
        const listEl = document.getElementById('m-pl-add-tracks-list');
        if (!listEl || !mPlAddTargetId) return;

        const playlists = StorageManager.getPlaylists(false);
        const targetPl = playlists.find(p => p.id === mPlAddTargetId);
        const alreadySongIds = new Set(targetPl ? (targetPl.songIds || []) : []);

        const filtered = getMobileFilteredSongsForAddModal();

        const filteredCountEl = document.getElementById('m-pl-add-filtered-count');
        if (filteredCountEl) filteredCountEl.textContent = `(${filtered.length}곡)`;

        if (filtered.length === 0) {
            listEl.innerHTML = `
                <div style="padding: 30px; text-align: center; color: var(--text-muted); font-size: 0.82rem;">
                    일치하는 곡이 없습니다.
                </div>
            `;
            return;
        }

        let html = '';
        filtered.forEach(song => {
            const isAlready = alreadySongIds.has(song.id);
            const isChecked = mPlAddSelectedSongIds.has(song.id);
            const thumbUrl = `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`;

            html += `
                <div class="m-pl-add-track-item ${isChecked ? 'selected' : ''} ${isAlready ? 'already-added' : ''}" data-song-id="${song.id}">
                    <input type="checkbox" class="m-pl-add-cb" ${isAlready ? 'disabled checked' : (isChecked ? 'checked' : '')} style="cursor: pointer; pointer-events: none;">
                    <img class="m-pl-add-thumb" src="${thumbUrl}" alt="" loading="lazy">
                    <div class="m-pl-add-meta">
                        <div class="m-pl-add-title">${escapeHtml(song.title)}</div>
                        <div class="m-pl-add-artist">${escapeHtml(song.artist)}</div>
                    </div>
                    ${isAlready ? '<span class="m-badge-already-in-pl">✓ 수록됨</span>' : ''}
                </div>
            `;
        });
        listEl.innerHTML = html;

        listEl.querySelectorAll('.m-pl-add-track-item').forEach(row => {
            row.addEventListener('click', () => {
                const songId = row.dataset.songId;
                if (alreadySongIds.has(songId)) return;

                const cb = row.querySelector('.m-pl-add-cb');
                if (mPlAddSelectedSongIds.has(songId)) {
                    mPlAddSelectedSongIds.delete(songId);
                    row.classList.remove('selected');
                    if (cb) cb.checked = false;
                } else {
                    mPlAddSelectedSongIds.add(songId);
                    row.classList.add('selected');
                    if (cb) cb.checked = true;
                }
                updateMobilePlaylistAddModalActions();
            });
        });
    }

    function updateMobilePlaylistAddModalActions() {
        const badge = document.getElementById('m-pl-add-selected-badge');
        const confirmBtn = document.getElementById('m-btn-confirm-pl-add');
        const confirmText = document.getElementById('m-btn-confirm-pl-add-text');

        const count = mPlAddSelectedSongIds.size;
        if (badge) badge.textContent = `${count}곡`;
        if (confirmBtn) {
            confirmBtn.disabled = count === 0;
            confirmBtn.style.opacity = count > 0 ? '1' : '0.5';
            confirmBtn.style.pointerEvents = count > 0 ? 'auto' : 'none';
        }
        if (confirmText) {
            confirmText.textContent = count > 0 ? `선택한 ${count}곡 추가` : '선택한 곡 추가';
        }
    }

    // ===================================================================
    // 4.2 재생목록 추가 모달 & 새 재생목록 생성
    // ===================================================================
    let pendingAddToPlaylistSongIds = [];
    let pendingCreatePlaylistSongIds = [];

    function openAddToPlaylistModal(songIds) {
        if (!Array.isArray(songIds) || songIds.length === 0) return;
        pendingAddToPlaylistSongIds = songIds;

        const countText = songIds.length === 1 ? '선택한 1곡' : `선택한 ${songIds.length}곡`;
        const targetText = document.getElementById('m-select-playlist-target-text');
        if (targetText) targetText.textContent = `${countText}을(를) 추가할 재생목록을 선택해주세요.`;

        const listWrap = dom.modalPlaylistList;
        listWrap.innerHTML = '';

        // 커스텀 플레이리스트 목록 (최근 감상 기록 제외)
        const playlists = StorageManager.getPlaylists(false).filter(p => p.id !== 'pl-favorites');
        if (playlists.length === 0) {
            listWrap.innerHTML = '<div style="text-align:center; padding:16px; color:var(--text-muted); font-size:0.85rem;">생성된 재생목록이 없습니다.<br>아래에서 새 재생목록을 만들어 추가해보세요!</div>';
        }
        playlists.forEach(pl => {
            const item = document.createElement('div');
            item.className = 'modal-playlist-item';
            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px;">
                    <span>🎵</span>
                    <span class="modal-playlist-item-name">${escapeHtml(pl.name)}</span>
                </div>
                <span class="modal-playlist-item-count">${pl.songIds ? pl.songIds.length : 0}곡</span>
            `;
            item.addEventListener('click', () => {
                const added = StorageManager.addSongsToPlaylist(pl.id, pendingAddToPlaylistSongIds);
                showToast(`'${pl.name}' 재생목록에 ${added}곡이 추가되었습니다.`);
                closeAddToPlaylistModal();
                renderPlaylists();
                if (state.isMultiSelectHome) toggleHomeMultiSelect(false);
            });
            listWrap.appendChild(item);
        });

        if (dom.inputNewPlaylistQuick) dom.inputNewPlaylistQuick.value = '';
        dom.modalSelectPlaylist.classList.add('open');
    }

    function closeAddToPlaylistModal() {
        if (dom.modalSelectPlaylist) dom.modalSelectPlaylist.classList.remove('open');
        pendingAddToPlaylistSongIds = [];
    }
    window.openAddToPlaylistModal = openAddToPlaylistModal;

    function openCreatePlaylistModal(initialSongIds = []) {
        pendingCreatePlaylistSongIds = Array.isArray(initialSongIds) ? initialSongIds : [];
        if (dom.inputCreatePlaylistName) dom.inputCreatePlaylistName.value = '';
        if (dom.modalCreatePlaylist) dom.modalCreatePlaylist.classList.add('open');
    }

    function closeCreatePlaylistModal() {
        if (dom.modalCreatePlaylist) dom.modalCreatePlaylist.classList.remove('open');
        pendingCreatePlaylistSongIds = [];
    }

    // ===================================================================
    // 4.3 홈 화면 복수 선택 (Multi-Select) 모드
    // ===================================================================
    function toggleHomeMultiSelect(forceState) {
        state.isMultiSelectHome = (typeof forceState === 'boolean') ? forceState : !state.isMultiSelectHome;
        document.body.classList.toggle('multiselect-active', state.isMultiSelectHome);
        if (dom.multiselectBar) {
            dom.multiselectBar.style.display = state.isMultiSelectHome ? 'flex' : 'none';
        }
        if (!state.isMultiSelectHome) {
            state.selectedSongIds.clear();
        }
        if (dom.btnToggleMultiselectHome) {
            dom.btnToggleMultiselectHome.classList.toggle('active', state.isMultiSelectHome);
        }
        updateHomeMultiSelectUI();
    }

    function toggleSongSelection(songId) {
        if (state.selectedSongIds.has(songId)) {
            state.selectedSongIds.delete(songId);
        } else {
            state.selectedSongIds.add(songId);
        }
        updateHomeMultiSelectUI();
    }

    function updateHomeMultiSelectUI() {
        if (dom.multiselectCount) {
            dom.multiselectCount.textContent = `${state.selectedSongIds.size}곡 선택됨`;
        }

        const checkboxes = dom.trackListHome?.querySelectorAll('.m-custom-checkbox') || [];
        checkboxes.forEach(chk => {
            const id = chk.dataset.id;
            chk.classList.toggle('checked', state.selectedSongIds.has(id));
        });
    }

    function playSelectedHomeSongs() {
        if (state.selectedSongIds.size === 0) {
            showToast('재생할 곡을 선택해주세요.');
            return;
        }

        const all = window.getAllSongs ? window.getAllSongs() : [];
        const songMap = new Map(all.map(s => [s.id, s]));
        const selectedSongs = Array.from(state.selectedSongIds).map(id => songMap.get(id)).filter(Boolean);

        if (selectedSongs.length === 0) {
            showToast('선택된 곡을 찾을 수 없습니다.');
            return;
        }

        player.setQueue(selectedSongs, 0, true);
        showToast(`선택한 ${selectedSongs.length}곡 재생을 시작합니다.`);
        toggleHomeMultiSelect(false);
    }

    // ===================================================================
    // 4.4 오프라인 선택 삭제 모드
    // ===================================================================
    function toggleOfflineSelectMode(forceState) {
        state.isOfflineSelectMode = (typeof forceState === 'boolean') ? forceState : !state.isOfflineSelectMode;
        document.body.classList.toggle('offline-select-active', state.isOfflineSelectMode);
        if (dom.offlineDeleteBar) {
            dom.offlineDeleteBar.style.display = state.isOfflineSelectMode ? 'flex' : 'none';
        }
        if (!state.isOfflineSelectMode) {
            state.offlineSelectedSongIds.clear();
        }
        if (dom.btnOfflineSelectMode) {
            dom.btnOfflineSelectMode.classList.toggle('active', state.isOfflineSelectMode);
        }
        updateOfflineSelectUI();
    }

    function toggleOfflineSongSelection(songId) {
        if (state.offlineSelectedSongIds.has(songId)) {
            state.offlineSelectedSongIds.delete(songId);
        } else {
            state.offlineSelectedSongIds.add(songId);
        }
        updateOfflineSelectUI();
    }

    function updateOfflineSelectUI() {
        if (dom.offlineDeleteCount) {
            dom.offlineDeleteCount.textContent = `${state.offlineSelectedSongIds.size}곡 선택됨`;
        }

        const checkboxes = dom.trackListOffline?.querySelectorAll('.m-custom-checkbox') || [];
        checkboxes.forEach(chk => {
            const id = chk.dataset.id;
            chk.classList.toggle('checked', state.offlineSelectedSongIds.has(id));
        });
    }

    async function deleteSelectedOfflineTracks() {
        if (state.offlineSelectedSongIds.size === 0) {
            showToast('삭제할 곡을 선택해주세요.');
            return;
        }

        const count = state.offlineSelectedSongIds.size;
        if (!confirm(`선택한 ${count}곡을 오프라인 저장소에서 완전히 삭제하시겠습니까?`)) {
            return;
        }

        const idsToDelete = Array.from(state.offlineSelectedSongIds);
        await window.OfflineDB.deleteTracks(idsToDelete);
        showToast(`선택한 ${count}곡이 오프라인에서 완전히 삭제되었습니다.`);
        toggleOfflineSelectMode(false);
        await refreshOfflineCacheState();
        renderOfflineTracks();
        renderHomeTracks();
    }

    // ===================================================================
    // 5. 대기열(재생목록) 슬라이드 시트 & 드래그 재배치
    // ===================================================================
    function openQueueSheet() {
        renderMobileQueue(true); // scrollToActive = true on first open
        dom.queueSheet.classList.add('open');
    }

    function closeQueueSheet() {
        dom.queueSheet.classList.remove('open');
    }

    function toggleQueueSheet() {
        if (dom.queueSheet.classList.contains('open')) {
            closeQueueSheet();
        } else {
            openQueueSheet();
        }
    }

    function renderMobileQueue(scrollToActive) {
        const queue = player.queue || [];
        updateQueueBadge();
        dom.queueList.innerHTML = '';

        if (queue.length === 0) {
            dom.queueList.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-muted);">대기열이 비어있습니다.</div>';
            return;
        }

        queue.forEach((song, idx) => {
            const isCurrent = idx === player.queueIndex;
            const thumbUrl = `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`;

            const item = document.createElement('div');
            item.className = `m-queue-item ${isCurrent ? 'active' : ''}`;
            item.dataset.index = idx;
            item.setAttribute('draggable', 'false'); // 본체는 드래그되지 않음 (실수 방지)

            item.innerHTML = `
                <div class="m-queue-left">
                    <span class="m-queue-index">${idx + 1}</span>
                    <img class="m-queue-thumb" src="${thumbUrl}" alt="" loading="lazy">
                    <div class="m-queue-meta">
                        <div class="m-queue-title-row">
                            <span class="m-queue-title">${song.title}</span>
                            ${isCurrent ? '<span class="m-queue-tag">재생 중</span>' : ''}
                        </div>
                        <span class="m-queue-artist">${song.artist}</span>
                    </div>
                </div>
                <div class="m-queue-actions">
                    <button class="m-queue-del" title="대기열에서 제거">✕</button>
                    <div class="m-queue-handle" title="핸들을 눌러 드래그하여 순서 변경">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>
                        </svg>
                    </div>
                </div>
            `;

            // 탭하여 즉시 해당 곡 재생
            item.querySelector('.m-queue-left').addEventListener('click', () => {
                player.playQueueIndex(idx);
            });

            // 개별 삭제 버튼
            item.querySelector('.m-queue-del').addEventListener('click', (e) => {
                e.stopPropagation();
                player.removeFromQueue(idx);
            });

            // 오직 핸들(☰)만을 통한 드래그 순서 재배치 (HTML5 Mouse Drag)
            const handle = item.querySelector('.m-queue-handle');
            handle.setAttribute('draggable', 'true');

            handle.addEventListener('dragstart', (e) => {
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', String(idx));
            });

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
                const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                const toIdx = parseInt(item.dataset.index, 10);
                if (!isNaN(fromIdx) && !isNaN(toIdx) && fromIdx !== toIdx) {
                    player.moveQueueItem(fromIdx, toIdx);
                }
            });

            handle.addEventListener('dragend', () => {
                dom.queueList.querySelectorAll('.m-queue-item').forEach(el => {
                    el.classList.remove('drag-over-top', 'drag-over-bottom', 'dragging');
                });
            });

            // 모바일 터치 전용 드래그앤드롭 (핸들 영역 터치 시에만 동작하여 오작동 방지)
            let currentTargetItem = null;

            handle.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                item.classList.add('dragging');
            }, { passive: false });

            handle.addEventListener('touchmove', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const touch = e.touches[0];
                const elem = document.elementFromPoint(touch.clientX, touch.clientY);
                if (!elem) return;

                const targetItem = elem.closest('.m-queue-item');
                dom.queueList.querySelectorAll('.m-queue-item').forEach(el => {
                    if (el !== targetItem) el.classList.remove('drag-over-top', 'drag-over-bottom');
                });

                if (targetItem && targetItem !== item) {
                    currentTargetItem = targetItem;
                    const rect = targetItem.getBoundingClientRect();
                    const midY = rect.top + rect.height / 2;
                    if (touch.clientY < midY) {
                        targetItem.classList.add('drag-over-top');
                        targetItem.classList.remove('drag-over-bottom');
                    } else {
                        targetItem.classList.add('drag-over-bottom');
                        targetItem.classList.remove('drag-over-top');
                    }
                } else {
                    currentTargetItem = null;
                }
            }, { passive: false });

            handle.addEventListener('touchend', (e) => {
                e.stopPropagation();
                item.classList.remove('dragging');
                if (currentTargetItem) {
                    const fromIndex = idx;
                    const toIndex = parseInt(currentTargetItem.dataset.index, 10);
                    currentTargetItem.classList.remove('drag-over-top', 'drag-over-bottom');
                    if (!isNaN(toIndex) && fromIndex !== toIndex) {
                        player.moveQueueItem(fromIndex, toIndex);
                    }
                }
                dom.queueList.querySelectorAll('.m-queue-item').forEach(el => {
                    el.classList.remove('drag-over-top', 'drag-over-bottom', 'dragging');
                });
                currentTargetItem = null;
            });

            dom.queueList.appendChild(item);
        });

        // 큐 시트를 처음 열 때만 현재 재생 중인 항목으로 스크롤 (사용자 스크롤 중 강제 이동 방지)
        if (scrollToActive) {
            requestAnimationFrame(() => {
                const activeItem = dom.queueList.querySelector('.m-queue-item.active');
                if (activeItem) {
                    activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        }
    }

    // ===================================================================
    // 6. 트랙 옵션 메뉴 (⋮) 바텀시트 & 편집/삭제/다운로드
    // ===================================================================
    function openTrackActions(song) {
        if (!song) return;
        state.selectedActionSong = song;

        dom.actionTrackThumb.src = `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`;
        dom.actionTrackTitle.textContent = song.title;
        dom.actionTrackArtist.textContent = `${song.artist} • ${song.originalArtist || '스텔라이브'}`;

        const isSaved = state.offlineSongIds.has(song.id);
        if (dom.actDownloadText) {
            dom.actDownloadText.textContent = isSaved ? '오프라인 저장소에서 삭제' : '오프라인 저장소에 다운로드';
        }

        const isCustom = song.id && (song.id.startsWith('custom-') || song.isCustom);
        if (dom.actDeleteText) {
            dom.actDeleteText.textContent = isCustom ? '커스텀 곡 완전 삭제' : '라이브러리에서 숨기기';
        }

        dom.sheetTrackActions.classList.add('open');
    }

    function closeTrackActions() {
        dom.sheetTrackActions.classList.remove('open');
        state.selectedActionSong = null;
    }

    // ===================================================================
    // 7. 모바일 곡 추가 및 편집 모달 (다중 멤버 선택 및 자동 감지)
    // ===================================================================
    function getSelectedMembersFromForm(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return ['group'];
        const checked = Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
        return checked.length > 0 ? checked : ['group'];
    }

    function setSelectedMembersInForm(containerId, members) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const memList = Array.isArray(members) ? members : (members ? [members] : ['group']);
        container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = memList.includes(cb.value);
        });
    }

    // ===================================================================
    // 참여 멤버 2단계 선택 & 아티스트명 자동 동기화 헬퍼 (모바일 곡 정보 수정)
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

    function cleanAndKoreanizeTitle(title) {
        if (!title) return '';
        let t = title;
        // YouTube metadata cleanup
        t = t.replace(/\s*-\s*YouTube$/i, '');

        // English / Romaji member names to Korean standard
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

        // Exception: Universe
        if (t.toLowerCase().includes('universe') && (t.toLowerCase().includes('유니버스') || t.trim() === 'Universe')) {
            return 'Universe (유니버스)';
        }

        // Clean artist/symbol clutter (e.g. '스텔라이브 클리셰ㅣ유성우' -> '유성우')
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

    function openAddSongModal() {
        dom.formAddSong.reset();
        setSelectedMembersInForm('m-add-member-chips', ['group']);
        dom.addSabiStart.value = '45';
        dom.addSabiEnd.value = '75';
        dom.modalAddSong.classList.add('open');
    }

    function closeAddSongModal() {
        dom.modalAddSong.classList.remove('open');
    }

    function openEditSongModal(song) {
        if (!song) return;
        dom.editSongId.value = song.id;
        dom.editTitle.value = song.title || '';
        dom.editArtist.value = song.artist || '';
        dom.editOriginalArtist.value = song.originalArtist || '';
        dom.editType.value = song.type || 'cover';
        if (dom.editPublishedAt) {
            dom.editPublishedAt.value = song.publishedAt || song.releaseDate || '';
        }

        // 1분류/2분류 상태 판별
        const isStelliveGroup = (song.members && song.members.length === 1 && song.members[0] === 'group' && (!song.gen || song.gen === 'group')) ||
                               (song.artist && song.artist.includes('스텔라이브') && (!song.members || song.members.length === 0 || (song.members.length === 1 && song.members[0] === 'group')));

        let detectedUnits = [];
        if (song.gen === 'g1' || (song.artist && song.artist.includes('에버리스'))) detectedUnits.push('everlys');
        if (song.gen === 'g2' || (song.artist && song.artist.includes('유니버스'))) detectedUnits.push('universe');
        if (song.gen === 'g3' || (song.artist && song.artist.includes('클리셰'))) detectedUnits.push('cliche');

        const activeMembers = (song.members || []).filter(m => m !== 'group');

        setMemberPickerState('m-edit', {
            isStellive: isStelliveGroup && detectedUnits.length === 0 && activeMembers.length === 0,
            units: detectedUnits,
            members: activeMembers
        }, dom.editArtist);

        // 기존 저장된 아티스트명 텍스트 필드에 보존
        dom.editArtist.value = song.artist || '';

        dom.editSabiStart.value = song.sabi?.start ?? 45;
        dom.editSabiEnd.value = song.sabi?.end ?? 75;

        dom.modalEditSong.classList.add('open');
    }

    function closeEditSongModal() {
        dom.modalEditSong.classList.remove('open');
        dom.formEditSong.reset();
        setMemberPickerState('m-edit', { isStellive: false, units: [], members: [] }, dom.editArtist);
    }

    // ===================================================================
    // 7-1. 대화형 사비(하이라이트) 에디터 & 실시간 미리듣기
    // ===================================================================
    const sabiEditorState = {
        song: null,
        startSec: 45,
        endSec: 75,
        duration: 210,
        isPreviewing: false,
        wasPlayingBefore: false
    };

    function openSabiEditor(song) {
        if (!song) return;
        sabiEditorState.song = song;
        sabiEditorState.isPreviewing = false;
        sabiEditorState.wasPlayingBefore = player.isPlaying;

        const songDur = (song.duration && song.duration > 10) ? song.duration : 210;
        sabiEditorState.duration = songDur;

        // 기존 설정된 사비가 있으면 불러오고, 없으면 45~75초 또는 25%~35초
        let start = (song.sabi && typeof song.sabi.start === 'number') ? song.sabi.start : Math.floor(songDur * 0.25);
        let end = (song.sabi && typeof song.sabi.end === 'number') ? song.sabi.end : (start + 30);

        if (start < 0) start = 0;
        if (end > songDur) end = songDur;
        if (end <= start) end = Math.min(songDur, start + 30);

        sabiEditorState.startSec = start;
        sabiEditorState.endSec = end;

        // 모달 기본 정보 세팅
        if (dom.sabiThumb) dom.sabiThumb.src = `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`;
        if (dom.sabiTitle) dom.sabiTitle.textContent = song.title;
        if (dom.sabiArtist) dom.sabiArtist.textContent = song.artist;
        if (dom.sabiTimeMin) dom.sabiTimeMin.textContent = '00:00';
        if (dom.sabiTimeMax) dom.sabiTimeMax.textContent = formatTime(songDur);

        if (dom.sabiStartSlider) {
            dom.sabiStartSlider.min = '0';
            dom.sabiStartSlider.max = String(songDur);
            dom.sabiStartSlider.value = String(start);
        }
        if (dom.sabiEndSlider) {
            dom.sabiEndSlider.min = '0';
            dom.sabiEndSlider.max = String(songDur);
            dom.sabiEndSlider.value = String(end);
        }

        updateSabiEditorUI();
        setSabiPreviewButtonState(false);

        if (dom.sabiPlayhead) dom.sabiPlayhead.style.display = 'none';
        if (dom.modalSabiEditor) dom.modalSabiEditor.classList.add('open');
    }

    function closeSabiEditor() {
        if (sabiEditorState.isPreviewing) {
            stopSabiPreview();
        }
        if (dom.modalSabiEditor) dom.modalSabiEditor.classList.remove('open');
        sabiEditorState.song = null;
    }

    function updateSabiEditorUI() {
        const start = sabiEditorState.startSec;
        const end = sabiEditorState.endSec;
        const dur = Math.max(1, sabiEditorState.duration);
        const len = Math.max(1, end - start);

        if (dom.sabiStartLabel) {
            dom.sabiStartLabel.textContent = `${formatTime(start)} (${start}초)`;
        }
        if (dom.sabiEndLabel) {
            dom.sabiEndLabel.textContent = `${formatTime(end)} (${end}초)`;
        }
        if (dom.sabiDurationBadge) {
            dom.sabiDurationBadge.textContent = `총 ${len}초`;
        }

        if (dom.sabiHighlightBar) {
            const leftPct = Math.max(0, Math.min(100, (start / dur) * 100));
            const widthPct = Math.max(1, Math.min(100 - leftPct, (len / dur) * 100));
            dom.sabiHighlightBar.style.left = `${leftPct}%`;
            dom.sabiHighlightBar.style.width = `${widthPct}%`;
        }
    }

    function setSabiPreviewButtonState(isPlaying) {
        if (!dom.btnSabiPreviewToggle) return;
        dom.btnSabiPreviewToggle.classList.toggle('playing', isPlaying);
        if (dom.btnSabiPreviewText) {
            dom.btnSabiPreviewText.textContent = isPlaying ? '미리듣기 일시정지' : '구간 미리듣기';
        }
        const svg = dom.btnSabiPreviewToggle.querySelector('svg');
        if (svg) {
            if (isPlaying) {
                svg.innerHTML = '<rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/>';
            } else {
                svg.innerHTML = '<polygon points="6 4 20 12 6 20 6 4"/>';
            }
        }
    }

    async function toggleSabiPreview() {
        if (sabiEditorState.isPreviewing) {
            stopSabiPreview();
        } else {
            await startSabiPreview();
        }
    }

    async function startSabiPreview() {
        if (!sabiEditorState.song) return;
        sabiEditorState.isPreviewing = true;
        setSabiPreviewButtonState(true);

        const song = sabiEditorState.song;
        const isSameSong = player.currentSong && player.currentSong.id === song.id;

        if (!isSameSong) {
            await player.playSong(song);
        } else if (!player.isPlaying) {
            player.togglePlay();
        }
        player.seek(sabiEditorState.startSec);
    }

    function stopSabiPreview() {
        sabiEditorState.isPreviewing = false;
        setSabiPreviewButtonState(false);
        if (player.isPlaying) {
            player.togglePlay();
        }
        if (dom.sabiPlayhead) dom.sabiPlayhead.style.display = 'none';
    }

    function saveSabiFromEditor() {
        if (!sabiEditorState.song) return;
        if (sabiEditorState.isPreviewing) {
            stopSabiPreview();
        }

        const songId = sabiEditorState.song.id;
        const newSabi = {
            start: sabiEditorState.startSec,
            end: sabiEditorState.endSec,
            title: '수정된 후렴구'
        };

        if (window.StorageManager) {
            window.StorageManager.saveSongOverride(songId, { sabi: newSabi });
        }

        if (player.currentSong && player.currentSong.id === songId) {
            player.currentSong.sabi = newSabi;
        }

        showToast(`[${sabiEditorState.song.title}] 사비 구간이 (${formatTime(sabiEditorState.startSec)} ~ ${formatTime(sabiEditorState.endSec)})로 저장되었습니다.`);
        closeSabiEditor();
        renderAllViews();
    }

    function adjustSabiStart(delta) {
        let val = sabiEditorState.startSec + delta;
        if (val < 0) val = 0;
        if (val >= sabiEditorState.endSec - 2) val = sabiEditorState.endSec - 2;
        sabiEditorState.startSec = val;
        if (dom.sabiStartSlider) dom.sabiStartSlider.value = String(val);
        updateSabiEditorUI();
        if (sabiEditorState.isPreviewing) {
            player.seek(val);
        }
    }

    function adjustSabiEnd(delta) {
        let val = sabiEditorState.endSec + delta;
        if (val <= sabiEditorState.startSec + 2) val = sabiEditorState.startSec + 2;
        if (val > sabiEditorState.duration) val = sabiEditorState.duration;
        sabiEditorState.endSec = val;
        if (dom.sabiEndSlider) dom.sabiEndSlider.value = String(val);
        updateSabiEditorUI();
        if (sabiEditorState.isPreviewing) {
            player.seek(Math.max(sabiEditorState.startSec, val - 3));
        }
    }

    // ===================================================================
    // 8. 신곡 자동 탐색 & 숨긴 곡 복원
    // ===================================================================
    function processDiscoveredSongs(rawTracks, isManual = false) {
        try {
            if (Array.isArray(rawTracks)) {
                const currentSongs = window.getAllSongs ? window.getAllSongs() : [];
                const existingYtIds = new Set(currentSongs.map(s => s.youtubeId).filter(Boolean));
                currentSongs.forEach(s => { if (s.id) existingYtIds.add(s.id); });

                const newTracks = [];
                for (const t of rawTracks) {
                    const ytId = t.id;
                    if (!existingYtIds.has(ytId) && !existingYtIds.has(`auto-${ytId}`)) {
                        // 1. 한국어 표준 제목 정규화
                        const cleanedTitle = cleanAndKoreanizeTitle(t.title || '');

                        // 2. 제목/업로더 등에서 멤버 자동 감지
                        const textToAnalyze = `${t.title || ''} ${t.uploader || ''} ${t.channelTitle || ''}`;
                        let detected = detectMembersFromText(textToAnalyze);
                        if (detected.length === 0 && t.defaultMember && t.defaultMember !== 'group') {
                            detected = [t.defaultMember];
                        }
                        if (detected.length === 0) {
                            detected = ['group'];
                        }

                        // 3. 아티스트명 및 세대(gen) 자동 판별
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
                            addedAt: Date.now(),
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
                    if (window.StorageManager) {
                        window.StorageManager.addAutoDetectedSongs(newTracks);
                    }
                    renderAllViews();
                    showToast(`🎉 새로운 공식 신곡 ${newTracks.length}곡이 등록되었습니다!`);
                } else if (isManual) {
                    showToast('현재 모든 공식 신곡이 최신 상태입니다.');
                }

                if (window.StorageManager) {
                    window.StorageManager.setLastSyncTime();
                }
            }
        } finally {
            state.isSyncing = false;
            if (dom.btnSyncSongsHome) dom.btnSyncSongsHome.querySelector('svg')?.classList.remove('syncing');
            if (dom.btnSyncSongsSettings) dom.btnSyncSongsSettings.querySelector('svg')?.classList.remove('syncing');
        }
    }

    window.onNativeSyncSongsSuccess = function(tracks) {
        processDiscoveredSongs(tracks, true);
    };

    window.onNativeSyncSongsError = function(errMsg) {
        state.isSyncing = false;
        if (dom.btnSyncSongsHome) dom.btnSyncSongsHome.querySelector('svg')?.classList.remove('syncing');
        if (dom.btnSyncSongsSettings) dom.btnSyncSongsSettings.querySelector('svg')?.classList.remove('syncing');
        showToast(`신곡 탐색 실패: ${errMsg || '네트워크 오류'}`);
    };

    async function syncNewSongs(isManual = false) {
        if (state.isSyncing) return;

        // 자동 동기화 시 쿨다운 검사: 15분 주기 (단, 등록된 자동 탐색 곡이 없을 때는 무조건 실행)
        if (!isManual) {
            const autoSongs = window.StorageManager ? window.StorageManager.getAutoDetectedSongs() : [];
            const lastSync = window.StorageManager ? window.StorageManager.getLastSyncTime() : 0;
            const cooldownMs = 15 * 60 * 1000;
            if (autoSongs.length > 0 && (Date.now() - lastSync < cooldownMs)) {
                return;
            }
        }

        state.isSyncing = true;

        if (dom.btnSyncSongsHome) dom.btnSyncSongsHome.querySelector('svg')?.classList.add('syncing');
        if (dom.btnSyncSongsSettings) dom.btnSyncSongsSettings.querySelector('svg')?.classList.add('syncing');

        if (isManual) {
            showToast('스텔라이브 공식 채널의 신곡을 확인 중...');
        }

        // 1. 네이티브 안드로이드 브리지 (앱 내 자체 yt-dlp) 지원 시 우선 실행
        if (window.AndroidBridge && typeof window.AndroidBridge.syncNewSongsNative === 'function') {
            try {
                window.AndroidBridge.syncNewSongsNative();
                return;
            } catch (e) {
                console.warn('[Native Sync Failed, Fallback to HTTP]', e);
            }
        }

        // 2. PC 서버 또는 웹 API를 통한 신곡 탐색 (브라우저/PWA 환경 폴백)
        try {
            const pcServer = (localStorage.getItem('stellplay_pc_server') || '').trim().replace(/\/+$/, '');
            const isWeb = (window.location.port !== '8888');
            const endpoints = [];
            if (pcServer) {
                endpoints.push(`${pcServer}/api/sync-new-songs`);
            }
            if (isWeb) {
                endpoints.push(`./songs-latest.json?t=${Date.now()}`);
                endpoints.push(`../songs-latest.json?t=${Date.now()}`);
            } else {
                endpoints.push('/api/sync-new-songs');
            }

            let data = null;
            for (const ep of endpoints) {
                try {
                    const res = await fetch(ep, { signal: AbortSignal.timeout(5000) });
                    if (res.ok) {
                        const parsed = await res.json();
                        if (parsed && parsed.success) {
                            data = parsed;
                            break;
                        }
                    }
                } catch (e) {}
            }

            if (!data) throw new Error('신곡 동기화 서버 연결 실패');

            processDiscoveredSongs(data.tracks || [], isManual);
        } catch (err) {
            console.warn('[Sync Error]', err);
            if (isManual) {
                showToast('ℹ️ 신곡 자동 탐색은 PC 서버 연동(설정 탭)이 필요합니다.');
            }
            state.isSyncing = false;
            if (dom.btnSyncSongsHome) dom.btnSyncSongsHome.querySelector('svg')?.classList.remove('syncing');
            if (dom.btnSyncSongsSettings) dom.btnSyncSongsSettings.querySelector('svg')?.classList.remove('syncing');
        }
    }

    // ===================================================================
    // 9. 오프라인 다운로드 및 좋아요 핸들러
    // ===================================================================
    async function handleDownloadToggle(song) {
        if (state.downloadingIds.has(song.id)) return;

        const isSaved = state.offlineSongIds.has(song.id);
        if (isSaved) {
            if (confirm(`[${song.title}] 곡을 오프라인 저장소에서 삭제하시겠습니까?`)) {
                await window.OfflineDB.deleteTrack(song.id);
                showToast(`[${song.title}] 오프라인 저장소에서 삭제되었습니다.`);
                await refreshOfflineCacheState();
                renderAllViews();
            }
            return;
        }

        // 다운로드 진행
        state.downloadingIds.add(song.id);
        renderAllViews();
        showToast(`[${song.title}] 오프라인 다운로드를 시작합니다...`);

        try {
            await window.OfflineDB.downloadSong(song, (percent) => {});
            showToast(`🎉 [${song.title}] 오프라인 보관함에 저장되었습니다!`);
        } catch (err) {
            const hasPc = !!(localStorage.getItem('stellplay_pc_server') || '').trim();
            if (!hasPc && !window.AndroidBridge) {
                showToast(`ℹ️ 오프라인 음원 다운로드는 PC 서버 연동(설정 탭)이 필요합니다.`);
            } else {
                showToast(`다운로드 실패: ${err.message || '네트워크 오류'}`);
            }
        } finally {
            state.downloadingIds.delete(song.id);
            await refreshOfflineCacheState();
            renderAllViews();
        }
    }

    function handleFavoriteToggle(songId) {
        const idx = state.favorites.indexOf(songId);
        if (idx > -1) {
            state.favorites.splice(idx, 1);
            showToast('보관함에서 제외되었습니다.');
        } else {
            state.favorites.unshift(songId);
            showToast('보관함에 저장되었습니다!');
        }
        localStorage.setItem('stellplay_m_favs', JSON.stringify(state.favorites));
        renderAllViews();
    }

    function renderAllViews() {
        if (state.activeView === 'view-home') renderHomeTracks();
        else if (state.activeView === 'view-sabi') renderSabiTracks();
        else if (state.activeView === 'view-offline') renderOfflineTracks();
        else if (state.activeView === 'view-playlists') renderPlaylists();
        updateQueueBadge();
    }

    // ===================================================================
    // 10. 플레이어 UI 동기화
    // ===================================================================
    function updatePlayerUI(song, isOffline) {
        if (!song) return;

        const thumb = `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`;

        // 미니 플레이어
        dom.miniThumbImg.src = thumb;
        dom.miniTitle.textContent = song.title + (isOffline ? ' [오프라인]' : '');
        dom.miniArtist.textContent = song.artist;

        // 전체화면 시트
        dom.sheetAlbumImg.src = thumb;
        dom.sheetSongTitle.textContent = song.title;
        if (dom.sheetModeBadge) {
            dom.sheetModeBadge.textContent = isOffline ? 'OFFLINE PLAYBACK' : (player.sabiMode ? 'SABI HIGHLIGHT' : 'NOW PLAYING');
            dom.sheetModeBadge.style.color = isOffline ? '#10b981' : (player.sabiMode ? '#f59e0b' : 'var(--text-muted)');
        }

        syncSabiUI();

        // 시트 다운로드 버튼 상태
        const isDownloaded = state.offlineSongIds.has(song.id);
        if (dom.sheetDownloadBtn) {
            dom.sheetDownloadBtn.classList.toggle('active', isDownloaded);
            dom.sheetDownloadBtn.style.color = isDownloaded ? '#10b981' : 'var(--text-secondary)';
        }

        // 활성 행 스타일 갱신
        document.querySelectorAll('.m-track-row').forEach(row => {
            row.classList.toggle('playing', row.dataset.songId === song.id);
        });

        // 대기열 목록이 열려있거나 태블릿 2분할 모드인 경우 상태 갱신
        if (dom.queueSheet.classList.contains('open') || (dom.fullscreenSheet.classList.contains('open') && window.innerWidth >= 650)) {
            renderMobileQueue();
        }
    }

    function syncSabiUI() {
        const isSabi = !!player.sabiMode;
        if (dom.headerSabiBtn) dom.headerSabiBtn.classList.toggle('active', isSabi);
        if (dom.headerSabiText) dom.headerSabiText.textContent = isSabi ? '사비 ON' : '사비 OFF';
        if (dom.sheetSabiBtn) dom.sheetSabiBtn.classList.toggle('active', isSabi);
        if (dom.sheetModeBadge) {
            dom.sheetModeBadge.textContent = player.isOfflinePlayback ? 'OFFLINE PLAYBACK' : (isSabi ? 'SABI HIGHLIGHT' : 'NOW PLAYING');
            dom.sheetModeBadge.style.color = player.isOfflinePlayback ? '#10b981' : (isSabi ? '#f59e0b' : 'var(--text-muted)');
        }
    }

    function updatePlayButtonUI(isPlaying) {
        const playIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>`;
        const pauseIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;

        dom.miniPlayBtn.innerHTML = isPlaying ? pauseIcon : playIcon;

        const sheetPlayIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>`;
        const sheetPauseIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
        dom.sheetPlayBtn.innerHTML = isPlaying ? sheetPauseIcon : sheetPlayIcon;

        dom.sheetVinylDisc.classList.toggle('spinning', isPlaying);
    }

    // ===================================================================
    // 10-1. 설정 뷰: 오디오 캐시 & 크로스페이드 & 데이터 절약 상태 갱신 함수
    // ===================================================================
    function updateSettingsCacheInfo() {
        if (dom.cacheSizeBadge) {
            const bytes = (player && typeof player.getAudioCacheSize === 'function') ? player.getAudioCacheSize() : 0;
            const mb = (bytes / (1024 * 1024)).toFixed(1);
            dom.cacheSizeBadge.textContent = `${mb} MB / 500 MB`;
        }

        // 음질 및 데이터 모드 상태 표시
        const curQuality = player.getAudioQuality();
        if (dom.qualityBtns) {
            dom.qualityBtns.forEach(btn => {
                const q = btn.dataset.quality;
                const isActive = q === curQuality;
                btn.classList.toggle('active', isActive);
                btn.style.background = isActive ? 'var(--theme-color)' : 'rgba(255,255,255,0.06)';
                btn.style.color = isActive ? '#fff' : 'var(--text-secondary)';
                btn.style.border = isActive ? 'none' : '1px solid var(--border-glass)';
                btn.style.fontWeight = isActive ? '700' : '600';
            });
        }

        // 크로스페이드 상태 표시
        const isCfEnabled = player.isCrossfadeEnabled ? player.isCrossfadeEnabled() : true;
        const curCrossfade = Math.max(5, Math.min(15, player.getCrossfade() || 10));

        if (dom.crossfadeToggle) dom.crossfadeToggle.checked = isCfEnabled;
        if (dom.crossfadeToggleSwitch) {
            dom.crossfadeToggleSwitch.style.backgroundColor = isCfEnabled ? 'var(--theme-color)' : 'rgba(255,255,255,0.15)';
        }
        if (dom.crossfadeToggleKnob) {
            dom.crossfadeToggleKnob.style.transform = isCfEnabled ? 'translateX(20px)' : 'translateX(0px)';
        }
        if (dom.crossfadeSliderWrap) {
            dom.crossfadeSliderWrap.style.opacity = isCfEnabled ? '1' : '0.35';
            dom.crossfadeSliderWrap.style.pointerEvents = isCfEnabled ? 'auto' : 'none';
        }
        if (dom.crossfadeBadge) {
            if (isCfEnabled) {
                dom.crossfadeBadge.textContent = `${curCrossfade}초`;
                dom.crossfadeBadge.style.color = 'var(--color-green)';
                dom.crossfadeBadge.style.background = 'rgba(16,185,129,0.15)';
            } else {
                dom.crossfadeBadge.textContent = '꺼짐';
                dom.crossfadeBadge.style.color = 'var(--text-muted)';
                dom.crossfadeBadge.style.background = 'rgba(255,255,255,0.08)';
            }
        }
        if (dom.crossfadeSlider) {
            dom.crossfadeSlider.value = curCrossfade;
            dom.crossfadeSlider.disabled = !isCfEnabled;
        }
    }

    // ===================================================================
    // 11. 이벤트 리스너 바인딩
    // ===================================================================
    function bindEvents() {
        // 하단 탭 전환
        dom.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetViewId = btn.dataset.view;
                state.activeView = targetViewId;

                dom.tabBtns.forEach(b => b.classList.toggle('active', b === btn));
                dom.viewSections.forEach(sec => sec.classList.toggle('active', sec.id === targetViewId));

                // 설정 및 재생목록 탭에서는 상단 멤버 바 및 검색창 숨김 처리
                const hideTopBars = (targetViewId === 'view-settings' || targetViewId === 'view-playlists');
                const memBar = dom.membersContainer || dom.membersGrid;
                if (memBar) {
                    if (hideTopBars) {
                        memBar.classList.add('hidden');
                        memBar.style.display = 'none';
                    } else {
                        memBar.classList.remove('hidden');
                        memBar.style.display = 'block';
                    }
                }

                if (dom.searchBarWrap) {
                    if (hideTopBars) {
                        dom.searchBarWrap.classList.add('hidden');
                        dom.searchBarWrap.style.display = 'none';
                    } else {
                        dom.searchBarWrap.classList.remove('hidden');
                        dom.searchBarWrap.style.display = 'flex';
                    }
                }

                if (targetViewId === 'view-offline') {
                    refreshOfflineCacheState().then(() => renderOfflineTracks());
                }
                else if (targetViewId === 'view-playlists') renderPlaylists();
                else if (targetViewId === 'view-home') renderHomeTracks();
                else if (targetViewId === 'view-settings') {
                    refreshOfflineCacheState();
                    updateSettingsCacheInfo();
                }
            });
        });

        // 트랙 리스트 클릭 이벤트 위임 (컨테이너 레벨 단일 리스너로 1,650개 개별 리스너 제거)
        if (dom.trackListHome) {
            dom.trackListHome.addEventListener('click', (e) => handleTrackContainerClick(e, () => state.currentHomeSongs || getFilteredSongs()));
        }
        if (dom.trackListOffline) {
            dom.trackListOffline.addEventListener('click', (e) => handleTrackContainerClick(e, () => state.currentOfflineSongs || []));
        }
        if (dom.trackListSabi) {
            dom.trackListSabi.addEventListener('click', (e) => handleTrackContainerClick(e, () => state.currentSabiSongs || []));
        }
        if (dom.detailPlaylistTracks) {
            dom.detailPlaylistTracks.addEventListener('click', (e) => handleTrackContainerClick(e, () => state.currentPlaylistTracks || []));
        }
        if (dom.moodTrackList) {
            dom.moodTrackList.addEventListener('click', (e) => handleTrackContainerClick(e, () => currentMoodSongs || []));
        }

        // 정렬 셀렉트 (최신순 / 오래된순 / 곡명순)
        if (dom.sortSelect) {
            dom.sortSelect.value = state.sortOrder || 'latest';
            dom.sortSelect.addEventListener('change', (e) => {
                state.sortOrder = e.target.value;
                renderAllViews();
            });
        }

        // 현재 필터링된 곡 랜덤/셔플 재생 버튼
        if (dom.btnRandomPlayFiltered) {
            dom.btnRandomPlayFiltered.addEventListener('click', () => {
                const songs = getFilteredSongs();
                if (songs.length === 0) {
                    showToast('현재 조건에 재생할 수 있는 곡이 없습니다.');
                    return;
                }
                const shuffled = [...songs];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                player.setQueue(shuffled, 0, true);
                showToast(`🔀 ${songs.length}곡을 셔플 재생합니다.`);
            });
        }

        // 분위기 & 바이브 추천 프리셋 설정 (동적 라이브러리 평가)
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
                // 숏폼 영상 원천 제외
                if (song.duration && song.duration > 0 && song.duration < 65) return;
                const titleLower = (song.title || '').toLowerCase();
                const fullText = `${titleLower} ${song.artist || ''} ${song.originalArtist || ''} ${song.id || ''}`.toLowerCase();
                
                // 1. 제외 키워드 필터링 (분위기에 어울리지 않는 곡 원천 차단)
                if (preset.exclude_titles && preset.exclude_titles.some(ex => titleLower.includes(ex) || fullText.includes(ex))) {
                    return;
                }

                // 2. 긍정 키워드 매칭
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

            // 순수 일치 곡만 점수순으로 정렬하여 반환 (무작위 패딩 전면 제거)
            scored.sort((a, b) => b.score - a.score);
            return scored.map(item => item.song);
        }

        function rollRandomMoodPlaylist(moodKey, count = 20) {
            const pool = getMoodCandidates(moodKey);
            const shuffled = [...pool];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled.slice(0, Math.min(count, shuffled.length));
        }

        function renderMoodTrackList() {
            if (!dom.moodTrackList) return;
            dom.moodTrackList.innerHTML = '';
            const frag = document.createDocumentFragment();
            currentMoodSongs.forEach((song, idx) => {
                frag.appendChild(createTrackRowElement(song, currentMoodSongs, idx));
            });
            dom.moodTrackList.appendChild(frag);
        }

        function openMoodDetail(moodKey) {
            const preset = MOOD_PRESETS[moodKey];
            if (!preset) return;
            currentMoodKey = moodKey;
            currentMoodPreset = preset;

            // 실시간 전체 곡 풀에서 신선한 랜덤 플레이리스트 생성
            currentMoodSongs = rollRandomMoodPlaylist(moodKey, 20);

            if (dom.moodModalIcon) dom.moodModalIcon.textContent = preset.icon;
            if (dom.moodModalTitle) dom.moodModalTitle.textContent = `${preset.icon} ${preset.title} (${currentMoodSongs.length}곡 추천)`;
            if (dom.moodModalSub) dom.moodModalSub.textContent = `${preset.desc} • 언제든 새로고침으로 새로운 조합을 만날 수 있습니다`;

            renderMoodTrackList();

            if (dom.modalMoodDetail) dom.modalMoodDetail.classList.add('open');
        }

        function closeMoodDetail() {
            if (dom.modalMoodDetail) dom.modalMoodDetail.classList.remove('open');
        }

        document.querySelectorAll('.mood-chip-card').forEach(card => {
            card.addEventListener('click', () => {
                const mood = card.dataset.mood;
                openMoodDetail(mood);
            });
        });

        if (dom.btnCloseMoodModal) dom.btnCloseMoodModal.addEventListener('click', () => closeMoodDetail());
        if (dom.modalMoodDetail) {
            dom.modalMoodDetail.addEventListener('click', (e) => {
                if (e.target === dom.modalMoodDetail) closeMoodDetail();
            });
        }

        // 다른 추천곡으로 새로고침 버튼
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
                closeMoodDetail();
            });
        }

        if (dom.btnMoodSavePlaylist) {
            dom.btnMoodSavePlaylist.addEventListener('click', () => {
                if (!currentMoodSongs || currentMoodSongs.length === 0) return;
                const plName = `${currentMoodPreset.icon} ${currentMoodPreset.title} 믹스`;
                const songIds = currentMoodSongs.map(s => s.id);
                const newPl = StorageManager.createPlaylist(plName, songIds);
                if (newPl) {
                    showToast(`🎉 '${plName}' 재생목록이 생성되었습니다!`);
                    renderPlaylists();
                }
            });
        }

        // 홈 퀵 액션 바
        if (dom.btnOpenQueueHome) dom.btnOpenQueueHome.addEventListener('click', () => openQueueSheet());
        if (dom.btnOpenAddSongHome) dom.btnOpenAddSongHome.addEventListener('click', () => openAddSongModal());
        if (dom.btnSyncSongsHome) dom.btnSyncSongsHome.addEventListener('click', () => syncNewSongs(true));

        // 홈 복수 선택 액션
        if (dom.btnToggleMultiselectHome) {
            dom.btnToggleMultiselectHome.addEventListener('click', () => toggleHomeMultiSelect());
        }
        if (dom.btnMultiselectAll) {
            dom.btnMultiselectAll.addEventListener('click', () => {
                const songs = getFilteredSongs();
                const allSelected = songs.length > 0 && songs.every(s => state.selectedSongIds.has(s.id));
                if (allSelected) {
                    state.selectedSongIds.clear();
                } else {
                    songs.forEach(s => state.selectedSongIds.add(s.id));
                }
                updateHomeMultiSelectUI();
            });
        }
        if (dom.btnMultiselectPlay) {
            dom.btnMultiselectPlay.addEventListener('click', () => playSelectedHomeSongs());
        }
        if (dom.btnMultiselectAddPlaylist) {
            dom.btnMultiselectAddPlaylist.addEventListener('click', () => {
                if (state.selectedSongIds.size === 0) {
                    showToast('추가할 곡을 선택해주세요.');
                    return;
                }
                openAddToPlaylistModal(Array.from(state.selectedSongIds));
            });
        }
        if (dom.btnMultiselectCancel) {
            dom.btnMultiselectCancel.addEventListener('click', () => toggleHomeMultiSelect(false));
        }

        // 오프라인 선택 삭제 액션
        if (dom.btnOfflineSelectMode) {
            dom.btnOfflineSelectMode.addEventListener('click', () => toggleOfflineSelectMode());
        }
        if (dom.btnOfflineDeleteSelectAll) {
            dom.btnOfflineDeleteSelectAll.addEventListener('click', async () => {
                const records = await window.OfflineDB.getAllTracks();
                const offlineSongs = filterSongList(records.map(r => r.song), false);
                const allSelected = offlineSongs.length > 0 && offlineSongs.every(s => state.offlineSelectedSongIds.has(s.id));
                if (allSelected) {
                    state.offlineSelectedSongIds.clear();
                } else {
                    offlineSongs.forEach(s => state.offlineSelectedSongIds.add(s.id));
                }
                updateOfflineSelectUI();
            });
        }
        if (dom.btnOfflineDeleteConfirm) {
            dom.btnOfflineDeleteConfirm.addEventListener('click', () => deleteSelectedOfflineTracks());
        }
        if (dom.btnOfflineDeleteCancel) {
            dom.btnOfflineDeleteCancel.addEventListener('click', () => toggleOfflineSelectMode(false));
        }

        // 대기열 저장 버튼
        if (dom.btnSaveQueuePlaylist) {
            dom.btnSaveQueuePlaylist.addEventListener('click', () => {
                const queue = player.queue || [];
                if (queue.length === 0) {
                    showToast('대기열이 비어있습니다.');
                    return;
                }
                const songIds = queue.map(s => s.id);
                openCreatePlaylistModal(songIds);
            });
        }

        // 재생목록 상단 생성 버튼
        if (dom.btnCreatePlaylistTop) {
            dom.btnCreatePlaylistTop.addEventListener('click', () => openCreatePlaylistModal());
        }


        // 재생목록 상세 뒤로가기
        if (dom.btnPlaylistDetailBack) {
            dom.btnPlaylistDetailBack.addEventListener('click', () => closePlaylistDetail());
        }

        // 재생목록 상세 전체 재생
        if (dom.btnPlaylistDetailPlayAll) {
            dom.btnPlaylistDetailPlayAll.addEventListener('click', () => {
                if (state.activePlaylistDetailId) playPlaylistAll(state.activePlaylistDetailId);
            });
        }

        // 재생목록 상세 삭제
        if (dom.btnPlaylistDetailDelete) {
            dom.btnPlaylistDetailDelete.addEventListener('click', () => {
                if (state.activePlaylistDetailId) deletePlaylistConfirm(state.activePlaylistDetailId);
            });
        }

        // 재생목록 상세 감상 기록 비우기
        if (dom.btnPlaylistDetailClearHistory) {
            dom.btnPlaylistDetailClearHistory.addEventListener('click', () => {
                if (confirm('최근 감상 기록을 모두 비우시겠습니까?')) {
                    StorageManager.clearHistory();
                    showToast('최근 감상 기록이 모두 지워졌습니다.');
                    openPlaylistDetail('pl-history');
                }
            });
        }

        // 재생목록 상세 곡 추가 버튼
        if (dom.btnPlaylistDetailAddTracks) {
            dom.btnPlaylistDetailAddTracks.addEventListener('click', () => {
                if (state.activePlaylistDetailId) {
                    openMobilePlaylistAddTracksModal(state.activePlaylistDetailId);
                }
            });
        }

        // 모바일 곡 추가 탐색 모달 이벤트 바인딩
        const btnCloseMPlAdd = document.getElementById('m-btn-close-pl-add');
        if (btnCloseMPlAdd) btnCloseMPlAdd.addEventListener('click', closeMobilePlaylistAddTracksModal);

        const btnCancelMPlAdd = document.getElementById('m-btn-cancel-pl-add');
        if (btnCancelMPlAdd) btnCancelMPlAdd.addEventListener('click', closeMobilePlaylistAddTracksModal);

        const modalMPlAdd = document.getElementById('m-modal-playlist-add-tracks');
        if (modalMPlAdd) {
            modalMPlAdd.addEventListener('click', (e) => {
                if (e.target === modalMPlAdd || e.target.classList.contains('modal-backdrop')) {
                    closeMobilePlaylistAddTracksModal();
                }
            });
        }

        const inputMPlAddSearch = document.getElementById('m-pl-add-search-input');
        const btnMPlAddSearchClear = document.getElementById('m-pl-add-search-clear');
        let mPlSearchDebounceTimer = null;
        if (inputMPlAddSearch) {
            inputMPlAddSearch.addEventListener('input', (e) => {
                const val = e.target.value;
                if (btnMPlAddSearchClear) btnMPlAddSearchClear.style.display = val ? 'block' : 'none';
                clearTimeout(mPlSearchDebounceTimer);
                mPlSearchDebounceTimer = setTimeout(() => {
                    mPlAddSearchQuery = val;
                    renderMobilePlaylistAddTracksList();
                }, 150);
            });
        }
        if (btnMPlAddSearchClear) {
            btnMPlAddSearchClear.addEventListener('click', () => {
                if (inputMPlAddSearch) inputMPlAddSearch.value = '';
                mPlAddSearchQuery = '';
                btnMPlAddSearchClear.style.display = 'none';
                renderMobilePlaylistAddTracksList();
            });
        }

        document.querySelectorAll('#m-pl-add-type-filters button').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#m-pl-add-type-filters button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                mPlAddTypeFilter = btn.dataset.type || 'all';
                renderMobilePlaylistAddTracksList();
            });
        });

        document.querySelectorAll('#m-pl-add-member-filters button').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#m-pl-add-member-filters button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                mPlAddMemberFilter = btn.dataset.member || 'all';
                renderMobilePlaylistAddTracksList();
            });
        });

        const btnMPlAddSelectAll = document.getElementById('m-btn-pl-add-select-all');
        if (btnMPlAddSelectAll) {
            btnMPlAddSelectAll.addEventListener('click', () => {
                if (!mPlAddTargetId) return;
                const playlists = StorageManager.getPlaylists(false);
                const targetPl = playlists.find(p => p.id === mPlAddTargetId);
                const alreadySongIds = new Set(targetPl ? (targetPl.songIds || []) : []);
                const filtered = getMobileFilteredSongsForAddModal();

                filtered.forEach(song => {
                    if (!alreadySongIds.has(song.id)) {
                        mPlAddSelectedSongIds.add(song.id);
                    }
                });
                renderMobilePlaylistAddTracksList();
                updateMobilePlaylistAddModalActions();
            });
        }

        const btnMPlAddDeselectAll = document.getElementById('m-btn-pl-add-deselect-all');
        if (btnMPlAddDeselectAll) {
            btnMPlAddDeselectAll.addEventListener('click', () => {
                mPlAddSelectedSongIds.clear();
                renderMobilePlaylistAddTracksList();
                updateMobilePlaylistAddModalActions();
            });
        }

        const btnMConfirmPlAdd = document.getElementById('m-btn-confirm-pl-add');
        if (btnMConfirmPlAdd) {
            btnMConfirmPlAdd.addEventListener('click', () => {
                if (mPlAddSelectedSongIds.size === 0 || !mPlAddTargetId) return;
                const targetId = mPlAddTargetId;
                const count = mPlAddSelectedSongIds.size;
                StorageManager.addSongsToPlaylist(targetId, Array.from(mPlAddSelectedSongIds));
                showToast(`선택한 ${count}곡이 재생목록에 추가되었습니다!`);
                closeMobilePlaylistAddTracksModal();
                openPlaylistDetail(targetId);
            });
        }

        // 재생목록 선택 모달 닫기
        if (dom.btnCloseSelectPlaylist) {
            dom.btnCloseSelectPlaylist.addEventListener('click', () => closeAddToPlaylistModal());
        }

        // 재생목록 선택 모달에서 "새 재생목록 만들고 추가" 버튼
        if (dom.btnCreateAndAddPlaylist) {
            dom.btnCreateAndAddPlaylist.addEventListener('click', () => {
                const name = (dom.inputNewPlaylistQuick?.value || '').trim();
                if (!name) {
                    showToast('재생목록 이름을 입력해주세요.');
                    return;
                }
                const pl = StorageManager.createPlaylist(name, pendingAddToPlaylistSongIds);
                showToast(`'${name}' 재생목록이 생성되고 곡이 추가되었습니다.`);
                closeAddToPlaylistModal();
                renderPlaylists();
                if (state.isMultiSelectHome) toggleHomeMultiSelect(false);
            });
        }

        // 새 재생목록 생성 모달
        if (dom.btnCloseCreatePlaylist) {
            dom.btnCloseCreatePlaylist.addEventListener('click', () => closeCreatePlaylistModal());
        }
        if (dom.btnCancelCreatePlaylist) {
            dom.btnCancelCreatePlaylist.addEventListener('click', () => closeCreatePlaylistModal());
        }
        if (dom.formCreatePlaylist) {
            dom.formCreatePlaylist.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = (dom.inputCreatePlaylistName?.value || '').trim();
                if (!name) return;
                const pl = StorageManager.createPlaylist(name, pendingCreatePlaylistSongIds);
                showToast(`'${name}' 재생목록이 생성되었습니다.`);
                closeCreatePlaylistModal();
                renderPlaylists();
                openPlaylistDetail(pl.id);
            });
        }


        // 화면 테마 이벤트 등록

        if (dom.btnThemeDark) {
            dom.btnThemeDark.addEventListener('click', () => {
                applyMobileTheme('dark');
                showToast('🌙 다크 모드가 적용되었습니다.');
            });
        }
        if (dom.btnThemeLight) {
            dom.btnThemeLight.addEventListener('click', () => {
                applyMobileTheme('light');
                showToast('☀️ 라이트 모드가 적용되었습니다.');
            });
        }
        if (dom.btnTopTheme) {
            dom.btnTopTheme.addEventListener('click', () => {
                const cur = document.documentElement.getAttribute('data-theme') || 'dark';
                const nextTheme = cur === 'dark' ? 'light' : 'dark';
                applyMobileTheme(nextTheme);
                showToast(nextTheme === 'dark' ? '🌙 다크 모드가 적용되었습니다.' : '☀️ 라이트 모드가 적용되었습니다.');
            });
        }

        if (dom.qualityBtns) {
            dom.qualityBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const q = btn.dataset.quality;
                    player.setAudioQuality(q);
                    updateSettingsCacheInfo();
                    const toastMap = {
                        'data_saver': '🌱 항상 데이터 절약 (저음질/초고속 모드) 적용',
                        'wifi_only': '📶 Wi-Fi 연결 시에만 고음질로 스트리밍합니다.',
                        'high_always': '✨ 항상 고음질 모드로 스트리밍합니다.'
                    };
                    showToast(toastMap[q] || '음질 설정이 변경되었습니다.');
                });
            });
        }

        if (dom.crossfadeToggle) {
            dom.crossfadeToggle.addEventListener('change', (e) => {
                const isEnabled = e.target.checked;
                player.setCrossfadeEnabled(isEnabled);
                updateSettingsCacheInfo();
                showToast(isEnabled ? `곡 전환 크로스페이드가 켜졌습니다 (${player.getCrossfade()}초).` : '곡 전환 크로스페이드가 꺼졌습니다.');
            });
        }

        if (dom.crossfadeSlider) {
            const handleSlider = (e) => {
                const sec = Math.max(5, Math.min(15, parseInt(e.target.value, 10) || 10));
                player.setCrossfade(sec);
                if (dom.crossfadeBadge) {
                    dom.crossfadeBadge.textContent = `${sec}초`;
                    dom.crossfadeBadge.style.color = 'var(--color-green)';
                    dom.crossfadeBadge.style.background = 'rgba(16,185,129,0.15)';
                }
            };
            dom.crossfadeSlider.addEventListener('input', handleSlider);
            dom.crossfadeSlider.addEventListener('change', (e) => {
                handleSlider(e);
                const sec = Math.max(5, Math.min(15, parseInt(e.target.value, 10) || 10));
                showToast(`곡 전환 크로스페이드가 ${sec}초로 설정되었습니다.`);
            });
        }

        if (dom.btnSyncSongsSettings) dom.btnSyncSongsSettings.addEventListener('click', () => syncNewSongs(true));
        if (dom.btnRestoreHiddenSettings) {
            dom.btnRestoreHiddenSettings.addEventListener('click', () => {
                if (confirm('숨겨졌던 모든 곡을 라이브러리에 다시 복원하시겠습니까?')) {
                    if (window.StorageManager) {
                        window.StorageManager.restoreAllHiddenSongs();
                    }
                    renderAllViews();
                    showToast('🎉 숨겨졌던 모든 곡이 정상 복원되었습니다!');
                }
            });
        }

        // 오프라인 DB 이벤트 수신
        window.addEventListener('stellplay:offlineTrackSaved', async () => {
            await refreshOfflineCacheState();
            renderAllViews();
        });
        window.addEventListener('stellplay:offlineTrackDeleted', async () => {
            await refreshOfflineCacheState();
            renderAllViews();
        });
        window.addEventListener('stellplay:offlineAllCleared', async () => {
            await refreshOfflineCacheState();
            renderAllViews();
        });

        // 타입 필터 탭
        dom.typePills.forEach(pill => {
            pill.addEventListener('click', () => {
                state.selectedType = pill.dataset.type;
                dom.typePills.forEach(p => p.classList.toggle('active', p === pill));
                renderHomeTracks();
            });
        });

        // 검색 (활성 탭에 맞춰 전체 갱신 - 150ms 디바운스 적용)
        let searchDebounceTimer = null;
        dom.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            dom.searchClear.style.display = query ? 'block' : 'none';
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(() => {
                state.searchQuery = query;
                renderAllViews();
            }, 150);
        });
        dom.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                dom.searchInput.blur();
            }
        });
        dom.searchClear.addEventListener('click', () => {
            dom.searchInput.value = '';
            state.searchQuery = '';
            dom.searchClear.style.display = 'none';
            renderAllViews();
        });

        let mobilePlayerViewMode = 'art';

        function switchMobilePlayerView(mode) {
            mobilePlayerViewMode = mode;
            if (dom.btnViewArt) {
                dom.btnViewArt.classList.toggle('active', mode === 'art');
                dom.btnViewArt.style.background = mode === 'art' ? 'rgba(255,255,255,0.2)' : 'transparent';
                dom.btnViewArt.style.color = mode === 'art' ? 'var(--text-primary)' : 'var(--text-muted)';
            }
            if (dom.btnViewVideo) {
                dom.btnViewVideo.classList.toggle('active', mode === 'video');
                dom.btnViewVideo.style.background = mode === 'video' ? 'rgba(255,255,255,0.2)' : 'transparent';
                dom.btnViewVideo.style.color = mode === 'video' ? 'var(--text-primary)' : 'var(--text-muted)';
            }

            if (mode === 'video') {
                if (dom.sheetArtBox) dom.sheetArtBox.style.display = 'none';
                dockYouTubePlayer(true);
            } else {
                dockYouTubePlayer(false);
                if (dom.sheetArtBox) dom.sheetArtBox.style.display = 'flex';
            }

            if (player && typeof player.switchViewMode === 'function') {
                player.switchViewMode(mode);
            }
        }

        function dockYouTubePlayer(isDocked) {
            const wrap = document.getElementById('m-youtube-player-wrap');
            const sheetBox = dom.sheetVideoBox || document.getElementById('m-sheet-video-box');
            if (sheetBox) {
                sheetBox.classList.toggle('active-video', !!isDocked);
            }
            if (wrap) {
                wrap.classList.toggle('docked', !!isDocked);
            }
        }

        if (dom.btnViewArt) {
            dom.btnViewArt.addEventListener('click', () => switchMobilePlayerView('art'));
        }
        if (dom.btnViewVideo) {
            dom.btnViewVideo.addEventListener('click', () => switchMobilePlayerView('video'));
        }

        if (dom.btnOpenAdSkip) {
            dom.btnOpenAdSkip.addEventListener('click', () => {
                if (player && typeof player.skipAd === 'function') {
                    player.skipAd();
                }
                if (dom.adFloatingBanner) dom.adFloatingBanner.style.display = 'none';
            });
        }

        const mBtnOverlaySkipAd = document.getElementById('m-btn-overlay-skip-ad');
        if (mBtnOverlaySkipAd) {
            mBtnOverlaySkipAd.addEventListener('click', (e) => {
                e.stopPropagation();
                if (player && typeof player.skipAd === 'function') {
                    player.skipAd();
                }
            });
        }

        window.addEventListener('mobileplayer:adShieldState', (e) => {
            const isAd = !!e.detail?.isAd;
            const mOverlay = document.getElementById('m-ad-shield-overlay');
            if (mOverlay) {
                mOverlay.style.display = isAd ? 'flex' : 'none';
            }
            if (isAd) {
                if (dom.adFloatingBanner && (!dom.fullscreenSheet || !dom.fullscreenSheet.classList.contains('open'))) {
                    dom.adFloatingBanner.style.display = 'flex';
                }
            } else {
                if (dom.adFloatingBanner) dom.adFloatingBanner.style.display = 'none';
            }
        });

        // 미니 플레이어 탭 -> 전체화면 시트 열기
        dom.miniLeftContent.addEventListener('click', () => {
            document.body.classList.remove('tablet-queue-collapsed');
            dom.fullscreenSheet.classList.add('open');
            if (mobilePlayerViewMode === 'video') {
                dockYouTubePlayer(true);
            }
            if (window.innerWidth >= 650) {
                renderMobileQueue(true);
            }
        });
        dom.sheetCloseBtn.addEventListener('click', () => {
            dom.fullscreenSheet.classList.remove('open');
            dockYouTubePlayer(false);
        });

        // 대기열 열기/닫기 및 메뉴 버튼
        if (dom.miniQueueBtn) dom.miniQueueBtn.addEventListener('click', () => toggleQueueSheet());
        if (dom.sheetQueueBtn) {
            dom.sheetQueueBtn.addEventListener('click', () => {
                if (window.innerWidth >= 650) {
                    document.body.classList.toggle('tablet-queue-collapsed');
                } else {
                    toggleQueueSheet();
                }
            });
        }
        if (dom.sheetMenuBtn) {
            dom.sheetMenuBtn.addEventListener('click', () => {
                if (player.currentSong) {
                    openTrackActions(player.currentSong);
                } else {
                    showToast('현재 재생 중인 곡이 없습니다.');
                }
            });
        }
        if (dom.btnCloseQueue) dom.btnCloseQueue.addEventListener('click', () => closeQueueSheet());
        if (dom.queueBackdrop) dom.queueBackdrop.addEventListener('click', () => closeQueueSheet());

        // ===================================================================
        // 13. 재생화면(Now Playing) & 재생목록(대기열) 전역 스크롤/스와이프 제스처
        // - 재생중 창:
        //   * 스마트폰:
        //     - 내리면 (아래로 스와이프, deltaY > 40): 메인화면으로 복귀
        //     - 올리면 (위로 스와이프, deltaY < -40): 재생목록(대기열 시트) 오픈
        //   * 태블릿 (>= 650px):
        //     - 왼쪽으로 슬라이드 (deltaX < -40): 오른쪽에 재생목록 패널 오픈
        //     - 재생창 영역에서 내리면 (deltaY > 40): 메인화면으로 즉시 복귀
        // - 재생목록 창:
        //   * 최상단(scrollTop <= 5)에서 내리면 (deltaY > 40): 재생목록 닫고 재생창으로 복귀
        //   * 상단 헤더/핸들 아래로 드래그 시: 재생목록 닫기
        // ===================================================================
        if (dom.fullscreenSheet) {
            let sheetStartY = 0;
            let sheetStartX = 0;
            let isSheetGesture = false;

            const isInteractive = (el) => !!(el && (el.closest('button') || el.closest('input') || el.closest('a') || el.closest('.sheet-menu-dropdown') || el.closest('#m-modal-sabi-editor')));

            const onStart = (clientX, clientY, target) => {
                if (isInteractive(target)) return;
                sheetStartY = clientY;
                sheetStartX = clientX;
                isSheetGesture = true;
            };

            const onEnd = (clientX, clientY) => {
                if (!isSheetGesture) return;
                isSheetGesture = false;
                const deltaY = clientY - sheetStartY;
                const deltaX = clientX - sheetStartX;

                const isTablet = window.innerWidth >= 650;

                if (isTablet) {
                    // 태블릿 전용 제스처
                    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
                        if (deltaX < -40) {
                            // 왼쪽으로 슬라이드: 우측 대기열 패널 열기
                            document.body.classList.remove('tablet-queue-collapsed');
                            renderMobileQueue(true);
                            return;
                        } else if (deltaX > 40) {
                            // 오른쪽으로 슬라이드: 우측 대기열 패널 접기
                            document.body.classList.add('tablet-queue-collapsed');
                            return;
                        }
                    }
                    if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 40) {
                        // 재생창 영역에서 내리면: 메인화면으로 바로 내려가기
                        dom.fullscreenSheet.classList.remove('open');
                        dockYouTubePlayer(false);
                        return;
                    }
                } else {
                    // 모바일(스마트폰) 전용 제스처
                    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 40) {
                        if (deltaY > 40) {
                            // 내리면: 메인화면으로 복귀
                            dom.fullscreenSheet.classList.remove('open');
                            dockYouTubePlayer(false);
                        } else if (deltaY < -40) {
                            // 올리면: 재생목록(대기열) 열기
                            openQueueSheet();
                        }
                    }
                }
            };

            dom.fullscreenSheet.addEventListener('touchstart', (e) => {
                onStart(e.touches[0].clientX, e.touches[0].clientY, e.target);
            }, { passive: true });

            dom.fullscreenSheet.addEventListener('touchend', (e) => {
                onEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            }, { passive: true });

            dom.fullscreenSheet.addEventListener('mousedown', (e) => {
                onStart(e.clientX, e.clientY, e.target);
            });

            dom.fullscreenSheet.addEventListener('mouseup', (e) => {
                onEnd(e.clientX, e.clientY);
            });

            window.addEventListener('mouseup', (e) => {
                if (isSheetGesture) onEnd(e.clientX, e.clientY);
            });
        }

        // 재생목록(대기열) 스크롤 제스처 (최상단에서 내리면 닫기 & 상단 핸들 내리면 닫기)
        if (dom.queueList) {
            let qListStartY = 0;
            let qListStartX = 0;
            let isQListGesture = false;

            const onQStart = (clientX, clientY) => {
                if (dom.queueList.scrollTop <= 5) {
                    qListStartY = clientY;
                    qListStartX = clientX;
                    isQListGesture = true;
                }
            };

            const onQEnd = (clientX, clientY) => {
                if (!isQListGesture) return;
                isQListGesture = false;
                const deltaY = clientY - qListStartY;
                const deltaX = clientX - qListStartX;

                // 재생목록 최상단에서 내리면: 재생목록 닫고 재생창으로 복귀
                if (dom.queueList.scrollTop <= 10 && Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 40) {
                    closeQueueSheet();
                }
            };

            dom.queueList.addEventListener('touchstart', (e) => {
                onQStart(e.touches[0].clientX, e.touches[0].clientY);
            }, { passive: true });

            dom.queueList.addEventListener('touchend', (e) => {
                onQEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            }, { passive: true });

            dom.queueList.addEventListener('mousedown', (e) => {
                onQStart(e.clientX, e.clientY);
            });

            dom.queueList.addEventListener('mouseup', (e) => {
                onQEnd(e.clientX, e.clientY);
            });

            window.addEventListener('mouseup', (e) => {
                if (isQListGesture) onQEnd(e.clientX, e.clientY);
            });
        }

        // 재생목록 상단 전체 영역 드래그 다운 제스처 (핸들, 타이틀, 힌트 포함 / 버튼 영역 클릭 제외)
        const qTopZone = dom.queueTopZone || dom.queueSheetHandle?.parentElement;
        if (qTopZone) {
            let qStartY = 0;
            let isDraggingQTop = false;

            const isButton = (el) => !!(el && el.closest('button'));

            qTopZone.addEventListener('touchstart', (e) => {
                if (isButton(e.target)) return;
                qStartY = e.touches[0].clientY;
                isDraggingQTop = true;
            }, { passive: true });

            qTopZone.addEventListener('touchmove', (e) => {
                if (!isDraggingQTop) return;
                const deltaY = e.touches[0].clientY - qStartY;
                if (deltaY > 0) {
                    const contentEl = dom.queueSheet?.querySelector('.queue-sheet-content');
                    if (contentEl) {
                        contentEl.style.transform = `translateY(${Math.min(deltaY, 250)}px)`;
                        contentEl.style.transition = 'none';
                    }
                }
            }, { passive: true });

            const finishQSwipe = (deltaY) => {
                if (!isDraggingQTop) return;
                isDraggingQTop = false;
                const contentEl = dom.queueSheet?.querySelector('.queue-sheet-content');
                if (contentEl) {
                    contentEl.style.transition = '';
                    contentEl.style.transform = '';
                }
                if (deltaY > 30) {
                    closeQueueSheet();
                }
            };

            qTopZone.addEventListener('touchend', (e) => {
                if (!isDraggingQTop) return;
                const deltaY = e.changedTouches[0].clientY - qStartY;
                finishQSwipe(deltaY);
            }, { passive: true });

            // PC 마우스 드래그 다운 지원
            qTopZone.addEventListener('mousedown', (e) => {
                if (isButton(e.target)) return;
                qStartY = e.clientY;
                isDraggingQTop = true;

                const onMouseMove = (moveEv) => {
                    if (!isDraggingQTop) return;
                    const deltaY = moveEv.clientY - qStartY;
                    if (deltaY > 0) {
                        const contentEl = dom.queueSheet?.querySelector('.queue-sheet-content');
                        if (contentEl) {
                            contentEl.style.transform = `translateY(${Math.min(deltaY, 250)}px)`;
                            contentEl.style.transition = 'none';
                        }
                    }
                };

                const onMouseUp = (upEv) => {
                    window.removeEventListener('mousemove', onMouseMove);
                    window.removeEventListener('mouseup', onMouseUp);
                    const deltaY = upEv.clientY - qStartY;
                    finishQSwipe(deltaY);
                };
                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mouseup', onMouseUp);
            });
        }

        if (dom.btnClearQueue) {
            dom.btnClearQueue.addEventListener('click', () => {
                player.clearQueue();
                updateQueueBadge();
                showToast('대기열이 비워졌습니다.');
            });
        }

        // 트랙 액션 바텀시트 닫기
        if (dom.btnCloseActions) dom.btnCloseActions.addEventListener('click', () => closeTrackActions());
        if (dom.actionsBackdrop) dom.actionsBackdrop.addEventListener('click', () => closeTrackActions());

        // 트랙 액션 메뉴 항목들
        if (dom.actEdit) {
            dom.actEdit.addEventListener('click', () => {
                const song = state.selectedActionSong;
                closeTrackActions();
                if (song) openEditSongModal(song);
            });
        }

        if (dom.actPlaylist) {
            dom.actPlaylist.addEventListener('click', () => {
                const song = state.selectedActionSong;
                closeTrackActions();
                if (song) openAddToPlaylistModal([song.id]);
            });
        }

        if (dom.actSabi) {
            dom.actSabi.addEventListener('click', () => {
                const song = state.selectedActionSong;
                closeTrackActions();
                if (song) openSabiEditor(song);
            });
        }

        if (dom.actDownload) {
            dom.actDownload.addEventListener('click', async () => {
                const song = state.selectedActionSong;
                closeTrackActions();
                if (song) await handleDownloadToggle(song);
            });
        }

        if (dom.actFav && !dom.actPlaylist) {
            dom.actFav.addEventListener('click', () => {
                const song = state.selectedActionSong;
                closeTrackActions();
                if (song) openAddToPlaylistModal([song.id]);
            });
        }

        // 사비(하이라이트) 에디터 모달 핸들러
        if (dom.btnCloseSabiEditor) dom.btnCloseSabiEditor.addEventListener('click', () => closeSabiEditor());
        if (dom.btnCancelSabiEditor) dom.btnCancelSabiEditor.addEventListener('click', () => closeSabiEditor());
        if (dom.btnSaveSabiEditor) dom.btnSaveSabiEditor.addEventListener('click', () => saveSabiFromEditor());
        if (dom.btnSabiPreviewToggle) dom.btnSabiPreviewToggle.addEventListener('click', () => toggleSabiPreview());

        if (dom.sabiStartSlider) {
            dom.sabiStartSlider.addEventListener('input', () => {
                let val = parseInt(dom.sabiStartSlider.value, 10);
                if (val >= sabiEditorState.endSec - 2) {
                    val = Math.max(0, sabiEditorState.endSec - 2);
                    dom.sabiStartSlider.value = String(val);
                }
                sabiEditorState.startSec = val;
                updateSabiEditorUI();
                if (sabiEditorState.isPreviewing) {
                    player.seek(val);
                }
            });
        }

        if (dom.sabiEndSlider) {
            dom.sabiEndSlider.addEventListener('input', () => {
                let val = parseInt(dom.sabiEndSlider.value, 10);
                if (val <= sabiEditorState.startSec + 2) {
                    val = Math.min(sabiEditorState.duration, sabiEditorState.startSec + 2);
                    dom.sabiEndSlider.value = String(val);
                }
                sabiEditorState.endSec = val;
                updateSabiEditorUI();
                if (sabiEditorState.isPreviewing) {
                    player.seek(Math.max(sabiEditorState.startSec, val - 3));
                }
            });
        }

        if (dom.btnSabiStartSub1) dom.btnSabiStartSub1.addEventListener('click', () => adjustSabiStart(-1));
        if (dom.btnSabiStartAdd1) dom.btnSabiStartAdd1.addEventListener('click', () => adjustSabiStart(1));
        if (dom.btnSabiStartAdd5) dom.btnSabiStartAdd5.addEventListener('click', () => adjustSabiStart(5));
        if (dom.btnSabiEndSub5) dom.btnSabiEndSub5.addEventListener('click', () => adjustSabiEnd(-5));
        if (dom.btnSabiEndSub1) dom.btnSabiEndSub1.addEventListener('click', () => adjustSabiEnd(-1));
        if (dom.btnSabiEndAdd1) dom.btnSabiEndAdd1.addEventListener('click', () => adjustSabiEnd(1));

        if (dom.actDelete) {
            dom.actDelete.addEventListener('click', () => {
                const song = state.selectedActionSong;
                closeTrackActions();
                if (!song) return;

                const isCustom = song.id && (song.id.startsWith('custom-') || song.isCustom);
                if (isCustom) {
                    if (confirm(`[${song.title}] 커스텀 곡을 완전히 삭제하시겠습니까?`)) {
                        if (window.StorageManager) {
                            window.StorageManager.deleteCustomSong(song.id);
                        }
                        showToast(`[${song.title}] 곡이 삭제되었습니다.`);
                        renderAllViews();
                    }
                } else {
                    if (confirm(`[${song.title}] 곡을 라이브러리에서 숨기시겠습니까?\n(설정 탭에서 언제든 다시 복원할 수 있습니다)`)) {
                        if (window.StorageManager) {
                            window.StorageManager.hideSong(song.id);
                        }
                        showToast(`[${song.title}] 곡이 숨겨졌습니다.`);
                        renderAllViews();
                    }
                }
            });
        }

        // 곡 추가 모달 핸들러
        if (dom.btnCloseAddModal) dom.btnCloseAddModal.addEventListener('click', () => closeAddSongModal());
        if (dom.btnCancelAdd) dom.btnCancelAdd.addEventListener('click', () => closeAddSongModal());
        if (dom.btnAutoFetchAdd) {
            dom.btnAutoFetchAdd.addEventListener('click', async () => {
                const url = dom.addYoutube ? dom.addYoutube.value.trim() : '';
                if (!url) {
                    showToast('유튜브 링크 또는 영상 ID를 먼저 입력해주세요.');
                    return;
                }
                dom.btnAutoFetchAdd.disabled = true;
                dom.btnAutoFetchAdd.textContent = '분석 중...';
                try {
                    const resp = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
                    if (!resp.ok) throw new Error('정보 조회 실패');
                    const data = await resp.json();
                    if (data.title && dom.addTitle) dom.addTitle.value = cleanAndKoreanizeTitle(data.title);
                    if (data.artist && dom.addArtist) dom.addArtist.value = cleanAndKoreanizeTitle(data.artist);
                    if (data.duration) {
                        const sStart = Math.floor(data.duration * 0.25);
                        const sEnd = Math.floor(sStart + 35);
                        if (dom.addSabiStart) dom.addSabiStart.value = sStart;
                        if (dom.addSabiEnd) dom.addSabiEnd.value = sEnd;
                    }
                    // 멤버 자동 추론
                    const detected = detectMembersFromText(`${data.title || ''} ${data.artist || ''}`);
                    if (detected.length > 0) {
                        setSelectedMembersInForm('m-add-member-chips', detected);
                        if (dom.addArtist && (!dom.addArtist.value || dom.addArtist.value === '스텔라이브')) {
                            const memberNames = detected
                                .filter(m => m !== 'group')
                                .map(m => (window.MEMBERS && window.MEMBERS[m]) ? window.MEMBERS[m].name : m);
                            if (memberNames.length > 0) dom.addArtist.value = memberNames.join(', ');
                        }
                    }
                    showToast('유튜브 곡 정보를 성공적으로 불러왔습니다!');
                } catch (err) {
                    showToast('영상 정보를 가져오지 못했습니다. 직접 입력해주세요.');
                } finally {
                    dom.btnAutoFetchAdd.disabled = false;
                    dom.btnAutoFetchAdd.textContent = '분석';
                }
            });
        }

        // 곡 추가/수정 실시간 멤버 자동 감지 및 버튼 핸들러
        function autoDetectAddFormMembers() {
            const text = `${dom.addTitle ? dom.addTitle.value : ''} ${dom.addArtist ? dom.addArtist.value : ''}`;
            const detected = detectMembersFromText(text);
            if (detected.length > 0) {
                setSelectedMembersInForm('m-add-member-chips', detected);
            }
        }
        if (dom.addTitle) dom.addTitle.addEventListener('input', autoDetectAddFormMembers);
        if (dom.addArtist) dom.addArtist.addEventListener('input', autoDetectAddFormMembers);

        const btnDetectAdd = document.getElementById('m-btn-detect-add-members');
        if (btnDetectAdd) {
            btnDetectAdd.addEventListener('click', () => {
                const text = `${dom.addTitle ? dom.addTitle.value : ''} ${dom.addArtist ? dom.addArtist.value : ''}`;
                const detected = detectMembersFromText(text);
                if (detected.length > 0) {
                    setSelectedMembersInForm('m-add-member-chips', detected);
                    showToast(`⚡ ${detected.length}명의 멤버가 감지되어 체크되었습니다.`);
                } else {
                    showToast('감지된 멤버가 없습니다. 직접 체크박스를 선택해주세요.');
                }
            });
        }

        if (dom.formAddSong) {
            dom.formAddSong.addEventListener('submit', (e) => {
                e.preventDefault();
                const ytInput = dom.addYoutube.value.trim();
                const title = dom.addTitle.value.trim();
                const artist = dom.addArtist.value.trim();
                const type = dom.addType.value;
                const members = getSelectedMembersFromForm('m-add-member-chips');
                const sStart = parseInt(dom.addSabiStart.value, 10) || 45;
                const sEnd = parseInt(dom.addSabiEnd.value, 10) || 75;

                try {
                    if (window.addCustomSong) {
                        window.addCustomSong({
                            youtubeUrlOrId: ytInput,
                            title: title,
                            artist: artist,
                            type: type,
                            members: members,
                            sabiStart: sStart,
                            sabiEnd: sEnd
                        });
                        showToast(`🎉 [${title}] 새 곡이 등록되었습니다!`);
                        closeAddSongModal();
                        renderAllViews();
                    }
                } catch (err) {
                    showToast(err.message || '곡 추가 중 오류가 발생했습니다.');
                }
            });
        }

        // 곡 수정 모달 참여 멤버 2단계 선택기 초기화
        setupMemberPicker('m-edit', dom.editArtist);

        const btnDetectEdit = document.getElementById('m-btn-detect-edit-members');
        if (btnDetectEdit) {
            btnDetectEdit.addEventListener('click', () => {
                const text = `${dom.editTitle ? dom.editTitle.value : ''} ${dom.editArtist ? dom.editArtist.value : ''}`;
                const detected = detectMembersFromText(text);
                if (detected.length > 0) {
                    const hasGroup = detected.includes('group') && detected.length === 1;
                    const activeMembers = detected.filter(m => m !== 'group');
                    let units = [];
                    if (activeMembers.length > 0) {
                        const g1 = ['yuni', 'huya', 'kanna'];
                        const g2 = ['hina', 'mashiro', 'lize', 'tabi'];
                        const g3 = ['shibuki', 'rin', 'nana', 'riko'];
                        if (g1.every(m => activeMembers.includes(m))) units.push('everlys');
                        if (g2.every(m => activeMembers.includes(m))) units.push('universe');
                        if (g3.every(m => activeMembers.includes(m))) units.push('cliche');
                    }
                    setMemberPickerState('m-edit', {
                        isStellive: hasGroup,
                        units: units,
                        members: activeMembers
                    }, dom.editArtist);
                    syncArtistFromCheckboxes('m-edit', dom.editArtist);
                    showToast(`⚡ ${detected.length}명의 멤버가 감지되어 선택되었습니다.`);
                } else {
                    showToast('감지된 멤버가 없습니다. 직접 체크박스를 선택해주세요.');
                }
            });
        }

        if (dom.btnCloseEditModal) dom.btnCloseEditModal.addEventListener('click', () => closeEditSongModal());
        if (dom.btnCancelEdit) dom.btnCancelEdit.addEventListener('click', () => closeEditSongModal());
        if (dom.formEditSong) {
            dom.formEditSong.addEventListener('submit', (e) => {
                e.preventDefault();
                const songId = dom.editSongId.value;
                const title = dom.editTitle.value.trim();
                const artist = dom.editArtist.value.trim();
                const originalArtist = dom.editOriginalArtist ? dom.editOriginalArtist.value.trim() : '';
                const type = dom.editType.value;
                const publishedAt = dom.editPublishedAt ? dom.editPublishedAt.value.trim() : '';
                const memberData = getSelectedMemberData('m-edit');
                const sStart = parseInt(dom.editSabiStart.value, 10);
                const sEnd = parseInt(dom.editSabiEnd.value, 10);

                if (!songId || !title) return;

                const overrideData = {
                    title: title,
                    artist: artist,
                    originalArtist: originalArtist,
                    type: type,
                    publishedAt: publishedAt,
                    releaseDate: publishedAt,
                    members: memberData.members,
                    gen: memberData.gen
                };

                if (!isNaN(sStart) && !isNaN(sEnd) && sEnd > sStart) {
                    overrideData.sabi = {
                        start: sStart,
                        end: sEnd,
                        title: '수정된 후렴구'
                    };
                }

                if (window.StorageManager) {
                    window.StorageManager.saveSongOverride(songId, overrideData);
                }

                // 현재 재생 중인 곡이면 즉시 반영
                if (player.currentSong && player.currentSong.id === songId) {
                    Object.assign(player.currentSong, overrideData);
                    updatePlayerUI(player.currentSong, player.isOfflinePlayback);
                }

                showToast(`[${title}] 곡 정보가 성공적으로 수정되었습니다.`);
                closeEditSongModal();
                renderAllViews();
            });
        }

        if (dom.btnResetSongEdit) {
            dom.btnResetSongEdit.addEventListener('click', () => {
                const songId = dom.editSongId.value;
                if (!songId) return;
                if (confirm('이 곡의 수정 내용을 모두 지우고 기본 정보로 되돌리시겠습니까?')) {
                    if (window.StorageManager) {
                        window.StorageManager.resetSongOverride(songId);
                    }
                    showToast('곡 정보가 기본값으로 복원되었습니다.');
                    closeEditSongModal();
                    renderAllViews();
                }
            });
        }

        // 재생/일시정지
        dom.miniPlayBtn.addEventListener('click', () => player.togglePlay());
        dom.miniNextBtn.addEventListener('click', () => player.playNext());
        dom.sheetPlayBtn.addEventListener('click', () => player.togglePlay());
        dom.sheetNextBtn.addEventListener('click', () => player.playNext());
        dom.sheetPrevBtn.addEventListener('click', () => player.playPrev());

        // 시트 다운로드 버튼 클릭
        if (dom.sheetDownloadBtn) {
            dom.sheetDownloadBtn.addEventListener('click', () => {
                if (player.currentSong) {
                    handleDownloadToggle(player.currentSong);
                }
            });
        }

        // 사비 모드 토글 핸들러 (헤더 버튼 및 시트 버튼 동시 연동)
        function handleToggleSabi() {
            const isSabi = player.toggleSabiMode();
            syncSabiUI();
            showToast(isSabi ? '⚡ 사비 메들리 모드 ON' : '사비 메들리 모드 OFF');
        }

        if (dom.sheetSabiBtn) dom.sheetSabiBtn.addEventListener('click', handleToggleSabi);
        if (dom.headerSabiBtn) dom.headerSabiBtn.addEventListener('click', handleToggleSabi);
        if (dom.btnSwitchPc) {
            dom.btnSwitchPc.addEventListener('click', () => {
                localStorage.setItem('stellplay_force_pc', 'true');
                window.location.href = '../index.html?force=pc';
            });
        }

        // 셔플 토글
        dom.sheetShuffleBtn.addEventListener('click', () => {
            const isShuf = player.toggleShuffle();
            dom.sheetShuffleBtn.classList.toggle('active', isShuf);
            showToast(isShuf ? '셔플 재생 ON' : '순차 재생 ON');
        });

        // 시크 슬라이더 안전 제어 (드래그 중 실시간 UI 반응 & 손 뗐을 때 1회만 시크)
        let isDraggingSeekSlider = false;
        let seekResumeTimeout = null;

        const onSeekStart = () => {
            isDraggingSeekSlider = true;
            if (seekResumeTimeout) {
                clearTimeout(seekResumeTimeout);
                seekResumeTimeout = null;
            }
        };

        const onSeekInput = (e) => {
            isDraggingSeekSlider = true;
            const pct = parseFloat(e.target.value) || 0;
            dom.miniProgressFill.style.width = `${pct}%`;
            const dur = player.getDuration ? player.getDuration() : (player.currentSong?.duration || 0);
            if (dur > 0) {
                const targetSec = (pct / 100) * dur;
                dom.sheetCurrentTime.textContent = formatTime(targetSec);
            }
        };

        const onSeekCommit = (e) => {
            const pct = parseFloat(e.target.value) || 0;
            player.seekPercent(pct);
            if (seekResumeTimeout) clearTimeout(seekResumeTimeout);
            seekResumeTimeout = setTimeout(() => {
                isDraggingSeekSlider = false;
            }, 400);
        };

        if (dom.sheetSeekSlider) {
            dom.sheetSeekSlider.addEventListener('pointerdown', onSeekStart);
            dom.sheetSeekSlider.addEventListener('touchstart', onSeekStart, { passive: true });
            dom.sheetSeekSlider.addEventListener('mousedown', onSeekStart);

            dom.sheetSeekSlider.addEventListener('input', onSeekInput);

            dom.sheetSeekSlider.addEventListener('change', onSeekCommit);
            dom.sheetSeekSlider.addEventListener('pointerup', onSeekCommit);
            dom.sheetSeekSlider.addEventListener('touchend', onSeekCommit);
            dom.sheetSeekSlider.addEventListener('mouseup', onSeekCommit);
        }

        // 사비 전곡 재생 버튼 (사비 뷰 존재 시)
        if (dom.btnPlaySabiAll) {
            dom.btnPlaySabiAll.addEventListener('click', () => {
                const songs = (window.getAllSongs ? window.getAllSongs() : []).filter(s => s.sabi);
                if (songs.length > 0) {
                    player.setSabiMode(true);
                    syncSabiUI();
                    player.setQueue(songs, 0, true);
                    showToast(`사비 메들리 (${songs.length}곡) 재생을 시작합니다!`);
                }
            });
        }

        // 오프라인 전곡 재생 버튼
        if (dom.btnOfflinePlayAll) {
            dom.btnOfflinePlayAll.addEventListener('click', async () => {
                showToast('오프라인 보관함이 비어있습니다.');
            });
        }

        // 오프라인 전체 삭제 버튼
        if (dom.btnOfflineClearAll) {
            dom.btnOfflineClearAll.addEventListener('click', async () => {
                showToast('모든 오프라인 음원이 삭제되었습니다.');
            });
        }


        // 네트워크 상태 변화 감지
        window.addEventListener('online', () => {
            updateNetworkStatus();
            showToast('네트워크가 다시 연결되었습니다.');
        });
        window.addEventListener('offline', () => {
            updateNetworkStatus();
            showToast('인터넷 연결이 끊겼습니다. 오프라인 모드로 동작합니다.');
        });

        // 플레이어 커스텀 이벤트
        window.addEventListener('mobileplayer:trackChanged', (e) => {
            isDraggingSeekSlider = false;
            if (seekResumeTimeout) {
                clearTimeout(seekResumeTimeout);
                seekResumeTimeout = null;
            }
            const song = e.detail.song;
            const startSec = (player.sabiMode && song && song.sabi && typeof song.sabi.start === 'number')
                ? song.sabi.start
                : 0;
            const dur = (song && song.duration) || 0;
            const pct = dur > 0 ? (startSec / dur) * 100 : 0;

            if (dom.sheetSeekSlider) dom.sheetSeekSlider.value = pct;
            if (dom.miniProgressFill) dom.miniProgressFill.style.width = `${pct}%`;
            if (dom.sheetCurrentTime) dom.sheetCurrentTime.textContent = formatTime(startSec);
            if (dom.sheetTotalDuration && dur > 0) {
                dom.sheetTotalDuration.textContent = formatTime(dur);
            }
            updatePlayerUI(song, e.detail.isOffline);
            if (state.activePlaylistDetailId === 'pl-history') {
                openPlaylistDetail('pl-history');
            } else if (dom.playlistsListContainer && dom.playlistsListContainer.style.display !== 'none') {
                renderPlaylists();
            }
        });

        window.addEventListener('stellplay:historyUpdated', () => {
            if (state.activePlaylistDetailId === 'pl-history') {
                openPlaylistDetail('pl-history');
            } else if (dom.playlistsListContainer && dom.playlistsListContainer.style.display !== 'none') {
                renderPlaylists();
            }
        });

        window.addEventListener('stellplay:playlistsUpdated', () => {
            if (state.activePlaylistDetailId) {
                openPlaylistDetail(state.activePlaylistDetailId);
            } else if (dom.playlistsListContainer && dom.playlistsListContainer.style.display !== 'none') {
                renderPlaylists();
            }
        });

        window.addEventListener('mobileplayer:stateChanged', (e) => {
            updatePlayButtonUI(e.detail.isPlaying);
            if (sabiEditorState.isPreviewing) {
                setSabiPreviewButtonState(e.detail.isPlaying);
            }
        });

        window.addEventListener('mobileplayer:timeUpdate', (e) => {
            const { currentTime, duration, progress } = e.detail;
            if (!isDraggingSeekSlider) {
                dom.miniProgressFill.style.width = `${progress}%`;
                dom.sheetSeekSlider.value = progress;
                dom.sheetCurrentTime.textContent = formatTime(currentTime);
            }
            dom.sheetTotalDuration.textContent = formatTime(duration);

            // 사비 에디터 실시간 미리듣기 루프 & 플레이헤드
            if (sabiEditorState.isPreviewing && sabiEditorState.song) {
                if (dom.sabiPlayhead && sabiEditorState.duration > 0) {
                    dom.sabiPlayhead.style.display = 'block';
                    const curPct = Math.min(100, Math.max(0, (currentTime / sabiEditorState.duration) * 100));
                    dom.sabiPlayhead.style.left = `${curPct}%`;
                }
                if (currentTime >= sabiEditorState.endSec || currentTime < sabiEditorState.startSec - 1) {
                    player.seek(sabiEditorState.startSec);
                }
            }
        });

        window.addEventListener('mobileplayer:queueUpdated', () => {
            renderMobileQueue();
        });

        window.addEventListener('mobileplayer:error', (e) => {
            showToast(e.detail.message);
        });
    }

    // ===================================================================
    // 12. 유틸리티 함수 (시간 포맷, 토스트)
    // ===================================================================
    function formatTime(sec) {
        if (!sec || isNaN(sec) || sec < 0) return '00:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function showToast(msg) {
        const t = document.createElement('div');
        t.className = 'toast';
        t.textContent = msg;
        dom.toastContainer.appendChild(t);
        setTimeout(() => {
            t.style.opacity = '0';
            t.style.transform = 'translateY(-10px)';
            setTimeout(() => t.remove(), 300);
        }, 2800);
    }

    // ===================================================================
    // 13. 안드로이드 하드웨어 뒤로가기 버튼 처리 (onBackPressed)
    // ===================================================================
    let lastBackPressTime = 0;

    window.handleAndroidBack = function() {
        // 1. 모달이 열려있는 경우
        if (dom.modalSelectPlaylist && dom.modalSelectPlaylist.classList.contains('open')) {
            closeAddToPlaylistModal();
            return true;
        }
        if (dom.modalCreatePlaylist && dom.modalCreatePlaylist.classList.contains('open')) {
            closeCreatePlaylistModal();
            return true;
        }
        if (dom.modalAddSong && dom.modalAddSong.classList.contains('open')) {
            closeAddSongModal();
            return true;
        }
        if (dom.modalEditSong && dom.modalEditSong.classList.contains('open')) {
            closeEditSongModal();
            return true;
        }

        // 2. 트랙 액션 바텀시트가 열려있는 경우 -> 시트 닫기
        if (dom.sheetTrackActions && dom.sheetTrackActions.classList.contains('open')) {
            closeTrackActions();
            return true;
        }

        // 3. 복수 선택 모드 활성화 상태인 경우 -> 선택 모드 해제
        if (state.isMultiSelectHome) {
            toggleHomeMultiSelect(false);
            return true;
        }
        if (state.isOfflineSelectMode) {
            toggleOfflineSelectMode(false);
            return true;
        }

        // 4. 재생목록 상세 화면이 열려있는 경우 -> 재생목록 목록으로 복귀
        if (state.activePlaylistDetailId) {
            closePlaylistDetail();
            return true;
        }

        // 5. 재생목록(대기열) 시트가 열려있는 경우 -> 대기열 닫기
        if (dom.queueSheet && dom.queueSheet.classList.contains('open')) {
            closeQueueSheet();
            return true;
        }

        // 6. 전체화면 재생 시트가 열려있는 경우 -> 시트 닫고 메인으로 복귀
        if (dom.fullscreenSheet && dom.fullscreenSheet.classList.contains('open')) {
            dom.fullscreenSheet.classList.remove('open');
            dockYouTubePlayer(false);
            return true;
        }

        // 7. 홈 탭이 아닌 하위 탭(사비, 오프라인, 재생목록, 설정)에 있는 경우 -> 홈 탭으로 복귀
        if (state.activeView !== 'view-home') {
            const homeBtn = Array.from(dom.tabBtns).find(b => b.dataset.view === 'view-home');
            if (homeBtn) {
                homeBtn.click();
                return true;
            }
        }

        // 8. 메인 홈 화면에 있는 경우 -> 2초 내 2회 누르면 앱 종료, 1회 누르면 안내 토스트
        const now = Date.now();
        if (now - lastBackPressTime < 2000) {
            if (window.AndroidBridge && typeof window.AndroidBridge.exitApp === 'function') {
                window.AndroidBridge.exitApp();
            }
            return false;
        } else {
            lastBackPressTime = now;
            showToast("'뒤로' 버튼을 한 번 더 누르면 종료됩니다.");
            return true;
        }
    };

    // 시작
    init();
});

