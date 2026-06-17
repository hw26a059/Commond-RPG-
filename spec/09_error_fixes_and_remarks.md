# 9. 実装時の不具合修正と警告事項（重要開発メタ情報）

本ドキュメントは、別AIモデルが本作のプログラム（React/TypeScript環境）を構築または修復する際に、過去に発生した重大なシンタックスエラーやロジック破損を再発させないための「プログラム修正点および実装のチェックリスト」です。

---

## 9.1 戦闘シミュレーション中のロジック不整合（App.tsx等）

### ① 生存判定とターゲット選定エラー
- **不具合内容**: 配列参照や型キャスト、パッチ置換時の崩れにより、敵がターゲット（生存している味方キャラクター）をランダムで決定する際、対象の配列アクセス記述が中途半端に裁断され、エラー（`Expected "]" but found "if"` 等）を引き起こす不具合が発生。
- **本来のあるべき実装（修正点）**:
  - `currentChars` から生存者（`hp > 0`）を適切に抽出し、その中からランダムにインデックスを算出する。
  ```typescript
  const aliveChars = currentChars.filter(c => c.hp > 0);
  if (aliveChars.length === 0) return;
  const targetChar = aliveChars[Math.floor(Math.random() * aliveChars.length)];
  ```

### ② 敵モンスター個別状態異常付与ロジックの破壊
- **不具合内容**: 「嵐翼の有翼獣」などの特定の敵が特殊攻撃を行った際、確率で特定の状態異常（風化：DECAY、スタン：STANなど）を付与する境界処理や条件分岐が、パッチ破損により誤った記述に変化していた。
- **本来のあるべき実装（修正点）**:
  - 攻撃側の敵の名称（`enemy.name`）または属性、ボスタイプ「タイダル」の名称一致を検出し、重複付与を防いだ上で状態異常をプッシュする。

---

## 9.2 JSX階層とコンポーネント閉じタグの不整合

### ① BattlefieldおよびCommandSelector描画階層の破損
- **不具合内容**: １画面構成で左右2カラムや上下配置を制御する際、パッチの二重差し込みや不正文字の混入によって、`<main>` の閉じタグや `Battlefield` / `CommandSelector` 要素の差し込みでネストが途切れ、ビルドが失敗する Syntax Error が発生。
- **本来のあるべき実装（修正点）**:
  - 主なレンダリングコンポーネント（レイアウト関係の `div`, `main`, `header`, `footer` など）の対応関係を以下のように正しく整合させる。
  ```tsx
  // 正しいJSX描画ネストの骨組み
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <header>...</header>
      <main className="flex-1">
        {isEditorOpen ? (
          <Editor ... />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <EventBanner ... />
              <Battlefield ... />
              <CommandSelector ... />
            </div>
            <div>
              <LogView ... />
              <ProgressionPanel ... />
            </div>
          </div>
        )}
      </main>
      <footer>...</footer>
    </div>
  );
  ```

---

## 9.3 縦幅1/3圧縮に伴うUIパラメータの不適合

- **不具合内容**: パソコンの大画面表示を前提とした際、以前のレイアウトでは要素間パディングや余白が広く、画面全体が縦に伸びすぎてスクロールしないと全ての情報にアクセスできない致命的な視認性の不具合があった。
- **本来のあるべき実装（修正点）**:
  - コマンドスロット選択部分のレイアウトを「縦並び」から「横並び（2列構成：`grid-cols-2`）」へ構造変更し高さを物理的に圧縮すること。
  - 装飾用の過剰なスペースを除去し、フォントサイズを `text-xs` から一部 `text-3xs` や `text-4xs` などの極小フォント高密度レイアウトに変更して、スクロール不要の1画面（1/3縮小）の中に収めること。
