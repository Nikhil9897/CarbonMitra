import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Target, PlusCircle, Trash2, Calendar, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedGoalDetails, setSelectedGoalDetails] = useState({});
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      targetReduction: 20,
      periodDays: 14,
      startDate: new Date().toISOString().split('T')[0]
    }
  });

  const fetchGoals = async () => {
    try {
      const response = await api.get('/api/goals');
      if (response.data.success) {
        const goalList = response.data.data;
        setGoals(goalList);
        // Load details (progress and prediction) for each active goal
        goalList.forEach(goal => {
          if (goal.status === 'ACTIVE') {
            fetchGoalDetails(goal.id);
          }
        });
      }
    } catch (error) {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const fetchGoalDetails = async (id) => {
    try {
      const [progressRes, predictionRes] = await Promise.all([
        api.get(`/api/goals/${id}/progress`),
        api.get(`/api/goals/${id}/prediction`)
      ]);
      if (progressRes.data.success && predictionRes.data.success) {
        setSelectedGoalDetails(prev => ({
          ...prev,
          [id]: {
            progress: progressRes.data.data,
            prediction: predictionRes.data.data
          }
        }));
      }
    } catch (err) {
      console.error(`Failed to load details for goal ${id}`, err);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        targetReduction: parseFloat(data.targetReduction),
        periodDays: parseInt(data.periodDays),
        startDate: data.startDate
      };
      const response = await api.post('/api/goals', payload);
      if (response.data.success) {
        toast.success('Reduction goal set successfully');
        reset();
        fetchGoals();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      const response = await api.delete(`/api/goals/${id}`);
      if (response.data.success) {
        toast.success('Goal deleted successfully');
        fetchGoals();
      }
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create Goal Form */}
      <div className="lg:col-span-1 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-6 rounded-3xl h-fit">
        <h2 className="text-xl font-extrabold mb-6 flex items-center space-x-2">
          <PlusCircle size={20} className="text-primary-500" />
          <span>Set Reduction Goal</span>
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Target CO₂ Reduction (kg)
            </label>
            <input
              type="number"
              step="any"
              {...register('targetReduction', { 
                required: 'Target reduction is required',
                min: { value: 0.1, message: 'Target reduction must be at least 0.1 kg' }
              })}
              className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100 ${errors.targetReduction ? 'border-red-500' : ''}`}
            />
            {errors.targetReduction && (
              <span className="text-xs text-red-500 mt-1 block">{errors.targetReduction.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Duration Period (Days)
            </label>
            <input
              type="number"
              {...register('periodDays', { 
                required: 'Period days is required',
                min: { value: 1, message: 'Period must be at least 1 day' }
              })}
              className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100 ${errors.periodDays ? 'border-red-500' : ''}`}
            />
            {errors.periodDays && (
              <span className="text-xs text-red-500 mt-1 block">{errors.periodDays.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Start Date
            </label>
            <input
              type="date"
              {...register('startDate', { required: 'Start date is required' })}
              className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100 ${errors.startDate ? 'border-red-500' : ''}`}
            />
            {errors.startDate && (
              <span className="text-xs text-red-500 mt-1 block">{errors.startDate.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary-600/20 dark:shadow-primary-600/10 transition duration-150 flex items-center justify-center space-x-2"
          >
            <span>{submitting ? 'Setting Goal...' : 'Establish Goal'}</span>
          </button>
        </form>
      </div>

      {/* Goal Progress History */}
      <div className="lg:col-span-2 space-y-6">
        {loading ? (
          <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-8 rounded-3xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : goals.length > 0 ? (
          goals.map((goal) => {
            const details = selectedGoalDetails[goal.id];
            const progress = details?.progress;
            const prediction = details?.prediction;

            return (
              <div key={goal.id} className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-6 rounded-3xl relative overflow-hidden">
                {/* Goal Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl ${goal.status === 'ACTIVE' ? 'bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400' : goal.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400'}`}>
                      <Target size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100">
                        Carbon reduction target: {goal.targetReduction} kg CO₂
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center mt-0.5">
                        <Calendar size={12} className="mr-1" />
                        Started on {new Date(goal.startDate).toLocaleDateString()} ({goal.periodDays} days)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${goal.status === 'ACTIVE' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' :
                        goal.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                        'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'}
                    `}>
                      {goal.status}
                    </span>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition"
                      title="Delete goal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress Details if ACTIVE */}
                {goal.status === 'ACTIVE' && progress && (
                  <div className="space-y-4 mt-2">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-500 dark:text-slate-400">Completion</span>
                        <span className="text-primary-600 dark:text-primary-400">{progress.percentComplete.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-dark-800 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-primary-500 h-full rounded-full transition-all duration-300" style={{ width: `${progress.percentComplete}%` }}></div>
                      </div>
                    </div>

                    {/* Stats Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 border-t border-b border-slate-100 dark:border-dark-800 text-xs">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block">Baseline Emissions</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">{progress.baselineEmissions.toFixed(1)} kg</span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block">Actual Emissions</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">{progress.actualEmissions.toFixed(1)} kg</span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block">Total Carbon Saved</span>
                        <span className="font-extrabold text-primary-600 dark:text-primary-400 mt-0.5 block">{progress.carbonSaved.toFixed(1)} kg</span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block">Days Remaining</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">{progress.daysRemaining} days</span>
                      </div>
                    </div>

                    {/* Completion Prediction Insights */}
                    {prediction && (
                      <div className="p-3 bg-slate-50 dark:bg-dark-800/40 rounded-2xl flex items-start space-x-3 text-xs">
                        {prediction.onTrack ? (
                          <CheckCircle2 size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="space-y-1">
                          <p className="font-bold text-slate-700 dark:text-slate-300">
                            Prediction Engine: {prediction.onTrack ? 'On Track to Succeed!' : 'Behind Schedule'}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                            {prediction.onTrack 
                              ? `At your current savings rate of ${prediction.currentDailySavingRate.toFixed(2)} kg/day, you are on track. Estimated completion: ${prediction.estimatedCompletionDate ? new Date(prediction.estimatedCompletionDate).toLocaleDateString() : 'N/A'}`
                              : `You need to save ${prediction.dailySavingRateNeeded.toFixed(2)} kg/day. Current rate is ${prediction.currentDailySavingRate.toFixed(2)} kg/day. Adjust daily choices to get back on track.`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {goal.status === 'COMPLETED' && (
                  <div className="mt-2 text-xs flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl font-semibold">
                    <Sparkles size={16} />
                    <span>Fantastic! You successfully reduced emissions and met this sustainability goal! Badge awarded.</span>
                  </div>
                )}

                {goal.status === 'FAILED' && (
                  <div className="mt-2 text-xs flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl font-semibold">
                    <AlertCircle size={16} />
                    <span>Goal period has ended without hitting target. Don't worry, reset and try again!</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-12 rounded-3xl text-center text-slate-400">
            <Target size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-500">No goals set yet</p>
            <p className="text-xs text-slate-400 mt-1">Configure carbon reduction goals on the left panel to challenge yourself.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;
