/**
 * StellPlay - 오디오 플레이어 제어 엔진
 * 1) ⚡ 무광고(Zero-Ad) 순수 고음질 오디오 엔진 (기본: HTML5 Audio + yt-dlp 백엔드)
 * 2) 🎬 YouTube IFrame MV 뷰어 엔진 (하이브리드 백업 및 영상 감상용)
 * 사비(후렴구) 메들리 모드, 실시간 사비 핀/튜너, 노래방송 세트리스트, PC 단축키, 가사 싱크 지원
 */

class MusicPlayer {
    constructor() {
        this.ytPlayer = null;
        this.isYtReady = false;
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
        this.isWeb = !window.location.port || window.location.hostname.includes('github.io') || window.location.protocol === 'file:';
        this.engineMode = this.isWeb ? 'video' : (settings.engineMode ?? 'audio');
        this.sabiDuration = settings.sabiDuration ?? 35;
        this.crossfade = settings.crossfade ?? 0;
        this.isCrossfading = false;

        // 듀얼 데크 상태 (무광고 & 실시간 크로스페이드 전용)
        this.activeDeck = 'A';
        this.ytDeckA = null;
        this.ytDeckB = null;
        this.isDeckAReady = false;
        this.isDeckBReady = false;

        // 1. 네이티브 오디오 엘리먼트 초기화 (Zero-Ad 모드)
        this.audioElement = new Audio();
        this.audioElement.preload = 'auto';
        this.audioElement.volume = this.volume / 100;
        this.setupAudioElement();

        // 2. YouTube IFrame API 초기화 (MV 뷰어 및 백업용)
        this.initYouTubeAPI();

        // 3. PC 전용 키보드 단축키 등록
        this.initKeyboardShortcuts();
    }

    setupAudioElement() {
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

    getActiveDeckPlayer() {
        return (this.activeDeck === 'A' ? this.ytDeckA : this.ytDeckB) || this.ytPlayer;
    }

    getInactiveDeckPlayer() {
        return (this.activeDeck === 'A' ? this.ytDeckB : this.ytDeckA);
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
            const playerVars = {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                rel: 0,
                modestbranding: 1,
                playsinline: 1,
                enablejsapi: 1
            };
            if (window.location.origin && window.location.origin.startsWith('http')) {
                playerVars.origin = window.location.origin;
            }

            const createDeck = (elementId, deckName) => {
                const el = document.getElementById(elementId);
                if (!el) return null;
                return new YT.Player(elementId, {
                    host: 'https://www.youtube-nocookie.com',
                    height: '100%',
                    width: '100%',
                    playerVars: playerVars,
                    events: {
                        onReady: (e) => this.onDeckReady(deckName, e),
                        onStateChange: (e) => this.onDeckStateChange(deckName, e),
                        onError: (e) => this.onDeckError(deckName, e)
                    }
                });
            };

            this.ytDeckA = createDeck('youtube-player-deck-a', 'A');
            this.ytDeckB = createDeck('youtube-player-deck-b', 'B');

            if (!this.ytDeckA) {
                this.ytPlayer = new YT.Player('youtube-player-embed', {
                    host: 'https://www.youtube-nocookie.com',
                    height: '100%',
                    width: '100%',
                    playerVars: playerVars,
                    events: {
                        onReady: (event) => this.onPlayerReady(event),
                        onStateChange: (event) => this.onPlayerStateChange(event),
                        onError: (event) => this.onPlayerError(event)
                    }
                });
            }
        };
    }

    onDeckReady(deck, event) {
        if (deck === 'A') this.isDeckAReady = true;
        if (deck === 'B') this.isDeckBReady = true;

        this.isYtReady = this.isDeckAReady;
        this.ytPlayer = this.getActiveDeckPlayer();

        try {
            event.target.setVolume(deck === this.activeDeck ? this.volume : 0);
        } catch (e) {}

        if (deck === 'A') {
            window.dispatchEvent(new CustomEvent('stellplay:ready'));

            if (this.pendingVideoPlay) {
                this.switchToVideoEngine(this.currentSong, this.pendingVideoPlay.autoPlay);
                this.pendingVideoPlay = null;
            }

            if (this.queue.length === 0 && window.getAllSongs) {
                const allSongs = window.getAllSongs();
                this.setQueue(allSongs, 0, false);
            }
        }
    }

    onDeckStateChange(deck, event) {
        if (deck !== this.activeDeck && !this.isCrossfading) return;
        if (this.engineMode !== 'video') return;
        const state = event.data;

        if (state === YT.PlayerState.PLAYING) {
            if (deck === this.activeDeck) {
                this.isPlaying = true;
                this.startTimeUpdater();
                window.dispatchEvent(new CustomEvent('stellplay:playStateChanged', { detail: { isPlaying: true } }));
            }
        } else if (state === YT.PlayerState.PAUSED) {
            if (deck === this.activeDeck && !this.isCrossfading) {
                this.isPlaying = false;
                this.stopTimeUpdater();
                window.dispatchEvent(new CustomEvent('stellplay:playStateChanged', { detail: { isPlaying: false } }));
            }
        } else if (state === YT.PlayerState.ENDED) {
            if (deck === this.activeDeck) {
                this.handleTrackEnded();
            }
        } else if (state === YT.PlayerState.BUFFERING) {
            if (deck === this.activeDeck) {
                window.dispatchEvent(new CustomEvent('stellplay:buffering'));
            }
        }
    }

    onDeckError(deck, event) {
        if (deck !== this.activeDeck) return;
        if (this.engineMode !== 'video') return;
        console.warn(`YouTube Player Deck ${deck} Error code:`, event.data);
        setTimeout(() => {
            if (this.queue.length > 1) {
                this.playNext(true);
            }
        }, 1500);
    }

    onPlayerReady(event) {
        this.isYtReady = true;
        this.ytPlayer.setVolume(this.volume);
        window.dispatchEvent(new CustomEvent('stellplay:ready'));

        if (this.pendingVideoPlay) {
            this.ytPlayer.loadVideoById({
                videoId: this.pendingVideoPlay.videoId,
                startSeconds: this.pendingVideoPlay.startSeconds
            });
            if (this.pendingVideoPlay.autoPlay) {
                try { this.ytPlayer.playVideo(); } catch(e) {}
            }
            this.pendingVideoPlay = null;
        }

        if (this.queue.length === 0 && window.getAllSongs) {
            const allSongs = window.getAllSongs();
            this.setQueue(allSongs, 0, false);
        }
    }

    onPlayerStateChange(event) {
        if (!event || this.engineMode !== 'video') return;
        const state = event.data;

        if (state === YT.PlayerState.PLAYING) {
            this.isPlaying = true;
            this.startTimeUpdater();
            window.dispatchEvent(new CustomEvent('stellplay:playStateChanged', { detail: { isPlaying: true } }));
        } else if (state === YT.PlayerState.PAUSED) {
            this.isPlaying = false;
            this.stopTimeUpdater();
            window.dispatchEvent(new CustomEvent('stellplay:playStateChanged', { detail: { isPlaying: false } }));
        } else if (state === YT.PlayerState.ENDED) {
            this.handleTrackEnded();
        } else if (state === YT.PlayerState.BUFFERING) {
            window.dispatchEvent(new CustomEvent('stellplay:buffering'));
        }
    }

    onPlayerError(event) {
        if (this.engineMode !== 'video') return;
        console.warn('YouTube Player Error code:', event.data);
        setTimeout(() => {
            if (this.queue.length > 1) {
                this.playNext(true);
            }
        }, 1500);
    }

    // --- 재생 엔진 전환 (무광고 오디오 <-> 유튜브 MV 영상) ---
    toggleEngineMode() {
        const newMode = this.engineMode === 'audio' ? 'video' : 'audio';
        this.setEngineMode(newMode);
    }

    setEngineMode(mode) {
        if (this.engineMode === mode) return;
        const prevCurrentTime = this.getCurrentTime();
        this.engineMode = mode;

        if (window.StorageManager) {
            window.StorageManager.saveSettings({ engineMode: this.engineMode });
        }

        if (this.engineMode === 'audio') {
            if (this.ytPlayer && this.isYtReady && typeof this.ytPlayer.pauseVideo === 'function') {
                this.ytPlayer.pauseVideo();
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
            if (this.currentSong && this.ytPlayer && this.isYtReady) {
                this.ytPlayer.loadVideoById({
                    videoId: this.currentSong.youtubeId,
                    startSeconds: prevCurrentTime
                });
                if (this.isPlaying) {
                    try { this.ytPlayer.playVideo(); } catch (e) {}
                }
            } else if (this.currentSong) {
                this.pendingVideoPlay = {
                    videoId: this.currentSong.youtubeId,
                    startSeconds: prevCurrentTime,
                    autoPlay: this.isPlaying
                };
            }
        }

        window.dispatchEvent(new CustomEvent('stellplay:engineChanged', {
            detail: { engineMode: this.engineMode }
        }));
    }

    switchToVideoEngine(song, autoPlay = true) {
        this.engineMode = 'video';
        if (song) {
            this.currentSong = song;
            if (window.StorageManager && song.id) {
                window.StorageManager.addToHistory(song.id);
            }
        }
        if (this.audioElement) this.audioElement.pause();
        const startSec = this.getInitialStartSeconds(song);
        const player = this.getActiveDeckPlayer();

        const deckAEl = document.getElementById('youtube-player-deck-a');
        const deckBEl = document.getElementById('youtube-player-deck-b');
        if (deckAEl && deckBEl) {
            deckAEl.style.display = this.activeDeck === 'A' ? 'block' : 'none';
            deckAEl.style.opacity = '1';
            deckBEl.style.display = this.activeDeck === 'B' ? 'block' : 'none';
            deckBEl.style.opacity = '1';
        }

        if (player && this.isYtReady) {
            player.loadVideoById({
                videoId: song.youtubeId,
                startSeconds: startSec
            });
            player.setVolume(this.isMuted ? 0 : this.volume);
            if (autoPlay) {
                try { player.playVideo(); } catch (e) {}
            }
            this.isPlaying = autoPlay;
        } else {
            this.pendingVideoPlay = {
                videoId: song.youtubeId,
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

        if (this.engineMode === 'audio') {
            this.audioElement.src = `/api/audio?id=${song.youtubeId}`;
            const startSec = this.getInitialStartSeconds(song);
            if (startSec > 0) {
                this.audioElement.addEventListener('loadedmetadata', () => {
                    try { this.audioElement.currentTime = startSec; } catch (e) {}
                }, { once: true });
            }
        } else if (this.isYtReady && this.ytPlayer) {
            this.ytPlayer.cueVideoById(song.youtubeId);
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

    playSong(song, index = null) {
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
        this.isTransitioningSabi = false;
        this.applyCustomSabi(this.currentSong);
        this.parseLyrics(song.lyrics);

        if (window.StorageManager && song && song.id) {
            window.StorageManager.addToHistory(song.id);
        }

        const startSeconds = this.getInitialStartSeconds(song);

        // 1. Zero-Ad 네이티브 오디오 엔진 재생 (로컬 백엔드가 있는 PC 앱 환경만)
        if (this.engineMode === 'audio' && !this.isWeb) {
            const player = this.getActiveDeckPlayer();
            if (player && this.isYtReady && typeof player.pauseVideo === 'function') {
                player.pauseVideo();
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
            this.isPlaying = true;
        }
        // 2. YouTube IFrame MV 비디오 엔진 재생 (웹 정적 호스팅 및 MV 모드)
        else {
            this.switchToVideoEngine(song, autoPlay);
        }

        this.updateMediaSession(song);

        window.dispatchEvent(new CustomEvent('stellplay:trackChanged', {
            detail: { song: this.currentSong, index: this.currentIndex, isPlaying: true, sabiMode: this.sabiMode, engineMode: this.engineMode }
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
        if (this.engineMode === 'audio') {
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
            if (!this.isYtReady || !this.ytPlayer) return;
            if (this.isPlaying) {
                this.ytPlayer.pauseVideo();
            } else {
                if (!this.currentSong && this.queue.length > 0) {
                    this.playSong(this.queue[0], 0);
                } else {
                    this.ytPlayer.playVideo();
                }
            }
        }
    }

    playNext(isAuto = false) {
        if (this.queue.length === 0) return;

        if (isAuto && this.repeatMode === 'one') {
            const startSec = this.getInitialStartSeconds(this.currentSong);
            this.seekTo(startSec);
            if (this.engineMode === 'audio') {
                this.audioElement.play().catch(e => console.debug(e));
            } else if (this.ytPlayer) {
                this.ytPlayer.playVideo();
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
        if (this.engineMode === 'audio') {
            try {
                this.audioElement.currentTime = seconds;
            } catch (e) {
                console.error(e);
            }
        } else if (this.isYtReady && this.ytPlayer) {
            try {
                this.ytPlayer.seekTo(seconds, true);
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
        if (this.engineMode === 'audio') {
            this.audioElement.volume = this.isMuted ? 0 : this.volume / 100;
        }
        if (this.isYtReady && this.ytPlayer) {
            this.ytPlayer.setVolume(this.volume);
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
        if (this.engineMode === 'audio') {
            this.audioElement.muted = this.isMuted;
            this.audioElement.volume = this.isMuted ? 0 : this.volume / 100;
        }
        if (this.isYtReady && this.ytPlayer) {
            if (this.isMuted) {
                this.ytPlayer.mute();
            } else {
                this.ytPlayer.unMute();
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
                if (this.engineMode === 'audio') this.audioElement.volume = targetVol;
            } else {
                if (this.engineMode === 'audio') this.audioElement.volume = targetVol * (step / steps);
            }
        }, stepTime);
    }

    triggerCrossfade() {
        if (this.isCrossfading || this.queue.length <= 1) return;

        const nextIndex = this.getNextTrackIndex();
        const nextSong = this.queue[nextIndex];
        if (!nextSong) return;

        const activePlayer = this.getActiveDeckPlayer();
        const inactivePlayer = this.getInactiveDeckPlayer();

        // 듀얼 데크(YouTube) 동시 교차 크로스페이드 처리
        if (inactivePlayer && typeof inactivePlayer.loadVideoById === 'function') {
            this.isCrossfading = true;
            const targetVol = this.isMuted ? 0 : this.volume;
            const fadeSec = Math.max(3, Math.min(15, this.crossfade || 8));
            const steps = 20;
            const intervalTime = Math.floor((fadeSec * 1000) / steps);
            let currentStep = 0;

            const nextDeckName = this.activeDeck === 'A' ? 'B' : 'A';
            const curDeckEl = document.getElementById(`youtube-player-deck-${this.activeDeck.toLowerCase()}`);
            const nextDeckEl = document.getElementById(`youtube-player-deck-${nextDeckName.toLowerCase()}`);

            // 다음 곡을 비활성 데크에 볼륨 0으로 미리 로드 후 동시 재생 시작
            const nextStart = this.getInitialStartSeconds(nextSong);
            try {
                inactivePlayer.setVolume(0);
                inactivePlayer.loadVideoById({
                    videoId: nextSong.youtubeId,
                    startSeconds: nextStart
                });
                inactivePlayer.playVideo();
            } catch (e) {
                console.warn('[Crossfade Deck Preload Error]', e);
            }

            if (nextDeckEl) {
                nextDeckEl.style.display = 'block';
                nextDeckEl.style.opacity = '0';
            }

            const crossfadeTimer = setInterval(() => {
                currentStep++;
                const factor = currentStep / steps; // 0 to 1

                try {
                    // 현재 재생 중인 데크 페이드아웃
                    if (activePlayer && typeof activePlayer.setVolume === 'function') {
                        activePlayer.setVolume(Math.round(targetVol * (1 - factor)));
                    }
                    // 새로 시작한 데크 페이드인
                    if (inactivePlayer && typeof inactivePlayer.setVolume === 'function') {
                        inactivePlayer.setVolume(Math.round(targetVol * factor));
                    }
                } catch (e) {}

                if (nextDeckEl) nextDeckEl.style.opacity = factor.toFixed(2);
                if (curDeckEl) curDeckEl.style.opacity = (1 - factor).toFixed(2);

                if (currentStep >= steps) {
                    clearInterval(crossfadeTimer);
                    try {
                        if (activePlayer && typeof activePlayer.stopVideo === 'function') {
                            activePlayer.stopVideo();
                        }
                    } catch (e) {}

                    if (curDeckEl) curDeckEl.style.display = 'none';
                    if (nextDeckEl) {
                        nextDeckEl.style.opacity = '1';
                        nextDeckEl.style.display = 'block';
                    }

                    // 활성 데크 전환
                    this.activeDeck = nextDeckName;
                    this.ytPlayer = inactivePlayer;
                    try { inactivePlayer.setVolume(targetVol); } catch (e) {}

                    this.currentIndex = nextIndex;
                    this.currentSong = nextSong;
                    this.isCrossfading = false;
                    this.parseLyrics(nextSong.lyrics);

                    if (window.StorageManager && nextSong.id) {
                        window.StorageManager.addToHistory(nextSong.id);
                    }

                    this.updateMediaSession(nextSong);

                    window.dispatchEvent(new CustomEvent('stellplay:trackChanged', {
                        detail: { song: nextSong, index: this.currentIndex }
                    }));
                    window.dispatchEvent(new CustomEvent('stellplay:playStateChanged', {
                        detail: { isPlaying: true }
                    }));
                }
            }, intervalTime);
            return;
        }

        // 단일 오디오 엘리먼트 폴백 (로컬 PC 서버 모드)
        this.isCrossfading = true;
        const targetVol = this.isMuted ? 0 : this.volume / 100;
        const fadeMs = Math.max(500, this.crossfade * 1000);
        const steps = 15;
        const intervalTime = Math.max(30, Math.floor(fadeMs / steps));
        let currentStep = steps;

        const fadeOutTimer = setInterval(() => {
            currentStep--;
            if (currentStep <= 0) {
                clearInterval(fadeOutTimer);
                this.isCrossfading = false;
                this.playNext(true);
            } else {
                const volFactor = currentStep / steps;
                if (this.engineMode === 'audio') {
                    this.audioElement.volume = targetVol * volFactor;
                }
            }
        }, intervalTime);
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
        if (this.engineMode === 'audio') {
            return this.audioElement.currentTime || 0;
        } else if (this.isYtReady && this.ytPlayer && typeof this.ytPlayer.getCurrentTime === 'function') {
            try {
                return this.ytPlayer.getCurrentTime() || 0;
            } catch (e) {
                return 0;
            }
        }
        return 0;
    }

    getDuration() {
        if (this.engineMode === 'audio') {
            const d = this.audioElement.duration;
            if (d && !isNaN(d) && d > 0) return d;
        } else if (this.isYtReady && this.ytPlayer && typeof this.ytPlayer.getDuration === 'function') {
            try {
                const d = this.ytPlayer.getDuration();
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
