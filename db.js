// ═══════════════════════════════════════════════════════════════════════════
// PhotoU — Database Module (localStorage)
// ═══════════════════════════════════════════════════════════════════════════
const DB = {

  // ─── FRAMES ──────────────────────────────────────────────────────────────
  _defaultFrames() {
    return [
      {id:'pastel-dream',  name:'Pastel Dream',  cat:'pastel',  bg:'#fce4f3',border:'#e8a0d8',slot:'#f7c6e8',text:'#c06898',style:'floral',  uses:0,createdAt:'2025-01-01',slots:3,label:'PhotoU',borderW:6,radius:8,fontSize:7,stickers:[],type:'generated',slotH:25,slotGap:8,pad:16,ratio:'portrait',photoFit:'cover'},
      {id:'lavender-mist', name:'Lavender Mist', cat:'pastel',  bg:'#ede0ff',border:'#b08adf',slot:'#d4b8f7',text:'#7040b0',style:'dots',    uses:0,createdAt:'2025-01-01',slots:3,label:'PhotoU',borderW:6,radius:8,fontSize:7,stickers:[],type:'generated',slotH:25,slotGap:8,pad:16,ratio:'portrait',photoFit:'cover'},
      {id:'clean-white',   name:'Clean White',   cat:'minimal', bg:'#ffffff',border:'#d0d0d0',slot:'#f0f0f0',text:'#999999',style:'minimal', uses:0,createdAt:'2025-01-01',slots:3,label:'PhotoU',borderW:5,radius:6,fontSize:7,stickers:[],type:'generated',slotH:25,slotGap:8,pad:16,ratio:'portrait',photoFit:'cover'},
      {id:'dark-mono',     name:'Dark Mono',     cat:'minimal', bg:'#1a1a2e',border:'#555555',slot:'#252540',text:'#888888',style:'minimal', uses:0,createdAt:'2025-01-01',slots:3,label:'PhotoU',borderW:5,radius:6,fontSize:7,stickers:[],type:'generated',slotH:25,slotGap:8,pad:16,ratio:'portrait',photoFit:'cover'},
      {id:'sakura',        name:'Sakura',        cat:'floral',  bg:'#fff0f5',border:'#f4a0b8',slot:'#ffd6e6',text:'#c05878',style:'sakura',  uses:0,createdAt:'2025-01-01',slots:3,label:'PhotoU',borderW:6,radius:10,fontSize:7,stickers:['🌸'],type:'generated',slotH:25,slotGap:8,pad:16,ratio:'portrait',photoFit:'cover'},
      {id:'garden',        name:'Garden',        cat:'floral',  bg:'#f0faf0',border:'#88cc88',slot:'#c8e8c8',text:'#458045',style:'leaves',  uses:0,createdAt:'2025-01-01',slots:3,label:'PhotoU',borderW:6,radius:8,fontSize:7,stickers:['🌻'],type:'generated',slotH:25,slotGap:8,pad:16,ratio:'portrait',photoFit:'cover'},
      {id:'golden-hour',   name:'Golden Hour',   cat:'pastel',  bg:'#fff8e7',border:'#f4c460',slot:'#fde9a2',text:'#b8820a',style:'dots',   uses:0,createdAt:'2025-01-01',slots:3,label:'PhotoU',borderW:6,radius:8,fontSize:7,stickers:['⭐'],type:'generated',slotH:25,slotGap:8,pad:16,ratio:'portrait',photoFit:'cover'},
      {id:'midnight',      name:'Midnight',      cat:'minimal', bg:'#0d0d1a',border:'#6644aa',slot:'#1a1130',text:'#9966ff',style:'minimal', uses:0,createdAt:'2025-01-01',slots:3,label:'PhotoU',borderW:5,radius:6,fontSize:7,stickers:[],type:'generated',slotH:25,slotGap:8,pad:16,ratio:'portrait',photoFit:'cover'},
    ];
  },

  getFrames() {
    const raw = localStorage.getItem('phu_frames');
    if (!raw) { const d = this._defaultFrames(); this.saveFrames(d); return d; }
    try { return JSON.parse(raw); } catch(e) { return this._defaultFrames(); }
  },
  saveFrames(frames) {
    try {
      localStorage.setItem('phu_frames', JSON.stringify(frames));
    } catch(e) {
      // Kalau frames penuh karena imageUrl PNG besar, hapus imageUrl frame lama
      const slim = frames.map(f => f.type === 'png' ? { ...f, imageUrl: null } : f);
      try { localStorage.setItem('phu_frames', JSON.stringify(slim)); } catch(e2) { console.error('saveFrames failed:', e2); }
    }
  },

  /** Tambah frame baru */
  addFrame(data) {
    const frames = this.getFrames();
    const f = {
      id:        'frame-' + Date.now(),
      name:      data.name      || 'New Frame',
      cat:       data.cat       || 'pastel',
      bg:        data.bg        || '#ffffff',
      border:    data.border    || '#cccccc',
      slot:      data.slot      || '#eeeeee',
      text:      data.text      || '#666666',
      style:     data.style     || 'minimal',
      type:      data.type      || 'generated',   // 'png' | 'generated'
      imageUrl:  data.imageUrl  || null,           // base64 dataURL untuk PNG upload
      slots:     data.slots     || 3,              // jumlah foto slot
      label:     data.label     || 'PhotoU',       // watermark text
      borderW:   data.borderW   || 6,              // border width %
      radius:    data.radius    || 8,              // corner radius
      fontSize:  data.fontSize  || 7,              // label font size %
      stickers:  data.stickers  || [],             // array emoji stickers
      // ── layout fields (fix: sebelumnya tidak disimpan) ──
      slotH:     data.slotH     || 25,             // tinggi slot % dari frame height
      slotGap:   data.slotGap   || 8,              // gap antar slot (px)
      pad:       data.pad       || 16,             // side padding (px)
      ratio:     data.ratio     || 'portrait',     // 'portrait' | 'square' | 'wide' | 'tall'
      photoFit:  data.photoFit  || 'cover',        // 'cover' | 'contain'
      uses:      0,
      createdAt: new Date().toISOString(),
    };
    frames.push(f);
    this.saveFrames(frames);
    return f;
  },

  /** Update frame by id */
  updateFrame(id, updates) {
    const frames = this.getFrames();
    const idx = frames.findIndex(f => f.id === id);
    if (idx === -1) return null;
    frames[idx] = { ...frames[idx], ...updates };
    this.saveFrames(frames);
    return frames[idx];
  },

  /** Hapus frame by id */
  deleteFrame(id) {
    const frames = this.getFrames().filter(f => f.id !== id);
    this.saveFrames(frames);
  },

  getFrame(id) { return this.getFrames().find(f => f.id === id) || null; },

  incrementFrameUse(id) {
    const f = this.getFrame(id);
    if (f) this.updateFrame(id, { uses: (f.uses || 0) + 1 });
  },

  getBestSellers(n = 5) {
    return [...this.getFrames()].sort((a,b) => (b.uses||0)-(a.uses||0)).slice(0, n);
  },

  // ─── STRIPS ──────────────────────────────────────────────────────────────
  /**
   * saveStrip: simpan metadata strip (TANPA full base64 untuk hemat localStorage)
   * FIX: versi lama menyimpan full dataUrl (3–8MB per strip) → quota 5MB langsung penuh
   *      → setItem('finalStrip') gagal silent → result.html dapat null → redirect loop
   * Sekarang hanya simpan thumbnail kecil (~3KB) + metadata.
   *
   * @param {string} dataUrl  - base64 PNG (hanya dipakai untuk generate thumb)
   * @param {string} frameId  - id frame yang dipakai
   */
  saveStrip(dataUrl, frameId) {
    const strips = this.getStrips();
    strips.push({
      id:      Date.now().toString(),
      thumb:   this._makeThumb(dataUrl, 80),   // ~3KB JPEG thumbnail
      frameId,
      time:    new Date().toISOString(),
    });
    // Batasi maksimal 50 entry
    if (strips.length > 50) strips.splice(0, strips.length - 50);

    // Simpan dengan fallback jika masih penuh
    this._safeSet('phu_strips', JSON.stringify(strips));
  },

  /**
   * _makeThumb: buat JPEG thumbnail kecil dari dataUrl
   * Hasilnya ~3KB vs 3–8MB untuk full HD PNG
   */
  _makeThumb(dataUrl, size) {
    if (!dataUrl) return null;
    try {
      const canvas = document.createElement('canvas');
      const h = Math.round(size * 1.5);
      canvas.width = size; canvas.height = h;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = dataUrl;
      // Gambar sync kalau sudah loaded (dataUrl selalu sync)
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, size, h);
        return canvas.toDataURL('image/jpeg', 0.6);
      }
    } catch(e) { /* ignore */ }
    return null;
  },

  /**
   * _safeSet: localStorage.setItem dengan fallback bertahap
   * Kalau penuh, hapus entry lama sampai ada ruang
   */
  _safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch(e) {
      // Coba hapus strip lama satu per satu
      if (key === 'phu_strips') {
        const strips = this.getStrips();
        while (strips.length > 5) {
          strips.splice(0, 1);
          try {
            localStorage.setItem(key, JSON.stringify(strips));
            return;
          } catch(e2) { continue; }
        }
      }
      console.warn('localStorage _safeSet failed for key:', key, e);
    }
  },

  getStrips() {
    try { return JSON.parse(localStorage.getItem('phu_strips') || '[]'); }
    catch(e) { return []; }
  },
  clearStrips() { localStorage.removeItem('phu_strips'); },

  // ─── VISITORS ────────────────────────────────────────────────────────────
  logVisitor(page) {
    const logs = this.getVisitors();
    logs.push({
      id:   Date.now() + '-' + Math.random().toString(36).slice(2),
      page,
      time: new Date().toISOString(),
      ua:   navigator.userAgent.slice(0, 100),
    });
    if (logs.length > 500) logs.splice(0, logs.length - 500);
    this._safeSet('phu_visitors', JSON.stringify(logs));
  },
  getVisitors() {
    try { return JSON.parse(localStorage.getItem('phu_visitors') || '[]'); }
    catch(e) { return []; }
  },
  getVisitorCount(page = null) {
    const l = this.getVisitors();
    return page ? l.filter(v => v.page === page).length : l.length;
  },
  clearVisitors() { localStorage.removeItem('phu_visitors'); },

  // ─── HD EXPORT HELPERS ────────────────────────────────────────────────────
  /**
   * HD_SCALE: multiplier resolusi untuk final export
   *   2 = 2x resolution (default HD, lebih aman untuk memori)
   *   3 = 3x resolution (Full HD / print quality)
   *
   * FIX: diturunkan ke 2 sebagai default untuk menghindari memory error
   *      di mobile/browser dengan RAM terbatas.
   *      Naikkan ke 3 kalau butuh kualitas print.
   */
  HD_SCALE: 2,

  /**
   * getExportSize: hitung ukuran canvas HD berdasarkan base size
   */
  getExportSize(baseW, baseH) {
    return {
      w:     baseW * this.HD_SCALE,
      h:     baseH * this.HD_SCALE,
      scale: this.HD_SCALE,
    };
  },

  // ─── ADMIN AUTH ───────────────────────────────────────────────────────────
  ADMIN_USER: 'admin',
  ADMIN_PASS: 'photou2025',
  login(user, pass) {
    if (user === this.ADMIN_USER && pass === this.ADMIN_PASS) {
      sessionStorage.setItem('phu_admin', '1');
      return true;
    }
    return false;
  },
  logout()  { sessionStorage.removeItem('phu_admin'); },
  isAdmin() { return sessionStorage.getItem('phu_admin') === '1'; },

  // ─── UTILS ───────────────────────────────────────────────────────────────
  getStorageInfo() {
    const keys  = ['phu_frames', 'phu_visitors', 'phu_strips', 'finalStrip'];
    let total   = 0;
    const info  = {};
    keys.forEach(k => {
      const v = localStorage.getItem(k) || '';
      info[k] = (v.length / 1024).toFixed(1) + ' KB';
      total  += v.length;
    });
    return { ...info, totalKB: Math.round(total / 1024) };
  },

  /**
   * cleanStorage: hapus finalStrip + strips lama untuk bebaskan ruang
   * Panggil ini kalau getStorageInfo().totalKB mendekati 4500
   */
  cleanStorage() {
    localStorage.removeItem('finalStrip');
    this.clearStrips();
    console.info('[PhotoU DB] Storage cleaned.');
  },

  nukeAll() {
    ['phu_frames', 'phu_visitors', 'phu_strips', 'finalStrip'].forEach(k => localStorage.removeItem(k));
  },
};