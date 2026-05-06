import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Eye, Star, Share2 } from 'lucide-react';

export default function SafetyMomentsLibrary({ data, onView }) {
  const Badge = ({ level }) => {
    const colors = {
      'Beginner': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Intermediate': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Advanced': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return <span className={`px-2 py-0.5 rounded text-xs border ${colors[level] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>{level}</span>;
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="bg-[#1f1f35] rounded-lg border border-[#3a3a5a] overflow-hidden">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs font-medium sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 border-b border-[#3a3a5a]">Title</th>
              <th className="px-6 py-4 border-b border-[#3a3a5a]">Category</th>
              <th className="px-6 py-4 border-b border-[#3a3a5a]">Duration</th>
              <th className="px-6 py-4 border-b border-[#3a3a5a]">Level</th>
              <th className="px-6 py-4 border-b border-[#3a3a5a]">Language</th>
              <th className="px-6 py-4 border-b border-[#3a3a5a]">Rating</th>
              <th className="px-6 py-4 border-b border-[#3a3a5a] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3a3a5a]">
            {data.map((row, i) => (
              <tr key={row.id || i} className="hover:bg-[#2d2d4a] transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{row.title}</div>
                  <div className="text-xs text-[#7a7a9a] truncate max-w-[200px] mt-1">{row.description}</div>
                </td>
                <td className="px-6 py-4 text-[#e0e0e0]">{row.category?.category_name || 'General'}</td>
                <td className="px-6 py-4 text-[#e0e0e0]">{row.duration} min</td>
                <td className="px-6 py-4 text-[#e0e0e0]"><Badge level={row.difficulty_level} /></td>
                <td className="px-6 py-4 text-[#e0e0e0]">{row.language || 'English'}</td>
                <td className="px-6 py-4 text-[#e0e0e0]">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="h-3 w-3 fill-current" /> {row.rating || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20" onClick={() => onView(row)} title="View Details">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20" title="Download">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#b0b0c0] hover:text-white hover:bg-[#3a3a5a]" title="Share">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-[#7a7a9a] italic bg-[#1a1a2e]">
                  No safety moments found. Try adjusting your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}