import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Trash2, PlusCircle, Activity, Info } from 'lucide-react';

const CATEGORY_MAP = {
  TRANSPORT: [
    { type: 'FLIGHT_SHORT_HAUL', label: 'Short Haul Flight (<3 hours)', unit: 'km' },
    { type: 'FLIGHT_LONG_HAUL', label: 'Long Haul Flight (>3 hours)', unit: 'km' },
    { type: 'CAR_PETROL', label: 'Petrol Car Ride', unit: 'km' },
    { type: 'CAR_DIESEL', label: 'Diesel Car Ride', unit: 'km' },
    { type: 'CAR_ELECTRIC', label: 'Electric Car Ride', unit: 'km' },
    { type: 'BUS', label: 'Bus Ride', unit: 'km' },
    { type: 'TRAIN', label: 'Train Ride', unit: 'km' }
  ],
  ELECTRICITY: [
    { type: 'ELECTRICITY_GRID', label: 'Grid Electricity Usage', unit: 'kWh' },
    { type: 'ELECTRICITY_SOLAR', label: 'Solar Energy Usage', unit: 'kWh' }
  ],
  FOOD: [
    { type: 'MEAL_VEGAN', label: 'Vegan Meal', unit: 'meals' },
    { type: 'MEAL_VEGETARIAN', label: 'Vegetarian Meal', unit: 'meals' },
    { type: 'MEAL_MEAT', label: 'Meat-based Meal', unit: 'meals' },
    { type: 'MEAL_FISH', label: 'Fish-based Meal', unit: 'meals' }
  ],
  SHOPPING: [
    { type: 'SHOPPING_CLOTHING', label: 'Clothing Purchase', unit: 'items' },
    { type: 'SHOPPING_ELECTRONICS', label: 'Electronics Purchase', unit: 'items' },
    { type: 'SHOPPING_FURNITURE', label: 'Furniture Purchase', unit: 'items' },
    { type: 'SHOPPING_GENERAL', label: 'General Goods', unit: 'kg' }
  ]
};

const ActivityLogging = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      category: 'TRANSPORT',
      activityType: 'CAR_PETROL',
      quantity: 1
    }
  });

  const category = useWatch({ control, name: 'category' });
  const activityType = useWatch({ control, name: 'activityType' });

  // Update activity type and unit when category changes
  useEffect(() => {
    const defaultAct = CATEGORY_MAP[category][0];
    setValue('activityType', defaultAct.type);
  }, [category, setValue]);

  const currentUnit = CATEGORY_MAP[category]?.find(item => item.type === activityType)?.unit || '';

  const fetchLogs = async () => {
    try {
      const response = await api.get('/api/activities');
      if (response.data.success) {
        setLogs(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        category: data.category,
        activityType: data.activityType,
        quantity: parseFloat(data.quantity),
        unit: currentUnit
      };

      const response = await api.post('/api/activities', payload);
      if (response.data.success) {
        toast.success('Activity logged! Emissions: ' + response.data.data.co2e + ' kg CO₂e');
        reset({
          category: data.category,
          activityType: data.activityType,
          quantity: 1
        });
        fetchLogs();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to log activity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return;
    try {
      const response = await api.delete(`/api/activities/${id}`);
      if (response.data.success) {
        toast.success('Log deleted successfully');
        fetchLogs();
      }
    } catch (error) {
      toast.error('Failed to delete activity log');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Log Activity Form */}
      <div className="lg:col-span-1 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-6 rounded-3xl h-fit">
        <h2 className="text-xl font-extrabold mb-6 flex items-center space-x-2">
          <PlusCircle size={20} className="text-primary-500" />
          <span>Log Activity</span>
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Category
            </label>
            <select
              {...register('category')}
              className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100"
            >
              <option value="TRANSPORT">🚗 Transport & Flights</option>
              <option value="ELECTRICITY">⚡ Electricity Usage</option>
              <option value="FOOD">🍔 Food & Meals</option>
              <option value="SHOPPING">🛒 Shopping Items</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Activity Type
            </label>
            <select
              {...register('activityType')}
              className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100"
            >
              {CATEGORY_MAP[category]?.map((item) => (
                <option key={item.type} value={item.type}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Quantity ({currentUnit})
            </label>
            <input
              type="number"
              step="any"
              {...register('quantity', { 
                required: 'Quantity is required',
                min: { value: 0.01, message: 'Quantity must be greater than zero' }
              })}
              className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100 ${errors.quantity ? 'border-red-500' : ''}`}
            />
            {errors.quantity && (
              <span className="text-xs text-red-500 mt-1 block">{errors.quantity.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary-600/20 dark:shadow-primary-600/10 transition duration-150 flex items-center justify-center space-x-2"
          >
            <span>{submitting ? 'Calculating...' : 'Submit & Calculate'}</span>
          </button>
        </form>
      </div>

      {/* Activity Logs History */}
      <div className="lg:col-span-2 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-6 rounded-3xl">
        <h2 className="text-xl font-extrabold mb-6 flex items-center space-x-2">
          <Activity size={20} className="text-primary-500" />
          <span>Carbon Logs History</span>
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-dark-800 text-xs text-slate-400 uppercase font-bold">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Activity</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                  <th className="pb-3 font-semibold text-right">CO₂e Emission</th>
                  <th className="pb-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-800 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/20 transition">
                    <td className="py-3.5 text-slate-500 dark:text-slate-400">
                      {new Date(log.logDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider
                        ${log.category === 'TRANSPORT' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' :
                          log.category === 'ELECTRICITY' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' :
                          log.category === 'FOOD' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                          'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400'}
                      `}>
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3.5 font-medium text-slate-700 dark:text-slate-300">
                      {log.activityType.replaceAll('_', ' ')}
                    </td>
                    <td className="py-3.5 text-right font-medium">
                      {log.quantity} {log.unit}
                    </td>
                    <td className="py-3.5 text-right font-extrabold text-slate-900 dark:text-slate-100">
                      {log.co2e} kg
                    </td>
                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition"
                        title="Delete entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <Info size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-500">No carbon logs yet</p>
            <p className="text-xs text-slate-400 mt-1">Start logging your daily transport, food, electricity, and shopping activities above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogging;
