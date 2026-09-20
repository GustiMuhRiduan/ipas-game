/* =============================================================================
 * config.js — Global constants, design tokens, and learning content.
 *
 * Everything the game "knows" about its look and its curriculum lives here so
 * designers/teachers can tweak text, colours and questions without hunting
 * through scene logic.
 * ===========================================================================*/

// Design resolution. The whole game is authored against this 16:9 canvas and
// the Scale Manager fits it to any screen (laptop, desktop, tablet, IFP).
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

// Child-friendly, high-contrast palette (Fase C SD).
const COLORS = {
  skyTop: 0x8fe3ff,
  skyBottom: 0xd6f6ff,
  ground: 0x8fd36b,
  groundDark: 0x6fbb50,

  deep: 0x0e5560,
  panel: 0xffffff,
  panelSoft: 0xf3fbfc,
  ink: 0x143b42, // primary dark text
  inkSoft: 0x4a6b71,

  primary: 0x14a4b8, // teal
  primaryDark: 0x0e7c86,
  accent: 0xffc42e, // sunny yellow
  accentDark: 0xe8a600,

  good: 0x2fbf71, // green – correct
  goodDark: 0x1f9a58,
  bad: 0xef5470, // red/pink – wrong
  badDark: 0xc93a56,

  sun: 0xffd23f,
  wind: 0x7fd1ff,
  water: 0x3aa0e0,
  bio: 0x8bc34a,

  white: 0xffffff,
  shadow: 0x0a3a42,
};

// CSS hex strings (Phaser Text needs '#rrggbb').
const CSS = {};
for (const k in COLORS) {
  CSS[k] = '#' + COLORS[k].toString(16).padStart(6, '0');
}

const FONT = "'Trebuchet MS', 'Segoe UI', Verdana, sans-serif";

// Scene keys — referenced everywhere so typos fail loudly.
const SCENES = {
  BOOT: 'BootScene',
  MENU: 'MenuScene',
  GUIDE: 'GuideScene',
  SELECT: 'LevelSelectScene',
  HUD: 'HudScene',
  LEVEL1: 'Level1Scene',
  LEVEL2: 'Level2Scene',
  LEVEL3: 'Level3Scene',
  RESULT: 'ResultScene',
  FINISH: 'FinishScene',
};

const TOTAL_LEVELS = 3;
const START_LIVES = 3;

// -----------------------------------------------------------------------------
// LEARNING CONTENT
// Materi esensial: upaya penghematan energi, pemanfaatan energi alternatif, dan
// penerapannya dalam kegiatan ekonomi masyarakat sebagai mitigasi perubahan iklim.
// -----------------------------------------------------------------------------
const CONTENT = {
  game: {
    title: 'Petualangan Energi',
    subtitle: 'Selamatkan Desa Terang dari boros energi!',
  },

  // Levels metadata for the pathway/level-select map.
  levels: [
    {
      key: SCENES.LEVEL1,
      no: 1,
      title: 'Hemat Energi di Rumah',
      icon: '💡',
      color: COLORS.accent,
      goal: 'Temukan dan matikan alat yang memboroskan energi.',
      skill: 'Penghematan energi',
    },
    {
      key: SCENES.LEVEL2,
      no: 2,
      title: 'Energi Alternatif',
      icon: '☀️',
      color: COLORS.primary,
      goal: 'Pasangkan sumber energi alternatif dengan teknologinya.',
      skill: 'Sumber energi terbarukan',
    },
    {
      key: SCENES.LEVEL3,
      no: 3,
      title: 'Ekonomi Hijau Desa',
      icon: '🏪',
      color: COLORS.good,
      goal: 'Pilih keputusan ekonomi yang hemat energi & ramah lingkungan.',
      skill: 'Ekonomi masyarakat',
    },
  ],

  // ---- LEVEL 1: spot-the-waste (eksplorasi + pengambilan keputusan) ----
  // Player inspects household items and decides: MATIKAN (turn off / fix) the
  // wasteful ones, BIARKAN (leave) the ones that are used wisely.
  level1: {
    intro: 'Rumah Bimo terlihat boros listrik! Ketuk setiap benda, lalu putuskan: MATIKAN yang boros, atau BIARKAN yang sudah hemat.',
    items: [
      { id: 'lamp',    emoji: '💡', label: 'Lampu menyala di kamar kosong',        waste: true,  tip: 'Matikan lampu saat ruangan tidak dipakai untuk menghemat listrik.' },
      { id: 'tv',      emoji: '📺', label: 'TV menyala tapi tidak ditonton',        waste: true,  tip: 'TV yang menyala sia-sia memboroskan energi. Matikan bila tidak ditonton.' },
      { id: 'ac',      emoji: '❄️', label: 'AC menyala dengan jendela terbuka',     waste: true,  tip: 'AC boros bila jendela terbuka karena udara dingin terbuang.' },
      { id: 'tap',     emoji: '🚰', label: 'Keran air dibiarkan mengalir',          waste: true,  tip: 'Air dan energi pompa terbuang bila keran dibiarkan mengalir.' },
      { id: 'charger', emoji: '🔌', label: 'Cas HP menancap tanpa HP',              waste: true,  tip: 'Cabut charger yang tidak dipakai; ia tetap menyedot listrik.' },
      { id: 'fridge',  emoji: '🧊', label: 'Kulkas menyala menyimpan makanan',      waste: false, tip: 'Kulkas memang perlu menyala terus untuk menjaga makanan tetap segar.' },
      { id: 'sunlight',emoji: '🪟', label: 'Jendela dibuka, memakai cahaya matahari',waste: false, tip: 'Bagus! Cahaya matahari (alami) menghemat listrik lampu di siang hari.' },
      { id: 'fan',     emoji: '🌀', label: 'Kipas menyala saat ada orang di ruangan', waste: false, tip: 'Kipas dipakai saat dibutuhkan lebih hemat daripada AC.' },
    ],
  },

  // ---- LEVEL 2: drag & drop matching (mencocokkan) ----
  // Match a renewable ENERGY SOURCE to the TECHNOLOGY that harvests it.
  level2: {
    intro: 'Desa Terang ingin memakai energi alternatif yang tak akan habis. Seret setiap SUMBER ENERGI ke teknologi yang tepat.',
    pairs: [
      { id: 'sun',  source: '☀️', sourceLabel: 'Matahari', target: 'Panel Surya',  targetEmoji: '🔆', tip: 'Panel surya mengubah cahaya matahari menjadi listrik.' },
      { id: 'wind', source: '💨', sourceLabel: 'Angin',    target: 'Kincir Angin', targetEmoji: '🌬️', tip: 'Kincir/turbin angin memutar generator menjadi listrik.' },
      { id: 'water',source: '💧', sourceLabel: 'Air',      target: 'Kincir Air',   targetEmoji: '🌊', tip: 'Aliran air memutar kincir untuk menghasilkan listrik (PLTA).' },
      { id: 'bio',  source: '🍃', sourceLabel: 'Biomassa', target: 'Biogas',       targetEmoji: '🔥', tip: 'Sampah organik & kotoran ternak diolah menjadi biogas.' },
    ],
  },

  // ---- LEVEL 3: decision making (pengambilan keputusan / ekonomi) ----
  // Scenarios connecting energy-wise choices to community economic activity.
  level3: {
    intro: 'Warga Desa Terang berdagang dan bekerja. Bantu mereka memilih keputusan yang HEMAT ENERGI, ramah lingkungan, dan menguntungkan.',
    questions: [
      {
        q: 'Bu Sari menjual keripik. Untuk mengeringkan singkong dengan murah dan ramah lingkungan, sebaiknya ia memakai…',
        options: [
          { t: 'Oven listrik besar seharian', ok: false },
          { t: 'Panas sinar matahari (penjemuran)', ok: true },
          { t: 'Membakar ban bekas', ok: false },
        ],
        tip: 'Menjemur memakai energi matahari yang gratis dan tak mencemari udara, sehingga untung Bu Sari lebih besar.',
      },
      {
        q: 'Kelompok tani ingin menyalakan lampu pos ronda di malam hari tanpa tagihan listrik. Pilihan terbaik…',
        options: [
          { t: 'Menyambung kabel dari rumah tetangga', ok: false },
          { t: 'Memasang lampu tenaga surya', ok: true },
          { t: 'Menyalakan genset bensin sepanjang malam', ok: false },
        ],
        tip: 'Lampu tenaga surya menyimpan energi matahari siang hari lalu menyala gratis di malam hari.',
      },
      {
        q: 'Peternak punya banyak kotoran sapi. Cara yang menghasilkan energi sekaligus pemasukan tambahan adalah…',
        options: [
          { t: 'Mengolahnya menjadi biogas dan pupuk', ok: true },
          { t: 'Membuangnya ke sungai', ok: false },
          { t: 'Membiarkannya menumpuk', ok: false },
        ],
        tip: 'Biogas jadi bahan bakar memasak, ampasnya jadi pupuk yang bisa dijual. Hemat dan menambah penghasilan!',
      },
      {
        q: 'Warung Pak Budi ingin menekan biaya listrik di siang hari. Langkah paling hemat adalah…',
        options: [
          { t: 'Menyalakan semua lampu sepanjang hari', ok: false },
          { t: 'Membuka jendela & memakai cahaya matahari, lampu dimatikan', ok: true },
          { t: 'Memasang AC di ruangan terbuka', ok: false },
        ],
        tip: 'Memakai cahaya alami di siang hari memangkas biaya listrik sehingga keuntungan warung bertambah.',
      },
    ],
  },
};

// Star thresholds based on percentage of points earned in a level.
function starsFor(score, maxScore) {
  if (maxScore <= 0) return 0;
  const pct = score / maxScore;
  if (pct >= 0.9) return 3;
  if (pct >= 0.6) return 2;
  if (pct >= 0.3) return 1;
  return 0;
}
