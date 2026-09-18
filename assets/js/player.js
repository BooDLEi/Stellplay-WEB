/**
 * StellPlay - 오디오 플레이어 제어 엔진
 * 1) ⚡ 무광고(Zero-Ad) 순수 고음질 오디오 엔진 (기본: HTML5 Audio + yt-dlp 백엔드)
 * 2) 🎬 YouTube IFrame MV 뷰어 엔진 (하이브리드 백업 및 영상 감상용)
 * 사비(후렴구) 메들리 모드, 실시간 사비 핀/튜너, 노래방송 세트리스트, PC 단축키, 가사 싱크 지원
 */

class MusicPlayer {
    constructor() {
        this.queue = [];
        this.originalQueue = [];
        this.currentIndex = -1;
        this.currentSong = null;
        this.isPlaying = false;
        this.isMuted = false;
        this.volume = 50;
        this.repeatMode = 'all'; // 'off', 'all', 'one'
        this.isShuffle = false;
        this.sabiMode = false; // 사비(후렴구) 메들리 모드
        this.sabiDuration = 35; // 사비 감상 기본 길이 (초)
        this.isTransitioningSabi = false; // 사비 전환 중 플래그 (조기 스킵 방지)
        this.engineMode = 'audio'; // 'audio' (무광고 오디오) | 'video' (유튜브 MV 영상)

        this.updateInterval = null;
        this.lyricsParsed = [];

        // 로컬 설정 복원
        const settings = window.StorageManager ? window.StorageManager.getSettings() : {};
        this.volume = settings.volume ?? 50;
        this.repeatMode = settings.repeatMode ?? 'all';
        this.isShuffle = settings.isShuffle ?? false;
        this.sabiMode = settings.sabiMode ?? false;
        this.isWeb = (window.location.port !== '8888');
        this.engineMode = settings.engineMode ?? 'audio';
        this.sabiDuration = settings.sabiDuration ?? 35;
        this.crossfade = settings.crossfade ?? 0;
        this.isCrossfading = false;

        // 듀얼 덱(Dual-Deck) 엔진 상태 (Deck A & Deck B)
        this.deckA = null;
        this.deckB = null;
        this.isDeckAReady = false;
        this.isDeckBReady = false;
        this.activeDeckId = 'A'; // 'A' | 'B'

        // 1. 네이티브 오디오 엘리먼트 초기화 (Zero-Ad 모드 - 데스크톱 백엔드 전용)
        this.audioElement = new Audio();
        this.audioElement.preload = 'auto';
        this.audioElement.volume = this.volume / 100;
        this.setupAudioElement();

        // 2. YouTube IFrame API 초기화 (듀얼 덱 크로스페이드 및 MV 뷰어)
        this.initYouTubeAPI();

        // 3. PC 전용 키보드 단축키 등록
        this.initKeyboardShortcuts();

        // 4. 제로 광고 스마트 쉴드 (Zero-Ad Smart Shield) 초기화
        this.isAdShieldActive = false;
        this.initAdShield();
    }

    // 덱 접근자 (Active Deck & Standby Deck)
    get activeDeck() {
        return this.activeDeckId === 'A' ? this.deckA : this.deckB;
    }

    get standbyDeck() {
        return this.activeDeckId === 'A' ? this.deckB : this.deckA;
    }

    get ytPlayer() {
        return this.activeDeck;
    }

    set ytPlayer(val) {
        if (this.activeDeckId === 'A') this.deckA = val;
        else this.deckB = val;
    }

    get isYtReady() {
        return this.activeDeckId === 'A' ? this.isDeckAReady : this.isDeckBReady;
    }

    set isYtReady(val) {
        if (this.activeDeckId === 'A') this.isDeckAReady = !!val;
        else this.isDeckBReady = !!val;
    }

    get isUsingAudioElement() {
        return !this.isWeb && this.engineMode === 'audio';
    }

    setupAudioElement() {
        if (this.isWeb) return;
        this.audioElement.addEventListener('play', () => {
            this.isPlaying = true;
            this.startTimeUpdater();
            window.dispatchEvent(new CustomEvent('stellplay:playStateChanged', { detail: { isPlaying: true } }));
        });

        this.audioElement.addEventListener('pause', () => {
            this.isPlaying = false;
            this.stopTimeUpdater();
            window.dispatchEvent(new CustomEvent('stellplay:playStateChanged', { detail: { isPlaying: false } }));
        });

        this.audioElement.addEventListener('ended', () => {
            this.handleTrackEnded();
        });

        this.audioElement.addEventListener('error', (e) => {
            if (!this.audioElement.src || this.audioElement.src.endsWith('/api/audio?id=')) return;
            console.warn('[Zero-Ad Audio Engine] Stream notice, fallback to YouTube video engine...', e);
            if (this.engineMode === 'audio' && this.currentSong) {
                this.switchToVideoEngine(this.currentSong, true);
            }
        });
    }

    getNextTrackIndex() {
        if (this.queue.length === 0) return 0;
        if (this.repeatMode === 'one') return this.currentIndex;
        let nextIndex = this.currentIndex + 1;
        if (nextIndex >= this.queue.length) {
            nextIndex = (this.repeatMode === 'all') ? 0 : this.currentIndex;
        }
        return nextIndex;
    }

    initYouTubeAPI() {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            const getPlayerVars = () => {
                const pVars = {
                    autoplay: 0,
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                    rel: 0,
                    playsinline: 1,
                    enablejsapi: 1,
                    iv_load_policy: 3
                };
                if (window.location.origin && window.location.origin.startsWith('http')) {
                    pVars.origin = window.location.origin;
                    pVars.widget_referrer = window.location.href;
                }
                return pVars;
            };

            const embedA = document.getElementById('youtube-player-deck-a');
            const embedB = document.getElementById('youtube-player-deck-b');
            const embedLegacy = document.getElementById('youtube-player-embed');

            if (embedA) {
                this.deckA = new YT.Player('youtube-player-deck-a', {
                    height: '100%',
                    width: '100%',
                    playerVars: getPlayerVars(),
                    events: {
                        onReady: (event) => this.onDeckReady('A', event),
                        onStateChange: (event) => this.onDeckStateChange('A', event),
                        onError: (event) => this.onDeckError('A', event)
                    }
                });
            }

            if (embedB) {
                this.deckB = new YT.Player('youtube-player-deck-b', {
                    height: '100%',
                    width: '100%',
                    playerVars: getPlayerVars(),
                    events: {
                        onReady: (event) => this.onDeckReady('B', event),
                        onStateChange: (event) => this.onDeckStateChange('B', event),
                        onError: (event) => this.onDeckError('B', event)
                    }
                });
            } else if (embedLegacy && !embedA) {
                this.deckA = new YT.Player('youtube-player-embed', {
                    height: '100%',
                    width: '100%',
                    playerVars: getPlayerVars(),
                    events: {
                        onReady: (event) => this.onDeckReady('A', event),
                        onStateChange: (event) => this.onDeckStateChange('A', event),
                        onError: (event) => this.onDeckError('A', event)
                    }
                });
            }
        };
    }

    // --- 제로 광고 스마트 쉴드 (Zero-Ad Smart Shield) ---
    initAdShield() {
        window.addEventListener('message', (event) => {
            if (this.isCrossfading) return; // 크로스페이드 중에는 대기 덱 간섭 차단
            const deckEl = document.getElementById(this.activeDeckId === 'A' ? 'youtube-player-deck-a' : 'youtube-player-deck-b');
            const activeWin = deckEl ? (deckEl.contentWindow || deckEl.querySelector('iframe')?.contentWindow) : null;
            // 대기 덱(Standby Deck)이나 외부 창에서 온 메시지는 일체 무시
            if (activeWin && event.source !== activeWin) {
                return;
            }

            const player = this.activeDeck;
            if (!player) return;
            try {
                let data = event.data;
                if (typeof data === 'string') {
                    try { data = JSON.parse(data); } catch (e) { return; }
                }
                if (!data || (data.event !== 'infoDelivery' && !data.info)) return;

                const info = data.info || {};
                const isAdState = info.adState === 1 || info.adState === 2;
                const isAdFlag = info.isAd === true;
                const isAdVideoData = info.videoData && (
                    info.videoData.isAd === true ||
                    (info.videoData.video_id && this.currentSong && info.videoData.video_id !== this.currentSong.youtubeId)
                );

                if (isAdState || isAdFlag || isAdVideoData) {
                    this.handleAdDetected(info.duration || 0);
                } else if (info.adState === 0 || (info.videoData && this.currentSong && info.videoData.video_id === this.currentSong.youtubeId)) {
                    if (this.isAdShieldActive) {
                        this.handleAdFinished();
                    }
                }
            } catch (e) {}
        });
    }

    handleAdDetected(adDuration = 0) {
        if (this.isCrossfading) return; // 크로스페이드 전환 중에는 건너뛰기/배속 조작 방지
        const player = this.activeDeck;
        if (!player) return;

        if (!this.isAdShieldActive) {
            this.isAdShieldActive = true;
            // 1. 광고 음성 즉각 100% 음소거
            if (typeof player.mute === 'function') {
                try { player.mute(); } catch (e) {}
            }
            // 2. 1회 즉시 스킵 시도
            if (typeof player.seekTo === 'function') {
                try {
                    const targetTime = adDuration > 0 ? adDuration + 1 : 9999;
                    player.seekTo(targetTime, true);
                } catch (e) {}
            }
        }

        // 3. 광고 재생 속도 2배속 가속 (빠른 경과)
        if (typeof player.setPlaybackRate === 'function') {
            try { player.setPlaybackRate(2); } catch (e) {}
        }

        window.dispatchEvent(new CustomEvent('stellplay:adShieldState', { detail: { isAd: true } }));
    }

    handleAdFinished() {
        if (!this.isAdShieldActive) return;
        this.isAdShieldActive = false;

        const player = this.activeDeck;
        if (player) {
            try {
                if (!this.isMuted && typeof player.unMute === 'function') {
                    player.unMute();
                    player.setVolume(this.volume);
                }
                if (typeof player.setPlaybackRate === 'function') {
                    player.setPlaybackRate(1);
                }
                // 본곡 재생 위치 복원 (시작 지점 보정)
                if (this.currentSong && this.currentSong.start && typeof player.getCurrentTime === 'function' && typeof player.seekTo === 'function') {
                    const cur = player.getCurrentTime();
                    if (cur < this.currentSong.start) {
                        player.seekTo(this.currentSong.start, true);
                    }
                }
            } catch (e) {}
        }

        window.dispatchEvent(new CustomEvent('stellplay:adShieldState', { detail: { isAd: false } }));
    }

    onDeckReady(deckId, event) {
        if (deckId === 'A') this.isDeckAReady = true;
        if (deckId === 'B') this.isDeckBReady = true;

        if (event && event.target && typeof event.target.setVolume === 'function') {
            event.target.setVolume(this.volume);
        }

        if (deckId === this.activeDeckId) {
            window.dispatchEvent(new CustomEvent('stellplay:ready'));

            if (this.pendingVideoPlay) {
                this.activeDeck.loadVideoById({
                    videoId: this.pendingVideoPlay.videoId,
                    startSeconds: this.pendingVideoPlay.startSeconds
                });
                if (this.pendingVideoPlay.autoPlay) {
                    try { this.activeDeck.playVideo(); } catch (e) {}
                }
                this.pendingVideoPlay = null;
            } else if (this.pendingCue) {
                try {
                    this.activeDeck.cueVideoById({
                        videoId: this.pendingCue.videoId,
                        startSeconds: this.pendingCue.startSeconds
                    });
                } catch (e) {
                    try { this.activeDeck.cueVideoById(this.pendingCue.videoId, this.pendingCue.startSeconds); } catch (e2) {}
                }
                this.pendingCue = null;
            }

            if (this.queue.length === 0 && window.getAllSongs) {
                const allSongs = window.getAllSongs();
                this.setQueue(allSongs, 0, false);
            }
        }
    }

    onDeckStateChange(deckId, event) {
        if (!event) return;
        const state = event.data;

        // 크로스페이드 중 대기 덱(Standby Deck) 이벤트 처리
        if (deckId !== this.activeDeckId) {
            return;
        }

        if (state === YT.PlayerState.PLAYING) {
            this.isPlaying = true;
            this.startTimeUpdater();
            window.dispatchEvent(new CustomEvent('stellplay:playStateChanged', { detail: { isPlaying: true } }));
        } else if (state === YT.PlayerState.PAUSED) {
            if (!this.isCrossfading) {
                this.isPlaying = false;
                this.stopTimeUpdater();
                window.dispatchEvent(new CustomEvent('stellplay:playStateChanged', { detail: { isPlaying: false } }));
            }
        } else if (state === YT.PlayerState.ENDED) {
            if (!this.isCrossfading) {
                this.handleTrackEnded();
            }
        } else if (state === YT.PlayerState.BUFFERING) {
            window.dispatchEvent(new CustomEvent('stellplay:buffering'));
        }
    }

    onDeckError(deckId, event) {
        if (this.isCrossfading && deckId !== this.activeDeckId) {
            console.warn(`[Crossfade] Standby deck ${deckId} error, aborting crossfade and restoring active deck`);
            this.isCrossfading = false;
            if (this.activeDeck && typeof this.activeDeck.setVolume === 'function') {
                this.activeDeck.setVolume(this.isMuted ? 0 : this.volume);
            }
            return;
        }
        if (deckId !== this.activeDeckId) return;
        console.warn(`[DualDeck] Deck ${deckId} Error code:`, event.data);
        setTimeout(() => {
            if (this.queue.length > 1 && !this.isCrossfading) {
                this.playNext(true);
            }
        }, 1500);
    }

    // --- 재생 엔진 전환 (앨범 아트 모드 <-> 유튜브 MV 영상 모드) ---
    toggleEngineMode() {
        const newMode = this.engineMode === 'audio' ? 'video' : 'audio';
        this.setEngineMode(newMode);
    }

    setEngineMode(mode) {
        if (this.engineMode === mode) return;
        this.engineMode = mode;

        if (window.StorageManager) {
            window.StorageManager.saveSettings({ engineMode: this.engineMode });
        }

        // 데스크톱 Python 서버 환경에서만 로컬 스트림과 유튜브 플레이어 교체
        if (!this.isWeb) {
            const prevCurrentTime = this.getCurrentTime();
            if (this.engineMode === 'audio') {
                if (this.activeDeck && this.isYtReady && typeof this.activeDeck.pauseVideo === 'function') {
                    this.activeDeck.pauseVideo();
                }
                if (this.currentSong) {
                    this.audioElement.src = `/api/audio?id=${this.currentSong.youtubeId}`;
                    this.audioElement.currentTime = prevCurrentTime;
                    if (this.isPlaying) {
                        this.audioElement.play().catch(e => console.debug(e));
                    }
                }
            } else {
                this.audioElement.pause();
                if (this.currentSong && this.activeDeck && this.isYtReady) {
                    this.activeDeck.loadVideoById({
                        videoId: this.currentSong.youtubeId,
                        startSeconds: prevCurrentTime
                    });
                    if (this.isPlaying) {
                        try { this.activeDeck.playVideo(); } catch (e) {}
                    }
                }
            }
        }

        window.dispatchEvent(new CustomEvent('stellplay:engineChanged', {
            detail: { engineMode: this.engineMode }
        }));
    }

    switchToVideoEngine(song, autoPlay = true) {
        if (song) {
            this.currentSong = song;
            if (window.StorageManager && song.id) {
                window.StorageManager.addToHistory(song.id);
            }
        }
        if (this.audioElement) this.audioElement.pause();
        const startSec = this.getInitialStartSeconds(song);

        const activeDeck = this.activeDeck;
        const activeEl = document.getElementById(this.activeDeckId === 'A' ? 'youtube-player-deck-a' : 'youtube-player-deck-b');
        const standbyEl = document.getElementById(this.activeDeckId === 'A' ? 'youtube-player-deck-b' : 'youtube-player-deck-a');

        if (activeEl && standbyEl) {
            activeEl.style.opacity = '1';
            activeEl.style.pointerEvents = 'auto';
            standbyEl.style.opacity = '0';
            standbyEl.style.pointerEvents = 'none';
        }

        if (this.isYtReady && activeDeck && typeof activeDeck.loadVideoById === 'function') {
            try {
                activeDeck.loadVideoById({
                    videoId: song.youtubeId,
                    startSeconds: startSec
                });
                activeDeck.setVolume(this.isMuted ? 0 : this.volume);
                if (!this.isMuted && typeof activeDeck.unMute === 'function') {
                    try { activeDeck.unMute(); } catch (e) {}
                }
                if (autoPlay) {
                    activeDeck.playVideo();
                    this.isPlaying = true;
                } else {
                    activeDeck.pauseVideo();
                    this.isPlaying = false;
                }
            } catch (e) {
                console.error('[switchToVideoEngine] Failed to play video', e);
            }
        } else {
            this.pendingVideoPlay = {
                videoId: song ? song.youtubeId : null,
                startSeconds: startSec,
                autoPlay: autoPlay
            };
        }

        window.dispatchEvent(new CustomEvent('stellplay:engineChanged', {
            detail: { engineMode: this.engineMode }
        }));
    }

    // --- 재생 대기열 설정 ---
    setQueue(songs, startIndex = 0, autoPlay = true) {
        if (!songs || songs.length === 0) return;
        this.originalQueue = [...songs];

        if (this.isShuffle) {
            const currentSelected = songs[startIndex];
            const remaining = songs.filter((_, idx) => idx !== startIndex);
            for (let i = remaining.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
            }
            this.queue = currentSelected ? [currentSelected, ...remaining] : remaining;
            this.currentIndex = 0;
        } else {
            this.queue = [...songs];
            this.currentIndex = Math.max(0, Math.min(startIndex, this.queue.length - 1));
        }

        window.dispatchEvent(new CustomEvent('stellplay:queueUpdated', {
            detail: { queue: this.queue, currentIndex: this.currentIndex }
        }));

        if (autoPlay && this.queue[this.currentIndex]) {
            this.playSong(this.queue[this.currentIndex], this.currentIndex);
        } else if (this.queue[this.currentIndex]) {
            this.loadSongWithoutPlay(this.queue[this.currentIndex]);
        }
    }

    addToQueueNext(song) {
        if (!song) return;
        this.queue.splice(this.currentIndex + 1, 0, song);
        window.dispatchEvent(new CustomEvent('stellplay:queueUpdated', {
            detail: { queue: this.queue, currentIndex: this.currentIndex }
        }));
    }

    addToQueueEnd(song) {
        if (!song) return;
        this.queue.push(song);
        window.dispatchEvent(new CustomEvent('stellplay:queueUpdated', {
            detail: { queue: this.queue, currentIndex: this.currentIndex }
        }));
    }

    removeFromQueue(index) {
        if (index < 0 || index >= this.queue.length) return;

        if (index === this.currentIndex) {
            if (this.queue.length === 1) {
                this.queue = [];
                this.currentIndex = -1;
                this.currentSong = null;
                if (this.engineMode === 'audio') {
                    this.audioElement.pause();
                    this.audioElement.src = '';
                } else if (this.ytPlayer && this.isYtReady && typeof this.ytPlayer.stopVideo === 'function') {
                    this.ytPlayer.stopVideo();
                }
                this.isPlaying = false;
                this.stopTimeUpdater();
                window.dispatchEvent(new CustomEvent('stellplay:playStateChanged', { detail: { isPlaying: false } }));
                window.dispatchEvent(new CustomEvent('stellplay:queueUpdated', {
                    detail: { queue: this.queue, currentIndex: this.currentIndex }
                }));
                return;
            }
            this.queue.splice(index, 1);
            if (this.currentIndex >= this.queue.length) {
                this.currentIndex = 0;
            }
            this.playSong(this.queue[this.currentIndex], this.currentIndex);
        } else {
            if (index < this.currentIndex) {
                this.currentIndex -= 1;
            }
            this.queue.splice(index, 1);
        }

        window.dispatchEvent(new CustomEvent('stellplay:queueUpdated', {
            detail: { queue: this.queue, currentIndex: this.currentIndex }
        }));
    }

    moveQueueItem(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.queue.length || toIndex < 0 || toIndex >= this.queue.length) return;
        if (fromIndex === toIndex) return;

        const currentSong = this.queue[this.currentIndex];
        const item = this.queue.splice(fromIndex, 1)[0];
        this.queue.splice(toIndex, 0, item);

        this.currentIndex = this.queue.findIndex(s => s.id === currentSong?.id);
        if (this.currentIndex === -1) this.currentIndex = 0;

        window.dispatchEvent(new CustomEvent('stellplay:queueUpdated', {
            detail: { queue: this.queue, currentIndex: this.currentIndex }
        }));
    }

    clearQueue() {
        if (this.currentSong) {
            this.queue = [this.currentSong];
            this.currentIndex = 0;
        } else {
            this.queue = [];
            this.currentIndex = -1;
        }
        window.dispatchEvent(new CustomEvent('stellplay:queueUpdated', {
            detail: { queue: this.queue, currentIndex: this.currentIndex }
        }));
    }

    playQueueIndex(index) {
        if (index < 0 || index >= this.queue.length) return;
        this.currentIndex = index;
        this.playSong(this.queue[this.currentIndex], this.currentIndex);
    }

    getInitialStartSeconds(song) {
        // 사용자 맞춤 사비 오버라이드 확인
        const customSabis = window.StorageManager ? window.StorageManager.getCustomSabis() : {};
        const custom = customSabis[song?.id];
        const sabi = custom || song?.sabi;

        if (this.sabiMode && sabi?.start !== undefined) {
            return sabi.start;
        } else if (song?.type === 'stream' && song.streamStart) {
            return song.streamStart;
        }
        return 0;
    }

    loadSongWithoutPlay(song) {
        this.currentSong = song;
        this.applyCustomSabi(this.currentSong);
        this.parseLyrics(song.lyrics);

        if (this.isUsingAudioElement) {
            this.audioElement.src = `/api/audio?id=${song.youtubeId}`;
            const startSec = this.getInitialStartSeconds(song);
            if (startSec > 0) {
                this.audioElement.addEventListener('loadedmetadata', () => {
                    try { this.audioElement.currentTime = startSec; } catch (e) {}
                }, { once: true });
            }
        } else {
            const startSec = this.getInitialStartSeconds(song);
            if (this.isYtReady && this.ytPlayer && typeof this.ytPlayer.cueVideoById === 'function') {
                try {
                    this.ytPlayer.cueVideoById({
                        videoId: song.youtubeId,
                        startSeconds: startSec
                    });
                } catch (e) {
                    try { this.ytPlayer.cueVideoById(song.youtubeId, startSec); } catch (e2) {}
                }
            } else {
                this.pendingCue = {
                    videoId: song.youtubeId,
                    startSeconds: startSec
                };
            }
        }
        window.dispatchEvent(new CustomEvent('stellplay:trackChanged', {
            detail: { song: this.currentSong, index: this.currentIndex, isPlaying: false, engineMode: this.engineMode }
        }));
    }

    applyCustomSabi(song) {
        if (!song) return;
        const customSabis = window.StorageManager ? window.StorageManager.getCustomSabis() : {};
        if (customSabis[song.id]) {
            song.sabi = { ...song.sabi, ...customSabis[song.id] };
        }
    }

    playSong(song, index = null, autoPlay = true) {
        if (!song) return;
        if (index !== null) {
            this.currentIndex = index;
        } else {
            const foundIdx = this.queue.findIndex(s => s.id === song.id);
            if (foundIdx > -1) {
                this.currentIndex = foundIdx;
            } else {
                this.queue.splice(this.currentIndex + 1, 0, song);
                this.currentIndex += 1;
            }
        }

        this.currentSong = song;
        this.isAdShieldActive = false;
        this.isTransitioningSabi = false;
        this.applyCustomSabi(this.currentSong);
        this.parseLyrics(song.lyrics);

        if (window.StorageManager && song && song.id) {
            window.StorageManager.addToHistory(song.id);
        }

        const startSeconds = this.getInitialStartSeconds(song);

        // 1. Zero-Ad 네이티브 오디오 엔진 재생 (로컬 백엔드가 있는 PC 앱 환경만)
        if (this.engineMode === 'audio' && !this.isWeb) {
            if (this.ytPlayer && this.isYtReady && typeof this.ytPlayer.pauseVideo === 'function') {
                this.ytPlayer.pauseVideo();
            }

            const streamUrl = `/api/audio?id=${song.youtubeId}`;
            this.audioElement.src = streamUrl;
            const targetVolume = this.isMuted ? 0 : this.volume / 100;
            if (this.crossfade > 0 && !this.sabiMode) {
                this.audioElement.volume = 0;
                this.fadeInAudio(targetVolume, Math.min(2000, this.crossfade * 1000));
            } else {
                this.audioElement.volume = targetVolume;
            }

            if (startSeconds > 0) {
                const seekStart = () => {
                    try {
                        this.audioElement.currentTime = startSeconds;
                    } catch (e) {}
                };
                if (this.audioElement.readyState >= 1) {
                    seekStart();
                } else {
                    this.audioElement.addEventListener('loadedmetadata', seekStart, { once: true });
                }
            }

            if (autoPlay) {
                this.audioElement.play().then(() => {
                    this.isPlaying = true;
                    this.startTimeUpdater();
                    window.dispatchEvent(new CustomEvent('stellplay:playStateChanged', { detail: { isPlaying: true } }));
                }).catch(e => {
                    if (e.name === 'AbortError') return;
                    console.warn('[Zero-Ad Audio] Retrying or switching to video engine...', e);
                    this.switchToVideoEngine(song, true);
                });
            }
            this.isPlaying = autoPlay;
        }
        // 2. YouTube IFrame MV 비디오 엔진 재생 (웹 정적 호스팅 및 MV 모드)
        else {
            this.switchToVideoEngine(song, autoPlay);
        }

        this.updateMediaSession(song);

        window.dispatchEvent(new CustomEvent('stellplay:trackChanged', {
            detail: { song: this.currentSong, index: this.currentIndex, isPlaying: autoPlay, sabiMode: this.sabiMode, engineMode: this.engineMode }
        }));
    }

    // --- 실시간 사비 핀/튜너 기능 ---
    pinCurrentAsSabi(duration = null) {
        if (!this.currentSong) return null;
        const dur = duration || this.sabiDuration || 35;
        const curTime = Math.max(0, Math.floor(this.getCurrentTime()));
        const newSabi = {
            start: curTime,
            end: Math.floor(curTime + dur),
            title: `내 지정 후렴구 (${curTime}s~${curTime + dur}s)`
        };
        this.currentSong.sabi = newSabi;
        if (window.StorageManager) {
            window.StorageManager.saveCustomSabi(this.currentSong.id, newSabi);
        }
        window.dispatchEvent(new CustomEvent('stellplay:sabiUpdated', {
            detail: { songId: this.currentSong.id, sabi: newSabi }
        }));
        return newSabi;
    }

    setSabiDuration(seconds) {
        this.sabiDuration = Math.max(15, Math.min(90, seconds));
        if (window.StorageManager) {
            window.StorageManager.saveSettings({ sabiDuration: this.sabiDuration });
        }
    }

    updateMediaSession(song) {
        if (!('mediaSession' in navigator) || !song) return;
        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.title,
                artist: song.artist,
                album: song.streamTitle || song.originalArtist || 'Stellive Music',
                artwork: [
                    { src: `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`, sizes: '320x180', type: 'image/jpeg' },
                    { src: `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`, sizes: '480x360', type: 'image/jpeg' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => this.togglePlay());
            navigator.mediaSession.setActionHandler('pause', () => this.togglePlay());
            navigator.mediaSession.setActionHandler('previoustrack', () => this.playPrev());
            navigator.mediaSession.setActionHandler('nexttrack', () => this.playNext());
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime !== undefined) this.seekTo(details.seekTime);
            });
        } catch (e) {
            console.debug('MediaSession error', e);
        }
    }

    startRadio(memberId) {
        if (!window.getMemberRadioQueue) return;
        const radioQueue = window.getMemberRadioQueue(memberId);
        if (!radioQueue || radioQueue.length === 0) return;
        this.isRadio = true;
        this.radioMember = memberId;
        this.setQueue(radioQueue, 0, true);
        window.dispatchEvent(new CustomEvent('stellplay:radioStarted', {
            detail: { memberId, queue: radioQueue }
        }));
    }

    togglePlay() {
        if (this.isUsingAudioElement) {
            if (this.audioElement.paused) {
                if (!this.currentSong && this.queue.length > 0) {
                    this.playSong(this.queue[0], 0);
                } else {
                    this.audioElement.play().catch(e => console.warn(e));
                }
            } else {
                this.audioElement.pause();
            }
        } else {
            if (!this.isYtReady || !this.activeDeck) {
                const songToPlay = this.currentSong || (this.queue.length > 0 ? this.queue[0] : null);
                if (songToPlay) {
                    this.pendingVideoPlay = {
                        videoId: songToPlay.youtubeId,
                        startSeconds: this.getInitialStartSeconds(songToPlay),
                        autoPlay: true
                    };
                }
                return;
            }
            if (this.isPlaying) {
                this.activeDeck.pauseVideo();
            } else {
                let state = -1;
                try { state = this.activeDeck.getPlayerState(); } catch (e) {}
                if (state === 2) {
                    if (typeof this.activeDeck.unMute === 'function' && !this.isMuted) {
                        try { this.activeDeck.unMute(); } catch (e) {}
                    }
                    this.activeDeck.playVideo();
                } else {
                    const songToPlay = this.currentSong || (this.queue.length > 0 ? this.queue[0] : null);
                    if (songToPlay) {
                        const idx = this.currentIndex >= 0 ? this.currentIndex : 0;
                        this.playSong(songToPlay, idx, true);
                    } else {
                        this.activeDeck.playVideo();
                    }
                }
            }
        }
    }

    playNext(isAuto = false) {
        if (this.queue.length === 0) return;

        if (isAuto && this.repeatMode === 'one') {
            const startSec = this.getInitialStartSeconds(this.currentSong);
            this.seekTo(startSec);
            if (this.isUsingAudioElement) {
                this.audioElement.play().catch(e => console.debug(e));
            } else if (this.activeDeck) {
                this.activeDeck.playVideo();
            }
            return;
        }

        let nextIndex = this.currentIndex + 1;
        if (nextIndex >= this.queue.length) {
            if (this.repeatMode === 'off' && isAuto) {
                this.isPlaying = false;
                this.stopTimeUpdater();
                window.dispatchEvent(new CustomEvent('stellplay:playStateChanged', { detail: { isPlaying: false } }));
                return;
            }
            nextIndex = 0;
        }

        this.currentIndex = nextIndex;
        this.playSong(this.queue[this.currentIndex], this.currentIndex);
    }

    playPrev() {
        if (this.queue.length === 0) return;

        const currentTime = this.getCurrentTime();
        const baseStart = this.getInitialStartSeconds(this.currentSong);

        if (currentTime - baseStart > 3) {
            this.seekTo(baseStart);
            return;
        }

        let prevIndex = this.currentIndex - 1;
        if (prevIndex < 0) {
            prevIndex = this.queue.length - 1;
        }
        this.currentIndex = prevIndex;
        this.playSong(this.queue[this.currentIndex], this.currentIndex);
    }

    seekTo(seconds) {
        seconds = Math.max(0, seconds);
        if (this.isUsingAudioElement) {
            try {
                this.audioElement.currentTime = seconds;
            } catch (e) {
                console.error(e);
            }
        } else if (this.isYtReady && this.activeDeck && typeof this.activeDeck.seekTo === 'function') {
            try {
                this.activeDeck.seekTo(seconds, true);
            } catch (e) {
                console.error(e);
            }
        }
    }

    seekRelative(offsetSeconds) {
        const current = this.getCurrentTime();
        const duration = this.getDuration();
        const target = Math.max(0, Math.min(duration, current + offsetSeconds));
        this.seekTo(target);
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(100, vol));
        if (this.isUsingAudioElement) {
            this.audioElement.volume = this.isMuted ? 0 : this.volume / 100;
        }
        if (this.isYtReady && this.activeDeck && typeof this.activeDeck.setVolume === 'function') {
            this.activeDeck.setVolume(this.volume);
        }
        if (this.volume > 0 && this.isMuted) {
            this.toggleMute(false);
        }
        if (window.StorageManager) {
            window.StorageManager.saveSettings({ volume: this.volume });
        }
        window.dispatchEvent(new CustomEvent('stellplay:volumeChanged', {
            detail: { volume: this.volume, isMuted: this.isMuted }
        }));
    }

    toggleMute(forceState = null) {
        this.isMuted = forceState !== null ? forceState : !this.isMuted;
        if (this.isUsingAudioElement) {
            this.audioElement.muted = this.isMuted;
            this.audioElement.volume = this.isMuted ? 0 : this.volume / 100;
        }
        if (this.isYtReady && this.activeDeck) {
            if (this.isMuted) {
                if (typeof this.activeDeck.mute === 'function') this.activeDeck.mute();
            } else {
                if (typeof this.activeDeck.unMute === 'function') this.activeDeck.unMute();
            }
        }
        window.dispatchEvent(new CustomEvent('stellplay:volumeChanged', {
            detail: { volume: this.volume, isMuted: this.isMuted }
        }));
    }

    toggleRepeat() {
        const modes = ['all', 'one', 'off'];
        const currentIdx = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIdx + 1) % modes.length];

        if (window.StorageManager) {
            window.StorageManager.saveSettings({ repeatMode: this.repeatMode });
        }
        window.dispatchEvent(new CustomEvent('stellplay:repeatChanged', {
            detail: { repeatMode: this.repeatMode }
        }));
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;

        if (this.isShuffle) {
            const currentSong = this.queue[this.currentIndex];
            const remaining = this.originalQueue.filter(s => s.id !== currentSong?.id);
            for (let i = remaining.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
            }
            this.queue = currentSong ? [currentSong, ...remaining] : remaining;
            this.currentIndex = 0;
        } else {
            const currentSong = this.queue[this.currentIndex];
            this.queue = [...this.originalQueue];
            this.currentIndex = this.queue.findIndex(s => s.id === currentSong?.id);
            if (this.currentIndex === -1) this.currentIndex = 0;
        }

        if (window.StorageManager) {
            window.StorageManager.saveSettings({ isShuffle: this.isShuffle });
        }
        window.dispatchEvent(new CustomEvent('stellplay:shuffleChanged', {
            detail: { isShuffle: this.isShuffle, queue: this.queue, currentIndex: this.currentIndex }
        }));
    }

    toggleSabiMode() {
        this.sabiMode = !this.sabiMode;

        if (this.sabiMode && this.currentSong) {
            const customSabis = window.StorageManager ? window.StorageManager.getCustomSabis() : {};
            const sabi = customSabis[this.currentSong.id] || this.currentSong.sabi;
            const sabiStart = sabi?.start !== undefined ? sabi.start : 0;
            const sabiEnd = sabi?.end || (sabiStart + (this.sabiDuration || 35));
            const curTime = this.getCurrentTime();

            // 현재 재생 시간이 사비 구간 밖인 경우에만 사비 시작 지점으로 이동
            if (curTime < sabiStart || curTime >= sabiEnd) {
                this.isTransitioningSabi = true;
                this.seekTo(sabiStart);
                setTimeout(() => {
                    this.isTransitioningSabi = false;
                }, 1200);
            }
        }

        if (window.StorageManager) {
            window.StorageManager.saveSettings({ sabiMode: this.sabiMode });
        }
        window.dispatchEvent(new CustomEvent('stellplay:sabiModeChanged', {
            detail: { sabiMode: this.sabiMode }
        }));
    }

    // --- 타이머 & 사비/우타와꾸 자동 전환 감시 ---
    startTimeUpdater() {
        this.stopTimeUpdater();
        this.updateInterval = setInterval(() => {
            if (!this.isPlaying) return;

            // [Zero-Ad Smart Shield] 실시간 광고 상태 체크 (postMessage 누락 대비 폴백)
            if (this.engineMode === 'video' && this.ytPlayer && this.currentSong) {
                try {
                    const vData = typeof this.ytPlayer.getVideoData === 'function' ? this.ytPlayer.getVideoData() : null;
                    const curDur = typeof this.ytPlayer.getDuration === 'function' ? this.ytPlayer.getDuration() : 0;
                    const isAdByData = vData && (
                        vData.isAd === true ||
                        (vData.video_id && vData.video_id !== this.currentSong.youtubeId)
                    );
                    const isAdByDur = (curDur > 0 && curDur <= 35 && this.currentSong.duration > 60);

                    if (isAdByData || isAdByDur) {
                        this.handleAdDetected(curDur);
                        return; // 광고 처리 중에는 일반 타이머 로직 일시 중단
                    } else if (this.isAdShieldActive && vData && vData.video_id === this.currentSong.youtubeId) {
                        this.handleAdFinished();
                    }
                } catch (e) {}
            }

            const currentTime = this.getCurrentTime();
            const duration = this.getDuration();

            // 0. 크로스페이드 감시 (사비 모드 및 스트림 모드가 아닐 때)
            if (this.crossfade > 0 && !this.sabiMode && (!this.currentSong?.type || this.currentSong.type !== 'stream') && !this.isCrossfading && duration > 10) {
                const timeLeft = duration - currentTime;
                if (timeLeft > 0 && timeLeft <= this.crossfade) {
                    this.triggerCrossfade();
                    return;
                }
            }

            // 1. 사비 메들리 모드 감시 (전환 중일 때는 스킵 방지)
            if (this.sabiMode && this.currentSong?.sabi && !this.isTransitioningSabi) {
                const customSabis = window.StorageManager ? window.StorageManager.getCustomSabis() : {};
                const sabi = customSabis[this.currentSong.id] || this.currentSong.sabi;
                const sabiEnd = sabi.end || (sabi.start + (this.sabiDuration || 35));
                if (currentTime >= sabiEnd) {
                    this.playNext(true);
                    return;
                }
            }
            // 2. 노래방송(우타와꾸) 세트리스트 감시
            else if (this.currentSong?.type === 'stream' && this.currentSong.streamEnd) {
                if (currentTime >= this.currentSong.streamEnd) {
                    this.playNext(true);
                    return;
                }
            }

            const activeLyricIndex = this.findActiveLyricIndex(currentTime);

            let progress = 0;
            let displayCurrentTime = currentTime;
            if (this.currentSong?.type === 'stream' && this.currentSong.streamStart && this.currentSong.streamEnd) {
                const trackLen = this.currentSong.streamEnd - this.currentSong.streamStart;
                displayCurrentTime = Math.max(0, currentTime - this.currentSong.streamStart);
                progress = trackLen > 0 ? (displayCurrentTime / trackLen) * 100 : 0;
            } else {
                progress = duration > 0 ? (currentTime / duration) * 100 : 0;
            }

            const customSabis = window.StorageManager ? window.StorageManager.getCustomSabis() : {};
            const activeSabi = customSabis[this.currentSong?.id] || this.currentSong?.sabi;

            window.dispatchEvent(new CustomEvent('stellplay:timeUpdate', {
                detail: {
                    currentTime: displayCurrentTime,
                    duration: this.currentSong?.duration || duration,
                    progress: Math.min(100, Math.max(0, progress)),
                    activeLyricIndex: activeLyricIndex,
                    sabiRemaining: this.sabiMode && activeSabi
                        ? Math.max(0, Math.ceil(activeSabi.end - currentTime))
                        : null
                }
            }));
        }, 250);
    }

    setCrossfade(seconds) {
        this.crossfade = Math.max(0, Math.min(12, parseInt(seconds, 10) || 0));
        if (window.StorageManager) {
            window.StorageManager.saveSettings({ crossfade: this.crossfade });
        }
        window.dispatchEvent(new CustomEvent('stellplay:settingsUpdated', { detail: { crossfade: this.crossfade } }));
    }

    fadeInAudio(targetVol, durationMs = 1500) {
        if (targetVol <= 0) return;
        const steps = 15;
        const stepTime = Math.max(30, Math.floor(durationMs / steps));
        let step = 0;
        const timer = setInterval(() => {
            step++;
            if (step >= steps) {
                clearInterval(timer);
                if (this.isUsingAudioElement) this.audioElement.volume = targetVol;
            } else {
                if (this.isUsingAudioElement) this.audioElement.volume = targetVol * (step / steps);
            }
        }, stepTime);
    }

    // --- 진짜 듀얼 덱(Deck A & Deck B) 동시 크로스페이드 ---
    triggerCrossfade() {
        if (this.isCrossfading || this.queue.length <= 1) return;
        if (!this.deckA || !this.deckB || !this.isDeckAReady || !this.isDeckBReady) {
            return;
        }

        const nextIndex = this.getNextTrackIndex();
        if (nextIndex === this.currentIndex && this.repeatMode !== 'one') return;
        const nextSong = this.queue[nextIndex];
        if (!nextSong) return;

        this.isCrossfading = true;
        const fadeSec = Math.max(2, Math.min(12, this.crossfade || 5));
        const targetVol = this.isMuted ? 0 : this.volume;

        const activeDeck = this.activeDeck;
        const standbyDeck = this.standbyDeck;
        const activeEl = document.getElementById(this.activeDeckId === 'A' ? 'youtube-player-deck-a' : 'youtube-player-deck-b');
        const standbyEl = document.getElementById(this.activeDeckId === 'A' ? 'youtube-player-deck-b' : 'youtube-player-deck-a');

        const nextStart = (this.sabiMode && nextSong.sabi) ? (nextSong.sabi.start || 0) : 0;
        try {
            standbyDeck.setVolume(0);
            if (typeof standbyDeck.unMute === 'function' && !this.isMuted) {
                try { standbyDeck.unMute(); } catch (e) {}
            }
            standbyDeck.loadVideoById({
                videoId: nextSong.youtubeId,
                startSeconds: nextStart
            });
            standbyDeck.playVideo();
        } catch (e) {
            console.warn('[Crossfade] 대기 덱 재생 시작 실패, 크로스페이드 중단', e);
            this.isCrossfading = false;
            return;
        }

        const startTime = Date.now();
        const durationMs = fadeSec * 1000;

        const crossfadeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / durationMs);

            const activeVol = Math.round(targetVol * (1 - progress));
            const standbyVol = Math.round(targetVol * progress);

            try {
                activeDeck.setVolume(activeVol);
                standbyDeck.setVolume(standbyVol);
            } catch (e) {}

            if (activeEl && standbyEl) {
                activeEl.style.opacity = (1 - progress);
                standbyEl.style.opacity = progress;
            }

            if (progress >= 1) {
                clearInterval(crossfadeInterval);

                try {
                    activeDeck.pauseVideo();
                    activeDeck.setVolume(0);
                    standbyDeck.setVolume(targetVol);
                } catch (e) {}

                if (activeEl && standbyEl) {
                    activeEl.style.opacity = '0';
                    activeEl.style.pointerEvents = 'none';
                    standbyEl.style.opacity = '1';
                    standbyEl.style.pointerEvents = 'auto';
                }

                // 활성 덱 전환
                this.activeDeckId = this.activeDeckId === 'A' ? 'B' : 'A';
                this.currentIndex = nextIndex;
                this.currentSong = nextSong;

                this.applyCustomSabi(this.currentSong);
                this.parseLyrics(this.currentSong.lyrics);
                this.updateMediaSession(this.currentSong);

                if (window.StorageManager && this.currentSong.id) {
                    window.StorageManager.addToHistory(this.currentSong.id);
                }

                window.dispatchEvent(new CustomEvent('stellplay:trackChanged', {
                    detail: {
                        song: this.currentSong,
                        index: this.currentIndex,
                        isPlaying: true,
                        sabiMode: this.sabiMode,
                        engineMode: this.engineMode
                    }
                }));

                this.isCrossfading = false;
            }
        }, 80);
    }

    stopTimeUpdater() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    handleTrackEnded() {
        this.playNext(true);
    }

    getCurrentTime() {
        if (this.isUsingAudioElement) {
            return this.audioElement.currentTime || 0;
        } else if (this.isYtReady && this.activeDeck && typeof this.activeDeck.getCurrentTime === 'function') {
            try {
                return this.activeDeck.getCurrentTime() || 0;
            } catch (e) {
                return 0;
            }
        }
        return 0;
    }

    getDuration() {
        if (this.isUsingAudioElement) {
            const d = this.audioElement.duration;
            if (d && !isNaN(d) && d > 0) return d;
        } else if (this.isYtReady && this.activeDeck && typeof this.activeDeck.getDuration === 'function') {
            try {
                const d = this.activeDeck.getDuration();
                if (d && d > 0) return d;
            } catch (e) { }
        }
        return this.currentSong?.duration || 0;
    }

    // --- 가사 파싱 및 싱크 연산 ---
    parseLyrics(rawLyrics) {
        if (!rawLyrics) {
            this.lyricsParsed = [];
            return;
        }
        const lines = rawLyrics.split('\n');
        const parsed = [];
        const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

        lines.forEach(line => {
            const matches = [...line.matchAll(timeRegex)];
            const text = line.replace(timeRegex, '').trim();
            if (matches.length > 0 && text) {
                matches.forEach(m => {
                    const min = parseInt(m[1], 10);
                    const sec = parseInt(m[2], 10);
                    const ms = m[3] ? parseInt(m[3].padEnd(3, '0'), 10) / 1000 : 0;
                    parsed.push({ time: min * 60 + sec + ms, text: text });
                });
            } else if (text) {
                parsed.push({ time: -1, text: text });
            }
        });

        parsed.sort((a, b) => a.time - b.time);
        this.lyricsParsed = parsed;
    }

    findActiveLyricIndex(currentTime) {
        if (!this.lyricsParsed || this.lyricsParsed.length === 0) return -1;
        let activeIdx = -1;
        for (let i = 0; i < this.lyricsParsed.length; i++) {
            if (this.lyricsParsed[i].time <= currentTime && this.lyricsParsed[i].time >= 0) {
                activeIdx = i;
            } else if (this.lyricsParsed[i].time > currentTime) {
                break;
            }
        }
        return activeIdx;
    }

    // --- PC 전용 키보드 단축키 핸들러 ---
    initKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
            if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.playPrev();
                    } else {
                        this.seekRelative(-5);
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.playNext();
                    } else {
                        this.seekRelative(5);
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.setVolume(this.volume + 5);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.setVolume(this.volume - 5);
                    break;
                case 'KeyM':
                    e.preventDefault();
                    this.toggleMute();
                    break;
                case 'KeyS':
                    e.preventDefault();
                    this.toggleSabiMode();
                    break;
                case 'KeyP':
                    e.preventDefault();
                    this.pinCurrentAsSabi();
                    break;
            }
        });
    }
}

window.MusicPlayer = MusicPlayer;
