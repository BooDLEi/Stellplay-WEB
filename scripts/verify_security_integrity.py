#!/usr/bin/env python3
"""
StellPlay - 보안 정책 및 코드 무결성 검증 도구 (Security & Integrity Verification)
- AI 코드 생성 및 깃허브 배포 환경에서의 악성코드 주입/오염 방어 체계 전수 점검
"""

import os
import sys
import json
import hashlib
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def run_security_audit():
    print("==================================================")
    print(" StellPlay Security & Code Integrity Audit")
    print("==================================================")
    all_passed = True

    # 1. OTA version.json 무결성 및 SHA-256 해시 검증
    print("\n[1] OTA 업데이트 매니페스트 (version.json) 검증:")
    vpath = os.path.join(BASE_DIR, 'mobile', 'version.json')
    if not os.path.exists(vpath):
        print("  [FAIL] mobile/version.json이 존재하지 않습니다.")
        all_passed = False
    else:
        with open(vpath, 'r', encoding='utf-8') as f:
            v_data = json.load(f)
        files = v_data.get('files', [])
        hashes = v_data.get('fileHashes', {})
        print(f"  - 등록된 배포 파일 수: {len(files)}개")
        print(f"  - SHA-256 해시 매핑 수: {len(hashes)}개")

        allowed_exts = {'.html', '.htm', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff2', '.woff', '.ttf', '.txt'}
        for rel in files:
            # 경로 조작 검사
            if '..' in rel or rel.startswith('/') or rel.startswith('\\'):
                print(f"  [FAIL] 경로 조작 위험 감지: {rel}")
                all_passed = False
            # 확장자 검사
            ext = os.path.splitext(rel)[1].lower()
            if ext not in allowed_exts:
                print(f"  [FAIL] 허용되지 않은 파일 확장자: {rel}")
                all_passed = False
            # SHA-256 검사
            full_path = os.path.join(BASE_DIR, 'mobile', rel)
            if not os.path.exists(full_path):
                print(f"  [FAIL] 배포 파일 누락: {rel}")
                all_passed = False
            elif rel in hashes:
                with open(full_path, 'rb') as fp:
                    actual = hashlib.sha256(fp.read()).hexdigest()
                expected = hashes[rel]
                if actual != expected:
                    print(f"  [FAIL] SHA-256 해시 불일치 (위변조 위험): {rel}")
                    all_passed = False
                else:
                    print(f"  [PASS] {rel} (SHA-256 일치: {actual[:12]}...)")
            else:
                print(f"  [WARN] SHA-256 해시 미등록: {rel}")
                all_passed = False

    # 2. 웹 콘텐츠 보안 정책 (CSP) 선언 여부 검사
    print("\n[2] 콘텐츠 보안 정책 (Content Security Policy) 검증:")
    for html_rel in ['mobile/index.html', 'index.html']:
        hpath = os.path.join(BASE_DIR, html_rel)
        if os.path.exists(hpath):
            with open(hpath, 'r', encoding='utf-8') as f:
                content = f.read()
            if 'Content-Security-Policy' in content:
                print(f"  [PASS] {html_rel}: CSP 메타 태그 적용 확인됨")
            else:
                print(f"  [FAIL] {html_rel}: CSP 메타 태그 누락")
                all_passed = False

    # 3. 음원 데이터베이스 (songs-latest.json) 살균 검증
    print("\n[3] 음원 데이터베이스 메타데이터 살균(Sanitization) 검증:")
    songs_path = os.path.join(BASE_DIR, 'songs-latest.json')
    if os.path.exists(songs_path):
        with open(songs_path, 'r', encoding='utf-8') as f:
            s_data = json.load(f)
        tracks = s_data.get('tracks', [])
        print(f"  - 점검 트랙 수: {len(tracks)}곡")
        malicious_found = False
        for t in tracks:
            vid = t.get('id', '')
            title = t.get('title', '')
            raw_title = t.get('rawTitle', '')
            uploader = t.get('uploader', '')

            # YouTube ID 정규식 점검
            if not re.match(r'^[a-zA-Z0-9_-]{11}$', vid):
                print(f"  [FAIL] 비정상 YouTube ID 감지: {vid}")
                malicious_found = True

            # HTML/스크립트 태그 삽입 점검
            for field_name, val in [('title', title), ('rawTitle', raw_title), ('uploader', uploader)]:
                if re.search(r'<[^>]*>', val):
                    print(f"  [FAIL] HTML 태그 주입 감지 [{field_name}]: {val}")
                    malicious_found = True
                if re.search(r'(?i)\[system(?:_message)?\]|<\/?system(?:_message)?>|<\/?user(?:_request)?>', val):
                    print(f"  [FAIL] AI 프롬프트 주입 감지 [{field_name}]: {val}")
                    malicious_found = True

        if not malicious_found:
            print("  [PASS] 모든 음원 메타데이터가 정상적이며 안전하게 살균되어 있습니다.")
        else:
            all_passed = False

    # 4. 안드로이드 UpdateManager 네이티브 보안 필터 검증
    print("\n[4] 안드로이드 UpdateManager 네이티브 보안 필터 검증:")
    mgr_path = os.path.join(BASE_DIR, 'android', 'app', 'src', 'main', 'java', 'com', 'stellplay', 'app', 'UpdateManager.java')
    if os.path.exists(mgr_path):
        with open(mgr_path, 'r', encoding='utf-8') as f:
            mgr_code = f.read()
        checks = [
            ('SHA-256 해시 검증 (computeFileSha256)', 'computeFileSha256' in mgr_code),
            ('확장자 화이트리스트 (ALLOWED_EXTENSIONS)', 'ALLOWED_EXTENSIONS' in mgr_code),
            ('경로 조작 차단 (Path Traversal check)', 'Blocked illegal path traversal' in mgr_code),
            ('APK 설치 URL 화이트리스트 (isWhitelistedApkUrl)', 'isWhitelistedApkUrl' in mgr_code),
            ('리다이렉트 호스트 검증 (isWhitelistedHost)', 'isWhitelistedHost' in mgr_code),
        ]
        for name, passed in checks:
            if passed:
                print(f"  [PASS] {name} 구현 확인")
            else:
                print(f"  [FAIL] {name} 누락")
                all_passed = False

    print("\n==================================================")
    if all_passed:
        print(" [결과] 전체 보안 감사 통과: 모든 보안 방어 체계가 활성화되어 있습니다.")
        print("==================================================")
        return 0
    else:
        print(" [결과] 보안 결함 발견: 위의 실패 항목을 조치해주세요.")
        print("==================================================")
        return 1

if __name__ == '__main__':
    sys.exit(run_security_audit())
