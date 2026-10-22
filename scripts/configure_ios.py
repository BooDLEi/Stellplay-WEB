import os
import sys
import plistlib
import shutil
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IOS_DIR = os.path.join(BASE_DIR, 'ios')
APP_DIR = os.path.join(IOS_DIR, 'App')
IOS_APP_DIR = os.path.join(APP_DIR, 'App')
MOBILE_DIR = os.path.join(BASE_DIR, 'mobile')
PUBLIC_DIR = os.path.join(IOS_APP_DIR, 'public')

def configure_info_plist():
    plist_path = os.path.join(IOS_APP_DIR, 'Info.plist')
    os.makedirs(IOS_APP_DIR, exist_ok=True)

    data = {}
    if os.path.exists(plist_path):
        try:
            with open(plist_path, 'rb') as f:
                data = plistlib.load(f)
        except Exception as e:
            print(f"[!] Warning: Failed to parse existing Info.plist ({e}), initializing template.")
            data = {}

    # Basic App Information
    data['CFBundleDisplayName'] = 'StellPlay'
    data['CFBundleName'] = 'StellPlay'
    data['CFBundleIdentifier'] = '$(PRODUCT_BUNDLE_IDENTIFIER)'
    data['CFBundleVersion'] = data.get('CFBundleVersion', '1.0.0')
    data['CFBundleShortVersionString'] = data.get('CFBundleShortVersionString', '1.0.0')
    data['CFBundlePackageType'] = 'APPL'
    data['CFBundleInfoDictionaryVersion'] = '6.0'
    data['CFBundleExecutable'] = '$(EXECUTABLE_NAME)'

    # iOS Background Audio Mode (Critical for background playback)
    bg_modes = data.get('UIBackgroundModes', [])
    if not isinstance(bg_modes, list):
        bg_modes = [bg_modes]
    if 'audio' not in bg_modes:
        bg_modes.append('audio')
    data['UIBackgroundModes'] = bg_modes

    # App Transport Security (Allow streaming audio / video from YouTube & external CDNs)
    ats = data.get('NSAppTransportSecurity', {})
    if not isinstance(ats, dict):
        ats = {}
    ats['NSAllowsArbitraryLoads'] = True
    data['NSAppTransportSecurity'] = ats

    # Orientation & UI configuration
    data['UIRequiresFullScreen'] = True
    data['UIViewControllerBasedStatusBarAppearance'] = True
    data['UISupportedInterfaceOrientations'] = [
        'UIInterfaceOrientationPortrait',
        'UIInterfaceOrientationLandscapeLeft',
        'UIInterfaceOrientationLandscapeRight'
    ]
    data['UISupportedInterfaceOrientations~ipad'] = [
        'UIInterfaceOrientationPortrait',
        'UIInterfaceOrientationPortraitUpsideDown',
        'UIInterfaceOrientationLandscapeLeft',
        'UIInterfaceOrientationLandscapeRight'
    ]

    with open(plist_path, 'wb') as f:
        plistlib.dump(data, f)

    print(f"[OK] Configured Info.plist with UIBackgroundModes ['audio'] and ATS permissions at: {plist_path}")

def configure_app_delegate():
    delegate_path = os.path.join(IOS_APP_DIR, 'AppDelegate.swift')
    os.makedirs(IOS_APP_DIR, exist_ok=True)

    audio_session_code = """        // Background Audio Playback Configuration for StellPlay
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.mixWithOthers, .allowAirPlay])
            try AVAudioSession.sharedInstance().setActive(true)
            print("StellPlay: AVAudioSession set to .playback mode successfully.")
        } catch {
            print("StellPlay: Failed to set AVAudioSession category: \\(error)")
        }"""

    if not os.path.exists(delegate_path):
        # Create full default AppDelegate.swift
        content = f"""import UIKit
import Capacitor
import AVFoundation

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {{

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {{
{audio_session_code}
        return true
    }}

    func applicationWillResignActive(_ application: UIApplication) {{
    }}

    func applicationDidEnterBackground(_ application: UIApplication) {{
    }}

    func applicationWillEnterForeground(_ application: UIApplication) {{
    }}

    func applicationDidBecomeActive(_ application: UIApplication) {{
    }}

    func applicationWillTerminate(_ application: UIApplication) {{
    }}

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {{
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }}

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {{
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }}
}}
"""
        with open(delegate_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[OK] Created new AppDelegate.swift with AVAudioSession setup at: {delegate_path}")
    else:
        with open(delegate_path, 'r', encoding='utf-8') as f:
            content = f.read()

        modified = False
        if 'import AVFoundation' not in content:
            content = "import AVFoundation\n" + content
            modified = True

        if 'AVAudioSession.sharedInstance()' not in content:
            # Inject right after didFinishLaunchingWithOptions declaration
            pattern = r'(func\s+application\([^\)]*didFinishLaunchingWithOptions[^{]*\{)'
            if re.search(pattern, content):
                content = re.sub(pattern, r'\1\n' + audio_session_code, content, count=1)
                modified = True
            else:
                # Fallback inject before last brace
                content = content.rstrip()
                if content.endswith('}'):
                    content = content[:-1] + "\n" + audio_session_code + "\n}\n"
                    modified = True

        if modified:
            with open(delegate_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"[OK] Injected AVAudioSession playback configuration into existing AppDelegate.swift")
        else:
            print(f"[OK] AppDelegate.swift already has AVAudioSession configured.")

def sync_web_assets():
    if not os.path.exists(MOBILE_DIR):
        print(f"[!] Mobile directory not found at: {MOBILE_DIR}")
        return

    os.makedirs(PUBLIC_DIR, exist_ok=True)
    print(f"[*] Syncing web assets from '{MOBILE_DIR}' to '{PUBLIC_DIR}'...")

    for item in os.listdir(MOBILE_DIR):
        if item in ['__pycache__', 'mobile_server.py', 'run_mobile.bat', 'run_mobile_pc_preview.bat', 'mobile_simulator.py']:
            continue
        src = os.path.join(MOBILE_DIR, item)
        dst = os.path.join(PUBLIC_DIR, item)
        if os.path.isdir(src):
            if os.path.exists(dst):
                shutil.rmtree(dst)
            shutil.copytree(src, dst)
        else:
            shutil.copy2(src, dst)

    print("[OK] Web assets synced to iOS public directory.")

def main():
    print("==================================================")
    print(" StellPlay iOS Platform Auto-Configuration Script")
    print("==================================================")
    configure_info_plist()
    configure_app_delegate()
    sync_web_assets()
    print("==================================================")
    print("[SUCCESS] iOS project permissions & assets configured!")

if __name__ == '__main__':
    main()
