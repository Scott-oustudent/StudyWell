

import React from 'react';
import { WellnessVideo } from '../types';
import Card from './common/Card';
import Icon from './common/Icon';
import Button from './common/Button';

interface WellnessVideosProps {
  videos: WellnessVideo[];
  onEdit: (video: WellnessVideo) => void;
  onDelete: (videoId: string) => void;
  onAdd: () => void;
  canManage: boolean;
}

const WellnessVideos: React.FC<WellnessVideosProps> = ({ videos, onEdit, onDelete, onAdd, canManage }) => {
  return (
    <div>
        {canManage && (
            <div className="mb-6 text-right">
                <Button onClick={onAdd}>
                    <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg></Icon>
                    Add Video
                </Button>
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map(video => (
            <Card key={video.id} className="group overflow-hidden flex flex-col">
            <div className="relative cursor-pointer">
                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                <div className="transform scale-150 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                    <Icon>
                    <svg className="h-16 w-16 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                    </Icon>
                </div>
                </div>
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{video.title}</h3>
                <p className="text-gray-600 text-sm flex-grow">{video.description}</p>
                 {canManage && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
                        <Button onClick={() => onEdit(video)} variant="secondary" className="!px-3 !py-1 text-sm">Edit</Button>
                        <Button onClick={() => onDelete(video.id)} variant="secondary" className="!px-3 !py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200">Delete</Button>
                    </div>
                )}
            </div>
            </Card>
        ))}
        </div>
        {videos.length === 0 && <p className="text-center text-gray-500 py-10">No wellness videos have been added yet.</p>}
    </div>
  );
};

export default WellnessVideos;