#!/bin/bash
# ============================================================
# 🚀 WMS Postman Auto-Setup & Screenshot (Mac M1) - V10 (SYSTEM MENU CONTROL)
# ============================================================

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
POSTMAN_DIR="$PROJECT_DIR/postman"
SCREENSHOTS_DIR="$POSTMAN_DIR/screenshots"
COLLECTION_FILE="$POSTMAN_DIR/wms_collection.json"
ENVIRONMENT_FILE="$POSTMAN_DIR/environment.json"
REPORT_FILE="$POSTMAN_DIR/reports/api_results.html"

# Colors
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

mkdir -p "$SCREENSHOTS_DIR" "$POSTMAN_DIR/reports"

# ─── Helper 1: Swift Window Finder (Fixed) ──────────────────
# Tìm chính xác ID cửa sổ UI của Postman
echo 'import Foundation
import Quartz
let options: CGWindowListOption = [.excludeDesktopElements, .optionOnscreenOnly]
let windowList = CGWindowListCopyWindowInfo(options, kCGNullWindowID) as? [[String: Any]] ?? []
for window in windowList {
    if let ownerName = window[kCGWindowOwnerName as String] as? String,
       let windowLayer = window[kCGWindowLayer as String] as? Int,
       ownerName == "Postman" && windowLayer == 0 {
        if let windowID = window[kCGWindowNumber as String] as? Int {
            print(windowID)
            exit(0)
        }
    }
}' > "$POSTMAN_DIR/find_postman.swift"
swiftc "$POSTMAN_DIR/find_postman.swift" -o "$POSTMAN_DIR/find_postman_v10" 2>/dev/null

# ─── Helper 2: Điều khiển Postman bằng MENU BAR (Chắc chắn 100%) ─
postman_nav() {
  local action="$1"
  local label="$2"
  local outfile="$3"
  
  echo -e "\n   ➜ ${BOLD}${label}${RESET}"
  
  # Kích hoạt & Điều hướng
  osascript -e "tell application \"Postman\" to activate"
  sleep 1
  osascript -e "tell application \"System Events\" to tell process \"Postman\"
    $action
  end tell" 2>/dev/null
  sleep 2
  
  # Chụp ảnh
  local winid=$("$POSTMAN_DIR/find_postman_v10" 2>/dev/null)
  if [ -n "$winid" ]; then
    screencapture -l "$winid" -o "$outfile"
    echo -e "      ${GREEN}✅ Đã chụp: $(basename "$outfile")${RESET}"
  else
    screencapture -x "$outfile"
    echo -e "      ${YELLOW}⚠️  Sử dụng chụp toàn màn hình.${RESET}"
  fi
}

echo -e "\n${BOLD}╔══════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║  WMS API – Postman AI CONTROL V10 (FINAL)    ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════╝${RESET}\n"

# 1. Quét API & Newman
cd "$POSTMAN_DIR"
node api_scanner.js
npx newman run "$COLLECTION_FILE" -e "$ENVIRONMENT_FILE" --reporters cli,htmlextra --reporter-htmlextra-export "$REPORT_FILE" --suppress-exit-code > /dev/null 2>&1

# 2. Khởi động
open -a Postman
sleep 2
echo -ne "   ${BOLD}Nhấn [ENTER] để tôi (AI) thực hiện điều khiển MENU Postman...${RESET}"
read -r

# 3. ĐIỀU KHIỂN MENU & CHỤP
# Màn hình 1: Collections
postman_nav "click menu item \"Collections\" of menu \"View\" of menu bar 1" "Tab Collections" "$SCREENSHOTS_DIR/01_collection_catalog.png"

# Màn hình 2: Environments
postman_nav "click menu item \"Environments\" of menu \"View\" of menu bar 1" "Tab Environments" "$SCREENSHOTS_DIR/02_environment_vars.png"

# Màn hình 3: Report
open "$REPORT_FILE"
sleep 3
screencapture -x "$SCREENSHOTS_DIR/03_test_results.png"
echo -e "      ${GREEN}✅ Đã chụp: 03_test_results.png${RESET}"

# Màn hình 4: Body (Dùng tổ hợp phím Cmd+K cho nhanh nhưng ổn định hơn)
echo -e "\n   ➜ ${BOLD}Màn hình 4: Request Body${RESET}"
osascript -e 'tell application "Postman" to activate'
osascript -e 'tell application "System Events" to tell process "Postman"
    keystroke "k" using command down
    delay 0.5
    keystroke "POST /login"
    delay 1
    key code 36
end tell' 2>/dev/null
sleep 2
winid=$("$POSTMAN_DIR/find_postman_v10" 2>/dev/null)
screencapture -l "$winid" -o "$SCREENSHOTS_DIR/04_request_body.png"
echo -e "      ${GREEN}✅ Đã chụp: 04_request_body.png${RESET}"

# Màn hình 5: Documentation
postman_nav "click menu item \"Postman Documentation\" of menu \"View\" of menu bar 1" "Tài liệu API" "$SCREENSHOTS_DIR/05_api_documentation.png"

# Cleanup
rm "$POSTMAN_DIR/find_postman.swift" "$POSTMAN_DIR/find_postman_v10"

echo -e "\n${BOLD}${GREEN}✅ HOÀN TẤT! AI đã điều khiển & chụp xong.${RESET}\n"
