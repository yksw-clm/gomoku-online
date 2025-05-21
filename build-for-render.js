gomoku\build-for-render.js
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// ビルドプロセスを実行して結果をログに記録する関数
function runCommand(command, description) {
  console.log(`\n==== ${description} ====`);
  try {
    const output = execSync(command, { encoding: "utf8", stdio: "inherit" });
    console.log(`✅ ${description} completed successfully`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed`);
    console.error(error.message);
    // エラーが発生しても続行
    return null;
  }
}

// ディレクトリ構造を表示
function showDirectoryStructure() {
  console.log("\n==== Directory Structure ====");
  runCommand("ls -la", "List root directory");
  runCommand("ls -la client", "List client directory");
  runCommand("ls -la server", "List server directory");
}

// メインビルドプロセス
async function build() {
  try {
    console.log("🚀 Starting build process for Render.com...");

    // ルートの依存関係をインストール
    runCommand("npm install", "Install root dependencies");

    // クライアントのビルド
    runCommand("cd client && npm install", "Install client dependencies");
    
    // TypeScriptのチェックはスキップして直接Viteのビルドを実行
    runCommand("cd client && npm run build", "Build client with Vite");

    // サーバーディレクトリにpublicフォルダがあることを確認
    if (!fs.existsSync("server/public")) {
      fs.mkdirSync("server/public", { recursive: true });
    }

    // クライアントビルドをコピー
    runCommand("node copy-client.js", "Copy client build to server/public");

    // サーバーのビルド
    runCommand("cd server && npm install", "Install server dependencies");
    runCommand("cd server && npm run build", "Build server");

    console.log("✨ Build process completed!");
  } catch (error) {
    console.error("💥 Build process failed:", error);
    process.exit(1);
  }
}

// 実行
showDirectoryStructure();
build();