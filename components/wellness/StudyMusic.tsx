import React from 'react';

const StudyMusic: React.FC = () => {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Here's a playlist curated to help you focus and get into a productive study flow.
      </p>
      <iframe 
        id='AmazonMusicEmbedB0FBNQSC5D' 
        src='https://music.amazon.co.uk/embed/B0FBNQSC5D/?id=3ZoAqrgLJx&marketplaceId=A1F83G8C2ARO7P&musicTerritory=GB' 
        width='100%' 
        height='352px' 
        frameBorder='0' 
        style={{ borderRadius: '20px', maxWidth: '100%' }}>
      </iframe>
    </div>
  );
};

export default StudyMusic;