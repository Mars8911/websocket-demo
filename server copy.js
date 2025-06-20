// server.js
const WebSocket = require('ws');

// 建立 WebSocket 伺服器，監聽 8080 埠
const wss = new WebSocket.Server({ port: 8080 }, () => {
  console.log('WebSocket Server 已啟動：ws://localhost:8080');
});

// 每秒模擬一筆隨機「價格」推送給所有 client
setInterval(() => {
  const price = (Math.random() * 1000).toFixed(2);
  const msg = JSON.stringify({
    type: 'ticker',
    data: { price, time: new Date().toLocaleTimeString() }
  });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}, 1000);

wss.on('connection', ws => {
  console.log('有客戶端連線');

  // 連線時先送一條歡迎訊息
  ws.send(JSON.stringify({ type: 'info', data: '歡迎連上本機行情推送伺服器！' }));

  // 接收到 client 訊息時，broadcast 回去
  ws.on('message', message => {
    console.log('收到客戶端訊息：', message);
    const reply = JSON.stringify({ type: 'echo', data: message });
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(reply);
      }
    });
  });

  ws.on('close', () => console.log('客戶端已斷線'));
  ws.on('error', err => console.error('WS error:', err));
});
