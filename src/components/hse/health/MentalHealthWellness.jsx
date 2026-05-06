import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Heart, Phone, Smile } from 'lucide-react';

export default function MentalHealthWellness() {
  return (
    <div className="space-y-6">
      {/* Daily Check-in */}
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader><CardTitle className="text-white">Daily Pulse Check</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="text-sm text-[#b0b0c0] mb-3 block">How are you feeling today?</label>
              <div className="flex justify-between text-2xl mb-2 px-2">
                <span>😔</span><span>😐</span><span>🙂</span><span>😄</span><span>🤩</span>
              </div>
              <Slider defaultValue={[50]} max={100} step={1} className="py-2" />
            </div>
            
            <div className="flex justify-end">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Save Check-in</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Phone className="h-5 w-5 text-green-400"/> Support Hotlines</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <ResourceItem title="Company Counselor" contact="Ext. 4040" available="9am - 5pm" />
            <ResourceItem title="24/7 EAP Hotline" contact="1-800-HELP-NOW" available="24/7" />
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Smile className="h-5 w-5 text-yellow-400"/> Wellness Programs</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <ResourceItem title="Meditation Session" contact="Room 303" available="Every Tue 12pm" />
            <ResourceItem title="Yoga Class" contact="Gym" available="Every Thu 5pm" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResourceItem({ title, contact, available }) {
  return (
    <div className="flex justify-between items-center p-3 bg-[#25253e] rounded border border-[#2a2a40]">
      <div>
        <div className="text-white font-medium">{title}</div>
        <div className="text-xs text-[#8f8fdb]">{available}</div>
      </div>
      <div className="text-right">
        <div className="text-blue-400 font-bold">{contact}</div>
      </div>
    </div>
  );
}