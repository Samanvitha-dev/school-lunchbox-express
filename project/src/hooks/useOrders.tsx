import { useState, useEffect } from 'react';
import orderService from '../services/orderService';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getOrders();
      setOrders(response.orders);
    } catch (err) {
      setError(err);
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.createOrder(orderData);
      await fetchOrders(); // Refresh orders
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setError(null);
      const response = await orderService.updateOrderStatus(orderId, status);
      await fetchOrders(); // Refresh orders
      return response;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus
  };
};