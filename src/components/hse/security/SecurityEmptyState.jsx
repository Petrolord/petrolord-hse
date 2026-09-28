import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

// Honest placeholder for security views that have no data source yet.
export default function SecurityEmptyState({ icon: Icon, title, message }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        {Icon && <Icon className="h-12 w-12 text-pl-muted opacity-60 mx-auto mb-4" aria-hidden="true" />}
        <h3 className="text-pl-text font-medium">{title}</h3>
        {message && <p className="text-pl-muted text-sm mt-2 max-w-md mx-auto">{message}</p>}
      </CardContent>
    </Card>
  );
}
