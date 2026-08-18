#!/usr/bin/env python3
"""Regenerates public/games/index.html from the upstream GrandmaGames single-file app.

Upstream is Vietnamese; Popo's screen is Cantonese, so every user-facing string is
translated here rather than by hand — re-run this after pulling upstream changes and
the translation (plus the score bridge, plus the disabled in-file reminder) comes back.
Prints any pair it could not find, and any Vietnamese text left behind.

    python3 scripts/translate-games.py
"""
import re, sys

SRC = "/Users/ethan/Documents/Personal/GrandmaGames/index.html"
DST = "/Users/ethan/Documents/HackClub/Moonlight/caretaker/public/games/index.html"

# Vietnamese -> spoken Cantonese (Traditional). Order matters: longer strings first,
# so a short phrase never eats a substring of a longer one.
PAIRS = [
    # meta / shell
    ('<html lang="vi">', '<html lang="zh-HK">'),
    ('<title>Giải Đố Tối Giản</title>', '<title>玩遊戲</title>'),
    ('<h1>GIẢI ĐỐ TỐI GIẢN</h1>', '<h1>玩遊戲</h1>'),
    ('Bốn trò chơi nhẹ nhàng. Không ồn ào, chỉ có chơi.', '五個輕鬆嘅遊戲。慢慢玩，唔使急。'),
    # game titles (before descs, which quote them)
    ('Phá Khối Bom', '炸彈方塊'),
    ('Phá Khối', '砌方塊'),
    ('Ghép Số', '合數字'),
    ('Tràn Màu', '填顏色'),
    ('Nối Điểm', '連線'),
    # menu card descs
    ('Xếp từng bộ mảnh hình học lên bảng 8×8. Lấp đầy hàng và cột để xóa, giữ chuỗi liên tiếp và sống sót qua độ khó tăng dần.',
     '將一組一組嘅積木放上八乘八嘅棋盤。填滿一行或者一列就會消失，連住咁消就有更多分。'),
    ('Như 砌方塊, nhưng thỉnh thoảng một mảnh mang theo bom. Xóa ô chứa bom trong 7 lượt, nếu không bom nổ và ván đấu kết thúc.',
     '同砌方塊一樣，不過有時會有一嚿積木藏住炸彈。七步之內要消走佢，唔係就會爆，玩到呢度為止。'),
    ('Trượt và hợp nhất các ô giống nhau trên bảng 4×4. Giá trị nhân đôi khi chạm nhau, màu sắc chuyển dần khi số tiến về 2048 và hơn nữa.',
     '喺四乘四嘅格仔度推啲數字。一樣嘅數字撞埋會變雙倍，睇下可唔可以去到 2048。'),
    ('Tràn màu bảng 12×12 từ góc trên bên trái với năm màu trang nhã. Phủ kín bảng trong giới hạn lượt, lượt dư đổi thành điểm.',
     '由左上角開始，用五隻顏色填滿十二乘十二嘅棋盤。喺限定步數之內填晒，剩低嘅步數會變分數。'),
    ('Nối các điểm cùng màu trên bảng 6×6 mà không để đường cắt nhau. Đi chính xác và nối liên tục để giữ hệ số thưởng.',
     '喺六乘六嘅棋盤度將同色嘅點連埋一齊，啲線唔可以交叉。連得準又連得順，加成就會越嚟越高。'),
    # in-game hints
    ('Kéo các mảnh vào bảng. Lấp đầy hàng hoặc cột để xóa.', '將積木拖上棋盤。填滿一行或者一列就會消失。'),
    ('Dùng phím mũi tên hoặc vuốt để trượt. Các ô giống nhau sẽ hợp nhất.', '用箭嘴掣，或者用手指掃。一樣嘅數字撞埋會合埋。'),
    ('Tràn màu từ góc trên bên trái. Phủ kín bảng trước khi hết lượt. Thắng dưới mức chuẩn để đạt Hoàn Hảo.',
     '由左上角開始填色。喺用完步數之前填滿成個棋盤。少過標準步數就係完美。'),
    ('Kéo giữa các điểm cùng màu. Đường không được cắt nhau. Nối liên tiếp không phá đường cũ để tăng hệ số.',
     '喺同色嘅點之間拖線。啲線唔可以交叉。連續連啱又唔拆返舊線，加成就會高啲。'),
    # chips / labels
    ('Lượt còn lại', '剩低步數'),
    ('Mức chuẩn', '標準步數'),
    ('Màn tiếp theo', '下一關'),
    # buttons / overlay chrome
    ('Chơi lại màn', '重新玩呢一關'),
    ('Chơi lại', '再玩一次'),
    ('Xem kết quả', '睇返結果'),
    ('Xem lời giải', '睇下有咩解法'),
    ('Chạm bên ngoài để xem bảng', '㩒旁邊可以睇返個棋盤'),
    ('Kết thúc', '玩完喇'),
    ('DỌN SẠCH BẢNG!', '成個棋盤清晒！'),
    ('COMBO X${streak}!', '連住 ${streak} 次！'),
    ('HOÀN HẢO', '完美'),
    # game-over copy
    ('Không còn chỗ đặt', '冇位放喇'),
    ('Chuỗi thưởng cao nhất ×${this.streak || 0} · Bộ mảnh này vẫn có lời giải',
     '最高連住 ×${this.streak || 0} · 呢副積木其實仲有得放'),
    ('Chuỗi thưởng cao nhất ×${this.streak || 0} · Bộ mảnh này không có lời giải nào',
     '最高連住 ×${this.streak || 0} · 呢副積木真係冇得放'),
    ('Bom đã nổ!', '炸彈爆咗！'),
    ('Không xóa được ô chứa bom trong ${BOMB.fuseRounds} lượt', '${BOMB.fuseRounds} 步之內冇消走藏住炸彈嗰格'),
    ('Hết nước đi', '冇得再郁喇'),
    ('Ô cao nhất · ${top}', '最大嗰格 · ${top}'),
    ('Tràn hoàn hảo', '填得好完美'),
    ('Đã phủ kín bảng', '填滿晒'),
    ('Hoàn thành trong ${this.movesUsed} lượt (chuẩn ${this.par}) · ${remaining} lượt đổi thành điểm',
     '用咗 ${this.movesUsed} 步（標準 ${this.par}）· 剩低 ${remaining} 步變成分數'),
    ('Hết lượt', '步數用晒'),
    ('Đã phủ ${owned} / 144 ô', '填咗 ${owned} / 144 格'),
    ('Hoàn thành màn ${finishedLevel}', '完成咗第 ${finishedLevel} 關'),
    ('+${levelScore} (gốc ${base}, trừ ${this.redundant * 50})', '+${levelScore}（基本 ${base}，扣 ${this.redundant * 50}）'),
    # colour names
    ('Xám xanh', '灰藍'),
    ('Xanh ngọc', '湖水綠'),
    ('Hồng', '粉紅'),
    ('Hổ phách', '琥珀黃'),
    ('Chàm', '靛藍'),
    # the file's own reminder copy (kept translated even though it is disabled below)
    ('Bà ơi, bà đã uống thuốc và uống nước chưa?', '婆婆，飲咗水同食咗藥未呀？'),
    ('Nhắc nhở', '提提你'),
    ('Chạm vào nút để đóng', '㩒個掣就得'),
    ("yesLabel: 'Rồi'", "yesLabel: '食咗喇'"),
    ("noLabel: 'Chưa'", "noLabel: '未呀'"),
    # nav
    ('Kỷ lục · ', '最高分 · '),
    ('KỶ LỤC MỚI', '新紀錄'),
    ('Kỷ lục', '最高分'),
    ('Điểm trừ', '扣分'),
    ('Điểm', '分數'),
    ('Chuỗi', '連續'),
    ('Hệ số', '加成'),
    ('Đã phủ', '已填'),
    ('Màn', '關數'),
    # quoted forms only — a bare 'Menu' would also rewrite the onMenu/renderMenu identifiers
    ("menu.textContent = 'Menu';", "menu.textContent = '返去';"),
    ("\n        Menu\n", "\n        返去\n"),
    ("btn.textContent = 'Chơi';", "btn.textContent = '玩';"),
]

SCORE_BRIDGE = """
<script>
/* Score bridge: caretaker embeds this file in an iframe (/popo/games) and keeps the
   leaderboard. Every time a game writes a new personal best, tell the parent window;
   the parent is the only thing that talks to the database. Standalone (no parent),
   these posts go nowhere and the file behaves exactly as it did before. */
(function () {
  if (window.parent === window) return;
  const titles = {};
  for (const [id, def] of Object.entries(App.registry)) titles[id] = def.title;

  const set = Store.set.bind(Store);
  Store.set = function (key, value) {
    set(key, value);
    if (typeof key !== 'string' || !key.startsWith('mp-best-')) return;
    const gameId = key.slice('mp-best-'.length);
    if (!titles[gameId] || !value) return;
    window.parent.postMessage(
      { type: 'caretaker-game-score', gameId, gameTitleZh: titles[gameId], score: value },
      window.location.origin
    );
  };

  // Hand over whatever this browser already had, so the board is never empty on first load.
  for (const [gameId, title] of Object.entries(titles)) {
    const best = Store.get('mp-best-' + gameId, 0);
    if (best > 0) {
      window.parent.postMessage(
        { type: 'caretaker-game-score', gameId, gameTitleZh: title, score: best },
        window.location.origin
      );
    }
  }
})();
</script>
"""

def escaped(s):
    """Same string as the file writes it when non-ASCII is \\uXXXX-escaped."""
    return ''.join(c if ord(c) < 128 else '\\u%04x' % ord(c) for c in s)

html = open(SRC, encoding='utf-8').read()
missed = []
for vi, zh in PAIRS:
    hit = False
    for form in (vi, escaped(vi)):
        if form in html:
            html = html.replace(form, zh)
            hit = True
    if not hit:
        missed.append(vi)

# CJK-capable stack, so the Cantonese renders in the same face as the rest of the app.
html = html.replace(
    'font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;',
    'font-family: "Noto Sans HK", "PingFang HK", "Hiragino Sans CG", "Microsoft JhengHei", Inter, system-ui, -apple-system, sans-serif;',
)

# One reminder in the app, not two: the popup lives in components/popo/ReminderPopup.tsx
# and draws over this iframe, so the copy inside the game stays off.
html = html.replace(
    "const REMINDER = {\n  enabled: true,",
    "const REMINDER = {\n  // Off on purpose: caretaker shows its own reminder over this iframe\n"
    "  // (components/popo/ReminderPopup.tsx), and two popups would fight.\n  enabled: false,",
)

html = html.replace('</body>', SCORE_BRIDGE + '</body>')

open(DST, 'w', encoding='utf-8').write(html)

VN = 'àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ'
leftovers = [(i + 1, l.strip()[:110]) for i, l in enumerate(html.split('\n'))
             if any(c in VN for c in l) or re.search(r'\\u1e|\\u01b|\\u1ec|\\u1ed|\\u1eb', l)]
print("MISSED:", missed or "none")
print("LEFTOVER VIETNAMESE LINES:", len(leftovers))
for n, l in leftovers[:25]:
    print(" ", n, l)
