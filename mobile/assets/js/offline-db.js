/**
 * StellPlay Mobile - IndexedDB 기반 오프라인 음원 저장소 (Offline Audio Engine)
 * - 브라우저/모바일 기기 내부 저장소에 음원 Blob 바이너리를 영구 보관
 * - 인터넷이 연결되지 않은 오프라인(비행기 모드 등) 상태에서도 0초 버퍼링 재생 지원
 */

const OfflineDB = {
    DB_NAME: 'StellPlay_Mobile_Offline_DB',
    DB_VERSION: 1,
    STORE_NAME: 'offline_audio',
    _db: null,

    async getDB() {
        if (this._db) return this._db;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
                    store.createIndex('by_downloadedAt', 'downloadedAt', { unique: false });
                    store.createIndex('by_type', 'song.type', { unique: false });
                }
            };
            request.onsuccess = (e) => {
                this._db = e.target.result;
                resolve(this._db);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    },

    /**
     * 특정 곡이 오프라인에 저장되어 있는지 확인
     */
    async isDownloaded(songId) {
        if (window.AndroidBridge && typeof window.AndroidBridge.hasOfflineTrack === 'function') {
            try {
                if (window.AndroidBridge.hasOfflineTrack(songId)) return true;
            } catch (e) {}
        }
        try {
            const db = await this.getDB();
            return new Promise((resolve) => {
                const tx = db.transaction(this.STORE_NAME, 'readonly');
                const store = tx.objectStore(this.STORE_NAME);
                const req = store.get(songId);
                req.onsuccess = () => resolve(!!req.result);
                req.onerror = () => resolve(false);
            });
        } catch (e) {
            return false;
        }
    },

    /**
     * 오프라인 저장된 음원 레코드 단건 조회
     */
    async getTrack(songId) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.STORE_NAME, 'readonly');
            const store = tx.objectStore(this.STORE_NAME);
            const req = store.get(songId);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    },

    /**
     * 모든 오프라인 저장 음원 목록 조회
     */
    async getAllTracks() {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.STORE_NAME, 'readonly');
            const store = tx.objectStore(this.STORE_NAME);
            const req = store.getAll();
            req.onsuccess = () => {
                const tracks = req.result || [];
                // 최신 다운로드 순 정렬
                tracks.sort((a, b) => b.downloadedAt - a.downloadedAt);
                resolve(tracks);
            };
            req.onerror = () => reject(req.error);
        });
    },

    /**
     * 음원 바이너리 Blob을 IndexedDB에 저장
     */
    async saveTrack(song, blob, mimeType = 'audio/mp4') {
        const db = await this.getDB();
        const record = {
            id: song.id,
            song: {
                id: song.id,
                title: song.title,
                artist: song.artist,
                originalArtist: song.originalArtist || '스텔라이브',
                type: song.type,
                members: song.members || ['group'],
                gen: song.gen || 'group',
                youtubeId: song.youtubeId,
                duration: song.duration,
                sabi: song.sabi
            },
            blob: blob,
            mimeType: mimeType,
            size: blob.size,
            downloadedAt: Date.now()
        };

        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.STORE_NAME, 'readwrite');
            const store = tx.objectStore(this.STORE_NAME);
            const req = store.put(record);
            req.onsuccess = () => {
                window.dispatchEvent(new CustomEvent('stellplay:offlineTrackSaved', { detail: { songId: song.id } }));
                resolve(record);
            };
            req.onerror = () => reject(req.error);
        });
    },

    /**
     * 오프라인 음원 복수(선택) 삭제 - 실제 로컬 파일 및 IndexedDB 완전 제거
     */
    async deleteTracks(songIds) {
        if (!Array.isArray(songIds) || songIds.length === 0) return true;

        // 1. 안드로이드 기기 로컬 파일 물리적 삭제
        if (window.AndroidBridge && typeof window.AndroidBridge.deleteOfflineTracks === 'function') {
            try {
                window.AndroidBridge.deleteOfflineTracks(JSON.stringify(songIds));
            } catch (e) {}
        } else if (window.AndroidBridge && typeof window.AndroidBridge.deleteOfflineTrack === 'function') {
            for (const id of songIds) {
                try { window.AndroidBridge.deleteOfflineTrack(id); } catch (e) {}
            }
        }

        // 2. IndexedDB 레코드 삭제
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.STORE_NAME, 'readwrite');
            const store = tx.objectStore(this.STORE_NAME);
            songIds.forEach(id => store.delete(id));
            tx.oncomplete = () => {
                window.dispatchEvent(new CustomEvent('stellplay:offlineTrackDeleted', { detail: { songIds } }));
                resolve(true);
            };
            tx.onerror = () => reject(tx.error);
        });
    },

    /**
     * 오프라인 음원 단건 삭제
     */
    async deleteTrack(songId) {
        return this.deleteTracks([songId]);
    },

    /**
     * 오프라인 음원 전체 삭제 - 디스크 실제 파일과 IndexedDB 모두 완전 삭제
     */
    async clearAll() {
        const tracks = await this.getAllTracks();
        const ids = tracks.map(t => t.id);
        if (ids.length > 0) {
            await this.deleteTracks(ids);
        }
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.STORE_NAME, 'readwrite');
            const store = tx.objectStore(this.STORE_NAME);
            const req = store.clear();
            req.onsuccess = () => {
                window.dispatchEvent(new CustomEvent('stellplay:offlineAllCleared'));
                resolve(true);
            };
            req.onerror = () => reject(req.error);
        });
    },

    /**
     * 현재 오프라인 저장소 사용량 통계 계산
     */
    async getStorageStats() {
        const tracks = await this.getAllTracks();
        let totalBytes = 0;
        tracks.forEach(t => {
            totalBytes += (t.size || 0);
        });
        const mb = (totalBytes / (1024 * 1024)).toFixed(1);
        return {
            count: tracks.length,
            totalBytes: totalBytes,
            formattedSize: `${mb} MB`
        };
    },

    /**
     * 앱 기동 시 안드로이드 네이티브 Music 폴더에 존재하는 mp3 목록을 IndexedDB에 동기화
     */
    async syncNativeOfflineTracks(allSongs) {
        if (!window.AndroidBridge || typeof window.AndroidBridge.hasOfflineTrack !== 'function') return;
        if (!Array.isArray(allSongs) || allSongs.length === 0) return;
        for (const song of allSongs) {
            try {
                if (window.AndroidBridge.hasOfflineTrack(song.id, song.youtubeId || '')) {
                    const existing = await this.getTrack(song.id);
                    if (!existing) {
                        await this.saveTrack(song, new Blob(['native_audio'], { type: 'audio/mp3' }), 'audio/mp3');
                    }
                }
            } catch (e) {}
        }
    },

    /**
     * 음원을 다운로드하여 IndexedDB에 영구 보관 (오프라인/비행기 모드 재생 지원)
     * - 안드로이드 독립형 APK 환경에서는 내장 yt-dlp + FFmpeg로 고음질 mp3 직접 추출
     * - 웹 브라우저/로컬 환경에서는 PC 서버 또는 프록시를 통해 다운로드
     */
    async downloadSong(song, onProgress) {
        if (!song || !song.youtubeId) throw new Error('유효한 곡 정보가 없습니다.');

        // 1. AndroidBridge 네이티브 yt-dlp 자체 다운로드 지원 시
        if (window.AndroidBridge && typeof window.AndroidBridge.downloadTrack === 'function') {
            return new Promise((resolve, reject) => {
                const onProg = (e) => {
                    if (e.detail && e.detail.id === song.id && onProgress) {
                        onProgress(e.detail.progress);
                    }
                };
                const onSucc = async (e) => {
                    if (e.detail && e.detail.id === song.id) {
                        cleanup();
                        try {
                            await this.saveTrack(song, new Blob(['native_audio'], { type: 'audio/mp3' }), 'audio/mp3');
                        } catch (err) {}
                        resolve(true);
                    }
                };
                const onErr = (e) => {
                    if (e.detail && e.detail.id === song.id) {
                        cleanup();
                        reject(new Error(e.detail.message || '네이티브 yt-dlp 다운로드 실패'));
                    }
                };
                const cleanup = () => {
                    window.removeEventListener('native:downloadProgress', onProg);
                    window.removeEventListener('native:downloadSuccess', onSucc);
                    window.removeEventListener('native:downloadError', onErr);
                };

                window.addEventListener('native:downloadProgress', onProg);
                window.addEventListener('native:downloadSuccess', onSucc);
                window.addEventListener('native:downloadError', onErr);

                window.AndroidBridge.downloadTrack(song.id, song.youtubeId, song.title, song.artist);
            });
        }

        let blob = null;
        let mimeType = 'audio/mp4';

        // 2. PC 연동 서버 또는 로컬 모바일 서버 시도
        const pcServer = (localStorage.getItem('stellplay_pc_server') || '').trim().replace(/\/+$/, '');
        const serverEndpoints = [];
        if (pcServer) {
            serverEndpoints.push(`${pcServer}/api/audio?id=${song.youtubeId}`);
        }
        serverEndpoints.push(`/api/audio?id=${song.youtubeId}`);

        for (const endpoint of serverEndpoints) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4500);
                const resp = await fetch(endpoint, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (resp.ok) {
                    mimeType = resp.headers.get('content-type') || 'audio/mp4';
                    const contentLength = resp.headers.get('content-length');
                    const total = contentLength ? parseInt(contentLength, 10) : 0;

                    if (!resp.body || !total) {
                        blob = await resp.blob();
                    } else {
                        const reader = resp.body.getReader();
                        let received = 0;
                        const chunks = [];
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            chunks.push(value);
                            received += value.length;
                            if (onProgress && total > 0) {
                                onProgress(Math.min(100, Math.round((received / total) * 100)));
                            }
                        }
                        blob = new Blob(chunks, { type: mimeType });
                    }
                    if (blob && blob.size > 1000) {
                        break;
                    }
                }
            } catch (e) {}
        }

        // 3. 로컬 서버 연결 불가 시 공용 다이렉트 프록시 다중 미러 시도
        if (!blob) {
            const streamEndpoints = [
                `https://invidious.jing.rocks/api/v1/videos/${song.youtubeId}`,
                `https://iv.ggtyler.dev/api/v1/videos/${song.youtubeId}`,
                `https://invidious.private.coffee/api/v1/videos/${song.youtubeId}`,
                `https://yt.drgnz.club/api/v1/videos/${song.youtubeId}`,
                `https://api.piped.privacydev.net/streams/${song.youtubeId}`,
                `https://pipedapi.kavin.rocks/streams/${song.youtubeId}`
            ];

            for (const ep of streamEndpoints) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 3500);
                    const r = await fetch(ep, { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (r.ok) {
                        const data = await r.json();
                        const audioStreams = data.audioStreams || (data.adaptiveFormats ? data.adaptiveFormats.filter(f => f.type && f.type.startsWith('audio/')) : []);
                        if (audioStreams && audioStreams.length > 0) {
                            const streamUrl = audioStreams[0].url;
                            const aResp = await fetch(streamUrl);
                            if (aResp.ok) {
                                mimeType = aResp.headers.get('content-type') || 'audio/mp4';
                                blob = await aResp.blob();
                                if (blob && blob.size > 1000) break;
                            }
                        }
                    }
                } catch (err) {}
            }
        }

        if (!blob) {
            throw new Error('음원 다운로드에 실패했습니다. 네트워크 상태를 확인해주세요.');
        }

        return await this.saveTrack(song, blob, mimeType);
    }
};

// AndroidBridge 콜백 리스너 등록
window.onNativeDownloadProgress = (id, progress) => {
    window.dispatchEvent(new CustomEvent('native:downloadProgress', { detail: { id, progress } }));
};
window.onNativeDownloadSuccess = (id) => {
    window.dispatchEvent(new CustomEvent('native:downloadSuccess', { detail: { id } }));
};
window.onNativeDownloadError = (id, message) => {
    window.dispatchEvent(new CustomEvent('native:downloadError', { detail: { id, message } }));
};

window.OfflineDB = OfflineDB;
