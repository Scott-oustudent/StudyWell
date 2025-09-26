import React from 'react';

const Meditation: React.FC = () => {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Take a break and clear your mind with these guided meditation and relaxation audios.
      </p>
      <iframe 
        id='AmazonMusicEmbedafc80cfb3ab842619b548698e127dcbaengb' 
        src='https://music.amazon.co.uk/embed/afc80cfb3ab842619b548698e127dcbaengb/?id=55IZhkTSpF&marketplaceId=A1F83G8C2ARO7P&musicTerritory=GB' 
        width='100%' 
        height='352px' 
        frameBorder='0' 
        style={{ borderRadius: '20px', maxWidth: '100%' }}>
      </iframe>
    </div>
  );
};

export default Meditation;