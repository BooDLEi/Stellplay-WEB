"""
StellPlay (스텔플레이) - 로컬 웹 서버 및 무광고 오디오 스트리밍 백엔드
- yt-dlp 기반 순수 오디오 스트림 추출 (Zero-Ad)
- 스마트 메타데이터 파싱 API (/api/info)
- 고속 다중 스레드 스트리밍 서버 (ThreadingTCPServer)
"""

import sys
import os
import time
import json
import re
import urllib.request
import urllib.parse
import http.server
import socketserver
import webbrowser
import hashlib
import shutil

# 콘솔 인코딩 보호
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

if getattr(sys, 'frozen', False):
    base_dir = getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
    if os.path.exists(os.path.join(base_dir, 'index.html')):
        DIRECTORY = base_dir
    elif os.path.exists(os.path.join(os.path.dirname(sys.executable), 'index.html')):
        DIRECTORY = os.path.dirname(sys.executable)
    elif os.path.exists(os.path.join(base_dir, '_internal', 'index.html')):
        DIRECTORY = os.path.join(base_dir, '_internal')
    else:
        DIRECTORY = base_dir
else:
    DIRECTORY = os.path.dirname(os.path.abspath(__file__))

PORT = 8888

# 윈도우 환경 초고속 서빙 핸들러
http.server.SimpleHTTPRequestHandler.address_string = lambda self: self.client_address[0]

# yt-dlp 임포트
try:
    import yt_dlp
    HAS_YTDLP = True
except ImportError:
    HAS_YTDLP = False

# 오디오 스트림 캐시 (id -> {url, http_headers, expires})
_STREAM_CACHE = {}

def get_audio_stream_info(vid):
    """YouTube ID에서 순수 오디오 스트림 URL과 헤더 추출 (인메모리 캐싱)"""
    if not HAS_YTDLP or not vid:
        return None
    vid = str(vid).strip()
    if not re.match(r'^[a-zA-Z0-9_-]{11}$', vid):
        return None
    now = time.time()
    if vid in _STREAM_CACHE and _STREAM_CACHE[vid]['expires'] > now:
        return _STREAM_CACHE[vid]

    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'extractor_args': {'youtube': {'player_client': ['android', 'web']}}
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={vid}", download=False)
            data = {
                'url': info.get('url'),
                'http_headers': info.get('http_headers', {}),
                'title': clean_title(info.get('title', '')),
                'duration': info.get('duration', 0),
                'expires': now + 7200  # 2시간 유효
            }
            _STREAM_CACHE[vid] = data
            return data
    except Exception as e:
        print(f"[Audio Stream Error] {vid}: {e}", flush=True)
        return None

def fetch_youtube_video_info(url_or_id):
    """유튜브 링크 또는 ID로 영상 메타데이터(제목, 채널명, 썸네일, 길이) 파싱 (SSRF 방어 화이트리스트 검증)"""
    if not HAS_YTDLP:
        return None
    url_or_id = (url_or_id or '').strip()
    if not url_or_id:
        return None

    if re.match(r'^[a-zA-Z0-9_-]{11}$', url_or_id):
        url = f"https://www.youtube.com/watch?v={url_or_id}"
    elif url_or_id.startswith(('http://', 'https://')):
        parsed = urllib.parse.urlparse(url_or_id)
        hostname = (parsed.hostname or '').lower()
        if hostname in ('youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be'):
            url = url_or_id
        else:
            print(f"[Security Alert] Blocked non-YouTube URL in fetch_youtube_video_info: {url_or_id}", flush=True)
            return None
    else:
        return None

    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            vid = info.get('id')
            raw_date = info.get('upload_date') or ''
            pub_at = f"{raw_date[:4]}-{raw_date[4:6]}-{raw_date[6:]}" if len(raw_date) == 8 else ''
            return {
                'id': vid,
                'title': clean_title(info.get('title', '')),
                'artist': info.get('uploader') or info.get('channel') or '스텔라이브',
                'duration': int(info.get('duration') or 0),
                'thumbnail': info.get('thumbnail') or f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg",
                'publishedAt': pub_at,
                'channelTitle': info.get('channel') or info.get('uploader') or ''
            }
    except Exception as e:
        print(f"[Info Parse Error] {url_or_id}: {e}", flush=True)
        return None

JAPANESE_SONG_MAP = {
    '타상연화': ('打上花火', '타상연화'),
    'uchiage hanabi': ('打上花火', '타상연화'),
    '혁명도중': ('革命道中', '혁명도중'),
    '革命道中': ('革命道中', '혁명도중'),
    '제육감': ('第六感', '제육감'),
    'sixth sense': ('第六感', '제육감'),
    '第六感': ('第六感', '제육감'),
    '유령이 되고싶어': ('ゆうれいになりたい', '유령이 되고싶어'),
    'ゆうれいになりたい': ('ゆうれいになりたい', '유령이 되고싶어'),
    '도쿄 테디베어': ('東京テディベア', '도쿄 테디베어'),
    '東京テ디베어': ('東京テ디베어', '도쿄 테디베어'),
    '東京テディベア': ('東京テディベア', '도쿄 테디베어'),
    'tokyo teddy bear': ('東京テ디베어', '도쿄 테디베어'),
    '아 프리오리': ('ア・プリオリ', '아 프리오리'),
    'ア・プリオリ': ('ア・プリオリ', '아 프리오리'),
    'a priori': ('ア・プリオリ', '아 프리오리'),
    '오버라이드': ('オーバーライド', '오버라이드'),
    'オーバーライド': ('オーバーライド', '오버라이드'),
    'override': ('オーバーライド', '오버라이드'),
    '불가행력': ('不可幸力', '불가행력'),
    '不可幸力': ('不可幸力', '불가행력'),
    'fukakouryoku': ('不可幸力', '불가행력'),
    '나에게 꽃다발': ('わたしに花束', '나에게 꽃다발'),
    'わたしに花束': ('わたしに花束', '나에게 꽃다발'),
    '私に花束': ('わたしに花束', '나에게 꽃다발'),
    '브레인 롯': ('ブレインロット', '브레인 롯'),
    'ブレインロット': ('ブレインロット', '브레인 롯'),
    '소녀레이': ('少女レイ', '소녀레이'),
    '소녀 레이': ('少女レイ', '소녀레이'),
    '少女レイ': ('少女レイ', '소녀레이'),
    '비바해피': ('ビバハピ', '비바해피'),
    'ビバハピ': ('ビバハピ', '비바해피'),
    'otsukare summer': ('おつかれsummer', '수고했어 summer'),
    'おつかれsummer': ('おつかれsummer', '수고했어 summer'),
    '물떼새': ('千鳥', '물떼새'),
    '千鳥': ('千鳥', '물떼새'),
    'chidori': ('千鳥', '물떼새'),
    'mosi mosi?': ('もしもし？', '모시모시?'),
    'もしもし？': ('もしもし？', '모시모시?'),
    '모시모시': ('もしもし？', '모시모시?'),
    '구르는 바위, 네게 아침이 내린다': ('転がる岩、君に朝が降る', '구르는 바위, 네게 아침이 내린다'),
    '転がる岩、君に朝が降る': ('転がる岩、君に朝が降る', '구르는 바위, 네게 아침이 내린다'),
    '푸른 산호초': ('青い珊瑚礁', '푸른 산호초'),
    '青い珊瑚礁': ('青い珊瑚礁', '푸른 산호초'),
    '네, 기꺼이': ('はいよろこんで', '네, 기꺼이'),
    '네 기꺼이': ('はいよろこんで', '네, 기꺼이'),
    'はいよろこんで': ('はいよろこんで', '네, 기꺼이'),
    'はいよろんで': ('はいよろこんで', '네, 기꺼이'),
    '논브레스 오블리주': ('ノンブレス・オブリージュ', '논브레스 오블리주'),
    'ノンブレス・オブリージュ': ('ノンブレス・オブリージュ', '논브레스 오블리주'),
    '희극': ('喜劇', '희극'),
    '喜劇': ('喜劇', '희극'),
    '우리! 쓰레기 분리수거단': ('われら！ゴミ分別隊', '우리! 쓰레기 분리수거단'),
    'われら！ゴミ分別隊': ('われら！ゴミ分別隊', '우리! 쓰레기 분리수거단'),
    '我ら！ゴミ分別団': ('われら！ゴミ分別隊', '우리! 쓰레기 분리수거단'),
    '서머타임레코드': ('サマータイムレコード', '서머타임 레코드'),
    '서머타임 레코드': ('サマータイムレコード', '서머타임 레코드'),
    'サマータイムレコード': ('サマータイムレコード', '서머타임 레코드'),
    '청록': ('青緑', '청록'),
    '青緑': ('青緑', '청록'),
    'blue-green': ('青緑', '청록'),
    '친애하는 소년이여': ('拝啓、少年よ', '삼가 아룁니다, 소년이여'),
    '삼가 아룁니다, 소년이여': ('拝啓、少年よ', '삼가 아룁니다, 소년이여'),
    '拝啓、少年よ': ('拝啓、少年よ', '삼가 아룁니다, 소년이여'),
    '밤새도록 널 생각해': ('夜もすがら君想ふ', '밤새도록 널 생각해'),
    '夜もすがら君想ふ': ('夜もすがら君想ふ', '밤새도록 널 생각해'),
    '무대에 서서': ('舞台に立って', '무대에 서서'),
    '舞台に立って': ('舞台に立って', '무대에 서서'),
    'standing on the stage': ('舞台に立って', '무대에 서서'),
    '내일 또 보자': ('またあした', '내일 또 보자'),
    'またあした': ('またあした', '내일 또 보자'),
    'また明日': ('またあした', '내일 또 보자'),
    '망상 아스파탐': ('妄想アスパルテーム', '망상 아스파탐'),
    '妄想アスパルテーム': ('妄想アスパルテーム', '망상 아스파탐'),
    'delusional aspartame': ('妄想アスパルテーム', '망상 아스파탐'),
    '악마가 아닌걸': ('デビルじゃないもん', '악마가 아닌걸'),
    'デビルじゃないもん': ('デビルじゃないもん', '악마가 아닌걸'),
    '悪魔じゃないもん': ('デビルじゃないもん', '악마가 아닌걸'),
    '춘수': ('春愁', '춘수'),
    '春愁': ('春愁', '춘수'),
    '부탁해 달링': ('おねがいダーリン', '부탁해 달링'),
    'おねがいダーリン': ('おねがいダーリン', '부탁해 달링'),
    '멜트': ('メルト', '멜트'),
    'メルト': ('メルト', '멜트'),
    '오렌지': ('オレンジ', '오렌지'),
    'オレンジ': ('オレンジ', '오렌지'),
    '아이네 클라이네': ('アイネクライネ', '아이네 클라이네'),
    'アイネクライネ': ('アイネクライネ', '아이네 클라이네'),
    'eine kleine': ('アイネクライネ', '아이네 클라이네'),
    '숨바꼭질': ('かくれんぼ', '숨바꼭질'),
    'かくれんぼ': ('かくれんぼ', '숨바꼭질'),
    '푸른 하늘의 랩소디': ('青空のラプソディ', '푸른 하늘의 랩소디'),
    '青空のラプソディ': ('青空のラプソ디', '푸른 하늘의 랩소디'),
    '사랑 감기에 실려': ('恋風邪にのせて', '사랑 감기에 실려'),
    '恋風邪にのせて': ('恋風邪にのせて', '사랑 감기에 실려'),
    'carried on a love cold': ('恋風邪にのせて', '사랑 감기에 실려'),
    '포니': ('フォニイ', '포니'),
    'フォニイ': ('フォニイ', '포니'),
    'phony': ('フォニイ', '포니'),
    '행복에 대해 내가 생각한 것': ('幸せについて、僕が考えたこと', '행복에 대해 내가 생각한 것'),
    '幸せについて、僕が考えたこと': ('幸せについて、僕が考えたこと', '행복에 대해 내가 생각한 것'),
    '푸른 보석과 어린 용': ('青い宝石と竜の子', '푸른 보석과 어린 용'),
    '青い宝石と竜の子': ('青い宝石と竜の子', '푸른 보석과 어린 용'),
    '색채': ('色彩', '색채'),
    '色彩': ('色彩', '색채'),
    '세카이': ('セカイ', '세카이'),
    'セカイ': ('セカイ', '세카이'),
    '라일락': ('ライラック', '라일락'),
    'ライラック': ('ライラック', '라일락'),
    'lilac': ('ライラック', '라일락'),
    '귀여워서 미안해': ('可愛くてごめん', '귀여워서 미안해'),
    '可愛くてごめん': ('可愛くてごめん', '귀여워서 미안해'),
    '강풍 올백': ('強風オールバック', '강풍 올백'),
    '강풍올백': ('強風オールバック', '강풍 올백'),
    '強風オールバック': ('強風オールバック', '강풍 올백'),
    '실루엣': ('シルエット', '실루엣'),
    'シルエット': ('シルエット', '실루엣'),
    '루즈의 전언': ('ルージュの伝言', '루즈의 전언'),
    'ルージュの伝言': ('ルージュの伝言', '루즈의 전언'),
    '팬서비스': ('ファンサ', '팬서비스'),
    '팬 서비스': ('ファンサ', '팬서비스'),
    'ファンサ': ('ファンサ', '팬서비스'),
    '금목서': ('金木犀', '금목서'),
    '金木犀': ('金木犀', '금목서'),
    '눈물이 마르지 않아': ('涙が乾くまで', '눈물이 마르지 않아'),
    '涙が乾くまで': ('涙が乾くまで', '눈물이 마르지 않아'),
    '스파클': ('スパークル', '스파클'),
    'スパークル': ('スパークル', '스파클'),
    '쏘아올린 불꽃': ('打上花火', '타상연화'),
    '打上花火': ('打上花火', '타상연화'),
    '마로니에': ('マロニエ', '마로니에'),
    'マロニエ': ('マロニエ', '마로니에'),
    '메피스토': ('メフィスト', '메피스토'),
    'メフィスト': ('メフィスト', '메피스토'),
    '아이돌': ('アイドル', '아이돌'),
    'アイドル': ('アイドル', '아이돌'),
    '뱀파이어': ('ヴァンパイア', '뱀파이어'),
    'ヴァンパイア': ('ヴァンパイア', '뱀파이어'),
    '신 같네': ('神っぽいな', '신 같네'),
    '神っぽいな': ('神っぽいな', '신 같네'),
    '굿바이 선언': ('グッバイ宣言', '굿바이 선언'),
    'グッバイ宣言': ('グッバイ宣言', '굿바이 선언'),
    '피스 사인': ('ピースサイン', '피스 사인'),
    'ピースサイン': ('ピースサイン', '피스 사인'),
    '괴물': ('怪物', '괴물'),
    '怪物': ('怪物', '괴물'),
    '밤을 달리다': ('夜に駆ける', '밤을 달리다'),
    '夜に駆ける': ('夜に駆ける', '밤을 달리다'),
    '봄을 고하다': ('春を告げる', '봄을 고하다'),
    '春を告げる': ('春を告げる', '봄을 고하다'),
    '말해줘': ('言って。', '말해줘'),
    '言って。': ('言って。', '말해줘'),
    '그저 네게 맑아라': ('ただ君に晴れ', '그저 네게 맑아라'),
    'ただ君に晴れ': ('ただ君に晴れ', '그저 네게 맑아라'),
    '사계절이 흐르고': ('四季刻歌', '사계절이 흐르고'),
    '四季刻歌': ('四季刻歌', '사계절이 흐르고'),
    '백일': ('白日', '백일'),
    '白日': ('白日', '백일'),
    '마리골드': ('マリーゴールド', '마리골드'),
    'マリーゴールド': ('マリーゴールド', '마리골드'),
}

ENGLISH_TITLES_SET = {
    'deja vu', 'to you, my light', 'star trail', 'dancehall', 'orion', 'acacia',
    'stellar stellar', 'one last kiss', 'ray', 'twinkle', 'chewing luv', 'festa!',
    'our tales', 'supadopa', 'stars align', 'dear my fairy', 'hit on shot',
    'addict!on', 'milky way', 'berry verry strawberry', 'villain alert',
    'high hopes', 'drivers license', 'hollowness', 'booo!', 'loveit?', 'start',
    'oh...', 'mela!', 'daybreak frontline', 'henceforth', 'surges', 'summer',
    'refrain', 'drowning', 'pale', 'question', 'identity', 'ego rock', 'king',
    'villain', 'w●rk', 'confrontation', 'alive 2', 'land of lola', 'dynamite',
    'dance the night away', 'catallena', '100% for you', 'loop in june',
    'kick back', 'pretender', 'lemon', 'tomboy', 'joker', 'aizo'
}

def clean_title(title, raw_title=''):
    if not title:
        return ""
    t = title.strip()
    raw = raw_title.strip() if raw_title else ""
    if re.search(r'where\s*stars\s*begin|별이\s*시작되는\s*곳', f"{t} {raw}", re.IGNORECASE):
        return '별이 시작되는 곳'
    if re.search(r'타상연화|打上花火|쏘아올린\s*불꽃', f"{t} {raw}"):
        return '打上花火 (타상연화)'
    if re.search(r'혁명도중|革命道中', f"{t} {raw}"):
        return '革命道中 (혁명도중)'
    if re.search(r'ch4nge|체인지', f"{t} {raw}", re.IGNORECASE):
        return 'CH4NGE (체인지)'

    # 0. 유튜브 메타데이터 및 채널 접두어 제거
    t = re.sub(r'\s*-\s*YouTube$', '', t, flags=re.IGNORECASE)
    t = re.sub(r'^(?:\[STELLIVE\]\s*(?:ABYSS|Universe|Cliché)?\s*[\-\|ㅣ]\s*)', '', t, flags=re.IGNORECASE)
    t = re.sub(r'^(?:스텔라이브\s*\(StelLive\)\s*(?:Cliché|Universe)?\s*[\|Iㅣ]\s*|STELLIVE\s*\(스텔라이브\)\s*|StelLive\s*[\|ㅣ]\s*)', '', t, flags=re.IGNORECASE)
    t = re.sub(r'^(?:스텔라이브\s*\(STELLIVE\)\s*Universe\s*[\|ㅣ]\s*)', '', t, flags=re.IGNORECASE)

    # 1. 태그 및 잡음 제거
    t = re.sub(r'\[\s*(?:4K|UHD|HD|MV|Live|Official|3D\s*Live)\s*\]', '', t, flags=re.IGNORECASE)
    t = re.sub(r'【\s*(?:4K|UHD|HD|MV|Live|Official)\s*】', '', t, flags=re.IGNORECASE)
    t = re.sub(r'\(\s*(?:4K|UHD|HD|MV|Live|Official)\s*\)', '', t, flags=re.IGNORECASE)
    t = re.sub(r'\s*Official\s*(?:Music\s*Video|Video|MV)\s*$', '', t, flags=re.IGNORECASE)
    t = re.sub(r'\s*(?:Music\s*Video|MV)\s*$', '', t, flags=re.IGNORECASE)
    t = re.sub(r'[\/\|ㅣ\-]\s*[^\]】」』\/\|ㅣ\-]*?(?:Cover|불러보았다|歌ってみた|Cover곡|커버)[\s\S]*$', '', t, flags=re.IGNORECASE).strip()
    t = re.sub(r'(?<=[\]】」』\)])\s*[^\[\(\]】」』\/\|ㅣ\-]*?(?:Cover|불러보았다|歌ってみた|Cover곡|커버)[\s\S]*$', '', t, flags=re.IGNORECASE).strip()
    t = re.sub(r'[\s\|ㅣ/]*[\[【\(]?(?:3D\s*)?(?:Live\s*)?(?:Cover|불러보았다|歌ってみた|Cover곡|커버)[\]】\)]?.*$', '', t, flags=re.IGNORECASE).strip()
    t = re.sub(r'\s*(?:시즈키\s*토아|코가네\s*랑|하나요\s*히요리|토키노\s*메리|아야츠노\s*유니|아오쿠모\s*린|시라유키\s*히나|유즈하\s*리코|하나코\s*나나|텐코\s*시부키|아카네\s*리제|아라하시\s*타비|아이리\s*칸나|네네코\s*마시로)\s*Cover.*$', '', t, flags=re.IGNORECASE).strip()
    t = re.sub(r'\s*\(Feat\.[^\)]+\)', '', t, flags=re.IGNORECASE).strip()

    # 스마트 정규식 A: Nested 일본어 인용구 추출 (예: '아 프리오리 (Mrs. GREEN APPLE 「ア・プリオリ」)' -> 'ア・プリオリ (아 프리오리)')
    m_nested = re.search(r'^([가-힣a-zA-Z0-9\s]+)\s*[\(\[][^\)\]]*?[「『]([\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\s0-9\.\-!·・]+)[」』][^\)\]]*?[\)\]]$', t)
    if m_nested:
        kor = m_nested.group(1).strip()
        jap = m_nested.group(2).strip()
        return f"{jap} ({kor})"

    # 스마트 정규식 B: 괄호 내 일본어/원곡자 분리 (예: '제육감 [第六感 l Reol]' -> '第六感 (제육감)', '호랑풍류가 [나와 호랑이님 OST]' -> '호랑풍류가 (나와 호랑이님 OST)')
    m_bracket = re.search(r'^([가-힣a-zA-Z0-9\s,\.!\?]+)\s*[\[【「『\(]([\s\S]+?)[\]】」』\)]$', t)
    if m_bracket:
        prefix = m_bracket.group(1).strip()
        inside = m_bracket.group(2).strip()
        if re.search(r'(?i)OST', inside):
            return f"{prefix} ({inside})"
        parts = [p.strip() for p in re.split(r'[\/\|lIㅣ:\-]', inside) if p.strip()]
        jap_part = None
        for p in parts:
            if re.search(r'[\u3040-\u309F\u30A0-\u30FF]', p) or (re.search(r'[\u4E00-\u9FFF]', p) and not re.search(r'[가-힣]', p)):
                jap_part = p
                break
        if jap_part:
            jap_clean = re.sub(r'^[「『\'"“‘]+|[」』\'"”’]+$', '', jap_part).strip()
            if re.search(r'[가-힣]', prefix):
                return f"{jap_clean} ({prefix})"
            else:
                return jap_clean

    # 2. 파이프 분리 (아티스트 | 곡제목)
    pipe_match = re.match(r'^[^\|ㅣ]+[\|ㅣ]\s*[\'‘"“]([^\'’"”]+)[\'’"”]', t)
    if pipe_match:
        t = pipe_match.group(1).strip()
    else:
        pipe_match2 = re.match(r'^[^\|ㅣ]+[\|ㅣ]\s*([^\|ㅣ\n]+)$', t)
        if pipe_match2 and not re.search(r'cover|보았다|mv|라이브', pipe_match2.group(1), re.IGNORECASE):
            t = pipe_match2.group(1).strip()

    t = re.sub(r'^[\'‘"“](.+)[\'’"”]$', r'\1', t).strip()
    t = re.sub(r'^[\|\-ㅣ/]\s*', '', t)
    t = re.sub(r'\s*[\|\-ㅣ/]$', '', t).strip()

    # 3. 한국어 고유 곡명 표준 정리 (영어 부제 및 한자 제거)
    korean_exact = {
        '히로인이 되고 싶어 (I Want to Be a Heroine)': '히로인이 되고 싶어',
        '삐질게 (BBiJilGe)': '삐질게',
        '여로 (Voyage)': '여로',
        '하나 (夏拏)': '하나',
        'HANA': '하나',
        '최종화 (最終花)': '최종화',
        '최종화 (Acoustic Ver.)': '최종화',
        '最終花 (최종화)': '최종화',
        'Wish Me Luck [A journey] - WONPIL(DAY6)': '행운을 빌어 줘',
        '「명일방주: 엔드필드」 리노 EP - 미랫빛 라이더 Mirairo Rider': '미랫빛 라이더',
        'My Sea (아이와 나의 바다) [IU]': '아이와 나의 바다',
        '아이와 나의 바다': '아이와 나의 바다',
        'Atlantis Princess': '아틀란티스 소녀',
        '유성우': '유성우',
        '마음악보': '마음악보',
        '봄꿈': '봄꿈',
        '내꺼 하는 법': '내꺼 하는 법',
        '호랑풍류가': '호랑풍류가 (나와 호랑이님 OST)',
        '호랑풍류가 (나와 호랑이님 OST)': '호랑풍류가 (나와 호랑이님 OST)',
    }
    if t in korean_exact:
        return korean_exact[t]

    full_text = f"{t} {raw}".strip()
    full_lower = full_text.lower()

    # 특정 OST 및 뮤지컬 곡
    if 'loop in june' in full_lower: return 'Loop in June (명조:워더링 웨이브 OST)'
    if 'confrontation' in full_lower and '지킬' in full_text: return 'Confrontation (지킬 앤 하이드 OST)'
    if 'alive 2' in full_lower and '지킬' in full_text: return 'Alive 2 (지킬 앤 하이드 OST)'
    if 'land of lola' in full_lower and '킹키부츠' in full_text: return 'Land of Lola (킹키부츠 OST)'
    if '웃는남자' in full_text: return '웃는남자 (뮤지컬 웃는남자 OST)'
    if '여우의 별자리' in full_text and '명조' in full_text: return '여우의 별자리 (명조:워더링 웨이브 OST)'

    # 3D 라이브 특별 곡
    if 'dance the night away' in full_lower: return 'Dance The Night Away'
    if 'dynamite' in full_lower and ('bts' in full_lower or '방탄소년단' in full_text): return 'Dynamite'
    if '까탈레나' in full_text or 'catallena' in full_lower: return '까탈레나'
    if '100% for you' in full_lower: return '100% for You'

    # 대표 영어 및 일본어 특별 타이틀 정규화
    if 'deja vu' in full_lower and 'olivia' in full_lower: return 'Deja vu'
    if 'drivers license' in full_lower: return 'drivers license'
    if 'dancehall' in full_lower: return 'Dancehall'
    if 'star trail' in full_lower: return 'STAR TRAIL'
    if 'high hopes' in full_lower: return 'High Hopes'
    if 'acacia' in full_lower and 'bump' in full_lower: return 'Acacia'
    if 'one last kiss' in full_lower: return 'One Last Kiss'
    if 'stellar stellar' in full_lower: return 'Stellar Stellar'
    if 'milky way' in full_lower: return 'Milky Way'
    if 'onegai darling' in full_lower or 'おねがいダーリン' in full_text: return 'おねがいダーリン (부탁해 달링)'
    if 'waste sorting squad' in full_lower or 'gomi bunbetsudan' in full_lower: return 'われら！ゴミ分別隊 (우리! 쓰레기 분리수거단)'
    if 'melt cpk' in full_lower or ('melt' in full_lower and 'supercell' in full_lower): return 'メルト (CPK! Remix)'

    # 후미 아티스트 및 인용구 제거
    t = re.sub(r'\s*-\s*[「『【\[].*?[」』】\]]\s*$', '', t)
    t = re.sub(r'\s*\[(?:타다노\s*카에데|只野\s*楓)[^\]]*\]\s*$', '', t)

    # 영어 제목에 한국어 번역이 괄호로 붙은 경우: 'English (한글)' -> 영어 원문 유지 ('영어제목 미번역' 원칙)
    m_eng_kor = re.match(r'^([a-zA-Z0-9\s\?!\.●\'-]+)\s*\(([가-힣\s\?!\.●\'-]+)\)$', t)
    if m_eng_kor:
        eng_cand = m_eng_kor.group(1).strip()
        eng_low = eng_cand.lower()
        if eng_low in ENGLISH_TITLES_SET or re.match(r'^[a-zA-Z0-9\s\?!\.●\'-]+$', eng_cand):
            if eng_low not in [k.lower() for k in JAPANESE_SONG_MAP.keys()]:
                return eng_cand

    # 영어 곡 원문 보존 (한국어 번역/괄호 미적용)
    t_clean_alnum = re.sub(r'[^a-zA-Z0-9\s\?!\.●]', '', t).strip().lower()
    if t_clean_alnum in ENGLISH_TITLES_SET:
        return t.strip()

    # 아이돌 예외
    if t.strip() in ('아이돌', 'アイドル', '아이돌 (YOASOBI)', 'アイドル (YOASOBI)'):
        return 'アイドル (아이돌)'

    # 일본어 곡 원곡명 (번역명) 매핑 검사
    for key, (orig_jap, kor_trans) in JAPANESE_SONG_MAP.items():
        if key in ('아이돌', 'アイドル'): continue
        if key.lower() == t.lower():
            return f"{orig_jap} ({kor_trans})"

    for key, (orig_jap, kor_trans) in JAPANESE_SONG_MAP.items():
        if key in ('아이돌', 'アイドル'): continue
        pattern = rf'(?:^|[\s\[\(『【]){re.escape(key)}(?:$|[\s\]\)』】])'
        if re.search(pattern, t, re.IGNORECASE):
            return f"{orig_jap} ({kor_trans})"

    # '한글 (일본어)' 형태인 경우 -> '일본어 (한글)'로 역전 정규화!
    m_rev = re.match(r'^([가-힣\s0-9]+)\s*[\(\[『【]([\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\s0-9\.\-!]+)[\)\]』】]$', t)
    if m_rev:
        return f"{m_rev.group(2).strip()} ({m_rev.group(1).strip()})"

    # 이미 '일본어 (한글)' 형태인 경우 정규화 유지
    m_std = re.match(r'^([\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\s0-9\.\-!]+)\s*\(([가-힣\s0-9]+)\)$', t)
    if m_std:
        return f"{m_std.group(1).strip()} ({m_std.group(2).strip()})"

    # 한국어 곡 뒤에 영어 부제가 붙어 있는 경우: '한국어 (English)' -> 순수 한국어만 보존
    m_kor_eng = re.match(r'^([가-힣\s0-9]+)\s*\([a-zA-Z\s0-9\.\-!]+\)$', t)
    if m_kor_eng:
        return m_kor_eng.group(1).strip()

    # 트레일링 아티스트 태그 '제목 - 아티스트' 분리 처리
    if ' - ' in t:
        parts = t.split(' - ')
        if len(parts) == 2:
            left, right = parts[0].strip(), parts[1].strip()
            if any(k in right.lower() for k in ['yoasobi', 'bump of chicken', 'olivia rodrigo', 'mrs. green apple', 'vaundy', 'ado', 'tokotoko', 'hump back', 'kenshi yonezu', 'biz', 'wonpil', 'day6', 'fuwari', 'halcali']):
                return clean_title(left, raw_title)

    return t

def fetch_latest_official_tracks():
    """스텔라이브 공식 최신 음원 메타데이터 조회 (로컬 songs-latest.json 즉시 로드 후 최신 플레이리스트 보강)"""
    tracks = []
    seen_ids = set()

    # 1. 번들된 songs-latest.json 먼저 로드 (최신 87곡 기본 보장)
    candidate_paths = [
        os.path.join(DIRECTORY, 'songs-latest.json'),
        os.path.join(DIRECTORY, '_internal', 'songs-latest.json'),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), 'songs-latest.json'),
        os.path.join(os.getcwd(), 'songs-latest.json'),
        os.path.join(DIRECTORY, 'mobile', 'songs-latest.json')
    ]
    ost_regex = re.compile(r'(?<![a-zA-Z])(?:OST|O\.S\.T)(?![a-zA-Z])', re.IGNORECASE)
    for p in candidate_paths:
        if os.path.exists(p):
            try:
                with open(p, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    arr = data.get('tracks', []) if isinstance(data, dict) else (data if isinstance(data, list) else [])
                    for item in arr:
                        vid = item.get('id')
                        dur = int(item.get('duration') or 0)
                        t_check = f"{item.get('title', '')} {item.get('rawTitle', '')}".lower()
                        # 롱폼/비커버/비음원 영상 원천 차단 (추억의 투니버스 메들리 및 Alice in Musicland 정규 커버 예외 허용)
                        if vid != '6mVByQMyxdY' and any(k in t_check for k in ['메들리', 'medley', '모음', '모음집', '플레이리스트', 'playlist', '작업용', 'bgm', '모음곡', '연속재생', '풀영상', '다시보기']):
                            continue
                        if dur > 420 and vid not in ('DMk4_4Xytz4', '6mVByQMyxdY'):
                            continue
                        if vid and vid not in seen_ids:
                            seen_ids.add(vid)
                            # OST 자동 분류 보장
                            if ost_regex.search(t_check):
                                item['defaultType'] = 'ost'
                            tracks.append(item)
                if tracks:
                    break
            except Exception as e:
                print(f"[Sync Local Read Error] {p}: {e}", flush=True)

    if not HAS_YTDLP:
        return tracks

    # 2. yt-dlp 가용 시 공식 최신 플레이리스트 2종 및 공식/멤버 채널에서 추가 신곡 탐색 및 병합
    sources = [
        ('group', 'https://www.youtube.com/playlist?list=PLLjd981H8qSN9PQ8-X6wINqBF1GjGxusy', 'cover', 50, False),
        ('group', 'https://www.youtube.com/playlist?list=PLLjd981H8qSMGC4Nir0hD2Gj9n9PDUoHX', 'original', 30, False),
        ('group', 'https://www.youtube.com/@stellive_official/videos', 'original', 6, True),
        ('yuni', 'https://www.youtube.com/@ayatsunoyuni/videos', 'cover', 6, True),
        ('tabi', 'https://www.youtube.com/@arahashitabi/videos', 'cover', 6, True),
        ('lize', 'https://www.youtube.com/@akanelize/videos', 'cover', 6, True),
        ('hina', 'https://www.youtube.com/@shirayukihina/videos', 'cover', 6, True),
        ('mashiro', 'https://www.youtube.com/@neneko_mashiro/videos', 'cover', 6, True),
        ('rin', 'https://www.youtube.com/@aokumorin/videos', 'cover', 6, True),
        ('shibuki', 'https://www.youtube.com/@tenkoshibuki/videos', 'cover', 6, True),
        ('nana', 'https://www.youtube.com/@hanako_nana/videos', 'cover', 8, True),
        ('riko', 'https://www.youtube.com/@yuzuhariko/videos', 'cover', 8, True),
        ('toa', 'https://www.youtube.com/@ShizukiToa/videos', 'cover', 6, True),
        ('rang', 'https://www.youtube.com/@coganerang/videos', 'cover', 6, True),
        ('hiyori', 'https://www.youtube.com/@HanayoHiyori/videos', 'cover', 6, True),
        ('mary', 'https://www.youtube.com/@TokinoMaryChannel/videos', 'cover', 6, True),
    ]

    for default_member, url, default_type, limit, is_channel in sources:
        ydl_opts = {
            'extract_flat': True,
            'playlistend': limit,
            'quiet': True,
            'no_warnings': True,
            'socket_timeout': 5,
        }
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                entries = info.get('entries') or []
                for entry in entries:
                    vid = entry.get('id')
                    raw_title = entry.get('title', '')
                    dur = entry.get('duration') or 0
                    BANNED_NON_SONG_IDS = {
                        'W5KthC3ZWsE', 'F1Z0uUObYao', 'GEkkL_4cCFU', 'gGZtkYpZ65U',
                        'I39TsTSla7c', 'AX1XyaDMwmQ', 'qz29KlB8Qx0', 'zISpAiwawVM',
                        'iQ9062YZRio', 'KzwlPuoVopE', '-5uKjMUnlqY', '9uXMUAbIoVo',
                        'sN5e9ftbVvY', '6NDV1oky-Ng', '9AQ3o2CgqtI', 'XAPaEXF7wwY',
                        'YtqUA52ZT2c', '8IAD5m1M8p0', 'EHhxKoWhKIk', '4C6GJvqG1gk',
                        'lpukv7wjy6o'
                    }
                    if not vid or vid in seen_ids or vid in BANNED_NON_SONG_IDS:
                        continue
                    title_lower = raw_title.lower()
                    if '[private video]' in title_lower or '[deleted video]' in title_lower:
                        continue
                    if '#shorts' in title_lower or 'shorts' in title_lower or '#' in raw_title or (dur > 0 and dur < 50):
                        continue
                    if any(k in title_lower for k in [
                        'hot clip', 'hotclip', 'hot-clip', 'stellar hot', 'stella hot', 'stellive hot',
                        '핫클립', '[클립]', '(클립)', 'clip]', '[clip',
                        '다시보기', '풀영상', '풀버전', '잡담', '공지사항', '공지', '안내', '주년', '기념 방송', '기념방송',
                        '신규 의상', '신의상', '수영복', '여름 휴가', '여름휴가', '의상 공개',
                        '비하인드', 'behind', 'q&a', 'qna', 'vlog', '브이로그', 'asmr', '라디오', '전야제', '콘서트',
                        '티저', 'teaser', 'trailer', '트레일러', 'bongnudo', '썰', '멋봉리', '봉누도',
                        '컨텐츠', '대결', '생일 3d', '기념 3d', '엉덩이', '토크', '게임'
                    ]):
                        continue
                    if vid != '6mVByQMyxdY' and any(k in title_lower for k in [
                        '메들리', 'medley', '모음', '모음집', '플레이리스트', 'playlist', '작업용', 'bgm', '모음곡', '연속재생'
                    ]):
                        continue
                    if is_channel and not re.search(r'cover|mv|original|official|커버|노래|sing|music|feat|3d\s*(?:cover|live\s*cover|live\s*mv)|ost|불러보았다|우탓테미타|歌ってみた|うたってみた|utattemita', title_lower):
                        continue
                    if dur > 420 and vid not in ('DMk4_4Xytz4', '6mVByQMyxdY'):
                        continue

                    seen_ids.add(vid)
                    c_title = clean_title(raw_title, raw_title)
                    is_ost = bool(ost_regex.search(f"{raw_title} {c_title}"))
                    final_type = 'ost' if is_ost else default_type

                    u_date = entry.get('upload_date')
                    pub_date = f"{u_date[:4]}-{u_date[4:6]}-{u_date[6:]}" if u_date and len(u_date) == 8 else None

                    track_item = {
                        'id': vid,
                        'title': c_title or raw_title,
                        'rawTitle': raw_title,
                        'duration': dur,
                        'uploader': entry.get('uploader') or (default_member if default_member != 'group' else ''),
                        'defaultMember': default_member,
                        'defaultType': final_type
                    }
                    if pub_date:
                        track_item['publishedAt'] = pub_date
                    tracks.append(track_item)
        except Exception as e:
            print(f"[Sync Network Error] {url}: {e}", flush=True)

    return tracks

class StellPlayHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # 스트리밍 청크 요청 시 콘솔 도배 방지 (에러만 출력)
        if len(args) > 1 and str(args[1]).startswith(('4', '5')):
            super().log_message(format, *args)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        origin = self.headers.get('Origin', '') if hasattr(self, 'headers') and self.headers else ''
        if origin:
            parsed = urllib.parse.urlparse(origin)
            hostname = (parsed.hostname or '').lower()
            if hostname in ('localhost', '127.0.0.1'):
                self.send_header('Access-Control-Allow-Origin', origin)
                self.send_header('Vary', 'Origin')
        else:
            self.send_header('Access-Control-Allow-Origin', 'http://127.0.0.1:8888')
        self.send_header('Access-Control-Allow-Headers', 'Range, Origin, Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def _get_user_data_file(self):
        appdata = os.environ.get('APPDATA')
        target_dir = os.path.join(appdata, 'StellPlay') if appdata else DIRECTORY
        os.makedirs(target_dir, exist_ok=True)
        return os.path.join(target_dir, 'user_data.json')

    def do_POST(self):
        # 외부 사이트에서의 불법 CSRF 요청 차단
        origin = self.headers.get('Origin', '') if hasattr(self, 'headers') and self.headers else ''
        if origin:
            parsed_origin = urllib.parse.urlparse(origin)
            if (parsed_origin.hostname or '').lower() not in ('localhost', '127.0.0.1'):
                self.send_error(403, "Forbidden origin")
                return
        sec_fetch_site = self.headers.get('Sec-Fetch-Site', '') if hasattr(self, 'headers') and self.headers else ''
        if sec_fetch_site == 'cross-site':
            self.send_error(403, "Cross-site requests forbidden")
            return

        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/user-data':
            try:
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length)
                data = json.loads(body.decode('utf-8'))
                file_path = self._get_user_data_file()
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                payload = json.dumps({'success': True}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
            except Exception as e:
                try:
                    self.send_error(500, f"Failed to save user data: {e}")
                except Exception:
                    pass
            return
        self.send_error(404, "Not Found")

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        # 1. 무광고 오디오 스트리밍 API (/api/audio?id=...)
        if parsed.path == '/api/audio':
            qs = urllib.parse.parse_qs(parsed.query)
            vid = qs.get('id', [None])[0]
            if not vid or not re.match(r'^[a-zA-Z0-9_-]{11}$', str(vid).strip()):
                self.send_error(400, "Invalid or missing 'id' parameter (must be 11-char YouTube ID)")
                return

            info = get_audio_stream_info(str(vid).strip())
            if not info or not info.get('url'):
                self.send_error(502, f"Could not extract audio stream for ID: {vid}")
                return

            req_headers = dict(info.get('http_headers', {}))
            client_range = self.headers.get('Range')
            if client_range:
                req_headers['Range'] = client_range
            else:
                req_headers['Range'] = 'bytes=0-'

            req = urllib.request.Request(info['url'], headers=req_headers)
            try:
                with urllib.request.urlopen(req, timeout=12) as resp:
                    self.send_response(resp.status)
                    for k in ['Content-Type', 'Content-Length', 'Content-Range', 'Accept-Ranges']:
                        v = resp.headers.get(k)
                        if v:
                            self.send_header(k, v)
                    self.end_headers()

                    while True:
                        chunk = resp.read(65536)
                        if not chunk:
                            break
                        try:
                            self.wfile.write(chunk)
                        except (BrokenPipeError, ConnectionResetError):
                            break
            except Exception as e:
                try:
                    self.send_error(502, f"Stream proxy error: {e}")
                except Exception:
                    pass
            return

        # 2. 유튜브 커버곡/영상 메타데이터 자동 파싱 API (/api/info?url=...)
        elif parsed.path == '/api/info':
            qs = urllib.parse.parse_qs(parsed.query)
            target_url = qs.get('url', [None])[0]
            if not target_url:
                self.send_error(400, "Missing 'url' parameter")
                return

            info = fetch_youtube_video_info(target_url)
            if not info:
                self.send_error(400, "Invalid or unsupported YouTube URL/ID")
                return

            payload = json.dumps(info, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        # 3. 최신 신곡 자동 동기화 탐색 API (/api/sync-new-songs)
        elif parsed.path == '/api/sync-new-songs':
            tracks = fetch_latest_official_tracks()
            payload = json.dumps({'success': True, 'tracks': tracks}, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        # 4. 사용자 데이터 및 플레이리스트 백업 로드 API (/api/user-data)
        elif parsed.path == '/api/user-data':
            file_path = self._get_user_data_file()
            if os.path.exists(file_path):
                try:
                    with open(file_path, 'rb') as f:
                        payload = f.read()
                except Exception:
                    payload = b'{}'
            else:
                payload = b'{}'
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        # 5. PC 클라이언트 실시간 버전 업데이트 / 패치노트 / 버전 복원 API
        elif parsed.path == '/api/pc-update/info':
            res = get_pc_ota_info()
            payload = json.dumps(res, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        elif parsed.path == '/api/pc-update/check':
            res = check_and_apply_pc_update()
            payload = json.dumps(res, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        elif parsed.path == '/api/pc-update/rollback':
            res = rollback_pc_ota_previous()
            payload = json.dumps(res, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        elif parsed.path == '/api/pc-update/restore':
            qs = urllib.parse.parse_qs(parsed.query)
            target_v = qs.get('version', [None])[0]
            res = restore_pc_ota_version(target_v)
            payload = json.dumps(res, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        elif parsed.path == '/api/pc-update/patchnotes':
            text = get_pc_patchnotes()
            payload = json.dumps({'success': True, 'text': text}, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        # 6. 정적 웹 파일 서빙 (HTML, CSS, JS 등)
        super().do_GET()

# ===================================================================
# PC 클라이언트 OTA 실시간 업데이트, 패치노트 및 다중 버전 복원 엔진
# ===================================================================
PC_OTA_BACKUPS_DIR = os.path.join(DIRECTORY, "pc_ota_backups")
PC_OTA_STATE_FILE = os.path.join(DIRECTORY, "pc_ota_state.json")
PC_OTA_PRIMARY_BASE = "https://raw.githubusercontent.com/boodlei/stellplay-web/main/"
PC_OTA_FALLBACK_BASE = "https://boodlei.github.io/stellplay-web/"
PC_TRACKED_FILES = [
    "index.html",
    "assets/css/style.css",
    "assets/js/songs.js",
    "assets/js/storage.js",
    "assets/js/player.js",
    "assets/js/app.js",
    "songs-latest.json",
    "patchnotes_pc.txt",
    "patchnotes_web.txt",
    "patchnotes_android.txt",
    "version.json"
]
PC_ALLOWED_EXTS = {'.html', '.css', '.js', '.json', '.txt', '.png', '.jpg', '.svg', '.ico'}

def _read_local_version_json():
    for candidate in [
        os.path.join(DIRECTORY, "version.json"),
        os.path.join(DIRECTORY, "mobile", "version.json")
    ]:
        if os.path.exists(candidate):
            try:
                with open(candidate, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
    return {"apkVersionName": "1.11.3", "otaVersion": 2026102302, "otaReleaseDate": "2026-10-23"}

def _read_pc_ota_state():
    v_obj = _read_local_version_json()
    default_ver = int(v_obj.get("otaVersion", 2026102302))
    default_name = v_obj.get("apkVersionName", "1.11.3")
    if os.path.exists(PC_OTA_STATE_FILE):
        try:
            with open(PC_OTA_STATE_FILE, "r", encoding="utf-8") as f:
                st = json.load(f)
                if "currentVersion" not in st:
                    st["currentVersion"] = default_ver
                if "bundledVersion" not in st:
                    st["bundledVersion"] = default_ver
                if "versionName" not in st:
                    st["versionName"] = default_name
                if "backupVersions" not in st or not isinstance(st["backupVersions"], list):
                    st["backupVersions"] = []
                return st
        except Exception:
            pass
    return {
        "currentVersion": default_ver,
        "bundledVersion": default_ver,
        "versionName": default_name,
        "otaReleaseDate": v_obj.get("otaReleaseDate", "2026-10-23"),
        "backupVersions": []
    }

def _write_pc_ota_state(st):
    try:
        with open(PC_OTA_STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(st, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[PC OTA] State write error: {e}", flush=True)

def save_pc_backup_snapshot(version_num):
    try:
        version_num = int(version_num)
        os.makedirs(PC_OTA_BACKUPS_DIR, exist_ok=True)
        snap_dir = os.path.join(PC_OTA_BACKUPS_DIR, str(version_num))
        os.makedirs(snap_dir, exist_ok=True)
        copied = 0
        for rel in PC_TRACKED_FILES:
            src = os.path.join(DIRECTORY, rel.replace("/", os.sep))
            if not os.path.exists(src) and rel == "version.json":
                alt = os.path.join(DIRECTORY, "mobile", "version.json")
                if os.path.exists(alt):
                    src = alt
            if os.path.exists(src) and os.path.isfile(src):
                dst = os.path.join(snap_dir, rel.replace("/", os.sep))
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                shutil.copy2(src, dst)
                copied += 1
        if copied > 0:
            st = _read_pc_ota_state()
            b_list = [int(x) for x in st.get("backupVersions", []) if str(x).isdigit()]
            if version_num in b_list:
                b_list.remove(version_num)
            b_list.insert(0, version_num)
            st["backupVersions"] = b_list[:10]
            _write_pc_ota_state(st)
            return True
    except Exception as e:
        print(f"[PC OTA] Snapshot error ({version_num}): {e}", flush=True)
    return False

def get_pc_ota_info():
    v_obj = _read_local_version_json()
    st = _read_pc_ota_state()
    cur_ver = int(st.get("currentVersion", v_obj.get("otaVersion", 2026102302)))
    bundled_ver = int(st.get("bundledVersion", cur_ver))
    ver_name = st.get("versionName") or v_obj.get("apkVersionName", "1.11.3")
    rel_date = st.get("otaReleaseDate") or v_obj.get("otaReleaseDate", "2026-10-23")

    # 초기 번들 스냅샷 자동 보존 (언제든 설치 초기 상태로 복원 가능하도록 보장)
    bundled_dir = os.path.join(PC_OTA_BACKUPS_DIR, str(bundled_ver))
    if not os.path.exists(bundled_dir):
        save_pc_backup_snapshot(bundled_ver)
        st = _read_pc_ota_state()

    history = [{
        "version": cur_ver,
        "label": f"현재 적용 버전 (#{cur_ver})",
        "isCurrent": True,
        "type": "bundled" if cur_ver == bundled_ver else "live"
    }]

    prev_ver = -1
    b_list = [int(x) for x in st.get("backupVersions", []) if str(x).isdigit()]
    for v in b_list:
        if v == cur_ver:
            continue
        b_dir = os.path.join(PC_OTA_BACKUPS_DIR, str(v))
        if os.path.exists(b_dir) and os.path.isdir(b_dir):
            if prev_ver == -1:
                prev_ver = v
            history.append({
                "version": v,
                "label": f"설치 시 기본 번들 (#{v})" if v == bundled_ver else f"이전 패치 백업 (#{v})",
                "isCurrent": False,
                "type": "bundled" if v == bundled_ver else "backup"
            })

    if cur_ver != bundled_ver and not any(h["version"] == bundled_ver for h in history):
        if os.path.exists(bundled_dir):
            if prev_ver == -1:
                prev_ver = bundled_ver
            history.append({
                "version": bundled_ver,
                "label": f"설치 시 기본 번들 (#{bundled_ver})",
                "isCurrent": False,
                "type": "bundled"
            })

    return {
        "success": True,
        "versionName": ver_name,
        "currentVersion": cur_ver,
        "bundledVersion": bundled_ver,
        "otaReleaseDate": rel_date,
        "hasPrevious": prev_ver > 0,
        "previousVersion": prev_ver,
        "history": history
    }

def _fetch_remote_bytes(rel_path):
    ts = int(time.time() * 1000)
    for base in (PC_OTA_PRIMARY_BASE, PC_OTA_FALLBACK_BASE):
        url = f"{base}{rel_path}?t={ts}"
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme != "https" or parsed.hostname not in ("raw.githubusercontent.com", "boodlei.github.io", "github.com"):
            continue
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "StellPlay-PC-Updater/1.0", "Cache-Control": "no-cache"})
            with urllib.request.urlopen(req, timeout=8) as resp:
                if resp.status == 200:
                    return resp.read()
        except Exception:
            continue
    return None

def check_and_apply_pc_update():
    try:
        raw_ver = _fetch_remote_bytes("version.json")
        if not raw_ver:
            return {"status": "error", "message": "원격 업데이트 서버(GitHub)에 연결할 수 없습니다."}
        remote_obj = json.loads(raw_ver.decode("utf-8"))
        remote_ota = int(remote_obj.get("otaVersion", 0))
        remote_name = remote_obj.get("apkVersionName", "1.11.3")
        remote_date = remote_obj.get("otaReleaseDate", "")
        remote_changelog = remote_obj.get("apkChangelog", "")
        pc_hashes = remote_obj.get("pcFileHashes") or {}

        info = get_pc_ota_info()
        cur_ver = int(info.get("currentVersion", 0))

        if remote_ota <= cur_ver:
            return {
                "status": "up_to_date",
                "message": "현재 최신 버전입니다.",
                "currentVersion": cur_ver,
                "remoteVersion": remote_ota,
                "versionName": remote_name,
                "otaDate": remote_date
            }

        # 현재 상태 스냅샷 백업
        save_pc_backup_snapshot(cur_ver)

        temp_dir = os.path.join(DIRECTORY, "pc_ota_temp")
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)
        os.makedirs(temp_dir, exist_ok=True)

        files_to_sync = remote_obj.get("pcFiles") or [
            "index.html",
            "assets/css/style.css",
            "assets/js/songs.js",
            "assets/js/storage.js",
            "assets/js/player.js",
            "assets/js/app.js",
            "songs-latest.json",
            "patchnotes_pc.txt",
            "patchnotes_web.txt",
            "version.json"
        ]

        downloaded_count = 0
        for rel in files_to_sync:
            if not rel or ".." in rel or rel.startswith("/") or rel.startswith("\\") or ":" in rel:
                shutil.rmtree(temp_dir, ignore_errors=True)
                return {"status": "error", "message": f"보안 정책 위반 경로 차단: {rel}"}
            ext = os.path.splitext(rel)[1].lower()
            if ext not in PC_ALLOWED_EXTS:
                shutil.rmtree(temp_dir, ignore_errors=True)
                return {"status": "error", "message": f"허용되지 않은 파일 확장자 차단: {rel}"}

            data = _fetch_remote_bytes(rel)
            if not data:
                if rel in ("patchnotes_pc.txt", "patchnotes_web.txt", "version.json"):
                    continue
                shutil.rmtree(temp_dir, ignore_errors=True)
                return {"status": "error", "message": f"업데이트 파일 다운로드 실패: {rel}"}

            if rel in pc_hashes and pc_hashes[rel]:
                actual_hash = hashlib.sha256(data).hexdigest().lower()
                expected_hash = str(pc_hashes[rel]).strip().lower()
                if actual_hash != expected_hash:
                    shutil.rmtree(temp_dir, ignore_errors=True)
                    return {"status": "error", "message": f"SHA-256 무결성 검증 실패 ({rel})"}

            dst = os.path.join(temp_dir, rel.replace("/", os.sep))
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            with open(dst, "wb") as f:
                f.write(data)
            downloaded_count += 1

        # 원자적 복사 적용
        for root, _, files in os.walk(temp_dir):
            for file in files:
                src_f = os.path.join(root, file)
                rel_f = os.path.relpath(src_f, temp_dir)
                dst_f = os.path.join(DIRECTORY, rel_f)
                os.makedirs(os.path.dirname(dst_f), exist_ok=True)
                shutil.copy2(src_f, dst_f)

        shutil.rmtree(temp_dir, ignore_errors=True)

        st = _read_pc_ota_state()
        st["currentVersion"] = remote_ota
        st["versionName"] = remote_name
        st["otaReleaseDate"] = remote_date
        _write_pc_ota_state(st)
        save_pc_backup_snapshot(remote_ota)

        return {
            "status": "applied",
            "message": f"최신 패치 (#{remote_ota})가 성공적으로 적용되었습니다!",
            "otaVersion": remote_ota,
            "versionName": remote_name,
            "otaDate": remote_date,
            "filesCount": downloaded_count,
            "changelog": remote_changelog
        }
    except Exception as e:
        return {"status": "error", "message": f"업데이트 처리 중 오류 발생: {e}"}

def restore_pc_ota_version(target_ver):
    try:
        if not target_ver:
            return {"success": False, "message": "복원할 버전이 지정되지 않았습니다."}
        target_ver = int(target_ver)
        target_dir = os.path.join(PC_OTA_BACKUPS_DIR, str(target_ver))
        if not os.path.exists(target_dir) or not os.path.isdir(target_dir):
            return {"success": False, "message": f"선택한 버전 (#{target_ver}) 백업을 찾을 수 없습니다."}

        st = _read_pc_ota_state()
        cur_ver = int(st.get("currentVersion", 0))
        if cur_ver > 0 and cur_ver != target_ver:
            save_pc_backup_snapshot(cur_ver)

        for root, _, files in os.walk(target_dir):
            for file in files:
                src_f = os.path.join(root, file)
                rel_f = os.path.relpath(src_f, target_dir)
                dst_f = os.path.join(DIRECTORY, rel_f)
                os.makedirs(os.path.dirname(dst_f), exist_ok=True)
                shutil.copy2(src_f, dst_f)

        st = _read_pc_ota_state()
        st["currentVersion"] = target_ver
        _write_pc_ota_state(st)
        return {
            "success": True,
            "restoredVersion": target_ver,
            "message": f"버전 #{target_ver} 상태로 성공적으로 복원되었습니다."
        }
    except Exception as e:
        return {"success": False, "message": f"버전 복원 실패: {e}"}

def rollback_pc_ota_previous():
    info = get_pc_ota_info()
    if info.get("hasPrevious") and info.get("previousVersion", -1) > 0:
        return restore_pc_ota_version(info["previousVersion"])
    return {"success": False, "message": "복원 가능한 직전 버전 기록이 없습니다."}

def get_pc_patchnotes():
    for fname in ("patchnotes_pc.txt", "patchnotes_web.txt", "patchnotes_android.txt", "1.txt"):
        fpath = os.path.join(DIRECTORY, fname)
        if os.path.exists(fpath) and os.path.isfile(fpath):
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    return f.read()
            except Exception:
                pass
    return "패치노트 정보를 불러올 수 없습니다."

class ThreadingHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

def run_server():
    os.chdir(DIRECTORY)

    for p in range(PORT, PORT + 20):
        try:
            with ThreadingHTTPServer(("127.0.0.1", p), StellPlayHandler) as httpd:
                url = f"http://localhost:{p}"
                print("=" * 60, flush=True)
                print(" ⭐ [StellPlay] Stellive Zero-Ad Music Server", flush=True)
                print("=" * 60, flush=True)
                print(f" URL: {url}", flush=True)
                print(" Zero-Ad Audio Engine: ENABLED (yt-dlp)", flush=True)
                print(" Press Ctrl + C in this terminal to stop.", flush=True)
                print("=" * 60, flush=True)

                try:
                    webbrowser.open(url)
                except Exception:
                    pass

                httpd.serve_forever()
                break
        except OSError:
            continue

if __name__ == '__main__':
    try:
        run_server()
    except KeyboardInterrupt:
        print("\nStellPlay server stopped.", flush=True)
        sys.exit(0)
