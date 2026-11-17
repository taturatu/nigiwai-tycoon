'use strict';
/* にぎわい商店街タイクーン v2 - ゲームロジック（おちゃ自作）
   絵・音・フォント・UI素材・演出ライブラリは外部素材を使用（クレジット画面参照） */

// ---------- データ ----------
const SHOPS = [
  // エリア1：商店街
  { d:0, id:'coffee', name:'コーヒースタンド', icon:'2615', cost:15, batch:3, cycle:3, flavor:'常連のおじいちゃんが、店先で将棋を指し始めた。' },
  { d:0, id:'bread', name:'パン屋さん', icon:'1f950', cost:100, batch:10, cycle:3, flavor:'焼きたての匂いで、通学路の寄り道率が上がった。' },
  { d:0, id:'ramen', name:'ラーメン屋', icon:'1f35c', cost:550, batch:36, cycle:4, flavor:'大将の「いらっしゃい！」が商店街中に響く。' },
  { d:0, id:'sushi', name:'お寿司屋さん', icon:'1f363', cost:3600, batch:110, cycle:4, flavor:'今日の本マグロは、職人さんが自慢げに3回紹介した。' },
  { d:0, id:'cake', name:'ケーキ屋さん', icon:'1f370', cost:17000, batch:400, cycle:5, flavor:'ショーケースの前で子どもが5分固まっている。' },
  { d:0, id:'burger', name:'バーガーショップ', icon:'1f354', cost:85000, batch:1500, cycle:5, flavor:'ポテトの匂いで、隣の店にもお客さんが流れていく。' },
  { d:0, id:'pizza', name:'ピザ屋さん', icon:'1f355', cost:420000, batch:5600, cycle:5, flavor:'窯の炎が見える席が、いつも取り合いになる。' },
  { d:0, id:'ice', name:'アイス屋さん', icon:'1f366', cost:2100000, batch:21000, cycle:6, flavor:'新作「商店街ミルク味」が地味にバズっている。' },
  { d:0, id:'flower', name:'お花屋さん', icon:'1f490', cost:11000000, batch:90000, cycle:6, flavor:'記念日を忘れた人の駆け込み寺になっている。' },
  { d:0, id:'books', name:'本屋さん', icon:'1f4da', cost:55000000, batch:380000, cycle:6, flavor:'店長おすすめコーナーの本は、だいたい名作。' },
  { d:0, id:'cinema', name:'映画館', icon:'1f3ac', cost:280000000, batch:1700000, cycle:7, flavor:'ポップコーンの匂いが2ブロック先まで届く。' },
  { d:0, id:'park', name:'遊園地', icon:'1f3a1', cost:1400000000, batch:7600000, cycle:7, flavor:'観覧車のてっぺんから、自分の街が全部見える。' },
  // エリア2：にぎわいタウン
  { d:1, id:'takoyaki', name:'たこ焼き屋台', icon:'1f419', cost:3000000, batch:26000, cycle:5, flavor:'ソースの匂いで、通りすがりの人が全員振り返る。' },
  { d:1, id:'donut', name:'ドーナツ屋さん', icon:'1f369', cost:12000000, batch:95000, cycle:5, flavor:'穴から向こうを覗くのが、子どもたちの儀式。' },
  { d:1, id:'tapioca', name:'タピオカ屋さん', icon:'1f9cb', cost:48000000, batch:340000, cycle:5, flavor:'行列の最後尾に「最後尾」札を持つバイトがいる。' },
  { d:1, id:'toy', name:'おもちゃ屋さん', icon:'1f9f8', cost:190000000, batch:1200000, cycle:6, flavor:'店内の試遊台が、大人にも大人気で困っている。' },
  { d:1, id:'gamecenter', name:'ゲームセンター', icon:'1f3ae', cost:750000000, batch:4300000, cycle:6, flavor:'音量は大きめ。熱気はもっと大きめ。' },
  { d:1, id:'pet', name:'ペットショップ', icon:'1f436', cost:3000000000, batch:15000000, cycle:6, flavor:'看板犬が寝ている時間は、入場制限がかかる人気ぶり。' },
  { d:1, id:'aquarium', name:'水族館', icon:'1f420', cost:12000000000, batch:55000000, cycle:7, flavor:'ペンギンの散歩時間に、街の全員が集まる。' },
  { d:1, id:'hotel', name:'ホテル', icon:'1f3e8', cost:48000000000, batch:200000000, cycle:7, flavor:'最上階の展望風呂から、商店街の灯りが見える。' },
  { d:1, id:'onsen', name:'温泉旅館', icon:'2668', cost:190000000000, batch:720000000, cycle:7, flavor:'湯上がりの牛乳瓶が、毎日きれいに空になる。' },
  { d:1, id:'castle', name:'お城レストラン', icon:'1f3f0', cost:750000000000, batch:2600000000, cycle:8, flavor:'なぜか甲冑の店員さんが、注文を完璧に覚えている。' },
  { d:1, id:'stadium', name:'スタジアム', icon:'1f3df', cost:3000000000000, batch:9500000000, cycle:8, flavor:'試合の日は、街じゅうが応援モードになる。' },
  { d:1, id:'space', name:'宇宙センター', icon:'1f680', cost:12000000000000, batch:35000000000, cycle:8, flavor:'ロケットの打ち上げ日は、学校も会社もざわつく。' },
  // エリア3：ゆめタウン
  { d:2, id:'mooncafe', name:'月夜カフェ', icon:'1f319', cost:48000000000000, batch:130000000000, cycle:5, flavor:'満月の夜は、テラス席が取り合いになる。' },
  { d:2, id:'planetarium', name:'星空プラネタリウム', icon:'2728', cost:192000000000000, batch:481000000000, cycle:5, flavor:'流れ星の時間は、館内がどよめく。' },
  { d:2, id:'miraidept', name:'未来デパート', icon:'1f6cd', cost:768000000000000, batch:1780000000000, cycle:5, flavor:'エレベーターガールの制服が、毎年ちょっと未来風になる。' },
  { d:2, id:'skygarden', name:'空中庭園', icon:'1f33f', cost:3070000000000000, batch:6590000000000, cycle:6, flavor:'屋上庭園のバラが、市の花に選ばれた。' },
  { d:2, id:'cloverland', name:'クローバーパーク', icon:'1f340', cost:12300000000000000, batch:24400000000000, cycle:6, flavor:'四つ葉を見つけた人には、店長からプレゼント。' },
  { d:2, id:'partyhall', name:'パーティー会場', icon:'1f389', cost:49200000000000000, batch:90200000000000, cycle:6, flavor:'週末の予約は、3ヶ月先まで埋まっている。' },
  { d:2, id:'festival', name:'祭り広場', icon:'1f973', cost:197000000000000000, batch:334000000000000, cycle:7, flavor:'毎日がお祭り。太鼓の音が街のBGM。' },
  { d:2, id:'moneybank', name:'夢銀行', icon:'1f4b0', cost:787000000000000000, batch:1230000000000000, cycle:7, flavor:'子ども向けの「夢貯金」が、地味に大人気。' },
  { d:2, id:'office', name:'空中オフィス', icon:'1f3e2', cost:3150000000000000000, batch:4570000000000000, cycle:7, flavor:'最上階の社食からの眺めが、社員の自慢。' },
  { d:2, id:'skypower', name:'太陽の丘発電所', icon:'2600', cost:12600000000000000000, batch:16900000000000000, cycle:8, flavor:'街の電気は、ぜんぶこの丘から来ている。' },
  { d:2, id:'trophy', name:'チャンピオンアリーナ', icon:'1f3c6', cost:50300000000000000000, batch:62600000000000000, cycle:8, flavor:'優勝トロフィーを掲げた瞬間、街中が沸いた。' },
  { d:2, id:'smileland', name:'にこにこランド', icon:'1f600', cost:201000000000000000000, batch:232000000000000000, cycle:8, flavor:'入園した瞬間、みんな笑顔になる不思議な遊園地。' },
];
const UPGRADES = [
  { id:'tap', name:'呼び込みの声', icon:'26a1', desc:'タップの収入が2倍になる', baseCost:50, growth:3.2 },
  { id:'ad', name:'チラシ宣伝', icon:'1f4c8', desc:'すべての生産が +30%', baseCost:400, growth:4 },
  { id:'staff', name:'自動回収スタッフ', icon:'1f465', desc:'生産の10%を自動で回収してくれる（Lv10で100%）', baseCost:900, growth:3.6, max:10 },
  { id:'crit', name:'カリスマ店員', icon:'1f31f', desc:'クリティカル率が +3% される（最大Lv5）', baseCost:1500, growth:4.5, max:5 },
  { id:'row', name:'行列マスター', icon:'1f525', desc:'フィーバーゲージが +30% たまりやすくなる（最大Lv5）', baseCost:1200, growth:3.8, max:5 },
  { id:'chest', name:'宝箱ハンター', icon:'1f381', desc:'宝箱の出現間隔が短くなる（最大Lv5）', baseCost:2500, growth:4.2, max:5 },
  { id:'quest', name:'クエスト名人', icon:'1f4ac', desc:'クエストのごほうびが +50%（最大Lv5）', baseCost:3000, growth:4.2, max:5 },
  { id:'vault', name:'大きな金庫', icon:'1f4b0', desc:'売上ストックの上限が +50% される（最大Lv5）', baseCost:2000, growth:3.8, max:5 },
  { id:'night', name:'24時間営業', icon:'1f319', desc:'おかえり報酬の上限時間が +4時間される（最大Lv5で28時間）', baseCost:5000, growth:4.0, max:5 },
  { id:'sns', name:'SNSバズ', icon:'1f389', desc:'呼び込みタップでたまにバズる！10秒間 生産2倍（確率2%/Lv・最大Lv5）', baseCost:6000, growth:4.2, max:5 },
];
const RANKS = [
  { at:0, name:'駆け出し店長' }, { at:500, name:'住宅街の人気者' }, { at:5000, name:'商店街の星' },
  { at:50000, name:'街の名物店長' }, { at:500000, name:'市の誇り' }, { at:5000000, name:'地方のスター経営者' },
  { at:50000000, name:'全国区タイクーン' }, { at:500000000, name:'経済界の巨人' },
  { at:5000000000, name:'伝説の大富豪' }, { at:50000000000, name:'商店街の神様' },
];
const QUEST_POOL = [
  { type:'tap', target:50, label:'呼び込みタップ 50 回' },
  { type:'collect', target:5, label:'お店の売上を 5 回回収' },
  { type:'build', target:1, label:'新しいお店を 1 軒建てる' },
  { type:'tap', target:200, label:'呼び込みタップ 200 回' },
  { type:'collectCoins', target:5000, label:'回収で 5,000 コイン集める' },
  { type:'crit', target:3, label:'クリティカルを 3 回出す' },
  { type:'upgrade', target:3, label:'強化を 3 回買う' },
  { type:'collect', target:20, label:'お店の売上を 20 回回収' },
  { type:'chest', target:1, label:'宝箱を 1 個あける' },
  { type:'fever', target:1, label:'フィーバーを 1 回起こす' },
  { type:'gacha', target:2, label:'ラッキーガチャを 2 回回す' },
  { type:'build', target:3, label:'新しいお店を 3 軒建てる' },
];
const SPEECHES = [
  'ここのコーヒー、ほんと好き', 'また来ちゃった…', 'お祭りみたいな街だね！',
  '友達にも教えなきゃ', '今日は散財する日！', '行列すごいけど並ぶ価値ある',
  'この街、住みたい…', 'おつかい頼まれたのに自分の分も買った', '給料日だから多めに買う！',
  '店長さん、いつもありがとう', 'SNSで見て来ました！', 'ついつい寄っちゃうんだよね',
];
const D2_UNLOCK_AT = 2000000;
const D3_UNLOCK_AT = 30000000000000;

// ---------- 状態 ----------
const SAVE_KEY = 'ochaTycoonSaveV2';
const SAVE_BACKUP_KEY = 'ochaTycoonSaveV2_backup'; // メインセーブが壊れた時の復旧用（v21）
let saveRecovered = false;
let S = null;
function defaultState() {
  return {
    coins: 0, runEarned: 0, lifetimeEarned: 0, rank: 0, stars: 0,
    lv: {}, stock: {}, ups: { tap: 0, ad: 0, staff: 0, crit: 0 },
    stats: { taps: 0, collects: 0, collectCoins: 0, builds: 0, upgrades: 0, crits: 0, chests: 0, gachas: 0, fevers: 0, quests: 0, maxCombo: 0 },
    questIdx: 0, questBase: 0, fever: 0, feverUntil: 0, rushUntil: 0, nextRushAt: Date.now() + 80000,
    buffUntil: 0, buffMult: 1, buffKind: '', gachaReadyAt: 0, sound: true, lastSaved: Date.now(),
    daily: { last: '', streak: 0 }, ach: {},
  };
}
function load() {
  S = defaultState();
  // メインセーブが壊れて読めない場合は、前回保存時のバックアップから復旧する。
  // 旧仕様はパース失敗で黙って新規開始になり、育てた街が丸ごと消えていた（v21）
  let loaded = false;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) { const d = JSON.parse(raw); if (d && typeof d === 'object') { S = Object.assign(defaultState(), d); loaded = true; } }
  } catch (e) {}
  if (!loaded) {
    try {
      const bak = localStorage.getItem(SAVE_BACKUP_KEY);
      if (bak) { const d = JSON.parse(bak); if (d && typeof d === 'object') { S = Object.assign(defaultState(), d); saveRecovered = true; } }
    } catch (e) {}
  }
  SHOPS.forEach(s => {
    if (typeof S.lv[s.id] !== 'number' || !isFinite(S.lv[s.id]) || S.lv[s.id] < 0) S.lv[s.id] = 0;
    if (typeof S.stock[s.id] !== 'number' || !isFinite(S.stock[s.id]) || S.stock[s.id] < 0) S.stock[s.id] = 0;
  });
  if (!S.daily || typeof S.daily !== 'object') S.daily = { last: '', streak: 0 };
  if (!S.ach || typeof S.ach !== 'object') S.ach = {};
  // 旧セーブに新設の強化キーが無くても壊れないように補正
  if (!S.ups || typeof S.ups !== 'object') S.ups = {};
  UPGRADES.forEach(u => { if (typeof S.ups[u.id] !== 'number') S.ups[u.id] = 0; });
  // 統計も同様に補正（欠けたキーを ++ すると NaN になって実績・クエストが壊れるため）
  if (!S.stats || typeof S.stats !== 'object') S.stats = defaultState().stats;
  ['taps','collects','collectCoins','builds','upgrades','crits','chests','gachas','fevers','quests','maxCombo'].forEach(k => {
    if (typeof S.stats[k] !== 'number' || !isFinite(S.stats[k])) S.stats[k] = 0;
  });
  ['coins','runEarned','lifetimeEarned','stars','fever'].forEach(k => {
    if (typeof S[k] !== 'number' || !isFinite(S[k]) || S[k] < 0) S[k] = 0;
  });
  // クエスト・タイマー系も同様に補正（questIdx が NaN だと questNow() が undefined を返し表示が壊れるため・v20）
  ['questIdx','questBase','gachaReadyAt','feverUntil','rushUntil','buffUntil','lastSaved'].forEach(k => {
    if (typeof S[k] !== 'number' || !isFinite(S[k]) || S[k] < 0) S[k] = 0;
  });
  S.questIdx = Math.floor(S.questIdx);
  if (typeof S.buffMult !== 'number' || !isFinite(S.buffMult) || S.buffMult < 1) S.buffMult = 1;
  if (typeof S.nextRushAt !== 'number' || !isFinite(S.nextRushAt) || S.nextRushAt <= 0) S.nextRushAt = Date.now() + 80000;
  if (typeof S.daily.streak !== 'number' || !isFinite(S.daily.streak) || S.daily.streak < 0) S.daily.streak = 0;
  if (typeof S.daily.last !== 'string') S.daily.last = '';
}
function save() {
  S.lastSaved = Date.now();
  try {
    // 上書き前のセーブをバックアップへ退避する（次にメインが壊れても1世代前へ戻れる・v21）
    const prev = localStorage.getItem(SAVE_KEY);
    if (prev) localStorage.setItem(SAVE_BACKUP_KEY, prev);
    localStorage.setItem(SAVE_KEY, JSON.stringify(S));
  } catch (e) {}
}

// ---------- 計算 ----------
function prestigeMult() { return 1 + S.stars * 0.5; }
function globalMult() { return Math.pow(1.3, S.ups.ad) * prestigeMult(); }
function isFever() { return Date.now() < S.feverUntil; }
function isRushing() { return Date.now() < S.rushUntil; }
function buffActive() { return Date.now() < S.buffUntil; }
function multProd() {
  return (isFever() ? 5 : 1) * (isRushing() ? 3 : 1) * (buffActive() ? S.buffMult : 1);
}
function batchOf(shop) {
  const lv = S.lv[shop.id];
  if (!lv) return 0;
  return shop.batch * Math.pow(1.6, lv - 1) * globalMult();
}
function rateOf(shop) { return batchOf(shop) / shop.cycle; }
function totalRate() {
  let r = 0;
  SHOPS.forEach(s => { r += rateOf(s); });
  return r * multProd();
}
function stockCap(shop) { return batchOf(shop) * 12 * (1 + 0.5 * (S.ups.vault || 0)); } // 大きな金庫で上限アップ
function buildCost(shop) { return (S.stats.builds === 0 && shop.id === 'coffee') ? 0 : shop.cost; } // 無料は最初の1軒（コーヒースタンド）だけ。旧仕様は「未建設なら全店0円」で、初手に遊園地(14億)をタダで建てられる抜け穴があった（v13で修正）
function shopUpCostAt(shop, lv) { return Math.ceil(shop.cost * 0.6 * Math.pow(1.75, lv - 1)); }
function shopUpCost(shop) { return shopUpCostAt(shop, S.lv[shop.id]); }
function shopUpCost10(shop) {
  let sum = 0; const lv0 = S.lv[shop.id];
  for (let i = 0; i < 10; i++) sum += shopUpCostAt(shop, lv0 + i);
  return sum;
}
// 今のコインで買える分だけ（最大10Lv）の {count, cost}。ボタンの表示と実際の購入を一致させるため
function shopUpAffordable(shop) {
  let count = 0, cost = 0; const lv0 = S.lv[shop.id];
  while (count < 10) {
    const c = shopUpCostAt(shop, lv0 + count);
    if (S.coins - cost < c) break;
    cost += c; count++;
  }
  return { count, cost };
}
// 残り時間の目安表示（目標バナー・満タン予測で共用）
function fmtEta(sec) {
  if (!isFinite(sec) || sec <= 0) return '';
  if (sec < 60) return 'あと約' + Math.ceil(sec) + '秒';
  if (sec < 3600) return 'あと約' + Math.ceil(sec / 60) + '分';
  return 'あと約' + (Math.round(sec / 360) / 10) + '時間';
}
function upCost(up) { return Math.ceil(up.baseCost * Math.pow(up.growth, S.ups[up.id])); }
function autoRate() { return Math.min(1, S.ups.staff * 0.1); }
let combo = 0, lastTapAt = 0, feverBoostReadyAt = 0, lastEmptyTapAt = 0, gachaCdSeen = null;
const affordState = {}; let affordInit = false; // 「建てられるようになった」お知らせ用（セーブには保存しない）
function comboMult() { return 1 + Math.min(combo, 100) * 0.02; }
function critRate() { return 0.07 + (S.ups.crit || 0) * 0.03; }
function tapPower() {
  const built = SHOPS.filter(s => S.lv[s.id] > 0).length;
  return Math.pow(2, S.ups.tap) * globalMult() * multProd() * comboMult() * (1 + built * 0.05) * 2;
}
function rankOf(total) { let r = 0; RANKS.forEach((rk, i) => { if (total >= rk.at) r = i; }); return r; }
function d2Unlocked() { return S.lifetimeEarned >= D2_UNLOCK_AT || S.stars >= 1; }
function d3Unlocked() { return S.lifetimeEarned >= D3_UNLOCK_AT || S.stars >= 1; }
function districtLocked() { return (district === 1 && !d2Unlocked()) || (district === 2 && !d3Unlocked()); }
function refreshLockOverlay() {
  const locked = districtLocked();
  $('lockOverlay').classList.toggle('hidden', !locked);
  if (!locked) return;
  const need = district === 2 ? D3_UNLOCK_AT : D2_UNLOCK_AT;
  const dname = district === 2 ? 'ゆめタウン' : 'にぎわいタウン';
  $('lockTitle').textContent = '🔒 ' + dname + 'はまだ先';
  $('lockText').innerHTML = '条件：今までの総収入 ' + fmt(need) + ' コイン<br>現在 ' + fmt(S.lifetimeEarned) + ' コイン（あと ' + fmt(Math.max(0, need - S.lifetimeEarned)) + '）<br>稼いで、' + dname + '進出を目指そう！';
}
function prestigeNeed() { return 10000000 * Math.pow(100, S.stars); }

function fmt(n) {
  if (!isFinite(n)) return '∞';
  n = Math.floor(n);
  if (n < 10000) return n.toLocaleString('ja-JP');
  const units = [[1e16, '京'], [1e12, '兆'], [1e8, '億'], [1e4, '万']];
  for (const [v, u] of units) {
    if (n >= v) { const x = n / v; return (x >= 100 ? Math.floor(x) : Math.round(x * 10) / 10).toLocaleString('ja-JP') + u; }
  }
  return String(n);
}

// ---------- サウンド（外部素材 Kenney .ogg） ----------
const SFX = {};
['click','buy','confirm','error','open','collect','drop','gacha','crit','jingle_rank','jingle_mission','jingle_rush'].forEach(name => {
  const a = new Audio('sfx/' + name + '.ogg'); a.preload = 'auto'; SFX[name] = a;
});
let lastClickAt = 0;
function play(name, vol, pitch) {
  if (!S.sound) return;
  const base = SFX[name]; if (!base) return;
  if (name === 'click' && Date.now() - lastClickAt < 55) return;
  if (name === 'click') lastClickAt = Date.now();
  try {
    const a = base.cloneNode();
    a.volume = typeof vol === 'number' ? vol : 0.85;
    a.playbackRate = pitch || (0.94 + Math.random() * 0.14);
    const p = a.play(); if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}

// ---------- 演出 ----------
const CONFETTI_OK = (() => {
  try { if (typeof confetti !== 'function') return false; const c = document.createElement('canvas'); return !!c.getContext('2d'); }
  catch (e) { return false; }
})();
function fireConfetti(opts) {
  if (!CONFETTI_OK) return;
  try { confetti(Object.assign({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: ['#ffd93b','#ff9d2e','#37d67a','#4a90d9','#ff5e8a'] }, opts || {})); } catch (e) {}
}
function bigCelebration() {
  fireConfetti({ particleCount: 70, angle: 60, origin: { x: 0, y: 0.7 } });
  fireConfetti({ particleCount: 70, angle: 120, origin: { x: 1, y: 0.7 } });
  setTimeout(() => fireConfetti({ particleCount: 90, spread: 100, origin: { y: 0.4 } }), 200);
  if (window.gsap) gsap.fromTo('#flash', { opacity: 0.6 }, { opacity: 0, duration: 0.5, ease: 'power2.out' });
}
function shake(power) {
  if (!window.gsap) return;
  // 変形を残さない（残った transform は fixed 要素の基準を壊すため clearProps する）
  gsap.fromTo('#app', { x: -power }, { x: 0, duration: 0.4, ease: 'elastic.out(1,0.3)', clearProps: 'transform' });
}
// モーダルはキュー制（お祝いが重なっても順番に表示）
const modalQueue = [];
function showModal(icon, title, text, btn) {
  if (!document.getElementById('modal').classList.contains('hidden') || modalQueue.length > 5) {
    if (modalQueue.length <= 5) modalQueue.push([icon, title, text, btn]);
    return;
  }
  showModalNow(icon, title, text, btn);
}
function showModalNow(icon, title, text, btn) {
  const em = document.getElementById('modalEmoji');
  if (icon === '1f4c5') {
    // デイリーボーナスは自作CSSカレンダーで実際の日付を表示（絵文字だと JUL 17 と出てしまうため）
    const d = new Date();
    em.innerHTML = '<div class="cal-card"><div class="cal-head">' + (d.getMonth() + 1) + '月</div><div class="cal-day">' + d.getDate() + '</div></div>';
  } else {
    em.innerHTML = '<img id="modalImg" src="img/twemoji/' + icon + '.svg" alt="">';
  }
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalText').textContent = text;
  const b = document.getElementById('modalBtn');
  b.textContent = btn || 'やったー！'; b.disabled = false;
  document.getElementById('modal').classList.remove('hidden');
  if (window.gsap) gsap.fromTo('#modalCard', { scale: 0.6, rotation: -3, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.45, ease: 'back.out(2.2)' });
}
function nextModal() {
  document.getElementById('modal').classList.add('hidden');
  if (modalQueue.length) { const a = modalQueue.shift(); setTimeout(() => showModalNow(a[0], a[1], a[2], a[3]), 180); }
}
// 画面上部の小さなお知らせ（実績など、操作を止めない表示）
let toastTimer = null;
function toast(text, retry) {
  // モーダル表示中はモーダルと重なって読みにくいため、閉じるまで少し待ってから出す（v17）
  const modalOpen = !document.getElementById('modal').classList.contains('hidden');
  if (modalOpen && (retry || 0) < 15) { setTimeout(() => toast(text, (retry || 0) + 1), 1200); return; }
  const el = $('toast');
  el.textContent = text;
  el.classList.remove('hidden');
  if (window.gsap) gsap.fromTo(el, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'back.out(2)' });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3400);
}
function floatNumAt(clientX, clientY, text, crit) {
  const el = document.createElement('div');
  el.className = 'float-num' + (crit ? ' crit' : '');
  el.textContent = text;
  el.style.position = 'fixed'; el.style.zIndex = '96';
  // 画面端の店やタップボタンでは長い文字（CRITICAL!等）が右端で切れていたため、
  // 表示位置を画面内に収まるようクランプする（v18）
  const maxX = Math.max(8, (window.innerWidth || 360) - (crit ? 215 : 155));
  const cx = Math.max(8, Math.min(clientX, maxX));
  el.style.left = cx + 'px'; el.style.top = Math.max(4, clientY) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1150); // 低FPSでgsapが進まなくても残り続けないフォールバック（v18）
  if (window.gsap) gsap.to(el, { y: -80 - Math.random() * 25, x: (Math.random() - 0.5) * 44, opacity: 0, duration: 0.95, ease: 'power1.out', onComplete: () => el.remove() });
  else setTimeout(() => el.remove(), 900);
}
function flyCoins(fromEl, count) {
  if (!window.gsap || !fromEl) return;
  const target = document.getElementById('coinIcon').getBoundingClientRect();
  const from = fromEl.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const img = document.createElement('img');
    img.src = 'img/twemoji/1f4b0.svg'; img.className = 'fly-coin';
    img.style.left = (from.left + from.width / 2 + (Math.random() - 0.5) * 30) + 'px';
    img.style.top = (from.top + 6) + 'px';
    document.body.appendChild(img);
    gsap.to(img, { left: target.left + 8, top: target.top + 8, scale: 0.55, duration: 0.55 + i * 0.06, delay: i * 0.05, ease: 'power1.in', onComplete: () => img.remove() });
  }
}
function addFever(n, silent) {
  if (isFever()) return;
  S.fever = Math.min(100, S.fever + n * (1 + 0.3 * (S.ups.row || 0))); // 行列マスターで上昇率アップ
  if (S.fever >= 100) startFever(silent);
}
function startFever(silent) {
  S.fever = 0;
  S.feverUntil = Date.now() + 15000;
  S.stats.fevers++;
  play('jingle_rush'); synth('fanfare'); buzz([40, 40, 80]); bigCelebration();
  // silent のときは呼び出し側が既に結果モーダルを出しているので重複モーダルを出さない
  if (!silent) showModal('1f525', 'FEVER TIME!!', '15秒間、すべての収入が 5倍！\n画面が光ってる間に、回収とタップで稼ぎまくれ！');
  checkQuest();
}

function upEffectText(up) {
  const lv = S.ups[up.id] || 0;
  switch (up.id) {
    case 'tap': return '現在：タップ収入 ×' + fmt(Math.pow(2, lv));
    case 'ad': return '現在：全生産 +' + Math.round((Math.pow(1.3, lv) - 1) * 100) + '%';
    case 'staff': return '現在：生産の ' + Math.round(autoRate() * 100) + '% を自動回収';
    case 'crit': return '現在：クリティカル率 ' + Math.round(critRate() * 100) + '%';
    case 'row': return '現在：フィーバーが +' + (lv * 30) + '% たまりやすい';
    case 'chest': return '現在：宝箱の出現間隔が約 ' + Math.round(Math.pow(0.8, lv) * 100) + '% に短縮';
    case 'quest': return '現在：クエスト報酬 +' + (lv * 50) + '%';
    case 'vault': return '現在：ストック上限 +' + (lv * 50) + '%';
    case 'night': return '現在：おかえり報酬は最大 ' + (8 + 4 * lv) + ' 時間ぶん';
    case 'sns': return '現在：バズ確率 ' + (lv * 2) + '%（10秒間 生産2倍）';
    default: return '';
  }
}

// ---------- 収入・クエスト ----------
function earn(amount, silent) {
  if (!(amount > 0)) return;
  S.coins += amount; S.runEarned += amount; S.lifetimeEarned += amount;
  const r = rankOf(S.lifetimeEarned);
  if (r > S.rank) {
    S.rank = r;
    if (!silent) {
      // ランクアップはモーダルで止めず、トースト＋紙吹雪でテンポよく祝う
      play('jingle_rank'); synth('fanfare'); bigCelebration();
      toast('🏆 ランクアップ！ 新しい称号「' + RANKS[r].name + '」');
    }
  }
  checkQuest();
}
function questNow() { return QUEST_POOL[S.questIdx % QUEST_POOL.length]; }
function questStat(q) {
  switch (q.type) {
    case 'tap': return S.stats.taps; case 'collect': return S.stats.collects;
    case 'collectCoins': return S.stats.collectCoins; case 'build': return S.stats.builds;
    case 'upgrade': return S.stats.upgrades; case 'crit': return S.stats.crits;
    case 'chest': return S.stats.chests; case 'fever': return S.stats.fevers;
    case 'gacha': return S.stats.gachas; default: return 0;
  }
}
function questProgress() { return questStat(questNow()) - S.questBase; }
function questRewardCoins() { return Math.max(120, Math.round((totalRate() / Math.max(1, multProd()) * 50 + tapPower() * 12) * Math.pow(1.5, S.ups.quest || 0))); }
let questBusy = false;
function checkQuest() {
  if (questBusy) return;
  const q = questNow();
  if (questProgress() >= q.target) {
    questBusy = true;
    const reward = questRewardCoins();
    setTimeout(() => {
      earn(reward, true); // ランク判定を通すため earn 経由（questBusy 中なので再入しても安全）
      play('jingle_mission'); synth('fanfare'); fireConfetti({ particleCount: 70, spread: 90, origin: { y: 0.5 } });
      toast('📜 クエスト達成！「' + q.label + '」 ごほうび +' + fmt(reward));
      S.stats.quests = (S.stats.quests || 0) + 1;
      S.questIdx++;
      S.questBase = questStat(questNow());
      questBusy = false; save(); refreshAll();
    }, 60);
  }
}

// ---------- 実績 ----------
function countBuilt() { return SHOPS.filter(s => S.lv[s.id] > 0).length; }
function maxLv() { return SHOPS.reduce((m, s) => Math.max(m, S.lv[s.id]), 0); }
const ACHIEVEMENTS = [
  { id: 'first', icon: '🔨', name: 'はじめの一軒', desc: 'お店を1軒建てる', now: () => S.stats.builds, target: 1 },
  { id: 'build10', icon: '🏘️', name: '商店街らしくなってきた', desc: 'お店を10軒建てる', now: () => countBuilt(), target: 10 },
  { id: 'alld1', icon: '🌸', name: '商店街コンプリート', desc: '商店街エリアの全12軒を建てる', now: () => SHOPS.filter(s => s.d === 0 && S.lv[s.id] > 0).length, target: 12 },
  { id: 'alld2', icon: '🌃', name: 'タウンコンプリート', desc: 'にぎわいタウンの全12軒を建てる', now: () => SHOPS.filter(s => s.d === 1 && S.lv[s.id] > 0).length, target: 12 },
  { id: 'alld3', icon: '🚀', name: 'ゆめタウンコンプリート', desc: 'ゆめタウンの全12軒を建てる', now: () => SHOPS.filter(s => s.d === 2 && S.lv[s.id] > 0).length, target: 12 },
  { id: 'lv10', icon: '👑', name: '人気店オーナー', desc: 'どれかのお店をLv.10にする', now: () => maxLv(), target: 10 },
  { id: 'lv25', icon: '💎', name: '伝説の名店', desc: 'どれかのお店をLv.25にする', now: () => maxLv(), target: 25 },
  { id: 'life6', icon: '💰', name: '総収入100万', desc: '今までの総収入100万コイン', now: () => S.lifetimeEarned, target: 1000000 },
  { id: 'life8', icon: '💴', name: '総収入1億', desc: '今までの総収入1億コイン', now: () => S.lifetimeEarned, target: 100000000 },
  { id: 'life10', icon: '🤑', name: '総収入100億', desc: '今までの総収入100億コイン', now: () => S.lifetimeEarned, target: 10000000000 },
  { id: 'tap1000', icon: '👆', name: '呼び込みの達人', desc: '呼び込みタップ1,000回', now: () => S.stats.taps, target: 1000 },
  { id: 'col100', icon: '🧾', name: '回収マスター', desc: '売上回収100回', now: () => S.stats.collects, target: 100 },
  { id: 'gacha10', icon: '🎰', name: 'ガチャ常連', desc: 'ラッキーガチャ10回', now: () => S.stats.gachas, target: 10 },
  { id: 'fever1', icon: '🎇', name: 'フィーバー初体験', desc: 'フィーバーを1回起こす', now: () => S.stats.fevers, target: 1 },
  { id: 'fever10', icon: '🔥', name: '熱狂の街', desc: 'フィーバー10回', now: () => S.stats.fevers, target: 10 },
  { id: 'chest5', icon: '🎁', name: '宝探し名人', desc: '宝箱を5個あける', now: () => S.stats.chests, target: 5 },
  { id: 'star1', icon: '⭐', name: '生まれ変わった街', desc: 'リニューアル（転生）1回', now: () => S.stars, target: 1 },
  { id: 'gacha30', icon: '🃏', name: 'ガチャマスター', desc: 'ラッキーガチャ30回', now: () => S.stats.gachas, target: 30 },
  { id: 'chest10', icon: '💰', name: 'お宝ハンター', desc: '宝箱を10個あける', now: () => S.stats.chests, target: 10 },
  { id: 'life12', icon: '🏦', name: '総収入1兆', desc: '今までの総収入1兆コイン', now: () => S.lifetimeEarned, target: 1000000000000 },
  { id: 'tap10000', icon: '⚡', name: '呼び込みの神', desc: '呼び込みタップ10,000回', now: () => S.stats.taps, target: 10000 },
  { id: 'lv50', icon: '🌟', name: '超人気店', desc: 'どれかのお店をLv.50にする', now: () => maxLv(), target: 50 },
  { id: 'lv100', icon: '🏆', name: '神がかりの名店', desc: 'どれかのお店をLv.100にする', now: () => maxLv(), target: 100 },
  { id: 'life14', icon: '💳', name: '総収入100兆', desc: '今までの総収入100兆コイン', now: () => S.lifetimeEarned, target: 100000000000000 },
  { id: 'life16', icon: '🏛️', name: '総収入10京', desc: '今までの総収入10京コイン', now: () => S.lifetimeEarned, target: 10000000000000000 },
  { id: 'gacha100', icon: '🎪', name: 'ガチャの帝王', desc: 'ラッキーガチャ100回', now: () => S.stats.gachas, target: 100 },
  { id: 'chest30', icon: '📦', name: '伝説の宝探し', desc: '宝箱を30個あける', now: () => S.stats.chests, target: 30 },
  { id: 'fever30', icon: '🌋', name: '街は熱狂の渦', desc: 'フィーバー30回', now: () => S.stats.fevers, target: 30 },
  { id: 'quest1', icon: '📜', name: 'クエスト初達成', desc: 'クエストを1回達成する', now: () => S.stats.quests || 0, target: 1 },
  { id: 'quest30', icon: '📜', name: 'クエストマスター', desc: 'クエストを30回達成する', now: () => S.stats.quests || 0, target: 30 },
  { id: 'all24', icon: '🌆', name: '夢の完成形', desc: '全36軒のお店を建てる', now: () => countBuilt(), target: 36 },
  { id: 'up10', icon: '⚡', name: '強化マニア', desc: '全体強化を10回買う', now: () => S.stats.upgrades, target: 10 },
  { id: 'col1000', icon: '💰', name: '回収の神様', desc: '売上回収を1,000回する', now: () => S.stats.collects, target: 1000 },
  { id: 'combo25', icon: '💨', name: 'ノリノリ連打', desc: '呼び込みを25連打する', now: () => S.stats.maxCombo || 0, target: 25 },
  { id: 'combo100', icon: '🌪️', name: '連打の嵐', desc: '呼び込みを100連打する', now: () => S.stats.maxCombo || 0, target: 100 },
];
function checkAch() {
  ACHIEVEMENTS.forEach(a => {
    if (S.ach[a.id]) return;
    if (a.now() >= a.target) {
      S.ach[a.id] = 1;
      const reward = Math.max(300, questRewardCoins() * 3);
      earn(reward, true); // 直接加算だとランク判定を通らないため earn 経由にする（表示は実績トーストが担当）
      play('jingle_mission');
      toast('🏅 実績「' + a.name + '」達成！ ごほうび +' + fmt(reward));
      if (bottomTab === 'ach') buildList();
      save();
    }
  });
}

// ---------- 自作シンセ効果音（WebAudio生成） ----------
let AC = null;
function audioCtx() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(f0, f1, dur, type, vol, delay) {
  const ac = audioCtx(); if (!ac || !S.sound) return;
  const t = ac.currentTime + (delay || 0);
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(ac.destination);
  o.start(t); o.stop(t + dur + 0.05);
}
function synth(kind) {
  if (!S.sound) return;
  if (kind === 'tap') tone(500 + Math.random() * 120, 760, 0.07, 'triangle', 0.05);
  else if (kind === 'collect') { tone(660, 660, 0.08, 'sine', 0.1); tone(880, 880, 0.09, 'sine', 0.1, 0.06); tone(1320, 1320, 0.13, 'sine', 0.11, 0.12); }
  else if (kind === 'crit') { tone(880, 1760, 0.16, 'square', 0.06); tone(1320, 1980, 0.2, 'sine', 0.1, 0.05); }
  else if (kind === 'build') { tone(392, 392, 0.09, 'triangle', 0.12); tone(523, 523, 0.09, 'triangle', 0.12, 0.08); tone(659, 659, 0.14, 'triangle', 0.13, 0.16); }
  else if (kind === 'lvup') { [392, 494, 587, 784, 988].forEach((f, i) => tone(f, f * 1.01, 0.13, 'triangle', 0.13, i * 0.07)); }
  else if (kind === 'fanfare') { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.16, 'triangle', 0.12, i * 0.09)); }
}
function buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

// ---------- DOM ----------
const $ = id => document.getElementById(id);
let district = 0, bottomTab = 'upgrades', selectedId = null;
const plotRefs = {};

// ---------- 3D連携（three3d.js：Three.js＋Kenney 3Dモデルの外部素材） ----------
let USE3D = false;
function mapPosOf(shopId) {
  if (USE3D && window.T3D) { const p = T3D.project(shopId); if (p) return p; }
  return null;
}
// 2DのDOM要素の代わりに、3D上の座標を返す疑似要素（回収演出・吹き出し用）
function makeProxyEl(shop) {
  const el = {
    getBoundingClientRect() {
      const p = mapPosOf(shop.id);
      if (p) return { left: p.clientX - 30, top: p.clientY - 40, width: 60, height: 60, right: p.clientX + 30, bottom: p.clientY + 20, x: p.clientX - 30, y: p.clientY - 40 };
      const m = $('map').getBoundingClientRect();
      return { left: m.left + m.width / 2 - 30, top: m.top + 60, width: 60, height: 60, right: m.left + m.width / 2 + 30, bottom: m.top + 120, x: m.left, y: m.top };
    },
  };
  Object.defineProperty(el, 'offsetLeft', { get() { const p = mapPosOf(shop.id); return p ? p.mapX : 110; } });
  Object.defineProperty(el, 'offsetTop', { get() { const p = mapPosOf(shop.id); return p ? p.mapY : 110; } });
  return el;
}
function onPlotTap3D(shopId) {
  const shop = shopById(shopId);
  if (!shop) return;
  selectedId = shop.id;
  if (window.T3D) T3D.highlight(shop.id);
  if (S.lv[shop.id] > 0) collectShop(shop, plotRefs[shop.id] && plotRefs[shop.id].el);
  else buildShop(shop, plotRefs[shop.id] && plotRefs[shop.id].el);
  refreshDetail();
}

function shopById(id) { return SHOPS.find(s => s.id === id); }
function cheapestUnbuilt(d) {
  const list = SHOPS.filter(s => s.d === d && S.lv[s.id] === 0);
  if (!list.length) return null;
  return list.reduce((a, b) => (a.cost <= b.cost ? a : b));
}

function buildPlots() {
  // --- 3Dモード：建物は three3d.js が外部3Dモデルで描く ---
  if (USE3D && window.T3D) {
    Object.keys(plotRefs).forEach(k => delete plotRefs[k]);
    const shops = SHOPS.filter(s => s.d === district);
    shops.forEach(shop => { plotRefs[shop.id] = { el: makeProxyEl(shop), fill: null, num: null, price: null }; });
    // 空き地ラベルは「次に建てる最安の店」1つだけに出す。
    // v17で「買える店」まで広げたら、隣り合う2軒（パン屋とラーメン屋等）のラベルが
    // 3D投影で重なって両方読めなくなったため、1軒に絞り切る（v18）。
    // 最安の店が買える状態なら他の店もタップで詳細が見えるので実用上の問題はない。
    T3D.buildDistrict(shops, s => S.lv[s.id] > 0, s => {
      const next = cheapestUnbuilt(district);
      if (!next || next.id !== s.id) return '';
      return buildCost(s) === 0 ? '初回無料！' : fmt(buildCost(s)) + ' コイン';
    });
    if (selectedId) T3D.highlight(selectedId);
    refreshLockOverlay();
    return;
  }
  const wrap = $('plots');
  wrap.innerHTML = '';
  Object.keys(plotRefs).forEach(k => delete plotRefs[k]);
  const next = cheapestUnbuilt(district);
  SHOPS.filter(s => s.d === district).forEach(shop => {
    const lv = S.lv[shop.id];
    const el = document.createElement('div');
    if (lv > 0) {
      el.className = 'plot built' + (lv >= 10 ? ' gold' : '');
      el.innerHTML =
        '<span class="shop-lv">Lv.' + lv + '</span>' +
        '<img class="shop-icon" src="img/twemoji/' + shop.icon + '.svg" alt="">' +
        '<div class="shop-name">' + shop.name + '</div>' +
        '<div class="stock-bar"><div class="stock-fill"></div></div>' +
        '<div class="stock-num">0</div>';
      el.addEventListener('click', () => { selectedId = shop.id; collectShop(shop, el); refreshDetail(); });
    } else {
      el.className = 'plot empty';
      el.innerHTML =
        (next && next.id === shop.id ? '<img class="next-arrow" src="img/ui/arrow_down.png" alt="">' : '') +
        '<img class="pad-icon" src="img/twemoji/' + shop.icon + '.svg" alt="">' +
        '<div class="pad-price">' + (buildCost(shop) === 0 ? '初回無料！' : fmt(buildCost(shop))) + '</div>' +
        '<div style="font-size:9px;font-weight:800;color:#667;">' + shop.name + '</div>';
      el.addEventListener('click', () => { selectedId = shop.id; buildShop(shop, el); refreshDetail(); });
    }
    wrap.appendChild(el);
    plotRefs[shop.id] = { el, fill: el.querySelector('.stock-fill'), num: el.querySelector('.stock-num'), price: el.querySelector('.pad-price') };
  });
  refreshLockOverlay();
  if (window.gsap) gsap.fromTo('#plots .plot', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, stagger: 0.03, ease: 'back.out(2)', clearProps: 'scale,opacity' });
}

function buildList() {
  const list = $('list');
  list.innerHTML = '';
  if (bottomTab === 'upgrades') {
    UPGRADES.forEach(up => {
      const card = document.createElement('div'); card.className = 'card';
      card.innerHTML =
        '<div class="card-icon"><img src="img/twemoji/' + up.icon + '.svg" alt=""></div>' +
        '<div class="card-main"><div class="card-name">' + up.name + ' <span class="up-lv"></span></div>' +
        '<div class="card-sub">' + up.desc + '</div><div class="card-effect"></div></div>';
      const btn = document.createElement('button');
      btn.className = 'kenney-btn yellow buy-btn'; btn.textContent = '強化';
      btn.addEventListener('click', () => buyUpgrade(up));
      card.appendChild(btn); list.appendChild(card);
      upRefs[up.id] = { btn, lv: card.querySelector('.up-lv'), eff: card.querySelector('.card-effect'), card };
    });
  } else if (bottomTab === 'ach') {
    buildAchList(list);
  } else if (bottomTab === 'zukan') {
    buildZukanList(list);
  } else {
    const box = document.createElement('div'); box.className = 'prestige-big';
    const need = prestigeNeed();
    const can = S.runEarned >= need;
    const pct = Math.min(100, Math.floor(S.runEarned / need * 100));
    box.innerHTML =
      '<div class="star-now">現在の転生スター <img src="img/twemoji/2b50.svg" class="mini-icon"> × ' + S.stars + '（生産 +' + (S.stars * 50) + '%）</div>' +
      '<p>街をリニューアルすると、お店もコインもリセットされる代わりに<br><b>転生スター</b>が1つ増えて、生産が永久に +50% されるよ。<br>' +
      '条件：この街での総収入 ' + fmt(need) + ' コイン（現在 ' + fmt(S.runEarned) + '）</p>' +
      // 進捗バーと残り（数値だけでは遠さが伝わらなかったため・v20）
      '<div class="bar-track"><img class="bar-fill-img" src="img/ui/bar_color.png" alt="" style="width:' + pct + '%"></div>' +
      '<p>進捗 ' + pct + '%' + (can ? '・条件達成！' : '（あと ' + fmt(Math.max(0, need - S.runEarned)) + ' コイン）') + '　次のスターで生産は合計 +' + ((S.stars + 1) * 50) + '% に</p>';
    const btn = document.createElement('button');
    btn.className = 'kenney-btn red big'; btn.textContent = can ? '✨ リニューアルする！' : 'まだ条件を満たしていない';
    btn.disabled = !can;
    btn.addEventListener('click', doPrestige);
    box.appendChild(btn); list.appendChild(box);
  }
}
function buildAchList(list) {
  // 未達成を進捗率の高い順（あと少しの実績が上に来る）、達成済みは後ろに並べる
  const sorted = ACHIEVEMENTS
    .map(a => ({ a, done: !!S.ach[a.id], pct: a.target ? a.now() / a.target : 0 }))
    .sort((x, y) => ((x.done ? 1 : 0) - (y.done ? 1 : 0)) || (y.pct - x.pct));
  sorted.forEach(({ a, done }) => {
    const now = Math.min(a.now(), a.target);
    const pct = Math.min(100, Math.floor(now / a.target * 100));
    const card = document.createElement('div');
    card.className = 'ach-card' + (done ? ' done' : '');
    card.innerHTML =
      '<div class="ach-icon">' + a.icon + '</div>' +
      '<div class="ach-main"><div class="ach-name">' + a.name + '</div>' +
      '<div class="ach-sub">' + a.desc + '</div>' +
      (done ? '' : '<div class="ach-bar"><div class="ach-bar-fill" style="width:' + pct + '%"></div></div>') + '</div>' +
      // 未達成の実績にもごほうび目安を出す（達成時の実額と同式：最大(300, クエスト報酬×3)・v20）
      '<div class="ach-state">' + (done ? '達成！🏅' : fmt(now) + ' / ' + fmt(a.target) + '<br>' + pct + '%<br>ごほうび約+' + fmt(Math.max(300, questRewardCoins() * 3))) + '</div>';
    list.appendChild(card);
  });
}
const upRefs = {};

// ---------- お店図鑑（コレクション画面：自作UI・データはゲーム内） ----------
function buildZukanList(list) {
  [0, 1, 2].forEach(d => {
    const head = document.createElement('div');
    head.className = 'zukan-head';
    // エリア見出しに建設済み軒数を出す（コレクションの進み具合が図鑑を開いた瞬間に分かる・v21）
    const builtInD = SHOPS.filter(s => s.d === d && S.lv[s.id] > 0).length;
    head.textContent = (d === 0 ? '🏘️ 商店街エリア' : d === 1 ? '🌃 にぎわいタウン' : '🚀 ゆめタウン') + '（' + builtInD + '/12）';
    list.appendChild(head);
    const districtLockedNow = (d === 1 && !d2Unlocked()) || (d === 2 && !d3Unlocked());
    SHOPS.filter(s => s.d === d).forEach(shop => {
      const lv = S.lv[shop.id] || 0;
      const card = document.createElement('div');
      card.className = 'ach-card' + (lv > 0 ? ' done' : '');
      card.innerHTML =
        '<img class="zukan-icon' + (lv > 0 ? '' : ' locked') + '" src="img/twemoji/' + shop.icon + '.svg" alt="">' +
        '<div class="ach-main"><div class="ach-name">' + (lv > 0 ? shop.name : '？？？') + (lv > 0 ? ' Lv.' + lv : '') + '</div>' +
        '<div class="ach-sub">' + (lv > 0 ? '「' + shop.flavor + '」' : 'まだ建てられていないお店') + '</div></div>' +
        // 未建設でも「建てるとどれだけ稼げるか」が図鑑で分かるように生産プレビューを出す（v20）
        '<div class="ach-state">' + (lv > 0 ? '開店中<br>+' + fmt(rateOf(shop)) + '/秒' : (districtLockedNow ? '🔒エリア未解放' : (buildCost(shop) === 0 ? '初回無料' : fmt(buildCost(shop))) + '<br>建てると +' + fmt(shop.batch * globalMult() / shop.cycle) + '/秒')) + '</div>';
      // 図鑑のカードをタップすると、その店のエリアへ移動して選択する（図鑑で見た店を
      // そのままマップで回収・強化できるようにする・v21）
      card.classList.add('zukan-card');
      card.addEventListener('click', () => {
        if (districtLockedNow) { play('error'); return; }
        district = d; selectedId = shop.id;
        document.querySelectorAll('.dtab').forEach((b, i) => b.classList.toggle('active', i === d));
        play('open'); buildPlots(); refreshAll();
        try { $('mapWrap').scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
      });
      list.appendChild(card);
    });
  });
}

function refreshDetail() {
  if (USE3D && window.T3D) T3D.highlight(selectedId);
  const shop = selectedId ? shopById(selectedId) : null;
  if (!shop) { $('detailEmpty').classList.remove('hidden'); $('detailMain').classList.add('hidden'); return; }
  $('detailEmpty').classList.add('hidden'); $('detailMain').classList.remove('hidden');
  $('detailIcon').src = 'img/twemoji/' + shop.icon + '.svg';
  const lv = S.lv[shop.id];
  if (lv > 0) {
    $('detailName').textContent = shop.name + ' Lv.' + lv + (lv >= 10 ? ' 👑人気店' : '');
    // ストック進捗バー：数字だけでは満タンまでの近さが直感で分からなかったため（v21）
    const sfEl = $('detailStockFill');
    if (sfEl) { const capF = stockCap(shop); sfEl.style.width = Math.min(100, S.stock[shop.id] / Math.max(1, capF) * 100) + '%'; sfEl.classList.toggle('full', S.stock[shop.id] >= capF * 0.999); }
    const nextMile = [10, 25, 50, 100].find(m => lv < m);
    const mileLine = nextMile ? '<div class="sub-line">🎯 あと ' + (nextMile - lv) + ' Lvで ' + (nextMile === 10 ? '👑人気店に！' : nextMile === 25 ? '💎伝説の名店に！' : nextMile === 50 ? '🌟超人気店に！' : '🏆神がかりの名店に！') + '</div>' : '<div class="sub-line">🏆 Lv.100超えの神店！</div>';
    // 満タンまでの残り時間（実効の貯まり速度＝生産×倍率×手動回収ぶん で予測）
    const capNow = stockCap(shop);
    const fillRate = rateOf(shop) * multProd() * (1 - autoRate());
    const fullLine = S.stock[shop.id] >= capNow * 0.999
      ? '<div class="sub-line">💰 ストック満タン！ 回収で+20%ボーナス</div>'
      : (fillRate > 0 ? '<div class="sub-line">⏳ 満タンまで ' + fmtEta((capNow - S.stock[shop.id]) / fillRate) + '（満タン回収で+20%）</div>' : '');
    // 強化の元が取れる目安：増える生産/秒で強化コストを割る（買う判断の材料が無かったため・v20）
    const upGainRate = rateOf(shop) * 0.6;
    // 増分が1未満の店（序盤のコーヒーは+0.6/秒）では fmt の切り捨てで「+0/秒」になってしまうため小数1桁で出す
    const gainTxt = upGainRate < 10 ? String(Math.round(upGainRate * 10) / 10) : fmt(upGainRate);
    const paybackLine = upGainRate > 0 ? '<div class="sub-line">⬆️ 強化で生産 +' + gainTxt + '/秒（コストは生産増で' + fmtEta(shopUpCost(shop) / upGainRate).replace('あと', '') + 'ぶんが目安）</div>' : '';
    $('detailSub').innerHTML = '<div class="sub-line">売上ストック <b>' + fmt(S.stock[shop.id]) + '</b> / ' + fmt(capNow) + '</div>' +
      '<div class="sub-line">1回 +' + fmt(batchOf(shop)) + '（' + shop.cycle + '秒ごと）・生産 +' + fmt(rateOf(shop)) + '/秒</div>' +
      '<div class="sub-line">次のLvで 1回 +' + fmt(batchOf(shop) * 1.6) + '（+60%）</div>' + paybackLine + fullLine + mileLine;
    const cAmt = Math.floor(S.stock[shop.id]);
    const cFull = S.stock[shop.id] >= capNow * 0.999 && cAmt >= 1;
    const cGrand = cAmt + (cFull ? Math.ceil(cAmt * 0.20) : 0);
    $('collectBtn').innerHTML = cFull ? '回収する<br>+' + fmt(cGrand) + '（満タン+20%）' : '回収する<br>+' + fmt(cAmt);
    $('collectBtn').disabled = S.stock[shop.id] < 1;
    $('collectBtn').classList.toggle('ready-glow', S.stock[shop.id] >= capNow * 0.999); // 満タンなら回収ボタンを光らせる（v17）
    $('upgradeBtn').innerHTML = '強化する<br>' + fmt(shopUpCost(shop));
    $('upgradeBtn').disabled = S.coins < shopUpCost(shop);
    const b10 = $('upgrade10Btn');
    if (b10) {
      // 表示は「今買える分だけ」のLv数と合計に合わせる（旧表示は10Lv全額で、押すと買える分だけ買う食い違いがあった）
      const aff = shopUpAffordable(shop);
      b10.innerHTML = aff.count > 0 ? aff.count + 'Lv強化<br>' + fmt(aff.cost) : '強化<br>コイン不足';
      b10.disabled = aff.count === 0;
    }
  } else {
    $('detailName').textContent = shop.name + '（空き地）';
    const sfEl2 = $('detailStockFill');
    if (sfEl2) { sfEl2.style.width = '0%'; sfEl2.classList.remove('full'); }
    // あとどれくらいで建てられるか（金額だけでは遠さが分からなかったため・v20）
    const bcost = buildCost(shop);
    const progLine = bcost === 0 ? '' : (S.coins >= bcost ? '　|　<b>今建てられる！</b>' : '　|　あと ' + fmt(bcost - S.coins) + ' コイン（' + Math.floor(S.coins / bcost * 100) + '%）');
    $('detailSub').innerHTML = (bcost === 0 ? '建設費 <b>無料（初回だけ！）</b>' : '建設費 ' + fmt(bcost)) + progLine + '　|　建てると ' + shop.cycle + '秒ごとに +' + fmt(shop.batch * globalMult()) + ' の売上がたまる（生産 +' + fmt(shop.batch * globalMult() / shop.cycle) + '/秒）';
    $('collectBtn').textContent = 'まだ建っていない';
    $('collectBtn').disabled = true;
    $('collectBtn').classList.remove('ready-glow');
    $('upgradeBtn').innerHTML = buildCost(shop) === 0 ? '建てる<br>初回無料！' : '建てる<br>' + fmt(buildCost(shop));
    $('upgradeBtn').disabled = S.coins < buildCost(shop);
    const b10e = $('upgrade10Btn');
    if (b10e) { b10e.innerHTML = '10Lv強化<br>開店後に使える'; b10e.disabled = true; }
  }
  $('detailFlavor').textContent = '「' + shop.flavor + '」';
}

function refreshAll() {
  $('coins').textContent = fmt(S.coins);
  // 連続ログイン日数はデイリーモーダルでしか見えなかったため HUD にも常駐表示する（2日目以降・v20）
  $('perSec').textContent = '生産 +' + fmt(totalRate()) + ' / 秒　自動回収 ' + Math.round(autoRate() * 100) + '%' + (S.daily.streak > 1 ? '　🔥' + S.daily.streak + '日連続' : '');
  // コンボの残り時間（1.2秒で途切れる）も見せる。途切れる瞬間が分からず連打が止めどき不明だった（v20）
  if (combo >= 2) {
    const ct = $('comboTime');
    if (ct) ct.textContent = ' あと' + Math.max(0, (1200 - (Date.now() - lastTapAt)) / 1000).toFixed(1) + '秒';
    const cc = $('comboCount'); if (cc) cc.textContent = combo;
    const cm2 = $('comboMultLabel'); if (cm2) cm2.textContent = ' ×' + comboMult().toFixed(2);
  }
  // 称号は常駐表示（ランクアップの瞬間しか見えないのはもったいないため）
  const rn = $('rankName');
  if (rn) rn.textContent = RANKS[S.rank].name;
  $('tapValue').textContent = '+' + fmt(tapPower());
  $('starCount').textContent = S.stars;
  // フィーバー表示（FEVER中はボタンも「FEVER中！」にしないと「あと0」のままになる）
  if (isFever()) {
    $('feverLabel').textContent = 'FEVER中！ あと ' + Math.ceil((S.feverUntil - Date.now()) / 1000) + '秒';
    $('feverFill').style.width = Math.max(0, (S.feverUntil - Date.now()) / 150) + '%';
    $('feverBtnText').innerHTML = 'FEVER中！<br>🔥開催中';
  } else {
    $('feverLabel').textContent = 'FEVERゲージ';
    $('feverFill').style.width = S.fever + '%';
    $('feverBtnText').innerHTML = Date.now() < feverBoostReadyAt
      ? 'おやすみ中<br>あと' + Math.ceil((feverBoostReadyAt - Date.now()) / 1000) + '秒'
      : 'フィーバー+10<br>ゲージあと' + Math.ceil(100 - S.fever);
  }
  const buffs = [];
  if (isRushing()) buffs.push('行列×3 あと' + Math.max(0, Math.ceil((S.rushUntil - Date.now()) / 1000)) + '秒'); // 残り秒数も出す（いつ終わるか分からないと回収の判断ができないため・v21）
  else if (S.nextRushAt) buffs.push('行列 あと' + Math.max(0, Math.ceil((S.nextRushAt - Date.now()) / 1000)) + '秒'); // 次の行列イベント予告
  if (buffActive()) buffs.push((S.buffKind === 'buzz' ? 'バズ×' : 'ガチャ×') + S.buffMult + ' あと' + Math.max(0, Math.ceil((S.buffUntil - Date.now()) / 1000)) + '秒');
  $('buffLabel').textContent = buffs.join(' ');
  document.body.classList.toggle('fever', isFever());
  // 目標バナー（序盤はチュートリアル風ヒントを優先）
  const ca = $('collectAllBtn');
  const ts = totalStock();
  const hitShops = SHOPS.filter(s => Math.floor(S.stock[s.id] || 0) >= 1).length;
  // 満タンの店がある時はボタンにも出して回収を促す（満タン中は生産が止まる＝損なため・v18）
  const fullShops = SHOPS.filter(s => S.lv[s.id] > 0 && stockCap(s) > 0 && (S.stock[s.id] || 0) >= stockCap(s) * 0.999).length;
  // ボーナス見込み（まとめ+10%・満タン+20%）を押す前に見せる。計算は collectAll と揃える（v19）
  let pvFullBonus = 0;
  SHOPS.forEach(s => { const a = Math.floor(S.stock[s.id] || 0); if (a > 0 && S.lv[s.id] > 0 && a >= stockCap(s) * 0.999) pvFullBonus += Math.ceil(a * 0.20); });
  const pvBonus = (hitShops >= 2 ? Math.ceil(ts * 0.10) : 0) + pvFullBonus;
  ca.innerHTML = '💰 まとめて回収（' + hitShops + '軒） +' + fmt(ts) + (pvBonus > 0 ? ' ボーナス+' + fmt(pvBonus) + '！' : '') + (fullShops ? ' 🔔満タン' + fullShops + '軒！' : '');
  ca.disabled = ts < 1;
  // 光るしきい値は進行度連動：固定500だと序盤（ストック上限36等）では永遠に光らなかった（v17）
  const capTotal = SHOPS.reduce((t, s) => t + (S.lv[s.id] > 0 ? stockCap(s) : 0), 0);
  ca.classList.toggle('ready-glow', ts >= Math.max(10, Math.min(500, capTotal * 0.5)));
  [0, 1, 2].forEach(d => {
    const el = $('dCount' + d);
    if (el) el.textContent = ' ' + SHOPS.filter(s => s.d === d && S.lv[s.id] > 0).length + '/12';
  });
  const achLeft = ACHIEVEMENTS.filter(a => !S.ach[a.id]).length;
  $('achBadge').textContent = achLeft ? '(' + (ACHIEVEMENTS.length - achLeft) + '/' + ACHIEVEMENTS.length + ')' : '👑';
  let goal = cheapestUnbuilt(0) || cheapestUnbuilt(1) || cheapestUnbuilt(2);
  if (S.stats.builds === 0) {
    $('goalText').textContent = '👆 光る看板タップで開店！（初回は無料）';
    $('goalFill').style.width = '100%';
  } else if (S.stats.collects === 0) {
    $('goalText').textContent = '👆 お店をタップして売上を回収しよう！';
    $('goalFill').style.width = '60%';
  } else if (goal) {
    // 次の目標が未解放エリアの場合は、建てられない目標を見せても詰まるだけなので
    // 解放条件（総収入）の進捗を表示する
    const lockedD = (goal.d === 1 && !d2Unlocked()) ? 1 : (goal.d === 2 && !d3Unlocked()) ? 2 : 0;
    if (lockedD) {
      const need = lockedD === 2 ? D3_UNLOCK_AT : D2_UNLOCK_AT;
      const dname = lockedD === 2 ? 'ゆめタウン' : 'にぎわいタウン';
      $('goalText').textContent = '🔒 ' + dname + '解放まで あと ' + fmt(Math.max(0, need - S.lifetimeEarned));
      $('goalFill').style.width = Math.min(100, S.lifetimeEarned / need * 100) + '%';
    } else {
      // 購入までの目安時間（生産レートで予測。ストックを回収すれば即建てられる場合も知らせる）
      const gCost = buildCost(goal);
      let eta = '';
      if (gCost > 0 && S.coins < gCost) {
        const have = S.coins + totalStock();
        if (have >= gCost) eta = '（回収すれば建てられる！）';
        else { const r = totalRate(); if (r > 0) eta = '（' + fmtEta((gCost - have) / r) + '）'; }
      }
      $('goalText').textContent = 'つぎの目標：' + goal.name + ' ' + (gCost === 0 ? '初回無料！' : fmt(gCost)) + eta;
      $('goalFill').style.width = (gCost === 0 ? 100 : Math.min(100, S.coins / gCost * 100)) + '%';
    }
  } else { $('goalText').textContent = '全店制覇！あとは強化と転生で限界突破だ'; $('goalFill').style.width = '100%'; }
  $('d2lock').textContent = d2Unlocked() ? '' : '🔒';
  $('d3lock').textContent = d3Unlocked() ? '' : '🔒';
  // 建てられるようになったお店のお知らせ（買えない→買えるに変わった瞬間だけ）
  // 同時に複数店が買えるようになった場合、トーストは表示を上書きし合って最後の1件しか
  // 見えなかった（パン屋とラーメン屋が同時に買える場面でラーメン屋だけ表示された）。
  // 1回の更新では「一番安い＝次の目標の店」1件だけ知らせる（v20）
  let affordToastShop = null;
  SHOPS.forEach(shop => {
    if (S.lv[shop.id] > 0) { affordState[shop.id] = true; return; }
    if ((shop.d === 1 && !d2Unlocked()) || (shop.d === 2 && !d3Unlocked())) return;
    const af = buildCost(shop) > 0 && S.coins >= buildCost(shop);
    if (affordInit && af && affordState[shop.id] === false && (!affordToastShop || shop.cost < affordToastShop.cost)) affordToastShop = shop;
    affordState[shop.id] = af;
  });
  if (affordToastShop) { toast('🛒 ' + affordToastShop.name + ' が建てられるよ！マップの看板をタップ'); play('open'); }
  affordInit = true;
  // プロット側の数値（3Dは three3d へ同期、2DはDOM更新）
  SHOPS.forEach(shop => {
    if (USE3D && window.T3D && shop.d === district) {
      if (S.lv[shop.id] > 0) {
        const cap3 = stockCap(shop);
        T3D.setStock(shop.id, S.stock[shop.id] / Math.max(1, cap3), S.stock[shop.id] >= cap3 * 0.99);
        if (T3D.setLevel) T3D.setLevel(shop.id, S.lv[shop.id]); // レベルで建物が育つ
      } else {
        T3D.setAfford(shop.id, S.coins >= buildCost(shop));
        // 空き地ラベルは所持金の変化に追随させる（対象は次の最安店1軒だけ・v18で絞り切り）
        if (T3D.setLabel) {
          const nextU = cheapestUnbuilt(district);
          const showL = !!nextU && nextU.id === shop.id;
          T3D.setLabel(shop.id, shop.name, showL ? (buildCost(shop) === 0 ? '初回無料！' : fmt(buildCost(shop)) + ' コイン') : '');
        }
      }
    }
    const ref = plotRefs[shop.id]; if (!ref) return;
    const lv = S.lv[shop.id];
    if (lv > 0 && ref.fill) {
      const cap = stockCap(shop);
      ref.fill.style.width = Math.min(100, S.stock[shop.id] / cap * 100) + '%';
      ref.num.textContent = '💰' + fmt(S.stock[shop.id]);
      ref.el.classList.toggle('full', S.stock[shop.id] >= cap * 0.99);
    } else if (lv === 0 && ref.price) {
      ref.el.classList.toggle('afford', S.coins >= buildCost(shop));
    }
  });
  // クエスト
  const q = questNow();
  const prog = Math.min(questProgress(), q.target);
  $('questText').textContent = q.label + '（' + fmt(prog) + ' / ' + fmt(q.target) + (q.target ? '・' + Math.floor(prog / q.target * 100) + '%' : '') + (prog < q.target ? '・あと' + fmt(q.target - prog) : '') + '）';
  $('questReward').textContent = 'ごほうび +' + fmt(questRewardCoins());
  $('questFill').style.width = (q.target ? prog / q.target * 100 : 100) + '%';
  // 全体強化ボタン
  if (bottomTab === 'upgrades') {
    UPGRADES.forEach(up => {
      const ref = upRefs[up.id]; if (!ref) return;
      ref.lv.textContent = 'Lv.' + S.ups[up.id];
      if (ref.eff) ref.eff.textContent = upEffectText(up);
      const maxed = up.max && S.ups[up.id] >= up.max;
      ref.btn.innerHTML = maxed ? 'MAX' : '強化<br>' + fmt(upCost(up));
      ref.btn.disabled = maxed || S.coins < upCost(up);
      // 買える強化はカードごと金枠で光らせて、買えないものと一目で区別できるようにする（v20）
      if (ref.card) ref.card.classList.toggle('afford', !maxed && S.coins >= upCost(up));
    });
  }
  // ガチャ
  const cd = Math.max(0, Math.ceil((S.gachaReadyAt - Date.now()) / 1000));
  $('gachaCd').textContent = cd > 0 ? 'あと ' + cd + ' 秒' : 'まわせる！';
  $('gachaBtn').disabled = cd > 0;
  // ガチャが回せるようになった瞬間だけ知らせる（起動直後の初期表示では鳴らさない・v19）
  if (gachaCdSeen === null) gachaCdSeen = cd > 0;
  else if (gachaCdSeen && cd === 0) { gachaCdSeen = false; toast('🎰 ラッキーガチャが回せるよ！'); play('open'); }
  else if (cd > 0) gachaCdSeen = true;
  // 全体強化タブの「買える強化あり」バッジ（v19）
  const upBadge = $('upBadge');
  if (upBadge) {
    const affordUps = UPGRADES.filter(u => !(u.max && S.ups[u.id] >= u.max) && S.coins >= upCost(u)).length;
    upBadge.textContent = affordUps > 0 && bottomTab !== 'upgrades' ? '✨' + affordUps : '';
  }
  refreshDetail();
}

// ---------- アクション ----------
function buildShop(shop, el) {
  if (S.lv[shop.id] > 0) return;
  if ((shop.d === 1 && !d2Unlocked()) || (shop.d === 2 && !d3Unlocked())) { play('error'); return; }
  if (S.coins < buildCost(shop)) {
    play('error');
    if (window.gsap && el) gsap.fromTo(el, { x: -5 }, { x: 0, duration: 0.3, ease: 'elastic.out(1,0.3)' });
    return;
  }
  S.coins -= buildCost(shop);
  S.lv[shop.id] = 1; S.stock[shop.id] = 0;
  S.stats.builds++;
  play('drop'); setTimeout(() => play('confirm'), 120);
  synth('build'); buzz(25);
  addFever(8);
  if (USE3D && window.T3D) T3D.refreshShop(shop, true, true); else buildPlots();
  const ref = plotRefs[shop.id];
  if (ref && window.gsap && !USE3D) gsap.fromTo(ref.el, { scale: 0.3, y: -16 }, { scale: 1, y: 0, duration: 0.55, ease: 'bounce.out', clearProps: 'scale' });
  fireConfetti({ particleCount: 30, spread: 60, startVelocity: 24, origin: { y: 0.45 } });
  if (el) { const r = el.getBoundingClientRect(); floatNumAt(r.left + r.width / 2 - 40, r.top - 8, shop.name + ' OPEN!', false); }
  checkQuest(); save(); refreshAll();
}
function collectShop(shop, el) {
  const amount = Math.floor(S.stock[shop.id]);
  if (amount < 1) {
    if (window.gsap && el && !USE3D) gsap.fromTo(el, { scale: 0.94 }, { scale: 1, duration: 0.2, clearProps: 'scale' });
    // 3Dでも「無反応」に見えないよう、たまっていない時は理由をフロート表示（連打時は1.5秒に1回まで）
    if (el && Date.now() - lastEmptyTapAt > 1500) {
      lastEmptyTapAt = Date.now();
      const r = el.getBoundingClientRect();
      floatNumAt(r.left + 10, r.top - 10, 'まだ売上がたまってないよ', false);
      play('click', 0.4);
    }
    return;
  }
  // 満タン回収ボーナス：ストック満タンで回収すると+20%（満タンまで待つ楽しみ＝変動報酬の強化・v18）
  const fullBonus = S.stock[shop.id] >= stockCap(shop) * 0.999 ? Math.ceil(amount * 0.20) : 0;
  const grand = amount + fullBonus;
  S.stock[shop.id] = 0;
  S.stats.collects++; S.stats.collectCoins += grand;
  earn(grand);
  play('collect', 0.9);
  synth('collect'); buzz(12);
  if (fullBonus > 0) { play('confirm'); fireConfetti({ particleCount: 30, spread: 65, origin: { y: 0.45 } }); }
  addFever(Math.min(10, 2 + amount / Math.max(1, batchOf(shop)) * 2));
  flyCoins(el, Math.min(6, 2 + Math.floor(amount / Math.max(1, batchOf(shop)))));
  if (el) { const r = el.getBoundingClientRect(); floatNumAt(r.left + 10, r.top - 10, '+' + fmt(grand) + (fullBonus ? ' 満タン!' : ''), grand >= batchOf(shop) * 8); }
  checkQuest(); save(); refreshAll(); // 個別回収だけ save が無く他アクションと不揃いだった（即時保存に統一・v18）
}
// 全店まとめて回収
function totalStock() { return SHOPS.reduce((t, s) => t + Math.floor(S.stock[s.id] || 0), 0); }
function collectAll() {
  let total = 0, shopsHit = 0, fullBonus = 0, fullCount = 0;
  SHOPS.forEach(shop => {
    const a = Math.floor(S.stock[shop.id]);
    if (a > 0) {
      // 満タンの店は1軒ごとに+20%（個別回収の満タンボーナスと条件を揃える・v18）
      if (S.lv[shop.id] > 0 && a >= stockCap(shop) * 0.999) { fullBonus += Math.ceil(a * 0.20); fullCount++; }
      S.stock[shop.id] = 0; total += a; shopsHit++;
    }
  });
  if (total < 1) { play('error'); return; }
  // まとめ回収ボーナス：2軒以上を一気に回収すると合計の10%を上乗せ（変動報酬の強化・v17）
  const bonus = shopsHit >= 2 ? Math.ceil(total * 0.10) : 0;
  const grand = total + bonus + fullBonus;
  S.stats.collects += shopsHit; S.stats.collectCoins += grand;
  earn(grand);
  play('collect', 1); synth('collect'); buzz(20);
  addFever(Math.min(14, 2 + shopsHit));
  const m = $('map').getBoundingClientRect();
  flyCoins({ getBoundingClientRect: () => ({ left: m.left + m.width / 2 - 20, top: m.top + m.height / 2, width: 40, height: 20 }) }, 8);
  const bonusParts = [];
  if (bonus) bonusParts.push('まとめ+' + fmt(bonus));
  if (fullBonus) bonusParts.push('満タン' + fullCount + '軒+' + fmt(fullBonus));
  floatNumAt(m.left + m.width / 2 - 50, m.top + 30, 'まとめて +' + fmt(grand) + (bonusParts.length ? '（' + bonusParts.join('・') + '！）' : ''), grand > 100000);
  if (grand > 100000 || shopsHit >= 3) { synth('fanfare'); fireConfetti({ particleCount: 50, spread: 90, origin: { y: 0.4 } }); }
  else if (bonus > 0 || fullBonus > 0) fireConfetti({ particleCount: 26, spread: 60, origin: { y: 0.45 } });
  checkQuest(); save(); refreshAll();
}
function upgradeSelected() {
  const shop = selectedId ? shopById(selectedId) : null;
  if (!shop) return;
  if (S.lv[shop.id] === 0) { buildShop(shop, plotRefs[shop.id] && plotRefs[shop.id].el); return; }
  const cost = shopUpCost(shop);
  if (S.coins < cost) { play('error'); return; }
  S.coins -= cost; S.lv[shop.id]++; S.stats.upgrades++;
  play('buy'); synth('lvup');
  if (!(USE3D && window.T3D)) buildPlots();
  fireConfetti({ particleCount: 22, spread: 55, origin: { y: 0.5 } });
  if (S.lv[shop.id] === 10) showModal('1f31f', shop.name + ' が人気店に！', 'Lv.10到達で金色の枠をゲット。この店、もう街の顔だね。');
  checkQuest(); save(); refreshAll();
}
function upgradeSelected10() {
  const shop = selectedId ? shopById(selectedId) : null;
  if (!shop || S.lv[shop.id] === 0) { play('error'); return; }
  const before = S.lv[shop.id];
  let bought = 0;
  while (bought < 10) {
    const cost = shopUpCost(shop);
    if (S.coins < cost) break;
    S.coins -= cost; S.lv[shop.id]++; S.stats.upgrades++; bought++;
  }
  if (!bought) { play('error'); return; }
  play('buy'); synth('lvup'); buzz(20);
  if (!(USE3D && window.T3D)) buildPlots();
  fireConfetti({ particleCount: 45, spread: 75, origin: { y: 0.5 } });
  toast('⬆️ ' + shop.name + ' を ' + bought + ' Lvまとめて強化！ Lv.' + S.lv[shop.id] + ' に');
  if (before < 10 && S.lv[shop.id] >= 10) showModal('1f31f', shop.name + ' が人気店に！', 'Lv.10到達で金色の枠をゲット。この店、もう街の顔だね。');
  checkQuest(); save(); refreshAll();
}
function buyUpgrade(up) {
  if (up.max && S.ups[up.id] >= up.max) return;
  const cost = upCost(up);
  if (S.coins < cost) { play('error'); return; }
  S.coins -= cost; S.ups[up.id]++; S.stats.upgrades++;
  play('confirm'); fireConfetti({ particleCount: 28, spread: 60, origin: { y: 0.65 } });
  checkQuest(); save(); refreshAll();
}
function onTap(ev) {
  if (suppressHoldClick) { suppressHoldClick = false; return; } // 長押し後のclickは無視
  const now = Date.now();
  combo = (now - lastTapAt <= 1200) ? combo + 1 : 1;
  lastTapAt = now;
  const crit = Math.random() < critRate();
  let gain = tapPower();
  if (crit) {
    gain *= 10;
    S.stats.crits++;
    play('crit'); synth('crit'); buzz(35); shake(7); addFever(6);
    fireConfetti({ particleCount: 40, spread: 85, origin: { y: 0.55 } });
  } else { play('click', 0.5); synth('tap'); }
  S.stats.taps++;
  earn(gain);
  // SNSバズ：呼び込みタップでたまに10秒間 生産2倍（全体強化「SNSバズ」、ガチャバフ中は上書きしない）
  if ((S.ups.sns || 0) > 0 && !buffActive() && Math.random() < 0.02 * S.ups.sns) {
    S.buffUntil = Date.now() + 10000; S.buffMult = 2; S.buffKind = 'buzz';
    play('confirm'); fireConfetti({ particleCount: 30, spread: 70, origin: { y: 0.5 } });
    toast('📣 SNSでバズった！10秒間 生産2倍！');
  }
  // 連打マイルストーン：25/50/100連打でボーナス＋紙吹雪（ドーパミン用の小さなごほうび）
  S.stats.maxCombo = Math.max(S.stats.maxCombo || 0, combo);
  if (combo === 25 || combo === 50 || combo === 100) {
    const bonus = Math.round(tapPower() * (combo === 100 ? 60 : combo === 50 ? 25 : 10));
    earn(bonus);
    play('jingle_mission'); synth('fanfare');
    fireConfetti({ particleCount: 60, spread: 90, origin: { y: 0.5 } });
    toast('🔥 ' + combo + '連打！ ボーナス +' + fmt(bonus) + ' コイン');
  }
  addFever(1);
  let fx = null, fy = null;
  if (ev && typeof ev.clientX === 'number') { fx = ev.clientX; fy = ev.clientY; }
  else { const r = $('tapBtn').getBoundingClientRect(); fx = r.left + r.width / 2; fy = r.top; }
  floatNumAt(fx - 16, fy - 24, (crit ? 'CRITICAL! +' : '+') + fmt(gain), crit);
  if (window.gsap) gsap.fromTo('#tapBtn', { scale: 0.92 }, { scale: 1, duration: 0.28, ease: 'elastic.out(1.2,0.4)', clearProps: 'scale' });
  $('comboBox').classList.toggle('hidden', combo < 2);
  if (combo >= 2) { $('comboCount').textContent = combo; const cm = $('comboMultLabel'); if (cm) cm.textContent = ' ×' + comboMult().toFixed(2); }
  checkQuest(); refreshAll();
}
function doPrestige() {
  if (S.runEarned < prestigeNeed()) { play('error'); return; }
  S.stars++;
  const keep = { stars: S.stars, stats: S.stats, lifetimeEarned: S.lifetimeEarned, rank: S.rank, sound: S.sound, gachaReadyAt: S.gachaReadyAt, ach: S.ach, daily: S.daily, questIdx: S.questIdx, questBase: S.questBase };
  const fresh = defaultState();
  fresh.stars = keep.stars; fresh.stats = keep.stats; fresh.lifetimeEarned = keep.lifetimeEarned;
  fresh.rank = keep.rank; fresh.sound = keep.sound; fresh.gachaReadyAt = keep.gachaReadyAt;
  // 実績とデイリー連続記録は転生後も保持（旧コードは初期化で消え、実績の再達成で
  // ごほうびの二重取りができ、連続ログインもリセットされていた）
  fresh.ach = keep.ach; fresh.daily = keep.daily;
  // クエストの進行も保持（旧コードは初期化され、貯まった統計ぶん最初のクエストが即達成になっていた）
  fresh.questIdx = keep.questIdx; fresh.questBase = keep.questBase;
  S = fresh;
  SHOPS.forEach(s => { S.lv[s.id] = 0; S.stock[s.id] = 0; });
  selectedId = null; district = 0;
  document.querySelectorAll('.dtab').forEach((b, i) => b.classList.toggle('active', i === 0));
  play('jingle_rank'); bigCelebration();
  showModal('2728', '街が生まれ変わった！', '転生スターを1つ獲得。生産が永久に +50%！\n新しい街でも、また伝説を作ろう。');
  buildPlots(); buildList(); save(); refreshAll();
}

// ---------- 宝箱 ----------
// ガチャ・宝箱の報酬基準：旧来の固定下限30は序盤の生産（1コイン/秒前後）に対して
// 180倍もの大当たりを生み、序盤スキップになっていた。進行度（生産レートかタップ力の
// 大きい方）に連動させ、序盤は嬉しい額・中盤以降は従来通りのスケールにする。
function rewardBase() { return Math.max(totalRate() / Math.max(1, multProd()), tapPower(), 1); }
const chestState = { active: false, el: null, nextAt: Date.now() + 45000, until: 0 };
function spawnChest() {
  const layer = $('chestLayer');
  const img = document.createElement('img');
  img.src = 'img/twemoji/1f381.svg'; img.className = 'chest'; img.alt = '宝箱';
  img.style.left = (12 + Math.random() * 76) + '%';
  img.style.top = (30 + Math.random() * 52) + '%';
  img.addEventListener('click', openChest);
  layer.appendChild(img);
  chestState.active = true; chestState.el = img;
  chestState.until = Date.now() + 12000;
  play('open');
  toast('🎁 宝箱が現れた！タップして開けよう');
}
function removeChest() {
  if (chestState.el) chestState.el.remove();
  chestState.active = false; chestState.el = null;
  chestState.nextAt = Date.now() + (50000 + Math.random() * 50000) * Math.pow(0.8, S.ups.chest || 0);
}
function openChest() {
  if (!chestState.active) return;
  removeChest();
  S.stats.chests++;
  play('jingle_mission');
  const rate = rewardBase();
  const roll = Math.random();
  if (roll < 0.55) {
    const gain = Math.round(rate * (120 + Math.random() * 180));
    earn(gain, true); // 直接加算だとランク判定を通らないため earn 経由（表示は宝箱モーダルが担当）
    bigCelebration();
    showModal('1f381', '宝箱ゲット！', '中からコインがざっくざく！\n+' + fmt(gain) + ' コイン');
  } else if (roll < 0.8) {
    addFever(100);
    showModal('1f381', '宝箱ゲット！', '中身は「やる気スイッチ」だった！\nフィーバーゲージが満タンに！');
  } else {
    S.rushUntil = Date.now() + 30000;
    bigCelebration();
    showModal('1f381', '宝箱ゲット！', '口コミが拡散した！\n30秒間、お客さん行列イベント（生産×3）発生！');
  }
  checkQuest(); save(); refreshAll();
}

// ---------- ガチャ ----------
let gachaSpinning = false;
function spinGacha() {
  if (gachaSpinning || Date.now() < S.gachaReadyAt) { play('error'); return; }
  // 他のモーダルが開いていたら閉じてから回す（表示の取り違え防止）
  document.getElementById('modal').classList.add('hidden');
  modalQueue.length = 0;
  gachaSpinning = true;
  S.gachaReadyAt = Date.now() + 60000;
  S.stats.gachas++;
  play('gacha');
  showModal('1f3b0', 'ラッキーガチャ', '何が出るかな…！\n（大当たり10%・コイン35%・生産2倍25%・フィーバー15%・行列15%）', '…');
  $('modalBtn').disabled = true;
  const icons = SHOPS.map(s => s.icon).concat(['1f4b0', '1f525', '1f340', '1f31f']);
  let spins = 0;
  const iv = setInterval(() => {
    const img = $('modalImg');
    if (img) img.src = 'img/twemoji/' + icons[Math.floor(Math.random() * icons.length)] + '.svg';
    spins++;
    if (spins > 14) {
      clearInterval(iv);
      gachaResult();
      gachaSpinning = false;
      $('modalBtn').disabled = false;
      $('modalBtn').textContent = 'やったー！';
    }
  }, 85);
  checkQuest(); save(); refreshAll();
}
function gachaResult() {
  const rate = rewardBase();
  const roll = Math.random();
  const img = $('modalImg');
  if (roll < 0.10) {
    const gain = Math.round(rate * 600);
    earn(gain, true); // earn 経由（表示はガチャ結果が担当）
    if (img) img.src = 'img/twemoji/1f31f.svg';
    $('modalTitle').textContent = '🎉 大当たり!!';
    $('modalText').textContent = '超ラッキー！コイン大放出\n+' + fmt(gain) + ' コイン';
    play('crit'); bigCelebration(); shake(9);
  } else if (roll < 0.45) {
    const gain = Math.round(rate * 90);
    earn(gain, true); // earn 経由（表示はガチャ結果が担当）
    if (img) img.src = 'img/twemoji/1f4b0.svg';
    $('modalTitle').textContent = 'コインゲット！';
    $('modalText').textContent = '+' + fmt(gain) + ' コイン';
    play('confirm'); fireConfetti({ particleCount: 45, spread: 70 });
  } else if (roll < 0.70) {
    S.buffUntil = Date.now() + 60000; S.buffMult = 2; S.buffKind = 'gacha';
    if (img) img.src = 'img/twemoji/1f4c8.svg';
    $('modalTitle').textContent = '宣伝大成功！';
    $('modalText').textContent = '60秒間、生産が 2倍 になるよ！';
    play('confirm'); fireConfetti({ particleCount: 45, spread: 70 });
  } else if (roll < 0.85) {
    addFever(100, true); // ガチャ結果モーダル自体が説明するため FEVER モーダルは重ねない
    if (img) img.src = 'img/twemoji/1f525.svg';
    $('modalTitle').textContent = '熱気がすごい！';
    $('modalText').textContent = 'フィーバーゲージが満タンになった！';
    play('confirm');
  } else {
    S.rushUntil = Date.now() + 30000;
    if (img) img.src = 'img/twemoji/1f465.svg';
    $('modalTitle').textContent = 'お客さん大行列！';
    $('modalText').textContent = '30秒間、生産が 3倍 になるよ！';
    play('jingle_rush'); fireConfetti({ particleCount: 45, spread: 70 });
  }
  refreshAll();
}

// ---------- 街の賑わい（外部素材：Kenneyタイルの人々・Emotes） ----------
const EMOTES = ['faceHappy','heart','star','cash','music','idea','stars','hearts'];
let lastSpeechShopId = null;
function spawnSpeech() {
  const layer = $('speechLayer');
  // 同時は1つまで：建物が1軒だけの序盤は同じ店に吹き出しが重なって両方読めなかった（v18）
  if (layer.children.length >= 1) return;
  const built = SHOPS.filter(s => s.d === district && S.lv[s.id] > 0);
  if (!built.length) return;
  // 同じ店の連続は避けて、街のあちこちから声が上がるようにする
  let candidates = built.filter(s => s.id !== lastSpeechShopId);
  if (!candidates.length) candidates = built;
  const shop = candidates[Math.floor(Math.random() * candidates.length)];
  lastSpeechShopId = shop.id;
  const ref = plotRefs[shop.id]; if (!ref) return;
  const el = document.createElement('div');
  el.className = 'speech';
  el.innerHTML = '<img src="img/emotes/emote_' + EMOTES[Math.floor(Math.random() * EMOTES.length)] + '.png" alt=""> ' +
    SPEECHES[Math.floor(Math.random() * SPEECHES.length)];
  el.style.left = Math.min(ref.el.offsetLeft, 230) + 'px';
  el.style.top = Math.max(0, ref.el.offsetTop - 16) + 'px';
  layer.appendChild(el);
  setTimeout(() => el.remove(), 3600); // 低FPSでgsapが進まなくても必ず消えるフォールバック（v18）
  if (window.gsap) {
    gsap.fromTo(el, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2.5)' });
    gsap.to(el, { opacity: 0, delay: 3, duration: 0.5, onComplete: () => el.remove() });
  }
}
function spawnWalker() {
  if (USE3D) return; // 3Dでは本物の車モデルが走る
  const road = $('carLayer');
  if (road.children.length > 3) return;
  const fromLeft = Math.random() < 0.5;
  const wrap = document.createElement('div');
  wrap.className = 'car';
  wrap.style.width = '30px'; wrap.style.height = '32px'; wrap.style.bottom = '6px';
  wrap.innerHTML = '<img src="img/kenney/tile_0120.png" style="width:30px;height:30px;display:block;image-rendering:pixelated;">';
  wrap.style.left = fromLeft ? '-26px' : 'calc(100% + 2px)';
  road.appendChild(wrap);
  if (window.gsap) {
    gsap.to(wrap, { x: (fromLeft ? 1 : -1) * ($('map').clientWidth + 60), duration: 7 + Math.random() * 4, ease: 'none', onComplete: () => wrap.remove() });
    gsap.to(wrap, { y: -3, duration: 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  } else setTimeout(() => wrap.remove(), 5000);
}

// ---------- メインループ ----------
let lastTick = Date.now();
function tick() {
  const now = Date.now();
  const rawDt = (now - lastTick) / 1000;
  // バックグラウンドでタイマーが止まっても生産を取りこぼさない：経過ぶんを通す（上限はオフライン報酬と同じ28時間、離席ぶんは90%計算）
  const dt = Math.min(rawDt, 28 * 3600);
  const gapMult = rawDt > 2 ? 0.9 : 1;
  lastTick = now;
  // 生産：自動回収ぶんはコインへ、残りは各店のストックへ
  const mult = multProd();
  let autoTotal = 0, prodTotal = 0;
  SHOPS.forEach(shop => {
    const r = rateOf(shop);
    if (r <= 0) return;
    const prod = r * mult * dt * gapMult;
    prodTotal += prod;
    autoTotal += prod * autoRate();
    const toStock = prod * (1 - autoRate());
    if (toStock > 0) S.stock[shop.id] = S.stock[shop.id] + toStock;
    // 上限は stockCap に一本化（旧コードは金庫ボーナス無しの式で再クランプしており、
    // v9の「大きな金庫」が毎ティック打ち消されていた）。生産が無くても上限超えは戻す。
    if (S.stock[shop.id] > stockCap(shop)) S.stock[shop.id] = stockCap(shop);
  });
  if (autoTotal > 0) earn(autoTotal, true);
  if (rawDt > 120 && prodTotal > 0) toast('🌙 留守の間も街は動いてた！（約' + Math.max(1, Math.round(rawDt / 60)) + '分ぶん・90%で計算）');
  // コンボ減衰
  if (combo > 0 && now - lastTapAt > 1200) { combo = 0; $('comboBox').classList.add('hidden'); }
  // 行列イベント（ランダム）：頻繁に起きるため操作を止めるモーダルではなくトーストで知らせる
  if (!isRushing() && now >= S.nextRushAt) {
    S.rushUntil = now + 20000;
    S.nextRushAt = now + 20000 + 70000 + Math.random() * 60000;
    play('jingle_rush'); fireConfetti({ particleCount: 50, spread: 90, origin: { y: 0.4 } });
    toast('🎉 お客さん行列！20秒間 生産×3！今のうちに回収しよう');
  }
  // 宝箱
  // モーダル表示中は宝箱の残り時間を止める：モーダルに気を取られている間に
  // 宝箱が消えるのは理不尽なため（v21）
  if (chestState.active && !$('modal').classList.contains('hidden')) chestState.until += Math.round(rawDt * 1000);
  if (!chestState.active && now >= chestState.nextAt) spawnChest();
  if (chestState.active && chestState.el) chestState.el.classList.toggle('urgent', chestState.until - now < 4000);
  if (chestState.active && now > chestState.until) { removeChest(); toast('🎁 宝箱は消えてしまった…またの出現を待とう'); }
  checkAch();
  refreshAll();
}

// ---------- デイリーボーナス ----------
function dayStr(d) { return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate(); }
function checkDaily() {
  const today = dayStr(new Date());
  if (S.daily.last === today) return;
  const yest = dayStr(new Date(Date.now() - 86400000));
  S.daily.streak = (S.daily.last === yest) ? (S.daily.streak || 0) + 1 : 1;
  S.daily.last = today;
  const base = Math.max(totalRate() / Math.max(1, multProd()) * 300, tapPower() * 200, 800);
  const reward = Math.round(base * (1 + 0.3 * (S.daily.streak - 1)));
  setTimeout(() => {
    earn(reward, true); // earn 経由（表示はデイリーモーダルが担当）
    play('jingle_mission'); synth('fanfare');
    fireConfetti({ particleCount: 60, spread: 90, origin: { y: 0.5 } });
    showModal('1f4c5', 'デイリーボーナス！', 'ログイン ' + S.daily.streak + '日目！\n毎日来てくれてありがとう。\n+' + fmt(reward) + ' コイン（連続日数で増えるよ）');
    save(); refreshAll();
  }, 1400);
}

// ---------- 初期化 ----------
load();
(function offlineEarnings() {
  const rate = totalRate() / Math.max(1, multProd());
  const away = (Date.now() - (S.lastSaved || Date.now())) / 1000;
  if (rate > 0 && away > 60) {
    const capHours = 8 + 4 * (S.ups.night || 0); // 24時間営業で上限延長（最大28時間）
    const gain = Math.floor(rate * Math.min(away, capHours * 3600) * 0.9);
    if (gain > 0) {
      earn(gain, true); // earn 経由（表示はおかえりモーダルが担当）
      setTimeout(() => {
        play('jingle_mission'); fireConfetti({ particleCount: 60, spread: 90 });
        showModal('1f4b0', 'おかえりなさい！', 'いない間もスタッフが店を回してくれたよ\n+' + fmt(gain) + ' コイン（最大' + capHours + '時間分・90%）');
      }, 600);
    }
  }
})();

// 3D初期化（失敗したら従来の2Dマップにフォールバック）
try { USE3D = !!(window.T3D && T3D.init($('map3d'), onPlotTap3D)); } catch (e) { USE3D = false; }
if (USE3D) { document.body.classList.add('has-3d'); setTimeout(() => { try { T3D.resize(); } catch (e) {} }, 350); }
checkDaily();

buildPlots();
buildList();
refreshAll();
if (saveRecovered) toast('💾 セーブが壊れていたので、バックアップから復旧したよ');
if (window.gsap) gsap.to('#tapImg', { y: -6, duration: 0.9, yoyo: true, repeat: -1, ease: 'sine.inOut' });
// 長押し連打：呼び込みボタンを押し続けると自動で連打する（自作）
let holdIv = null, holdStart = 0, suppressHoldClick = false;
(function () {
  const btn = $('tapBtn');
  const startHold = ev => {
    holdStart = Date.now();
    clearInterval(holdIv);
    holdIv = setInterval(() => {
      const r = btn.getBoundingClientRect();
      onTap({ clientX: r.left + r.width / 2 + (Math.random() - 0.5) * 30, clientY: r.top + 16 });
    }, 110);
  };
  const stopHold = () => {
    if (holdIv) {
      if (Date.now() - holdStart > 320) suppressHoldClick = true; // 長押し後のclickは1回分無視
      clearInterval(holdIv); holdIv = null;
    }
  };
  btn.addEventListener('pointerdown', startHold);
  btn.addEventListener('pointerup', stopHold);
  btn.addEventListener('pointercancel', stopHold);
  btn.addEventListener('pointerleave', stopHold);
})();
$('tapBtn').addEventListener('click', onTap);
$('collectAllBtn').addEventListener('click', collectAll);
$('collectBtn').addEventListener('click', () => { const s = selectedId && shopById(selectedId); if (s && plotRefs[s.id]) collectShop(s, plotRefs[s.id].el); });
$('upgradeBtn').addEventListener('click', upgradeSelected);
$('upgrade10Btn').addEventListener('click', upgradeSelected10);
$('gachaBtn').addEventListener('click', spinGacha);
$('feverInfoBtn').addEventListener('click', () => {
  if (isFever()) { play('error'); const r0 = $('feverInfoBtn').getBoundingClientRect(); floatNumAt(r0.left + r0.width / 2 - 34, r0.top - 8, 'FEVER中！あと' + Math.ceil((S.feverUntil - Date.now()) / 1000) + '秒', false); return; }
  if (Date.now() < feverBoostReadyAt) { play('error'); const r1 = $('feverInfoBtn').getBoundingClientRect(); floatNumAt(r1.left + r1.width / 2 - 34, r1.top - 8, 'おやすみ中 あと' + Math.ceil((feverBoostReadyAt - Date.now()) / 1000) + '秒', false); return; }
  feverBoostReadyAt = Date.now() + 15000;
  addFever(10); play('open'); shake(3);
  const r = $('feverInfoBtn').getBoundingClientRect();
  floatNumAt(r.left + r.width / 2 - 34, r.top - 8, 'フィーバー +10', false); // 押した効果が目に見えるよう数字を出す
  refreshAll();
});
document.querySelectorAll('.dtab').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.dtab').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  district = Number(b.dataset.district); selectedId = null;
  play('open'); buildPlots(); refreshAll();
}));
document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  bottomTab = b.dataset.tab; play('open'); buildList(); refreshAll();
}));
$('modalBtn').addEventListener('click', () => { nextModal(); play('confirm'); refreshAll(); });
// モーダルの背景タップでも閉じられる（閉じられない詰まりの逃げ道。ガチャ演出中は無効）
$('modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal' && !$('modalBtn').disabled) { nextModal(); play('confirm'); refreshAll(); }
});
$('soundBtn').addEventListener('click', () => { S.sound = !S.sound; save(); refreshAll(); $('soundBtn').textContent = S.sound ? '🔊' : '🔇'; if (S.sound) play('click'); });
$('creditsBtn').addEventListener('click', () => { $('credits').classList.remove('hidden'); play('open'); });
$('creditsClose').addEventListener('click', () => { $('credits').classList.add('hidden'); play('confirm'); });
let resetArmed = false;
$('resetBtn').addEventListener('click', () => {
  if (!resetArmed) {
    resetArmed = true;
    $('resetBtn').textContent = '本当に消しますか？ もう一度タップで実行';
    setTimeout(() => { resetArmed = false; $('resetBtn').textContent = 'セーブデータを消す'; }, 3500);
    return;
  }
  localStorage.removeItem(SAVE_KEY); location.reload();
});
$('soundBtn').textContent = S.sound ? '🔊' : '🔇';
setInterval(tick, 200);
setInterval(save, 5000);
setInterval(spawnSpeech, 8000);
setInterval(spawnWalker, 5500);
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
window.addEventListener('pagehide', save); // WebViewでは visibilitychange が来ないことがあるため pagehide でも保存する
lastTick = Date.now();
