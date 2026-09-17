/**
 * StellPlay Mobile - 모바일 전용 오디오 플레이어 (Mobile Audio Engine)
 * - 오프라인 Blob 음원(비행기 모드)과 온라인 직접 스트리밍 음원을 매끄럽게 자동 전환
 * - PC 서버 없이 외부 인터넷 환경(LTE/5G/Wi-Fi)에서도 YouTube API 단독 재생 지원
 * - MediaSession API를 통한 잠금화면 위젯, 앨범아트, 블루투스 이어폰 컨트롤 연동
 * - 하이라이트 사비(Sabi) 연속 메들리 모드
 * - 실시간 재생목록(대기열) 드래그앤드롭 재배치 지원
 */

class MobilePlayer {
    constructor() {
        this.audio = new Audio();
        this.audio.preload = 'auto';

        this.currentSong = null;
        this.isPlaying = false;
        this.isOfflinePlayback = false;
        this.sabiMode = false;
        this.isShuffle = false;
        this.repeatMode = 'all'; // 'all', 'one', 'off'
        this.queue = [];
        this.queueIndex = 0;
        this.currentBlobUrl = null;
        this.nativeDuration = 0;
        this.nativeCurrentTime = 0;

        // 독립형 유튜브 엔진 (외부 인터넷 환경 지원)
        this.ytPlayer = null;
        this.isYtReady = false;
        this.activeEngine = 'audio'; // 'audio' | 'youtube'
        this.ytUpdateTimer = null;
        this.isStandalone = !!window.AndroidBridge ||
                            window.location.protocol === 'file:' ||
                            window.location.hostname === 'appassets.androidplatform.net' ||
                            window.location.hostname === 'localhost' ||
                            window.location.protocol === 'content:' ||
                            window.location.port === '' ||
                            !window.location.port;
        this._pendingYtSong = null;

        // PWA & 모바일 웹앱 백그라운드 재생 및 잠금화면 유지를 위한 무음 오디오 킵얼라이브 (16-bit 가청한계 이하 미세 디더링)
        function createKeepAliveAudioBlob() {
            try {
                const sampleRate = 8000;
                const numSeconds = 15;
                const numSamples = sampleRate * numSeconds;
                const buffer = new ArrayBuffer(44 + numSamples * 2);
                const view = new DataView(buffer);

                // RIFF Header
                view.setUint32(0, 0x52494646, false); // "RIFF"
                view.setUint32(4, 36 + numSamples * 2, true);
                view.setUint32(8, 0x57415645, false); // "WAVE"
                view.setUint32(12, 0x666d7420, false); // "fmt "
                view.setUint32(16, 16, true);
                view.setUint16(20, 1, true); // PCM
                view.setUint16(22, 1, true); // mono
                view.setUint32(24, sampleRate, true);
                view.setUint32(28, sampleRate * 2, true);
                view.setUint16(32, 2, true);
                view.setUint16(34, 16, true);
                view.setUint32(36, 0x64617461, false); // "data"
                view.setUint32(40, numSamples * 2, true);

                // 인간 귀에는 100% 무음이지만 iOS WebKit 절전 데몬을 영구 방지하는 20Hz 미세 파형
                let offset = 44;
                for (let i = 0; i < numSamples; i++) {
                    const sample = Math.round(Math.sin((2 * Math.PI * 20 * i) / sampleRate));
                    view.setInt16(offset, sample, true);
                    offset += 2;
                }

                return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
            } catch (e) {
                return 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
            }
        }

        this.silentAudio = new Audio();
        this.silentAudio.src = createKeepAliveAudioBlob();
        this.silentAudio.loop = true;
        this.silentAudio.volume = 0.02;
        this.silentAudio.setAttribute('playsinline', '');
        this.silentAudio.setAttribute('webkit-playsinline', '');
        this.isUserPaused = false;
        this.isAdPlaying = false;

        // iOS WebKit 오디오 잠금 해제 (User Gesture Unlocker)
        const unlockAudio = () => {
            try {
                this.silentAudio.play().catch(() => {});
            } catch (e) {}
        };
        window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
        window.addEventListener('click', unlockAudio, { once: true });

        this._setupAudioListeners();
        this._setupMediaSession();
        this._initYouTubeAPI();

        window.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.syncFromNative();
                if (this.isPlaying && this.activeEngine === 'youtube' && this.ytPlayer && typeof this.ytPlayer.getPlayerState === 'function') {
                    try {
                        const s = this.ytPlayer.getPlayerState();
                        if (s === window.YT.PlayerState.PAUSED && !this.isUserPaused) {
                            this.ytPlayer.playVideo();
                        }
                    } catch (e) {}
                }
            }
        });
        window.addEventListener('focus', () => this.syncFromNative());

        window.MobilePlayerInstance = this;
    }

    _setupAudioListeners() {
        this.audio.addEventListener('play', () => {
            if (this.activeEngine === 'audio') {
                this.isPlaying = true;
                this._updateMediaSessionState();
                window.dispatchEvent(new CustomEvent('mobileplayer:stateChanged', { detail: { isPlaying: true } }));
            }
        });

        this.audio.addEventListener('pause', () => {
            if (this.activeEngine === 'audio') {
                this.isPlaying = false;
                this._updateMediaSessionState();
                window.dispatchEvent(new CustomEvent('mobileplayer:stateChanged', { detail: { isPlaying: false } }));
            }
        });

        this.audio.addEventListener('ended', () => {
            if (this.activeEngine === 'audio') {
                if (this.repeatMode === 'one') {
                    this.audio.currentTime = this.sabiMode && this.currentSong?.sabi ? this.currentSong.sabi.start : 0;
                    this.audio.play().catch(() => {});
                } else {
                    this.playNext();
                }
            }
        });

        this.audio.addEventListener('timeupdate', () => {
            if (this.activeEngine !== 'audio') return;
            const cur = this.audio.currentTime || 0;
            const dur = this.audio.duration || this.currentSong?.duration || 0;
            const progress = dur > 0 ? (cur / dur) * 100 : 0;

            // 사비 메들리 구간 체크
            if (this.sabiMode && this.currentSong && this.currentSong.sabi) {
                const sEnd = this.currentSong.sabi.end;
                if (cur >= sEnd) {
                    this.playNext();
                    return;
                }
            }

            window.dispatchEvent(new CustomEvent('mobileplayer:timeUpdate', {
                detail: {
                    currentTime: cur,
                    duration: dur,
                    progress: progress
                }
            }));
        });

        this.audio.addEventListener('error', (e) => {
            // 이미 유튜브 엔진으로 재생 중이거나 오디오 소스가 비어있으면 에러 무시
            if (this.activeEngine === 'youtube' || !this.audio.src) {
                return;
            }

            // 오프라인이 아닌 상태에서 로컬 서버 응답이 실패한 경우 (외부 인터넷 환경 / PC 꺼짐 등)
            if (!this.isOfflinePlayback && this.currentSong && this.currentSong.youtubeId) {
                console.warn('[MobilePlayer] Local stream unavailable, switching to direct YouTube standalone engine...');
                this._playWithYouTubeEngine(this.currentSong);
                return;
            }

            console.warn('[MobilePlayer Error]', e);
            window.dispatchEvent(new CustomEvent('mobileplayer:error', {
                detail: { message: '음원 재생 중 오류가 발생했습니다. 네트워크 또는 오프라인 보관 상태를 확인해주세요.' }
            }));
        });
    }

    _initYouTubeAPI() {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        const setupYT = () => {
            if (window.YT && window.YT.Player) {
                const container = document.getElementById('m-youtube-hidden-player');
                if (!container) return;
                try {
                    const appOrigin = (window.location.origin && window.location.origin.startsWith('http')) 
                        ? window.location.origin 
                        : 'https://www.youtube.com';

                    this.ytPlayer = new window.YT.Player('m-youtube-hidden-player', {
                        height: '100%',
                        width: '100%',
                        host: 'https://www.youtube-nocookie.com',
                        playerVars: {
                            autoplay: 1,
                            controls: 0,
                            disablekb: 1,
                            fs: 0,
                            rel: 0,
                            playsinline: 1,
                            enablejsapi: 1,
                            iv_load_policy: 3,
                            origin: appOrigin
                        },
                        events: {
                            onError: (event) => {
                                console.warn('[MobilePlayer] YouTube Player error event code:', event.data);
                                if (event.data === 150 || event.data === 101) {
                                    window.dispatchEvent(new CustomEvent('mobileplayer:error', {
                                        detail: { message: `"${this.currentSong?.title}"은(는) 유튜브 임베드 정책으로 인해 재생이 제한되었습니다. Wi-Fi로 PC 서버를 연동하거나 오프라인 저장을 이용해주세요.` }
                                    }));
                                }
                            },
                            onReady: () => {
                                console.log('[MobilePlayer] YouTube Iframe API ready!');
                                this.isYtReady = true;
                                if (this._pendingYtSong) {
                                    const pSong = this._pendingYtSong;
                                    this._pendingYtSong = null;
                                    this._playWithYouTubeEngine(pSong);
                                }
                            },
                            onStateChange: (event) => {
                                if (this.activeEngine !== 'youtube') return;
                                if (event.data === window.YT.PlayerState.PLAYING) {
                                    this.isPlaying = true;
                                    this.isUserPaused = false;
                                    try { this.silentAudio.play().catch(() => {}); } catch (e) {}
                                    this._updateMediaSessionState();
                                    this._startYtTimer();
                                    window.dispatchEvent(new CustomEvent('mobileplayer:stateChanged', { detail: { isPlaying: true } }));
                                } else if (event.data === window.YT.PlayerState.PAUSED) {
                                    // 스마트폰 화면 잠금(document.hidden)으로 인한 자동 일시정지인 경우 킵얼라이브 오디오 유지
                                    if (document.hidden && !this.isUserPaused) {
                                        console.log('[MobilePlayer] Background pause detected. Maintaining keep-alive.');
                                        return;
                                    }
                                    this.isPlaying = false;
                                    if (this.isUserPaused) {
                                        try { this.silentAudio.pause(); } catch (e) {}
                                    }
                                    this._updateMediaSessionState();
                                    this._stopYtTimer();
                                    window.dispatchEvent(new CustomEvent('mobileplayer:stateChanged', { detail: { isPlaying: false } }));
                                } else if (event.data === window.YT.PlayerState.ENDED) {
                                    // 곡 종료 시에도 silentAudio를 일시정지하지 않고 백그라운드 스레드를 유지하여 다음 곡 연속 재생
                                    this._stopYtTimer();
                                    if (this.repeatMode === 'one') {
                                        const sStart = this.sabiMode && this.currentSong?.sabi ? this.currentSong.sabi.start : 0;
                                        this.ytPlayer.seekTo(sStart, true);
                                        this.ytPlayer.playVideo();
                                    } else {
                                        this.playNext();
                                    }
                                }
                            }
                        }
                    });
                } catch (e) {}
            }
        };

        if (window.YT && window.YT.Player) {
            setupYT();
        } else {
            const oldCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (oldCallback) oldCallback();
                setupYT();
            };
        }
    }

    _startYtTimer() {
        this._stopYtTimer();
        this.ytUpdateTimer = setInterval(() => {
            if (this.activeEngine !== 'youtube' || !this.ytPlayer || !this.ytPlayer.getCurrentTime) return;

            // 유튜브 광고 상태 안전 감지 (seekTo 호출 금지 - UI 알림 및 건너뛰기 터치 활성화 전용)
            if (this.currentSong) {
                try {
                    const vData = typeof this.ytPlayer.getVideoData === 'function' ? this.ytPlayer.getVideoData() : null;
                    const isAdNow = !!(vData && (vData.isAd === true || (vData.video_id && vData.video_id !== this.currentSong.youtubeId)));
                    if (isAdNow !== this.isAdPlaying) {
                        this.isAdPlaying = isAdNow;
                        window.dispatchEvent(new CustomEvent('mobileplayer:adNotice', { detail: { isAd: isAdNow } }));
                    }
                } catch (e) {}
            }

            try {
                const cur = this.ytPlayer.getCurrentTime() || 0;
                const dur = this.ytPlayer.getDuration() || this.currentSong?.duration || 0;
                const progress = dur > 0 ? (cur / dur) * 100 : 0;

                if (this.sabiMode && this.currentSong && this.currentSong.sabi) {
                    const sEnd = this.currentSong.sabi.end;
                    if (cur >= sEnd) {
                        this.playNext();
                        return;
                    }
                }

                // 안드로이드 잠금화면 미디어 컨트롤러 탐색바 위치 동기화
                if ('mediaSession' in navigator && navigator.mediaSession.setPositionState && dur > 0 && cur <= dur) {
                    try {
                        navigator.mediaSession.setPositionState({
                            duration: Math.max(1, dur),
                            playbackRate: 1,
                            position: Math.min(cur, dur)
                        });
                    } catch (e) {}
                }

                window.dispatchEvent(new CustomEvent('mobileplayer:timeUpdate', {
                    detail: { currentTime: cur, duration: dur, progress: progress }
                }));
            } catch (e) {}
        }, 250);
    }

    _stopYtTimer() {
        if (this.ytUpdateTimer) {
            clearInterval(this.ytUpdateTimer);
            this.ytUpdateTimer = null;
        }
    }

    _playWithYouTubeEngine(song) {
        if (window.AndroidBridge && typeof window.AndroidBridge.stopNativePlayback === 'function') {
            try { window.AndroidBridge.stopNativePlayback(); } catch (e) {}
        }
        this.activeEngine = 'youtube';
        this.audio.pause();
        this.audio.src = '';
        this.isOfflinePlayback = false;

        const startSec = (this.sabiMode && song.sabi && typeof song.sabi.start === 'number') ? song.sabi.start : 0;

        if (window.StorageManager && song && song.id) {
            window.StorageManager.addToHistory(song.id);
        }

        if (this.ytPlayer && this.isYtReady && this.ytPlayer.loadVideoById) {
            try {
                this.ytPlayer.loadVideoById({
                    videoId: song.youtubeId,
                    startSeconds: startSec
                });
                this.ytPlayer.playVideo();
                try { this.silentAudio.play().catch(() => {}); } catch (e) {}
            } catch (e) {
                console.warn('[YT Engine error]', e);
            }
        } else {
            console.log('[MobilePlayer] YouTube Player not ready yet, queuing song:', song.title);
            this._pendingYtSong = song;
        }

        this._updateMediaSessionMetadata();
        window.dispatchEvent(new CustomEvent('mobileplayer:trackChanged', {
            detail: {
                song: this.currentSong,
                isOffline: false
            }
        }));
    }

    _setupMediaSession() {
        if (!('mediaSession' in navigator)) return;

        navigator.mediaSession.setActionHandler('play', () => this.togglePlay());
        navigator.mediaSession.setActionHandler('pause', () => this.togglePlay());
        navigator.mediaSession.setActionHandler('previoustrack', () => this.playPrev());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.playNext());
        try {
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime !== undefined) {
                    this.seek(details.seekTime);
                }
            });
            navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                const offset = details.seekOffset || 10;
                const cur = this.getCurrentTime();
                this.seek(Math.max(0, cur - offset));
            });
            navigator.mediaSession.setActionHandler('seekforward', (details) => {
                const offset = details.seekOffset || 10;
                const cur = this.getCurrentTime();
                this.seek(cur + offset);
            });
        } catch (e) {}
    }

    getCurrentTime() {
        if (this.activeEngine === 'youtube' && this.ytPlayer && this.ytPlayer.getCurrentTime) {
            try { return this.ytPlayer.getCurrentTime() || 0; } catch (e) { return 0; }
        }
        return this.audio.currentTime || 0;
    }

    _updateMediaSessionMetadata() {
        if (!this.currentSong) return;

        const thumb = `https://img.youtube.com/vi/${this.currentSong.youtubeId}/hqdefault.jpg`;
        const displayTitle = this.currentSong.title;
        const artist = this.currentSong.artist;

        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: displayTitle,
                artist: artist,
                album: this.currentSong.originalArtist || '스텔라이브 (Stellive)',
                artwork: [
                    { src: thumb, sizes: '96x96', type: 'image/jpeg' },
                    { src: thumb, sizes: '128x128', type: 'image/jpeg' },
                    { src: thumb, sizes: '192x192', type: 'image/jpeg' },
                    { src: thumb, sizes: '512x512', type: 'image/jpeg' }
                ]
            });
        }
    }

    _updateMediaSessionState() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = this.isPlaying ? 'playing' : 'paused';
        }
    }

    async playSong(song, isUserInitiated = true) {
        if (!song) return;
        this.currentSong = song;

        // iOS WebKit: 비동기(await) 진입 전 사용자 터치 제스처 권한을 동기적으로 선점
        try {
            this.silentAudio.play().catch(() => {});
        } catch (e) {}

        // 최근 재생 기록 (History) 저장
        if (window.StorageManager && song && song.id) {
            window.StorageManager.addToHistory(song.id);
        }

        let idx = this.queue.findIndex(s => s.id === song.id);
        if (idx === -1) {
            this.queue.push(song);
            idx = this.queue.length - 1;
        }
        this.queueIndex = idx;
        this.isPlaying = true;

        // 안드로이드 네이티브 서비스 큐 동기화
        if (window.AndroidBridge && typeof window.AndroidBridge.syncQueue === 'function') {
            try {
                window.AndroidBridge.syncQueue(JSON.stringify(this.queue), this.queueIndex);
            } catch (e) {}
        }

        let offlineRecord = null;
        try {
            if (window.OfflineDB && typeof window.OfflineDB.getTrack === 'function') {
                offlineRecord = await window.OfflineDB.getTrack(song.id);
                if (!offlineRecord && song.youtubeId) {
                    offlineRecord = await window.OfflineDB.getTrack(song.youtubeId);
                }
            }
        } catch (e) {}

        const hasValidIndexedBlob = offlineRecord && offlineRecord.blob && offlineRecord.blob.size > 1000;
        const isNativeOffline = window.AndroidBridge && typeof window.AndroidBridge.hasOfflineTrack === 'function'
            ? window.AndroidBridge.hasOfflineTrack(song.id, song.youtubeId || '')
            : false;

        // 1. 안드로이드 APK 네이티브 환경인 경우 (기기 저장 파일이 있거나, IndexedDB 블롭이 없고 온라인인 경우)
        if (window.AndroidBridge && typeof window.AndroidBridge.playIndexNative === 'function' && (isNativeOffline || (!hasValidIndexedBlob && navigator.onLine))) {
            this.activeEngine = 'native';
            this.isOfflinePlayback = isNativeOffline;
            try { this.audio.pause(); } catch (e) {}
            try { this.silentAudio.pause(); } catch (e) {}
            if (this.ytPlayer && this.ytPlayer.stopVideo) {
                try { this.ytPlayer.stopVideo(); } catch (e) {}
            }
            this._stopYtTimer();

            window.AndroidBridge.playIndexNative(this.queueIndex);

            window.dispatchEvent(new CustomEvent('mobileplayer:trackChanged', {
                detail: { song: this.currentSong, isOffline: isNativeOffline }
            }));
            window.dispatchEvent(new CustomEvent('mobileplayer:stateChanged', {
                detail: { isPlaying: true }
            }));
            return;
        }

        // 이전 Blob URL 해제
        if (this.currentBlobUrl) {
            URL.revokeObjectURL(this.currentBlobUrl);
            this.currentBlobUrl = null;
        }

        // 2. 오프라인 IndexedDB에 저장된 음원인 경우 (비행기 모드 / 로컬 오프라인 캐시)
        let sourceUrl = '';
        this.isOfflinePlayback = false;

        if (hasValidIndexedBlob) {
            this.currentBlobUrl = URL.createObjectURL(offlineRecord.blob);
            sourceUrl = this.currentBlobUrl;
            this.isOfflinePlayback = true;
        }

        const targetStart = (this.sabiMode && song.sabi && typeof song.sabi.start === 'number') ? song.sabi.start : 0;
        this._pendingStartTime = targetStart;

        const applyTargetStart = () => {
            if (this._pendingStartTime > 0) {
                try {
                    this.audio.currentTime = this._pendingStartTime;
                    this._pendingStartTime = 0;
                } catch (e) {}
            }
        };

        // 오프라인 곡인 경우 HTML5 오디오로 100% 오프라인 무버퍼링 즉시 재생
        if (this.isOfflinePlayback) {
            this.activeEngine = 'audio';
            try { this.silentAudio.pause(); } catch (e) {}
            if (this.ytPlayer && this.ytPlayer.stopVideo) {
                try { this.ytPlayer.stopVideo(); } catch (e) {}
            }
            this._stopYtTimer();

            if (window.AndroidBridge && typeof window.AndroidBridge.updatePlaybackState === 'function') {
                try {
                    const thumb = song.thumbUrl || `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`;
                    window.AndroidBridge.updatePlaybackState(song.title, song.artist, true, thumb);
                } catch (e) {}
            }

            this.audio.addEventListener('loadedmetadata', applyTargetStart, { once: true });
            this.audio.addEventListener('canplay', applyTargetStart, { once: true });

            this.audio.src = sourceUrl;
            this._updateMediaSessionMetadata();

            try {
                this.audio.currentTime = targetStart;
            } catch (e) {}

            try {
                await this.audio.play();
            } catch (err) {
                if (isUserInitiated) console.warn('[Autoplay blocked]', err);
            }

            window.dispatchEvent(new CustomEvent('mobileplayer:trackChanged', {
                detail: { song: this.currentSong, isOffline: true }
            }));
            return;
        }

        // 3. 오프라인 곡이 아닌 경우 (온라인 재생)
        if (!navigator.onLine) {
            window.dispatchEvent(new CustomEvent('mobileplayer:error', {
                detail: { message: `"${song.title}"은 오프라인에 저장되지 않아 네트워크 연결이 필요합니다.` }
            }));
            return;
        }

        // 네이티브 브리지가 연결되어 있다면 온라인 재생 위임
        if (window.AndroidBridge && typeof window.AndroidBridge.playIndexNative === 'function') {
            this.activeEngine = 'native';
            this.isOfflinePlayback = false;
            this.nativeCurrentTime = 0;
            this.nativeDuration = song.duration || 0;
            try { this.audio.pause(); } catch (e) {}
            try { this.silentAudio.pause(); } catch (e) {}
            if (this.ytPlayer && this.ytPlayer.stopVideo) {
                try { this.ytPlayer.stopVideo(); } catch (e) {}
            }
            this._stopYtTimer();

            window.AndroidBridge.playIndexNative(this.queueIndex);

            window.dispatchEvent(new CustomEvent('mobileplayer:trackChanged', {
                detail: { song: this.currentSong, isOffline: false }
            }));
            window.dispatchEvent(new CustomEvent('mobileplayer:stateChanged', {
                detail: { isPlaying: true }
            }));
            window.dispatchEvent(new CustomEvent('mobileplayer:timeUpdate', {
                detail: {
                    currentTime: 0,
                    duration: this.nativeDuration,
                    progress: 0
                }
            }));
            return;
        }

        // PC 서버 IP가 설정된 경우 홈 Wi-Fi를 통한 고음질 yt-dlp 스트림 시도
        const pcServer = (localStorage.getItem('stellplay_pc_server') || '').trim().replace(/\/+$/, '');
        if (pcServer) {
            this.activeEngine = 'audio';
            sourceUrl = `${pcServer}/api/audio?id=${song.youtubeId}`;
            this.audio.addEventListener('loadedmetadata', applyTargetStart, { once: true });
            this.audio.addEventListener('canplay', applyTargetStart, { once: true });
            this.audio.src = sourceUrl;
            this._updateMediaSessionMetadata();
            try { this.audio.currentTime = targetStart; } catch (e) {}
            try {
                await this.audio.play();
                window.dispatchEvent(new CustomEvent('mobileplayer:trackChanged', {
                    detail: { song: this.currentSong, isOffline: false }
                }));
                return;
            } catch (err) {
                console.warn('[PC Server Play Failed, switching to direct YouTube engine]', err);
            }
        }

        // 단독 앱(Standalone APK) 환경인 경우 즉시 유튜브 엔진으로 다이렉트 스트리밍
        if (this.isStandalone) {
            console.log('[MobilePlayer] Standalone mode: Playing directly via YouTube engine');
            this._playWithYouTubeEngine(song);
            return;
        }

        // 로컬 PC 서버 또는 단독 유튜브 재생 시도
        this.activeEngine = 'audio';
        sourceUrl = `/api/audio?id=${song.youtubeId}`;

        this.audio.addEventListener('loadedmetadata', applyTargetStart, { once: true });
        this.audio.addEventListener('canplay', applyTargetStart, { once: true });

        this.audio.src = sourceUrl;
        this._updateMediaSessionMetadata();

        try {
            this.audio.currentTime = targetStart;
        } catch (e) {}

        try {
            await this.audio.play();
        } catch (err) {
            if (!this.isOfflinePlayback) {
                this._playWithYouTubeEngine(song);
            }
        }

        window.dispatchEvent(new CustomEvent('mobileplayer:trackChanged', {
            detail: {
                song: this.currentSong,
                isOffline: false
            }
        }));
    }

    toggleOnlinePlayFromNative() {
        if (this.activeEngine === 'youtube' && this.ytPlayer) {
            try {
                if (this.isPlaying) {
                    this.isUserPaused = true;
                    this.ytPlayer.pauseVideo();
                    try { this.silentAudio.pause(); } catch (e) {}
                } else {
                    this.isUserPaused = false;
                    try { this.silentAudio.play().catch(() => {}); } catch (e) {}
                    this.ytPlayer.playVideo();
                }
            } catch (e) {}
            return;
        }

        if (!this.audio.src) return;
        if (this.audio.paused) {
            this.audio.play().catch(() => {});
        } else {
            this.audio.pause();
        }
    }

    togglePlay() {
        if (this.activeEngine === 'native' && window.AndroidBridge && typeof window.AndroidBridge.togglePlayNative === 'function') {
            window.AndroidBridge.togglePlayNative();
            return;
        }

        if (!this.currentSong) {
            const list = (this.queue && this.queue.length > 0)
                ? this.queue
                : (typeof window.getAllSongs === 'function' ? window.getAllSongs() : []);
            if (list.length > 0) {
                this.setQueue(list, 0, true);
                return;
            }
        }

        this.toggleOnlinePlayFromNative();
    }

    playNext() {
        if (this.activeEngine === 'native' && window.AndroidBridge && typeof window.AndroidBridge.playNextNative === 'function') {
            window.AndroidBridge.playNextNative();
            return;
        }

        if (this.queue.length === 0) return;

        if (this.isShuffle) {
            this.queueIndex = Math.floor(Math.random() * this.queue.length);
        } else {
            this.queueIndex = (this.queueIndex + 1) % this.queue.length;
        }

        this.playSong(this.queue[this.queueIndex]);
    }

    playPrev() {
        if (this.activeEngine === 'native' && window.AndroidBridge && typeof window.AndroidBridge.playPrevNative === 'function') {
            window.AndroidBridge.playPrevNative();
            return;
        }

        if (this.queue.length === 0) return;

        const curTime = this.activeEngine === 'youtube' && this.ytPlayer && this.ytPlayer.getCurrentTime
            ? this.ytPlayer.getCurrentTime()
            : this.audio.currentTime;

        // 3초 이상 재생 중이었으면 처음으로 리와인드
        if (curTime > 3) {
            const startSec = this.sabiMode && this.currentSong?.sabi ? this.currentSong.sabi.start : 0;
            this.seek(startSec);
            return;
        }

        if (this.isShuffle) {
            this.queueIndex = Math.floor(Math.random() * this.queue.length);
        } else {
            this.queueIndex = (this.queueIndex - 1 + this.queue.length) % this.queue.length;
        }

        this.playSong(this.queue[this.queueIndex]);
    }

    seek(seconds) {
        const targetSec = Math.max(0, Number(seconds) || 0);
        if (this.activeEngine === 'native' && window.AndroidBridge && typeof window.AndroidBridge.seekToNative === 'function') {
            window.AndroidBridge.seekToNative(Math.floor(targetSec));
            return;
        }

        if (this.activeEngine === 'youtube' && this.ytPlayer && this.ytPlayer.seekTo) {
            try {
                this.ytPlayer.seekTo(targetSec, true);
            } catch (e) {}
            return;
        }

        try {
            if (this.audio.duration && !isNaN(this.audio.duration) && isFinite(this.audio.duration)) {
                this.audio.currentTime = Math.min(targetSec, this.audio.duration);
            } else {
                this.audio.currentTime = targetSec;
            }
        } catch (e) {
            console.warn('[MobilePlayer] Direct seek deferred:', e);
            const onCanPlay = () => {
                try { this.audio.currentTime = targetSec; } catch (err) {}
            };
            this.audio.addEventListener('canplay', onCanPlay, { once: true });
        }
    }

    getDuration() {
        if (this.activeEngine === 'native') {
            return this.nativeDuration || this.currentSong?.duration || 0;
        }
        if (this.activeEngine === 'youtube' && this.ytPlayer && this.ytPlayer.getDuration) {
            return this.ytPlayer.getDuration() || this.currentSong?.duration || 0;
        }
        return this.audio.duration || this.currentSong?.duration || 0;
    }

    seekPercent(percent) {
        const dur = this.getDuration();
        if (dur > 0) {
            this.seek((percent / 100) * dur);
        }
    }

    setSabiMode(enabled) {
        this.sabiMode = !!enabled;
        if (window.AndroidBridge && typeof window.AndroidBridge.setSabiModeNative === 'function') {
            window.AndroidBridge.setSabiModeNative(this.sabiMode);
        }

        if (this.sabiMode && this.currentSong && this.currentSong.sabi && typeof this.currentSong.sabi.start === 'number') {
            const startSec = this.currentSong.sabi.start;
            this.seek(startSec);
            if (this.activeEngine === 'audio') {
                if (this.audio.paused && this.isPlaying) {
                    this.audio.play().catch(() => {});
                }
            } else if (this.activeEngine === 'youtube' && this.ytPlayer) {
                if (this.isPlaying && this.ytPlayer.playVideo) {
                    this.ytPlayer.playVideo();
                }
            }
        }
        window.dispatchEvent(new CustomEvent('mobileplayer:sabiModeChanged', {
            detail: { sabiMode: this.sabiMode }
        }));
        return this.sabiMode;
    }

    toggleSabiMode() {
        return this.setSabiMode(!this.sabiMode);
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        if (window.AndroidBridge && typeof window.AndroidBridge.setShuffleNative === 'function') {
            window.AndroidBridge.setShuffleNative(this.isShuffle);
        }
        window.dispatchEvent(new CustomEvent('mobileplayer:shuffleChanged', {
            detail: { isShuffle: this.isShuffle }
        }));
        return this.isShuffle;
    }

    toggleRepeat() {
        const modes = ['all', 'one', 'off'];
        const nextIdx = (modes.indexOf(this.repeatMode) + 1) % modes.length;
        this.repeatMode = modes[nextIdx];
        if (window.AndroidBridge && typeof window.AndroidBridge.setRepeatModeNative === 'function') {
            window.AndroidBridge.setRepeatModeNative(this.repeatMode);
        }
        window.dispatchEvent(new CustomEvent('mobileplayer:repeatChanged', {
            detail: { repeatMode: this.repeatMode }
        }));
        return this.repeatMode;
    }

    setQueue(songs, startIndex = 0, autoPlay = true) {
        if (!songs || songs.length === 0) return;
        this.queue = [...songs];
        this.queueIndex = Math.max(0, Math.min(startIndex, this.queue.length - 1));

        window.dispatchEvent(new CustomEvent('mobileplayer:queueUpdated', {
            detail: { queue: this.queue, index: this.queueIndex }
        }));

        if (window.AndroidBridge && typeof window.AndroidBridge.syncQueue === 'function') {
            window.AndroidBridge.syncQueue(JSON.stringify(this.queue), this.queueIndex);
            if (autoPlay) {
                this.playSong(this.queue[this.queueIndex]);
            }
            return;
        }

        if (autoPlay) {
            this.playSong(this.queue[this.queueIndex]);
        }
    }

    moveQueueItem(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.queue.length || toIndex < 0 || toIndex >= this.queue.length) return;
        const currentPlaying = this.queue[this.queueIndex];
        const item = this.queue.splice(fromIndex, 1)[0];
        this.queue.splice(toIndex, 0, item);
        if (currentPlaying) {
            this.queueIndex = this.queue.indexOf(currentPlaying);
        }
        if (window.AndroidBridge && typeof window.AndroidBridge.syncQueue === 'function') {
            window.AndroidBridge.syncQueue(JSON.stringify(this.queue), this.queueIndex);
        }
        window.dispatchEvent(new CustomEvent('mobileplayer:queueUpdated', {
            detail: { queue: this.queue, index: this.queueIndex }
        }));
    }

    removeFromQueue(index) {
        if (index < 0 || index >= this.queue.length) return;
        if (this.queue.length <= 1) {
            this.queue = [];
            this.queueIndex = 0;
            this.currentSong = null;
            this.audio.pause();
            this.audio.src = '';
            if (this.ytPlayer && this.ytPlayer.stopVideo) {
                try { this.ytPlayer.stopVideo(); } catch (e) {}
            }
            if (window.AndroidBridge && typeof window.AndroidBridge.syncQueue === 'function') {
                window.AndroidBridge.syncQueue(JSON.stringify(this.queue), 0);
            }
            window.dispatchEvent(new CustomEvent('mobileplayer:queueUpdated', {
                detail: { queue: this.queue, index: this.queueIndex }
            }));
            return;
        }

        const isCurrent = index === this.queueIndex;
        this.queue.splice(index, 1);
        if (index < this.queueIndex) {
            this.queueIndex--;
        } else if (isCurrent) {
            if (this.queueIndex >= this.queue.length) this.queueIndex = 0;
            this.playSong(this.queue[this.queueIndex]);
        }
        if (window.AndroidBridge && typeof window.AndroidBridge.syncQueue === 'function') {
            window.AndroidBridge.syncQueue(JSON.stringify(this.queue), this.queueIndex);
        }
        window.dispatchEvent(new CustomEvent('mobileplayer:queueUpdated', {
            detail: { queue: this.queue, index: this.queueIndex }
        }));
    }

    clearQueue() {
        if (this.currentSong) {
            this.queue = [this.currentSong];
            this.queueIndex = 0;
        } else {
            this.queue = [];
            this.queueIndex = 0;
        }
        if (window.AndroidBridge && typeof window.AndroidBridge.syncQueue === 'function') {
            window.AndroidBridge.syncQueue(JSON.stringify(this.queue), this.queueIndex);
        }
        window.dispatchEvent(new CustomEvent('mobileplayer:queueUpdated', {
            detail: { queue: this.queue, index: this.queueIndex }
        }));
    }

    playQueueIndex(index) {
        if (index < 0 || index >= this.queue.length) return;
        this.queueIndex = index;
        this.playSong(this.queue[this.queueIndex]);
    }

    // ===================================================================
    // AndroidBridge 네이티브 백그라운드 재생 서비스 실시간 수신 핸들러
    // ===================================================================
    playOnlineTrackFromNative(index) {
        if (!this.queue || this.queue.length === 0) return;
        if (index < 0 || index >= this.queue.length) index = 0;
        this.queueIndex = index;
        const song = this.queue[index];
        this.currentSong = song;
        this.isPlaying = true;
        if (window.StorageManager && this.currentSong && this.currentSong.id) {
            window.StorageManager.addToHistory(this.currentSong.id);
        }
        this._playWithYouTubeEngine(song);
        window.dispatchEvent(new CustomEvent('mobileplayer:trackChanged', {
            detail: { song: this.currentSong, isOffline: false }
        }));
        window.dispatchEvent(new CustomEvent('mobileplayer:stateChanged', {
            detail: { isPlaying: true }
        }));
    }

    onNativeTrackChanged(index) {
        if (!this.queue || this.queue.length === 0) {
            this.syncFromNative();
            return;
        }
        if (index >= 0 && index < this.queue.length) {
            this.activeEngine = 'native';
            this.queueIndex = index;
            this.currentSong = this.queue[index];
            this.isPlaying = true;

            // 안드로이드 네이티브 서비스에서 다음곡, 이전곡, 셔플, 자동 다음곡 등 재생 시 최근 감상 기록 실시간 저장
            if (window.StorageManager && this.currentSong && this.currentSong.id) {
                window.StorageManager.addToHistory(this.currentSong.id);
            }

            const startSec = (this.sabiMode && this.currentSong && this.currentSong.sabi && typeof this.currentSong.sabi.start === 'number')
                ? this.currentSong.sabi.start
                : 0;
            this.nativeCurrentTime = startSec;
            this.nativeDuration = this.currentSong ? (this.currentSong.duration || 0) : 0;
            const isOffline = window.AndroidBridge && window.AndroidBridge.hasOfflineTrack ? window.AndroidBridge.hasOfflineTrack(this.currentSong.id, this.currentSong.youtubeId || '') : false;
            window.dispatchEvent(new CustomEvent('mobileplayer:trackChanged', {
                detail: { song: this.currentSong, isOffline }
            }));
            window.dispatchEvent(new CustomEvent('mobileplayer:stateChanged', {
                detail: { isPlaying: true }
            }));
            const progress = this.nativeDuration > 0 ? (startSec / this.nativeDuration) * 100 : 0;
            window.dispatchEvent(new CustomEvent('mobileplayer:timeUpdate', {
                detail: {
                    currentTime: startSec,
                    duration: this.nativeDuration,
                    progress: progress
                }
            }));
        }
    }

    onNativeStateChanged(isPlaying) {
        this.activeEngine = 'native';
        this.isPlaying = !!isPlaying;
        window.dispatchEvent(new CustomEvent('mobileplayer:stateChanged', {
            detail: { isPlaying: this.isPlaying }
        }));
    }

    onNativeTimeUpdate(cur, dur) {
        this.activeEngine = 'native';
        this.nativeCurrentTime = Number(cur) || 0;
        this.nativeDuration = Number(dur) || 0;
        const progress = dur > 0 ? (cur / dur) * 100 : 0;
        window.dispatchEvent(new CustomEvent('mobileplayer:timeUpdate', {
            detail: {
                currentTime: cur,
                duration: dur,
                progress: progress
            }
        }));
    }

    syncFromNative() {
        if (!window.AndroidBridge || typeof window.AndroidBridge.getCurrentPlaybackState !== 'function') return;
        try {
            if ((!this.queue || this.queue.length === 0) && typeof window.AndroidBridge.getQueueJsonNative === 'function') {
                const qJson = window.AndroidBridge.getQueueJsonNative();
                if (qJson && qJson !== '[]') {
                    this.queue = JSON.parse(qJson);
                    window.dispatchEvent(new CustomEvent('mobileplayer:queueUpdated', {
                        detail: { queue: this.queue }
                    }));
                }
            }
            const stateStr = window.AndroidBridge.getCurrentPlaybackState();
            const state = JSON.parse(stateStr);
            if (state && state.queueIndex >= 0 && state.queueIndex < this.queue.length) {
                this.activeEngine = 'native';
                this.queueIndex = state.queueIndex;
                this.currentSong = this.queue[this.queueIndex];
                this.isPlaying = state.isPlaying;

                if (state.isPlaying && window.StorageManager && this.currentSong && this.currentSong.id) {
                    window.StorageManager.addToHistory(this.currentSong.id);
                }

                const isOffline = window.AndroidBridge.hasOfflineTrack ? window.AndroidBridge.hasOfflineTrack(this.currentSong.id, this.currentSong.youtubeId || '') : false;
                window.dispatchEvent(new CustomEvent('mobileplayer:trackChanged', {
                    detail: { song: this.currentSong, isOffline }
                }));
                window.dispatchEvent(new CustomEvent('mobileplayer:stateChanged', {
                    detail: { isPlaying: this.isPlaying }
                }));
                const cur = state.position || 0;
                const dur = state.duration || (this.currentSong ? this.currentSong.duration : 0);
                this.nativeCurrentTime = cur;
                this.nativeDuration = dur;
                const progress = dur > 0 ? (cur / dur) * 100 : 0;
                window.dispatchEvent(new CustomEvent('mobileplayer:timeUpdate', {
                    detail: { currentTime: cur, duration: dur, progress }
                }));
            }
        } catch (e) {
            console.warn('[MobilePlayer] syncFromNative error:', e);
        }
    }

    // 오디오 디스크 캐시 및 설정 연동
    getAudioCacheSize() {
        if (window.AndroidBridge && typeof window.AndroidBridge.getAudioCacheSize === 'function') {
            try {
                return window.AndroidBridge.getAudioCacheSize();
            } catch (e) {
                return 0;
            }
        }
        return 0;
    }

    clearAudioCache() {
        if (window.AndroidBridge && typeof window.AndroidBridge.clearAudioCache === 'function') {
            try {
                window.AndroidBridge.clearAudioCache();
                return true;
            } catch (e) {
                return false;
            }
        }
        return false;
    }

    setCrossfadeEnabled(enabled) {
        const en = !!enabled;
        localStorage.setItem('stellplay_crossfade_enabled', en ? 'true' : 'false');
        if (window.AndroidBridge && typeof window.AndroidBridge.setCrossfadeEnabled === 'function') {
            try {
                window.AndroidBridge.setCrossfadeEnabled(en);
            } catch (e) {}
        }
    }

    isCrossfadeEnabled() {
        if (window.AndroidBridge && typeof window.AndroidBridge.isCrossfadeEnabled === 'function') {
            try {
                return !!window.AndroidBridge.isCrossfadeEnabled();
            } catch (e) {}
        }
        return localStorage.getItem('stellplay_crossfade_enabled') !== 'false';
    }

    setCrossfade(sec) {
        const s = Math.max(5, Math.min(15, Number(sec) || 10));
        localStorage.setItem('stellplay_crossfade_sec', String(s));
        if (window.AndroidBridge && typeof window.AndroidBridge.setCrossfadeDuration === 'function') {
            try {
                window.AndroidBridge.setCrossfadeDuration(s);
            } catch (e) {}
        }
    }

    getCrossfade() {
        if (window.AndroidBridge && typeof window.AndroidBridge.getCrossfadeDuration === 'function') {
            try {
                return window.AndroidBridge.getCrossfadeDuration();
            } catch (e) {}
        }
        return parseInt(localStorage.getItem('stellplay_crossfade_sec') || '10', 10);
    }

    setAudioQuality(mode) {
        const validModes = ['data_saver', 'wifi_only', 'high_always'];
        const m = validModes.includes(mode) ? mode : 'data_saver';
        localStorage.setItem('stellplay_audio_quality', m);
        if (window.AndroidBridge && typeof window.AndroidBridge.setAudioQualityMode === 'function') {
            try {
                window.AndroidBridge.setAudioQualityMode(m);
            } catch (e) {}
        }
    }

    getAudioQuality() {
        if (window.AndroidBridge && typeof window.AndroidBridge.getAudioQualityMode === 'function') {
            try {
                return window.AndroidBridge.getAudioQualityMode();
            } catch (e) {}
        }
        return localStorage.getItem('stellplay_audio_quality') || 'data_saver';
    }

    setDataSaver(enabled) {
        this.setAudioQuality(enabled ? 'data_saver' : 'high_always');
    }

    isDataSaver() {
        return this.getAudioQuality() === 'data_saver';
    }

    showToast(message) {
        window.dispatchEvent(new CustomEvent('mobileplayer:toast', { detail: { message } }));
    }
}

window.MobilePlayer = MobilePlayer;
