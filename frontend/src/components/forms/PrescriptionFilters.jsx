
import React, { useState } from 'react';
import Searchbar from '../forms/Searchbar';


function PrescriptionFilters({ onSearch, onDateChange, dateFilter }) {

  const handleDateChange = (event) => {
    const date=event.target.value;
    onDateChange(event);
  };

  const clearFilters = () => {
    onSearch('');
    onDateChange({target: {value:""}})
  };

  return (
    <div className="prescription-filters">
      <div className="filters-container">

        <div className="search-filter">
          <Searchbar 
            onSearch={onSearch} 
            placeholder="Search by response content or user ID..."
          />
        </div>

        <div className="date-filter">
          <label htmlFor="date-filter">Filter by Date:</label>
          <input
            type="date"
            id="date-filter"
            value={dateFilter}
            onChange={handleDateChange}
            className="date-input"
          />
        </div>

        {dateFilter && (
          <button 
            onClick={clearFilters} 
            className="clear-filters-btn"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

export default PrescriptionFilters;
