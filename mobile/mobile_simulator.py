import os
import sys
import time
import socket
import subprocess
import webbrowser

PORT = 8280
URL = f"http://127.0.0.1:{PORT}"

def is_port_open(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1)
        return s.connect_ex(('127.0.0.1', port)) == 0

def ensure_server():
    if is_port_open(PORT):
        print(f"[Mobile Simulator] 모바일 서버가 이미 포트 {PORT}에서 실행 중입니다.")
        return None
    
    print(f"[Mobile Simulator] 포트 {PORT}에서 모바일 서버를 백그라운드로 실행합니다...")
    server_dir = os.path.dirname(os.path.abspath(__file__))
    server_script = os.path.join(server_dir, "mobile_server.py")
    proc = subprocess.Popen([sys.executable, server_script], cwd=server_dir)
    
    # Wait for server to become responsive
    for _ in range(30):
        time.sleep(0.3)
        if is_port_open(PORT):
            print("[Mobile Simulator] 모바일 서버 연결 성공!")
            return proc
    print("[Mobile Simulator] 경고: 서버 시작 확인 대기 시간이 초과되었습니다.")
    return proc

def find_browser_executable():
    candidates = [
        # Microsoft Edge
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"),
        # Google Chrome
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
        # Brave / others
        r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    return None

def launch_window():
    browser_exe = find_browser_executable()
    # Recommended smartphone viewport size: 412 x 870
    width = 412
    height = 870
    
    if browser_exe:
        print(f"[Mobile Simulator] 전용 모바일 뷰포트 창 실행 ({browser_exe})...")
        # --app flag opens a frameless standalone window without URL bar or browser tabs
        args = [
            browser_exe,
            f"--app={URL}",
            f"--window-size={width},{height}",
            "--new-window"
        ]
        try:
            subprocess.Popen(args)
            print(f"[Mobile Simulator] 스마트폰 뷰포트({width}x{height})로 모바일 앱이 실행되었습니다.")
            return True
        except Exception as e:
            print(f"[Mobile Simulator] 전용 창 실행 실패: {e}")
    
    # Fallback: try pywebview
    try:
        import webview
        print("[Mobile Simulator] pywebview로 모바일 창을 엽니다...")
        webview.create_window("StellPlay Mobile (PC 모니터링)", URL, width=width, height=height, resizable=True)
        webview.start()
        return True
    except Exception as e:
        print(f"[Mobile Simulator] pywebview fallback 실패: {e}")
        
    # Last fallback: default browser
    print(f"[Mobile Simulator] 기본 브라우저로 {URL} 을 엽니다.")
    webbrowser.open(URL)
    return True

if __name__ == '__main__':
    print("============================================================")
    print(" [StellPlay Mobile] PC 모니터링 시뮬레이터 시작")
    print("============================================================")
    server_proc = ensure_server()
    launch_window()
    print("============================================================")
    print(" PC에서 모바일 버전 모니터링 준비가 완료되었습니다.")
    print(f" URL: {URL}")
    print("============================================================")
