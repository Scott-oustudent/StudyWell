

import React from 'react';
import { AppView } from '../types';
import Card from './common/Card';
import { STUDENT_TOOLS_ITEMS, CONNECT_THRIVE_ITEMS } from '../constants';

interface DashboardProps {
  navigateTo: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ navigateTo }) => {
  const featureDescriptions: Record<string, string> = {
    [AppView.NOTE_SUMMARIZER]: "Condense your lengthy notes into concise summaries.",
    [AppView.FLASHCARD_GENERATOR]: "Create flashcards from any topic to boost your memory.",
    [AppView.CONCEPT_EXPLAINER]: "Get simple explanations for complex subjects.",
    [AppView.SCHEDULER]: "Organize your academic life with an interactive calendar.",
    [AppView.POMODORO_TIMER]: "Boost your productivity with a customizable focus timer.",
    [AppView.CITATION_WIZARD]: "Generate citations in any style for various sources.",
    [AppView.ESSAY_HELPER]: "Get help with thesis statements, outlines, and proofreading.",
    [AppView.COMMUNITY]: "Connect with peers in the discussion forum or join a video chat study session.",
    [AppView.STUDENT_WELLNESS]: "Find resources for mental and physical well-being, including guided meditations and wellness videos.",
  };

  const features = [...STUDENT_TOOLS_ITEMS, ...CONNECT_THRIVE_ITEMS].filter(
    (feature) => feature.view in featureDescriptions
  );

  const iconColors = [
    'text-red-500',
    'text-orange-500',
    'text-yellow-500',
    'text-green-500',
    'text-sky-500',
    'text-indigo-500',
    'text-violet-500',
    'text-fuchsia-500',
    'text-pink-500',
  ];

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-2">Welcome to StudyWell</h1>
      <p className="text-lg text-gray-600 mb-10">Your AI-powered study partner. Choose a tool to get started.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card key={feature.view} onClick={() => navigateTo(feature.view)} className="flex flex-col">
            <div className="p-6 flex-grow">
              <div className="flex items-center mb-4">
                <div className={iconColors[index % iconColors.length]}>{feature.icon}</div>
                <h2 className="ml-4 text-2xl font-bold text-gray-800">{feature.label}</h2>
              </div>
              <p className="text-gray-600">
                {featureDescriptions[feature.view]}
              </p>
            </div>
             <div className="bg-gray-50 p-4 text-right">
                <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">Launch Tool &rarr;</span>
              </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;