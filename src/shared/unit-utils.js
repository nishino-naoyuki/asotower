// ユニットAI・行動ロジック用の汎用関数をまとめるファイル
// 例: 距離計算、最も近い敵の取得など

// 2点間の距離（タイル単位）を計算
export function distanceBetween(a, b) {
  if (!a || !b) return 0;
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// 配列から最も近いユニットを取得
export function findNearest(self, units) {
  var minDist = 99999;
  var nearest = null;
  for (var i = 0; i < units.length; i++) {
    var dist = distanceBetween(self.position, units[i].position);
    if (dist < minDist) {
      minDist = dist;
      nearest = units[i];
    }
  }
  return nearest;
}

// 他にも必要な汎用関数を追加してください
