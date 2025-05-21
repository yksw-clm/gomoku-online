const fs = require("fs-extra");
const path = require("path");

// ソースとターゲットのディレクトリパスを設定
const sourceDir = path.join(__dirname, "client/dist");
const targetDir = path.join(__dirname, "server/public");

// ディレクトリが存在するか確認
if (!fs.existsSync(sourceDir)) {
  console.error("Error: Source directory does not exist:", sourceDir);
  process.exit(1);
}

// 公開ディレクトリを作成
fs.ensureDirSync(targetDir);

try {
  // ファイルをコピー
  fs.copySync(sourceDir, targetDir);
  console.log("Successfully copied client build to server/public");
} catch (err) {
  console.error("Error copying client build:", err);
  process.exit(1);
}
