// service.js
const WebSocket = require('ws');

// 1. 本地 WebSocket Server，供前端連線
const wss = new WebSocket.Server({ port: 8080 }, () => {
  console.log('🔥 本地 Relay Server 啟動：ws://localhost:8080');
});

// 2. 直接連到 Binance 的 BTCUSDT 逐筆成交串流
//    無須再發訂閱訊息，直接連上就開始收 trade
const EXCHANGE_URL = 'wss://stream.binance.com:9443/ws/btcusdt@trade';
const exch = new WebSocket(EXCHANGE_URL);

exch.on('open', () => {
  console.log(`✅ 已連上 Binance：${EXCHANGE_URL}`);
});

exch.on('message', data => {
  // Binance 回傳的 data 本身就是 JSON 字串
  // 直接原封不動轉發給所有前端
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
});

exch.on('error', err => {
  console.error('🛑 Binance WS error:', err);
});

exch.on('close', code => {
  console.warn(`⚠️ Binance WS closed (code=${code})，將嘗試重連…`);
  // 簡易重連機制（1 秒後重連）
  setTimeout(() => {
    console.log('🔄 重連 Binance…');
    replacer();
  }, 1000);
});

// 如果需要重連，就把上面的邏輯包成函式
function replacer() {
  exch.removeAllListeners();
  exch = new WebSocket(EXCHANGE_URL);
}

// 3. 處理前端連線
wss.on('connection', ws => {
  console.log('👤 前端 client 已連線');
  ws.send(JSON.stringify({ type: 'info', data: '已連上本地 Relay Server' }));
  ws.on('close', () => console.log('👤 前端 client 已斷線'));
});
