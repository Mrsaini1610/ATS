import React from "react";

export default function ReactPagination({
  totalPages,
  currentPage,
  onPageChange,
}) {
  // Define the maximum number of page buttons to display
  const maxVisiblePages = 5;

  // Calculate the start and end of the visible range
  const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Adjust the start page if there are fewer pages at the end
  const adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1);

  // Generate the page numbers to display
  const pageNumbers = Array.from(
    { length: endPage - adjustedStartPage + 1 },
    (_, i) => adjustedStartPage + i
  );

  return (
    totalPages > 1 && (
      <div className="flex justify-center items-center mt-4 space-x-2">
        {/* Previous Button */}
        <button
          type="button"
          className={`px-3 py-1 border rounded ${
            currentPage === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-white text-green-700"
          }`}
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {/* Page Number Buttons */}
        {pageNumbers.map((page) => (
          <button
            type="button"
            key={page}
            className={`px-3 py-1 border rounded ${
              currentPage === page
                ? "bg-green-500 text-white"
                : "bg-white text-green-700"
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          type="button"
          className={`px-3 py-1 border rounded ${
            currentPage === totalPages
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-white text-green-700"
          }`}
          onClick={() =>
            currentPage < totalPages && onPageChange(currentPage + 1)
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    )
  );
}
