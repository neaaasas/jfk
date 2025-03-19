// src/components/Navigation/SearchBar.jsx
import { useState } from 'react';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchTerm);
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <input
        type="text"
        placeholder="Search for people..."
        className="w-full px-4 py-1.5 rounded bg-[#2a2a2a] border border-gray-700 text-white text-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </form>
  );
};

export default SearchBar;