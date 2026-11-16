'use strict';
/* 3Dマップ描画（おちゃ自作の配置コード）
   3Dモデルは Kenney の外部素材（CC0）、描画エンジンは Three.js（MIT・外部ライブラリ） */
window.T3D = (function () {
  if (typeof THREE === 'undefined' || !THREE.GLTFLoader) return null;

  // お店ごとの3Dモデル対応表（建物・食べ物トーテムは外部モデル）
  const SHOP3D = {
    coffee:  { b: 'sub/bld-sub-a', totem: 'food/food-cup-coffee' },
    bread:   { b: 'sub/bld-sub-b', totem: 'food/food-croissant' },
    ramen:   { b: 'sub/bld-sub-c', totem: 'food/food-bowl-soup' },
    sushi:   { b: 'sub/bld-sub-d', totem: 'food/food-maki-salmon' },
    cake:    { b: 'sub/bld-sub-e', totem: 'food/food-cake' },
    burger:  { b: 'sub/bld-sub-f', totem: 'food/food-burger-cheese' },
    pizza:   { b: 'sub/bld-sub-g', totem: 'food/food-pizza' },
    ice:     { b: 'sub/bld-sub-h', totem: 'food/food-ice-cream' },
    flower:  { b: 'sub/bld-sub-i' },
    books:   { b: 'sub/bld-sub-j' },
    cinema:  { b: 'sub/bld-sub-k' },
    park:    { b: 'sub/bld-sub-l' },
    takoyaki:{ b: 'com/bld-com-a' },
    donut:   { b: 'com/bld-com-b', totem: 'food/food-donut-sprinkles' },
    tapioca: { b: 'com/bld-com-c', totem: 'food/food-cup-tea' },
    toy:     { b: 'com/bld-com-d' },
    gamecenter:{ b: 'com/bld-com-e' },
    pet:     { b: 'com/bld-com-f' },
    aquarium:{ b: 'com/bld-com-g', totem: 'food/food-fish' },
    hotel:   { b: 'com/bld-sky-a' },
    onsen:   { b: 'com/bld-com-h' },
    castle:  { b: 'com/bld-com-i' },
    stadium: { b: 'com/bld-wide-a' },
    space:   { b: 'com/bld-sky-e' },
    // ゆめタウンは既存モデルの使い回しが多いため、大きさ(s)と向き(ry)で見分けられるようにする（自作設定）
    mooncafe:{ b: 'com/bld-sky-e', s: 0.82, ry: 0.6 },
    planetarium:{ b: 'sub/bld-sub-k', s: 1.18, ry: -0.5 },
    miraidept:{ b: 'com/bld-com-d', s: 1.22, ry: 0.3 },
    skygarden:{ b: 'sub/bld-sub-i', s: 0.9, ry: 0.9 },
    cloverland:{ b: 'sub/bld-sub-l', s: 1.12, ry: -0.8 },
    partyhall:{ b: 'com/bld-com-e', s: 0.95, ry: 0.4 },
    festival:{ b: 'com/bld-wide-a', s: 0.88, ry: -0.3 },
    moneybank:{ b: 'com/bld-com-f', s: 1.15, ry: -0.4 },
    office:  { b: 'com/bld-sky-a', s: 0.88, ry: 0.7 },
    skypower:{ b: 'sub/bld-sub-j', s: 1.05, ry: 0.2 },
    trophy:  { b: 'com/bld-com-i', s: 1.1, ry: 0.5 },
    smileland:{ b: 'com/bld-com-g', s: 0.95, ry: -0.6 },
  };
  const CARS = [
    { file: 'car/car-delivery', lane: 5.9, speed: 2.6, start: -14, dir: 1 },
    { file: 'car/car-hatch', lane: 7.3, speed: -3.4, start: 10, dir: -1 },
    { file: 'car/car-police', lane: 5.9, speed: 2.6, start: -20, dir: 1 }, // 配送車と同速で隊列走行（速いと追いついて車同士が重なるため）
  ];

  let renderer, scene, camera, container, clock;
  let hemiLight, sunLight;
  let azimuth = -0.55, polar = 0.92, targetAz = -0.55, targetPolar = 0.92;
  const RADIUS = 19.2;
  const CAM_TARGET = { x: -0.7, y: 0.4, z: 0.2 };
  let plotGroups = {};   // shopId -> record
  let hitMeshes = [];
  let cars = [];
  let onTap = null;
  let lastInteract = Date.now();
  let ready = false;
  const loader = new THREE.GLTFLoader();
  const modelCache = {}; // file -> Promise<THREE.Object3D template>
  const texCache = {};   // icon code -> Promise<THREE.Texture>

  function plotPos(i) {
    const col = i % 4, row = Math.floor(i / 4);
    return { x: (col - 1.5) * 3.7, z: (row - 1) * 3.15 - 0.9 };
  }

  function loadModel(file) {
    if (!modelCache[file]) {
      modelCache[file] = new Promise(resolve => {
        loader.load('models/' + file + '.glb',
          gltf => resolve(gltf.scene),
          undefined,
          () => resolve(null));
      });
    }
    return modelCache[file].then(tpl => (tpl ? tpl.clone(true) : null));
  }

  // 建物などを「幅 targetW になるよう」正規化し、底面を y=0・中心を原点へ
  function normalize(obj, targetW) {
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3(); box.getSize(size);
    const w = Math.max(size.x, size.z) || 1;
    const s = targetW / w;
    obj.scale.setScalar(s);
    const box2 = new THREE.Box3().setFromObject(obj);
    const c = new THREE.Vector3(); box2.getCenter(c);
    obj.position.x -= c.x; obj.position.z -= c.z; obj.position.y -= box2.min.y;
    const box3 = new THREE.Box3().setFromObject(obj);
    return box3.max.y; // 高さ
  }

  function iconTexture(code, gray) {
    const key = code + (gray ? '-g' : '');
    if (!texCache[key]) {
      texCache[key] = new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas'); c.width = 128; c.height = 128;
          const ctx = c.getContext('2d');
          if (gray) ctx.filter = 'grayscale(1) opacity(0.75)';
          ctx.drawImage(img, 8, 8, 112, 112);
          const tex = new THREE.CanvasTexture(c);
          resolve(tex);
        };
        img.onerror = () => resolve(null);
        img.src = 'img/twemoji/' + code + '.svg';
      });
    }
    return texCache[key];
  }

  function makeSprite(code, gray, scale) {
    return iconTexture(code, gray).then(tex => {
      if (!tex) return null;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
      sp.scale.set(scale, scale, 1);
      return sp;
    });
  }

  // 空き地ラベル（自作：キャンバスに店名と価格を描いたスプライト。外部素材は使わない）
  function makeLabelSprite(name, line2) {
    try {
      const c = document.createElement('canvas'); c.width = 384; c.height = 132;
      const ctx = c.getContext('2d');
      const r = 26;
      ctx.beginPath();
      ctx.moveTo(r, 4); ctx.lineTo(384 - r, 4); ctx.quadraticCurveTo(380, 4, 380, r);
      ctx.lineTo(380, 132 - r); ctx.quadraticCurveTo(380, 128, 384 - r, 128);
      ctx.lineTo(r, 128); ctx.quadraticCurveTo(4, 128, 4, 132 - r);
      ctx.lineTo(4, r); ctx.quadraticCurveTo(4, 4, r, 4); ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.94)'; ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = '#b8860b'; ctx.stroke();
      ctx.textAlign = 'center'; ctx.fillStyle = '#24303e';
      ctx.font = '800 40px "Hiragino Maru Gothic ProN", sans-serif';
      ctx.fillText(name, 192, 56, 356);
      ctx.fillStyle = '#b06f00'; ctx.font = '800 36px "Hiragino Maru Gothic ProN", sans-serif';
      ctx.fillText(line2, 192, 106, 356);
      const tex = new THREE.CanvasTexture(c);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
      sp.scale.set(2.55, 0.88, 1);
      return sp;
    } catch (e) { return null; }
  }

  // Lvバッジ（自作：キャンバスに「Lv.○」を描いたスプライト。Lv10以上は金色。外部素材は使わない）
  function makeLvBadge(lv) {
    try {
      const c = document.createElement('canvas'); c.width = 192; c.height = 96;
      const ctx = c.getContext('2d');
      const gold = lv >= 10;
      const r = 40;
      ctx.beginPath();
      ctx.moveTo(r, 6); ctx.lineTo(192 - r, 6); ctx.quadraticCurveTo(186, 6, 186, r);
      ctx.lineTo(186, 96 - r); ctx.quadraticCurveTo(186, 90, 192 - r, 90);
      ctx.lineTo(r, 90); ctx.quadraticCurveTo(6, 90, 6, 96 - r);
      ctx.lineTo(6, r); ctx.quadraticCurveTo(6, 6, r, 6); ctx.closePath();
      ctx.fillStyle = gold ? '#ffd93b' : 'rgba(255,255,255,0.94)'; ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = gold ? '#b8860b' : '#5a6672'; ctx.stroke();
      ctx.textAlign = 'center'; ctx.fillStyle = '#24303e';
      ctx.font = '800 50px "Hiragino Maru Gothic ProN", sans-serif';
      ctx.fillText('Lv.' + lv, 96, 66, 176);
      const tex = new THREE.CanvasTexture(c);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
      sp.scale.set(1.15, 0.58, 1);
      return sp;
    } catch (e) { return null; }
  }

  function init(el, tapCallback) {
    container = el; onTap = tapCallback;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch (e) { return false; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    el.appendChild(renderer.domElement);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8fc9ec);
    scene.fog = new THREE.Fog(0x8fc9ec, 48, 95);
    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
    clock = new THREE.Clock();

    const hemi = new THREE.HemisphereLight(0xffffff, 0x4a7a4a, 0.75);
    scene.add(hemi); hemiLight = hemi;
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(9, 16, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -14; sun.shadow.camera.right = 14;
    sun.shadow.camera.top = 14; sun.shadow.camera.bottom = -14;
    scene.add(sun); sunLight = sun;

    // 地面（草地）※色はシーンコード側、テクスチャ・モデルは外部素材
    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0x77b255, roughness: 1 }));
    grass.rotation.x = -Math.PI / 2; grass.position.y = -0.02; grass.receiveShadow = true;
    scene.add(grass);

    // 敷地（Kenneyタイルをテクスチャとして使用）
    const tileTex = new THREE.TextureLoader().load('img/kenney/tile_0100.png');
    tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping; tileTex.repeat.set(11, 8);
    tileTex.magFilter = THREE.NearestFilter;
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(16.6, 12.2),
      new THREE.MeshStandardMaterial({ map: tileTex, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, -0.9); ground.receiveShadow = true;
    scene.add(ground);

    // 道路（Kenneyタイル）
    const roadTex = new THREE.TextureLoader().load('img/kenney/tile_0064.png');
    roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping; roadTex.repeat.set(18, 2);
    roadTex.magFilter = THREE.NearestFilter;
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 3.4),
      new THREE.MeshStandardMaterial({ map: roadTex, roughness: 1 }));
    road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, 6.6); road.receiveShadow = true;
    scene.add(road);

    // 木（外部モデル）を端に配置
    [['sub/tree-large', -9.2, -4.6], ['sub/tree-small', 9.0, -5.2], ['sub/tree-large', 9.4, 3.4], ['sub/tree-small', -9.4, 2.6], ['sub/tree-small', -9.0, -0.5], ['sub/tree-large', 8.8, -1.2]].forEach(([f, x, z]) => {
      loadModel(f).then(obj => {
        if (!obj) return;
        normalize(obj, f === 'sub/tree-large' ? 1.6 : 1.1);
        obj.position.set(x, 0, z);
        obj.traverse(n => { if (n.isMesh) n.castShadow = true; });
        scene.add(obj);
      });
    });

    // 車（外部モデル）
    CARS.forEach(cfg => {
      loadModel(cfg.file).then(obj => {
        if (!obj) return;
        const h = normalize(obj, 2.0);
        obj.position.set(cfg.start, 0.02, cfg.lane);
        obj.traverse(n => { if (n.isMesh) n.castShadow = true; });
        scene.add(obj);
        cars.push({ obj, cfg, baseY: 0.02 });
      });
    });

    bindPointer(renderer.domElement);
    resize();
    window.addEventListener('resize', resize);
    ready = true;
    animate();
    return true;
  }

  function resize() {
    if (!renderer || !container) return;
    const w = container.clientWidth || 360, h = container.clientHeight || 342;
    renderer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  function clearPlots() {
    Object.values(plotGroups).forEach(r => { scene.remove(r.group); });
    plotGroups = {}; hitMeshes = [];
  }

  function buildDistrict(shops, isBuilt, getLabel) {
    if (!ready) return;
    clearPlots();
    shops.forEach((shop, i) => {
      const pos = plotPos(i);
      const group = new THREE.Group();
      group.position.set(pos.x, 0, pos.z);
      const built = isBuilt(shop);
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.45, 0.22, 24),
        new THREE.MeshStandardMaterial({ color: built ? 0xb8c2cc : 0xffd94d, roughness: 0.7, emissive: built ? 0x000000 : 0xaa7700, emissiveIntensity: built ? 0 : 0.35 }));
      pad.position.y = 0.11; pad.receiveShadow = true;
      group.add(pad);
      // 選択リング
      const ring = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.72, 32),
        new THREE.MeshBasicMaterial({ color: 0xff5722, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.06; ring.visible = false;
      group.add(ring);
      // タップ判定は画面上の近さで行う（bindPointer参照）
      scene.add(group);
      const rec = { group, pad, ring, shop, builtFlag: built, building: null, totem: null, icon: null, coin: null, bHeight: 0, phase: Math.random() * 6 };
      plotGroups[shop.id] = rec;
      if (built) addBuilding(rec, false);
      else {
        makeSprite(shop.icon, false, 1.15).then(sp => {
          if (!sp || plotGroups[shop.id] !== rec) return;
          sp.position.set(0, 1.35, 0);
          group.add(sp); rec.icon = sp;
        });
        if (getLabel) {
          const label = makeLabelSprite(shop.name, getLabel(shop));
          if (label) { label.position.set(0, 2.45, 0); group.add(label); rec.label = label; }
        }
      }
    });
  }

  function addBuilding(rec, animateIn) {
    const cfg = SHOP3D[rec.shop.id] || { b: 'sub/bld-sub-a' };
    loadModel(cfg.b).then(obj => {
      if (!obj || plotGroups[rec.shop.id] !== rec) return;
      let h = normalize(obj, 2.35);
      if (cfg.s) { obj.scale.multiplyScalar(cfg.s); h *= cfg.s; }
      if (cfg.ry) obj.rotation.y = cfg.ry;
      rec.mats = [];
      obj.traverse(n => { if (n.isMesh) { n.castShadow = true; if (n.material && n.material.emissive) { n.material = n.material.clone(); rec.mats.push(n.material); } } });
      rec.group.add(obj);
      rec.building = obj; rec.bHeight = h; rec.baseScale = obj.scale.clone(); rec.lvShown = 0;
      if (animateIn && window.gsap) {
        const fs = obj.scale.clone();
        obj.scale.set(fs.x * 0.01, fs.y * 0.01, fs.z * 0.01);
        gsap.to(obj.scale, { x: fs.x, y: fs.y, z: fs.z, duration: 0.7, ease: 'bounce.out' });
      }
      // 上に浮く看板（食べ物3Dモデル or アイコン）
      if (cfg.totem) {
        loadModel(cfg.totem).then(t => {
          if (!t || plotGroups[rec.shop.id] !== rec) return;
          normalize(t, 1.05);
          t.position.y = h + 0.85;
          t.traverse(n => { if (n.isMesh) n.castShadow = true; });
          rec.group.add(t); rec.totem = t;
        });
      } else {
        makeSprite(rec.shop.icon, false, 1.2).then(sp => {
          if (!sp || plotGroups[rec.shop.id] !== rec) return;
          sp.position.set(0, h + 0.85, 0);
          rec.group.add(sp); rec.totem = sp;
        });
      }
      // ストック用コイン
      makeSprite('1f4b0', false, 0.6).then(sp => {
        if (!sp || plotGroups[rec.shop.id] !== rec) return;
        sp.position.set(1.05, h * 0.55 + 0.5, 0.95);
        sp.visible = false;
        rec.group.add(sp); rec.coin = sp;
      });
    });
  }

  function refreshShop(shop, isBuiltNow, animateIn) {
    const rec = plotGroups[shop.id];
    if (!rec) return;
    if (isBuiltNow && !rec.builtFlag) {
      rec.builtFlag = true;
      if (rec.icon) { rec.group.remove(rec.icon); rec.icon = null; }
      if (rec.label) { rec.group.remove(rec.label); rec.label = null; }
      rec.pad.material.color.set(0xb8c2cc);
      rec.pad.material.emissive.set(0x000000); rec.pad.material.emissiveIntensity = 0;
      addBuilding(rec, animateIn);
    }
  }

  let nightK = 0, lastGlowK = -1; // 夜の深さ 0(昼)→1(夜)
  function applyBuildingGlow(rec) {
    // 夜は建物の窓がほんのり光る（金色の人気店は昼夜問わず輝く）
    if (!rec.mats) return;
    const gold = !!rec.gold;
    const hex = gold ? 0x7a5200 : 0xff8c3a;
    const inten = gold ? 0.35 + nightK * 0.3 : nightK * 0.55;
    rec.mats.forEach(m => { if (m.emissive) { m.emissive.setHex(hex); m.emissiveIntensity = inten; } });
  }
  function setLevel(shopId, lv) {
    // お店のレベルで建物の外観が育つ：少しずつ大きくなり、Lv10以上は金色に輝く
    const rec = plotGroups[shopId];
    if (!rec || !rec.building || !rec.baseScale) return;
    lv = Math.max(0, lv | 0);
    // Lvバッジはレベルが変わった時だけ作り直す（コイン表示の反対側に浮かせる）
    if (rec.lvBadgeShown !== lv) {
      rec.lvBadgeShown = lv;
      if (rec.lvBadge) { rec.group.remove(rec.lvBadge); rec.lvBadge = null; }
      if (lv > 0) {
        const nb = makeLvBadge(lv);
        // 屋根の上に浮かせる（建物の横だと屋根に埋まって「25」の角しか見えなかったため）
        if (nb) { nb.position.set(-1.25, (rec.bHeight || 1) + 0.32, 0.3); rec.group.add(nb); rec.lvBadge = nb; }
      }
    }
    if (rec.lvShown === lv) return;
    rec.lvShown = lv;
    const s = 1 + Math.min(lv, 25) * 0.018;
    rec.building.scale.copy(rec.baseScale).multiplyScalar(s);
    rec.gold = lv >= 10;
    applyBuildingGlow(rec);
  }

  function setStock(shopId, ratio, full) {
    const rec = plotGroups[shopId];
    if (!rec || !rec.coin) return;
    rec.coin.visible = ratio > 0.02;
    const s = 0.45 + Math.min(1, ratio) * 0.8;
    rec.coin.scale.set(s, s, 1);
    rec.coin.material.color.set(full ? 0xffd93b : 0xffffff);
    rec.stockFull = !!full;
  }

  function setAfford(shopId, afford) {
    const rec = plotGroups[shopId];
    if (!rec || rec.builtFlag) return;
    rec.pad.material.emissiveIntensity = afford ? 0.55 : 0.18;
  }

  function highlight(shopId) {
    Object.values(plotGroups).forEach(r => { r.ring.visible = (r.shop.id === shopId); });
  }

  function project(shopId, heightRatio) {
    const rec = plotGroups[shopId];
    if (!rec || !renderer) return null;
    const v = new THREE.Vector3();
    rec.group.getWorldPosition(v);
    v.y = (rec.bHeight || 0) * (heightRatio || 0.6) + 0.6;
    v.project(camera);
    const rect = renderer.domElement.getBoundingClientRect();
    return {
      clientX: rect.left + (v.x * 0.5 + 0.5) * rect.width,
      clientY: rect.top + (-v.y * 0.5 + 0.5) * rect.height,
      mapX: (v.x * 0.5 + 0.5) * rect.width,
      mapY: (-v.y * 0.5 + 0.5) * rect.height,
      rect: rect,
    };
  }

  function bindPointer(canvas) {
    let downX = 0, downY = 0, downT = 0, dragging = false, lastX = 0, lastY = 0;
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', e => {
      downX = lastX = e.clientX; downY = lastY = e.clientY; downT = Date.now(); dragging = false;
      lastInteract = Date.now();
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', e => {
      if (!downT) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 7) dragging = true;
      if (dragging) {
        targetAz += dx * 0.0055;
        targetPolar = Math.max(0.55, Math.min(1.25, targetPolar + dy * 0.003));
        lastInteract = Date.now();
      }
      lastX = e.clientX; lastY = e.clientY;
    });
    canvas.addEventListener('pointerup', e => {
      const wasDrag = dragging; downT = 0; dragging = false;
      lastInteract = Date.now();
      if (wasDrag || !onTap) return;
      // 画面投影した各区画の中心に一番近いものを選ぶ（遮蔽に強い方式）
      const rect = canvas.getBoundingClientRect();
      const tx = e.clientX - rect.left, ty = e.clientY - rect.top;
      let best = null, bestD = 95; // 95px以内なら反応
      Object.values(plotGroups).forEach(r => {
        const v = new THREE.Vector3();
        r.group.getWorldPosition(v);
        v.y = Math.max(0.9, (r.bHeight || 0) * 0.55);
        v.project(camera);
        const sx = (v.x * 0.5 + 0.5) * rect.width;
        const sy = (-v.y * 0.5 + 0.5) * rect.height;
        const d = Math.hypot(sx - tx, sy - ty);
        if (d < bestD) { bestD = d; best = r.shop.id; }
      });
      if (best) onTap(best);
    });
    canvas.addEventListener('pointercancel', () => { downT = 0; dragging = false; });
  }

  // 昼夜サイクル（120秒で1日：朝→昼→夕→夜）
  const SKY_STOPS = [
    { at: 0.00, c: new THREE.Color(0xffc38a), hemi: 0.6, sun: 0.55 },
    { at: 0.15, c: new THREE.Color(0x8fc9ec), hemi: 0.78, sun: 0.85 },
    { at: 0.55, c: new THREE.Color(0x8fc9ec), hemi: 0.78, sun: 0.85 },
    { at: 0.70, c: new THREE.Color(0xff9e6b), hemi: 0.58, sun: 0.5 },
    { at: 0.85, c: new THREE.Color(0x27355e), hemi: 0.38, sun: 0.22 },
    { at: 1.00, c: new THREE.Color(0xffc38a), hemi: 0.6, sun: 0.55 },
  ];
  const _skyC = new THREE.Color();
  function applyDayNight(t) {
    const ph = ((t + 24) % 120) / 120; // 起動直後は昼（ph 0.2）から始める。t=0 の朝焼けは薄暗く第一印象が悪いため
    let a = SKY_STOPS[0], b = SKY_STOPS[SKY_STOPS.length - 1];
    for (let i = 0; i < SKY_STOPS.length - 1; i++) {
      if (ph >= SKY_STOPS[i].at && ph <= SKY_STOPS[i + 1].at) { a = SKY_STOPS[i]; b = SKY_STOPS[i + 1]; break; }
    }
    const span = Math.max(0.0001, b.at - a.at);
    const k = Math.max(0, Math.min(1, (ph - a.at) / span));
    _skyC.copy(a.c).lerp(b.c, k);
    scene.background.copy(_skyC);
    if (scene.fog) scene.fog.color.copy(_skyC);
    if (hemiLight) hemiLight.intensity = a.hemi + (b.hemi - a.hemi) * k;
    const sunI = a.sun + (b.sun - a.sun) * k;
    if (sunLight) sunLight.intensity = sunI;
    nightK = Math.max(0, Math.min(1, (0.85 - sunI) / 0.63)); // 夜の深さ 0(昼)→1(夜)
  }

  let emaDt = 1 / 60, qualChecked = false;
  function animate() {
    requestAnimationFrame(animate);
    const rawDt = Math.min(clock.getDelta(), 0.5);
    const dt = Math.min(rawDt, 0.05);
    const t = clock.elapsedTime;
    emaDt = emaDt * 0.95 + rawDt * 0.05;
    // 低スペック端末対策：起動8秒後もずっと重い場合だけシャドウを切って軽くする
    if (!qualChecked && t > 8) {
      qualChecked = true;
      if (emaDt > 1 / 15 && renderer && sunLight) {
        try {
          renderer.shadowMap.enabled = false;
          sunLight.castShadow = false;
          scene.traverse(o => {
            if (!o.material) return;
            (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.needsUpdate = true; });
          });
        } catch (e) {}
      }
    }
    applyDayNight(t);
    // 夜の深さが変わったら建物の明かりを更新
    if (Math.abs(nightK - lastGlowK) > 0.05) {
      lastGlowK = nightK;
      Object.values(plotGroups).forEach(r => { if (r.building) applyBuildingGlow(r); });
    }
    // カメラ（しばらく触らなければゆっくり自動回転）
    if (Date.now() - lastInteract > 5000) targetAz += dt * 0.045;
    azimuth += (targetAz - azimuth) * 0.06;
    polar += (targetPolar - polar) * 0.06;
    camera.position.set(
      CAM_TARGET.x + Math.sin(azimuth) * Math.sin(polar) * RADIUS,
      CAM_TARGET.y + Math.cos(polar) * RADIUS * 0.92 + 2.2,
      CAM_TARGET.z + Math.cos(azimuth) * Math.sin(polar) * RADIUS);
    camera.lookAt(CAM_TARGET.x, CAM_TARGET.y, CAM_TARGET.z);
    // 車
    cars.forEach(c => {
      c.obj.position.x += c.cfg.speed * dt;
      c.obj.rotation.y = c.cfg.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      if (c.obj.position.x > 22) c.obj.position.x = -22;
      if (c.obj.position.x < -22) c.obj.position.x = 22;
    });
    // プロットの動き
    Object.values(plotGroups).forEach((r, i) => {
      if (r.totem && r.building) { r.totem.rotation.y += dt * 1.1; r.totem.position.y = r.bHeight + 0.85 + Math.sin(t * 2 + r.phase) * 0.08; }
      if (r.coin && r.coin.visible) r.coin.position.y = r.bHeight * 0.55 + 0.5 + Math.sin(t * 3 + r.phase) * 0.09;
      if (r.lvBadge) r.lvBadge.position.y = r.bHeight + 0.32 + Math.sin(t * 3 + r.phase + 1.5) * 0.09;
      if (!r.builtFlag && r.icon) r.icon.position.y = 1.35 + Math.sin(t * 2.2 + r.phase) * 0.1;
      if (!r.builtFlag && r.label) r.label.position.y = 2.45 + Math.sin(t * 2.2 + r.phase) * 0.1;
      if (r.stockFull && r.pad) r.pad.material.emissive.setHex(0xff8800), r.pad.material.emissiveIntensity = 0.35 + 0.2 * Math.sin(t * 6);
      else if (r.builtFlag && r.pad) r.pad.material.emissiveIntensity = 0;
    });
    renderer.render(scene, camera);
  }

  return { init, buildDistrict, refreshShop, setStock, setAfford, setLevel, highlight, project, resize,
    get ready() { return ready; } };
})();
