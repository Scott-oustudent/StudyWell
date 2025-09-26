import React, { useState } from 'react';
import * as db from '../../../services/databaseService';
import { StudentTip } from '../../../types';

const ManageStudentTips: React.FC = () => {
    const [tips, setTips] = useState<StudentTip[]>(() => db.getStudentTips());
    const [editingTip, setEditingTip] = useState<StudentTip | null>(null);

    const handleSave = (tipToSave: StudentTip) => {
        let updatedTips;
        if (tips.some(t => t.id === tipToSave.id)) {
            updatedTips = tips.map(t => t.id === tipToSave.id ? tipToSave : t);
        } else {
            updatedTips = [...tips, tipToSave];
        }
        db.saveStudentTips(updatedTips);
        setTips(updatedTips);
        setEditingTip(null);
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this tip?")) {
            const updatedTips = tips.filter(t => t.id !== id);
            db.saveStudentTips(updatedTips);
            setTips(updatedTips);
        }
    };
    
    const handleAddNew = () => {
        setEditingTip({
            id: Date.now().toString(),
            title: '',
            category: 'Study Skills',
            youtubeVideoId: ''
        });
    };

    if (editingTip) {
        return <TipEditor tip={editingTip} onSave={handleSave} onCancel={() => setEditingTip(null)} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Manage Student Tips</h3>
                <button onClick={handleAddNew} className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm">Add New Tip</button>
            </div>
            <div className="space-y-2">
                {tips.map(tip => (
                    <div key={tip.id} className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-md flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{tip.title}</p>
                            <p className="text-xs text-gray-500">{tip.category} - {tip.youtubeVideoId}</p>
                        </div>
                        <div>
                            <button onClick={() => setEditingTip(tip)} className="text-sm text-blue-600 mr-2">Edit</button>
                            <button onClick={() => handleDelete(tip.id)} className="text-sm text-red-600">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Sub-component for editing/adding a tip
const TipEditor: React.FC<{ tip: StudentTip, onSave: (tip: StudentTip) => void, onCancel: () => void }> = ({ tip, onSave, onCancel }) => {
    const [currentTip, setCurrentTip] = useState(tip);
    
    const handleChange = (field: keyof StudentTip, value: string) => {
        setCurrentTip(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(currentTip);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-md space-y-3">
            <h4 className="font-bold">Editing Tip</h4>
            <input type="text" value={currentTip.title} onChange={e => handleChange('title', e.target.value)} placeholder="Title" className="w-full p-2 border rounded" required />
            <select value={currentTip.category} onChange={e => handleChange('category', e.target.value)} className="w-full p-2 border rounded">
                <option>Time Management</option>
                <option>Study Skills</option>
                <option>Wellness</option>
                <option>Productivity</option>
            </select>
            <input type="text" value={currentTip.youtubeVideoId} onChange={e => handleChange('youtubeVideoId', e.target.value)} placeholder="YouTube Video ID" className="w-full p-2 border rounded" required />
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="bg-gray-300 px-3 py-1 rounded text-sm">Cancel</button>
                <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded text-sm">Save</button>
            </div>
        </form>
    )
}

export default ManageStudentTips;
