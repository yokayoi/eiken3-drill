const encourageMessages = [
  'すごい！その調子！',
  'やったね！正解だよ！',
  'バッチリ！かっこいい！',
  '天才かも！？',
  'ナイス！どんどんいこう！',
  'パーフェクト！',
  'さすが！よく知ってるね！',
  'グッジョブ！',
];

const wrongMessages = [
  'おしいっ！もう一回見てみよう！',
  'だいじょうぶ！次がんばろう！',
  'まちがえても気にしないで！',
  'ドンマイ！覚えればOK！',
  'ここで覚えちゃおう！',
];

const startMessages = [
  'よーし、がんばろう！',
  '今日も英語の冒険だ！',
  'うさぎちゃんと一緒にがんばろ！',
  'レッツゴー！',
];

const completeMessages = [
  'おつかれさま！よくがんばったね！',
  'すごい！全部やりきったね！',
  'やったー！今日のミッションクリア！',
];

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getEncourageMessage() {
  return pick(encourageMessages);
}

export function getWrongMessage() {
  return pick(wrongMessages);
}

export function getStartMessage() {
  return pick(startMessages);
}

export function getCompleteMessage() {
  return pick(completeMessages);
}

export function getScoreComment(correct: number, total: number) {
  const rate = correct / total;
  if (rate === 1) return 'パーフェクト！天才うさぎ認定！🏆';
  if (rate >= 0.8) return 'すばらしい！ほとんど正解だね！';
  if (rate >= 0.6) return 'いい感じ！もう少しで完璧！';
  if (rate >= 0.4) return 'がんばった！復習してもっと強くなろう！';
  return 'だいじょうぶ！くりかえし練習すればできるようになるよ！';
}
