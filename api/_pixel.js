// heist pixel engine: one source for the page scene, crew cards, the share card and /api/og
// (inlined into index.html by build.py; required by api/og.js in node)
(function (root) {
  var PAL = {
    bg0: 0x0b1218, bg1: 0x101a22, bg2: 0x16232d, tile: 0x1a2a35,
    steel: 0x5d6d7a, steelL: 0x8696a3, steelD: 0x37434d, rim: 0x232d35, bolt: 0xa9b6c0,
    fur: 0x8a93a1, furL: 0xd3d9e2, furD: 0x646c7a, mask: 0x1a1e27, eyeW: 0xf5f7fa, ink: 0x0b0d12,
    ear: 0xe59aa8, sack: 0xc49a5a, sackD: 0x94703e, gold: 0xffd34d, goldL: 0xfff1a8, goldD: 0xc9861c, goldO: 0x5a3510,
    ol: 0x0a0d12, laser: 0xff3b4e, laserG: 0x5a1a26, tail: 0x2a2f3a, floor: 0x0d151b, floorL: 0x15212a,
    white: 0xf5f7fa, red: 0xff3b4e, dim: 0x7d8b97, rope: 0xc49a5a, ropeD: 0x94703e
  };
  // crew traits: beanie colours (cap, cap light), fur tones (fur, light, dark)
  var CAPS = [[0x2b3145, 0x3e4763], [0x7a1f2b, 0xa3303f], [0x1f4a3c, 0x2f7a5c], [0x5a3d8a, 0x7a58b3], [0x8a5a1f, 0xb47a30], [0x1e3a5f, 0x2f5a8f]];
  var FURS = [[0x8a93a1, 0xd3d9e2, 0x646c7a], [0x9a8d7e, 0xe0d6c9, 0x72675b], [0x6f7682, 0xc3c9d2, 0x4f5561]];
  var NAMES1 = ["quiet", "midnight", "lucky", "slick", "nine-finger", "soft-paw", "velvet", "rusty", "silent", "lockpick", "backdoor", "low-key"];
  var NAMES2 = ["paws", "mask", "whisker", "tail", "shadow", "crowbar", "fuse", "ladder", "glove", "ghost", "wheel", "drill"];
  var BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function traits(addr) {
    var h = hash(String(addr || "heist"));
    return { cap: h % CAPS.length, fur: (h >>> 3) % FURS.length, look: (h >>> 6) & 1 ? 1 : -1, mirror: !!((h >>> 7) & 1),
      name: NAMES1[(h >>> 8) % NAMES1.length] + " " + NAMES2[(h >>> 13) % NAMES2.length] };
  }

  function Grid(w, h) { this.w = w; this.h = h; this.px = new Int32Array(w * h).fill(PAL.bg0); }
  Grid.prototype.set = function (x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || c == null) return;
    this.px[y * this.w + x] = typeof c === "string" ? PAL[c] : c;
  };
  Grid.prototype.rect = function (x, y, w, h, c) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.set(x + i, y + j, c); };
  Grid.prototype.rgba = function (out) {
    for (var i = 0; i < this.px.length; i++) {
      var c = this.px[i];
      if (c < 0) { out[i * 4 + 3] = 0; continue; }
      out[i * 4] = (c >> 16) & 255; out[i * 4 + 1] = (c >> 8) & 255; out[i * 4 + 2] = c & 255; out[i * 4 + 3] = 255;
    }
    return out;
  };

  // 3x5 pixel font (rows joined, 15 cells per glyph)
  var F3 = {
    "A": ".#.#.#####.##.#",
    "B": "##.#.###.#.###.",
    "C": ".###..#..#...##",
    "D": "##.#.##.##.###.",
    "E": "####..##.#..###",
    "F": "####..##.#..#..",
    "G": ".###..#.##.#.##",
    "H": "#.##.#####.##.#",
    "I": "###.#..#..#.###",
    "J": "..#..#..##.#.#.",
    "K": "#.##.###.#.##.#",
    "L": "#..#..#..#..###",
    "M": "#.########.##.#",
    "N": "##.#.##.##.##.#",
    "O": ".#.#.##.##.#.#.",
    "P": "##.#.###.#..#..",
    "Q": ".#.#.##.###..##",
    "R": "##.#.###.#.##.#",
    "S": ".###...#...###.",
    "T": "###.#..#..#..#.",
    "U": "#.##.##.##.####",
    "V": "#.##.##.##.#.#.",
    "W": "#.##.########.#",
    "X": "#.##.#.#.#.##.#",
    "Y": "#.##.#.#..#..#.",
    "Z": "###..#.#.#..###",
    "0": "####.##.##.####",
    "1": ".#.##..#..#.###",
    "2": "##...#.#.#..###",
    "3": "##...#.#...###.",
    "4": "#.##.####..#..#",
    "5": "####..##...###.",
    "6": ".###..####.####",
    "7": "###..#.#..#..#.",
    "8": "####.#####.####",
    "9": "####.####..###.",
    "$": ".####..#..####.",
    "?": "##...#.#.....#.",
    "+": "....#.###.#....",
    ".": ".............#.",
    "-": "......###......",
    ":": "....#.....#....",
    "!": ".#..#..#.....#.",
    "/": "..#..#.#.#..#..",
    " ": "...............",
    ",": "..........#.#..",
    "%": "#.#..#.#.#..#.#",
    "—": "......###......"
  };

  function textW(s, sc) { return s.length * 4 * sc - sc; }
  function text(g, s, x, y, sc, col, shadow) {
    s = String(s).toUpperCase(); sc = sc || 1;
    for (var n = 0; n < s.length; n++) {
      var gl = F3[s[n]] || F3["?"];
      for (var j = 0; j < 5; j++) for (var i = 0; i < 3; i++) if (gl[j * 3 + i] === "#") {
        if (shadow) g.rect(x + (n * 4 + i) * sc + sc, y + j * sc + sc, sc, sc, shadow);
      }
      for (var j2 = 0; j2 < 5; j2++) for (var i2 = 0; i2 < 3; i2++) if (gl[j2 * 3 + i2] === "#") g.rect(x + (n * 4 + i2) * sc, y + j2 * sc, sc, sc, col);
    }
  }


  function wall(g, tileStep) {
    for (var y = 0; y < g.h; y++) {
      var t = y / g.h, base = t > 0.66 ? "bg2" : (t > 0.33 ? "bg1" : "bg0"), nxt = t > 0.33 ? "bg2" : "bg1", f = (t * 3) % 1;
      for (var x = 0; x < g.w; x++) g.set(x, y, (f * 16 > BAYER[y % 4][x % 4] && t <= 0.66) ? nxt : base);
    }
    var s = tileStep || 10;
    for (var yy = 0; yy < g.h; yy += s) for (var xx = 0; xx < g.w; xx++) g.set(xx, yy, "tile");
    for (var x2 = 0; x2 < g.w; x2 += s) for (var y2 = 0; y2 < g.h; y2++) g.set(x2, y2, "tile");
  }
  function floor(g, y0, s) {
    s = s || 5;
    for (var y = y0; y < g.h; y++) for (var x = 0; x < g.w; x++) g.set(x, y, ((x / s | 0) + (y / s | 0)) % 2 ? "floor" : "floorL");
  }
  function vaultDoor(g, cx, cy, r) {
    var x, y, d;
    for (y = cy - r - 2; y <= cy + r + 2; y++) for (x = cx - r - 2; x <= cx + r + 2; x++) {
      d = Math.hypot(x - cx, y - cy);
      if (d <= r + 1.5 && d > r - 1) g.set(x, y, "rim");
      else if (d <= r - 1) {
        var s = (x - cx) + (y - cy);
        g.set(x, y, d > r * 0.78 ? (s < -r * 0.35 ? "steelL" : (s > r * 0.4 ? "steelD" : "steel")) : "steel");
      }
      if (d > r * 0.74 && d < r * 0.78) g.set(x, y, "steelD");
    }
    for (var i = 0; i < 16; i++) { var a = i / 16 * Math.PI * 2; g.set(cx + Math.cos(a) * r * 0.88, cy + Math.sin(a) * r * 0.88, "bolt"); }
    var wr = r * 0.42;
    for (var k = 0; k < 3; k++) {
      var b = k / 3 * Math.PI + 0.35;
      for (var t = -Math.floor(wr); t <= Math.floor(wr); t++) for (var w = 0; w < 2; w++)
        g.set(cx + Math.cos(b) * t + w * Math.sin(b), cy + Math.sin(b) * t - w * Math.cos(b), "steelD");
    }
    for (y = cy - 4; y <= cy + 4; y++) for (x = cx - 4; x <= cx + 4; x++) { d = Math.hypot(x - cx, y - cy); if (d <= 3.6) g.set(x, y, d < 2 ? "bolt" : "rim"); }
    for (var n = 0; n < 6; n++) {
      var c = n / 6 * Math.PI * 2 + 0.35, hx = Math.round(cx + Math.cos(c) * wr), hy = Math.round(cy + Math.sin(c) * wr);
      for (y = -2; y <= 2; y++) for (x = -2; x <= 2; x++) if (x * x + y * y <= 4) g.set(hx + x, hy + y, x * x + y * y > 1 ? "rim" : "bolt");
    }
  }
  function laser(g, x0, y0, x1, y1, on) {
    var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0;
    for (var i = 0; i <= n; i++) {
      var x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n);
      if (on === false) { if (i % 4 === 0) g.set(x, y, "laserG"); continue; }
      g.set(x, y - 1, "laserG"); g.set(x, y + 1, "laserG"); g.set(x, y, "laser");
    }
  }
  function emitter(g, x, y) {
    for (var j = -3; j <= 3; j++) for (var i = -5; i <= 0; i++) g.set(x + i, y + j, (i === -5 || i === 0 || j === -3 || j === 3) ? "rim" : "steelD");
    g.set(x - 1, y, "laser"); g.set(x - 2, y, "laser");
  }
  var COIN5 = [".OOO.", "OLCCO", "OCCDO", "OCDDO", ".OOO."];
  var COIN7 = ["..OOO..", ".OLLCO.", "OLCCCDO", "OCCDCDO", "OCCCDDO", ".OCDDO.", "..OOO.."];
  var CMAP = { O: "goldO", L: "goldL", C: "gold", D: "goldD" };
  function sprite(g, rows, x0, y0, map) {
    for (var j = 0; j < rows.length; j++) for (var i = 0; i < rows[j].length; i++) { var c = map[rows[j][i]]; if (c != null) g.set(x0 + i, y0 + j, c); }
  }
  function coin(g, x, y, big) { sprite(g, big ? COIN7 : COIN5, x, y, CMAP); }
  function sparkle(g, x, y, c) { g.set(x, y, "goldL"); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { g.set(x + d[0], y + d[1], c || "gold"); }); }
  function dollar(g, cx, cy) { [[0, -2], [1, -2], [-1, -1], [0, -1], [0, 0], [1, 0], [1, 1], [-1, 2], [0, 2], [0, -3], [0, 3]].forEach(function (p) { g.set(cx + p[0], cy + p[1], "gold"); }); }

  // raccoon crew member: codes sampled from geometry in a 26 x 29 unit box at k px per unit
  var CODE_CACHE = {};
  function raccoonCodes(k, look) {
    var key = k + ":" + look;
    if (CODE_CACHE[key]) return CODE_CACHE[key];
    var W = Math.floor(26 * k), H = Math.floor(29 * k), g = [], x, y, px, py, i;
    for (py = 0; py < H; py++) { g.push([]); for (px = 0; px < W; px++) g[py].push("."); }
    function el(x, y, cx, cy, rx, ry) { return ((x - cx) / rx) * ((x - cx) / rx) + ((y - cy) / ry) * ((y - cy) / ry) <= 1; }
    function ci(x, y, cx, cy, r) { return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r; }
    for (i = 0; i < 14; i++) {
      var t = i / 13, tx = 18.5 + 5.5 * t, ty = 25 - 13 * t + 3 * t * t;
      for (py = 0; py < H; py++) for (px = 0; px < W; px++) if (ci((px + 0.5) / k, (py + 0.5) / k, tx, ty, 2.5)) g[py][px] = ((i >> 1) % 2) ? "t" : "T";
    }
    for (py = 0; py < H; py++) for (px = 0; px < W; px++) {
      x = (px + 0.5) / k; y = (py + 0.5) / k;
      var c = null;
      if (el(x, y, 12, 22, 6.6, 6.2)) c = "f";
      if (el(x, y, 8.6, 27.6, 2.4, 1.3) || el(x, y, 15.4, 27.6, 2.4, 1.3)) c = "d";
      [5.2, 18.8].forEach(function (ex) { if (ci(x, y, ex, 4.6, 2.7)) c = "f"; if (ci(x, y, ex, 4.9, 1.3)) c = "p"; });
      if (el(x, y, 12, 11, 8.6, 6.8) || ci(x, y, 4.6, 13, 3.3) || ci(x, y, 19.4, 13, 3.3)) {
        c = "f";
        if (ci(x, y, 4.6, 13.4, 2.6) || ci(x, y, 19.4, 13.4, 2.6)) c = "l";
        if (el(x, y, 8.4, 10.6, 3.5, 2.3) || el(x, y, 15.6, 10.6, 3.5, 2.3) || (Math.abs(x - 12) < 1.6 && y > 9.2 && y < 11.6)) c = "m";
        if (el(x, y, 12, 14.3, 3.6, 2.5)) c = "l";
        if (el(x, y, 12, 13.1, 1.3, 0.9)) c = "k";
        [8.8, 15.2].forEach(function (ex) { if (ci(x, y, ex, 10.4, 1.25)) c = "w"; if (ci(x, y, ex + 0.55 * look, 10.6, 0.7)) c = "k"; });
      }
      if (el(x, y, 12, 6.0, 6.4, 3.8) && y < 7.8) c = "c";
      if (y >= 6.6 && y < 7.9 && el(x, y, 12, 7.2, 7.0, 1.4)) c = "C";
      if (el(x, y, 12, 2.9, 1.5, 1.2)) c = "C";
      if (el(x, y, 12, 23.2, 5.2, 4.3)) c = "s";
      if (el(x, y, 12, 18.9, 1.6, 1.0)) c = "S";
      [7.4, 16.6].forEach(function (hx) { if (ci(x, y, hx, 20.6, 1.6)) c = "d"; });
      if (c) g[py][px] = c;
    }
    for (py = 0; py < H; py++) for (px = 0; px < W; px++) {
      x = (px + 0.5) / k; y = (py + 0.5) / k;
      if (g[py][px] === "f" && x > 16.2 && y > 6) g[py][px] = "d";
      if (g[py][px] === "s" && x > 14.6) g[py][px] = "S";
    }
    var out = g.map(function (r) { return r.slice(); });
    for (py = 0; py < H; py++) for (px = 0; px < W; px++) if (g[py][px] === ".") {
      for (i = 0; i < 4; i++) {
        var a = px + [1, -1, 0, 0][i], b = py + [0, 0, 1, -1][i];
        if (a >= 0 && b >= 0 && a < W && b < H && g[b][a] !== ".") { out[py][px] = "o"; break; }
      }
    }
    return (CODE_CACHE[key] = out.map(function (r) { return r.join(""); }));
  }
  function raccoon(g, x0, y0, k, t, opts) {
    t = t || traits("heist"); opts = opts || {};
    var rows = raccoonCodes(k, t.look), cap = CAPS[t.cap], fur = FURS[t.fur];
    var map = { o: "ol", f: fur[0], l: fur[1], d: fur[2], m: "mask", w: "eyeW", k: "ink", p: "ear", c: cap[0], C: cap[1], s: "sack", S: "sackD", t: "tail", T: fur[0] };
    if (opts.dim) map = { o: "ol", f: 0x3a434d, l: 0x4a545f, d: 0x2e353e, m: 0x15191f, w: 0x4a545f, k: 0x15191f, p: 0x3a434d, c: 0x262c38, C: 0x2e3546, s: 0x3d3628, S: 0x2f291e, t: 0x23272f, T: 0x3a434d };
    var W = rows[0].length;
    for (var j = 0; j < rows.length; j++) for (var i = 0; i < W; i++) {
      var ch = rows[j][opts.mirror ? W - 1 - i : i], col = map[ch];
      if (col != null) g.set(x0 + i, y0 + j, col);
    }
    if (!opts.dim && k >= 0.9) dollar(g, x0 + (opts.mirror ? W - 1 - Math.round(12 * k) : Math.round(12 * k)), y0 + Math.round(23.4 * k));
    return { w: W, h: rows.length };
  }

  // the vault room: lasers (phase animates), door, crew
  function scene(g, opts) {
    opts = opts || {};
    var W = g.w, H = g.h, fy = H - 12, phase = opts.phase || 0, crew = opts.crew || [];
    wall(g, 10);
    var dr = Math.round(H * 0.36), dx = W - dr - 4, dy = Math.round(H * 0.46);
    vaultDoor(g, dx, dy, dr);
    var lx = Math.round(W * 0.45);
    emitter(g, lx, Math.round(H * 0.3)); emitter(g, lx, Math.round(H * 0.7));
    laser(g, lx, Math.round(H * 0.3), W, Math.round(H * 0.78), (phase % 40) < 34);
    laser(g, lx, Math.round(H * 0.7), W, Math.round(H * 0.22), ((phase + 13) % 40) < 34);
    laser(g, lx + 40, 0, W, Math.round(H * 0.52), ((phase + 26) % 40) < 34);
    floor(g, fy, 5);
    var rope = Math.round(lx + (W - lx) * 0.3), bob = opts.still ? 0 : Math.round(Math.sin(phase / 7) * 2);
    for (var y = 0; y < 10 + bob; y++) { g.set(rope, y, "rope"); g.set(rope + 1, y, "ropeD"); }
    var hang = raccoon(g, rope - 13, 8 + bob, 1, crew[0] || traits("hang"));
    var spots = [lx + 6, Math.round(lx + (W - lx) * 0.52)];
    for (var i = 0; i < spots.length; i++) raccoon(g, spots[i], fy + 1 - 29, 1, crew[i + 1] || traits("crew" + i), { mirror: i === 1 });
    [[0.62, 1], [0.66, 0], [0.84, 1], [0.88, 0], [0.93, 1], [0.97, 0]].forEach(function (c) { coin(g, Math.round(W * c[0]), fy - 6 + c[1] * 2, c[1]); });
    if (!opts.still && phase % 10 < 5) sparkle(g, Math.round(W * 0.64), fy - 12);
    if (opts.hud) {                       // logo + live board painted on the wall
      var hs = W >= 300 ? 4 : 3, hx = 10, hy = 10;
      text(g, "HEIST", hx, hy, hs, "red", "ol");
      hy += hs * 5 + 9;
      opts.hud.forEach(function (r) {
        text(g, r[0], hx, hy, 1, "dim");
        hy += 7;
        text(g, r[1], hx, hy, 2, r[2] || "white", "ol");
        hy += 16;
      });
    }
    return { door: [dx, dy, dr], hang: hang };
  }

  // og / share card (240 x 126; x5 = 1200 x 630)
  function card(g, lines, opts) {
    opts = opts || {};
    wall(g, 10);
    vaultDoor(g, 196, 58, 40);
    emitter(g, 120, 34); emitter(g, 120, 86);
    laser(g, 120, 34, 240, 96); laser(g, 120, 86, 240, 22);
    floor(g, 112, 5);
    if (opts.hero) raccoon(g, 140, 112 - 58, 2, opts.hero);
    else raccoon(g, 150, 112 - 29, 1, traits("a")), raccoon(g, 186, 112 - 29, 1, traits("b"), { mirror: true });
    coin(g, 128, 104, 1); coin(g, 136, 106, 0); coin(g, 222, 104, 1); coin(g, 230, 106, 0);
    var y = opts.top || 16;
    lines.forEach(function (ln) {
      var x = 12;
      ln.segs.forEach(function (sg) { text(g, sg[0], x, y, ln.sc, sg[1] || "white", "ol"); x += sg[0].length * 4 * ln.sc; });
      y += ln.sc * 5 + (ln.gap == null ? ln.sc * 2 + 2 : ln.gap);
    });
  }

  var api = { PAL: PAL, CAPS: CAPS, FURS: FURS, Grid: Grid, hash: hash, traits: traits, wall: wall, floor: floor, vaultDoor: vaultDoor,
    laser: laser, emitter: emitter, coin: coin, sparkle: sparkle, raccoon: raccoon, raccoonCodes: raccoonCodes, scene: scene, card: card,
    text: text, textW: textW, F3: F3 };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.PX = api;
})(this);
