const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

/**
 * npm run build で実行されるスクリプト
 * .env ファイルに Git の HEAD コミット ID を書き込む
 * .env ファイルからホームページURLを読み込んで、package.jsonのhomepageに設定する
 */

// Git の HEAD コミット ID を取得
const commitId = execSync('git rev-parse HEAD').toString().trim();

// 既存の.envファイルの内容
let env = fs.readFileSync('.env', 'utf-8');

// .env ファイルに書き込む内容
if (env.match(/^REACT_APP_COMMIT_SHA=/)) {
  // 既にREACT_APP_COMMIT_SHAが書き込まれている場合は置換
  env = env.replace(/^REACT_APP_COMMIT_SHA=.+$/m, `REACT_APP_COMMIT_SHA=${commitId}`);
} else {
  // まだREACT_APP_COMMIT_SHAが書き込まれていない場合は追記
  env += `REACT_APP_COMMIT_SHA=${commitId}\n`;
}

// .env ファイルに書き込み
fs.writeFileSync('.env', env);


// .env ファイルからホームページURLを読み込む
const homepage = env.match(/REACT_APP_HOMEPAGE_URL=(.+)/)[1];

// package.jsonのhomepageに設定する
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = require(packageJsonPath);
packageJson.homepage = homepage;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
