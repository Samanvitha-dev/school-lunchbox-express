import React, { useEffect, useMemo, useState } from 'react';
import { Package, Star, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import menuService, { MenuItemData } from '../services/menuService';
import orderService from '../services/orderService';

// Minimal safe placeholders where needed
const mockFeedback: any[] = [];

const CatererDashboard: React.FC = () => {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    items: '',
    price: '',
    calories: '',
    protein: '',
    category: 'lunchbox',
    allergens: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);

  const averageRating = 0;
  const totalCustomers = 0;

  const loadData = async () => {
    try {
      const menuResp = await menuService.getMenuItems();
      setMenuItems(menuResp.items || []);
      const ordersResp = await orderService.getOrders();
      setOrders(ordersResp.orders || []);
    } catch {}
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    try {
      setLoading(true);
      await menuService.createMenuItem({
        name: newItem.name,
        description: newItem.description,
        price: Number(newItem.price || 0),
        calories: Number(newItem.calories || 0),
        proteinGrams: Number(newItem.protein || 0),
        category: newItem.category as any,
        allergens: newItem.allergens.split(',').map(a => a.trim()).filter(Boolean),
        imageUrl: newItem.imageUrl
      } as MenuItemData);
      await loadData();
      setNewItem({ name: '', description: '', items: '', price: '', calories: '', protein: '', category: 'lunchbox', allergens: '', imageUrl: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">{/* keep UI minimal to compile */}
      <h2 className="text-xl font-bold mb-4">Caterer Dashboard</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="font-semibold mb-2">Add Menu Item</h3>
          <div className="grid grid-cols-2 gap-2">
            <input className="border p-2 rounded" placeholder="Name" value={newItem.name} onChange={e=>setNewItem({...newItem,name:e.target.value})}/>
            <input className="border p-2 rounded" placeholder="Price" value={newItem.price} onChange={e=>setNewItem({...newItem,price:e.target.value})}/>
            <input className="border p-2 rounded" placeholder="Calories" value={newItem.calories} onChange={e=>setNewItem({...newItem,calories:e.target.value})}/>
            <input className="border p-2 rounded" placeholder="Protein (g)" value={newItem.protein} onChange={e=>setNewItem({...newItem,protein:e.target.value})}/>
            <input className="border p-2 rounded col-span-2" placeholder="Allergens (comma)" value={newItem.allergens} onChange={e=>setNewItem({...newItem,allergens:e.target.value})}/>
            <input className="border p-2 rounded col-span-2" placeholder="Image URL" value={newItem.imageUrl} onChange={e=>setNewItem({...newItem,imageUrl:e.target.value})}/>
          </div>
          <button disabled={loading} onClick={handleCreate} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded">Create</button>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="font-semibold mb-2">Menu Items</h3>
          <div className="space-y-2">
            {menuItems.map((m:any)=>(
              <div key={m.id} className="border rounded p-2 flex justify-between">
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-sm text-gray-600">₹{m.price}</div>
                </div>
                <div className="text-xs text-gray-500">{m.calories} cal • {m.protein_grams}g</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatererDashboard;