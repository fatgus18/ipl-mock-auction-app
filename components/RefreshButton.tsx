"use client";

import { useState } from 'react';

interface RefreshButtonProps {
  onDataRefresh: (data: any) => void;
}

export default function RefreshButton({ onDataRefresh }: RefreshButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/refresh');
      const result = await response.json();

      if (result.success) {
        onDataRefresh(result.data);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        alert('Failed to refresh data');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('Error refreshing data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleRefresh}
        disabled={isLoading}
        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
          isLoading
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
        }`}
      >
        <svg
          className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {isLoading ? 'Refreshing...' : 'Refresh Data'}
      </button>
      {lastUpdated && (
        <span className="text-xs text-gray-400">
          Updated: {lastUpdated}
        </span>
      )}
    </div>
  );
}
