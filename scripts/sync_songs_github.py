#!/usr/bin/env python3
"""
StellPlay - GitHub Actions용 스텔라이브 공식 신곡 동기화 스크립트
- 스텔라이브 공식 재생목록(커버곡 & 오리지널곡)에서 최신 곡 목록 조회
- songs-latest.json 갱신 및 배포
"""

import sys
import os
import re
import json
import time
from datetime import datetime, timezone

# 콘솔 UTF-8 설정
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

try:
    import yt_dlp
    HAS_YTDLP = True
except ImportError:
    HAS_YTDLP = False
    print("yt-dlp is not installed. Please run: pip install yt-dlp", file=sys.stderr)
    sys.exit(1)

# 스텔라이브 공식 큐레이션 재생목록 및 10인 멤버 채널
OFFICIAL_SOURCES = [
    {
        'category': 'cover',
        'defaultMember': 'group',
        'url': 'https://www.youtube.com/playlist?list=PLLjd981H8qSN9PQ8-X6wINqBF1GjGxusy',
        'limit': 50,
        'isChannel': False
    },
    {
        'category': 'original',
        'defaultMember': 'group',
        'url': 'https://www.youtube.com/playlist?list=PLLjd981H8qSMGC4Nir0hD2Gj9n9PDUoHX',
        'limit': 30,
        'isChannel': False
    },
    # 스텔라이브 공식 채널
    {'category': 'original', 'defaultMember': 'group', 'url': 'https://www.youtube.com/@stellive_official/videos', 'limit': 6, 'isChannel': True},
    # 1기 미스틱
    {'category': 'cover', 'defaultMember': 'yuni', 'url': 'https://www.youtube.com/@ayatsunoyuni/videos', 'limit': 6, 'isChannel': True},
    {'category': 'cover', 'defaultMember': 'tabi', 'url': 'https://www.youtube.com/@arahashitabi/videos', 'limit': 6, 'isChannel': True},
    # 2기 유니버스
    {'category': 'cover', 'defaultMember': 'lize', 'url': 'https://www.youtube.com/@akanelize/videos', 'limit': 6, 'isChannel': True},
    {'category': 'cover', 'defaultMember': 'hina', 'url': 'https://www.youtube.com/@shirayukihina/videos', 'limit': 6, 'isChannel': True},
    {'category': 'cover', 'defaultMember': 'mashiro', 'url': 'https://www.youtube.com/@neneko_mashiro/videos', 'limit': 6, 'isChannel': True},
    # 3기 클리셰
    {'category': 'cover', 'defaultMember': 'rin', 'url': 'https://www.youtube.com/@aokumorin/videos', 'limit': 6, 'isChannel': True},
    {'category': 'cover', 'defaultMember': 'shibuki', 'url': 'https://www.youtube.com/@tenkoshibuki/videos', 'limit': 6, 'isChannel': True},
    {'category': 'cover', 'defaultMember': 'nana', 'url': 'https://www.youtube.com/@hanako_nana/videos', 'limit': 8, 'isChannel': True},
    {'category': 'cover', 'defaultMember': 'riko', 'url': 'https://www.youtube.com/@yuzuhariko/videos', 'limit': 8, 'isChannel': True},
    # 4기 어비스
    {'category': 'cover', 'defaultMember': 'toa', 'url': 'https://www.youtube.com/@ShizukiToa/videos', 'limit': 6, 'isChannel': True},
    {'category': 'cover', 'defaultMember': 'rang', 'url': 'https://www.youtube.com/@coganerang/videos', 'limit': 6, 'isChannel': True},
    {'category': 'cover', 'defaultMember': 'hiyori', 'url': 'https://www.youtube.com/@HanayoHiyori/videos', 'limit': 6, 'isChannel': True},
    {'category': 'cover', 'defaultMember': 'mary', 'url': 'https://www.youtube.com/@TokinoMaryChannel/videos', 'limit': 6, 'isChannel': True},
]

# 멤버 판별 키워드
MEMBER_KEYWORDS = {
    'yuni': ['유니', 'yuni', '아야츠노', '아야츠노 유니', 'ayatsuno'],
    'huya': ['후야', 'huya', '사키하네', '사키하네 후야', 'sakihane'],
    'kanna': ['칸나', 'kanna', '아이리', '아이리 칸나', 'airi'],
    'hina': ['히나', 'hina', '시라유키', '시라유키 히나', 'shirayuki'],
    'lize': ['리제', 'lize', '아카네', '아카네 리제', 'akane'],
    'tabi': ['타비', 'tabi', '아라하시', '아라하시 타비', 'arahashi'],
    'mashiro': ['마시로', 'mashiro', '네네코', '네네코 마시로', 'neneko'],
    'rin': ['린', 'rin', '아오쿠모', '아오쿠모 린', 'aokumo'],
    'nana': ['나나', 'nana', '하나코', '하나코 나나', 'hanako'],
    'chloe': ['클로에', 'chloe', '하나히라', '하나히라 클로에', 'hanahira'],
    'kura': ['쿠라', 'kura', '유리르', '유리르 쿠라', 'yurir'],
    'riko': ['리코', 'riko', '유즈하', '유즈하 리코', 'yuzuha'],
    'shibuki': ['시부키', 'shibuki', '텐코', '텐코 시부키', 'tenko'],
    'raden': ['라덴', 'raden', '하쿠', 'haku'],
    'toa': ['토아', 'toa', '시즈키', '시즈키 토아', 'shizuki'],
    'rang': ['랑', 'rang', '코가네', '코가네 랑', 'cogane'],
    'hiyori': ['히요리', 'hiyori', '하나요', '하나요 히요리', 'hanayo'],
    'mary': ['메리', 'mary', '토키노', '토키노 메리', 'tokino']
}

JAPANESE_SONG_MAP = {
    '타상연화': ('打上花火', '쏘아올린 불꽃'),
    '제육감': ('第六感', '제육감'),
    'sixth sense': ('第六感', '제육감'),
    '第六感': ('第六感', '제육감'),
    '유령이 되고싶어': ('ゆうれいになりたい', '유령이 되고싶어'),
    'ゆうれいになりたい': ('ゆうれいになりたい', '유령이 되고싶어'),
    '도쿄 테디베어': ('東京テディベア', '도쿄 테디베어'),
    '東京テディ베어': ('東京テディベア', '도쿄 테디베어'),
    '東京テディベア': ('東京テディベア', '도쿄 테디베어'),
    'tokyo teddy bear': ('東京テディベア', '도쿄 테디베어'),
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
    '쏘아올린 불꽃': ('打上花火', '쏘아올린 불꽃'),
    '打上花火': ('打上花火', '쏘아올린 불꽃'),
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
        return '打上花火 (쏘아올린 불꽃)'

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

def detect_members(text):
    text_lower = text.lower()
    detected = []
    for member_id, keywords in MEMBER_KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in text_lower:
                detected.append(member_id)
                break
    return detected

def fetch_tracks():
    import re
    tracks = []
    seen_ids = set()

    for item in OFFICIAL_SOURCES:
        url = item['url']
        category = item['category']
        default_member = item['defaultMember']
        limit = item.get('limit', 20)
        is_channel = item.get('isChannel', False)

        ydl_opts = {
            'extract_flat': True,
            'playlistend': limit,
            'quiet': True,
            'no_warnings': True,
        }

        print(f"Fetching {category} source: {url}")
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                entries = info.get('entries') or []
                for entry in entries:
                    vid = entry.get('id')
                    raw_title = entry.get('title', '')
                    dur = entry.get('duration') or 0
                    uploader = entry.get('uploader') or ''

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
                        '다시보기', '풀영상', '풀버전', '잡담', '공지사항', '공지', '클립', 'bongnudo', 'q&a', '썰', '멋봉리', '봉누도',
                        '컨텐츠', '대결', '생일 3d', '기념 3d', '엉덩이', '토크', '게임', 'vlog', '브이로그', 'asmr', '라디오'
                    ]):
                        continue
                    if vid != '6mVByQMyxdY' and any(k in title_lower for k in [
                        '메들리', 'medley', '모음', '모음집', '플레이리스트', 'playlist', '작업용', 'bgm', '모음곡', '연속재생'
                    ]):
                        continue
                    if is_channel and not re.search(r'cover|mv|original|official|커버|노래|sing|music|feat|3d\s*(?:cover|live\s*cover|live\s*mv)|ost', title_lower):
                        continue
                    if dur > 420 and vid not in ('DMk4_4Xytz4', '6mVByQMyxdY'):
                        continue

                    seen_ids.add(vid)
                    c_title = clean_title(raw_title, raw_title)
                    members = detect_members(f"{raw_title} {uploader}")
                    if not members:
                        members = [default_member]

                    is_ost = bool(re.search(r'(?<![a-zA-Z])(?:OST|O\.S\.T)(?![a-zA-Z])', f"{raw_title} {c_title}", re.IGNORECASE))
                    final_type = 'ost' if is_ost else category

                    tracks.append({
                        'id': vid,
                        'title': c_title or raw_title,
                        'rawTitle': raw_title,
                        'duration': int(dur) if dur else 200,
                        'uploader': uploader,
                        'defaultMember': members[0] if len(members) == 1 else 'group',
                        'members': members,
                        'defaultType': final_type
                    })
        except Exception as e:
            print(f"Error fetching {url}: {e}", file=sys.stderr)

    return tracks

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_path = os.path.join(root_dir, 'songs-latest.json')

    print(f"Target file: {output_path}")
    tracks = fetch_tracks()
    print(f"Fetched total {len(tracks)} tracks.")

    canonical_titles = {
        'LmOl01G4DR4': '打上花火 (쏘아올린 불꽃)',
        'EKEts5IShas': '별이 시작되는 곳',
        'MZNKiadMo3U': '第六感 (제육감)',
        'iAoU1UGPoXc': '호랑풍류가 (나와 호랑이님 OST)',
        'ouKcRBeyKbk': 'ゆうれいになりたい (유령이 되고싶어)',
        'rKQptWhAvO0': '東京テディベア (도쿄 테디베어)',
        'JLM7z8afU4s': 'ア・プリオリ (아 프리오리)',
        'kNzGpNEdBqw': 'オーバーライド (오버라이드)',
        'Qi_JLmXBFFo': '不可幸力 (불가행력)',
        'Qngf5HNfl6Q': '少女レイ (소녀레이)',
        'FzefgoF26Ac': '여우의 별자리 (명조:워더링 웨이브 OST)',
        'F7kdEX0VRss': 'Dance The Night Away',
        'y-rdBQSrzSs': 'Dynamite',
        'qv_VVUJOt0M': '까탈레나',
        'npwilOOckxY': '100% for You',
        '-RrbCkl3YJo': 'メルト (멜트)',
        'LxqwR1KE81o': 'アカシア (아카시아)',
        'KmH0RhhenzE': 'deja vu',
        'blFr5w6o2jQ': '아이와 나의 바다',
        'Zetk77I6_s8': 'おつかれsummer (수고했어 summer)',
        'uBtFoUXR9Qc': '千鳥 (물떼새)',
        'zQp6ZZAT6ew': 'もしもし？ (모시모시?)',
        'yuxa6o1_scc': 'ライラック (라일락)',
        'ekINzN4PQmo': '아틀란티스 소녀',
        'fXoGiuE6e-I': 'Loop in June (명조:워더링 웨이브 OST)',
        'bmFg-paLaMI': 'ブレインロット (브레인 롯)',
    }
    top_order = ['LmOl01G4DR4', 'EKEts5IShas', 'rKQptWhAvO0', 'ouKcRBeyKbk', 'iAoU1UGPoXc', 'MZNKiadMo3U']

    for t in tracks:
        tid = t.get('id')
        if tid in canonical_titles:
            t['title'] = canonical_titles[tid]
        if tid in top_order:
            if tid == 'LmOl01G4DR4':
                t['members'] = ['hina', 'rin']
                t['defaultMember'] = 'hina'
                t['defaultType'] = 'cover'
                t['publishedAt'] = '2026-10-21'
            elif tid == 'EKEts5IShas':
                t['members'] = ['toa', 'rang', 'hiyori', 'mary']
                t['defaultMember'] = 'group'
                t['defaultType'] = 'original'
                t['publishedAt'] = '2026-10-20'
            elif tid == 'rKQptWhAvO0':
                t['members'] = ['mary']
                t['defaultMember'] = 'mary'
                t['defaultType'] = 'cover'
                t['publishedAt'] = '2026-10-16'
            elif tid == 'ouKcRBeyKbk':
                t['members'] = ['hiyori']
                t['defaultMember'] = 'hiyori'
                t['defaultType'] = 'cover'
                t['publishedAt'] = '2026-10-16'
            elif tid == 'iAoU1UGPoXc':
                t['members'] = ['rang']
                t['defaultMember'] = 'rang'
                t['defaultType'] = 'cover'
                t['publishedAt'] = '2026-10-16'
            elif tid == 'MZNKiadMo3U':
                t['members'] = ['toa']
                t['defaultMember'] = 'toa'
                t['defaultType'] = 'cover'
                t['publishedAt'] = '2026-10-16'

    top_map = {t['id']: t for t in tracks if t.get('id') in top_order}
    others = [t for t in tracks if t.get('id') not in top_order]
    tracks = [top_map[tid] for tid in top_order if tid in top_map] + others

    payload = {
        'success': True,
        'count': len(tracks),
        'updatedAt': datetime.now(timezone.utc).isoformat(),
        'tracks': tracks
    }

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    mobile_output_path = os.path.join(root_dir, 'mobile', 'songs-latest.json')
    with open(mobile_output_path, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"Successfully generated {output_path} and {mobile_output_path} with {len(tracks)} tracks.")

if __name__ == '__main__':
    main()
