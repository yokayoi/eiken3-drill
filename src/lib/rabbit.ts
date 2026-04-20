const encourageMessages = [
  'さらちゃんすごい！その調子！💃',
  'やったね！正解だよ！🎵',
  'バッチリ！さすがさらちゃん！',
  '天才かも！？らんちゃんびっくり！',
  'ナイス！どんどんいこう！🎶',
  'パーフェクト！ダンスしちゃう！💃',
  'さらちゃんかっこいい！',
  'グッジョブ！ステージに立てるよ！',
];

const wrongMessages = [
  'おしいっ！もう一回見てみよう！',
  'だいじょうぶ！次がんばろう！',
  'まちがえても気にしないで！らんちゃんがついてるよ！',
  'ドンマイ！覚えればOK！🎵',
  'ここで覚えちゃおう！さらちゃんならできる！',
];

const startMessages = [
  'よーし、がんばろう！',
  '今日も英語のステージだよ！🎤',
  'らんちゃんと一緒にがんばろ！💃',
  'レッツゴー！さらちゃん！✨',
];

const blackMessages = [
  'なにこの点数！ちゃんとやりなさいよ！💢',
  'さらちゃん…ふざけてるの？もう一回！💢',
  'こんな点数じゃステージに立てないわよ！💢',
  'もっと本気出しなさい！💢💢',
  'はぁ？これで終わり？甘いわね！💢',
];

const blackFollowUp = [
  'だいじょうぶだよさらちゃん！ブラックらんちゃんはこわいけど、さらちゃんならできるよ！もう一回やってみよ！💕',
  'ブラックらんちゃんは厳しいけど…らんちゃんはさらちゃんの味方だよ！一緒にがんばろ！💕',
  'こわかったね…でもらんちゃんがついてるから！もう一回チャレンジしよ！💕',
  'ブラックらんちゃん怒っちゃったけど…さらちゃんは絶対できるよ！らんちゃんが応援する！💕',
];

const danceTimeMessages = [
  'さらちゃん最高！ダンスタイム！💃🎵',
  'すごすぎ！一緒に踊ろう！💃✨',
  'やったー！K-POPダンスタイム！🎤💃',
  'さらちゃん天才！らんちゃん踊っちゃう！💃💕',
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

export function getBlackMessage() {
  return pick(blackMessages);
}

export function getBlackFollowUp() {
  return pick(blackFollowUp);
}

export function getDanceTimeMessage() {
  return pick(danceTimeMessages);
}

export function getScoreComment(correct: number, total: number) {
  const rate = correct / total;
  if (rate === 1) return 'パーフェクト！さらちゃんは最強アイドル！👑';
  if (rate >= 0.8) return 'すばらしい！ほとんど正解！グッズゲットだよ！🎁';
  if (rate >= 0.6) return 'いい感じ！グッズもらえるよ！もっとレアなのねらおう！';
  if (rate >= 0.4) return '…';  // ブラックらんちゃんに任せる
  return '…';
}
