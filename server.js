// server.js
const WebSocket = require('ws');

// 建立 WebSocket 伺服器，監聽 8080 埠
const wss = new WebSocket.Server({ port: 8080 }, () => {
  console.log('WebSocket Server 已啟動：ws://localhost:8080');
});

// 當有客戶端連線時
wss.on('connection', function connection(ws, req) {
  console.log('新的客戶端連線：', req.socket.remoteAddress);

  // 接收客戶端訊息
  ws.on('message', function incoming(message) {
    console.log('收到客戶端訊息：', message);

    // 廣播給所有連線中的客戶端
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`伺服器回覆：${message}`);
      }
    });
  });

  // 連線關閉
  ws.on('close', () => {
    console.log('客戶端已斷線');
  });

  // 初始歡迎訊息
  ws.send('歡迎連上本機 WebSocket Server！');
});
