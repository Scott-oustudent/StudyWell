import React, { useState } from 'react';
import * as db from '../../services/databaseService';
import { StudentTip } from '../../types';

const categories: StudentTip['category'][] = ['Time Management', 'Study Skills', 'Wellness', 'Productivity'];

const StudentTips: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<StudentTip['category'] | 'All'>('All');
    const allTips = db.getStudentTips();

    const filteredTips = activeCategory === 'All' 
        ? allTips 
        : allTips.filter(tip => tip.category === activeCategory);

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="mb-4">
                <div className="flex flex-wrap gap-2 justify-center">
                    <button 
                        onClick={() => setActiveCategory('All')}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${activeCategory === 'All' ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                    >
                        All
                    </button>
                    {categories.map(category => (
                        <button 
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${activeCategory === category ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTips.map(tip => (
                    <div key={tip.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <h4 className="font-bold text-md mb-2">{tip.title}</h4>
                        <div className="aspect-video">
                            <iframe
                                className="w-full h-full rounded-md"
                                src={`https://www.youtube.com/embed/${tip.youtubeVideoId}`}
                                title={tip.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentTips;
