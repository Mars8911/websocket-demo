// src/App.js
import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [trades, setTrades] = useState([]);
  const logRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    socket.binaryType = 'blob';

    socket.addEventListener('open', () => {
      console.log('✅ 已連線到 Relay Server');
    });

    socket.addEventListener('message', async e => {
      const raw = e.data instanceof Blob ? await e.data.text() : e.data;
      let msg;
      try { msg = JSON.parse(raw); }
      catch { return; }

      if (msg.e === 'trade') {
        const time = new Date(msg.E).toLocaleTimeString();
        const item = { price: msg.p, qty: msg.q, time };
        setTrades(prev => [item, ...prev].slice(0, 50));
      }
    });

    socket.addEventListener('error', err => console.error('WebSocket Error:', err));
    socket.addEventListener('close', () => console.warn('WebSocket 已關閉'));

    return () => socket.close();
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [trades]);

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-center">Binance BTC/USDT 實時成交</h1>

      <div
        ref={logRef}
        className="list-group overflow-auto border"
        style={{ maxHeight: '70vh' }}
      >
        {trades.length === 0
          ? <div className="list-group-item text-center text-muted">
              等待實時資料中…
            </div>
          : trades.map((t, i) => (
              <div
                key={i}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <small className="text-muted me-2">[{t.time}]</small>
                  <span className="me-2">成交</span>
                  <span className="badge bg-primary me-1">{t.price}</span>
                  <span>USDT ×</span>
                  <span className="badge bg-success ms-1">{t.qty}</span>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}

export default App;
