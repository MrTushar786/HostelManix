import { memo } from "react";

const Pagination = memo(function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      gap: "8px", 
      marginTop: "20px",
      flexWrap: "wrap"
    }}>
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        style={{
          padding: "8px 12px",
          background: currentPage === 1 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: "8px",
          color: "#fff",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          opacity: currentPage === 1 ? 0.5 : 1
        }}
      >
        ««
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: "8px 12px",
          background: currentPage === 1 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: "8px",
          color: "#fff",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          opacity: currentPage === 1 ? 0.5 : 1
        }}
      >
        «
      </button>
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            padding: "8px 14px",
            background: currentPage === page ? "rgba(96,165,250,0.4)" : "rgba(255,255,255,0.15)",
            border: `1px solid ${currentPage === page ? "#60a5fa" : "rgba(255,255,255,0.3)"}`,
            borderRadius: "8px",
            color: "#fff",
            cursor: "pointer",
            fontWeight: currentPage === page ? "700" : "500",
            transition: "all 0.2s ease"
          }}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: "8px 12px",
          background: currentPage === totalPages ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: "8px",
          color: "#fff",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          opacity: currentPage === totalPages ? 0.5 : 1
        }}
      >
        »
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        style={{
          padding: "8px 12px",
          background: currentPage === totalPages ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: "8px",
          color: "#fff",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          opacity: currentPage === totalPages ? 0.5 : 1
        }}
      >
        »»
      </button>
      <span style={{ color: "#93c5fd", marginLeft: "12px", fontSize: "0.9rem" }}>
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
});

export default Pagination;

