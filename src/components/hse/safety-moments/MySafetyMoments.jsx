import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Calendar, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function MySafetyMoments({ data, onDelete }) {
  const StatusBadge = ({ status }) => {
    const colors = {
      'Draft': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'Published': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'Scheduled': 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>{status}</span>;
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="bg-[#1f1f35] rounded-lg border border-[#3a3a5a] overflow-hidden">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs font-medium sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 border-b border-[#3a3a5a]">Title</th>
              <th className="px-6 py-4 border-b border-[#3a3a5a]">Category</th>
              <th className="px-6 py-4 border-b border-[#3a3a5a]">Status</th>
              <th className="px-6 py-4 border-b border-[#3a3a5a]">Created</th>
              <th className="px-6 py-4 border-b border-[#3a3a5a]">Views</th>
              <th className="px-6 py-4 border-b border-[#3a3a5a] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3a3a5a]">
            {data.map((row, i) => (
              <tr key={row.id || i} className="hover:bg-[#2d2d4a] transition-colors group">
                <td className="px-6 py-4 font-medium text-white">{row.title}</td>
                <td className="px-6 py-4 text-[#e0e0e0]">{row.category?.category_name || 'Uncategorized'}</td>
                <td className="px-6 py-4 text-[#e0e0e0]"><StatusBadge status={row.status} /></td>
                <td className="px-6 py-4 text-[#e0e0e0]">{new Date(row.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-[#e0e0e0]">{row.views_count || 0}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#b0b0c0] hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-[#3a3a5a] text-[#e0e0e0]">
                        <DropdownMenuItem className="hover:bg-[#2d2d4a] cursor-pointer">
                          <Calendar className="mr-2 h-4 w-4" /> Schedule
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="hover:bg-red-900/20 text-red-400 cursor-pointer"
                          onClick={() => onDelete && onDelete(row.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-[#7a7a9a] italic bg-[#1a1a2e]">
                  You haven't created any safety moments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}