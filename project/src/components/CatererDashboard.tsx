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
    proteinGrams: '', // Changed from 'protein' to match database field
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
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!newItem.name || !newItem.price || !newItem.items) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      await menuService.createMenuItem({
        name: newItem.name,
        description: newItem.description,
        items: newItem.items,
        price: Number(newItem.price || 0),
        calories: Number(newItem.calories || 0),
        proteinGrams: Number(newItem.proteinGrams || 0),
        category: newItem.category as any,
        allergens: newItem.allergens.split(',').map(a => a.trim()).filter(Boolean),
        imageUrl: newItem.imageUrl
      } as MenuItemData);
      await loadData();
      setNewItem({ 
        name: '', 
        description: '', 
        items: '', 
        price: '', 
        calories: '', 
        proteinGrams: '', 
        category: 'lunchbox', 
        allergens: '', 
        imageUrl: '' 
      });
      alert('Menu item created successfully!');
    } catch (error) {
      console.error('Error creating menu item:', error);
      alert('Failed to create menu item. Please try again.');
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
            <input 
              className="border p-2 rounded" 
              placeholder="Name*" 
              value={newItem.name} 
              onChange={e=>setNewItem({...newItem,name:e.target.value})}
            />
            <input 
              className="border p-2 rounded" 
              placeholder="Price*" 
              type="number"
              value={newItem.price} 
              onChange={e=>setNewItem({...newItem,price:e.target.value})}
            />
            <input 
              className="border p-2 rounded" 
              placeholder="Items*" 
              value={newItem.items} 
              onChange={e=>setNewItem({...newItem,items:e.target.value})}
            />
            <select 
              className="border p-2 rounded" 
              value={newItem.category} 
              onChange={e=>setNewItem({...newItem,category:e.target.value})}
            >
              <option value="lunchbox">Lunchbox</option>
              <option value="fruit_bowl">Fruit Bowl</option>
              <option value="other">Other</option>
            </select>
            <input 
              className="border p-2 rounded" 
              placeholder="Calories" 
              type="number"
              value={newItem.calories} 
              onChange={e=>setNewItem({...newItem,calories:e.target.value})}
            />
            <input 
              className="border p-2 rounded" 
              placeholder="Protein (g)" 
              type="number"
              value={newItem.proteinGrams} 
              onChange={e=>setNewItem({...newItem,proteinGrams:e.target.value})}
            />
            <input 
              className="border p-2 rounded col-span-2" 
              placeholder="Allergens (comma separated)" 
              value={newItem.allergens} 
              onChange={e=>setNewItem({...newItem,allergens:e.target.value})}
            />
            <input 
              className="border p-2 rounded col-span-2" 
              placeholder="Image URL" 
              value={newItem.imageUrl} 
              onChange={e=>setNewItem({...newItem,imageUrl:e.target.value})}
            />
            <textarea 
              className="border p-2 rounded col-span-2" 
              placeholder="Description" 
              value={newItem.description} 
              onChange={e=>setNewItem({...newItem,description:e.target.value})}
            />
          </div>
          <button 
            disabled={loading || !newItem.name || !newItem.price || !newItem.items} 
            onClick={handleCreate} 
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Menu Item'}
          </button>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="font-semibold mb-2">Menu Items ({menuItems.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {menuItems.map((m:any)=>(
              <div key={m.id} className="border rounded p-2 flex justify-between">
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-sm text-gray-600">₹{m.price}</div>
                  <div className="text-xs text-gray-500">{m.description}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {m.calories} cal • {m.protein_grams}g protein
                  <br />
                  Category: {m.category}
                </div>
              </div>
            ))}
            {menuItems.length === 0 && (
              <div className="text-gray-500 text-center py-4">No menu items yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatererDashboard;