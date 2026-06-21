import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { PurchaseOrder, Supplier, Product } from '../types';
import { getAllPurchaseOrders, createPurchaseOrder, markPurchaseReceived } from '../services/purchaseService';
import { getAllSuppliers } from '../services/supplierService';
import { getAllProducts } from '../services/productService';
import { Modal } from '../components';
import StatusBadge from '../components/admin/StatusBadge';
import { useToast } from '../context/ToastContext';

const AdminPurchasesPage: React.FC = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ supplier_id: '', product_id: '', quantity: '', unit_cost: '' });

  const load = async () => {
    try {
      const [po, sup, prod] = await Promise.all([
        getAllPurchaseOrders(),
        getAllSuppliers(),
        getAllProducts(),
      ]);
      setOrders(po);
      setSuppliers(sup);
      setProducts(prod);
    } catch {
      addToast('Failed to load purchase orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPurchaseOrder({
        supplier_id: form.supplier_id,
        product_id: form.product_id,
        quantity: parseInt(form.quantity),
        unit_cost: parseFloat(form.unit_cost),
      });
      addToast('Purchase order created', 'success');
      setModalOpen(false);
      setForm({ supplier_id: '', product_id: '', quantity: '', unit_cost: '' });
      load();
    } catch {
      addToast('Failed to create purchase order', 'error');
    }
  };

  const handleReceive = async (id: string) => {
    try {
      await markPurchaseReceived(id);
      addToast('Stock updated — purchase received', 'success');
      load();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to receive', 'error');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-600" /></div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-earth-900">Purchase Orders</h1>
          <p className="text-sm text-earth-500 mt-1">Buy inventory from suppliers</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center px-4 py-2 bg-organic-600 text-white rounded-lg hover:bg-organic-700">
          <PlusIcon className="h-5 w-5 mr-2" /> New Purchase Order
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-earth-200">
          <thead className="bg-earth-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Unit Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-earth-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-200">
            {orders.map((po) => (
              <tr key={po.id}>
                <td className="px-6 py-4 text-sm font-medium">{po.product?.name || '—'}</td>
                <td className="px-6 py-4 text-sm">{po.supplier?.name || '—'}</td>
                <td className="px-6 py-4 text-sm">{po.quantity}</td>
                <td className="px-6 py-4 text-sm">₨{Number(po.unit_cost).toLocaleString()}</td>
                <td className="px-6 py-4"><StatusBadge status={po.status} /></td>
                <td className="px-6 py-4">
                  {po.status === 'ordered' && (
                    <button
                      onClick={() => handleReceive(po.id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      Mark Received
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Purchase Order">
        <form onSubmit={handleCreate} className="space-y-4">
          <select required value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
            <option value="">Select supplier</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select required value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
            <option value="">Select product</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input required type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          <input required type="number" step="0.01" min="0" placeholder="Unit cost (₨)" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          <button type="submit" className="w-full btn-primary py-2">Create Order</button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPurchasesPage;
