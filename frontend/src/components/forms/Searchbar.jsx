import React, { useState, useEffect } from "react";

function Searchbar({ onSearch, placeholder = "search", className = "", searchQuery }) {
  const [query, setQuery] = useState(searchQuery || "");

  // Sync with parent's searchQuery
  useEffect(() => {
    setQuery(searchQuery || "");
  }, [searchQuery]);

  function handleSubmit(e) {
    e.preventDefault();

    if (onSearch) {
      onSearch(query.trim());
    }
  }

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);
    // Real-time search as user types
    if (onSearch) {
      onSearch(value.trim());
    }
  }

  function handleClear() {
    setQuery("");
    if (onSearch) {
      onSearch(""); // This clears the parent's search
    }
  }

  return (
    <div className={`search-bar ${className}`}>
      <form onSubmit={handleSubmit} className="search-form">
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            type="search"
            id="search"
            name="search"
            placeholder={placeholder}
            value={query}
            onChange={handleChange}
            className="search-input"
            style={{ paddingRight: query ? "60px" : "40px" }} // Adjust padding for buttons
          />
          
          {/* Search icon button */}
          <button type="submit" className="search-submit">
            🔍juts 
          </button>
        </div>
      </form>
    </div>
  );
}

export default Searchbar;
