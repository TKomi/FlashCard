import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// log
if(process.env.REACT_APP_COMMIT_SHA) {
  console.info('アプリケーション コミットID: ', process.env.REACT_APP_COMMIT_SHA);
} else {
  console.warn('環境変数`REACT_APP_COMMIT_SHA`を読み込めませんでした。 .env ファイルを配置し忘れましたか？');
}

// Google Analytics
const googleAnalyticsId = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;
document.write(`<script async src="https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}"></script>`);
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', googleAnalyticsId);

// render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

