import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Utensils,
  Sparkles,
  ChefHat,
} from 'lucide-react';

export default function MenuPage() {
  const { menuItems, inventoryItems, createOrUpdateMenuItem, deleteMenuItem, showToast } = useBusiness();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Main Course');
  const [price, setPrice] = useState(350);
  const [costPrice, setCostPrice] = useState(100);
  const [foodType, setFoodType] = useState('veg');
  const [preparationTime, setPreparationTime] = useState(15);
  const [kitchenStation, setKitchenStation] = useState('Kitchen');
  const [image, setImage] = useState('');
  const [modifiers, setModifiers] = useState([]);
  const [recipe, setRecipe] = useState([]);

  const categories = ['All', 'Starters', 'Main Course', 'Rice & Biryani', 'Breads', 'Desserts', 'Beverages'];

  const filteredItems = menuItems.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setCategory('Main Course');
    setPrice(350);
    setCostPrice(100);
    setFoodType('veg');
    setPreparationTime(15);
    setKitchenStation('Kitchen');
    setImage('');
    setModifiers([]);
    setRecipe([]);
    setShowItemModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description || '');
    setCategory(item.category);
    setPrice(item.price);
    setCostPrice(item.costPrice || 0);
    setFoodType(item.foodType || 'veg');
    setPreparationTime(item.preparationTime || 15);
    setKitchenStation(item.kitchenStation || 'Kitchen');
    setImage(item.image || '');
    setModifiers(item.modifiers || []);
    setRecipe(item.recipe || []);
    setShowItemModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!name || !price) return;

    try {
      await createOrUpdateMenuItem({
        id: editingItem ? editingItem.id : undefined,
        name,
        description,
        category,
        price: Number(price),
        costPrice: Number(costPrice),
        foodType,
        preparationTime: Number(preparationTime),
        kitchenStation,
        image,
        modifiers,
        recipe,
      });

      setShowItemModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to save menu item', 'error');
    }
  };

  const handleAddRecipeRow = () => {
    setRecipe((prev) => [...prev, { ingredientId: '', ingredientName: '', quantity: 0.1, unit: 'kg' }]);
  };

  const handleAddModifierGroup = () => {
    setModifiers((prev) => [
      ...prev,
      { name: 'Spice Level', required: false, options: [{ name: 'Mild', price: 0 }, { name: 'Extra Spicy', price: 0 }] },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Menu Catalog Management</h1>
          <p className="text-sm text-warm-gray mt-0.5">
            Configure dishes, prices, food types, modifiers, kitchen routing stations, and ingredient recipes.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-green-bottle text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-bottle/90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Menu Item
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-warm-gray" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone/60 bg-white text-sm focus:outline-none focus:border-green-bottle"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-green-bottle text-white shadow-subtle'
                  : 'bg-white text-charcoal/70 border border-stone hover:bg-cream'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Item Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-stone/40 p-4 space-y-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      item.foodType === 'non-veg' ? 'bg-rose-600' : 'bg-emerald-600'
                    }`}
                  />
                  <h3 className="font-extrabold text-charcoal text-base">{item.name}</h3>
                </div>
                <span className="text-xs font-bold text-warm-gray bg-cream px-2.5 py-1 rounded-lg border border-stone">
                  {item.category}
                </span>
              </div>

              <p className="text-xs text-warm-gray mt-1 line-clamp-2">{item.description || 'No description provided.'}</p>

              <div className="flex items-center gap-3 text-xs text-warm-gray mt-3 pt-2 border-t border-stone/30">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-green-bottle" /> {item.preparationTime} mins
                </span>
                <span className="flex items-center gap-1 font-semibold text-charcoal">
                  <ChefHat className="w-3.5 h-3.5 text-amber-600" /> {item.kitchenStation}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone/40 flex items-center justify-between">
              <div>
                <span className="text-lg font-black text-green-bottle">₹{item.price}</span>
                {item.costPrice > 0 && (
                  <span className="text-[11px] text-warm-gray block">Cost: ₹{item.costPrice}</span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="p-2 bg-stone-100 text-charcoal rounded-xl hover:bg-stone-200"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteMenuItem(item.id)}
                  className="p-2 bg-rose-50 text-rose-700 rounded-xl hover:bg-rose-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Menu Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveItem}
            className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone space-y-4"
          >
            <h2 className="text-xl font-bold text-charcoal">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>

            <div>
              <label className="text-xs font-semibold text-charcoal">Dish Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-charcoal">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
                >
                  {categories.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Food Type *</label>
                <select
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
                >
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-Veg</option>
                  <option value="vegan">Vegan</option>
                  <option value="egg">Egg</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-charcoal">Selling Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Cost Price (₹)</label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Prep Time (mins)</label>
                <input
                  type="number"
                  value={preparationTime}
                  onChange={(e) => setPreparationTime(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal">Kitchen Station *</label>
              <select
                value={kitchenStation}
                onChange={(e) => setKitchenStation(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
              >
                <option value="Kitchen">Kitchen</option>
                <option value="Bar">Bar</option>
                <option value="Grill">Grill</option>
                <option value="Dessert">Dessert</option>
              </select>
            </div>

            {/* Recipe Section */}
            <div className="border-t border-stone/50 pt-3 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-warm-gray">
                  Recipe Ingredients (Auto Inventory Deduction)
                </h4>
                <button
                  type="button"
                  onClick={handleAddRecipeRow}
                  className="text-xs font-bold text-green-bottle hover:underline"
                >
                  + Add Ingredient
                </button>
              </div>

              {recipe.map((rec, rIdx) => (
                <div key={rIdx} className="flex gap-2 items-center text-xs">
                  <select
                    value={rec.ingredientId}
                    onChange={(e) => {
                      const selectedIng = inventoryItems.find((i) => i.id === e.target.value);
                      const next = [...recipe];
                      next[rIdx].ingredientId = e.target.value;
                      next[rIdx].ingredientName = selectedIng ? selectedIng.name : '';
                      setRecipe(next);
                    }}
                    className="flex-1 p-2 border border-stone rounded-xl"
                  >
                    <option value="">Select ingredient...</option>
                    {inventoryItems.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.unit})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    step="0.01"
                    placeholder="Qty"
                    value={rec.quantity}
                    onChange={(e) => {
                      const next = [...recipe];
                      next[rIdx].quantity = Number(e.target.value);
                      setRecipe(next);
                    }}
                    className="w-20 p-2 border border-stone rounded-xl"
                  />

                  <button
                    type="button"
                    onClick={() => setRecipe(recipe.filter((_, i) => i !== rIdx))}
                    className="text-rose-600 font-bold p-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="flex-1 py-2.5 bg-stone-100 text-charcoal font-semibold text-sm rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-green-bottle text-white font-bold text-sm rounded-xl hover:bg-green-bottle/90"
              >
                Save Dish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
