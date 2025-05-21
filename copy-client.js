const fs = require("fs-extra");
const path = require("path");

// ビルドディレクトリを設定
const sourceDir = path.join(__dirname, "client/dist");
const targetDir = path.join(__dirname, "server/public");

// ディレクトリの存在確認と作成
try {
  // targetディレクトリが存在しない場合は作成
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // ファイルをコピー
  fs.copySync(sourceDir, targetDir, { overwrite: true });
  console.log("Successfully copied client build to server/public");
} catch (err) {
  console.error("Error copying client build:", err);
  process.exit(1);
}
