

import React from 'react';
import { WellnessArticle } from '../types';
import Card from './common/Card';
import Icon from './common/Icon';
import Button from './common/Button';

interface WellnessArticlesProps {
  articles: WellnessArticle[];
  onEdit: (article: WellnessArticle) => void;
  onDelete: (articleId: string) => void;
  onAdd: () => void;
  canManage: boolean;
}

const WellnessArticles: React.FC<WellnessArticlesProps> = ({ articles, onEdit, onDelete, onAdd, canManage }) => {
  return (
    <div className="max-w-4xl mx-auto">
        {canManage && (
            <div className="mb-6 text-right">
                <Button onClick={onAdd}>
                    <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg></Icon>
                    Add Article
                </Button>
            </div>
        )}
        <div className="space-y-6">
        {articles.map(article => (
            <Card key={article.id} className="group transition-all duration-300">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pink-600">{article.title}</h3>
                <p className="text-gray-600 mb-4">{article.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-500">{article.source}</span>
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-pink-600 font-semibold hover:underline">
                    <span>Read More</span>
                    <Icon>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Icon>
                  </a>
                </div>
              </div>
              {canManage && (
                <div className="bg-gray-50 p-3 border-t border-gray-100 flex justify-end gap-2">
                    <Button onClick={() => onEdit(article)} variant="secondary" className="!px-3 !py-1 text-sm">Edit</Button>
                    <Button onClick={() => onDelete(article.id)} variant="secondary" className="!px-3 !py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200">Delete</Button>
                </div>
              )}
            </Card>
        ))}
         {articles.length === 0 && <p className="text-center text-gray-500 py-10">No wellness articles have been added yet.</p>}
        </div>
    </div>
  );
};

export default WellnessArticles;