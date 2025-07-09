

import React, { useState, useMemo } from 'react';
import { User, UserRole, WellnessVideo, MeditationTrack, WellnessArticle, AuditActionType, AppView, WellnessItemType } from '../types';
import WellnessVideos from './WellnessVideos';
import MeditationAudio from './MeditationAudio';
import WellnessArticles from './WellnessArticles';
import WellnessItemModal from './common/WellnessItemModal';
import useLocalStorage from '../hooks/useLocalStorage';
import { INITIAL_WELLNESS_VIDEOS, INITIAL_MEDITATION_TRACKS, INITIAL_WELLNESS_ARTICLES } from '../data/wellnessData';

type WellnessTab = 'videos' | 'audio' | 'articles';
type WellnessItem = WellnessVideo | MeditationTrack | WellnessArticle;

interface StudentWellnessProps {
  currentUser: User;
  logAuditAction: (actorId: string, actorName: string, actionType: AuditActionType, details: string) => void;
}

const StudentWellness: React.FC<StudentWellnessProps> = ({ currentUser, logAuditAction }) => {
  const [activeTab, setActiveTab] = useState<WellnessTab>('videos');

  const [videos, setVideos] = useLocalStorage<WellnessVideo[]>('wellnessVideos', INITIAL_WELLNESS_VIDEOS);
  const [tracks, setTracks] = useLocalStorage<MeditationTrack[]>('wellnessTracks', INITIAL_MEDITATION_TRACKS);
  const [articles, setArticles] = useLocalStorage<WellnessArticle[]>('wellnessArticles', INITIAL_WELLNESS_ARTICLES);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WellnessItem | null>(null);
  const [editingItemType, setEditingItemType] = useState<WellnessItemType>('video');

  const canManageContent = useMemo(() => {
    return [UserRole.STAFF, UserRole.ADMIN].includes(currentUser.role);
  }, [currentUser.role]);

  const handleOpenModal = (item: WellnessItem | null, type: WellnessItemType) => {
    setEditingItem(item);
    setEditingItemType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };
  
  const handleSaveItem = (itemData: Omit<WellnessItem, 'id'> & { id?: string }) => {
    const isNew = !itemData.id;
    const itemToSave = { ...itemData, id: itemData.id || String(Date.now()) };

    const action = isNew ? AuditActionType.WELLNESS_ITEM_CREATED : AuditActionType.WELLNESS_ITEM_UPDATED;
    const details = `${isNew ? 'Created' : 'Updated'} ${editingItemType}: "${itemToSave.title}"`;
    logAuditAction(currentUser.id, currentUser.name, action, details);

    switch (editingItemType) {
      case 'video':
        setVideos(prev => isNew ? [...prev, itemToSave as WellnessVideo] : prev.map(v => v.id === itemToSave.id ? itemToSave as WellnessVideo : v));
        break;
      case 'audio':
        setTracks(prev => isNew ? [...prev, itemToSave as MeditationTrack] : prev.map(t => t.id === itemToSave.id ? itemToSave as MeditationTrack : t));
        break;
      case 'article':
        setArticles(prev => isNew ? [...prev, itemToSave as WellnessArticle] : prev.map(a => a.id === itemToSave.id ? itemToSave as WellnessArticle : a));
        break;
    }
    handleCloseModal();
  };
  
  const handleDeleteItem = (itemId: string, itemType: WellnessItemType) => {
      let itemTitle = '';
       if (window.confirm(`Are you sure you want to delete this ${itemType}? This action cannot be undone.`)) {
           switch (itemType) {
               case 'video':
                    itemTitle = videos.find(v => v.id === itemId)?.title || '';
                    setVideos(prev => prev.filter(v => v.id !== itemId));
                    break;
               case 'audio':
                    itemTitle = tracks.find(t => t.id === itemId)?.title || '';
                    setTracks(prev => prev.filter(t => t.id !== itemId));
                    break;
               case 'article':
                    itemTitle = articles.find(a => a.id === itemId)?.title || '';
                    setArticles(prev => prev.filter(a => a.id !== itemId));
                    break;
           }
            logAuditAction(currentUser.id, currentUser.name, AuditActionType.WELLNESS_ITEM_DELETED, `Deleted ${itemType}: "${itemTitle}"`);
       }
  };


  return (
    <>
    <div className="p-8 h-full flex flex-col">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-2">Student Wellness</h1>
      <p className="text-lg text-gray-600 mb-6">Tools and resources to support your mental and physical health.</p>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('videos')}
            className={`${
              activeTab === 'videos'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base transition-colors focus:outline-none`}
            aria-current={activeTab === 'videos' ? 'page' : undefined}
          >
            Wellness Videos
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`${
              activeTab === 'audio'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base transition-colors focus:outline-none`}
            aria-current={activeTab === 'audio' ? 'page' : undefined}
          >
            Meditation Audio
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`${
              activeTab === 'articles'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base transition-colors focus:outline-none`}
            aria-current={activeTab === 'articles' ? 'page' : undefined}
          >
            Wellness Articles
          </button>
        </nav>
      </div>

      <div className="flex-grow overflow-y-auto">
        {activeTab === 'videos' && <WellnessVideos videos={videos} onEdit={(item) => handleOpenModal(item, 'video')} onDelete={(id) => handleDeleteItem(id, 'video')} onAdd={() => handleOpenModal(null, 'video')} canManage={canManageContent} />}
        {activeTab === 'audio' && <MeditationAudio tracks={tracks} onEdit={(item) => handleOpenModal(item, 'audio')} onDelete={(id) => handleDeleteItem(id, 'audio')} onAdd={() => handleOpenModal(null, 'audio')} canManage={canManageContent} />}
        {activeTab === 'articles' && <WellnessArticles articles={articles} onEdit={(item) => handleOpenModal(item, 'article')} onDelete={(id) => handleDeleteItem(id, 'article')} onAdd={() => handleOpenModal(null, 'article')} canManage={canManageContent} />}
      </div>
    </div>
    {isModalOpen && (
      <WellnessItemModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveItem}
        itemToEdit={editingItem}
        itemType={editingItemType}
      />
    )}
    </>
  );
};

export default StudentWellness;