

import React, { useState, useEffect } from 'react';
import { WellnessVideo, MeditationTrack, WellnessArticle, WellnessItemType } from '../../types';
import Modal from './Modal';
import Button from './Button';

type WellnessItem = WellnessVideo | MeditationTrack | WellnessArticle;

interface WellnessItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<WellnessItem, 'id'> & { id?: string }) => void;
  itemToEdit: WellnessItem | null;
  itemType: WellnessItemType;
}

const WellnessItemModal: React.FC<WellnessItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
  itemType,
}) => {
  const [formData, setFormData] = useState<Partial<WellnessItem>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(itemToEdit || {});
    }
  }, [isOpen, itemToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.title) {
        alert("Title is a required field.");
        return;
    }
    onSave(formData as Omit<WellnessItem, 'id'> & { id?: string });
  };
  
  const title = itemToEdit ? `Edit ${itemType}` : `Add New ${itemType}`;

  const renderFields = () => {
    const commonFields = (
      <>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
      </>
    );

    switch (itemType) {
      case 'video':
        return (
          <>
            {commonFields}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={(formData as WellnessVideo).description || ''}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
              <input
                type="text"
                id="thumbnailUrl"
                name="thumbnailUrl"
                value={(formData as WellnessVideo).thumbnailUrl || ''}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="https://example.com/image.png"
              />
            </div>
          </>
        );
      case 'audio':
        return (
          <>
            {commonFields}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration</label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={(formData as MeditationTrack).duration || ''}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="e.g., 10:00"
              />
            </div>
          </>
        );
      case 'article':
        return (
          <>
            {commonFields}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={(formData as WellnessArticle).description || ''}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700">Source</label>
              <input
                type="text"
                id="source"
                name="source"
                value={(formData as WellnessArticle).source || ''}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="e.g., University Health News"
              />
            </div>
             <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">Article URL</label>
              <input
                type="text"
                id="url"
                name="url"
                value={(formData as WellnessArticle).url || ''}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="https://example.com/article"
              />
            </div>
          </>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        {renderFields()}
        <div className="flex justify-end pt-4 space-x-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Modal>
  );
};

export default WellnessItemModal;