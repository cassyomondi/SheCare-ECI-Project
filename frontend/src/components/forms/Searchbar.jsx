import React, {useState}from "react";

function Searchbar({onSearch, placeholder="search", className=""}){
    const [query, setQuery]=useState('');

    function handleSubmit(e){
        e.preventDefault();
        
        if (onSearch && query.trim()){
            onSearch(query.trim());
        }
    };
    function handleChange(e){
        setQuery(e.target.value);
    };
    return(
        <div className={`search-bar ${className}`}>
            <form onSubmit={handleSubmit} className="search-form">
                <input 
                type="search"
                id="search"
                name="search"
                placeholder={placeholder}
                value={query}
                onChange={handleChange}
                className="search-input"
                />
                <button type="submit" className="search-submit">🔍</button>
            </form>
            
        </div>
    );
}
export default Searchbar;
