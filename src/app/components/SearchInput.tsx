import React from 'react';
import Image from 'next/image';
import { SearchInputProps } from '@utils/interface';

const SearchInput: React.FC<SearchInputProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="flex items-center bg-oxi-bg-02 rounded-xl mb-6">
      <div className="pl-3 pr-2">
        <Image src="/search-icon.svg" alt="search" width={20} height={20} className="text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search by name or paste address"
        className="w-full bg-transparent py-3 pr-4 text-black placeholder-gray-500 text-sm focus:outline-none"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;