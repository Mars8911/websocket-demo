// src/App.js
import React, { useEffect, useRef, useState } from 'react';
import './App.css'; // 如有對應 CSS，可保留

function App() {
  const [trades, setTrades] = useState([]);
  const logRef = useRef(null);

  useEffect(() => {
    // 1. 與本地 Relay Server 建立連線
    const socket = new WebSocket('ws://localhost:8080');
    socket.binaryType = 'blob';

    socket.addEventListener('open', () => {
      console.log('✅ WebSocket 已連線到 ws://localhost:8080');
    });

    socket.addEventListener('message', async e => {
      // 2. 接到的如果是 Blob，要先轉文字
      const raw = e.data instanceof Blob ? await e.data.text() : e.data;
      let msg;
      try { msg = JSON.parse(raw); }
      catch { return; }

      // 3. 只處理 Binance 逐筆成交（trade）事件
      if (msg.e === 'trade') {
        const time = new Date(msg.E).toLocaleTimeString();
        const item = { price: msg.p, qty: msg.q, time };
        // 保留最新 50 筆
        setTrades(prev => [item, ...prev].slice(0, 50));
      }
    });

    socket.addEventListener('error', err => console.error('WebSocket Error:', err));
    socket.addEventListener('close', () => console.warn('WebSocket 已關閉'));

    return () => socket.close();
  }, []);

  // 4. 每次 trades 更新，自動捲到最上方
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [trades]);

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Binance BTC/USDT 實時成交</h1>
      <div
        ref={logRef}
        style={{
          height: '70vh',
          overflowY: 'auto',
          border: '1px solid #ddd',
          padding: '0.5rem',
          background: '#fafafa'
        }}
      >
        {trades.map((t, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            <span style={{ color: '#888' }}>[{t.time}]</span>{' '}
            <span style={{ fontWeight: 'bold' }}>
              成交 {t.price} USDT × {t.qty}
            </span>
          </div>
        ))}
        {trades.length === 0 && (
          <div style={{ color: '#aaa' }}>等待實時資料中…</div>
        )}
      </div>
    </div>
  );
}

export default App;
