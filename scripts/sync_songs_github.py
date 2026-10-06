#!/usr/bin/env python3
"""
StellPlay - GitHub Actions용 스텔라이브 공식 신곡 동기화 스크립트
- 스텔라이브 공식 재생목록(커버곡 & 오리지널곡)에서 최신 곡 목록 조회
- songs-latest.json 갱신 및 배포
"""

import sys
import os
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
    'raden': ['라덴', 'raden', '하쿠', 'haku']
}

def clean_title(title):
    if not title:
        return ""
    import re
    t = title.strip()
    t = re.sub(r'\[\s*(?:4K|UHD|HD|MV|Live|Official)\s*\]', '', t, flags=re.IGNORECASE)
    t = re.sub(r'【\s*(?:4K|UHD|HD|MV|Live|Official)\s*】', '', t, flags=re.IGNORECASE)
    t = re.sub(r'\(\s*(?:4K|UHD|HD|MV|Live|Official)\s*\)', '', t, flags=re.IGNORECASE)
    t = re.sub(r'\s*Official\s*(?:Music\s*Video|Video|MV)\s*$', '', t, flags=re.IGNORECASE)
    t = re.sub(r'\s*(?:Music\s*Video|MV)\s*$', '', t, flags=re.IGNORECASE)
    t = re.sub(r'\s*[/\|ㅣ]\s*[^/\|ㅣ\n]*(?:3D\s*)?(?:Live\s*)?Cover\s*$', '', t, flags=re.IGNORECASE)
    t = re.sub(r'[\s\|ㅣ/]*[\[【\(]?(?:3D\s*)?(?:Live\s*)?Cover[\]】\)]?.*$', '', t, flags=re.IGNORECASE)
    t = re.sub(r'\s*\(Feat\.[^\)]+\)', '', t, flags=re.IGNORECASE)

    if '|' in t or 'ㅣ' in t:
        parts = [p.strip() for p in re.split(r'[\|ㅣ]', t) if p.strip()]
        if len(parts) >= 2:
            t = parts[0]

    t = re.sub(r'^[\'‘"“](.+)[\'’"”]$', r'\1', t).strip()
    t = re.sub(r'^[\|\-ㅣ/]\s*', '', t)
    t = re.sub(r'\s*[\|\-ㅣ/]$', '', t).strip()
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
                    c_title = clean_title(raw_title)
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
