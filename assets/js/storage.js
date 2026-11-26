/**
 * StellPlay - 로컬 스토리지 관리 모듈
 * 즐겨찾기(하트), 플레이리스트 생성/편집, 최근 재생 기록, 플레이어 설정
 */

const STORAGE_KEYS = {
    FAVORITES: 'stellplay_favorites',
    PLAYLISTS: 'stellplay_playlists',
    HISTORY: 'stellplay_history',
    SETTINGS: 'stellplay_settings',
    LAST_STATE: 'stellplay_last_state',
    SONG_OVERRIDES: 'stellplay_song_overrides',
    AUTO_SONGS: 'stellplay_auto_songs',
    LAST_SYNC: 'stellplay_last_sync'
};

const StorageManager = {
    // 인메모리 캐시 (매 프레임/렌더링마다 localStorage JSON.parse 반복 호출 완벽 제거)
    _memCache: {
        favorites: null,
        playlists: null,
        history: null,
        settings: null,
        customSabis: null,
        customSongs: null,
        songOverrides: null,
        autoSongs: null,
        hiddenSongs: null
    },

    _invalidate(cacheKey, affectsCatalog = false) {
        if (cacheKey && Object.prototype.hasOwnProperty.call(this._memCache, cacheKey)) {
            this._memCache[cacheKey] = null;
        }
        if (affectsCatalog && typeof window !== 'undefined' && typeof window.invalidateSongsCache === 'function') {
            window.invalidateSongsCache();
        }
    },

    // --- 즐겨찾기 (Favorites) ---
    getFavorites() {
        if (this._memCache.favorites !== null) return this._memCache.favorites;
        try {
            const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
            this._memCache.favorites = data ? JSON.parse(data) : [];
        } catch (e) {
            this._memCache.favorites = [];
        }
        return this._memCache.favorites;
    },

    isFavorite(songId) {
        const favs = this.getFavorites();
        return favs.includes(songId);
    },

    toggleFavorite(songId) {
        const favs = [...this.getFavorites()];
        const index = favs.indexOf(songId);
        let isFav = false;
        if (index > -1) {
            favs.splice(index, 1);
            isFav = false;
        } else {
            favs.unshift(songId);
            isFav = true;
        }
        this._memCache.favorites = favs;
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
        window.dispatchEvent(new CustomEvent('stellplay:favoritesUpdated', { detail: { songId, isFavorite: isFav } }));
        this.triggerServerBackup();
        return isFav;
    },

    // --- 플레이리스트 (Playlists) & 최근 감상한 곡 기록 ---
    getHistoryPlaylist() {
        const hist = this.getHistory();
        return {
            id: 'pl-history',
            name: '최근 감상한 곡',
            isHistory: true,
            isPermanent: true,
            createdAt: null,
            songIds: hist
        };
    },

    getPlaylists(includeHistory = true) {
        try {
            let userLists = this._memCache.playlists;
            if (userLists === null) {
                const data = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
                if (!data) {
                    // 기본 추천 플레이리스트 자동 초기화 (이모지 미포함)
                    userLists = [
                        {
                            id: 'pl-originals',
                            name: '스텔라이브 명곡 오리지널선',
                            createdAt: new Date().toISOString(),
                            songIds: ['stel-milkyway', 'yuni-how-to-be-mine', 'kanna-the-last-flower', 'stel-stars-align', 'stel-our-tales', 'stel-hit-on-shot']
                        },
                        {
                            id: 'pl-chill',
                            name: '감성 충만 힐링 트랙',
                            createdAt: new Date().toISOString(),
                            songIds: ['stel-dear-my-fairy', 'hina-dream-signal', 'mashiro-spring-dream', 'tabi-journey', 'stel-heart-score']
                        }
                    ];
                    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(userLists));
                } else {
                    userLists = JSON.parse(data).filter(p => p && p.id !== 'pl-history');
                    let healed = false;
                    userLists.forEach(p => {
                        if (p.id === 'pl-originals' && typeof p.name === 'string' && /^✨\s*/.test(p.name)) {
                            p.name = p.name.replace(/^✨\s*/, '').trim() || '스텔라이브 명곡 오리지널선';
                            healed = true;
                        } else if (p.id === 'pl-chill' && typeof p.name === 'string' && /^🌙\s*/.test(p.name)) {
                            p.name = p.name.replace(/^🌙\s*/, '').trim() || '감성 충만 힐링 트랙';
                            healed = true;
                        }
                    });
                    if (healed) {
                        try { localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(userLists)); } catch (_) {}
                    }
                }
                this._memCache.playlists = userLists;
            }

            if (includeHistory) {
                return [this.getHistoryPlaylist(), ...userLists];
            }
            return userLists;
        } catch (e) {
            if (includeHistory) return [this.getHistoryPlaylist()];
            return [];
        }
    },

    createPlaylist(name, songIds = []) {
        if (!name || !name.trim()) return null;
        const playlists = [...this.getPlaylists(false)];
        const newPlaylist = {
            id: 'pl-' + Date.now(),
            name: name.trim(),
            createdAt: new Date().toISOString(),
            songIds: Array.isArray(songIds) ? [...songIds] : []
        };
        playlists.push(newPlaylist);
        this._memCache.playlists = playlists;
        localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
        window.dispatchEvent(new CustomEvent('stellplay:playlistsUpdated'));
        this.triggerServerBackup();
        return newPlaylist;
    },

    deletePlaylist(playlistId) {
        if (playlistId === 'pl-history') return false; // 최근 감상 기록은 영구 고정으로 삭제 불가
        let playlists = this.getPlaylists(false).filter(p => p.id !== playlistId);
        this._memCache.playlists = playlists;
        localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
        window.dispatchEvent(new CustomEvent('stellplay:playlistsUpdated'));
        this.triggerServerBackup();
        return true;
    },

    addSongToPlaylist(playlistId, songId) {
        return this.addSongsToPlaylist(playlistId, [songId]) > 0;
    },

    addSongsToPlaylist(playlistId, newSongIds) {
        if (playlistId === 'pl-history') return 0; // 기록용 재생목록에는 외부에서 임의 추가 불가
        if (!Array.isArray(newSongIds) || newSongIds.length === 0) return 0;

        if (playlistId === 'pl-favorites') {
            const favs = [...this.getFavorites()];
            let added = 0;
            newSongIds.forEach(id => {
                if (!favs.includes(id)) {
                    favs.unshift(id);
                    added++;
                }
            });
            if (added > 0) {
                this._memCache.favorites = favs;
                localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
                window.dispatchEvent(new CustomEvent('stellplay:favoritesUpdated'));
                this.triggerServerBackup();
            }
            return added;
        }

        const playlists = this.getPlaylists(false);
        const pl = playlists.find(p => p.id === playlistId);
        if (pl) {
            let addedCount = 0;
            newSongIds.forEach(id => {
                if (!pl.songIds.includes(id)) {
                    pl.songIds.push(id);
                    addedCount++;
                }
            });
            if (addedCount > 0) {
                this._memCache.playlists = playlists;
                localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
                window.dispatchEvent(new CustomEvent('stellplay:playlistsUpdated'));
                this.triggerServerBackup();
            }
            return addedCount;
        }
        return 0;
    },

    removeSongFromPlaylist(playlistId, songId) {
        if (playlistId === 'pl-history') {
            return this.removeFromHistory(songId);
        }
        const playlists = this.getPlaylists(false);
        const pl = playlists.find(p => p.id === playlistId);
        if (pl) {
            pl.songIds = pl.songIds.filter(id => id !== songId);
            this._memCache.playlists = playlists;
            localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
            window.dispatchEvent(new CustomEvent('stellplay:playlistsUpdated'));
            this.triggerServerBackup();
            return true;
        }
        return false;
    },

    reorderPlaylistSongs(playlistId, fromIndex, toIndex) {
        if (playlistId === 'pl-favorites' || playlistId === 'card-playlist-favorites') {
            const favs = [...this.getFavorites()];
            if (fromIndex >= 0 && fromIndex < favs.length && toIndex >= 0 && toIndex < favs.length) {
                const [moved] = favs.splice(fromIndex, 1);
                favs.splice(toIndex, 0, moved);
                this._memCache.favorites = favs;
                localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
                window.dispatchEvent(new CustomEvent('stellplay:favoritesUpdated'));
                this.triggerServerBackup();
                return true;
            }
            return false;
        }
        const playlists = this.getPlaylists(false);
        const pl = playlists.find(p => p.id === playlistId);
        if (!pl || !Array.isArray(pl.songIds)) return false;
        if (fromIndex >= 0 && fromIndex < pl.songIds.length && toIndex >= 0 && toIndex < pl.songIds.length) {
            const [moved] = pl.songIds.splice(fromIndex, 1);
            pl.songIds.splice(toIndex, 0, moved);
            this._memCache.playlists = playlists;
            localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
            window.dispatchEvent(new CustomEvent('stellplay:playlistsUpdated'));
            this.triggerServerBackup();
            return true;
        }
        return false;
    },

    // --- 최근 재생 기록 (History, 최대 100곡) ---
    getHistory() {
        if (this._memCache.history !== null) return this._memCache.history;
        try {
            const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
            this._memCache.history = data ? JSON.parse(data) : [];
        } catch (e) {
            this._memCache.history = [];
        }
        return this._memCache.history;
    },

    addToHistory(songId) {
        if (!songId) return;
        let hist = this.getHistory().filter(id => id !== songId);
        hist.unshift(songId);
        if (hist.length > 100) hist = hist.slice(0, 100); // 최대 100곡 보관
        this._memCache.history = hist;
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(hist));
        window.dispatchEvent(new CustomEvent('stellplay:historyUpdated', { detail: { songId, history: hist } }));
        window.dispatchEvent(new CustomEvent('stellplay:playlistsUpdated'));
        this.triggerServerBackup();
    },

    removeFromHistory(songId) {
        const prev = this.getHistory();
        const hist = prev.filter(id => id !== songId);
        if (hist.length !== prev.length) {
            this._memCache.history = hist;
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(hist));
            window.dispatchEvent(new CustomEvent('stellplay:historyUpdated', { detail: { removedSongId: songId, history: hist } }));
            window.dispatchEvent(new CustomEvent('stellplay:playlistsUpdated'));
            return true;
        }
        return false;
    },

    clearHistory() {
        this._memCache.history = [];
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
        window.dispatchEvent(new CustomEvent('stellplay:historyUpdated', { detail: { history: [] } }));
        window.dispatchEvent(new CustomEvent('stellplay:playlistsUpdated'));
        return true;
    },

    // --- 플레이어 설정 및 상태 (Settings) ---
    getSettings() {
        if (this._memCache.settings !== null) return this._memCache.settings;
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            this._memCache.settings = data ? JSON.parse(data) : {
                volume: 50,
                repeatMode: 'all', // 'off', 'all', 'one'
                isShuffle: false,
                sabiMode: false,
                crossfade: 0,
                engineMode: 'audio',
                sabiDuration: 35,
                activeMemberTheme: 'all',
                theme: 'dark'
            };
        } catch (e) {
            this._memCache.settings = {
                volume: 50,
                repeatMode: 'all',
                isShuffle: false,
                sabiMode: false,
                crossfade: 0,
                engineMode: 'audio',
                sabiDuration: 35,
                activeMemberTheme: 'all',
                theme: 'dark'
            };
        }
        return this._memCache.settings;
    },

    saveSettings(partialSettings) {
        try {
            const current = this.getSettings();
            const updated = { ...current, ...partialSettings };
            this._memCache.settings = updated;
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
            this.triggerServerBackup();
            return updated;
        } catch (e) {
            return null;
        }
    },

    setSetting(key, value) {
        return this.saveSettings({ [key]: value });
    },

    // --- 사용자 맞춤 사비 (Custom Sabi) ---
    getCustomSabis() {
        if (this._memCache.customSabis !== null) return this._memCache.customSabis;
        try {
            const data = localStorage.getItem('stellplay_custom_sabi');
            this._memCache.customSabis = data ? JSON.parse(data) : {};
        } catch (e) {
            this._memCache.customSabis = {};
        }
        return this._memCache.customSabis;
    },

    saveCustomSabi(songId, sabiObj) {
        try {
            const sabis = { ...this.getCustomSabis(), [songId]: sabiObj };
            this._memCache.customSabis = sabis;
            localStorage.setItem('stellplay_custom_sabi', JSON.stringify(sabis));
            if (typeof window !== 'undefined' && typeof window.invalidateSongsCache === 'function') {
                window.invalidateSongsCache();
            }
            window.dispatchEvent(new CustomEvent('stellplay:sabiUpdated', { detail: { songId, sabi: sabiObj } }));
            this.triggerServerBackup();
            return sabiObj;
        } catch (e) {
            console.error('Failed to save custom sabi', e);
            return null;
        }
    },

    // --- 사용자 직접 추가 곡 (Custom Songs) ---
    getCustomSongs() {
        if (this._memCache.customSongs !== null) return this._memCache.customSongs;
        try {
            const data = localStorage.getItem('stellplay_custom_songs');
            this._memCache.customSongs = data ? JSON.parse(data) : [];
        } catch (e) {
            this._memCache.customSongs = [];
        }
        return this._memCache.customSongs;
    },

    addCustomSong(song) {
        try {
            const songs = [song, ...this.getCustomSongs()];
            this._memCache.customSongs = songs;
            localStorage.setItem('stellplay_custom_songs', JSON.stringify(songs));
            this._invalidate(null, true);
            this.triggerServerBackup();
            return true;
        } catch (e) {
            console.error('Failed to save custom song', e);
            return false;
        }
    },

    deleteCustomSong(songId) {
        try {
            const songs = this.getCustomSongs().filter(s => s.id !== songId);
            this._memCache.customSongs = songs;
            localStorage.setItem('stellplay_custom_songs', JSON.stringify(songs));
            this._invalidate(null, true);
            this.triggerServerBackup();
            return true;
        } catch (e) {
            return false;
        }
    },

    // --- 곡 정보 사용자 직접 수정 (Song Metadata Overrides) ---
    getSongOverrides() {
        if (this._memCache.songOverrides !== null) return this._memCache.songOverrides;
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SONG_OVERRIDES);
            const parsed = data ? JSON.parse(data) : {};
            let healed = false;
            for (const k of Object.keys(parsed)) {
                const ov = parsed[k];
                if (ov && typeof ov.title === 'string') {
                    if (/打上花火\s*\(\s*쏘아올린\s*불꽃\s*\)|^쏘아올린\s*불꽃$|^타상연화$/i.test(ov.title.trim())) {
                        ov.title = '打上花火 (타상연화)';
                        healed = true;
                    } else if (/^혁명도중$|^革命道中$/i.test(ov.title.trim())) {
                        ov.title = '革命道中 (혁명도중)';
                        healed = true;
                    }
                }
            }
            if (healed) {
                try { localStorage.setItem(STORAGE_KEYS.SONG_OVERRIDES, JSON.stringify(parsed)); } catch (e) {}
            }
            this._memCache.songOverrides = parsed;
            return parsed;
        } catch (e) {
            this._memCache.songOverrides = {};
            return {};
        }
    },

    saveSongOverride(songId, overrideData) {
        try {
            const overrides = { ...this.getSongOverrides() };
            overrides[songId] = { ...(overrides[songId] || {}), ...overrideData };
            this._memCache.songOverrides = overrides;
            localStorage.setItem(STORAGE_KEYS.SONG_OVERRIDES, JSON.stringify(overrides));
            this._invalidate(null, true);
            window.dispatchEvent(new CustomEvent('stellplay:songOverrideUpdated', {
                detail: { songId, override: overrides[songId] }
            }));
            this.triggerServerBackup();
            return overrides[songId];
        } catch (e) {
            console.error('Failed to save song override', e);
            return null;
        }
    },

    resetSongOverride(songId) {
        try {
            const overrides = { ...this.getSongOverrides() };
            if (overrides[songId]) {
                delete overrides[songId];
                this._memCache.songOverrides = overrides;
                localStorage.setItem(STORAGE_KEYS.SONG_OVERRIDES, JSON.stringify(overrides));
                this._invalidate(null, true);
                window.dispatchEvent(new CustomEvent('stellplay:songOverrideReset', {
                    detail: { songId }
                }));
                this.triggerServerBackup();
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    },

    // --- 백그라운드 자동 감지 신곡 (Auto-Detected Songs) ---
    getAutoDetectedSongs() {
        if (this._memCache.autoSongs !== null) return this._memCache.autoSongs;
        try {
            const data = localStorage.getItem(STORAGE_KEYS.AUTO_SONGS);
            if (!data) {
                this._memCache.autoSongs = [];
                return [];
            }
            let songs = JSON.parse(data);
            if (!Array.isArray(songs)) {
                this._memCache.autoSongs = [];
                return [];
            }
            songs = songs.map(s => {
                if (s && s.title && (s.title.includes('Where Stars Begin') || s.title.includes('Where stars begin') || s.id === 'auto-EKEts5IShas')) {
                    s.title = '별이 시작되는 곳';
                } else if (s && s.title && typeof window !== 'undefined' && typeof window.cleanAndKoreanizeTitle === 'function') {
                    s.title = window.cleanAndKoreanizeTitle(s.title, s.rawTitle || '');
                } else if (s && s.title && /타상연화|打上花火|쏘아올린\s*불꽃/i.test(s.title)) {
                    s.title = '打上花火 (타상연화)';
                } else if (s && s.title && /혁명도중|革命道中/i.test(s.title)) {
                    s.title = '革命道中 (혁명도중)';
                }
                return s;
            });

            const isNonMusicTrack = (s) => {
                if (!s) return true;
                const dur = parseInt(s.duration, 10) || 0;
                if (dur > 600) return true;
                const title = (s.title || '').toLowerCase();
                const rawTitle = (s.rawTitle || '').toLowerCase();
                const combined = `${title} ${rawTitle}`;
                const nonSongKeywords = [
                    'hot clip', 'hotclip', 'hot-clip', 'stellar hot', 'stella hot', 'stellive hot',
                    '핫클립', '[클립]', '(클립)', 'clip]', '[clip',
                    '주년', '기념 방송', '기념방송', '다시보기', '풀영상', '풀버전', '잡담', '공지', '안내',
                    '하이라이트', 'highlight', '비하인드', 'behind', 'q&a', 'qna', 'vlog', '브이로그',
                    'asmr', '라디오', '전야제', '콘서트', '신규 의상', '신의상', '수영복', '여름 휴가',
                    '여름휴가', '의상 공개', '티저', 'teaser', 'trailer', '트레일러'
                ];
                return nonSongKeywords.some(kw => combined.includes(kw));
            };

            const defaultYtIds = (typeof window !== 'undefined' && Array.isArray(window.DEFAULT_SONGS))
                ? new Set(window.DEFAULT_SONGS.map(s => s.youtubeId).filter(Boolean))
                : null;
            const defaultIds = (typeof window !== 'undefined' && Array.isArray(window.DEFAULT_SONGS))
                ? new Set(window.DEFAULT_SONGS.map(s => s.id).filter(Boolean))
                : null;
            const seenYt = new Set();
            const filtered = songs.filter(s => {
                if (isNonMusicTrack(s)) return false;
                const ytid = s.youtubeId || (s.id && s.id.startsWith('auto-') ? s.id.replace('auto-', '') : null);
                if (ytid && defaultYtIds && defaultYtIds.has(ytid)) return false;
                if (s.id && defaultIds && defaultIds.has(s.id)) return false;
                if (ytid && seenYt.has(ytid)) return false;
                if (ytid) seenYt.add(ytid);
                return true;
            });
            if (filtered.length !== songs.length) {
                localStorage.setItem(STORAGE_KEYS.AUTO_SONGS, JSON.stringify(filtered));
                songs = filtered;
            }
            this._memCache.autoSongs = songs;
            return songs;
        } catch (e) {
            this._memCache.autoSongs = [];
            return [];
        }
    },

    addAutoDetectedSongs(newSongs) {
        if (!newSongs || newSongs.length === 0) return [];
        try {
            const isNonMusicTrack = (s) => {
                if (!s) return true;
                const dur = parseInt(s.duration, 10) || 0;
                if (dur > 600) return true;
                const title = (s.title || '').toLowerCase();
                const rawTitle = (s.rawTitle || '').toLowerCase();
                const combined = `${title} ${rawTitle}`;
                const nonSongKeywords = [
                    'hot clip', 'hotclip', 'hot-clip', 'stellar hot', 'stella hot', 'stellive hot',
                    '핫클립', '[클립]', '(클립)', 'clip]', '[clip',
                    '주년', '기념 방송', '기념방송', '다시보기', '풀영상', '풀버전', '잡담', '공지', '안내',
                    '하이라이트', 'highlight', '비하인드', 'behind', 'q&a', 'qna', 'vlog', '브이로그',
                    'asmr', '라디오', '전야제', '콘서트', '신규 의상', '신의상', '수영복', '여름 휴가',
                    '여름휴가', '의상 공개', '티저', 'teaser', 'trailer', '트레일러'
                ];
                return nonSongKeywords.some(kw => combined.includes(kw));
            };

            const current = this.getAutoDetectedSongs();
            const existingIds = new Set(current.map(s => s.id));
            const existingYtIds = new Set(current.map(s => s.youtubeId).filter(Boolean));

            if (typeof window !== 'undefined' && Array.isArray(window.DEFAULT_SONGS)) {
                window.DEFAULT_SONGS.forEach(s => {
                    if (s.id) existingIds.add(s.id);
                    if (s.youtubeId) existingYtIds.add(s.youtubeId);
                });
            }

            const toAdd = [];
            for (const s of newSongs) {
                if (isNonMusicTrack(s)) continue;
                const ytid = s.youtubeId || (s.id && s.id.startsWith('auto-') ? s.id.replace('auto-', '') : s.id);
                const sid = s.id || `auto-${ytid}`;
                if (!existingIds.has(sid) && (!ytid || !existingYtIds.has(ytid))) {
                    existingIds.add(sid);
                    if (ytid) existingYtIds.add(ytid);
                    toAdd.push({ ...s, id: sid, youtubeId: ytid, isAutoAdded: true });
                }
            }
            if (toAdd.length > 0) {
                const updated = [...toAdd, ...current];
                this._memCache.autoSongs = updated;
                localStorage.setItem(STORAGE_KEYS.AUTO_SONGS, JSON.stringify(updated));
                this._invalidate(null, true);
                window.dispatchEvent(new CustomEvent('stellplay:newSongsAdded', {
                    detail: { addedSongs: toAdd }
                }));
            }
            return toAdd;
        } catch (e) {
            console.error('Failed to save auto-detected songs', e);
            return [];
        }
    },

    // --- 동기화 쿨다운 타임스탬프 (12시간) ---
    getLastSyncTime() {
        try {
            const t = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
            return t ? parseInt(t, 10) : 0;
        } catch (e) {
            return 0;
        }
    },

    setLastSyncTime(timestamp = Date.now()) {
        try {
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
        } catch (e) {}
    },

    // --- 숨긴 곡 목록 (Hidden / Deleted Songs) ---
    getHiddenSongs() {
        if (this._memCache.hiddenSongs !== null) return this._memCache.hiddenSongs;
        try {
            const data = localStorage.getItem('stellplay_hidden_songs');
            this._memCache.hiddenSongs = data ? JSON.parse(data) : [];
        } catch (e) {
            this._memCache.hiddenSongs = [];
        }
        return this._memCache.hiddenSongs;
    },

    hideSong(songId) {
        try {
            const list = [...this.getHiddenSongs()];
            if (!list.includes(songId)) {
                list.push(songId);
                this._memCache.hiddenSongs = list;
                localStorage.setItem('stellplay_hidden_songs', JSON.stringify(list));
                this._invalidate(null, true);
                window.dispatchEvent(new CustomEvent('stellplay:songHidden', { detail: { songId } }));
            }
            return true;
        } catch (e) {
            return false;
        }
    },

    unhideSong(songId) {
        try {
            const list = this.getHiddenSongs().filter(id => id !== songId);
            this._memCache.hiddenSongs = list;
            localStorage.setItem('stellplay_hidden_songs', JSON.stringify(list));
            this._invalidate(null, true);
            window.dispatchEvent(new CustomEvent('stellplay:songUnhidden', { detail: { songId } }));
            return true;
        } catch (e) {
            return false;
        }
    },

    restoreAllHiddenSongs() {
        try {
            this._memCache.hiddenSongs = [];
            localStorage.removeItem('stellplay_hidden_songs');
            this._invalidate(null, true);
            window.dispatchEvent(new CustomEvent('stellplay:allHiddenSongsRestored'));
            this.triggerServerBackup();
            return true;
        } catch (e) {
            return false;
        }
    },

    // --- 서버 파일 동기화 & 영구 백업 (/api/user-data) ---
    _backupTimer: null,
    triggerServerBackup() {
        if (this._backupTimer) clearTimeout(this._backupTimer);
        this._backupTimer = setTimeout(() => {
            this.saveToServer();
        }, 1000);
    },

    async saveToServer() {
        const isLocal = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (!isLocal) return;
        try {
            const payload = {
                favorites: this.getFavorites(),
                playlists: this.getPlaylists(),
                history: this.getHistory(),
                settings: this.getSettings(),
                customSabis: this.getCustomSabis(),
                customSongs: this.getCustomSongs(),
                songOverrides: this.getSongOverrides(),
                hiddenSongs: this.getHiddenSongs(),
                updatedAt: new Date().toISOString()
            };
            await fetch('/api/user-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            // 오프라인이거나 서버 없을 시 정상 패스
        }
    },

    async syncWithServer() {
        const isLocal = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (!isLocal) return;
        try {
            const resp = await fetch('/api/user-data');
            if (!resp.ok) return;
            const data = await resp.json();
            if (!data || Object.keys(data).length === 0) return;

            let needReload = false;

            // 1. 플레이리스트 복원 / 병합
            if (Array.isArray(data.playlists) && data.playlists.length > 0) {
                const local = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
                if (!local || JSON.parse(local).length <= 2) {
                    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(data.playlists));
                    this._memCache.playlists = null;
                    needReload = true;
                }
            }

            // 1.1 최근 감상 기록 복원
            if (Array.isArray(data.history) && data.history.length > 0) {
                const local = localStorage.getItem(STORAGE_KEYS.HISTORY);
                if (!local || JSON.parse(local).length === 0) {
                    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
                    this._memCache.history = null;
                    needReload = true;
                }
            }

            // 2. 즐겨찾기 복원
            if (Array.isArray(data.favorites) && data.favorites.length > 0) {
                const local = localStorage.getItem(STORAGE_KEYS.FAVORITES);
                if (!local || JSON.parse(local).length === 0) {
                    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(data.favorites));
                    this._memCache.favorites = null;
                    needReload = true;
                }
            }

            // 3. 설정 복원
            if (data.settings && typeof data.settings === 'object') {
                const local = localStorage.getItem(STORAGE_KEYS.SETTINGS);
                if (!local) {
                    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
                    this._memCache.settings = null;
                }
            }

            // 4. 사비 / 곡 수정 복원
            if (data.customSabis) {
                const local = localStorage.getItem('stellplay_custom_sabi');
                if (!local) {
                    localStorage.setItem('stellplay_custom_sabi', JSON.stringify(data.customSabis));
                    this._memCache.customSabis = null;
                }
            }
            if (data.songOverrides) {
                const local = localStorage.getItem(STORAGE_KEYS.SONG_OVERRIDES);
                if (!local) {
                    localStorage.setItem(STORAGE_KEYS.SONG_OVERRIDES, JSON.stringify(data.songOverrides));
                    this._memCache.songOverrides = null;
                }
            }
            if (data.customSongs) {
                const local = localStorage.getItem('stellplay_custom_songs');
                if (!local) {
                    localStorage.setItem('stellplay_custom_songs', JSON.stringify(data.customSongs));
                    this._memCache.customSongs = null;
                }
            }

            this._invalidate(null, true);
            if (needReload) {
                window.dispatchEvent(new CustomEvent('stellplay:playlistsUpdated'));
                window.dispatchEvent(new CustomEvent('stellplay:favoritesUpdated', { detail: {} }));
            }
        } catch (e) {
            // 오프라인 패스
        }
    }
};

window.StorageManager = StorageManager;

if (typeof window !== 'undefined') {
    window.addEventListener('storage', () => {
        Object.keys(StorageManager._memCache).forEach(k => { StorageManager._memCache[k] = null; });
        if (typeof window.invalidateSongsCache === 'function') window.invalidateSongsCache();
    });
}

// 백그라운드 서버 데이터 동기화 자동 시작
try {
    StorageManager.syncWithServer();
} catch (e) {}
