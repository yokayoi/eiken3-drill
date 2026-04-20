const REWARDS_KEY = 'eiken3-rewards';

export interface Reward {
  id: string;
  name: string;
  emoji: string;
  rarity: 'normal' | 'rare' | 'super';
  description: string;
}

const ALL_REWARDS: Reward[] = [
  // Normal (60%+)
  { id: 'penlight', name: 'ペンライト', emoji: '🔦', rarity: 'normal', description: 'ライブで振ろう！' },
  { id: 'uchiwa', name: 'うちわ', emoji: '🪭', rarity: 'normal', description: '推しの名前入り！' },
  { id: 'bracelet', name: 'ブレスレット', emoji: '📿', rarity: 'normal', description: 'キラキラ光る！' },
  { id: 'sticker', name: 'ステッカー', emoji: '✨', rarity: 'normal', description: 'ノートに貼ろう！' },
  { id: 'badge', name: '缶バッジ', emoji: '🏵️', rarity: 'normal', description: 'カバンにつけよう！' },
  { id: 'keychain', name: 'キーホルダー', emoji: '🔑', rarity: 'normal', description: 'お気に入り！' },
  // Rare (80%+)
  { id: 'photocard', name: 'フォトカード', emoji: '🃏', rarity: 'rare', description: 'レアなトレカ！' },
  { id: 'headset', name: 'ヘッドセット', emoji: '🎧', rarity: 'rare', description: 'K-POP聴き放題！' },
  { id: 'mic', name: 'マイク', emoji: '🎤', rarity: 'rare', description: 'センターで歌おう！' },
  { id: 'sunglasses', name: 'サングラス', emoji: '🕶️', rarity: 'rare', description: 'クールにキメる！' },
  { id: 'cheki', name: 'チェキ', emoji: '📸', rarity: 'rare', description: '特別な一枚！' },
  // Super Rare (100%)
  { id: 'crown', name: 'ステージ王冠', emoji: '👑', rarity: 'super', description: 'クイーンの証！' },
  { id: 'trophy', name: 'トロフィー', emoji: '🏆', rarity: 'super', description: 'パーフェクト！' },
  { id: 'costume', name: 'ステージ衣装', emoji: '👗', rarity: 'super', description: 'キラキラ衣装！' },
  { id: 'ticket', name: 'VIPチケット', emoji: '🎫', rarity: 'super', description: '最前列！' },
  { id: 'album', name: '限定アルバム', emoji: '💿', rarity: 'super', description: 'サイン入り！' },
];

function loadCollected(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REWARDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCollected(ids: string[]) {
  localStorage.setItem(REWARDS_KEY, JSON.stringify(ids));
}

export function getCollectedRewards(): Reward[] {
  const ids = loadCollected();
  return ALL_REWARDS.filter(r => ids.includes(r.id));
}

export function getAllRewards(): Reward[] {
  return ALL_REWARDS;
}

export function isCollected(id: string): boolean {
  return loadCollected().includes(id);
}

export function determineReward(correct: number, total: number): Reward | null {
  const rate = correct / total;
  if (rate < 0.6) return null;

  const collected = loadCollected();
  let pool: Reward[];

  if (rate === 1) {
    pool = ALL_REWARDS.filter(r => r.rarity === 'super' && !collected.includes(r.id));
    if (pool.length === 0) pool = ALL_REWARDS.filter(r => r.rarity === 'rare' && !collected.includes(r.id));
  } else if (rate >= 0.8) {
    pool = ALL_REWARDS.filter(r => r.rarity === 'rare' && !collected.includes(r.id));
    if (pool.length === 0) pool = ALL_REWARDS.filter(r => r.rarity === 'normal' && !collected.includes(r.id));
  } else {
    pool = ALL_REWARDS.filter(r => r.rarity === 'normal' && !collected.includes(r.id));
  }

  // All collected at this tier? give any uncollected
  if (pool.length === 0) {
    pool = ALL_REWARDS.filter(r => !collected.includes(r.id));
  }

  // Truly all collected
  if (pool.length === 0) return null;

  const reward = pool[Math.floor(Math.random() * pool.length)];
  saveCollected([...collected, reward.id]);
  return reward;
}

export function getCollectionCount(): { collected: number; total: number } {
  return { collected: loadCollected().length, total: ALL_REWARDS.length };
}
