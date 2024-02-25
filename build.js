const fs = require('fs');
const { execSync } = require('child_process');

/**
 * npm run build で実行されるスクリプト
 * .env ファイルに Git の HEAD コミット ID を書き込む
 */

// Git の HEAD コミット ID を取得
const commitId = execSync('git rev-parse HEAD').toString().trim();

// .env ファイルに書き込む内容
const content = `REACT_APP_COMMIT_SHA=${commitId}\n`;

// .env ファイルに書き込み
fs.writeFileSync('.env', content);
