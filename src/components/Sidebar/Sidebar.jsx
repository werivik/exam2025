import React from 'react';
import styles from './Sidebar.module.css';
import Buttons from '../Buttons/Buttons';

const Sidebar = ({
  showSidebar,
  toggleSidebar,
  inputValues,
  handleFilterChange,
  getSuggestions,
  handleSuggestionClickSecond,
  filters,
  minPrice,
  maxPrice,
  metaFilters,
  clearFilters,
  setShowSuggestions,
}) => {
  return (
    <>
      {showSidebar && <div className={styles.backdrop} onClick={toggleSidebar}></div>}
      <div className={`${styles.filterSidebar} ${showSidebar ? styles.showSidebar : ''}`}>
        <div className={styles.filterSidebarContent}>
          <button onClick={toggleSidebar} className={styles.closeIconButton}>&times;</button>
          <h2>Filter Your Search</h2>

          <div className={styles.allFilters}>
            <div className={styles.filterGroup}>
              <h3>Destination</h3>

              {['continent', 'country', 'city'].map((locationType) => (
                <div className={styles.inputWithSuggestions} key={locationType}>
                  <input
                    type="text"
                    name={locationType}
                    placeholder={locationType.charAt(0).toUpperCase() + locationType.slice(1)}
                    value={inputValues[locationType]}
                    onChange={handleFilterChange}
                    onFocus={() => setShowSuggestions(prev => ({ ...prev, [locationType]: true }))}
                    autoComplete="off"
                  />
                  {getSuggestions(locationType).length > 0 && (
                    <ul className={styles.suggestionList}>
                      {getSuggestions(locationType).map((suggestion, idx) => (
                        <li
                          key={idx}
                          onClick={() => handleSuggestionClickSecond(locationType, suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.filterGroup}>
              <h3>Price Range</h3>
              <input
                type="number"
                name="priceMin"
                value={filters.priceMin || minPrice}
                min={minPrice}
                max={maxPrice}
                onChange={handleFilterChange}
                placeholder={`Min Price ($${minPrice})`}
              />
              <input
                type="number"
                name="priceMax"
                value={filters.priceMax || maxPrice}
                min={minPrice}
                max={maxPrice}
                onChange={handleFilterChange}
                placeholder={`Max Price ($${maxPrice})`}
              />
            </div>

            <div className={styles.filterGroup}>
              <h3>Guests</h3>
              <input type="number" name="adults" placeholder="Adults" min="0" onChange={handleFilterChange} />
              <input type="number" name="children" placeholder="Children" min="0" onChange={handleFilterChange} />
              <input type="number" name="assisted" placeholder="Assisted" min="0" onChange={handleFilterChange} />
            </div>

            <div className={styles.filterGroup}>
              <h3>Facilities</h3>
              {metaFilters.map(metaKey => (
                <div key={metaKey}>
                  <input
                    type="checkbox"
                    name={metaKey}
                    checked={filters.meta[metaKey] || false}
                    onChange={handleFilterChange}
                  />
                  <label>{metaKey}</label>
                </div>
              ))}
            </div>
          </div>

          <Buttons size='medium' version='v1' onClick={clearFilters} className={styles.clearFilterButton}>
            Clear Filters
          </Buttons>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
