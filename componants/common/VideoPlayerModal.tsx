import React from 'react';
import Modal from './Modal';
import { WellnessVideo } from '../../types';

interface VideoPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    video: WellnessVideo | null;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ isOpen, onClose, video }) => {
    if (!isOpen || !video) return null;
    
    // Using a placeholder video URL since the data model doesn't have one.
    // In a real app, video.videoUrl would be used.
    const videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; // Placeholder

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={video.title}>
            <div className="bg-black rounded-lg">
                <video
                    src={videoUrl}
                    controls
                    autoPlay
                    className="w-full h-auto"
                    onEnded={onClose}
                >
                    Your browser does not support the video tag.
                </video>
            </div>
            <p className="text-gray-600 mt-4">{video.description}</p>
        </Modal>
    );
};
export default VideoPlayerModal;
