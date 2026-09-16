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
    // --- 즐겨찾기 (Favorites) ---
    getFavorites() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    isFavorite(songId) {
        const favs = this.getFavorites();
        return favs.includes(songId);
    },

    toggleFavorite(songId) {
        let favs = this.getFavorites();
        const index = favs.indexOf(songId);
        let isFav = false;
        if (index > -1) {
            favs.splice(index, 1);
            isFav = false;
        } else {
            favs.unshift(songId);
            isFav = true;
        }
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
            name: '🕒 최근 감상한 곡',
            isHistory: true,
            isPermanent: true,
            createdAt: null,
            songIds: hist
        };
    },

    getPlaylists(includeHistory = true) {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
            let userLists = [];
            if (!data) {
                // 기본 추천 플레이리스트 자동 초기화
                userLists = [
                    {
                        id: 'pl-originals',
                        name: '✨ 스텔라이브 명곡 오리지널선',
                        createdAt: new Date().toISOString(),
                        songIds: ['stel-milkyway', 'yuni-how-to-be-mine', 'kanna-the-last-flower', 'stel-stars-align', 'stel-our-tales', 'stel-hit-on-shot']
                    },
                    {
                        id: 'pl-chill',
                        name: '🌙 감성 충만 힐링 트랙',
                        createdAt: new Date().toISOString(),
                        songIds: ['stel-dear-my-fairy', 'hina-dream-signal', 'mashiro-spring-dream', 'tabi-journey', 'stel-heart-score']
                    }
                ];
                localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(userLists));
            } else {
                userLists = JSON.parse(data).filter(p => p && p.id !== 'pl-history');
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

    createPlaylist(name, initialSongIds = []) {
        if (!name || !name.trim()) return null;
        const playlists = this.getPlaylists(false);
        const newPlaylist = {
            id: 'pl-' + Date.now(),
            name: name.trim(),
            createdAt: new Date().toISOString(),
            songIds: Array.isArray(initialSongIds) ? [...initialSongIds] : []
        };
        playlists.push(newPlaylist);
        localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
        window.dispatchEvent(new CustomEvent('stellplay:playlistsUpdated'));
        this.triggerServerBackup();
        return newPlaylist;
    },

    deletePlaylist(playlistId) {
        if (playlistId === 'pl-history') return false; // 최근 감상 기록은 영구 고정으로 삭제 불가
        let playlists = this.getPlaylists(false);
        playlists = playlists.filter(p => p.id !== playlistId);
        localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
        window.dispatchEvent(new CustomEvent('stellplay:playlistsUpdated'));
        this.triggerServerBackup();
        return true;
    },

    addSongsToPlaylist(playlistId, songIds) {
        if (playlistId === 'pl-history') return 0; // 기록용 재생목록에는 외부에서 임의 추가 불가
        if (!Array.isArray(songIds) || songIds.length === 0) return 0;
        if (playlistId === 'pl-favorites') {
            let favs = this.getFavorites();
            let added = 0;
            songIds.forEach(id => {
                if (!favs.includes(id)) {
                    favs.unshift(id);
                    added++;
                }
            });
            if (added > 0) {
                localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
                window.dispatchEvent(new CustomEvent('stellplay:favoritesUpdated'));
                this.triggerServerBackup();
            }
            return added;
        }

        const playlists = this.getPlaylists(false);
        const pl = playlists.find(p => p.id === playlistId);
        if (pl) {
            let added = 0;
            songIds.forEach(id => {
                if (!pl.songIds.includes(id)) {
                    pl.songIds.push(id);
                    added++;
                }
            });
            if (added > 0) {
                localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
                window.dispatchEvent(new CustomEvent('stellplay:playlistsUpdated'));
                this.triggerServerBackup();
            }
            return added;
        }
        return 0;
    },

    addSongToPlaylist(playlistId, songId) {
        return this.addSongsToPlaylist(playlistId, [songId]) > 0;
    },

    removeSongFromPlaylist(playlistId, songId) {
        if (playlistId === 'pl-history') {
            return this.removeFromHistory(songId);
        }
        if (playlistId === 'pl-favorites') {
            let favs = this.getFavorites();
            favs = favs.filter(id => id !== songId);
            localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
            window.dispatchEvent(new CustomEvent('stellplay:favoritesUpdated', { detail: { songId, isFavorite: false } }));
            this.triggerServerBackup();
            return true;
        }
        const playlists = this.getPlaylists(false);
        const pl = playlists.find(p => p.id === playlistId);
        if (pl) {
            pl.songIds = pl.songIds.filter(id => id !== songId);
            localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
            window.dispatchEvent(new CustomEvent('stellplay:playlistsUpdated'));
            this.triggerServerBackup();
            return true;
        }
        return false;
    },

    // --- 최근 재생 기록 (History, 최대 100곡) ---
    getHistory() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    addToHistory(songId) {
        if (!songId) return;
        let hist = this.getHistory();
        hist = hist.filter(id => id !== songId);
        hist.unshift(songId);
        if (hist.length > 100) hist = hist.slice(0, 100); // 최대 100곡 보관
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(hist));
        window.dispatchEvent(new CustomEvent('stellplay:historyUpdated', { detail: { songId, history: hist } }));
        window.dispatchEvent(new CustomEvent('stellplay:playlistsUpdated'));
        this.triggerServerBackup();
    },

    removeFromHistory(songId) {
        let hist = this.getHistory();
        const initialLen = hist.length;
        hist = hist.filter(id => id !== songId);
        if (hist.length !== initialLen) {
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(hist));
            window.dispatchEvent(new CustomEvent('stellplay:historyUpdated', { detail: { removedSongId: songId, history: hist } }));
            window.dispatchEvent(new CustomEvent('stellplay:playlistsUpdated'));
            return true;
        }
        return false;
    },

    clearHistory() {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
        window.dispatchEvent(new CustomEvent('stellplay:historyUpdated', { detail: { history: [] } }));
        window.dispatchEvent(new CustomEvent('stellplay:playlistsUpdated'));
        return true;
    },

    // --- 플레이어 설정 및 상태 (Settings) ---
    getSettings() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            return data ? JSON.parse(data) : {
                volume: 50,
                repeatMode: 'all', // 'off', 'all', 'one'
                isShuffle: false,
                sabiMode: false,
                activeMemberTheme: 'all'
            };
        } catch (e) {
            return {
                volume: 50,
                repeatMode: 'all',
                isShuffle: false,
                sabiMode: false,
                activeMemberTheme: 'all'
            };
        }
    },

    saveSettings(partialSettings) {
        try {
            const current = this.getSettings();
            const updated = { ...current, ...partialSettings };
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
            this.triggerServerBackup();
            return updated;
        } catch (e) {
            return null;
        }
    },

    // --- 사용자 맞춤 사비 (Custom Sabi) ---
    getCustomSabis() {
        try {
            const data = localStorage.getItem('stellplay_custom_sabi');
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    },

    saveCustomSabi(songId, sabiObj) {
        try {
            const sabis = this.getCustomSabis();
            sabis[songId] = sabiObj;
            localStorage.setItem('stellplay_custom_sabi', JSON.stringify(sabis));
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
        try {
            const data = localStorage.getItem('stellplay_custom_songs');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    addCustomSong(song) {
        try {
            const songs = this.getCustomSongs();
            songs.unshift(song);
            localStorage.setItem('stellplay_custom_songs', JSON.stringify(songs));
            this.triggerServerBackup();
            return true;
        } catch (e) {
            console.error('Failed to save custom song', e);
            return false;
        }
    },

    deleteCustomSong(songId) {
        try {
            let songs = this.getCustomSongs();
            songs = songs.filter(s => s.id !== songId);
            localStorage.setItem('stellplay_custom_songs', JSON.stringify(songs));
            this.triggerServerBackup();
            return true;
        } catch (e) {
            return false;
        }
    },

    // --- 곡 정보 사용자 직접 수정 (Song Metadata Overrides) ---
    getSongOverrides() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SONG_OVERRIDES);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    },

    saveSongOverride(songId, overrideData) {
        try {
            const overrides = this.getSongOverrides();
            overrides[songId] = { ...(overrides[songId] || {}), ...overrideData };
            localStorage.setItem(STORAGE_KEYS.SONG_OVERRIDES, JSON.stringify(overrides));
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
            const overrides = this.getSongOverrides();
            if (overrides[songId]) {
                delete overrides[songId];
                localStorage.setItem(STORAGE_KEYS.SONG_OVERRIDES, JSON.stringify(overrides));
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
        try {
            const data = localStorage.getItem(STORAGE_KEYS.AUTO_SONGS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    addAutoDetectedSongs(newSongs) {
        if (!newSongs || newSongs.length === 0) return [];
        try {
            const current = this.getAutoDetectedSongs();
            const existingIds = new Set(current.map(s => s.id || s.youtubeId));
            const toAdd = [];
            for (const s of newSongs) {
                const sid = s.id || `stel-${s.youtubeId}`;
                if (!existingIds.has(sid) && !existingIds.has(s.youtubeId)) {
                    existingIds.add(sid);
                    toAdd.push({ ...s, id: sid, isAutoAdded: true });
                }
            }
            if (toAdd.length > 0) {
                const updated = [...toAdd, ...current];
                localStorage.setItem(STORAGE_KEYS.AUTO_SONGS, JSON.stringify(updated));
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
        try {
            const data = localStorage.getItem('stellplay_hidden_songs');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    hideSong(songId) {
        try {
            const list = this.getHiddenSongs();
            if (!list.includes(songId)) {
                list.push(songId);
                localStorage.setItem('stellplay_hidden_songs', JSON.stringify(list));
                window.dispatchEvent(new CustomEvent('stellplay:songHidden', { detail: { songId } }));
            }
            return true;
        } catch (e) {
            return false;
        }
    },

    unhideSong(songId) {
        try {
            let list = this.getHiddenSongs();
            list = list.filter(id => id !== songId);
            localStorage.setItem('stellplay_hidden_songs', JSON.stringify(list));
            window.dispatchEvent(new CustomEvent('stellplay:songUnhidden', { detail: { songId } }));
            return true;
        } catch (e) {
            return false;
        }
    },

    restoreAllHiddenSongs() {
        try {
            localStorage.removeItem('stellplay_hidden_songs');
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
                    needReload = true;
                }
            }

            // 1.1 최근 감상 기록 복원
            if (Array.isArray(data.history) && data.history.length > 0) {
                const local = localStorage.getItem(STORAGE_KEYS.HISTORY);
                if (!local || JSON.parse(local).length === 0) {
                    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
                    needReload = true;
                }
            }

            // 2. 즐겨찾기 복원
            if (Array.isArray(data.favorites) && data.favorites.length > 0) {
                const local = localStorage.getItem(STORAGE_KEYS.FAVORITES);
                if (!local || JSON.parse(local).length === 0) {
                    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(data.favorites));
                    needReload = true;
                }
            }

            // 3. 설정 복원
            if (data.settings && typeof data.settings === 'object') {
                const local = localStorage.getItem(STORAGE_KEYS.SETTINGS);
                if (!local) {
                    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
                }
            }

            // 4. 사비 / 곡 수정 복원
            if (data.customSabis) {
                const local = localStorage.getItem('stellplay_custom_sabi');
                if (!local) localStorage.setItem('stellplay_custom_sabi', JSON.stringify(data.customSabis));
            }
            if (data.songOverrides) {
                const local = localStorage.getItem(STORAGE_KEYS.SONG_OVERRIDES);
                if (!local) localStorage.setItem(STORAGE_KEYS.SONG_OVERRIDES, JSON.stringify(data.songOverrides));
            }
            if (data.customSongs) {
                const local = localStorage.getItem('stellplay_custom_songs');
                if (!local) localStorage.setItem('stellplay_custom_songs', JSON.stringify(data.customSongs));
            }

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

// 백그라운드 서버 데이터 동기화 자동 시작
try {
    StorageManager.syncWithServer();
} catch (e) {}
