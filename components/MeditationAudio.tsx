

import React, { useState, useRef, useEffect } from 'react';
import { MeditationTrack } from '../types';
import { AUDIO_SRC } from '../data/wellnessData';
import Icon from './common/Icon';
import Card from './common/Card';
import Button from './common/Button';

interface MeditationAudioProps {
  tracks: MeditationTrack[];
  onEdit: (track: MeditationTrack) => void;
  onDelete: (trackId: string) => void;
  onAdd: () => void;
  canManage: boolean;
}

const MeditationAudio: React.FC<MeditationAudioProps> = ({ tracks, onEdit, onDelete, onAdd, canManage }) => {
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handleEnded = () => {
        setIsPlaying(false);
        setActiveTrackId(null);
    };

    audioElement.addEventListener('ended', handleEnded);
    return () => {
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handlePlayPause = (trackId: string) => {
    if (activeTrackId === trackId) {
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      setActiveTrackId(trackId);
      setIsPlaying(true);
      if(audioRef.current) {
        // All tracks use the same audio source as a placeholder
        audioRef.current.src = AUDIO_SRC;
        audioRef.current.play();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
        {canManage && (
            <div className="mb-6 text-right">
                <Button onClick={onAdd}>
                    <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg></Icon>
                    Add Audio Track
                </Button>
            </div>
        )}
        <div className="space-y-4">
        <audio ref={audioRef} preload="none" />
        {tracks.map(track => (
            <Card 
            key={track.id} 
            className={`p-4 flex items-center justify-between transition-all duration-300 ${activeTrackId === track.id ? 'bg-purple-100 ring-2 ring-purple-500' : 'bg-white'}`}
            >
            <div className="flex items-center">
                <button 
                onClick={() => handlePlayPause(track.id)} 
                className="p-3 rounded-full bg-purple-500 text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 mr-4 transition-colors"
                aria-label={isPlaying && activeTrackId === track.id ? `Pause ${track.title}` : `Play ${track.title}`}
                >
                <Icon>
                    {(isPlaying && activeTrackId === track.id) ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    )}
                </Icon>
                </button>
                <div>
                <h3 className="text-lg font-semibold text-gray-800">{track.title}</h3>
                <p className="text-sm text-gray-500">{track.duration}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {(isPlaying && activeTrackId === track.id) && (
                    <div className="flex items-center space-x-2">
                        <span className="text-purple-600 font-medium hidden sm:inline">Playing</span>
                        <div className="w-5 h-5 flex space-x-0.5 items-end">
                            <span className="w-1 h-2 bg-purple-500 animate-bounce" style={{ animationDelay: '0s' }}></span>
                            <span className="w-1 h-3 bg-purple-500 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-1 h-4 bg-purple-500 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                    </div>
                )}
                {canManage && (
                    <div className="flex items-center gap-2">
                        <Button onClick={() => onEdit(track)} variant="secondary" className="!px-3 !py-1 text-sm">Edit</Button>
                        <Button onClick={() => onDelete(track.id)} variant="secondary" className="!px-3 !py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200">Delete</Button>
                    </div>
                )}
            </div>
            </Card>
        ))}
         {tracks.length === 0 && <p className="text-center text-gray-500 py-10">No audio tracks have been added yet.</p>}
        </div>
    </div>
  );
};

export default MeditationAudio;
