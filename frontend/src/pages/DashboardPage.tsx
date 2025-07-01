import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Order {
  id: string;
  asset: string;
  amount: number;
  leverage: number;
  status: 'OPEN' | 'CLOSED';
  profitLoss?: number;
}

interface BetsResponse {
  orders: Order[];
  balance: number;
}

const API = import.meta.env.VITE_API_URL;

const DashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get<BetsResponse>(`${API}/bets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.orders);
      setBalance(res.data.balance);
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-lg">Saldo Fictício: {balance.toFixed(2)} USDT</p>
      <table className="w-full mt-4">
        <thead>
          <tr>
            <th>Ativo</th><th>Qtd</th><th>Lev.</th><th>Status</th><th>P/L</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.asset}</td>
              <td>{o.amount}</td>
              <td>{o.leverage}×</td>
              <td>{o.status}</td>
              <td>{o.profitLoss?.toFixed(2) ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardPage;
