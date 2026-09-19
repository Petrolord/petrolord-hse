import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

// Honest placeholder for security views that have no data source yet.
export default function SecurityEmptyState({ icon: Icon, title, message }) {
  return (
    <Card className="bg-[#1e1e30] border-[#2a2a40]">
      <CardContent className="py-12 text-center">
        {Icon && <Icon className="h-12 w-12 text-gray-600 mx-auto mb-4" />}
        <h3 className="text-white font-medium">{title}</h3>
        {message && <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">{message}</p>}
      </CardContent>
    </Card>
  );
}
