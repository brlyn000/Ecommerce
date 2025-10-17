import { FiRefreshCw } from 'react-icons/fi';

const RefreshIndicator = ({ lastUpdate, isRefreshing }) => {
  const getTimeAgo = () => {
    if (!lastUpdate) return '';
    const seconds = Math.floor((Date.now() - lastUpdate) / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m ago` : `${seconds}s ago`;
  };

  return (
    <div className="flex items-center text-xs text-gray-500">
      <FiRefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Updating...' : `Updated ${getTimeAgo()}`}
    </div>
  );
};

export default RefreshIndicator;