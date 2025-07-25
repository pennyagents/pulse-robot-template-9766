
import { ApplicationStatus } from './types';
import { Badge } from '@/components/ui/badge';

// Create a mapping of category names to consistent colors
export const getCategoryColor = (categoryName: string | undefined, categoryId: string) => {
  if (!categoryName) return 'bg-gray-50 hover:bg-gray-100';
  
  console.log('Getting color for category:', categoryName, 'ID:', categoryId);
  
  // Use category ID for more consistent hashing
  const colorMap: { [key: string]: string } = {
    // Pre-defined colors for better visibility
    'default-1': 'bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-400',
    'default-2': 'bg-green-50 hover:bg-green-100 border-l-4 border-l-green-400',
    'default-3': 'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-l-yellow-400',
    'default-4': 'bg-purple-50 hover:bg-purple-100 border-l-4 border-l-purple-400',
    'default-5': 'bg-pink-50 hover:bg-pink-100 border-l-4 border-l-pink-400',
    'default-6': 'bg-indigo-50 hover:bg-indigo-100 border-l-4 border-l-indigo-400',
    'default-7': 'bg-orange-50 hover:bg-orange-100 border-l-4 border-l-orange-400',
    'default-8': 'bg-teal-50 hover:bg-teal-100 border-l-4 border-l-teal-400',
    'default-9': 'bg-red-50 hover:bg-red-100 border-l-4 border-l-red-400',
    'default-10': 'bg-cyan-50 hover:bg-cyan-100 border-l-4 border-l-cyan-400'
  };

  // Create a simple hash from category ID for consistent coloring
  let hash = 0;
  const stringToHash = categoryId || categoryName;
  for (let i = 0; i < stringToHash.length; i++) {
    const char = stringToHash.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const colorKeys = Object.keys(colorMap);
  const colorIndex = Math.abs(hash) % colorKeys.length;
  const selectedKey = colorKeys[colorIndex];
  
  console.log('Category color mapping:', categoryName, '-> hash:', hash, '-> index:', colorIndex, '-> color:', colorMap[selectedKey]);
  
  return colorMap[selectedKey];
};

export const getStatusBadge = (status: ApplicationStatus) => {
  const badgeProps = {
    approved: { className: "text-green-800 bg-lime-500", text: "Approved" },
    rejected: { className: "text-red-800 bg-red-500", text: "Rejected" },
    pending: { className: "text-yellow-800 bg-orange-500", text: "Pending" }
  };

  const props = badgeProps[status] || badgeProps.pending;
  
  return Badge({ className: props.className, children: props.text });
};
