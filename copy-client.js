const fs = require("fs-extra");
const path = require("path");

// ソースとターゲットのディレクトリパスを設定
const sourceDir = path.join(__dirname, "client/dist");
const targetDir = path.join(__dirname, "server/public");

console.log("Source directory:", sourceDir);
console.log("Target directory:", targetDir);

// ディレクトリが存在するか確認
try {
  // sourceディレクトリの内容を表示
  if (fs.existsSync(sourceDir)) {
    console.log("Source directory contents:");
    const files = fs.readdirSync(sourceDir);
    console.log(files);
  } else {
    console.error("Error: Source directory does not exist:", sourceDir);
    // ファイルが見つからない場合は作成
    fs.mkdirSync(sourceDir, { recursive: true });
    console.log("Created empty source directory");
  }

  // 公開ディレクトリを作成
  fs.ensureDirSync(targetDir);
  console.log("Target directory created/verified");

  // ファイルをコピー
  try {
    fs.copySync(sourceDir, targetDir);
    console.log("Successfully copied client build to server/public");

    // ターゲットディレクトリの内容を表示
    console.log("Target directory contents:");
    const targetFiles = fs.readdirSync(targetDir);
    console.log(targetFiles);
  } catch (copyErr) {
    console.error("Error copying files:", copyErr);

    // 個別のファイルをコピーしてみる
    try {
      const files = fs.readdirSync(sourceDir);
      files.forEach((file) => {
        const srcPath = path.join(sourceDir, file);
        const destPath = path.join(targetDir, file);
        try {
          fs.copySync(srcPath, destPath);
          console.log(`Copied: ${file}`);
        } catch (err) {
          console.error(`Failed to copy ${file}:`, err);
        }
      });
    } catch (err) {
      console.error(
        "Failed to read source directory for individual file copy:",
        err
      );
    }
  }
} catch (err) {
  console.error("Error in copy process:", err);
  process.exit(1);
}
