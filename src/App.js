import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const PAIRS = [
  { label: 'BTC/USDT', value: 'btcusdt' },
  { label: 'ETH/USDT', value: 'ethusdt' },
  { label: 'DOGE/USDT', value: 'dogeusdt' },
];

export default function App() {
    
  const [symbol, setSymbol] = useState(PAIRS[0].value);
  const [trades, setTrades] = useState([]);
  const logRef = useRef(null);

  useEffect(() => {
    const url = `wss://stream.binance.com:9443/ws/${symbol}@trade`;
    const socket = new WebSocket(url);
    socket.binaryType = 'blob';

    socket.addEventListener('open', () => {
      console.log(`✅ 已連上 Binance：${symbol}@trade`);
      setTrades([]); // 清空舊資料
    });

    socket.addEventListener('message', async e => {
      const raw = e.data instanceof Blob ? await e.data.text() : e.data;
      const msg = JSON.parse(raw);
      if (msg.e === 'trade') {
        const time = new Date(msg.E).toLocaleTimeString();
        const item = { time, price: msg.p, qty: msg.q };
        setTrades(prev => [item, ...prev].slice(0, 50));
      }
    });

    return () => socket.close();
  }, [symbol]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [trades]);

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-center">Binance 實時成交</h1>

      {/* 頁籤切換 */}
      <ul className="nav nav-tabs justify-content-center mb-3">
        {PAIRS.map(p => (
          <li className="nav-item" key={p.value}>
            <button
              className={`nav-link ${symbol === p.value ? 'active' : ''}`}
              onClick={() => setSymbol(p.value)}
            >
              {p.label}
            </button>
          </li>
        ))}
      </ul>

      {/* 成交清單 */}
      <div
        ref={logRef}
        className="list-group overflow-auto border"
        style={{ maxHeight: '60vh' }}
      >
        {trades.length === 0
          ? <div className="list-group-item text-center text-muted">
              等待 {symbol.toUpperCase()} 實時資料…
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
                  <span>×</span>
                  <span className="badge bg-success ms-1">{t.qty}</span>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}
