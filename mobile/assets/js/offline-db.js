// StellPlay Mobile Web - Offline DB Stub (No-Op for Web Version)
(function() {
    'use strict';
    window.OfflineDB = {
        isAvailable: false,
        init: async function() { return false; },
        isDownloaded: async function() { return false; },
        getAllTracks: async function() { return []; },
        getTrackBlob: async function() { return null; },
        saveTrack: async function() { return false; },
        deleteTrack: async function() { return true; },
        clearAll: async function() { return true; },
        syncNativeOfflineTracks: async function() { return []; },
        getOfflineCount: async function() { return 0; },
        getOfflineTotalSize: async function() { return 0; }
    };
})();
