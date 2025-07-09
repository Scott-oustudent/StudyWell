import React, { useState, useEffect } from 'react';
import { KnowledgeBaseArticle } from '../../types';
import Modal from './Modal';
import Button from './Button';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (articleData: Omit<KnowledgeBaseArticle, 'id' | 'createdAt' | 'lastUpdatedAt' | 'authorId' | 'authorName'> & { id?: string }) => void;
  itemToEdit: Partial<KnowledgeBaseArticle> | null;
}

const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({ isOpen, onClose, onSave, itemToEdit }) => {
  const [formData, setFormData] = useState<Partial<KnowledgeBaseArticle>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(itemToEdit || { category: 'General' });
    }
  }, [isOpen, itemToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.title || !formData.content || !formData.category) {
        alert("Title, Content, and Category are required fields.");
        return;
    }
    onSave(formData as any);
  };
  
  const title = itemToEdit?.id ? 'Edit Knowledge Base Article' : 'Add New Knowledge Base Article';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
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
         <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="e.g., Getting Started, Student Tools"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            id="content"
            name="content"
            rows={8}
            value={formData.content || ''}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div className="flex justify-end pt-4 space-x-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Article</Button>
        </div>
      </div>
    </Modal>
  );
};

export default KnowledgeBaseModal;
