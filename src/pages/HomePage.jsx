// src/pages/HomePage.jsx
import BubbleMap from '../components/BubbleMap/BubbleMap';

const HomePage = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <h1 className="text-4xl font-bold mb-4 text-center">JFK Assassination Network</h1>
      <div className="flex-grow bg-[#151515] rounded-lg border border-gray-800 overflow-hidden p-4 shadow-xl">
        <BubbleMap />
      </div>
    </div>
  );
};

export default HomePage;