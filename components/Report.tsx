import React from 'react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ArcElement, RadarController } from 'chart.js';
import { Doughnut, Bar, Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ArcElement, RadarController);

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Report: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const chartTextColor = 'rgba(255, 255, 255, 0.7)';
    const chartGridColor = 'rgba(255, 255, 255, 0.1)';
    const chartAccentColor = 'rgba(168, 85, 247, 1)';
    const chartAccentColorTransparent = 'rgba(168, 85, 247, 0.3)';

    const progressData = {
        labels: ['Completed', 'Remaining'],
        datasets: [{
            data: [65, 35],
            backgroundColor: [chartAccentColor, 'rgba(255,255,255,0.05)'],
            borderColor: ['transparent'],
            borderWidth: 0,
            borderRadius: 5,
        }]
    };
    
    const activityData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Minutes Listened',
            data: [45, 60, 30, 75, 50, 90, 20],
            backgroundColor: chartAccentColorTransparent,
            borderColor: chartAccentColor,
            borderWidth: 1,
            borderRadius: 8,
            hoverBackgroundColor: chartAccentColor,
        }]
    };
    
    const genreData = {
        labels: ['Sci-Fi', 'Fantasy', 'Mystery', 'Non-Fiction', 'Thriller', 'Biography'],
        datasets: [{
            label: 'Genre Affinity',
            data: [8, 6, 7, 5, 9, 4],
            backgroundColor: chartAccentColorTransparent,
            borderColor: chartAccentColor,
            pointBackgroundColor: chartAccentColor,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: chartAccentColor,
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
                                <span className="absolute text-2xl font-bold text-violet-400">65%</span>
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <h4 className="font-semibold mb-2 text-center text-gray-300">Weekly Goal</h4>
                            <div className="h-40 relative flex items-center justify-center">
                                {/* Using different data for example */}
                                <Doughnut data={{...progressData, datasets: [{...progressData.datasets[0], data: [80,20]}]}} options={{...chartOptions, cutout: '70%' }} />
                                <span className="absolute text-2xl font-bold text-violet-400">80%</span>
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

                    {/* Genre Stats */}
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <h4 className="font-semibold mb-4 text-gray-300">Genre Stats</h4>
                        <div className="h-80">
                            <Radar data={genreData} options={{...chartOptions, scales: {
                                r: {
                                    angleLines: { color: chartGridColor },
                                    grid: { color: chartGridColor },
                                    pointLabels: { color: chartTextColor, font: {size: 14} },
                                    ticks: { backdropColor: 'transparent', color: chartTextColor }
                                }
                            }}} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Report;
