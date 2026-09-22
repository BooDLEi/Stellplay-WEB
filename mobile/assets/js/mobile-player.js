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
        this.playerViewMode = 'art';
        this._pendingYtSong = null;
        this._pendingYtStartTime = 0;

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
        this.isAdShieldActive = false;
        this.audioCtx = null;
        const initAudioContext = () => {
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass && !this.audioCtx) {
                    this.audioCtx = new AudioContextClass();
                    const osc = this.audioCtx.createOscillator();
                    const gain = this.audioCtx.createGain();
                    gain.gain.value = 0.0001; // 청취 불가능한 극미세 무음 버퍼
                    osc.frequency.value = 440;
                    osc.connect(gain);
                    gain.connect(this.audioCtx.destination);
                    osc.start();
                    if (this.audioCtx.state === 'suspended') {
                        this.audioCtx.resume().catch(() => {});
                    }
                }
            } catch (e) {}
        };

        // iOS WebKit / Android Chrome 오디오 잠금 해제 (User Gesture Unlocker)
        const unlockAudio = () => {
            try {
                this.silentAudio.play().catch(() => {});
                initAudioContext();
            } catch (e) {}
        };
        window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
        window.addEventListener('click', unlockAudio, { once: true });

        this._setupAudioListeners();
        this._setupMediaSession();
        this._initYouTubeAPI();
        this._initAdShield();

        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (this.isPlaying) {
                    try { this.silentAudio.play().catch(() => {}); } catch (e) {}
                    if (this.audioCtx && this.audioCtx.state === 'suspended') {
                        try { this.audioCtx.resume().catch(() => {}); } catch (e) {}
                    }
                    if (this.activeEngine === 'youtube' && this.ytPlayer) {
                        setTimeout(() => {
                            if (this.isPlaying && !this.isUserPaused && this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
                                try { this.ytPlayer.playVideo(); } catch (e) {}
                            }
                        }, 200);
                    }
                }
            } else {
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
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('visibilitychange', handleVisibilityChange);
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
                    let appOrigin = (window.location.origin && window.location.origin.startsWith('http')) 
                        ? window.location.origin 
                        : undefined;
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
                    if (appOrigin && !['localhost', '127.0.0.1', 'appassets.androidplatform.net'].includes(window.location.hostname) && window.location.protocol !== 'file:') {
                        pVars.origin = appOrigin;
                        pVars.widget_referrer = window.location.href;
                    }

                    this.ytPlayer = new window.YT.Player('m-youtube-hidden-player', {
                        height: '100%',
                        width: '100%',
                        host: 'https://www.youtube-nocookie.com',
                        playerVars: pVars,
                        events: {
                            onError: (event) => {
                                console.warn('[MobilePlayer] YouTube Player error event code:', event.data);
                                if (event.data === 150 || event.data === 101 || event.data === 153) {
                                    window.dispatchEvent(new CustomEvent('mobileplayer:error', {
                                        detail: { message: `"${this.currentSong?.title}"은(는) 유튜브 임베드 정책으로 인해 재생이 제한되었습니다. Wi-Fi로 PC 서버를 연동하거나 오프라인 저장을 이용해주세요.` }
                                    }));
                                    setTimeout(() => {
                                        if (this.queue.length > 1) {
                                            this.playNext();
                                        }
                                    }, 1500);
                                }
                            },
                            onReady: () => {
                                console.log('[MobilePlayer] YouTube Iframe API ready!');
                                this.isYtReady = true;
                                const iframe = document.querySelector('#m-youtube-hidden-player iframe') || document.getElementById('m-youtube-hidden-player');
                                if (iframe && iframe.tagName === 'IFRAME') {
                                    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                                    iframe.setAttribute('allowfullscreen', 'true');
                                }
                                if (this._pendingYtSong) {
                                    const pSong = this._pendingYtSong;
                                    const pStart = this._pendingYtStartTime || 0;
                                    this._pendingYtSong = null;
                                    this._pendingYtStartTime = 0;
                                    this._playWithYouTubeEngine(pSong, pStart);
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

                                    if (this.isAdShieldActive) {
                                        try {
                                            const vData = typeof this.ytPlayer.getVideoData === 'function' ? this.ytPlayer.getVideoData() : null;
                                            const dur = typeof this.ytPlayer.getDuration === 'function' ? this.ytPlayer.getDuration() : 0;
                                            const isCurrentVideo = vData && vData.video_id === this.currentSong?.youtubeId;
                                            const isAdDuration = (dur > 0 && dur <= 35 && this.currentSong?.duration > 60);
                                            if (isCurrentVideo && !isAdDuration) {
                                                this._handleAdFinished();
                                            }
                                        } catch (e) {}
                                    }
                                } else if (event.data === window.YT.PlayerState.PAUSED) {
                                    // 백그라운드 전환 또는 화면 잠금 시 브라우저가 유튜브를 강제 일시정지한 경우
                                    if (!this.isUserPaused) {
                                        console.log('[MobilePlayer] Background pause detected. Resuming playback with keep-alive audio session...');
                                        try { this.silentAudio.play().catch(() => {}); } catch (e) {}
                                        setTimeout(() => {
                                            if (!this.isUserPaused && this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
                                                try { this.ytPlayer.playVideo(); } catch (e) {}
                                            }
                                        }, 150);
                                        return;
                                    }
                                    this.isPlaying = false;
                                    try { this.silentAudio.pause(); } catch (e) {}
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

    // --- 제로 광고 스마트 쉴드 (Mobile Zero-Ad Smart Shield) ---
    _initAdShield() {
        window.addEventListener('message', (event) => {
            if (this.activeEngine !== 'youtube' || !this.ytPlayer) return;
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
                    this._handleAdDetected(info.duration || 0);
                } else if (info.adState === 0 || (info.videoData && this.currentSong && info.videoData.video_id === this.currentSong.youtubeId)) {
                    if (this.isAdShieldActive) {
                        this._handleAdFinished();
                    }
                }
            } catch (e) {}
        });
    }

    _handleAdDetected(adDuration = 0) {
        if (!this.isAdShieldActive) {
            this.isAdShieldActive = true;
        }

        // 1. 광고 음성 즉시 & 상시 100% 음소거 강제
        if (this.ytPlayer) {
            if (typeof this.ytPlayer.mute === 'function') {
                try { this.ytPlayer.mute(); } catch (e) {}
            }
            if (typeof this.ytPlayer.setVolume === 'function') {
                try { this.ytPlayer.setVolume(0); } catch (e) {}
            }
        }

        // 2. 광고 재생 속도 2배속 가속 유지
        if (this.ytPlayer && typeof this.ytPlayer.setPlaybackRate === 'function') {
            try { this.ytPlayer.setPlaybackRate(2); } catch (e) {}
        }

        // 3. 광고 즉시 및 주기적 스킵 시도 (600ms 간격 스킵 재시도)
        const now = Date.now();
        if (!this._lastAdSeekTime || (now - this._lastAdSeekTime > 600)) {
            this._lastAdSeekTime = now;
            if (this.ytPlayer && typeof this.ytPlayer.seekTo === 'function') {
                try {
                    const targetTime = adDuration > 0 ? adDuration + 1 : 99999;
                    this.ytPlayer.seekTo(targetTime, true);
                } catch (e) {}
            }
        }

        // 앨범 모드일 때는 UI 광고 이벤트 송출 차단 (영상 모드일 때만 비주얼 쉴드 표시)
        if (this.playerViewMode === 'video') {
            window.dispatchEvent(new CustomEvent('mobileplayer:adShieldState', { detail: { isAd: true, adDuration } }));
        }
    }

    _startAdShieldPolling() {
        if (this._adShieldPollTimer) {
            clearInterval(this._adShieldPollTimer);
            this._adShieldPollTimer = null;
        }
        const song = this.currentSong;
        let attempts = 0;
        this._adShieldPollTimer = setInterval(() => {
            attempts++;
            const player = this.ytPlayer;
            if (!player || !song || this.activeEngine !== 'youtube') {
                clearInterval(this._adShieldPollTimer);
                this._adShieldPollTimer = null;
                return;
            }

            try {
                const vData = (typeof player.getVideoData === 'function') ? player.getVideoData() : null;
                const pState = (typeof player.getPlayerState === 'function') ? player.getPlayerState() : null;
                const curTime = (typeof player.getCurrentTime === 'function') ? player.getCurrentTime() : 0;
                const dur = (typeof player.getDuration === 'function') ? player.getDuration() : 0;

                const isCurrentVideo = vData && vData.video_id === song.youtubeId;
                const isPlaying = pState === (window.YT?.PlayerState?.PLAYING ?? 1);
                const isAdVideo = vData && vData.video_id && vData.video_id !== song.youtubeId;
                const isAdDuration = (dur > 0 && dur <= 35 && song.duration > 60);

                if (isAdVideo || isAdDuration) {
                    try { player.mute(); } catch (e) {}
                    try { player.setVolume(0); } catch (e) {}
                    try { player.setPlaybackRate(2); } catch (e) {}
                    this.isAdShieldActive = true;
                    if (this.playerViewMode === 'video') {
                        window.dispatchEvent(new CustomEvent('mobileplayer:adShieldState', { detail: { isAd: true } }));
                    }
                    return;
                }

                if (isCurrentVideo && isPlaying && curTime >= 0) {
                    clearInterval(this._adShieldPollTimer);
                    this._adShieldPollTimer = null;
                    this._handleAdFinished();
                    return;
                }

                if (attempts > 80) { // 8초 경과 시
                    // 광고 영상이 여전히 재생 중이면 광고 소리가 터져나오지 않도록 음소거 유지
                    if (!isAdVideo) {
                        clearInterval(this._adShieldPollTimer);
                        this._adShieldPollTimer = null;
                        this._handleAdFinished();
                    }
                }
            } catch (e) {}
        }, 100);
    }

    _handleAdFinished() {
        if (this._adShieldPollTimer) {
            clearInterval(this._adShieldPollTimer);
            this._adShieldPollTimer = null;
        }
        if (!this.isAdShieldActive) return;
        this.isAdShieldActive = false;
        this._lastAdSeekTime = 0;

        // 1. 본곡 복귀 시 음소거 해제 및 재생 속도 복원
        if (this.ytPlayer) {
            try {
                if (typeof this.ytPlayer.setPlaybackRate === 'function') {
                    this.ytPlayer.setPlaybackRate(1);
                }
                if (typeof this.ytPlayer.unMute === 'function') {
                    this.ytPlayer.unMute();
                }
                if (typeof this.ytPlayer.setVolume === 'function') {
                    this.ytPlayer.setVolume(100);
                }
                // 본곡 시작 위치 복원
                if (this.currentSong && this.currentSong.start && typeof this.ytPlayer.getCurrentTime === 'function' && typeof this.ytPlayer.seekTo === 'function') {
                    const cur = this.ytPlayer.getCurrentTime();
                    if (cur < this.currentSong.start) {
                        this.ytPlayer.seekTo(this.currentSong.start, true);
                    }
                }
            } catch (e) {}
        }

        window.dispatchEvent(new CustomEvent('mobileplayer:adShieldState', { detail: { isAd: false } }));
    }

    // [Mobile Zero-Ad Smart Shield] 수동 및 강제 광고 탈출
    skipAd() {
        if (!this.ytPlayer) return;

        try {
            if (typeof this.ytPlayer.seekTo === 'function') {
                this.ytPlayer.seekTo(99999, true);
            }
        } catch (e) {}

        // 0.4초 후에도 여전히 광고 상태라면 본곡으로 재로드하여 강제 탈출
        setTimeout(() => {
            if (this.isAdShieldActive && this.currentSong && this.ytPlayer) {
                const startSec = this.currentSong.start || 0;
                if (typeof this.ytPlayer.loadVideoById === 'function') {
                    try {
                        this.ytPlayer.loadVideoById({
                            videoId: this.currentSong.youtubeId,
                            startSeconds: startSec
                        });
                        if (typeof this.ytPlayer.playVideo === 'function') this.ytPlayer.playVideo();
                    } catch (e) {}
                }
                this._handleAdFinished();
            }
        }, 400);
    }

    _startYtTimer() {
        this._stopYtTimer();
        this.ytUpdateTimer = setInterval(() => {
            if (this.activeEngine !== 'youtube' || !this.ytPlayer || !this.ytPlayer.getCurrentTime) return;

            // [Mobile Zero-Ad Smart Shield] 실시간 광고 상태 체크
            if (this.currentSong) {
                try {
                    const vData = typeof this.ytPlayer.getVideoData === 'function' ? this.ytPlayer.getVideoData() : null;
                    const curDur = typeof this.ytPlayer.getDuration === 'function' ? this.ytPlayer.getDuration() : 0;
                    const isAdByData = vData && (
                        vData.isAd === true ||
                        (vData.video_id && this.currentSong.youtubeId && vData.video_id !== this.currentSong.youtubeId)
                    );
                    const isAdByDur = (curDur > 0 && curDur <= 45 && this.currentSong.duration > 60);

                    if (isAdByData || isAdByDur) {
                        this._handleAdDetected(curDur);
                        return; // 광고 스킵 및 가속 처리 중에는 일반 타이머 대기
                    } else if (this.isAdShieldActive && vData && vData.video_id === this.currentSong.youtubeId) {
                        this._handleAdFinished();
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

    _playWithYouTubeEngine(song, startSecOverride) {
        if (!song) return;
        this.currentSong = song;
        if (window.AndroidBridge && typeof window.AndroidBridge.stopNativePlayback === 'function') {
            try { window.AndroidBridge.stopNativePlayback(); } catch (e) {}
        }
        this.activeEngine = 'youtube';
        this.isPlaying = true;
        this.isUserPaused = false;
        this.audio.pause();
        this.audio.src = '';
        this.isOfflinePlayback = false;
        this.isAdShieldActive = true;
        if (this.playerViewMode === 'video') {
            window.dispatchEvent(new CustomEvent('mobileplayer:adShieldState', { detail: { isAd: true } }));
        }

        const startSec = (typeof startSecOverride === 'number')
            ? startSecOverride
            : ((this.sabiMode && song.sabi && typeof song.sabi.start === 'number') ? song.sabi.start : 0);

        if (window.StorageManager && song && song.id) {
            window.StorageManager.addToHistory(song.id);
        }

        if (this.ytPlayer && this.isYtReady && this.ytPlayer.loadVideoById) {
            try {
                // 1. Mute-First: 즉시 0 볼륨 및 음소거 강제 (광고 소리 노출 원천 차단)
                if (typeof this.ytPlayer.mute === 'function') {
                    try { this.ytPlayer.mute(); } catch (e) {}
                }
                if (typeof this.ytPlayer.setVolume === 'function') {
                    try { this.ytPlayer.setVolume(0); } catch (e) {}
                }

                // 2. 비주얼 쉴드 즉시 작동 (광고 화면 은폐 - 영상 모드일 때만 표시)
                this.isAdShieldActive = true;
                if (this.playerViewMode === 'video') {
                    window.dispatchEvent(new CustomEvent('mobileplayer:adShieldState', { detail: { isAd: true } }));
                }

                this.ytPlayer.loadVideoById({
                    videoId: song.youtubeId,
                    startSeconds: startSec
                });
                this.ytPlayer.playVideo();
                try { this.silentAudio.play().catch(() => {}); } catch (e) {}

                // 3. 100ms 고빈도 감시 가동 (본곡 감지 즉시 부드럽게 언뮤트)
                this._startAdShieldPolling();
            } catch (e) {
                console.warn('[YT Engine error]', e);
            }
        } else {
            console.log('[MobilePlayer] YouTube Player not ready yet, queuing song:', song.title);
            this._pendingYtSong = song;
            this._pendingYtStartTime = startSec;
        }

        this._updateMediaSessionMetadata();
        window.dispatchEvent(new CustomEvent('mobileplayer:trackChanged', {
            detail: {
                song: this.currentSong,
                isOffline: false
            }
        }));
        window.dispatchEvent(new CustomEvent('mobileplayer:stateChanged', {
            detail: { isPlaying: true }
        }));
    }

    _setupMediaSession() {
        if (!('mediaSession' in navigator)) return;

        navigator.mediaSession.setActionHandler('play', () => {
            try {
                if (this.audioCtx && this.audioCtx.state === 'suspended') {
                    this.audioCtx.resume().catch(() => {});
                }
                this.silentAudio.play().catch(() => {});
            } catch (e) {}
            this.togglePlay();
        });
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

        // iOS WebKit / Android: 비동기(await) 진입 전 사용자 터치 제스처 권한을 동기적으로 선점
        try {
            this.silentAudio.play().catch(() => {});
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume().catch(() => {});
            }
        } catch (e) {}

        // 새 곡을 재생할 때는 영상 모드 광고 세션 전파를 방지하기 위해 기본 'art'(앨범 모드)로 클린 초기화
        if (isUserInitiated || this.playerViewMode === 'video') {
            this.playerViewMode = 'art';
            window.dispatchEvent(new CustomEvent('mobileplayer:viewModeChanged', { detail: { mode: 'art' } }));
        }

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
        this.isUserPaused = false;

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
            if (this.playerViewMode === 'video') {
                this._playWithYouTubeEngine(song);
                return;
            }
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
            if (this.playerViewMode === 'video') {
                this._playWithYouTubeEngine(song);
                return;
            }
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

        // 웹 버전 환경: 항상 유튜브 엔진으로 다이렉트 스트리밍 (오프라인 제외)
        console.log('[MobilePlayer] Web mode: Playing directly via YouTube engine');
        this._playWithYouTubeEngine(song);
        return;

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
        if (this.playerViewMode !== 'video' && this.activeEngine === 'native' && window.AndroidBridge && typeof window.AndroidBridge.togglePlayNative === 'function') {
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
        if (this.playerViewMode !== 'video' && this.activeEngine === 'native' && window.AndroidBridge && typeof window.AndroidBridge.playNextNative === 'function') {
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
        if (this.playerViewMode !== 'video' && this.activeEngine === 'native' && window.AndroidBridge && typeof window.AndroidBridge.playPrevNative === 'function') {
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
        if (this.playerViewMode !== 'video' && this.activeEngine === 'native' && window.AndroidBridge && typeof window.AndroidBridge.seekToNative === 'function') {
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
        if (this.playerViewMode !== 'video' && this.activeEngine === 'native') {
            return this.nativeDuration || this.currentSong?.duration || 0;
        }
        if (this.activeEngine === 'youtube' && this.ytPlayer && this.ytPlayer.getDuration) {
            return this.ytPlayer.getDuration() || this.currentSong?.duration || 0;
        }
        return this.audio.duration || this.currentSong?.duration || 0;
    }

    switchViewMode(mode) {
        this.playerViewMode = mode;
        if (!this.currentSong) return;

        if (mode === 'video') {
            // 영상 모드 전환: 네이티브 또는 일반 오디오가 재생 중이었다면 현재 위치를 유지하며 유튜브 영상 엔진으로 전환
            let curSec = 0;
            if (this.activeEngine === 'native') {
                curSec = this.nativeCurrentTime || 0;
                if (window.AndroidBridge && typeof window.AndroidBridge.stopNativePlayback === 'function') {
                    try { window.AndroidBridge.stopNativePlayback(); } catch (e) {}
                }
                this._playWithYouTubeEngine(this.currentSong, curSec);
            } else if (this.activeEngine === 'audio') {
                curSec = this.audio.currentTime || 0;
                this.audio.pause();
                this._playWithYouTubeEngine(this.currentSong, curSec);
            } else if (this.activeEngine === 'youtube') {
                if (this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
                    try { this.ytPlayer.playVideo(); } catch (e) {}
                }
            }
        } else if (mode === 'art') {
            // 앨범 아트 모드 전환: 안드로이드 네이티브 환경인 경우 절전 및 백그라운드 재생 최적화 네이티브 서비스로 복귀
            if (window.AndroidBridge && typeof window.AndroidBridge.playIndexNative === 'function') {
                const curSec = (this.activeEngine === 'youtube' && this.ytPlayer && typeof this.ytPlayer.getCurrentTime === 'function')
                    ? (this.ytPlayer.getCurrentTime() || 0)
                    : (this.audio.currentTime || 0);

                if (this.activeEngine === 'youtube' && this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
                    try { this.ytPlayer.pauseVideo(); } catch (e) {}
                }
                this._stopYtTimer();

                this.activeEngine = 'native';
                window.AndroidBridge.playIndexNative(this.queueIndex);
                if (curSec > 0 && typeof window.AndroidBridge.seekToNative === 'function') {
                    setTimeout(() => {
                        try { window.AndroidBridge.seekToNative(Math.floor(curSec)); } catch (e) {}
                    }, 400);
                }
            } else {
                // 웹 브라우저 환경: 광고 오버레이 및 배너 즉시 리셋하고 앨범 모드 복귀
                this.isAdShieldActive = false;
                window.dispatchEvent(new CustomEvent('mobileplayer:adShieldState', { detail: { isAd: false } }));
                window.dispatchEvent(new CustomEvent('mobileplayer:viewModeChanged', { detail: { mode: 'art' } }));
            }
        }
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
