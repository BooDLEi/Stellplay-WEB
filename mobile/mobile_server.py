# -*- coding: utf-8 -*-
"""
StellPlay Mobile - 독립 모바일 전용 로컬 서버 (포트 8280)
"""

import os
import sys
import socket
import http.server
import socketserver
import urllib.parse
import urllib.request
import json
import webbrowser

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

PORT = 8280
MOBILE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(MOBILE_DIR)

sys.path.insert(0, PARENT_DIR)
try:
    from server import get_audio_stream_info, fetch_youtube_video_info, fetch_latest_official_tracks
except Exception:
    get_audio_stream_info = None
    fetch_youtube_video_info = None
    fetch_latest_official_tracks = None

def get_lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'

class MobileHttpHandler(http.server.SimpleHTTPRequestHandler):
    # [핵심 1] HTTP/1.1 활성화로 지속 연결(Keep-Alive) 지원
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=MOBILE_DIR, **kwargs)

    # [핵심 2] DNS 역방향 조회(getfqdn) 완전 차단 -> 모바일 접속 딜레이의 주범
    def address_string(self):
        return str(self.client_address[0])

    def log_message(self, format, *args):
        if len(args) > 1 and str(args[1]).startswith(('4', '5')):
            super().log_message(format, *args)

    def end_headers(self):
        # [핵심 3] API는 no-cache 유지, 정적 파일은 브라우저 캐싱 허용
        if self.path.startswith('/api/'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        else:
            self.send_header('Cache-Control', 'public, max-age=3600')

        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Range, Origin, Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def _get_user_data_file(self):
        appdata = os.environ.get('APPDATA')
        target_dir = os.path.join(appdata, 'StellPlay') if appdata else PARENT_DIR
        os.makedirs(target_dir, exist_ok=True)
        return os.path.join(target_dir, 'user_data.json')

    def do_POST(self):
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

        # 1. 오디오 스트림 프록시 (/api/audio?id=...)
        if parsed.path == '/api/audio':
            qs = urllib.parse.parse_qs(parsed.query)
            vid = qs.get('id', [None])[0]
            if not vid or not get_audio_stream_info:
                self.send_error(400, "Invalid ID or audio engine unavailable")
                return

            info = get_audio_stream_info(vid)
            if not info or not info.get('url'):
                self.send_error(502, f"Could not extract audio for: {vid}")
                return

            req_headers = dict(info.get('http_headers', {}))
            client_range = self.headers.get('Range')
            if client_range:
                req_headers['Range'] = client_range
            else:
                req_headers['Range'] = 'bytes=0-'

            req = urllib.request.Request(info['url'], headers=req_headers)
            try:
                with urllib.request.urlopen(req, timeout=15) as resp:
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
                    self.send_error(502, f"Audio stream error: {e}")
                except Exception:
                    pass
            return

        # 2. 유튜브 영상 메타데이터 파싱 (/api/info)
        elif parsed.path == '/api/info':
            qs = urllib.parse.parse_qs(parsed.query)
            target_url = qs.get('url', [None])[0]
            if not target_url or not fetch_youtube_video_info:
                self.send_error(400, "Missing url or parser unavailable")
                return
            info = fetch_youtube_video_info(target_url)
            if not info:
                self.send_error(404, "Failed to parse YouTube info")
                return
            payload = json.dumps(info, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        # 3. 신곡 자동 동기화 (/api/sync-new-songs)
        elif parsed.path == '/api/sync-new-songs':
            tracks = fetch_latest_official_tracks() if fetch_latest_official_tracks else []
            payload = json.dumps({'success': True, 'tracks': tracks}, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        # 4. 사용자 데이터 로드 (/api/user-data)
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

        # 5. 정적 모바일 파일 서빙
        super().do_GET()

class ThreadingHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

def run():
    lan_ip = get_lan_ip()
    for p in range(PORT, PORT + 20):
        try:
            with ThreadingHTTPServer(("", p), MobileHttpHandler) as httpd:
                print("=" * 65, flush=True)
                print(" 📱 [StellPlay Mobile] 모바일 전용 서버가 시작되었습니다.", flush=True)
                print("=" * 65, flush=True)
                print(f" 💻 PC 브라우저 테스트: http://localhost:{p}", flush=True)
                print(f" 📱 스마트폰 접속 주소: http://{lan_ip}:{p}", flush=True)
                print("=" * 65, flush=True)

                try:
                    webbrowser.open(f"http://localhost:{p}")
                except Exception:
                    pass

                httpd.serve_forever()
                break
        except OSError:
            continue

if __name__ == '__main__':
    try:
        run()
    except KeyboardInterrupt:
        print("\nStellPlay Mobile 서버 종료.", flush=True)