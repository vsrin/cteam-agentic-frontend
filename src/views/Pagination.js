import React from 'react';

const Pagination = ({ 
  totalItems, 
  itemsPerPage, 
  currentPage, 
  onPageChange,
  onItemsPerPageChange 
}) => {
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Generate page numbers array
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show max 5 page numbers
    
    if (totalPages <= maxPagesToShow) {
      // If total pages are less than max, show all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // If current page is among the first 3 pages
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } 
      // If current page is among the last 3 pages
      else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } 
      // If current page is in the middle
      else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        pageNumbers.push(currentPage - 1);
        pageNumbers.push(currentPage);
        pageNumbers.push(currentPage + 1);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // Items per page options
  const itemsPerPageOptions = [5, 10, 25, 50, 100];

  return (
    <div className="pagination-container" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      margin: '1rem 0'
    }}>
      <div className="items-per-page">
        <span style={{ marginRight: '0.5rem' }}>Rows per page:</span>
        <select 
          value={itemsPerPage} 
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        >
          {itemsPerPageOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="pagination-info" style={{ marginLeft: 'auto', marginRight: '1rem' }}>
        {totalItems === 0 ? 
          'No items' : 
          `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${
            Math.min(currentPage * itemsPerPage, totalItems)
          } of ${totalItems} items`
        }
      </div>
      
      <div className="pagination-controls">
        <button 
          onClick={() => onPageChange(1)} 
          disabled={currentPage === 1}
          className="pagination-button"
          style={{
            padding: '0.25rem 0.5rem',
            margin: '0 0.125rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            background: currentPage === 1 ? '#f5f5f5' : 'white',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
          }}
          aria-label="First page"
        >
          ««
        </button>
        
        <button 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          className="pagination-button"
          style={{
            padding: '0.25rem 0.5rem',
            margin: '0 0.125rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            background: currentPage === 1 ? '#f5f5f5' : 'white',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
          }}
          aria-label="Previous page"
        >
          «
        </button>
        
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span 
              key={`ellipsis-${index}`} 
              style={{ 
                padding: '0.25rem 0.5rem',
                margin: '0 0.125rem'
              }}
            >
              ...
            </span>
          ) : (
            <button 
              key={page} 
              onClick={() => onPageChange(page)}
              className={`pagination-button ${currentPage === page ? 'active' : ''}`}
              style={{
                padding: '0.25rem 0.5rem',
                margin: '0 0.125rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                background: currentPage === page ? 'var(--accent-color, #4F46E5)' : 'white',
                color: currentPage === page ? 'white' : 'inherit',
                cursor: 'pointer'
              }}
            >
              {page}
            </button>
          )
        ))}
        
        <button 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages || totalPages === 0}
          className="pagination-button"
          style={{
            padding: '0.25rem 0.5rem',
            margin: '0 0.125rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            background: currentPage === totalPages || totalPages === 0 ? '#f5f5f5' : 'white',
            cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer'
          }}
          aria-label="Next page"
        >
          »
        </button>
        
        <button 
          onClick={() => onPageChange(totalPages)} 
          disabled={currentPage === totalPages || totalPages === 0}
          className="pagination-button"
          style={{
            padding: '0.25rem 0.5rem',
            margin: '0 0.125rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            background: currentPage === totalPages || totalPages === 0 ? '#f5f5f5' : 'white',
            cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer'
          }}
          aria-label="Last page"
        >
          »»
        </button>
      </div>
    </div>
  );
};

export default Pagination;