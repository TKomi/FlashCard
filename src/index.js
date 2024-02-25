import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

if(process.env.REACT_APP_COMMIT_SHA) {
  console.info('アプリケーション コミットID: ', process.env.REACT_APP_COMMIT_SHA);
} else {
  console.warn('環境変数`REACT_APP_COMMIT_SHA`を読み込めませんでした。 .env ファイルを配置し忘れましたか？');
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

