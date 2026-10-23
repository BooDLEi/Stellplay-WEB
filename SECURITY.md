# StellPlay 보안 정책 (Security Policy)

본 문서는 **StellPlay** 프로젝트의 보안 정책, 위험 모델(Threat Model), 다층 방어 아키텍처(Multi-Layer Defense Architecture), 그리고 공급망 공격 및 AI 지원 개발 환경에서의 코드 오염 방어 지침을 규정합니다.

---

## 1. 개요 및 보안 철학

StellPlay는 사용자의 편의를 위해 **GitHub 기반 실시간 무설치 라이브 업데이트(OTA)** 및 **네이티브 안드로이드 브릿지(AndroidBridge)** 연동 구조를 채택하고 있습니다.  
그러나 최근 오픈소스 생태계에서는 AI 코딩 도구(Claude, ChatGPT, Copilot 등)에 악성 코드를 주입하도록 유도하는 **간접 프롬프트 인젝션(Indirect Prompt Injection)**, **저장소 의존성 오염(Supply Chain Attack)**, **비인가 배포 파일 변조** 등의 위협 사례가 증가하고 있습니다.

StellPlay는 **"원격에서 전달되는 모든 리소스는 잠재적으로 오염될 수 있다"**는 제로 트러스트(Zero Trust) 관점을 바탕으로 클라이언트 및 배포 파이프라인 전반에 다층 방어 체계를 구축하여 운영합니다.

---

## 2. 5계층 다중 방어 아키텍처 (5-Layer Defense Architecture)

```
[Layer 1: 배포 무결성]  version.json 암호학적 SHA-256 체크섬 대조 (1바이트 위변조도 즉시 폐기)
        ↓
[Layer 2: 파일 샌드박스] 경로 조작(Path Traversal/..), 널 바이트, 비허가 바이너리 확장자 원천 차단
        ↓
[Layer 3: 네이티브 브릿지] APK 다운로드 URL 공식 GitHub(BooDLEi/Stellplay-WEB) 도메인 한정
        ↓
[Layer 4: 웹 런타임]   엄격한 Content Security Policy(CSP)로 인가되지 않은 외부 C2 통신/XSS 차단
        ↓
[Layer 5: 데이터 살균]  YouTube API 등 외부 수집 데이터의 HTML 태그/AI 프롬프트 인젝션 무력화
```

### [Layer 1] OTA 업데이트 암호학적 무결성 검증 (SHA-256 Verification)
* **메커니즘**: `version.json` 매니페스트 내에 모든 배포 파일의 SHA-256 해시맵(`fileHashes`)이 등록됩니다.
* **클라이언트 동작**: Android `UpdateManager`는 임시 디렉터리에 파일을 다운로드한 직후 실제 파일의 SHA-256 해시를 계산하여 매니페스트와 비교합니다.
* **방어 효과**: 1바이트라도 위변조되거나 악성 스크립트가 추가된 경우 다운로드가 즉시 실패 처리되고 임시 파일이 영구 삭제되며, 직전 정상 백업 상태가 유지됩니다.

### [Layer 2] 파일 경로 탈출 및 확장자 화이트리스트 차단 (Sandbox Guard)
* **경로 검증**: 파일 경로에 `..`, 절대 경로(`/`, `\`), 드라이브 명칭(`:`), 널 바이트(`\0`)가 포함되어 있으면 즉각 다운로드를 중단합니다. 또한 최종 저장 경로가 앱 전용 샌드박스(`tempDir`) 내부인지 표준 정규 경로(`CanonicalPath`) 수준에서 검증합니다.
* **확장자 제한**: 오직 웹 정적 에셋(`.html`, `.css`, `.js`, `.json`, `.png`, `.jpg`, `.svg`, `.ico`, `.woff2`, `.txt` 등)만 허용합니다. `.apk`, `.dex`, `.so`, `.sh`, `.bat`, `.exe`, `.py` 등의 실행 파일은 OTA 매니페스트에 등록되어도 다운로드가 원천 거부됩니다.

### [Layer 3] 네이티브 브릿지 및 APK 설치 URL 화이트리스트 (Native Guard)
* **위험**: 웹뷰의 자바스크립트가 탈취되었을 때 `AndroidBridge.downloadAndInstallApk(url)`를 호출하여 악성 APK를 설치하도록 유도하는 공격.
* **방어 대책**: 오직 공식 GitHub 저장소(`https://github.com/BooDLEi/Stellplay-WEB/` 및 `https://raw.githubusercontent.com/BooDLEi/Stellplay-WEB/`)의 HTTPS 주소만 다운로드 및 설치를 허용합니다. 제3자 외부 URL이나 HTTP 주소는 네이티브 레벨에서 강제 차단됩니다.
* **리다이렉트 방어**: HTTP 301/302 리다이렉트 발생 시에도 대상 호스트가 `github.com`, `raw.githubusercontent.com`, `objects.githubusercontent.com` 범위 내에 있을 때만 이동을 허용합니다.

### [Layer 4] 웹 런타임 콘텐츠 보안 정책 (Strict Content Security Policy - CSP)
* `mobile/index.html` 및 `index.html` 헤더에 엄격한 CSP 메타 태그가 상시 적용됩니다.
* **허용 도메인**: YouTube IFrame API(`youtube.com`, `ytimg.com`), 공식 음원 스트리밍 CDN(`googlevideo.com`), 공식 GitHub 배포처.
* **방어 효과**: 승인되지 않은 외부 공격자 서버(C2)로의 사용자 데이터 유출, 악성 외부 스크립트 태그 로드, 비인가 `iframe` 삽입을 브라우저 렌더링 엔진 차원에서 물리적으로 차단합니다.

### [Layer 5] 외부 수집 데이터 살균 및 AI 프롬프트 인젝션 방어 (Anti-Poisoning)
* YouTube 동영상 메타데이터(제목, 채널명, 업로더)를 수집하는 `sync_songs_github.py`에 자동 살균기(`sanitize_metadata_string`)를 적용합니다.
* **방어 패턴**:
  - HTML 태그(`<script>`, `<iframe>`, `onload=`) 일체 제거
  - 비정상 제어 문자 및 널 바이트 제거
  - AI 코딩 어시스턴트(Claude, GPT 등)가 저장소를 인덱싱할 때 시스템 지시문을 무력화하도록 시도하는 간접 프롬프트 인젝션 패턴(`[SYSTEM_MESSAGE]`, `<USER_REQUEST>`, ````system` 등) 무력화

---

## 3. GitHub 저장소 및 개발 환경 보안 지침

저장소 운영자 및 기여자는 다음 수칙을 준수해야 합니다.

1. **GitHub 계정 2단계 인증(2FA) 필수화**: 리포지토리 쓰기 권한이 있는 모든 계정은 하드웨어 키 또는 OTP 기반 2FA를 활성화합니다.
2. **`main` 브랜치 보호 규칙 (Branch Protection Rules)**:
   - `main` 브랜치로의 직접 푸시(Direct Push) 및 강제 푸시(`push --force`) 금지
   - Pull Request를 통한 코드 변경 필수화 및 검토자 승인(Reviewer Approval) 요구
3. **커밋 서명 (GPG Commit Signing)**:
   - 커밋에 GPG 서명을 적용하여 커밋 작성자 위변조 방지 권장
4. **AI 생성 코드 수동 검증 원칙 (Human-in-the-Loop)**:
   - AI 도구(Claude, Antigravity 등)가 제안한 외부 의존성(패키지), 외부 URL, 인라인 스크립트는 반드시 인간 개발자가 소스 레벨에서 최종 검증한 후 머지합니다.
5. **정기 무결성 검증 도구 실행**:
   - 배포 전 `python scripts/verify_security_integrity.py`를 실행하여 모든 보안 필터 및 SHA-256 해시가 정상인지 확인합니다.

---

## 4. 보안 취약점 보고 (Reporting a Vulnerability)

StellPlay에서 잠재적인 보안 취약점을 발견하신 경우, 이슈 트래커(공개 이슈)에 등록하지 마시고 아래 절차를 통해 비공개로 제보해주시기 바랍니다:

1. **GitHub Security Advisories**: 저장소의 **Security → Advisories → Report a vulnerability** 탭을 통해 비공개 보고서를 작성해주세요.
2. **직접 문의**: 저장소 관리자 이메일 또는 비공개 채널을 통해 취약점 재현 절차(PoC)와 함께 전달해주시면 신속히 확인 및 패치하겠습니다.
