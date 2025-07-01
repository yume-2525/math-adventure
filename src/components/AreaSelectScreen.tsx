import React from 'react';

interface Area {
  id: string;
  name: string;
}

interface AreaSelectScreenProps {
  areas: Area[];
  onAreaSelect: (areaId: string) => void;
  onBackToStart: () => void;
}

const AreaSelectScreen: React.FC<AreaSelectScreenProps> = ({ areas, onAreaSelect, onBackToStart }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-sans">
      <h1 className="text-4xl font-bold mb-8">どこへ冒険に行く？</h1>
      <div className="space-y-4">
        {areas.map((area) => (
          <button
            key={area.id}
            onClick={() => onAreaSelect(area.id)}
            className="w-80 bg-white text-xl font-bold py-4 px-6 rounded-lg shadow-md hover:bg-blue-100 transition-colors"
          >
            {area.name}
          </button>
        ))}
      </div>
      <button
        onClick={onBackToStart}
        className="mt-12 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg shadow-md"
      >
        スタートに戻る
      </button>
    </div>
  );
};

export default AreaSelectScreen;