/**
 * StellPlay - 스텔라이브 공식 정규/커버/피처링 전곡 데이터베이스 (v3.0 Official Only)
 * - 비공식/팬/AI 편곡 100% 영구 제거 완료
 * - 멤버 공식 채널 및 스텔라이브 공식 채널 정식 음원 전수 탑재
 * - 클리셰(Cliché) 1st EP 『Colorful Strokes』 최신 오리지널 전곡 수록
 * - 멤버별 모던 컬러/이니셜 아바타 메타데이터
 */

const MEMBERS = {
    all: {
        id: 'all',
        name: '전체 (All)',
        initial: 'ALL',
        gen: 'all',
        color: '#7c5cfc',
        glow: 'rgba(124, 92, 252, 0.45)',
        desc: '스텔라이브 전곡 모음'
    },
    group: {
        id: 'group',
        name: '단체 & 유닛',
        initial: 'UNIT',
        gen: 'group',
        color: '#5c7cfa',
        glow: 'rgba(92, 124, 250, 0.45)',
        desc: '스텔라이브 공식 단체 및 유닛 곡'
    },
    // 1기 에버리스 (Everlys)
    yuni: {
        id: 'yuni',
        name: '아야츠노 유니',
        initial: '유니',
        nameEn: 'Ayatsuno Yuni',
        gen: 'g1',
        genName: '1기 Everlys',
        color: '#d946ef',
        glow: 'rgba(217, 70, 239, 0.5)',
        desc: '유니콘 요정, 통통 튀는 독보적 음색'
    },
    huya: {
        id: 'huya',
        name: '사키하네 후야',
        initial: '후야',
        nameEn: 'Sakihane Huya',
        gen: 'g1',
        genName: '1기 Everlys',
        color: '#7e22ce',
        glow: 'rgba(126, 34, 206, 0.5)',
        desc: '에버리스의 새로운 목소리, 청아하고 다채로운 보컬'
    },
    kanna: {
        id: 'kanna',
        name: '아이리 칸나',
        initial: '칸나',
        nameEn: 'Airi Kanna',
        gen: 'g1',
        genName: '1기 Everlys (명예)',
        color: '#1e40af',
        glow: 'rgba(30, 64, 175, 0.5)',
        desc: '용족의 후예, 파워풀한 감성 보컬'
    },
    // 2기 유니버스 (Universe)
    hina: {
        id: 'hina',
        name: '시라유키 히나',
        initial: '히나',
        nameEn: 'Shirayuki Hina',
        gen: 'g2',
        genName: '2기 Universe',
        color: '#eab308',
        glow: 'rgba(234, 179, 8, 0.5)',
        desc: '천상의 목소리, 따스하고 맑은 감성 보컬'
    },
    mashiro: {
        id: 'mashiro',
        name: '네네코 마시로',
        initial: '마시로',
        nameEn: 'Neneko Mashiro',
        gen: 'g2',
        genName: '2기 Universe',
        color: '#94a3b8',
        glow: 'rgba(148, 163, 184, 0.5)',
        desc: '투명하고 순수한 음색, 포근한 힐링 보이스'
    },
    lize: {
        id: 'lize',
        name: '아카네 리제',
        initial: '리제',
        nameEn: 'Akane Lize',
        gen: 'g2',
        genName: '2기 Universe',
        color: '#ef4444',
        glow: 'rgba(239, 68, 68, 0.5)',
        desc: '시원한 사이다 고음, 폭발적인 락 스피릿'
    },
    tabi: {
        id: 'tabi',
        name: '아라하시 타비',
        initial: '타비',
        nameEn: 'Arahashi Tabi',
        gen: 'g2',
        genName: '2기 Universe',
        color: '#38bdf8',
        glow: 'rgba(56, 189, 248, 0.5)',
        desc: '감미로운 미성, 편안하고 서정적인 보컬'
    },
    // 3기 클리셰 (Cliché)
    shibuki: {
        id: 'shibuki',
        name: '텐코 시부키',
        initial: '시부키',
        nameEn: 'Tenko Shibuki',
        gen: 'g3',
        genName: '3기 Cliché',
        color: '#c084fc',
        glow: 'rgba(192, 132, 252, 0.5)',
        desc: '활기찬 에너지, 직진하는 청춘 락 보컬'
    },
    rin: {
        id: 'rin',
        name: '아오쿠모 린',
        initial: '린',
        nameEn: 'Aokumo Rin',
        gen: 'g3',
        genName: '3기 Cliché',
        color: '#3b82f6',
        glow: 'rgba(59, 130, 246, 0.5)',
        desc: '탁월한 리듬감, 힙합과 락을 넘나드는 음색'
    },
    nana: {
        id: 'nana',
        name: '하나코 나나',
        initial: '나나',
        nameEn: 'Hanako Nana',
        gen: 'g3',
        genName: '3기 Cliché',
        color: '#ff2a85',
        glow: 'rgba(255, 42, 133, 0.5)',
        desc: '부드러운 하모니와 파워풀 R&B 보컬'
    },
    riko: {
        id: 'riko',
        name: '유즈하 리코',
        initial: '리코',
        nameEn: 'Yuzuha Riko',
        gen: 'g3',
        genName: '3기 Cliché',
        color: '#84cc16',
        glow: 'rgba(132, 204, 22, 0.5)',
        desc: '싱그럽고 매력적인 팝 보이스'
    }
};

const GENERATIONS = [
    { id: 'all', name: '전체 (All)' },
    { id: 'group', name: '단체 & 유닛' },
    { id: 'g1', name: '1기 Everlys' },
    { id: 'g2', name: '2기 Universe' },
    { id: 'g3', name: '3기 Cliché' }
];

const DEFAULT_SONGS = [
    {
        "id": "stel-milkyway",
        "title": "Milky Way",
        "artist": "스텔라이브 (STELLIVE)",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "group",
        "members": [
            "kanna",
            "yuni",
            "hina",
            "mashiro",
            "lize",
            "tabi"
        ],
        "youtubeId": "YcyDo-jp4YM",
        "duration": 218,
        "sabi": {
            "start": 58,
            "end": 94,
            "title": "후렴구: 은하수를 건너 빛나는 우리"
        },
        "publishedAt": "2024-02-24"
    },
    {
        "id": "stel-6mVByQMyxdY",
        "title": "추억의 투니버스 메들리",
        "artist": "스텔라이브 (STELLIVE)",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "group",
        "members": [
            "group",
            "kanna",
            "yuni",
            "hina",
            "mashiro",
            "lize",
            "tabi"
        ],
        "youtubeId": "6mVByQMyxdY",
        "duration": 1234,
        "sabi": {
            "start": 120,
            "end": 160,
            "title": "후렴구: 그때 그 시절, 추억의 투니버스 메들리"
        },
        "publishedAt": "2024-05-05"
    },
    {
        "id": "stel-stars-align",
        "title": "Stars Align",
        "artist": "유니버스 (Universe 2기생)",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "g2",
        "members": [
            "hina",
            "mashiro",
            "lize",
            "tabi"
        ],
        "youtubeId": "Jt6UCd7JhAA",
        "duration": 222,
        "sabi": {
            "start": 62,
            "end": 98,
            "title": "후렴구: 밤하늘을 수놓는 별들의 화음"
        },
        "publishedAt": "2024-04-30"
    },
    {
        "id": "stel-our-tales",
        "title": "Our Tales",
        "artist": "클리셰 (Cliché 3기생)",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "g3",
        "members": [
            "shibuki",
            "rin",
            "nana",
            "riko"
        ],
        "youtubeId": "GN-rdF8tEpU",
        "duration": 204,
        "sabi": {
            "start": 54,
            "end": 88,
            "title": "후렴구: 우리가 함께 써 내려갈 이야기"
        },
        "publishedAt": "2024-08-24"
    },
    {
        "id": "stel-meteor-shower",
        "title": "유성우",
        "artist": "클리셰 (Cliché 3기생)",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "g3",
        "members": [
            "shibuki",
            "rin",
            "nana",
            "riko"
        ],
        "youtubeId": "XR81lQrRceg",
        "duration": 216,
        "sabi": {
            "start": 52,
            "end": 86,
            "title": "유성우"
        },
        "publishedAt": "2026-05-19"
    },
    {
        "id": "stel-hit-on-shot",
        "title": "Hit On Shot",
        "artist": "아이리 칸나 & 아카네 리제",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "group",
        "members": [
            "kanna",
            "lize"
        ],
        "youtubeId": "suyhkCwKX48",
        "duration": 196,
        "sabi": {
            "start": 48,
            "end": 82,
            "title": "후렴구: 폭발하는 락 스피릿 하모니"
        },
        "publishedAt": "2024-04-03"
    },
    {
        "id": "stel-dear-my-fairy",
        "title": "Dear my fairy",
        "artist": "시라유키 히나 & 네네코 마시로",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "g2",
        "members": [
            "hina",
            "mashiro"
        ],
        "youtubeId": "uTj88854gZ0",
        "duration": 214,
        "sabi": {
            "start": 60,
            "end": 96,
            "title": "후렴구: 동화 같은 몽환적 선율"
        },
        "publishedAt": "2024-04-21"
    },
    {
        "id": "stel-heart-score",
        "title": "마음악보",
        "artist": "유니버스 (Universe 2기생)",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "g2",
        "members": [
            "hina",
            "mashiro",
            "lize",
            "tabi"
        ],
        "youtubeId": "yiprl7-dU04",
        "duration": 230,
        "sabi": {
            "start": 64,
            "end": 100,
            "title": "후렴구: 마음을 담아 연주하는 악보"
        },
        "publishedAt": "2026-06-11"
    },
    {
        "id": "stel-sekai-group",
        "title": "セカイ (SEKAI)",
        "artist": "스텔라이브 (STELLIVE)",
        "originalArtist": "DECO*27 x 堀江晶太",
        "type": "cover",
        "gen": "group",
        "members": [
            "kanna",
            "yuni",
            "hina",
            "mashiro",
            "lize",
            "tabi"
        ],
        "youtubeId": "hGzklPRul4w",
        "duration": 228,
        "sabi": {
            "start": 66,
            "end": 104,
            "title": "후렴구: 끝없이 펼쳐진 세카이"
        },
        "publishedAt": "2026-02-01"
    },
    {
        "id": "cliche-mother-goose",
        "title": "アンノウン・マザーグース (언노운 마더구스)",
        "artist": "클리셰 (Cliché 3기생)",
        "originalArtist": "wowaka",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki",
            "rin",
            "nana",
            "riko"
        ],
        "youtubeId": "xqaLEv-Vff4",
        "duration": 232,
        "sabi": {
            "start": 70,
            "end": 108,
            "title": "후렴구: 사랑을 노래해줘 마더구스"
        },
        "publishedAt": "2025-05-18"
    },
    {
        "id": "cliche-shibuki-strawberry",
        "title": "베리베리스트로베리",
        "artist": "텐코 시부키",
        "originalArtist": "오리지널 (1st EP Colorful Strokes)",
        "type": "original",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "nsZmnwC9ukE",
        "duration": 210,
        "sabi": {
            "start": 54,
            "end": 88,
            "title": "후렴구: 상큼발랄 베리베리 스트로베리"
        },
        "publishedAt": "2026-07-25"
    },
    {
        "id": "cliche-rin-maid-my-way",
        "title": "Maid My Way",
        "artist": "아오쿠모 린",
        "originalArtist": "오리지널 (1st EP Colorful Strokes)",
        "type": "original",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "ZYSQLv_L26Y",
        "duration": 202,
        "sabi": {
            "start": 50,
            "end": 84,
            "title": "후렴구: 당당하고 매력적인 메이드 마이 웨이"
        },
        "publishedAt": "2026-07-27"
    },
    {
        "id": "cliche-nana-hush-trap",
        "title": "Hush Trap",
        "artist": "하나코 나나",
        "originalArtist": "오리지널 (1st EP Colorful Strokes)",
        "type": "original",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "jvZRK7W7S9Y",
        "duration": 198,
        "sabi": {
            "start": 46,
            "end": 80,
            "title": "후렴구: 빠져드는 감각의 허쉬 트랩"
        },
        "publishedAt": "2026-07-26"
    },
    {
        "id": "cliche-riko-villain-alert",
        "title": "악당주의보",
        "artist": "유즈하 리코",
        "originalArtist": "오리지널 (1st EP Colorful Strokes)",
        "type": "original",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "P_oxx3_VpIY",
        "duration": 208,
        "sabi": {
            "start": 52,
            "end": 86,
            "title": "후렴구: 경고! 매력적인 악당주의보 발령"
        },
        "publishedAt": "2026-07-24"
    },
    {
        "id": "feat-lize-blood",
        "title": "목숨",
        "artist": "Miiro (미로) feat. 아카네 리제",
        "originalArtist": "Miiro Official",
        "type": "featuring",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "6Q78RPXk2es",
        "duration": 205,
        "sabi": {
            "start": 62,
            "end": 96,
            "title": "후렴구: 폭발적인 리제의 고음 샤우팅"
        },
        "publishedAt": "2025-05-30"
    },
    {
        "id": "feat-lize-sync100",
        "title": "SYNC 100%",
        "artist": "PLATiNA :: LAB / Mayo (feat. 아카네 리제)",
        "originalArtist": "PLATiNA :: LAB",
        "type": "featuring",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "LcGrXP-xfHY",
        "duration": 184,
        "sabi": {
            "start": 44,
            "end": 78,
            "title": "후렴구: 심장 박동과 싱크되는 비트"
        },
        "publishedAt": "2026-09-04"
    },
    {
        "id": "ost-hina-arknights",
        "title": "불꽃 (Seed of Hope)",
        "artist": "시라유키 히나",
        "originalArtist": "명일방주 (Arknights) 5.5주년 공식 OST",
        "type": "featuring",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "vW2U2ZheON4",
        "duration": 248,
        "sabi": {
            "start": 78,
            "end": 114,
            "title": "후렴구: 희망의 씨앗 불꽃"
        },
        "publishedAt": "2025-07-17"
    },
    {
        "id": "ost-kanna-epicseven",
        "title": "Frozen Eclipse",
        "artist": "아이리 칸나",
        "originalArtist": "에픽세븐 (Epic Seven) 공식 OST",
        "type": "featuring",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "RbQv87f4mvg",
        "duration": 235,
        "sabi": {
            "start": 66,
            "end": 102,
            "title": "후렴구: 얼어붙은 일식의 세계"
        },
        "publishedAt": "2024-07-06"
    },
    {
        "id": "duet-nana-hina-joker",
        "title": "Joker",
        "artist": "하나코 나나 & 시라유키 히나",
        "originalArtist": "BIG Naughty",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana",
            "hina"
        ],
        "youtubeId": "yitS4QCqCdU",
        "duration": 192,
        "sabi": {
            "start": 48,
            "end": 82,
            "title": "후렴구: 나나x히나의 감각적인 R&B 조화"
        },
        "publishedAt": "2025-12-14"
    },
    {
        "id": "yuni-how-to-be-mine",
        "title": "내꺼 하는 법",
        "artist": "아야츠노 유니",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "g1",
        "members": [
            "yuni"
        ],
        "youtubeId": "pkypi5nXSYM",
        "duration": 182,
        "sabi": {
            "start": 42,
            "end": 74,
            "title": "후렴구: 내꺼 하는 법을 알려줄게"
        },
        "publishedAt": "2023-07-20"
    },
    {
        "id": "yuni-idol",
        "title": "アイドル (아이돌)",
        "artist": "아야츠노 유니",
        "originalArtist": "YOASOBI",
        "type": "cover",
        "gen": "g1",
        "members": [
            "yuni"
        ],
        "youtubeId": "ZL5m1EDh-z8",
        "duration": 214,
        "sabi": {
            "start": 60,
            "end": 96,
            "title": "후렴구: 완벽하고 궁극적인 아이돌"
        },
        "publishedAt": "2023-07-15"
    },
    {
        "id": "yuni-proud-idol",
        "title": "誇り高きアイドル (긍지높은 아이돌)",
        "artist": "아야츠노 유니",
        "originalArtist": "HoneyWorks",
        "type": "cover",
        "gen": "g1",
        "members": [
            "yuni"
        ],
        "youtubeId": "UKzvG2SP5wg",
        "duration": 236,
        "sabi": {
            "start": 68,
            "end": 104,
            "title": "후렴구: 누구에게도 지지 않는 아이돌의 긍지"
        },
        "publishedAt": "2023-01-04"
    },
    {
        "id": "yuni-betelgeuse",
        "title": "ベテルギウス (베텔기우스)",
        "artist": "아야츠노 유니",
        "originalArtist": "Yuuri (優里)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "yuni"
        ],
        "youtubeId": "YJJbVAPTZLg",
        "duration": 234,
        "sabi": {
            "start": 74,
            "end": 112,
            "title": "후렴구: 영원히 빛나는 베텔기우스처럼"
        },
        "publishedAt": "2023-01-28"
    },
    {
        "id": "yuni-lilac",
        "title": "ライラック (라일락)",
        "artist": "아야츠노 유니",
        "originalArtist": "Mrs. GREEN APPLE",
        "type": "cover",
        "gen": "g1",
        "members": [
            "yuni"
        ],
        "youtubeId": "DeXGjW0baLo",
        "duration": 204,
        "sabi": {
            "start": 54,
            "end": 88,
            "title": "후렴구: 찬란하게 만개하는 라이락"
        },
        "publishedAt": "2025-09-18"
    },
    {
        "id": "yuni-goodbye-declaration",
        "title": "グッバイ宣言 (굿바이 선언)",
        "artist": "아야츠노 유니",
        "originalArtist": "Chinozo",
        "type": "cover",
        "gen": "g1",
        "members": [
            "yuni"
        ],
        "youtubeId": "ZokeGI54Kqo",
        "duration": 178,
        "sabi": {
            "start": 44,
            "end": 76,
            "title": "후렴구: 굿바이 선언 포즈"
        },
        "publishedAt": "2023-05-20"
    },
    {
        "id": "duet-yuni-kanna-point",
        "title": "点描の唄 (점묘의 노래)",
        "artist": "아야츠노 유니 & 아이리 칸나",
        "originalArtist": "Mrs. GREEN APPLE feat. Inoue Sonoko",
        "type": "cover",
        "gen": "g1",
        "members": [
            "yuni",
            "kanna"
        ],
        "youtubeId": "QDIdN_eBvl0",
        "duration": 308,
        "sabi": {
            "start": 82,
            "end": 122,
            "title": "후렴구: 유니x칸나의 감미로운 듀엣 화음"
        },
        "publishedAt": "2024-12-01"
    },
    {
        "id": "huya-blue-sky",
        "title": "青空のラプソディ (푸른 하늘의 랩소디)",
        "artist": "사키하네 후야",
        "originalArtist": "fhána (코바야시네 메이드래곤 OP)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "huya"
        ],
        "youtubeId": "Xo1Q-RPAk2c",
        "duration": 278,
        "sabi": {
            "start": 58,
            "end": 94,
            "title": "후렴구: 마음을 울리는 푸른 하늘의 랩소디"
        },
        "publishedAt": "2026-03-30"
    },
    {
        "id": "huya-constellation",
        "title": "星座になれたら (별자리가 될 수 있다면)",
        "artist": "사키하네 후야",
        "originalArtist": "결속밴드 (봇치 더 록!)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "huya"
        ],
        "youtubeId": "eeIMg68ug9Y",
        "duration": 258,
        "sabi": {
            "start": 64,
            "end": 100,
            "title": "후렴구: 별자리가 될 수 있다면"
        },
        "publishedAt": "2025-09-19"
    },
    {
        "id": "huya-booo",
        "title": "Booo!",
        "artist": "사키하네 후야",
        "originalArtist": "TOKOTOKO (西沢さんP)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "huya"
        ],
        "youtubeId": "VITNdv2ZywY",
        "duration": 204,
        "sabi": {
            "start": 48,
            "end": 82,
            "title": "후렴구: 후야의 통통 튀는 보컬"
        },
        "publishedAt": "2026-07-07"
    },
    {
        "id": "duet-yuni-huya-poppin",
        "title": "ポッピンキャンディ☆フィーバー! (팝핀 캔디☆피버!)",
        "artist": "아야츠노 유니 & 사키하네 후야",
        "originalArtist": "KITY-P",
        "type": "cover",
        "gen": "g1",
        "members": [
            "yuni",
            "huya"
        ],
        "youtubeId": "NYN7FHVktsk",
        "duration": 224,
        "sabi": {
            "start": 52,
            "end": 88,
            "title": "후렴구: 유니x후야의 달콤한 듀엣 피버"
        },
        "publishedAt": "2025-11-25"
    },
    {
        "id": "kanna-the-last-flower",
        "title": "最終花 (최종화)",
        "artist": "아이리 칸나",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "ajDAmJYPQ-U",
        "duration": 234,
        "sabi": {
            "start": 68,
            "end": 106,
            "title": "후렴구: 마지막 꽃이 피어나는 순간"
        },
        "publishedAt": "2023-11-09"
    },
    {
        "id": "kanna-blue-crystal",
        "title": "青い宝石と竜の子 (푸른 보석과 어린 용)",
        "artist": "아이리 칸나",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "gq3gzxPBOK0",
        "duration": 242,
        "sabi": {
            "start": 72,
            "end": 110,
            "title": "후렴구: 용의 숨결과 푸른 보석"
        },
        "publishedAt": "2024-07-25"
    },
    {
        "id": "kanna-sukidakara",
        "title": "好きだから。 (좋아하니까)",
        "artist": "아이리 칸나",
        "originalArtist": "Yuika",
        "type": "cover",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "futqIdI0rOY",
        "duration": 226,
        "sabi": {
            "start": 56,
            "end": 92,
            "title": "후렴구: 마음을 울리는 칸나의 감성 고백"
        },
        "publishedAt": "2023-01-14"
    },
    {
        "id": "kanna-spinning-globe",
        "title": "地球儀 (지구본)",
        "artist": "아이리 칸나",
        "originalArtist": "요네즈 켄시 (그대들은 어떻게 살 것인가 OST)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "8VdlQZQ46D4",
        "duration": 272,
        "sabi": {
            "start": 80,
            "end": 120,
            "title": "후렴구: 회전하는 지구본 위에 새긴 기억"
        },
        "publishedAt": "2023-10-25"
    },
    {
        "id": "kanna-error",
        "title": "ERROR",
        "artist": "아이리 칸나",
        "originalArtist": "nikiP",
        "type": "cover",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "eNlXPUp9WBw",
        "duration": 224,
        "sabi": {
            "start": 62,
            "end": 98,
            "title": "후렴구: 폭발적인 샤우팅 ERROR"
        },
        "publishedAt": "2023-04-22"
    },
    {
        "id": "kanna-kaiju-flower",
        "title": "怪獣の花唄 (괴수의 꽃노래)",
        "artist": "아이리 칸나",
        "originalArtist": "Vaundy",
        "type": "cover",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "of5l0st1kA8",
        "duration": 220,
        "sabi": {
            "start": 58,
            "end": 94,
            "title": "후렴구: 감성 록 보컬의 정점"
        },
        "publishedAt": "2024-02-10"
    },
    {
        "id": "kanna-backlight",
        "title": "逆光 (역광)",
        "artist": "아이리 칸나",
        "originalArtist": "Ado (원피스 필름 레드 OST)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "q-QjjmJjU_8",
        "duration": 238,
        "sabi": {
            "start": 66,
            "end": 104,
            "title": "후렴구: 파워풀한 역광 샤우팅"
        },
        "publishedAt": "2024-06-09"
    },
    {
        "id": "kanna-new-genesis",
        "title": "新時代 (신시대)",
        "artist": "아이리 칸나",
        "originalArtist": "Ado (원피스 필름 레드 주제가)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "_nYgmgYMdW0",
        "duration": 228,
        "sabi": {
            "start": 60,
            "end": 98,
            "title": "후렴구: 신시대를 여는 청량한 보컬"
        },
        "publishedAt": "2023-03-04"
    },
    {
        "id": "kanna-kick-back",
        "title": "KICK BACK",
        "artist": "아이리 칸나",
        "originalArtist": "요네즈 켄시 (체인소 맨 OP)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "Ei1WobzwsVI",
        "duration": 196,
        "sabi": {
            "start": 48,
            "end": 84,
            "title": "후렴구: 강렬한 킥백 록 에너지"
        },
        "publishedAt": "2023-10-14"
    },
    {
        "id": "hina-dream-signal",
        "title": "꿈의 신호",
        "artist": "시라유키 히나",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "00pp5w9_Cr0",
        "duration": 224,
        "sabi": {
            "start": 60,
            "end": 96,
            "title": "후렴구: 꿈의 신호가 닿는 곳으로"
        },
        "publishedAt": "2025-04-23"
    },
    {
        "id": "hina-atlantis-princess",
        "title": "아틀란티스 소녀",
        "artist": "시라유키 히나",
        "originalArtist": "BoA",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "ekINzN4PQmo",
        "duration": 234,
        "sabi": {
            "start": 64,
            "end": 102,
            "title": "후렴구: 청량한 여름 바다 감성"
        },
        "publishedAt": "2026-09-01"
    },
    {
        "id": "hina-stay-at-your-house",
        "title": "I Really Want to Stay At Your House",
        "artist": "시라유키 히나",
        "originalArtist": "사이버펑크: 엣지러너 OST",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "RGrSmTKmBA4",
        "duration": 242,
        "sabi": {
            "start": 70,
            "end": 108,
            "title": "후렴구: 달빛 아래 아련한 선율"
        },
        "publishedAt": "2024-06-29"
    },
    {
        "id": "hina-season-crime",
        "title": "계절범죄 (Season Crime)",
        "artist": "시라유키 히나",
        "originalArtist": "Miiro (미로)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "7idkUwtf-0I",
        "duration": 218,
        "sabi": {
            "start": 56,
            "end": 92,
            "title": "후렴구: 계절을 넘어 퍼지는 목소리"
        },
        "publishedAt": "2026-01-31"
    },
    {
        "id": "hina-love-me",
        "title": "愛して愛して愛して (사랑해줘 사랑해줘 사랑해줘)",
        "artist": "시라유키 히나",
        "originalArtist": "Kikuo (きくお)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "Am36NHSuCWQ",
        "duration": 238,
        "sabi": {
            "start": 62,
            "end": 98,
            "title": "후렴구: 히나의 독보적인 감성 보컬"
        },
        "publishedAt": "2025-09-28"
    },
    {
        "id": "duet-hina-lize-ray",
        "title": "ray (레이)",
        "artist": "시라유키 히나 & 아카네 리제",
        "originalArtist": "BUMP OF CHICKEN",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina",
            "lize"
        ],
        "youtubeId": "UcFBb927-kU",
        "duration": 312,
        "sabi": {
            "start": 84,
            "end": 124,
            "title": "후렴구: 히나x리제의 감동적인 듀엣 하모니"
        },
        "publishedAt": "2026-03-17"
    },
    {
        "id": "hina-mela",
        "title": "Mela! (메라!)",
        "artist": "시라유키 히나",
        "originalArtist": "녹황색사회 (緑黄色社会)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "LOD3cnxgoZ0",
        "duration": 240,
        "sabi": {
            "start": 64,
            "end": 100,
            "title": "후렴구: 시원하고 힘찬 멜라 사비"
        },
        "publishedAt": "2026-02-15"
    },
    {
        "id": "hina-finale",
        "title": "フィナーレ。 (피날레)",
        "artist": "시라유키 히나",
        "originalArtist": "eill",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "_-uHa5KiR90",
        "duration": 236,
        "sabi": {
            "start": 62,
            "end": 98,
            "title": "후렴구: 아름다운 밤의 피날레"
        },
        "publishedAt": "2024-02-11"
    },
    {
        "id": "mashiro-spring-dream",
        "title": "봄꿈",
        "artist": "네네코 마시로",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "g2",
        "members": [
            "mashiro"
        ],
        "youtubeId": "_8uoathMY0A",
        "duration": 208,
        "sabi": {
            "start": 52,
            "end": 88,
            "title": "후렴구: 따스하게 스며드는 봄꿈"
        },
        "publishedAt": "2024-10-16"
    },
    {
        "id": "mashiro-pale",
        "title": "Pale (페일)",
        "artist": "네네코 마시로",
        "originalArtist": "MIMI",
        "type": "cover",
        "gen": "g2",
        "members": [
            "mashiro"
        ],
        "youtubeId": "pnU-h63twZM",
        "duration": 196,
        "sabi": {
            "start": 50,
            "end": 84,
            "title": "후렴구: 투명하고 아련한 피아노와 보컬"
        },
        "publishedAt": "2023-10-21"
    },
    {
        "id": "mashiro-astronaut",
        "title": "宇宙飛行士のうた (우주 비행사의 노래)",
        "artist": "네네코 마시로",
        "originalArtist": "사카모토 마아야",
        "type": "cover",
        "gen": "g2",
        "members": [
            "mashiro"
        ],
        "youtubeId": "66axQApR3rM",
        "duration": 224,
        "sabi": {
            "start": 58,
            "end": 94,
            "title": "후렴구: 밤하늘을 유영하는 마시로의 음색"
        },
        "publishedAt": "2023-12-25"
    },
    {
        "id": "mashiro-dance-robot",
        "title": "ダンスロボットダンス (댄스 로봇 댄스)",
        "artist": "네네코 마시로",
        "originalArtist": "나유탄 성인",
        "type": "cover",
        "gen": "g2",
        "members": [
            "mashiro"
        ],
        "youtubeId": "DvFUMLxvyvw",
        "duration": 190,
        "sabi": {
            "start": 44,
            "end": 78,
            "title": "후렴구: 중독성 넘치는 댄스 로봇 댄스"
        },
        "publishedAt": "2024-07-05"
    },
    {
        "id": "duet-mashiro-riko-not-devil",
        "title": "悪魔じゃないもん (악마가 아닌걸)",
        "artist": "유즈하 리코 & 네네코 마시로",
        "originalArtist": "DECO*27 x 피노키오피",
        "type": "cover",
        "gen": "g2",
        "members": [
            "mashiro",
            "riko"
        ],
        "youtubeId": "xKA5wKYMFhM",
        "duration": 204,
        "sabi": {
            "start": 50,
            "end": 86,
            "title": "후렴구: 마시로x리코의 통통 튀는 보컬"
        },
        "publishedAt": "2026-05-28"
    },
    {
        "id": "duet-mashiro-shibuki-gladly",
        "title": "はいよろんで (네, 기꺼이)",
        "artist": "네네코 마시로 & 텐코 시부키",
        "originalArtist": "콧치노 켄토",
        "type": "cover",
        "gen": "g2",
        "members": [
            "mashiro",
            "shibuki"
        ],
        "youtubeId": "2qEGFmXROQ4",
        "duration": 182,
        "sabi": {
            "start": 42,
            "end": 76,
            "title": "후렴구: 마시로x시부키의 신나는 에너지"
        },
        "publishedAt": "2026-08-29"
    },
    {
        "id": "lize-asu-no-yozora",
        "title": "アスノヨゾラ哨戒班 (아스노 요조라 초계반)",
        "artist": "아카네 리제",
        "originalArtist": "Orangestar",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "fTqvR0U0EC4",
        "duration": 188,
        "sabi": {
            "start": 54,
            "end": 88,
            "title": "후렴구: 하늘을 찌르는 사이다 고음"
        },
        "publishedAt": "2025-02-04"
    },
    {
        "id": "lize-drowning",
        "title": "Drowning (드로우닝)",
        "artist": "아카네 리제",
        "originalArtist": "WOODZ (조승연)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "CyOAmEihVHs",
        "duration": 252,
        "sabi": {
            "start": 68,
            "end": 108,
            "title": "후렴구: 깊게 빠져드는 감성 보컬"
        },
        "publishedAt": "2024-07-20"
    },
    {
        "id": "lize-utatane",
        "title": "うたたね (선잠)",
        "artist": "아카네 리제",
        "originalArtist": "Leina",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "t6EzltrzGNo",
        "duration": 240,
        "sabi": {
            "start": 64,
            "end": 100,
            "title": "후렴구: 깊은 새벽의 감성 멜로디"
        },
        "publishedAt": "2024-03-02"
    },
    {
        "id": "lize-i-am",
        "title": "僕である為 (나라는 것)",
        "artist": "아카네 리제",
        "originalArtist": "Mrs. GREEN APPLE",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "lbBbNysWWCo",
        "duration": 236,
        "sabi": {
            "start": 62,
            "end": 98,
            "title": "후렴구: 마음을 울리는 리제의 열창"
        },
        "publishedAt": "2023-11-04"
    },
    {
        "id": "lize-surges",
        "title": "Surges (서지스)",
        "artist": "아카네 리제",
        "originalArtist": "Orangestar",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "q2uHl6EJh-k",
        "duration": 186,
        "sabi": {
            "start": 46,
            "end": 80,
            "title": "후렴구: 청춘의 파도처럼 벅차오르는 Surges"
        },
        "publishedAt": "2025-09-20"
    },
    {
        "id": "lize-blue-green",
        "title": "청록 [Blue Rock]",
        "artist": "아카네 리제",
        "originalArtist": "it's",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "3Y7Ek6YSGPE",
        "duration": 234,
        "sabi": {
            "start": 66,
            "end": 102,
            "title": "후렴구: 푸르게 물드는 락 감성"
        },
        "publishedAt": "2026-07-04"
    },
    {
        "id": "lize-drunken",
        "title": "酔いどれ知らず (취기 미지)",
        "artist": "아카네 리제",
        "originalArtist": "Kanaria",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "209_dJOJa0Y",
        "duration": 164,
        "sabi": {
            "start": 38,
            "end": 70,
            "title": "후렴구: 매혹적인 리제의 그루브"
        },
        "publishedAt": "2025-07-13"
    },
    {
        "id": "lize-jpop-mashup",
        "title": "J-POP 메쉬업",
        "artist": "아카네 리제",
        "originalArtist": "J-POP 15곡 메들리",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "090EFw_FDjU",
        "duration": 348,
        "sabi": {
            "start": 90,
            "end": 136,
            "title": "후렴구: 환상적인 J-POP 킬링파트 메들리"
        },
        "publishedAt": "2024-11-09"
    },
    {
        "id": "tabi-journey",
        "title": "여로",
        "artist": "아라하시 타비",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "G5tTozKJRD4",
        "duration": 226,
        "sabi": {
            "start": 60,
            "end": 96,
            "title": "후렴구: 발걸음이 닿는 여로"
        },
        "publishedAt": "2024-12-11"
    },
    {
        "id": "tabi-night-thinking",
        "title": "밤새도록 널 생각해",
        "artist": "아라하시 타비",
        "originalArtist": "TOKOTOKO (西沢さんP)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "39_zaFVluAw",
        "duration": 238,
        "sabi": {
            "start": 64,
            "end": 100,
            "title": "후렴구: 밤새도록 널 생각하는 밤"
        },
        "publishedAt": "2026-06-20"
    },
    {
        "id": "tabi-lady",
        "title": "LADY",
        "artist": "아라하시 타비",
        "originalArtist": "요네즈 켄시",
        "type": "cover",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "mdPLl3he6A0",
        "duration": 218,
        "sabi": {
            "start": 54,
            "end": 88,
            "title": "후렴구: 부드러운 타비의 시티팝 감성"
        },
        "publishedAt": "2026-02-18"
    },
    {
        "id": "duet-tabi-tsuna-one-page",
        "title": "한 페이지가 될 수 있게",
        "artist": "아라하시 타비 & 네코타 츠나",
        "originalArtist": "DAY6",
        "type": "cover",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "X4nHbp5Rm08",
        "duration": 212,
        "sabi": {
            "start": 52,
            "end": 88,
            "title": "후렴구: 청춘의 한 페이지가 될 수 있게"
        },
        "publishedAt": "2026-02-14"
    },
    {
        "id": "tabi-plover",
        "title": "千鳥 (치도리)",
        "artist": "아라하시 타비",
        "originalArtist": "Yorushika (ヨルシカ)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "uBtFoUXR9Qc",
        "duration": 216,
        "sabi": {
            "start": 58,
            "end": 92,
            "title": "후렴구: 물떼새의 날갯짓처럼 감미로운 멜로디"
        },
        "publishedAt": "2026-09-07"
    },
    {
        "id": "tabi-wish-me-luck",
        "title": "행운을 빌어 줘",
        "artist": "아라하시 타비",
        "originalArtist": "원필 (DAY6)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "4nVjnxK4j0c",
        "duration": 242,
        "sabi": {
            "start": 66,
            "end": 104,
            "title": "후렴구: 행운을 빌어 줘"
        },
        "publishedAt": "2026-06-11"
    },
    {
        "id": "tabi-high-hopes",
        "title": "High Hopes",
        "artist": "아라하시 타비",
        "originalArtist": "Panic! At The Disco",
        "type": "cover",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "nwqIoe_3zbE",
        "duration": 194,
        "sabi": {
            "start": 46,
            "end": 82,
            "title": "후렴구: 긍정의 힘 High Hopes"
        },
        "publishedAt": "2026-08-31"
    },
    {
        "id": "tabi-moon-in-the-day",
        "title": "낮에 뜨는 달",
        "artist": "아라하시 타비",
        "originalArtist": "안예은",
        "type": "cover",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "5j8voUwxzmU",
        "duration": 224,
        "sabi": {
            "start": 58,
            "end": 96,
            "title": "후렴구: 동양풍 서정미 넘치는 보컬"
        },
        "publishedAt": "2023-12-08"
    },
    {
        "id": "shibuki-start",
        "title": "START (스타트)",
        "artist": "텐코 시부키",
        "originalArtist": "Mrs. GREEN APPLE",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "zxVe7IxFbgU",
        "duration": 222,
        "sabi": {
            "start": 56,
            "end": 92,
            "title": "후렴구: 시부키의 활기찬 에너지 StaRt"
        },
        "publishedAt": "2026-06-09"
    },
    {
        "id": "shibuki-dear-boy",
        "title": "親愛なるあの子へ (친애하는 소년이여)",
        "artist": "텐코 시부키",
        "originalArtist": "Hump Back",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "AH8sMk7otKU",
        "duration": 184,
        "sabi": {
            "start": 46,
            "end": 80,
            "title": "후렴구: 직진하는 청춘의 응원가"
        },
        "publishedAt": "2026-06-29"
    },
    {
        "id": "shibuki-happy-thought",
        "title": "幸せについて本気出して考えてみた (행복에 대해 생각한 것)",
        "artist": "텐코 시부키",
        "originalArtist": "오오이시 마사요시",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "yA25-F9SJh0",
        "duration": 242,
        "sabi": {
            "start": 64,
            "end": 102,
            "title": "후렴구: 마음에 스며드는 시부키의 노래"
        },
        "publishedAt": "2026-03-21"
    },
    {
        "id": "shibuki-daybreak-frontline",
        "title": "DAYBREAK FRONTLINE (데이브레이크 프론트라인)",
        "artist": "텐코 시부키",
        "originalArtist": "Orangestar",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "I8hFyN32Ysk",
        "duration": 214,
        "sabi": {
            "start": 54,
            "end": 88,
            "title": "후렴구: 새벽을 가르는 질주 보컬"
        },
        "publishedAt": "2026-01-31"
    },
    {
        "id": "shibuki-fox-rain",
        "title": "여우비",
        "artist": "텐코 시부키",
        "originalArtist": "이선희 (내 여자친구는 구미호 OST)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "sWZoIawG0tA",
        "duration": 248,
        "sabi": {
            "start": 68,
            "end": 106,
            "title": "후렴구: 애절하고 아련한 여우비 감성"
        },
        "publishedAt": "2024-08-09"
    },
    {
        "id": "shibuki-tongue-out",
        "title": "あっかんべ (너에게 메롱)",
        "artist": "텐코 시부키",
        "originalArtist": "Hifumi",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "KtZi0BN6lwg",
        "duration": 196,
        "sabi": {
            "start": 48,
            "end": 82,
            "title": "후렴구: 시부키의 장난기 가득한 메롱"
        },
        "publishedAt": "2024-05-16"
    },
    {
        "id": "duet-yuni-rin-ego-rock",
        "title": "エゴロック (에고 록)",
        "artist": "아야츠노 유니 & 아오쿠모 린",
        "originalArtist": "Surii (すりぃ)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin",
            "yuni"
        ],
        "youtubeId": "GhHcaH6bAHQ",
        "duration": 174,
        "sabi": {
            "start": 40,
            "end": 74,
            "title": "후렴구: 유니x린의 신나는 에고 록"
        },
        "publishedAt": "2026-06-03"
    },
    {
        "id": "rin-one-ok-rock",
        "title": "完全感覚Dreamer (완전감각 Dreamer)",
        "artist": "아오쿠모 린",
        "originalArtist": "ONE OK ROCK",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "pgxzbTzvYdY",
        "duration": 252,
        "sabi": {
            "start": 64,
            "end": 100,
            "title": "후렴구: 폭발적인 린의 락 샤우팅"
        },
        "publishedAt": "2026-06-07"
    },
    {
        "id": "rin-love-cold",
        "title": "恋風邪にのせて (사랑 감기에 실려)",
        "artist": "아오쿠모 린",
        "originalArtist": "Vaundy",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "-a6y64hn4DA",
        "duration": 248,
        "sabi": {
            "start": 62,
            "end": 98,
            "title": "후렴구: 감각적인 린의 그루브"
        },
        "publishedAt": "2024-10-12"
    },
    {
        "id": "rin-to-x",
        "title": "To. X",
        "artist": "아오쿠모 린",
        "originalArtist": "태연 (TAEYEON)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "ItUC9TPcb08",
        "duration": 178,
        "sabi": {
            "start": 44,
            "end": 78,
            "title": "후렴구: 섬세하고 감각적인 To. X"
        },
        "publishedAt": "2025-02-15"
    },
    {
        "id": "rin-stay",
        "title": "STAY",
        "artist": "아오쿠모 린",
        "originalArtist": "The Kid LAROI, Justin Bieber",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "KSCTkOn5Niw",
        "duration": 142,
        "sabi": {
            "start": 36,
            "end": 68,
            "title": "후렴구: 린의 리드미컬한 팝 스타일"
        },
        "publishedAt": "2025-11-11"
    },
    {
        "id": "rin-play",
        "title": "PLAY",
        "artist": "아오쿠모 린",
        "originalArtist": "Giga",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "Bhe35DpMlzk",
        "duration": 194,
        "sabi": {
            "start": 48,
            "end": 80,
            "title": "후렴구: 비트를 지배하는 린의 랩&보컬"
        },
        "publishedAt": "2025-08-21"
    },
    {
        "id": "rin-wxy",
        "title": "W/X/Y",
        "artist": "아오쿠모 린",
        "originalArtist": "Tani Yuuki",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "I6bslYOW8Xk",
        "duration": 278,
        "sabi": {
            "start": 72,
            "end": 110,
            "title": "후렴구: 감미로운 R&B 보컬"
        },
        "publishedAt": "2025-03-08"
    },
    {
        "id": "nana-grand-escape",
        "title": "グランドエスケープ (그랜드 이스케이프)",
        "artist": "하나코 나나 (feat. Cliché)",
        "originalArtist": "RADWIMPS",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana",
            "shibuki",
            "rin",
            "riko"
        ],
        "youtubeId": "L-GJ9pYICDM",
        "duration": 298,
        "sabi": {
            "start": 82,
            "end": 124,
            "title": "후렴구: 하늘을 향해 날아오르는 그랜드 이스케이프"
        },
        "publishedAt": "2025-05-10"
    },
    {
        "id": "nana-rain",
        "title": "Rain (레인)",
        "artist": "하나코 나나",
        "originalArtist": "SID (シド)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "aurVmylo4_Y",
        "duration": 256,
        "sabi": {
            "start": 64,
            "end": 102,
            "title": "후렴구: 가슴을 파고드는 나나의 비장한 보컬"
        },
        "publishedAt": "2026-01-19"
    },
    {
        "id": "nana-flight-boat",
        "title": "飛行艇 (비행정)",
        "artist": "하나코 나나",
        "originalArtist": "King Gnu",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "YC-QnlIEbJU",
        "duration": 260,
        "sabi": {
            "start": 66,
            "end": 104,
            "title": "후렴구: 거침없이 나아가는 비행정"
        },
        "publishedAt": "2025-01-27"
    },
    {
        "id": "nana-summer",
        "title": "Summer (서머)",
        "artist": "하나코 나나",
        "originalArtist": "Paul Blanco Feat. BE'O",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "xlXotzq2NqM",
        "duration": 188,
        "sabi": {
            "start": 44,
            "end": 78,
            "title": "후렴구: 그루비한 서머 멜로디"
        },
        "publishedAt": "2025-09-18"
    },
    {
        "id": "nana-enemy",
        "title": "Enemy",
        "artist": "하나코 나나",
        "originalArtist": "Imagine Dragons x J.I.D (아케인 주제곡)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "8vQfO5tT85k",
        "duration": 178,
        "sabi": {
            "start": 42,
            "end": 74,
            "title": "후렴구: 나나의 파워풀한 영어 랩&보컬"
        },
        "publishedAt": "2025-07-06"
    },
    {
        "id": "riko-lilac",
        "title": "ライラック (라일락)",
        "artist": "유즈하 리코",
        "originalArtist": "Mrs. GREEN APPLE",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "yuxa6o1_scc",
        "duration": 212,
        "sabi": {
            "start": 56,
            "end": 90,
            "title": "후렴구: 청량하고 맑은 리코의 라이락"
        },
        "publishedAt": "2026-09-02"
    },
    {
        "id": "duet-riko-shibuki-you",
        "title": "君じゃなきゃダメみたい (네가 아니면 안 될 것 같아)",
        "artist": "유즈하 리코 & 텐코 시부키",
        "originalArtist": "오오이시 마사요시 (노자키군 OP)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko",
            "shibuki"
        ],
        "youtubeId": "xhBUCzzfcw8",
        "duration": 234,
        "sabi": {
            "start": 60,
            "end": 96,
            "title": "후렴구: 리코x시부키의 상큼한 듀엣 하모니"
        },
        "publishedAt": "2026-08-11"
    },
    {
        "id": "duet-rin-riko-waste-sorting",
        "title": "ゴミ捨て場 (우리들! 쓰레기 분리수거단)",
        "artist": "아오쿠모 린 & 유즈하 리코",
        "originalArtist": "Giga & TeddyLoid",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin",
            "riko"
        ],
        "youtubeId": "MhdJaaEhiHc",
        "duration": 194,
        "sabi": {
            "start": 46,
            "end": 80,
            "title": "후렴구: 린x리코의 귀엽고 힙한 랩 케미"
        },
        "publishedAt": "2026-07-31"
    },
    {
        "id": "riko-henceforth",
        "title": "Henceforth (헨스포스)",
        "artist": "유즈하 리코",
        "originalArtist": "Orangestar",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "apj5_-osMd4",
        "duration": 208,
        "sabi": {
            "start": 54,
            "end": 88,
            "title": "후렴구: 여름 하늘을 날아오르는 청량 보컬"
        },
        "publishedAt": "2025-06-07"
    },
    {
        "id": "riko-heroine",
        "title": "ヒロイン (히로인)",
        "artist": "유즈하 리코",
        "originalArtist": "back number",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "qao2gYtY7bs",
        "duration": 296,
        "sabi": {
            "start": 78,
            "end": 118,
            "title": "후렴구: 겨울 눈꽃처럼 내려앉는 감성"
        },
        "publishedAt": "2025-12-25"
    },
    {
        "id": "riko-kaiju-flower",
        "title": "怪獣の花唄 (괴수의 꽃노래)",
        "artist": "유즈하 리코",
        "originalArtist": "Vaundy",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "CtXv2_NBBOU",
        "duration": 224,
        "sabi": {
            "start": 58,
            "end": 94,
            "title": "후렴구: 리코만의 맑고 순수한 열창"
        },
        "publishedAt": "2024-07-21"
    },
    {
        "id": "stel-zQp6ZZAT6ew",
        "title": "mosi mosi? (모시모시?)",
        "artist": "텐코 시부키",
        "originalArtist": "楽音 (사사네)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "zQp6ZZAT6ew",
        "duration": 164,
        "sabi": {
            "start": 57,
            "end": 92,
            "title": "후렴구: mosi mosi? (楽音 / 사사네"
        },
        "publishedAt": "2026-09-02"
    },
    {
        "id": "stel-SiBzI2htX2o",
        "title": "転がる岩、君に朝が降る (구르는 바위, 네게 아침이 내린다)",
        "artist": "네네코 마시로",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "mashiro"
        ],
        "youtubeId": "SiBzI2htX2o",
        "duration": 274,
        "sabi": {
            "start": 95,
            "end": 130,
            "title": "후렴구: 구르는 바위, 네게 아침이 내린다 ["
        },
        "publishedAt": "2026-09-01"
    },
    {
        "id": "stel-8shKFjkHabo",
        "title": "青い珊瑚礁 (푸른 산호초)",
        "artist": "사키하네 후야",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "huya"
        ],
        "youtubeId": "8shKFjkHabo",
        "duration": 220,
        "sabi": {
            "start": 77,
            "end": 112,
            "title": "후렴구: 푸른 산호초(青い珊瑚礁) - 松田 聖"
        },
        "publishedAt": "2026-08-31"
    },
    {
        "id": "stel-YXIz7U42pgk",
        "title": "ノンブレス・オブリージュ (논브레스 오블리주)",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "YXIz7U42pgk",
        "duration": 212,
        "sabi": {
            "start": 74,
            "end": 109,
            "title": "후렴구: 논브레스 오블리주 [ノンブレス・オブリ"
        },
        "publishedAt": "2026-08-16"
    },
    {
        "id": "stel-9S3if_u5n_Q",
        "title": "少女レイ (소녀 레이)",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "9S3if_u5n_Q",
        "duration": 290,
        "sabi": {
            "start": 101,
            "end": 136,
            "title": "후렴구: 소녀레이"
        },
        "publishedAt": "2026-08-11"
    },
    {
        "id": "stel-wu2a0AeQOCc",
        "title": "미랫빛 라이더 (Mirairo Rider)",
        "artist": "아카네 리제",
        "originalArtist": "명일방주: 엔드필드 EP",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "wu2a0AeQOCc",
        "duration": 236,
        "sabi": {
            "start": 82,
            "end": 117,
            "title": "후렴구: 「명일방주: 엔드필드」 리노 EP -"
        },
        "publishedAt": "2026-08-10"
    },
    {
        "id": "stel-gkmnG2pWzys",
        "title": "喜劇 (희극)",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "gkmnG2pWzys",
        "duration": 232,
        "sabi": {
            "start": 81,
            "end": 116,
            "title": "후렴구: 희극 (Comedy) [喜劇 / 호시"
        },
        "publishedAt": "2026-08-07"
    },
    {
        "id": "stel-dhudKbeIMJg",
        "title": "サマータイムレコード (서머타임 레코드)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "dhudKbeIMJg",
        "duration": 276,
        "sabi": {
            "start": 96,
            "end": 131,
            "title": "후렴구: 서머타임레코드 [サマータイムレコード"
        },
        "publishedAt": "2026-07-15"
    },
    {
        "id": "stel-y1nUYj_D1Es",
        "title": "千鳥 (치도리)",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "y1nUYj_D1Es",
        "duration": 252,
        "sabi": {
            "start": 88,
            "end": 123,
            "title": "후렴구: 물떼새(ヨルシカ - 千鳥)"
        },
        "publishedAt": "2026-06-28"
    },
    {
        "id": "stel-_pTBkDP1TE0",
        "title": "Loveit? (러빗)",
        "artist": "하나코 나나",
        "originalArtist": "biz×ZERA",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "_pTBkDP1TE0",
        "duration": 147,
        "sabi": {
            "start": 51,
            "end": 86,
            "title": "후렴구: Loveit? - biz×ZERA(f"
        },
        "publishedAt": "2026-06-22"
    },
    {
        "id": "stel-_t4OxKtCHrg",
        "title": "舞台に立って (무대에 서서)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "_t4OxKtCHrg",
        "duration": 211,
        "sabi": {
            "start": 73,
            "end": 108,
            "title": "후렴구: Standing on the Stag"
        },
        "publishedAt": "2026-06-11"
    },
    {
        "id": "stel-VTTQJNcmlD0",
        "title": "また明日 (내일 또 보자)",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "VTTQJNcmlD0",
        "duration": 333,
        "sabi": {
            "start": 116,
            "end": 151,
            "title": "후렴구: 내일 또 보자(またあした) - ふわり"
        },
        "publishedAt": "2026-06-10"
    },
    {
        "id": "stel-f7uaxrWNIdE",
        "title": "妄想アスパルテーム (망상 아스파탐)",
        "artist": "네네코 마시로",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "mashiro"
        ],
        "youtubeId": "f7uaxrWNIdE",
        "duration": 150,
        "sabi": {
            "start": 52,
            "end": 87,
            "title": "후렴구: Delusional Aspartame"
        },
        "publishedAt": "2026-06-10"
    },
    {
        "id": "stel-yRKJ5-vcMUI",
        "title": "春愁 (춘수)",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "yRKJ5-vcMUI",
        "duration": 186,
        "sabi": {
            "start": 65,
            "end": 100,
            "title": "후렴구: Mrs. GREEN APPLE - 춘"
        },
        "publishedAt": "2026-05-27"
    },
    {
        "id": "stel-SUJm8SX87DY",
        "title": "drivers license",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "SUJm8SX87DY",
        "duration": 245,
        "sabi": {
            "start": 85,
            "end": 120,
            "title": "후렴구: drivers license - Ol"
        },
        "publishedAt": "2026-05-24"
    },
    {
        "id": "stel-L-pn_xrqQkQ",
        "title": "Hollowness (할로우니스)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "L-pn_xrqQkQ",
        "duration": 321,
        "sabi": {
            "start": 112,
            "end": 147,
            "title": "후렴구: Hollowness - 「 美波」ㅣA"
        },
        "publishedAt": "2026-05-23"
    },
    {
        "id": "stel-bRa_zAaaCCE",
        "title": "おねがいダーリン (부탁해 달링)",
        "artist": "아야츠노 유니 x 하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "group",
        "members": [
            "yuni",
            "nana"
        ],
        "youtubeId": "bRa_zAaaCCE",
        "duration": 195,
        "sabi": {
            "start": 68,
            "end": 103,
            "title": "후렴구: Onegai Darling \"Oneg"
        },
        "publishedAt": "2026-05-21"
    },
    {
        "id": "stel-xwuVYaJYERo",
        "title": "私に花束 (나에게 꽃다발)",
        "artist": "텐코 시부키",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "xwuVYaJYERo",
        "duration": 228,
        "sabi": {
            "start": 79,
            "end": 114,
            "title": "후렴구: 나에게 꽃다발 [わたしに花束 - Ad"
        },
        "publishedAt": "2026-05-18"
    },
    {
        "id": "stel-KmH0RhhenzE",
        "title": "deja vu",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "KmH0RhhenzE",
        "duration": 218,
        "sabi": {
            "start": 76,
            "end": 111,
            "title": "후렴구: Deja vu (Olivia Rodr"
        },
        "publishedAt": "2026-05-10"
    },
    {
        "id": "stel-jTUOSAmCqeI",
        "title": "ダンスホール (댄스홀)",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "jTUOSAmCqeI",
        "duration": 202,
        "sabi": {
            "start": 70,
            "end": 105,
            "title": "후렴구: Dancehall (Mrs. GREE"
        },
        "publishedAt": "2026-05-03"
    },
    {
        "id": "stel--RrbCkl3YJo",
        "title": "メルト (멜트)",
        "artist": "사키하네 후야",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "huya"
        ],
        "youtubeId": "-RrbCkl3YJo",
        "duration": 271,
        "sabi": {
            "start": 94,
            "end": 129,
            "title": "후렴구: Melt CPK! Remix (初音ミ"
        },
        "publishedAt": "2026-04-30"
    },
    {
        "id": "stel-C0hOHzutBRI",
        "title": "オレンジ (오렌지)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "C0hOHzutBRI",
        "duration": 352,
        "sabi": {
            "start": 123,
            "end": 158,
            "title": "후렴구: Orange [ オレンジ / Your"
        },
        "publishedAt": "2026-04-30"
    },
    {
        "id": "stel-CU8hsIhmkwc",
        "title": "orion (오리온)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "CU8hsIhmkwc",
        "duration": 287,
        "sabi": {
            "start": 100,
            "end": 135,
            "title": "후렴구: orion - [Kenshi Yone"
        },
        "publishedAt": "2026-04-19"
    },
    {
        "id": "stel-5rQSMZLi5z4",
        "title": "アイネクライネ (아이네 클라이네)",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "5rQSMZLi5z4",
        "duration": 289,
        "sabi": {
            "start": 101,
            "end": 136,
            "title": "후렴구: Eine Kleine (アイネクライネ"
        },
        "publishedAt": "2026-04-19"
    },
    {
        "id": "stel-LxqwR1KE81o",
        "title": "アカシア (아카시아)",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "LxqwR1KE81o",
        "duration": 263,
        "sabi": {
            "start": 92,
            "end": 127,
            "title": "후렴구: Acacia (BUMP OF CHIC"
        },
        "publishedAt": "2026-04-18"
    },
    {
        "id": "stel-fLLX2R-RwVE",
        "title": "かくれんぼ (숨바꼭질)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "fLLX2R-RwVE",
        "duration": 300,
        "sabi": {
            "start": 105,
            "end": 140,
            "title": "후렴구: 숨바꼭질"
        },
        "publishedAt": "2026-04-13"
    },
    {
        "id": "stel-DHG3s8GF1DM",
        "title": "Stellar Stellar",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "DHG3s8GF1DM",
        "duration": 303,
        "sabi": {
            "start": 106,
            "end": 141,
            "title": "후렴구: Stellar Stellar - [星"
        },
        "publishedAt": "2026-03-29"
    },
    {
        "id": "stel-prBtBX0wGxc",
        "title": "恋風邪にのせて (사랑 감기에 실려)",
        "artist": "아라하시 타비",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "prBtBX0wGxc",
        "duration": 256,
        "sabi": {
            "start": 89,
            "end": 124,
            "title": "후렴구: Carried on a Love Co"
        },
        "publishedAt": "2026-03-28"
    },
    {
        "id": "stel-cWnykOC5b_c",
        "title": "phony (포니)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "cWnykOC5b_c",
        "duration": 190,
        "sabi": {
            "start": 66,
            "end": 101,
            "title": "후렴구: phony"
        },
        "publishedAt": "2026-03-26"
    },
    {
        "id": "stel-RLKm8ymJPlo",
        "title": "Oh...",
        "artist": "아오쿠모 린",
        "originalArtist": "타다노 카에데 (只野 楓)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "RLKm8ymJPlo",
        "duration": 222,
        "sabi": {
            "start": 77,
            "end": 112,
            "title": "후렴구: Oh..."
        },
        "publishedAt": "2026-03-25"
    },
    {
        "id": "stel-IoBUWPQ3dwc",
        "title": "One Last Kiss",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "IoBUWPQ3dwc",
        "duration": 258,
        "sabi": {
            "start": 90,
            "end": 125,
            "title": "후렴구: One Last Kiss - 『宇多田"
        },
        "publishedAt": "2026-03-22"
    },
    {
        "id": "stel-5uOxZswwBx4",
        "title": "メイド至上主義 (메이드 지상주의)",
        "artist": "네네코 마시로 x 아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "group",
        "members": [
            "mashiro",
            "rin"
        ],
        "youtubeId": "5uOxZswwBx4",
        "duration": 149,
        "sabi": {
            "start": 52,
            "end": 87,
            "title": "후렴구: Maid Supremacy [メイド☆"
        },
        "publishedAt": "2026-03-14"
    },
    {
        "id": "stel-LOpOiL7S_0I",
        "title": "しわ (주름)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "LOpOiL7S_0I",
        "duration": 276,
        "sabi": {
            "start": 96,
            "end": 131,
            "title": "후렴구: 주름 맞추기 [しわあわせ - Vaun"
        },
        "publishedAt": "2026-02-27"
    },
    {
        "id": "stel-QXUxnxoOIOI",
        "title": "AIZO (아이조)",
        "artist": "아오쿠모 린",
        "originalArtist": "King Gnu",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "QXUxnxoOIOI",
        "duration": 218,
        "sabi": {
            "start": 76,
            "end": 111,
            "title": "후렴구: AIZO"
        },
        "publishedAt": "2026-02-24"
    },
    {
        "id": "stel-noKfckxJ2PU",
        "title": "罪と罰 (죄와 벌)",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "noKfckxJ2PU",
        "duration": 287,
        "sabi": {
            "start": 100,
            "end": 135,
            "title": "후렴구: 죄와 벌(罪と罰) [椎名林檎(시이나"
        },
        "publishedAt": "2026-02-17"
    },
    {
        "id": "stel-NAu_CVmP-bw",
        "title": "海の幽霊 (바다의 유령)",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "NAu_CVmP-bw",
        "duration": 235,
        "sabi": {
            "start": 82,
            "end": 117,
            "title": "후렴구: 바다의 유령 (海の幽霊) - Kens"
        },
        "publishedAt": "2026-02-16"
    },
    {
        "id": "stel-9a_qB79ntPQ",
        "title": "chocolate box",
        "artist": "아야츠노 유니 x 아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "group",
        "members": [
            "yuni",
            "rin"
        ],
        "youtubeId": "9a_qB79ntPQ",
        "duration": 239,
        "sabi": {
            "start": 83,
            "end": 118,
            "title": "후렴구: choco"
        },
        "publishedAt": "2026-02-14"
    },
    {
        "id": "stel-Sj51pWOnW1o",
        "title": "Chewing Love",
        "artist": "아야츠노 유니 x 사키하네 후야",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "yuni",
            "huya"
        ],
        "youtubeId": "Sj51pWOnW1o",
        "duration": 181,
        "sabi": {
            "start": 63,
            "end": 98,
            "title": "후렴구: CHEWING LUV [아야츠노 유니"
        },
        "publishedAt": "2026-02-14"
    },
    {
        "id": "stel-vD5g9qVz4zg",
        "title": "ラブレター (러브레터)",
        "artist": "텐코 시부키",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "vD5g9qVz4zg",
        "duration": 219,
        "sabi": {
            "start": 76,
            "end": 111,
            "title": "후렴구: ラブレター (YOASOBI)"
        },
        "publishedAt": "2026-02-14"
    },
    {
        "id": "stel-lBtlpVXmbYY",
        "title": "夜に駆ける (밤을 달리다)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "lBtlpVXmbYY",
        "duration": 260,
        "sabi": {
            "start": 91,
            "end": 126,
            "title": "후렴구: 밤을 달리다 夜に駆ける - YOASO"
        },
        "publishedAt": "2026-01-25"
    },
    {
        "id": "stel-Nmkp68aUw1o",
        "title": "かがりびと (카가리비토)",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "Nmkp68aUw1o",
        "duration": 309,
        "sabi": {
            "start": 108,
            "end": 143,
            "title": "후렴구: 카가리비토 [カガリビト - mills"
        },
        "publishedAt": "2026-01-24"
    },
    {
        "id": "stel-WykYeuqGxh8",
        "title": "メルト (멜트)",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "WykYeuqGxh8",
        "duration": 264,
        "sabi": {
            "start": 92,
            "end": 127,
            "title": "후렴구: Melt (メルト/supercell"
        },
        "publishedAt": "2026-01-05"
    },
    {
        "id": "stel-jyU6GkzD2CA",
        "title": "死神 (사신)",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "jyU6GkzD2CA",
        "duration": 182,
        "sabi": {
            "start": 63,
            "end": 98,
            "title": "후렴구: 사신 (요네즈 켄시)"
        },
        "publishedAt": "2025-12-30"
    },
    {
        "id": "stel-YorjOBy85ck",
        "title": "クリスマスソング (크리스마스 송)",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "YorjOBy85ck",
        "duration": 257,
        "sabi": {
            "start": 89,
            "end": 124,
            "title": "후렴구: 크리스마스 송(クリスマスソング)"
        },
        "publishedAt": "2025-12-25"
    },
    {
        "id": "stel-30dd8K_i-38",
        "title": "メリクリ (메리크리)",
        "artist": "텐코 시부키",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "30dd8K_i-38",
        "duration": 217,
        "sabi": {
            "start": 75,
            "end": 110,
            "title": "후렴구: 메리크리(メリクリ) BoA"
        },
        "publishedAt": "2025-12-25"
    },
    {
        "id": "stel-e2Jn_8JWtNw",
        "title": "No.1 Rock Star",
        "artist": "아라하시 타비",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "e2Jn_8JWtNw",
        "duration": 174,
        "sabi": {
            "start": 60,
            "end": 95,
            "title": "후렴구: Number one rockstar"
        },
        "publishedAt": "2025-12-25"
    },
    {
        "id": "stel-vPFzWl54pt0",
        "title": "惨生活 (참생활)",
        "artist": "아야츠노 유니",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "yuni"
        ],
        "youtubeId": "vPFzWl54pt0",
        "duration": 243,
        "sabi": {
            "start": 85,
            "end": 120,
            "title": "후렴구: 참생활 「真生活」 (KAKASHI)"
        },
        "publishedAt": "2025-12-25"
    },
    {
        "id": "stel-zHbh6KO1dFo",
        "title": "All I Want for Christmas Is You",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "zHbh6KO1dFo",
        "duration": 133,
        "sabi": {
            "start": 46,
            "end": 81,
            "title": "후렴구: All I Want For Chris"
        },
        "publishedAt": "2025-12-24"
    },
    {
        "id": "stel-rRvumOvx21Y",
        "title": "ケセラセラ (케세라세라)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "rRvumOvx21Y",
        "duration": 308,
        "sabi": {
            "start": 107,
            "end": 142,
            "title": "후렴구: 케세라세라 [Mrs. GREEN AP"
        },
        "publishedAt": "2025-12-18"
    },
    {
        "id": "stel-td73oLSQug0",
        "title": "TOMBOY",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "td73oLSQug0",
        "duration": 179,
        "sabi": {
            "start": 62,
            "end": 97,
            "title": "후렴구: 토도로키 하지메 (轟はじめ) x 하나"
        },
        "publishedAt": "2025-12-05"
    },
    {
        "id": "stel-R_B4tmy2DVA",
        "title": "出航 (출항)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "R_B4tmy2DVA",
        "duration": 208,
        "sabi": {
            "start": 72,
            "end": 107,
            "title": "후렴구: Weigh Anchor [抜錨 (Ba"
        },
        "publishedAt": "2025-12-04"
    },
    {
        "id": "stel-eYaX9aDtlmA",
        "title": "渇きを叫べ (목마름을 외치다)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "eYaX9aDtlmA",
        "duration": 254,
        "sabi": {
            "start": 88,
            "end": 123,
            "title": "후렴구: 목마름을 외치다 (美波 - カワキヲア"
        },
        "publishedAt": "2025-11-27"
    },
    {
        "id": "stel-9kvoxFiYmWU",
        "title": "瞬き (깜빡임)",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "9kvoxFiYmWU",
        "duration": 326,
        "sabi": {
            "start": 114,
            "end": 149,
            "title": "후렴구: 깜빡임 (瞬き, back number"
        },
        "publishedAt": "2025-11-21"
    },
    {
        "id": "stel-bJqdy8925Oc",
        "title": "命に嫌われている。 (생명에게 미움받고 있어)",
        "artist": "텐코 시부키",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "bJqdy8925Oc",
        "duration": 257,
        "sabi": {
            "start": 89,
            "end": 124,
            "title": "후렴구: 생명에게 미움받고 있어 (命に嫌われて"
        },
        "publishedAt": "2025-11-14"
    },
    {
        "id": "stel-lZHyUw7LWSw",
        "title": "水平線 (수평선)",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "lZHyUw7LWSw",
        "duration": 286,
        "sabi": {
            "start": 100,
            "end": 135,
            "title": "후렴구: 수평선 (水平線, back numbe"
        },
        "publishedAt": "2025-11-13"
    },
    {
        "id": "stel-Ip25Jhh5zU0",
        "title": "IRIS OUT",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "Ip25Jhh5zU0",
        "duration": 148,
        "sabi": {
            "start": 51,
            "end": 86,
            "title": "후렴구: IRIS OUT (요네즈 켄시)"
        },
        "publishedAt": "2025-11-09"
    },
    {
        "id": "stel-EIii4EXsfsU",
        "title": "Jane Doe",
        "artist": "시라유키 히나 x 아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "group",
        "members": [
            "hina",
            "rin"
        ],
        "youtubeId": "EIii4EXsfsU",
        "duration": 235,
        "sabi": {
            "start": 82,
            "end": 117,
            "title": "후렴구: JANE DOE (Kenshi Yon"
        },
        "publishedAt": "2025-10-27"
    },
    {
        "id": "stel-eHiPI6fybFo",
        "title": "Dynamite",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "eHiPI6fybFo",
        "duration": 202,
        "sabi": {
            "start": 70,
            "end": 105,
            "title": "후렴구: Nerissa Ravencroft x"
        },
        "publishedAt": "2025-10-26"
    },
    {
        "id": "stel-nknH0KshgpY",
        "title": "宿命 (숙명)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "nknH0KshgpY",
        "duration": 283,
        "sabi": {
            "start": 99,
            "end": 134,
            "title": "후렴구: 숙명 (Official髭男dism -"
        },
        "publishedAt": "2025-10-25"
    },
    {
        "id": "stel-aH8Io8klASU",
        "title": "Jane Doe",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "aH8Io8klASU",
        "duration": 236,
        "sabi": {
            "start": 82,
            "end": 117,
            "title": "후렴구: JANE DOE (Kenshi Yon"
        },
        "publishedAt": "2025-10-23"
    },
    {
        "id": "stel-6gEc7lUi6xs",
        "title": "울려퍼져라 (ヒビカセ / Hibikase)",
        "artist": "텐코 시부키 x 하나코 나나",
        "originalArtist": "Giga",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki",
            "nana"
        ],
        "youtubeId": "6gEc7lUi6xs",
        "duration": 261,
        "sabi": {
            "start": 91,
            "end": 126,
            "title": "후렴구: 울려퍼져라 (Hibikase ヒビカセ"
        },
        "publishedAt": "2025-10-21"
    },
    {
        "id": "stel-rxarDgejkZg",
        "title": "IRIS OUT",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "rxarDgejkZg",
        "duration": 150,
        "sabi": {
            "start": 52,
            "end": 87,
            "title": "후렴구: IRIS OUT (요네즈 켄시)"
        },
        "publishedAt": "2025-10-19"
    },
    {
        "id": "stel-SIBtVNjRois",
        "title": "バニーガール (바니걸)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "SIBtVNjRois",
        "duration": 218,
        "sabi": {
            "start": 76,
            "end": 111,
            "title": "후렴구: Bunny Girl (AKASAKI)"
        },
        "publishedAt": "2025-10-01"
    },
    {
        "id": "stel-aUZPqPyLD9s",
        "title": "ドンドン前へ! (쿵쿵 앞으로!)",
        "artist": "네네코 마시로",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "mashiro"
        ],
        "youtubeId": "aUZPqPyLD9s",
        "duration": 95,
        "sabi": {
            "start": 33,
            "end": 68,
            "title": "후렴구: とんとんまーえ！(쿵쿵 앞-으로!) -"
        },
        "publishedAt": "2025-09-28"
    },
    {
        "id": "stel-icR-Tg7YZwY",
        "title": "プロポーズ (프로포즈)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "icR-Tg7YZwY",
        "duration": 241,
        "sabi": {
            "start": 84,
            "end": 119,
            "title": "후렴구: 프로포즈(プロポーズ)ㅣ아카네 리"
        },
        "publishedAt": "2025-09-27"
    },
    {
        "id": "stel-1rPwUSi_1SA",
        "title": "Soda Pop",
        "artist": "아라하시 타비",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "1rPwUSi_1SA",
        "duration": 151,
        "sabi": {
            "start": 52,
            "end": 87,
            "title": "후렴구: SODA POP"
        },
        "publishedAt": "2025-09-27"
    },
    {
        "id": "stel-Tejq1P1TF-M",
        "title": "美少女無罪♡パイレーツ (미소녀무죄♡파이레츠)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "Tejq1P1TF-M",
        "duration": 220,
        "sabi": {
            "start": 77,
            "end": 112,
            "title": "후렴구: 미소녀무죄♡파이레츠 (美少女無罪♡パイ"
        },
        "publishedAt": "2025-09-21"
    },
    {
        "id": "stel-B5tz8rOMPlU",
        "title": "悪魔の子 (악마의 아이)",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "B5tz8rOMPlU",
        "duration": 233,
        "sabi": {
            "start": 81,
            "end": 116,
            "title": "후렴구: 악마의 아이 (悪魔の子)"
        },
        "publishedAt": "2025-09-18"
    },
    {
        "id": "stel-Dy90S1wHTpM",
        "title": "全方向美少女 (전방향 미소녀)",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "Dy90S1wHTpM",
        "duration": 129,
        "sabi": {
            "start": 45,
            "end": 80,
            "title": "후렴구: 전방향 미소녀 (全方向美少女 / no"
        },
        "publishedAt": "2025-09-17"
    },
    {
        "id": "stel--uRxUMJ-exw",
        "title": "Healer",
        "artist": "아라하시 타비",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "-uRxUMJ-exw",
        "duration": 228,
        "sabi": {
            "start": 79,
            "end": 114,
            "title": "후렴구: Healer"
        },
        "publishedAt": "2025-09-07"
    },
    {
        "id": "stel-AXfEu8_-d-k",
        "title": "シャンティ (샹티)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "AXfEu8_-d-k",
        "duration": 171,
        "sabi": {
            "start": 59,
            "end": 94,
            "title": "후렴구: シャンティ(SHANTI) [wotak"
        },
        "publishedAt": "2025-08-31"
    },
    {
        "id": "stel-WICzT2lsQa8",
        "title": "POP IN 2",
        "artist": "아야츠노 유니 x 아카네 리제 x 유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "group",
        "members": [
            "yuni",
            "lize",
            "riko"
        ],
        "youtubeId": "WICzT2lsQa8",
        "duration": 268,
        "sabi": {
            "start": 93,
            "end": 128,
            "title": "후렴구: POP IN 2 (최애의 아이 OST"
        },
        "publishedAt": "2025-08-30"
    },
    {
        "id": "stel-m0Db3CAxzsE",
        "title": "群青 (군청)",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "m0Db3CAxzsE",
        "duration": 249,
        "sabi": {
            "start": 87,
            "end": 122,
            "title": "후렴구: YOASOBI - 군청(群青)"
        },
        "publishedAt": "2025-08-27"
    },
    {
        "id": "stel-1HCo6-YL9AY",
        "title": "Refrain (리프레인)",
        "artist": "아라하시 타비",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "1HCo6-YL9AY",
        "duration": 290,
        "sabi": {
            "start": 101,
            "end": 136,
            "title": "후렴구: Ref:rain - Aimer"
        },
        "publishedAt": "2025-08-26"
    },
    {
        "id": "stel-Nt9LQLycIZk",
        "title": "KING",
        "artist": "텐코 시부키 x 아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki",
            "rin"
        ],
        "youtubeId": "Nt9LQLycIZk",
        "duration": 137,
        "sabi": {
            "start": 47,
            "end": 82,
            "title": "후렴구: KING (Kanaria)"
        },
        "publishedAt": "2025-08-24"
    },
    {
        "id": "stel-HgHP9deY17g",
        "title": "灰色と青 (잿빛과 푸름)",
        "artist": "아오쿠모 린 x 유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin",
            "riko"
        ],
        "youtubeId": "HgHP9deY17g",
        "duration": 333,
        "sabi": {
            "start": 116,
            "end": 151,
            "title": "후렴구: 잿빛과 푸름 (灰色と青)"
        },
        "publishedAt": "2025-08-17"
    },
    {
        "id": "stel-qCUeBAUMv80",
        "title": "Cherry Pop",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "qCUeBAUMv80",
        "duration": 141,
        "sabi": {
            "start": 49,
            "end": 84,
            "title": "후렴구: 체리 팝 (チェリーポップ)"
        },
        "publishedAt": "2025-08-14"
    },
    {
        "id": "stel-d281GlN0nWo",
        "title": "青と夏 (푸름과 여름)",
        "artist": "텐코 시부키",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "d281GlN0nWo",
        "duration": 276,
        "sabi": {
            "start": 96,
            "end": 131,
            "title": "후렴구: 푸름과 여름 (Mrs. GREEN A"
        },
        "publishedAt": "2025-08-09"
    },
    {
        "id": "stel-5u6yVIVXF60",
        "title": "死ぬのがいいわ (죽는 게 나아)",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "5u6yVIVXF60",
        "duration": 192,
        "sabi": {
            "start": 67,
            "end": 102,
            "title": "후렴구: Shinunoga E-Wa [Fuji"
        },
        "publishedAt": "2025-08-07"
    },
    {
        "id": "stel-cu9oCSWGFIM",
        "title": "걘 아니야 Pt.2",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "cu9oCSWGFIM",
        "duration": 220,
        "sabi": {
            "start": 77,
            "end": 112,
            "title": "후렴구: 걘 아니야 Pt.2 [페노메코 (PE"
        },
        "publishedAt": "2025-08-05"
    },
    {
        "id": "stel-KJzmhOkm4-E",
        "title": "걘 아니야 Pt.1",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "KJzmhOkm4-E",
        "duration": 218,
        "sabi": {
            "start": 76,
            "end": 111,
            "title": "후렴구: 걘 아니야 Pt.1 [지코 (ZICO"
        },
        "publishedAt": "2025-08-05"
    },
    {
        "id": "stel-m5XU_4r1yV0",
        "title": "いーあるふぁんくらぶ (하나 둘 팬클럽)",
        "artist": "네네코 마시로",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "mashiro"
        ],
        "youtubeId": "m5XU_4r1yV0",
        "duration": 239,
        "sabi": {
            "start": 83,
            "end": 118,
            "title": "후렴구: 하나 둘 팬클럽 (いーあるふぁんくらぶ"
        },
        "publishedAt": "2025-08-06"
    },
    {
        "id": "stel-JarYu85ctNY",
        "title": "Golden",
        "artist": "아카네 리제 x 아오쿠모 린 x 하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "group",
        "members": [
            "lize",
            "rin",
            "nana"
        ],
        "youtubeId": "JarYu85ctNY",
        "duration": 198,
        "sabi": {
            "start": 69,
            "end": 104,
            "title": "후렴구: Golden - HUNTR/X (KP"
        },
        "publishedAt": "2025-08-01"
    },
    {
        "id": "stel-WKY-KFCvm-A",
        "title": "Summertime",
        "artist": "시라유키 히나 x 하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "group",
        "members": [
            "hina",
            "nana"
        ],
        "youtubeId": "WKY-KFCvm-A",
        "duration": 251,
        "sabi": {
            "start": 87,
            "end": 122,
            "title": "후렴구: Summertime (cinnamon"
        },
        "publishedAt": "2025-07-30"
    },
    {
        "id": "stel-wfZANe71KcM",
        "title": "W●RK",
        "artist": "아오쿠모 린 x 하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin",
            "nana"
        ],
        "youtubeId": "wfZANe71KcM",
        "duration": 201,
        "sabi": {
            "start": 70,
            "end": 105,
            "title": "후렴구: Ｗ●ＲＫ (ꉈꀧ꒒꒒ꁄꍈꍈꀧ꒦ꉈ ꉣꅔꎡ"
        },
        "publishedAt": "2025-07-24"
    },
    {
        "id": "stel-hasPSCi2Q0g",
        "title": "ドンドン前へ! (쿵쿵 앞으로!)",
        "artist": "텐코 시부키 x 아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki",
            "rin"
        ],
        "youtubeId": "hasPSCi2Q0g",
        "duration": 95,
        "sabi": {
            "start": 33,
            "end": 68,
            "title": "후렴구: とんとんまーえ！(쿵쿵 앞-으로!)"
        },
        "publishedAt": "2025-07-13"
    },
    {
        "id": "stel-i5ZEIsWt0Fk",
        "title": "Summertime",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "i5ZEIsWt0Fk",
        "duration": 223,
        "sabi": {
            "start": 78,
            "end": 113,
            "title": "후렴구: Summertime [이터널 리턴 O"
        },
        "publishedAt": "2025-07-11"
    },
    {
        "id": "stel-ZJ7TFaFyYwc",
        "title": "トウキョウ・シャンディ・ランデヴ (도쿄 션디 랑데부)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "ZJ7TFaFyYwc",
        "duration": 186,
        "sabi": {
            "start": 65,
            "end": 100,
            "title": "후렴구: 도쿄 섄디 랑데부 (トウキョウ・シャン"
        },
        "publishedAt": "2025-07-06"
    },
    {
        "id": "stel-1HSTjpAEgVY",
        "title": "星座になれたら (별자리가 될 수 있다면)",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "1HSTjpAEgVY",
        "duration": 260,
        "sabi": {
            "start": 91,
            "end": 126,
            "title": "후렴구: If I could be a cons"
        },
        "publishedAt": "2025-07-05"
    },
    {
        "id": "stel-9KFsI34I1bs",
        "title": "UNDEAD",
        "artist": "텐코 시부키",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "9KFsI34I1bs",
        "duration": 187,
        "sabi": {
            "start": 65,
            "end": 100,
            "title": "후렴구: UNDEAD (YOASOBI)"
        },
        "publishedAt": "2025-07-05"
    },
    {
        "id": "stel-fAgAE9JmnOs",
        "title": "LADY",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "fAgAE9JmnOs",
        "duration": 209,
        "sabi": {
            "start": 73,
            "end": 108,
            "title": "후렴구: LADY - KenshiYonezu("
        },
        "publishedAt": "2025-06-30"
    },
    {
        "id": "stel-3qRN6mQJ4K4",
        "title": "야화 (Night Flower)",
        "artist": "아라하시 타비 x 하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "group",
        "members": [
            "tabi",
            "nana"
        ],
        "youtubeId": "3qRN6mQJ4K4",
        "duration": 265,
        "sabi": {
            "start": 92,
            "end": 127,
            "title": "후렴구: 야화(Night Flower)"
        },
        "publishedAt": "2025-06-15"
    },
    {
        "id": "stel-VsRyh2LOtBk",
        "title": "晩餐歌 (만찬가)",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "VsRyh2LOtBk",
        "duration": 217,
        "sabi": {
            "start": 75,
            "end": 110,
            "title": "후렴구: 晩餐歌 (tuki.)"
        },
        "publishedAt": "2025-06-14"
    },
    {
        "id": "stel-xDsvYAnq324",
        "title": "ヴァンパイア (뱀파이어)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "xDsvYAnq324",
        "duration": 182,
        "sabi": {
            "start": 63,
            "end": 98,
            "title": "후렴구: 뱀파이어 (ヴァンパイア)ㅣ아카네 리제"
        },
        "publishedAt": "2025-06-11"
    },
    {
        "id": "stel-bW_htBZ_emA",
        "title": "病名恋ワズライ (병명 상사병)",
        "artist": "네네코 마시로",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "mashiro"
        ],
        "youtubeId": "bW_htBZ_emA",
        "duration": 259,
        "sabi": {
            "start": 90,
            "end": 125,
            "title": "후렴구: 병명 상사병(病名恋ワズライ)"
        },
        "publishedAt": "2025-06-10"
    },
    {
        "id": "stel-CbuiRlGeA-g",
        "title": "Universe",
        "artist": "유니버스 (Universe 2기생)",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina",
            "mashiro",
            "lize",
            "tabi"
        ],
        "youtubeId": "CbuiRlGeA-g",
        "duration": 254,
        "sabi": {
            "start": 88,
            "end": 123,
            "title": "후렴구: 스텔라이브 (StelLive) Uni"
        },
        "publishedAt": "2025-06-10"
    },
    {
        "id": "stel-x534cEGwAEA",
        "title": "새봄의 노래",
        "artist": "아라하시 타비",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "x534cEGwAEA",
        "duration": 209,
        "sabi": {
            "start": 73,
            "end": 108,
            "title": "후렴구: 새봄의 노래 (Beginning)"
        },
        "publishedAt": "2025-06-11"
    },
    {
        "id": "stel-ffF1XHKR5Ug",
        "title": "눈싸움",
        "artist": "텐코 시부키",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "ffF1XHKR5Ug",
        "duration": 161,
        "sabi": {
            "start": 56,
            "end": 91,
            "title": "후렴구: 눈싸움 (睨めっ娘)"
        },
        "publishedAt": "2025-06-01"
    },
    {
        "id": "stel-YVplo9mgtcs",
        "title": "ロンリーユニバース (론리 유니버스)",
        "artist": "시라유키 히나 x 아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "group",
        "members": [
            "hina",
            "rin"
        ],
        "youtubeId": "YVplo9mgtcs",
        "duration": 222,
        "sabi": {
            "start": 77,
            "end": 112,
            "title": "후렴구: Lonely Universe(ロンリー"
        },
        "publishedAt": "2025-05-23"
    },
    {
        "id": "stel-_iNHQuaKuig",
        "title": "恋愛サーキュレーション (연애 서큘레이션)",
        "artist": "아야츠노 유니",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "yuni"
        ],
        "youtubeId": "_iNHQuaKuig",
        "duration": 257,
        "sabi": {
            "start": 89,
            "end": 124,
            "title": "후렴구: 연애 서큘레이션 (恋愛サーキュレーショ"
        },
        "publishedAt": "2025-05-20"
    },
    {
        "id": "stel-7gYDCoiV7cc",
        "title": "그 나라의 왕가는 이상해 (아이 같은 전쟁)",
        "artist": "네네코 마시로 x 아카네 리제",
        "originalArtist": "Giga",
        "type": "cover",
        "gen": "g2",
        "members": [
            "mashiro",
            "lize"
        ],
        "youtubeId": "7gYDCoiV7cc",
        "duration": 72,
        "sabi": {
            "start": 25,
            "end": 60,
            "title": "후렴구: 마시로"
        },
        "publishedAt": "2025-05-20"
    },
    {
        "id": "stel-5kTp7SQCR_Y",
        "title": "Tell Your World",
        "artist": "스텔라이브 (STELLIVE)",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "group",
        "members": [
            "group"
        ],
        "youtubeId": "5kTp7SQCR_Y",
        "duration": 265,
        "sabi": {
            "start": 92,
            "end": 127,
            "title": "후렴구: STELLIVE  | ' Tell Y"
        },
        "publishedAt": "2025-05-05"
    },
    {
        "id": "stel-RpX0r_l7FzI",
        "title": "Stand by You",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "RpX0r_l7FzI",
        "duration": 257,
        "sabi": {
            "start": 89,
            "end": 124,
            "title": "후렴구: Stand By You (Offici"
        },
        "publishedAt": "2025-05-03"
    },
    {
        "id": "stel-zVNbcnSQrCU",
        "title": "Unbreakable Sphere",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "zVNbcnSQrCU",
        "duration": 226,
        "sabi": {
            "start": 79,
            "end": 114,
            "title": "후렴구: Unbreakable Sphere ("
        },
        "publishedAt": "2025-05-01"
    },
    {
        "id": "stel-DzSb5b8ehdg",
        "title": "オレンジ (오렌지)",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "DzSb5b8ehdg",
        "duration": 360,
        "sabi": {
            "start": 125,
            "end": 160,
            "title": "후렴구: 「Orange(オレンジ) / 4월은"
        },
        "publishedAt": "2025-04-27"
    },
    {
        "id": "stel-4OzmA6a8sqY",
        "title": "있잖아 있잖아 있잖아 (ねぇねぇねぇ。)",
        "artist": "텐코 시부키 x 유즈하 리코",
        "originalArtist": "피노키오피",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki",
            "riko"
        ],
        "youtubeId": "4OzmA6a8sqY",
        "duration": 211,
        "sabi": {
            "start": 73,
            "end": 108,
            "title": "후렴구: 있잖아 있잖아 있잖아 (ねぇねぇねぇ。"
        },
        "publishedAt": "2025-04-26"
    },
    {
        "id": "stel-vT3xY5UE4Q4",
        "title": "モニタリング (모니터링)",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "vT3xY5UE4Q4",
        "duration": 182,
        "sabi": {
            "start": 63,
            "end": 98,
            "title": "후렴구: 모니터링 [モニタリング - DECO*"
        },
        "publishedAt": "2025-04-14"
    },
    {
        "id": "stel-EPRYt6d8oEY",
        "title": "シルシ (증표)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "EPRYt6d8oEY",
        "duration": 286,
        "sabi": {
            "start": 100,
            "end": 135,
            "title": "후렴구: 증표(シルシ)"
        },
        "publishedAt": "2025-04-13"
    },
    {
        "id": "stel-TFkPG0r-W5U",
        "title": "シュガーロス (슈가로스)",
        "artist": "네네코 마시로",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "mashiro"
        ],
        "youtubeId": "TFkPG0r-W5U",
        "duration": 200,
        "sabi": {
            "start": 70,
            "end": 105,
            "title": "후렴구: 슈가로스(シュガーロス)"
        },
        "publishedAt": "2025-04-11"
    },
    {
        "id": "stel-76CJ6U2nxeY",
        "title": "BOW AND ARROW",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "76CJ6U2nxeY",
        "duration": 177,
        "sabi": {
            "start": 61,
            "end": 96,
            "title": "후렴구: BOW AND ARROW (Yonez"
        },
        "publishedAt": "2025-04-05"
    },
    {
        "id": "stel-8m8xom23aDY",
        "title": "six feet under",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "8m8xom23aDY",
        "duration": 219,
        "sabi": {
            "start": 76,
            "end": 111,
            "title": "후렴구: シックス・フィート・アンダー (식스 피"
        },
        "publishedAt": "2025-04-01"
    },
    {
        "id": "stel-Ho-tW7OsO54",
        "title": "S・O・S",
        "artist": "텐코 시부키",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "Ho-tW7OsO54",
        "duration": 242,
        "sabi": {
            "start": 84,
            "end": 119,
            "title": "후렴구: SOS (마유즈미 후유코)"
        },
        "publishedAt": "2025-03-21"
    },
    {
        "id": "stel-lsshc8umnE4",
        "title": "逆夢 (역몽)",
        "artist": "아오쿠모 린 x 하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin",
            "nana"
        ],
        "youtubeId": "lsshc8umnE4",
        "duration": 314,
        "sabi": {
            "start": 109,
            "end": 144,
            "title": "후렴구: 역몽 (逆夢, King Gnu) -"
        },
        "publishedAt": "2025-03-17"
    },
    {
        "id": "stel-y84L-0bz4zo",
        "title": "ラビットホール (래빗 홀)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "y84L-0bz4zo",
        "duration": 159,
        "sabi": {
            "start": 55,
            "end": 90,
            "title": "후렴구: ラビットホール(래빗 홀)"
        },
        "publishedAt": "2025-03-11"
    },
    {
        "id": "stel-f3bB5GgEZxw",
        "title": "桜、君、そして僕 (벚꽃, 너, 그리고 나)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "f3bB5GgEZxw",
        "duration": 204,
        "sabi": {
            "start": 71,
            "end": 106,
            "title": "후렴구: Sakura kimi watashi"
        },
        "publishedAt": "2025-03-09"
    },
    {
        "id": "stel-QQYjoOGbUSQ",
        "title": "ももいろの鍵 (복숭아색 열쇠)",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "QQYjoOGbUSQ",
        "duration": 204,
        "sabi": {
            "start": 71,
            "end": 106,
            "title": "후렴구: ももいろの鍵 (복숭아색 열쇠)"
        },
        "publishedAt": "2025-03-03"
    },
    {
        "id": "stel-Nse1CbmfIj4",
        "title": "연예인",
        "artist": "네네코 마시로",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "mashiro"
        ],
        "youtubeId": "Nse1CbmfIj4",
        "duration": 208,
        "sabi": {
            "start": 72,
            "end": 107,
            "title": "후렴구: 연예인 (PSY)"
        },
        "publishedAt": "2025-02-22"
    },
    {
        "id": "stel-JTMAVnFAff0",
        "title": "Beyond the Way",
        "artist": "아오쿠모 린 x 하나코 나나 x 유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin",
            "nana",
            "riko"
        ],
        "youtubeId": "JTMAVnFAff0",
        "duration": 184,
        "sabi": {
            "start": 64,
            "end": 99,
            "title": "후렴구: Beyond the way"
        },
        "publishedAt": "2025-02-20"
    },
    {
        "id": "stel-HVBL6xHcMRY",
        "title": "心予報 (마음 예보)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "HVBL6xHcMRY",
        "duration": 202,
        "sabi": {
            "start": 70,
            "end": 105,
            "title": "후렴구: 心予報(마음 예보)"
        },
        "publishedAt": "2025-02-14"
    },
    {
        "id": "stel-TqQFF_wLlR4",
        "title": "モニタリング (모니터링)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "TqQFF_wLlR4",
        "duration": 177,
        "sabi": {
            "start": 61,
            "end": 96,
            "title": "후렴구: 모니터링 (モニタリング - DECO*"
        },
        "publishedAt": "2025-02-06"
    },
    {
        "id": "stel-PBh8a0GaNFs",
        "title": "絶対敵対メチャキライヤー (절대적대완전싫어)",
        "artist": "텐코 시부키 x 유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki",
            "riko"
        ],
        "youtubeId": "PBh8a0GaNFs",
        "duration": 165,
        "sabi": {
            "start": 57,
            "end": 92,
            "title": "후렴구: 절대적대완전싫어"
        },
        "publishedAt": "2025-01-28"
    },
    {
        "id": "stel-lXB628gwlzs",
        "title": "夢のカーニバル (꿈의 카니발)",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "lXB628gwlzs",
        "duration": 195,
        "sabi": {
            "start": 68,
            "end": 103,
            "title": "후렴구: 꿈의 카니발 (Grand Feast"
        },
        "publishedAt": "2025-01-23"
    },
    {
        "id": "stel-EtkolJZEmpg",
        "title": "花の塔 (꽃의 탑)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "EtkolJZEmpg",
        "duration": 279,
        "sabi": {
            "start": 97,
            "end": 132,
            "title": "후렴구: 꽃의 탑 (花の塔"
        },
        "publishedAt": "2025-01-10"
    },
    {
        "id": "stel-L1haw5kPB7Q",
        "title": "晩餐歌 (만찬가)",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "L1haw5kPB7Q",
        "duration": 226,
        "sabi": {
            "start": 79,
            "end": 114,
            "title": "후렴구: 만찬가『晩餐歌"
        },
        "publishedAt": "2025-01-05"
    },
    {
        "id": "stel-vCHNh5E4eDU",
        "title": "SPECIALZ",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "vCHNh5E4eDU",
        "duration": 235,
        "sabi": {
            "start": 82,
            "end": 117,
            "title": "후렴구: SPECIALZ(King Gnu)"
        },
        "publishedAt": "2025-01-04"
    },
    {
        "id": "stel-JCJyXMJMLRM",
        "title": "シル・ヴ・プレジデント (실・부・프레지던트)",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "JCJyXMJMLRM",
        "duration": 194,
        "sabi": {
            "start": 67,
            "end": 102,
            "title": "후렴구: シル・ヴ・プレジデント (실・부・프레지"
        },
        "publishedAt": "2024-12-31"
    },
    {
        "id": "stel-QbSMSvVMHqU",
        "title": "冬のプレゼント (겨울의 선물)",
        "artist": "텐코 시부키",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "QbSMSvVMHqU",
        "duration": 302,
        "sabi": {
            "start": 105,
            "end": 140,
            "title": "후렴구: 겨울의 선물 (冬のプレゼント)"
        },
        "publishedAt": "2024-12-25"
    },
    {
        "id": "stel-gXJMNur50m8",
        "title": "クリスマスソング (크리스마스 송)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "gXJMNur50m8",
        "duration": 341,
        "sabi": {
            "start": 119,
            "end": 154,
            "title": "후렴구: 크리스마스송(クリスマスソング/back"
        },
        "publishedAt": "2024-12-25"
    },
    {
        "id": "stel-ebnM6X6B1Yg",
        "title": "ハッピーエンド (해피엔드)",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "ebnM6X6B1Yg",
        "duration": 322,
        "sabi": {
            "start": 112,
            "end": 147,
            "title": "후렴구: ハッピーエンド (back number"
        },
        "publishedAt": "2024-12-19"
    },
    {
        "id": "stel-cGjgCLuyAro",
        "title": "しわ (주름)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "cGjgCLuyAro",
        "duration": 274,
        "sabi": {
            "start": 95,
            "end": 130,
            "title": "후렴구: 주름맞추기 (しわあわせ / Vaund"
        },
        "publishedAt": "2024-12-13"
    },
    {
        "id": "stel-3EPEqL_ap-M",
        "title": "ハッピーシンセサイザ (해피 신디사이저)",
        "artist": "아야츠노 유니 x 네네코 마시로",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "group",
        "members": [
            "yuni",
            "mashiro"
        ],
        "youtubeId": "3EPEqL_ap-M",
        "duration": 233,
        "sabi": {
            "start": 81,
            "end": 116,
            "title": "후렴구:"
        },
        "publishedAt": "2024-12-06"
    },
    {
        "id": "stel-6cv-HiNVgqA",
        "title": "サボタージュ (사보타주)",
        "artist": "텐코 시부키",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "6cv-HiNVgqA",
        "duration": 243,
        "sabi": {
            "start": 85,
            "end": 120,
            "title": "후렴구: Sabotage (緑黄色社会)"
        },
        "publishedAt": "2024-12-06"
    },
    {
        "id": "stel-lqU0yh_u7Qo",
        "title": "APT.",
        "artist": "아카네 리제 x 아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "group",
        "members": [
            "lize",
            "rin"
        ],
        "youtubeId": "lqU0yh_u7Qo",
        "duration": 173,
        "sabi": {
            "start": 60,
            "end": 95,
            "title": "후렴구: APT. (ROSÉ & Bruno"
        },
        "publishedAt": "2024-12-01"
    },
    {
        "id": "stel-CmaLZo-DTlU",
        "title": "さよなら、またいつか! (안녕, 또 언젠가!)",
        "artist": "네네코 마시로 x 아라하시 타비",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "mashiro",
            "tabi"
        ],
        "youtubeId": "CmaLZo-DTlU",
        "duration": 203,
        "sabi": {
            "start": 71,
            "end": 106,
            "title": "후렴구: さよーならまたいつか！(안녕, 또 언젠"
        },
        "publishedAt": "2024-11-30"
    },
    {
        "id": "stel-_C4t1yi0WDQ",
        "title": "神っぽいな (신 같네)",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "_C4t1yi0WDQ",
        "duration": 204,
        "sabi": {
            "start": 71,
            "end": 106,
            "title": "후렴구: 神っぽいな(신 같네)"
        },
        "publishedAt": "2024-11-26"
    },
    {
        "id": "stel-DMk4_4Xytz4",
        "title": "Alice in Musicland",
        "artist": "스텔라이브 (STELLIVE)",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "group",
        "members": [
            "group",
            "kanna",
            "yuni",
            "hina",
            "mashiro",
            "lize",
            "tabi"
        ],
        "youtubeId": "DMk4_4Xytz4",
        "duration": 624,
        "sabi": {
            "start": 218,
            "end": 253,
            "title": "후렴구: ✧Alice in Musicland✧"
        },
        "publishedAt": "2024-11-24"
    },
    {
        "id": "stel-c6G7vRuJyhs",
        "title": "鏡花水月 (경화수월)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "c6G7vRuJyhs",
        "duration": 267,
        "sabi": {
            "start": 93,
            "end": 128,
            "title": "후렴구: 경화수월(鏡花水月)"
        },
        "publishedAt": "2024-11-21"
    },
    {
        "id": "stel-9hLbsRU2neM",
        "title": "ハルカ (하루카)",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "9hLbsRU2neM",
        "duration": 248,
        "sabi": {
            "start": 86,
            "end": 121,
            "title": "후렴구: 하루카「ハルカ"
        },
        "publishedAt": "2024-11-16"
    },
    {
        "id": "stel-pM8_wnJ7JsE",
        "title": "Overdose",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "pM8_wnJ7JsE",
        "duration": 193,
        "sabi": {
            "start": 67,
            "end": 102,
            "title": "후렴구: Overdose (なとり)"
        },
        "publishedAt": "2024-11-17"
    },
    {
        "id": "stel-J49wnPBsyrU",
        "title": "ケセラセラ (케세라세라)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "J49wnPBsyrU",
        "duration": 279,
        "sabi": {
            "start": 97,
            "end": 132,
            "title": "후렴구: 케세라세라 (Mrs. GREEN AP"
        },
        "publishedAt": "2024-11-01"
    },
    {
        "id": "stel-Pgd_XVwBVU0",
        "title": "死神 (사신)",
        "artist": "아라하시 타비",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "Pgd_XVwBVU0",
        "duration": 183,
        "sabi": {
            "start": 64,
            "end": 99,
            "title": "후렴구: 死神(사신)"
        },
        "publishedAt": "2024-10-31"
    },
    {
        "id": "stel-D938bjFYmII",
        "title": "夜明けと蛍 (새벽과 반딧불이)",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "D938bjFYmII",
        "duration": 313,
        "sabi": {
            "start": 109,
            "end": 144,
            "title": "후렴구: 새벽과 반딧불이(夜明けと蛍)"
        },
        "publishedAt": "2024-10-26"
    },
    {
        "id": "stel--yY4Ijb06zg",
        "title": "アイデンティティ (아이덴티티)",
        "artist": "텐코 시부키 x 아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki",
            "rin"
        ],
        "youtubeId": "-yY4Ijb06zg",
        "duration": 159,
        "sabi": {
            "start": 55,
            "end": 90,
            "title": "후렴구: アイデンティティ(아이덴티티) - 아오"
        },
        "publishedAt": "2024-10-26"
    },
    {
        "id": "stel-DrZMMirj4zo",
        "title": "終わらない歌 (끝나지 않은 노래)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "DrZMMirj4zo",
        "duration": 252,
        "sabi": {
            "start": 88,
            "end": 123,
            "title": "후렴구: An Unfinished Song ("
        },
        "publishedAt": "2024-10-22"
    },
    {
        "id": "stel-dglNAGJiDT8",
        "title": "トンデモワンダーズ (톤데모 원더즈)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "dglNAGJiDT8",
        "duration": 196,
        "sabi": {
            "start": 68,
            "end": 103,
            "title": "후렴구: 톤데모 원더즈『トンデモワンダーズ"
        },
        "publishedAt": "2024-10-18"
    },
    {
        "id": "stel-qpBCZ6kYVb4",
        "title": "サムライハート (사무라이 하트)",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "qpBCZ6kYVb4",
        "duration": 192,
        "sabi": {
            "start": 67,
            "end": 102,
            "title": "후렴구: サムライハート(Some Like It"
        },
        "publishedAt": "2024-10-05"
    },
    {
        "id": "stel-7CQuc6Jf4UE",
        "title": "GETCHA!",
        "artist": "아오쿠모 린 x 유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin",
            "riko"
        ],
        "youtubeId": "7CQuc6Jf4UE",
        "duration": 233,
        "sabi": {
            "start": 81,
            "end": 116,
            "title": "후렴구: GETCHA! (Giga & KIRA"
        },
        "publishedAt": "2024-10-04"
    },
    {
        "id": "stel-7zsY6Ex9dMI",
        "title": "蜜月アン・ドゥ・トロワ (밀월 앙 두 트루아)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "7zsY6Ex9dMI",
        "duration": 256,
        "sabi": {
            "start": 89,
            "end": 124,
            "title": "후렴구: 밀월 Un・Deux・Trois (蜜月"
        },
        "publishedAt": "2024-10-01"
    },
    {
        "id": "stel-G5A-UDCxUiI",
        "title": "レオ (레오)",
        "artist": "텐코 시부키",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "G5A-UDCxUiI",
        "duration": 238,
        "sabi": {
            "start": 83,
            "end": 118,
            "title": "후렴구: Leo (レオ)"
        },
        "publishedAt": "2024-09-30"
    },
    {
        "id": "stel-Rr2GjXAgJ9E",
        "title": "晴る (맑은 날)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "Rr2GjXAgJ9E",
        "duration": 276,
        "sabi": {
            "start": 96,
            "end": 131,
            "title": "후렴구: 맑은 날(ヨルシカ - 晴る)"
        },
        "publishedAt": "2024-09-23"
    },
    {
        "id": "stel-O1MqvWf7q58",
        "title": "踊り子 (무희)",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "O1MqvWf7q58",
        "duration": 230,
        "sabi": {
            "start": 80,
            "end": 115,
            "title": "후렴구: 무희 (Vaundy)"
        },
        "publishedAt": "2024-09-15"
    },
    {
        "id": "stel-PybjJ4CUDF8",
        "title": "Be Somebody",
        "artist": "아라하시 타비",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "PybjJ4CUDF8",
        "duration": 183,
        "sabi": {
            "start": 64,
            "end": 99,
            "title": "후렴구: BE SOMEBODY (육성재)"
        },
        "publishedAt": "2024-09-07"
    },
    {
        "id": "stel-OzncrMNY7cw",
        "title": "Viva La Vida",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "OzncrMNY7cw",
        "duration": 219,
        "sabi": {
            "start": 76,
            "end": 111,
            "title": "후렴구: Viva La Vida (Coldpl"
        },
        "publishedAt": "2024-08-31"
    },
    {
        "id": "stel-vM_XT3MeLrc",
        "title": "青い珊瑚礁 (푸른 산호초)",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "vM_XT3MeLrc",
        "duration": 223,
        "sabi": {
            "start": 78,
            "end": 113,
            "title": "후렴구: 푸른 산호초 (青い珊瑚礁)"
        },
        "publishedAt": "2024-08-30"
    },
    {
        "id": "stel-T10fmu7T4eA",
        "title": "지구를 줄게",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "T10fmu7T4eA",
        "duration": 278,
        "sabi": {
            "start": 97,
            "end": 132,
            "title": "후렴구: 지구를 줄게 (地球をあげる)"
        },
        "publishedAt": "2024-08-23"
    },
    {
        "id": "stel-Nr3AhMP1lVg",
        "title": "Love wins all",
        "artist": "아이리 칸나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "Nr3AhMP1lVg",
        "duration": 269,
        "sabi": {
            "start": 94,
            "end": 129,
            "title": "후렴구: Love wins all (IU)"
        },
        "publishedAt": "2024-08-18"
    },
    {
        "id": "stel-oAa_PoRopSs",
        "title": "Rumor",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "oAa_PoRopSs",
        "duration": 177,
        "sabi": {
            "start": 61,
            "end": 96,
            "title": "후렴구: Rumor ルーマー (Police P"
        },
        "publishedAt": "2024-08-11"
    },
    {
        "id": "stel-zcaAsuA54pI",
        "title": "さよなら、またいつか! (안녕, 또 언젠가!)",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "zcaAsuA54pI",
        "duration": 205,
        "sabi": {
            "start": 71,
            "end": 106,
            "title": "후렴구: 안녕, 또 언젠가! (요네즈 켄시)"
        },
        "publishedAt": "2024-07-21"
    },
    {
        "id": "stel-ZMgLAy-VKe4",
        "title": "メルト (멜트)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "ZMgLAy-VKe4",
        "duration": 259,
        "sabi": {
            "start": 90,
            "end": 125,
            "title": "후렴구: Melt (メルト)"
        },
        "publishedAt": "2024-06-30"
    },
    {
        "id": "stel-pKPPV1RMk-c",
        "title": "プライド革命 (프라이드 혁명)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "pKPPV1RMk-c",
        "duration": 238,
        "sabi": {
            "start": 83,
            "end": 118,
            "title": "후렴구: 프라이드 혁명 (プライド革命)"
        },
        "publishedAt": "2024-06-11"
    },
    {
        "id": "stel-gGQqeRJub3E",
        "title": "HERO",
        "artist": "아라하시 타비",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "gGQqeRJub3E",
        "duration": 198,
        "sabi": {
            "start": 69,
            "end": 104,
            "title": "후렴구: HERO (LUCY)"
        },
        "publishedAt": "2024-06-11"
    },
    {
        "id": "stel-VhBXWT6Oqto",
        "title": "17歳の歌 (17살의 노래)",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "VhBXWT6Oqto",
        "duration": 312,
        "sabi": {
            "start": 109,
            "end": 144,
            "title": "후렴구: 17살의 노래(17さいのうた。)"
        },
        "publishedAt": "2024-06-10"
    },
    {
        "id": "stel-6-Kz5sWJBg4",
        "title": "オトノナルホウヘ→ (소리가 나는 쪽으로)",
        "artist": "유니버스 (Universe 2기생)",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina",
            "mashiro",
            "lize",
            "tabi"
        ],
        "youtubeId": "6-Kz5sWJBg4",
        "duration": 218,
        "sabi": {
            "start": 76,
            "end": 111,
            "title": "후렴구: 스텔라이브 (StelLive) Uni"
        },
        "publishedAt": "2024-06-09"
    },
    {
        "id": "stel-sEYBQaw1vRs",
        "title": "さようなら、花泥棒さん (안녕, 꽃도둑씨)",
        "artist": "네네코 마시로",
        "originalArtist": "메루 (メル)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "mashiro"
        ],
        "youtubeId": "sEYBQaw1vRs",
        "duration": 272,
        "sabi": {
            "start": 95,
            "end": 130,
            "title": "후렴구: 안녕, 꽃도둑씨 (さようなら、花泥棒さ"
        },
        "publishedAt": "2024-05-27"
    },
    {
        "id": "stel-lfxl4YlY0lE",
        "title": "勇者 (용사)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "lfxl4YlY0lE",
        "duration": 196,
        "sabi": {
            "start": 68,
            "end": 103,
            "title": "후렴구: 용사(YOASOBI)"
        },
        "publishedAt": "2024-05-17"
    },
    {
        "id": "stel-v7UNI2YuqFc",
        "title": "가짜 얼굴 (Fake Face)",
        "artist": "하나코 나나",
        "originalArtist": "yama",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "v7UNI2YuqFc",
        "duration": 151,
        "sabi": {
            "start": 52,
            "end": 87,
            "title": "후렴구: 가짜 얼굴(yama)"
        },
        "publishedAt": "2024-05-17"
    },
    {
        "id": "stel-UWa_OiXDiQA",
        "title": "幽霊東京 (유령도쿄)",
        "artist": "아오쿠모 린",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin"
        ],
        "youtubeId": "UWa_OiXDiQA",
        "duration": 203,
        "sabi": {
            "start": 71,
            "end": 106,
            "title": "후렴구: 유령도쿄(Ayase)"
        },
        "publishedAt": "2024-05-16"
    },
    {
        "id": "stel-IRvrDhVYXHQ",
        "title": "상처 입은 누군가의 마음을 지킬 수 있다면 (傷つく誰かの心を守ることができたなら)",
        "artist": "아이리 칸나",
        "originalArtist": "ツユ (TUYU)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "IRvrDhVYXHQ",
        "duration": 210,
        "sabi": {
            "start": 73,
            "end": 108,
            "title": "후렴구: If I Can Stop One He"
        },
        "publishedAt": "2024-05-15"
    },
    {
        "id": "stel-Tmjy9uLbMFc",
        "title": "春を待つ (봄을 기다리다)",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "Tmjy9uLbMFc",
        "duration": 266,
        "sabi": {
            "start": 93,
            "end": 128,
            "title": "후렴구: 봄을 기다리다(春を待つ)"
        },
        "publishedAt": "2024-05-10"
    },
    {
        "id": "stel-yCVZq40vqLk",
        "title": "怪獣の花唄 (괴수의 꽃노래)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "yCVZq40vqLk",
        "duration": 229,
        "sabi": {
            "start": 80,
            "end": 115,
            "title": "후렴구: 괴수의 꽃노래 (怪獣の花唄)"
        },
        "publishedAt": "2024-05-04"
    },
    {
        "id": "stel-a6imWKGILZA",
        "title": "두근어질 (큐 큐라링 / きゅうくらりん)",
        "artist": "아야츠노 유니",
        "originalArtist": "이요와 (いよわ)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "yuni"
        ],
        "youtubeId": "a6imWKGILZA",
        "duration": 219,
        "sabi": {
            "start": 76,
            "end": 111,
            "title": "후렴구:  두근어질 (큐 큐라"
        },
        "publishedAt": "2024-04-16"
    },
    {
        "id": "stel-tmk0qlr4AeM",
        "title": "愛しているんだ (사랑하고 있는 거야)",
        "artist": "네네코 마시로",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "mashiro"
        ],
        "youtubeId": "tmk0qlr4AeM",
        "duration": 242,
        "sabi": {
            "start": 84,
            "end": 119,
            "title": "후렴구: 사랑하고 있는거야 (恋しているのさ)"
        },
        "publishedAt": "2024-03-31"
    },
    {
        "id": "stel-NcXfMM_TL3A",
        "title": "ラプンツェル (라푼젤)",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "NcXfMM_TL3A",
        "duration": 268,
        "sabi": {
            "start": 93,
            "end": 128,
            "title": "후렴구: ラプンツェル(Rapunzel)"
        },
        "publishedAt": "2024-03-29"
    },
    {
        "id": "stel-HBoqsgRoDw4",
        "title": "初恋 (첫사랑)",
        "artist": "아라하시 타비",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "HBoqsgRoDw4",
        "duration": 190,
        "sabi": {
            "start": 66,
            "end": 101,
            "title": "후렴구: 첫사랑 ( 백아 )"
        },
        "publishedAt": "2024-03-27"
    },
    {
        "id": "stel-xRkZVxvk55U",
        "title": "Sweet Dreams, My Dear",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "xRkZVxvk55U",
        "duration": 186,
        "sabi": {
            "start": 65,
            "end": 100,
            "title": "후렴구: Sweet Dreams, My Dea"
        },
        "publishedAt": "2024-03-15"
    },
    {
        "id": "stel-0nVQggWAzyE",
        "title": "ちゅ、多様性。 (츄 다양성)",
        "artist": "네네코 마시로",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "mashiro"
        ],
        "youtubeId": "0nVQggWAzyE",
        "duration": 185,
        "sabi": {
            "start": 64,
            "end": 99,
            "title": "후렴구: 츄 다양성 (ちゅ、多様性 )"
        },
        "publishedAt": "2024-02-18"
    },
    {
        "id": "stel-d_YvT_ULGkc",
        "title": "絶頂讃歌 (절정찬가)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "d_YvT_ULGkc",
        "duration": 184,
        "sabi": {
            "start": 64,
            "end": 99,
            "title": "후렴구: 절정찬가 (絶頂讃歌) / Akane"
        },
        "publishedAt": "2024-02-17"
    },
    {
        "id": "stel-cOLX5n5q4yc",
        "title": "雪解け (눈녹음)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "cOLX5n5q4yc",
        "duration": 244,
        "sabi": {
            "start": 85,
            "end": 120,
            "title": "후렴구: 雪解け (tayori) / Akane"
        },
        "publishedAt": "2024-02-04"
    },
    {
        "id": "stel-bdapY46xR7A",
        "title": "ただ君に晴れ (그저 네게 맑아라)",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "bdapY46xR7A",
        "duration": 204,
        "sabi": {
            "start": 71,
            "end": 106,
            "title": "후렴구: 그저 네게 맑아라 (ただ君に晴れ)"
        },
        "publishedAt": "2024-01-13"
    },
    {
        "id": "stel-6eb-U8R0nHQ",
        "title": "Mela! (메라!)",
        "artist": "아야츠노 유니",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "yuni"
        ],
        "youtubeId": "6eb-U8R0nHQ",
        "duration": 240,
        "sabi": {
            "start": 84,
            "end": 119,
            "title": "후렴구:  Mela!"
        },
        "publishedAt": "2023-12-09"
    },
    {
        "id": "stel-eLJENPbBe8A",
        "title": "勘ぐれい (의심쩍어 / 칸구레이)",
        "artist": "아이리 칸나",
        "originalArtist": "ZUTOMAYO",
        "type": "cover",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "eLJENPbBe8A",
        "duration": 251,
        "sabi": {
            "start": 87,
            "end": 122,
            "title": "후렴구: 勘ぐれい (ZUTOMAYO)"
        },
        "publishedAt": "2023-11-18"
    },
    {
        "id": "stel-OgwD6f_tdIY",
        "title": "愛して愛して愛して (사랑해줘 사랑해줘 사랑해줘)",
        "artist": "아이리 칸나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "OgwD6f_tdIY",
        "duration": 251,
        "sabi": {
            "start": 87,
            "end": 122,
            "title": "후렴구: 愛して愛して愛して (Kikuo)"
        },
        "publishedAt": "2023-10-31"
    },
    {
        "id": "stel-GdH0TsPznUs",
        "title": "LADY",
        "artist": "아이리 칸나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "GdH0TsPznUs",
        "duration": 210,
        "sabi": {
            "start": 73,
            "end": 108,
            "title": "후렴구: LADY (米津玄師)"
        },
        "publishedAt": "2023-09-23"
    },
    {
        "id": "stel-Y52kljOrCsc",
        "title": "그 여름에 피어나 (あの夏に咲け)",
        "artist": "아라하시 타비",
        "originalArtist": "TUYU",
        "type": "cover",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "Y52kljOrCsc",
        "duration": 256,
        "sabi": {
            "start": 89,
            "end": 124,
            "title": "후렴구: 그 여름에 피어나 (あの夏に咲け)"
        },
        "publishedAt": "2023-09-18"
    },
    {
        "id": "stel-nYgMMdYDGak",
        "title": "ねむるまち (잠드는 거리 / 네무루마치)",
        "artist": "아이리 칸나",
        "originalArtist": "くじら (Kujira)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "nYgMMdYDGak",
        "duration": 199,
        "sabi": {
            "start": 69,
            "end": 104,
            "title": "후렴구: ねむるまち (くじら)"
        },
        "publishedAt": "2023-09-02"
    },
    {
        "id": "stel-u1UbWeVxhpY",
        "title": "ドラマ (드라마)",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "u1UbWeVxhpY",
        "duration": 132,
        "sabi": {
            "start": 46,
            "end": 81,
            "title": "후렴구: 드라마(Drama)"
        },
        "publishedAt": "2023-07-28"
    },
    {
        "id": "stel-W-Xr4ceMOXI",
        "title": "그 여름의 어느 날은 (あの夏のいつかは)",
        "artist": "아라하시 타비",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "tabi"
        ],
        "youtubeId": "W-Xr4ceMOXI",
        "duration": 248,
        "sabi": {
            "start": 86,
            "end": 121,
            "title": "후렴구: 그 여름의 어느 날은 (あの夏のいつか"
        },
        "publishedAt": "2023-06-09"
    },
    {
        "id": "stel-naWmFCbwi3M",
        "title": "怪物 (괴물)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "naWmFCbwi3M",
        "duration": 209,
        "sabi": {
            "start": 73,
            "end": 108,
            "title": "후렴구: 괴물 (怪物)"
        },
        "publishedAt": "2023-06-09"
    },
    {
        "id": "stel-Y3McmrSFy1E",
        "title": "Question (퀘스천)",
        "artist": "네네코 마시로",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "mashiro"
        ],
        "youtubeId": "Y3McmrSFy1E",
        "duration": 166,
        "sabi": {
            "start": 58,
            "end": 93,
            "title": "후렴구: 퀘스천 (Question)"
        },
        "publishedAt": "2023-06-08"
    },
    {
        "id": "stel-gBWIv6NvLcU",
        "title": "落向 (낙향)",
        "artist": "시라유키 히나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "gBWIv6NvLcU",
        "duration": 251,
        "sabi": {
            "start": 87,
            "end": 122,
            "title": "후렴구: 낙향(都落ち)"
        },
        "publishedAt": "2023-06-08"
    },
    {
        "id": "stel-4_Aknw7fm_8",
        "title": "アイドル (아이돌)",
        "artist": "아이리 칸나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "4_Aknw7fm_8",
        "duration": 215,
        "sabi": {
            "start": 75,
            "end": 110,
            "title": "후렴구: アイドル (YOASOBI)"
        },
        "publishedAt": "2023-05-24"
    },
    {
        "id": "stel-v8MjiqzLKTs",
        "title": "すずめ (스즈메)",
        "artist": "아이리 칸나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "v8MjiqzLKTs",
        "duration": 241,
        "sabi": {
            "start": 84,
            "end": 119,
            "title": "후렴구: すずめ Suzume (RADWIMPS"
        },
        "publishedAt": "2023-04-09"
    },
    {
        "id": "stel-3PxbqWrDCz4",
        "title": "三文小説 (삼문소설)",
        "artist": "아이리 칸나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "3PxbqWrDCz4",
        "duration": 283,
        "sabi": {
            "start": 99,
            "end": 134,
            "title": "후렴구: 三文小説 (King Gnu)"
        },
        "publishedAt": "2023-03-19"
    },
    {
        "id": "stel-yXemOzx8Cw8",
        "title": "愛言葉Ⅳ (사랑의 말 Ⅳ)",
        "artist": "아야츠노 유니",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "yuni"
        ],
        "youtubeId": "yXemOzx8Cw8",
        "duration": 219,
        "sabi": {
            "start": 76,
            "end": 111,
            "title": "후렴구:  사랑의 말 Ⅳ"
        },
        "publishedAt": "2023-02-14"
    },
    {
        "id": "stel-MhtScZvcsiQ",
        "title": "私は最強 (나는 최강)",
        "artist": "아이리 칸나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "MhtScZvcsiQ",
        "duration": 257,
        "sabi": {
            "start": 89,
            "end": 124,
            "title": "후렴구: I'm Invincible (Ado)"
        },
        "publishedAt": "2022-08-20"
    },
    {
        "id": "stel-tD9N1BhSrCI",
        "title": "너에게, 나의 빛",
        "artist": "스텔라이브 (STELLIVE)",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "group",
        "members": [
            "group"
        ],
        "youtubeId": "tD9N1BhSrCI",
        "duration": 221,
        "sabi": {
            "start": 77,
            "end": 112,
            "title": "후렴구: To You, My Light"
        },
        "publishedAt": "2026-05-08"
    },
    {
        "id": "stel-v094-E3Pmtk",
        "title": "스타트레일",
        "artist": "스텔라이브 (STELLIVE)",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "group",
        "members": [
            "group"
        ],
        "youtubeId": "v094-E3Pmtk",
        "duration": 236,
        "sabi": {
            "start": 82,
            "end": 117,
            "title": "후렴구: 스텔라이브 (StelLive) I"
        },
        "publishedAt": "2026-05-08"
    },
    {
        "id": "stel-m-rIYEw5uAs",
        "title": "히로인이 되고 싶어",
        "artist": "스텔라이브 (STELLIVE)",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "group",
        "members": [
            "group"
        ],
        "youtubeId": "m-rIYEw5uAs",
        "duration": 197,
        "sabi": {
            "start": 68,
            "end": 103,
            "title": "후렴구: StelLive | 'I Want t"
        },
        "publishedAt": "2026-04-10"
    },
    {
        "id": "stel-he2W_4xY5Zo",
        "title": "트윙클",
        "artist": "스텔라이브 (STELLIVE)",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "group",
        "members": [
            "group"
        ],
        "youtubeId": "he2W_4xY5Zo",
        "duration": 230,
        "sabi": {
            "start": 80,
            "end": 115,
            "title": "후렴구: 스텔라이브 (StelLive) | T"
        },
        "publishedAt": "2026-02-23"
    },
    {
        "id": "stel-TDn37k6Ccw0",
        "title": "Chewing Love",
        "artist": "아야츠노 유니",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "g1",
        "members": [
            "yuni"
        ],
        "youtubeId": "TDn37k6Ccw0",
        "duration": 180,
        "sabi": {
            "start": 62,
            "end": 97,
            "title": "후렴구: CHEWING LUV"
        },
        "publishedAt": "2025-11-12"
    },
    {
        "id": "stel-IQbeBUIVmdw",
        "title": "삐질게",
        "artist": "아야츠노 유니",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "g1",
        "members": [
            "yuni"
        ],
        "youtubeId": "IQbeBUIVmdw",
        "duration": 144,
        "sabi": {
            "start": 50,
            "end": 85,
            "title": "후렴구: 아야츠노 유니 ( Ayatsuno Y"
        },
        "publishedAt": "2025-11-12"
    },
    {
        "id": "stel-3_0Ut2tlxLM",
        "title": "Festa!",
        "artist": "아카네 리제",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "3_0Ut2tlxLM",
        "duration": 215,
        "sabi": {
            "start": 75,
            "end": 110,
            "title": "후렴구: 아카네 리제(Akane Lize) |"
        },
        "publishedAt": "2024-09-29"
    },
    {
        "id": "stel-rQaluJS-Tc0",
        "title": "HANA",
        "artist": "시라유키 히나",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "rQaluJS-Tc0",
        "duration": 255,
        "sabi": {
            "start": 89,
            "end": 124,
            "title": "후렴구: 시라유키 히나(Shirayuki Hi"
        },
        "publishedAt": "2024-09-11"
    },
    {
        "id": "stel-R_RAWjqdgTs",
        "title": "SUPA DUPA",
        "artist": "아야츠노 유니",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "g1",
        "members": [
            "yuni"
        ],
        "youtubeId": "R_RAWjqdgTs",
        "duration": 155,
        "sabi": {
            "start": 54,
            "end": 89,
            "title": "후렴구: 아야츠노 유니 ( Ayatsuno Y"
        },
        "publishedAt": "2024-06-19"
    },
    {
        "id": "stel-iCCqSFvz9kM",
        "title": "최종화",
        "artist": "아이리 칸나",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "iCCqSFvz9kM",
        "duration": 247,
        "sabi": {
            "start": 86,
            "end": 121,
            "title": "후렴구: 아이리 칸나(Airi Kanna) |"
        },
        "publishedAt": "2024-03-03"
    },
    {
        "id": "stel-AsoPg-h-644",
        "title": "색채",
        "artist": "아이리 칸나",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "AsoPg-h-644",
        "duration": 230,
        "sabi": {
            "start": 80,
            "end": 115,
            "title": "후렴구: 色彩 / Team. Palette 【"
        },
        "publishedAt": "2023-07-07"
    },
    {
        "id": "stel-kPdB6iGYBBc",
        "title": "ADDICTION",
        "artist": "아이리 칸나",
        "originalArtist": "오리지널 (Original)",
        "type": "original",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "kPdB6iGYBBc",
        "duration": 217,
        "sabi": {
            "start": 75,
            "end": 110,
            "title": "후렴구: 藍璃かんな(Airi Kanna) |"
        },
        "publishedAt": "2023-05-26"
    },
    {
        "id": "stel-6A04OifrfR0",
        "title": "공상열차 (空奏列車 / 쿠소렛샤)",
        "artist": "아이리 칸나",
        "originalArtist": "Orangestar",
        "type": "cover",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "6A04OifrfR0",
        "duration": 251,
        "sabi": {
            "start": 87,
            "end": 122,
            "title": "후렴구: 空奏列車 (Orangestar) Co"
        },
        "publishedAt": "2024-09-06"
    },
    {
        "id": "stel-Pag28N1mzxg",
        "title": "8.32",
        "artist": "아이리 칸나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "kanna"
        ],
        "youtubeId": "Pag28N1mzxg",
        "duration": 255,
        "sabi": {
            "start": 89,
            "end": 124,
            "title": "후렴구: 8.32 feat.flower - *"
        },
        "publishedAt": "2024-09-01"
    },
    {
        "id": "stel-CGYa8wsbii4",
        "title": "Super Power",
        "artist": "아야츠노 유니",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "yuni"
        ],
        "youtubeId": "CGYa8wsbii4",
        "duration": 66,
        "sabi": {
            "start": 23,
            "end": 58,
            "title": "후렴구: SUPERPOWER (2024 발로란"
        },
        "publishedAt": "2024-08-11"
    },
    {
        "id": "stel-6RKyMwilHJ0",
        "title": "개화 (Blooming)",
        "artist": "시라유키 히나",
        "originalArtist": "명조: 워더링 웨이브 선약 방송국 OST",
        "type": "featuring",
        "gen": "g2",
        "members": [
            "hina"
        ],
        "youtubeId": "6RKyMwilHJ0",
        "duration": 203,
        "sabi": {
            "start": 65,
            "end": 95,
            "title": "후렴구: 피어나는 꽃처럼 개화"
        },
        "publishedAt": "2025-12-07"
    },
    {
        "id": "stel-bEgwL-XL05U",
        "title": "STAR WALKIN'",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "bEgwL-XL05U",
        "duration": 217,
        "sabi": {
            "start": 75,
            "end": 110,
            "title": "후렴구: Lil Nas X - Star Wal"
        },
        "publishedAt": "2025-11-09"
    },
    {
        "id": "stel-dxsiVSbpm8k",
        "title": "うたたね (선잠)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "dxsiVSbpm8k",
        "duration": 185,
        "sabi": {
            "start": 64,
            "end": 99,
            "title": "후렴구: Utatane (Leina) / Ak"
        },
        "publishedAt": "2025-10-30"
    },
    {
        "id": "stel-O8p_SsnHGhM",
        "title": "マスカレード (가면무도회)",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "O8p_SsnHGhM",
        "duration": 244,
        "sabi": {
            "start": 85,
            "end": 120,
            "title": "후렴구: Animal Farm (BIBI) /"
        },
        "publishedAt": "2025-10-18"
    },
    {
        "id": "stel-h7l0Ho1Fjkg",
        "title": "Stranger",
        "artist": "아카네 리제",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "h7l0Ho1Fjkg",
        "duration": 178,
        "sabi": {
            "start": 62,
            "end": 97,
            "title": "후렴구: 아카네 리제(Akane Lize )ㅣ"
        },
        "publishedAt": "2023-12-10"
    },
    {
        "id": "stel-PdiTCYldc6k",
        "title": "That's Right, Frank!",
        "artist": "텐코 시부키 x 유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki",
            "riko"
        ],
        "youtubeId": "PdiTCYldc6k",
        "duration": 155,
        "sabi": {
            "start": 54,
            "end": 89,
            "title": "후렴구: That's Right Frank!"
        },
        "publishedAt": "2025-06-25"
    },
    {
        "id": "stel-rRMDL8lcSOY",
        "title": "かくれんぼ (숨바꼭질)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "rRMDL8lcSOY",
        "duration": 308,
        "sabi": {
            "start": 107,
            "end": 142,
            "title": "후렴구: 07/26/22 Yuzuha Riko"
        },
        "publishedAt": "2026-08-22"
    },
    {
        "id": "stel-SeDPbIKzmmI",
        "title": "ヒロイン育成計画 (히로인 육성계획)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "SeDPbIKzmmI",
        "duration": 229,
        "sabi": {
            "start": 80,
            "end": 115,
            "title": "후렴구: Heroine Training Pla"
        },
        "publishedAt": "2026-08-04"
    },
    {
        "id": "stel-_g29-2fUPSA",
        "title": "ポッピンキャンディ☆フィーバー! (팝핀 캔디☆피버!)",
        "artist": "아오쿠모 린 x 유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "rin",
            "riko"
        ],
        "youtubeId": "_g29-2fUPSA",
        "duration": 213,
        "sabi": {
            "start": 74,
            "end": 109,
            "title": "후렴구: 팝핀 캔디☆피버! (Poppin' C"
        },
        "publishedAt": "2026-07-28"
    },
    {
        "id": "stel-Akx45HCYgf0",
        "title": "セカイ (세카이)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "Akx45HCYgf0",
        "duration": 262,
        "sabi": {
            "start": 91,
            "end": 126,
            "title": "후렴구: セカイ(SEKAI) - DECO*27"
        },
        "publishedAt": "2026-07-21"
    },
    {
        "id": "stel-CokAlegAnsM",
        "title": "恋はまるで (사랑은 마치)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "CokAlegAnsM",
        "duration": 139,
        "sabi": {
            "start": 48,
            "end": 83,
            "title": "후렴구: Love Is Like - Music"
        },
        "publishedAt": "2026-07-19"
    },
    {
        "id": "stel-QgqiJKX0yq0",
        "title": "Henceforth (헨스포스)",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "QgqiJKX0yq0",
        "duration": 242,
        "sabi": {
            "start": 84,
            "end": 119,
            "title": "후렴구: Henceforth - Oranges"
        },
        "publishedAt": "2025-10-11"
    },
    {
        "id": "stel-P51Wh7FO28I",
        "title": "No title",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "P51Wh7FO28I",
        "duration": 248,
        "sabi": {
            "start": 86,
            "end": 121,
            "title": "후렴구: No title - REOL"
        },
        "publishedAt": "2025-10-08"
    },
    {
        "id": "stel-xn1sosP6kKw",
        "title": "네모네모",
        "artist": "유즈하 리코",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "xn1sosP6kKw",
        "duration": 183,
        "sabi": {
            "start": 64,
            "end": 99,
            "title": "후렴구: 네모네모(NEMONEMO) - YEN"
        },
        "publishedAt": "2025-10-05"
    },
    {
        "id": "stel-RoPzUi4rt9A",
        "title": "メルメルメルメルメルメ (메루메루메루메루메)",
        "artist": "네네코 마시로",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g2",
        "members": [
            "mashiro"
        ],
        "youtubeId": "RoPzUi4rt9A",
        "duration": 100,
        "sabi": {
            "start": 35,
            "end": 70,
            "title": "후렴구: 메루메루메루메루메루메 [ 마시로 co"
        },
        "publishedAt": "2023-08-27"
    },
    {
        "id": "stel-Rkd03AguDJ4",
        "title": "飛行艇 (비행정)",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "Rkd03AguDJ4",
        "duration": 314,
        "sabi": {
            "start": 109,
            "end": 144,
            "title": "후렴구: 飛行艇(비행정) - King Gnu"
        },
        "publishedAt": "2026-09-07"
    },
    {
        "id": "stel-5iYsqcKaQuw",
        "title": "Enemy",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "5iYsqcKaQuw",
        "duration": 199,
        "sabi": {
            "start": 69,
            "end": 104,
            "title": "후렴구: Enemy - Imagine Drag"
        },
        "publishedAt": "2025-10-19"
    },
    {
        "id": "stel-c_xvBZNKa9g",
        "title": "オドループ (오도루프)",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "c_xvBZNKa9g",
        "duration": 262,
        "sabi": {
            "start": 91,
            "end": 126,
            "title": "후렴구: オドループ(Oddloop) - フレデ"
        },
        "publishedAt": "2025-10-13"
    },
    {
        "id": "stel-fc8eV7D-ANs",
        "title": "テレパシ (텔레파시)",
        "artist": "하나코 나나",
        "originalArtist": "커버 (Cover)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "fc8eV7D-ANs",
        "duration": 141,
        "sabi": {
            "start": 49,
            "end": 84,
            "title": "후렴구: テレパシ(텔레파시) - DECO*27"
        },
        "publishedAt": "2025-10-12"
    },
    {
        "id": "stel-NGyCzUHjorI",
        "title": "불꽃",
        "artist": "아오쿠모 린 & 하나코 나나",
        "originalArtist": "아오쿠모 린 & 하나코 나나 (Original)",
        "type": "original",
        "gen": "g3",
        "members": [
            "rin",
            "nana"
        ],
        "youtubeId": "NGyCzUHjorI",
        "duration": 175,
        "publishedAt": "2026-05-13",
        "sabi": {
            "start": 55,
            "end": 85,
            "title": "사비: 가슴속 타오르는 불꽃"
        }
    },
    {
        "id": "stel-obS6uOy8vGs",
        "title": "룰라라! 룰루랄라!",
        "artist": "유즈하 리코",
        "originalArtist": "유즈하 리코 (Original)",
        "type": "original",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "obS6uOy8vGs",
        "duration": 222,
        "publishedAt": "2025-05-26",
        "sabi": {
            "start": 50,
            "end": 82,
            "title": "사비: Lulala! Lululala!"
        }
    },
    {
        "id": "stel-8gDsaqNwUbo",
        "title": "Ready to Fire!",
        "artist": "아카네 리제",
        "originalArtist": "월드 오브 탱크 공식 OST",
        "type": "featuring",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "8gDsaqNwUbo",
        "duration": 202,
        "sabi": {
            "start": 48,
            "end": 84,
            "title": "후렴구: Ready to Fire!"
        },
        "publishedAt": "2024-05-03"
    },
    {
        "id": "stel-PlbkHHlKO7U",
        "title": "DIVE 2 FIGHT",
        "artist": "아카네 리제",
        "originalArtist": "라이엇 게임즈 2XKO 공식 주제가",
        "type": "featuring",
        "gen": "g2",
        "members": [
            "lize"
        ],
        "youtubeId": "PlbkHHlKO7U",
        "duration": 185,
        "sabi": {
            "start": 46,
            "end": 78,
            "title": "후렴구: Dive to Fight"
        },
        "publishedAt": "2024-08-08"
    },
    {
        "id": "stel-DLFDx_CZwf8",
        "title": "Colorful Tempo",
        "artist": "텐코 시부키",
        "originalArtist": "명조: 워더링 웨이브 솔라리스 해변 이야기 공식 OST",
        "type": "featuring",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "DLFDx_CZwf8",
        "duration": 160,
        "sabi": {
            "start": 42,
            "end": 75,
            "title": "후렴구: Colorful Tempo"
        },
        "publishedAt": "2024-08-16"
    },
    {
        "id": "stel-N_vYUNEktsA",
        "title": "도깨비 꽃 (DKBK)",
        "artist": "TAK (feat. 텐코 시부키)",
        "originalArtist": "TAK",
        "type": "featuring",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "N_vYUNEktsA",
        "duration": 191,
        "sabi": {
            "start": 55,
            "end": 90,
            "title": "후렴구: 피어나는 도깨비 꽃"
        },
        "publishedAt": "2024-11-06"
    },
    {
        "id": "stel-2jSW47-0smE",
        "title": "at the end",
        "artist": "이한울 (feat. 강지)",
        "originalArtist": "이한울",
        "type": "featuring",
        "gen": "group",
        "members": [
            "group"
        ],
        "youtubeId": "2jSW47-0smE",
        "duration": 163,
        "sabi": {
            "start": 40,
            "end": 75,
            "title": "후렴구: At the end"
        },
        "publishedAt": "2021-04-20"
    },
    {
        "id": "stel-eEnEH7IpQtc",
        "title": "어젯밤도 (Last Night)",
        "artist": "이한울 (feat. 강지)",
        "originalArtist": "이한울",
        "type": "featuring",
        "gen": "group",
        "members": [
            "group"
        ],
        "youtubeId": "eEnEH7IpQtc",
        "duration": 191,
        "sabi": {
            "start": 48,
            "end": 85,
            "title": "후렴구: 어젯밤도"
        },
        "publishedAt": "2020-07-28"
    },
    {
        "id": "stel-H4T4ihraPic",
        "title": "Born to run",
        "artist": "하나코 나나",
        "originalArtist": "미츠키요 (Mitsukiyo) [봉누도 오프닝 OST]",
        "type": "featuring",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "H4T4ihraPic",
        "duration": 128,
        "sabi": {
            "start": 35,
            "end": 65,
            "title": "후렴구: Born to run"
        },
        "publishedAt": "2024-12-12"
    },
    {
        "id": "stel-blFr5w6o2jQ",
        "title": "My Sea (아이와 나의 바다) [IU]",
        "artist": "유즈하 리코",
        "originalArtist": "아이유 (IU)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "riko"
        ],
        "youtubeId": "blFr5w6o2jQ",
        "duration": 318,
        "sabi": {
            "start": 79,
            "end": 114,
            "title": "후렴구: 아이와 나의 바다"
        },
        "publishedAt": "2024-12-20"
    },
    {
        "id": "stel-y-rdBQSrzSs",
        "title": "Dynamite",
        "artist": "하나코 나나",
        "originalArtist": "BTS (방탄소년단)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "y-rdBQSrzSs",
        "duration": 200,
        "sabi": {
            "start": 50,
            "end": 85,
            "title": "후렴구: Shining through the city with a little funk and soul"
        },
        "publishedAt": "2024-12-25"
    },
    {
        "id": "stel-qv_VVUJOt0M",
        "title": "Catallena (까탈레나)",
        "artist": "하나코 나나",
        "originalArtist": "오렌지캬라멜 (Orange Caramel)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "qv_VVUJOt0M",
        "duration": 197,
        "sabi": {
            "start": 49,
            "end": 84,
            "title": "후렴구: 까탈레나"
        },
        "publishedAt": "2024-12-18"
    },
    {
        "id": "stel-npwilOOckxY",
        "title": "100% for You",
        "artist": "하나코 나나",
        "originalArtist": "커버곡",
        "type": "cover",
        "gen": "g3",
        "members": [
            "nana"
        ],
        "youtubeId": "npwilOOckxY",
        "duration": 206,
        "sabi": {
            "start": 51,
            "end": 86,
            "title": "후렴구: 100% for You"
        },
        "publishedAt": "2024-12-15"
    },
    {
        "id": "stel-Zetk77I6_s8",
        "title": "Otsukare Summer [おつかれsummer]",
        "artist": "하나코 나나, 사키하네 후야",
        "originalArtist": "HALCALI",
        "type": "cover",
        "gen": "group",
        "members": [
            "nana",
            "huya"
        ],
        "youtubeId": "Zetk77I6_s8",
        "duration": 240,
        "sabi": {
            "start": 60,
            "end": 95,
            "title": "후렴구: Otsukare Summer"
        },
        "publishedAt": "2024-12-10"
    },
    {
        "id": "stel-zQp6ZZAT6ew",
        "title": "mosi mosi? (楽音 / 사사네)",
        "artist": "텐코 시부키",
        "originalArtist": "楽音 (사사네)",
        "type": "cover",
        "gen": "g3",
        "members": [
            "shibuki"
        ],
        "youtubeId": "zQp6ZZAT6ew",
        "duration": 164,
        "sabi": {
            "start": 41,
            "end": 76,
            "title": "후렴구: mosi mosi?"
        },
        "publishedAt": "2024-12-05"
    },
    {
        "id": "stel-uBtFoUXR9Qc",
        "title": "Plover [Yorushika - Chidori]",
        "artist": "아라하시 타비",
        "originalArtist": "요루시카 (Yorushika)",
        "type": "cover",
        "gen": "g1",
        "members": [
            "tabi"
        ],
        "youtubeId": "uBtFoUXR9Qc",
        "duration": 255,
        "sabi": {
            "start": 63,
            "end": 98,
            "title": "후렴구: Plover"
        },
        "publishedAt": "2024-12-01"
    }
];

// 헬퍼 함수들
function getAllSongs() {
    let custom = [];
    let autoDetected = [];
    try {
        if (window.StorageManager) {
            if (typeof window.StorageManager.getCustomSongs === 'function') {
                custom = window.StorageManager.getCustomSongs() || [];
            }
            if (typeof window.StorageManager.getAutoDetectedSongs === 'function') {
                autoDetected = window.StorageManager.getAutoDetectedSongs() || [];
            }
        }
    } catch (e) {
        custom = [];
        autoDetected = [];
    }

    // 신곡 자동 감지 곡(최신) -> 사용자 직접 추가 곡 -> 정규 카탈로그 순으로 통합
    DEFAULT_SONGS.forEach((s, idx) => {
        if (!s._catalogIndex) s._catalogIndex = idx + 1;
    });
    const baseList = [...autoDetected, ...custom, ...DEFAULT_SONGS];
    
    // ID 및 유튜브 ID 중복 방지
    const seenIds = new Set();
    let all = [];
    for (const song of baseList) {
        const key = song.id || song.youtubeId;
        if (!seenIds.has(key)) {
            seenIds.add(key);
            all.push({ ...song });
        }
    }

    // 사용자 맞춤 곡 정보 수정(Overrides) 및 맞춤 사비 실시간 병합
    try {
        if (window.StorageManager) {
            const overrides = typeof window.StorageManager.getSongOverrides === 'function'
                ? window.StorageManager.getSongOverrides()
                : {};
            const customSabis = typeof window.StorageManager.getCustomSabis === 'function'
                ? window.StorageManager.getCustomSabis()
                : {};

            all.forEach(song => {
                if (overrides && overrides[song.id]) {
                    Object.assign(song, overrides[song.id]);
                }
                if (customSabis && customSabis[song.id]) {
                    song.sabi = { ...song.sabi, ...customSabis[song.id] };
                }
            });

            const hidden = typeof window.StorageManager.getHiddenSongs === 'function'
                ? window.StorageManager.getHiddenSongs()
                : [];
            if (hidden && hidden.length > 0) {
                const hiddenSet = new Set(hidden);
                all = all.filter(s => !hiddenSet.has(s.id));
            }
        }
    } catch (e) {}

    // 전곡 한국어 제목 및 불필요한 노이즈 단어 자동 정제
    all.forEach(song => {
        if (song && song.title) {
            song.title = cleanAndKoreanizeTitle(song.title);
        }
    });

    return all;
}

function cleanAndKoreanizeTitle(title) {
    if (!title) return '';
    let t = title.trim();

    // 1. [4K], 【4K】, (4K), (MV), [MV], [Live], (Live), Official MV 등 잡음 제거
    t = t.replace(/[\[【\(]\s*(?:4K|MV|Live|Official)\s*[\]】\)]/gi, '');
    t = t.replace(/\s*Official\s*(?:Music\s*Video|Video|MV)\s*$/gi, '');
    t = t.replace(/\s*(?:Music\s*Video|MV)\s*$/gi, '');
    t = t.replace(/[\s\|ㅣ/]*[\[【\(]?(?:Live\s*)?Cover[\]】\)]?.*$/gi, '');
    t = t.replace(/\s*\(Feat\.[^\)]+\)/gi, '');

    // 2. 파이프 기호 분리 (아티스트 | 곡제목)
    const pipeMatch = t.match(/^[^\|ㅣ]+[\|ㅣ]\s*[\'‘"“]([^\'’"”]+)[\'’"”]/);
    if (pipeMatch) {
        t = pipeMatch[1].trim();
    } else {
        const pipeMatch2 = t.match(/^[^\|ㅣ]+[\|ㅣ]\s*([^\|ㅣ\n]+)$/);
        if (pipeMatch2 && !/cover|보았다/i.test(pipeMatch2[1])) {
            t = pipeMatch2[1].trim();
        }
    }

    // 3. 따옴표 제거 및 양끝 정리
    t = t.replace(/^[\'‘"“](.+)[\'’"”]$/, '$1').trim();
    t = t.replace(/^[\|\-ㅣ/]\s*/, '').replace(/\s*[\|\-ㅣ/]$/, '').trim();

    // 4. 영어 전용 또는 혼용 대표곡 한국어 매핑
    const TITLE_MAP = {
        'Milky Way': '밀키웨이',
        'Stars Align': '스타즈 얼라인',
        'Our Tales': '아워 테일즈',
        'Hit On Shot': '히트 온 샷',
        'Dear My Fairy': '디어 마이 페어리',
        'セカイ (SEKAI)': '세카이',
        'SEKAI': '세카이',
        'Maid My Way': '메이드 마이 웨이',
        'Hush Trap': '허쉬 트랩',
        'Frozen Eclipse': '프로즌 이클립스',
        'Star Walkin': '스타 워킨',
        'Star Walkin\'': '스타 워킨',
        'STAR WALKIN\'': '스타 워킨',
        'Identity': '아이덴티티',
        'Ego Rock': '에고 록',
        'W●RK': '워크 (W●RK)',
        'King': '킹 (King)',
        'Villain': '빌런',
        'God-ish': '신 같네 (신의 뜻대로)'
    };
    if (TITLE_MAP[t]) {
        return TITLE_MAP[t];
    }

    return t;
}
window.cleanAndKoreanizeTitle = cleanAndKoreanizeTitle;

function getSongById(id) {
    return getAllSongs().find(s => s.id === id) || null;
}

function getSongsByMember(memberId) {
    const songs = getAllSongs();
    if (memberId === 'all') return songs;
    if (memberId && memberId.startsWith('gen-')) {
        const genKey = memberId.replace('gen-', '');
        return songs.filter(s => s.gen === genKey);
    }
    if (memberId === 'group') return songs.filter(s => s.gen === 'group' || (s.members && s.members.length > 1));
    return songs.filter(s => s.members && s.members.includes(memberId));
}

function getSongsByGen(genId) {
    const songs = getAllSongs();
    if (genId === 'all') return songs;
    return songs.filter(s => s.gen === genId);
}

function getSongsByType(type) {
    const songs = getAllSongs();
    if (!type || type === 'all') return songs;
    return songs.filter(s => s.type === type);
}

function getSabiMedleyQueue() {
    const songs = getAllSongs().filter(s => s.sabi && s.sabi.start !== undefined);
    for (let i = songs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [songs[i], songs[j]] = [songs[j], songs[i]];
    }
    return songs;
}

function getMemberRadioQueue(memberId) {
    const songs = getSongsByMember(memberId);
    for (let i = songs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [songs[i], songs[j]] = [songs[j], songs[i]];
    }
    return songs;
}

function addCustomSong(songData) {
    let vid = songData.youtubeUrlOrId.trim();
    if (vid.includes('v=')) {
        vid = vid.split('v=')[1].split('&')[0];
    } else if (vid.includes('youtu.be/')) {
        vid = vid.split('youtu.be/')[1].split('?')[0];
    }
    if (vid.length !== 11) {
        throw new Error('올바른 유튜브 링크 또는 11자리 영상 ID가 아닙니다.');
    }

    const newSong = {
        id: 'custom-' + Date.now(),
        title: songData.title.trim(),
        artist: songData.artist ? songData.artist.trim() : '스텔라이브',
        originalArtist: '사용자 직접 추가',
        type: songData.type || 'cover',
        gen: 'custom',
        members: songData.members && songData.members.length > 0 ? songData.members : ['group'],
        youtubeId: vid,
        duration: 200,
        publishedAt: songData.publishedAt || new Date().toISOString().split('T')[0],
        addedAt: Date.now(),
        sabi: {
            start: songData.sabiStart !== undefined ? Number(songData.sabiStart) : 45,
            end: songData.sabiEnd !== undefined ? Number(songData.sabiEnd) : 80,
            title: '맞춤 후렴구'
        }
    };

    if (window.StorageManager) {
        window.StorageManager.addCustomSong(newSong);
    }
    return newSong;
}

window.MEMBERS = MEMBERS;
window.GENERATIONS = GENERATIONS;
window.DEFAULT_SONGS = DEFAULT_SONGS;
window.getAllSongs = getAllSongs;
window.getSongById = getSongById;
window.getSongsByMember = getSongsByMember;
window.getSongsByGen = getSongsByGen;
window.getSongsByType = getSongsByType;
window.getSabiMedleyQueue = getSabiMedleyQueue;
window.getMemberRadioQueue = getMemberRadioQueue;
window.addCustomSong = addCustomSong;
