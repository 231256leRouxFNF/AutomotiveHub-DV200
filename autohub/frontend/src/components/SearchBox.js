import React, { useState } from 'react';
import './SearchBox.css';

const SearchBox = ({ placeholder = "Search for cars, parts, or users...", onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.6219 10.6224C10.8672 10.3771 11.2551 10.362 11.5183 10.5766L11.5693 10.6224L14.477 13.5301L14.5235 13.5811C14.7379 13.8443 14.7222 14.2323 14.477 14.4775C14.2318 14.7227 13.8438 14.7384 13.5806 14.524L13.5296 14.4775L10.6219 11.5698L10.5761 11.5188C10.3615 11.2556 10.3766 10.8677 10.6219 10.6224Z" fill="#8C8D8B"/>
            <path d="M12.0198 7.33005C12.0198 4.73984 9.92002 2.64005 7.3298 2.64005C4.73959 2.64005 2.6398 4.73984 2.6398 7.33005C2.6398 9.92027 4.73959 12.02 7.3298 12.02C9.92002 12.02 12.0198 9.92027 12.0198 7.33005ZM13.3598 7.33005C13.3598 10.6604 10.6601 13.36 7.3298 13.36C3.99953 13.36 1.2998 10.6604 1.2998 7.33005C1.2998 3.99977 3.99953 1.30005 7.3298 1.30005C10.6601 1.30005 13.3598 3.99977 13.3598 7.33005Z" fill="#8C8D8B"/>
          </svg>
          <input 
            type="text" 
            placeholder={placeholder}
            className="search-input"
            value={searchTerm}
            onChange={handleInputChange}
          />
        </div>
      </form>
    </div>
  );
};

export default SearchBox;
