import React from 'react';
import { Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ArcElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(Tooltip, Legend, CategoryScale, LinearScale, BarElement, ArcElement);

const Report = ({ isOpen, onClose, stats, currentTime, duration }) => {
    if (!isOpen) return null;

    const chartTextColor = 'rgba(255, 255, 255, 0.7)';
    const chartGridColor = 'rgba(255, 255, 255, 0.1)';
    const chartAccentColor = 'rgba(168, 85, 247, 1)';
    const chartAccentColorTransparent = 'rgba(168, 85, 247, 0.3)';

    // --- Chart Data Processing ---

    // 1. Book Progress
    const bookProgressPercent = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
    const progressData = {
        labels: ['Completed', 'Remaining'],
        datasets: [{
            data: [bookProgressPercent, 100 - bookProgressPercent],
            backgroundColor: [chartAccentColor, 'rgba(255,255,255,0.05)'],
            borderColor: ['transparent'],
            borderWidth: 0,
            borderRadius: 5,
        }]
    };

    // 2. Weekly Goal
    const WEEKLY_GOAL_MINUTES = 420; // 7 hours
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    });
    const weeklyMinutes = last7Days.reduce((acc, date) => acc + ((stats?.listeningActivity?.[date] || 0) / 60), 0);
    const weeklyGoalPercent = Math.min(100, Math.round((weeklyMinutes / WEEKLY_GOAL_MINUTES) * 100));
    const weeklyGoalData = {
        labels: ['Achieved', 'Remaining'],
        datasets: [{
            data: [weeklyGoalPercent, 100 - weeklyGoalPercent],
            backgroundColor: [chartAccentColor, 'rgba(255,255,255,0.05)'],
            borderColor: ['transparent'],
            borderWidth: 0,
            borderRadius: 5,
        }]
    };
    
    // 3. Listening Activity
    const activityLabels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleString('en-US', { weekday: 'short' });
    });
    const activityValues = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateKey = d.toISOString().split('T')[0];
        return Math.round((stats?.listeningActivity?.[dateKey] || 0) / 60); // in minutes
    });
    const activityData = {
        labels: activityLabels,
        datasets: [{
            label: 'Minutes Listened',
            data: activityValues,
            backgroundColor: chartAccentColorTransparent,
            borderColor: chartAccentColor,
            borderWidth: 1,
            borderRadius: 8,
            hoverBackgroundColor: chartAccentColor,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: chartGridColor,
                borderWidth: 1,
            }
        },
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl text-white">
                <div className="flex items-center justify-between mb-6 flex-shrink-0">
                    <h3 className="text-2xl font-bold">Listening Insights</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </div>
                
                <div className="overflow-y-auto space-y-6 pr-2">
                    {/* Progress Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <h4 className="font-semibold mb-2 text-center text-gray-300">Book Progress</h4>
                            <div className="h-40 relative flex items-center justify-center">
                                <Doughnut data={progressData} options={{...chartOptions, cutout: '70%' }} />
                                <span className="absolute text-2xl font-bold text-violet-400">{bookProgressPercent}%</span>
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <h4 className="font-semibold mb-2 text-center text-gray-300">Weekly Goal</h4>
                            <div className="h-40 relative flex items-center justify-center">
                                <Doughnut data={weeklyGoalData} options={{...chartOptions, cutout: '70%' }} />
                                <span className="absolute text-2xl font-bold text-violet-400">{weeklyGoalPercent}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Listening Activity */}
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <h4 className="font-semibold mb-4 text-gray-300">Listening Activity (Last 7 Days)</h4>
                        <div className="h-64">
                            <Bar data={activityData} options={{...chartOptions, scales: {
                                y: { beginAtZero: true, grid: { color: chartGridColor }, ticks: { color: chartTextColor } },
                                x: { grid: { color: 'transparent' }, ticks: { color: chartTextColor } }
                            }}} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Report;