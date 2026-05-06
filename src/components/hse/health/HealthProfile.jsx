import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, FileText, Pill, AlertOctagon } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { supabase } from '@/lib/customSupabaseClient';

export default function HealthProfile() {
  const { currentUser, currentOrganization } = useHSE();
  const [profile, setProfile] = useState(null);
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    if(currentUser && currentOrganization) {
      loadProfile();
    }
  }, [currentUser, currentOrganization]);

  const loadProfile = async () => {
    // Use maybeSingle() to avoid error if profile doesn't exist yet
    const { data } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('organization_id', currentOrganization.id)
      .maybeSingle();
    
    const { data: certData } = await supabase
      .from('medical_certifications')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('organization_id', currentOrganization.id);

    setProfile(data || {});
    setCerts(certData || []);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Health Info */}
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader><CardTitle className="text-white flex items-center gap-2"><User className="h-5 w-5 text-blue-400"/> Personal Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Blood Type" value="O+" />
            <InfoField label="Emergency Contact" value={profile?.emergency_contact || "Not Set"} />
          </div>
          
          <div>
            <label className="text-xs text-[#8f8fdb] uppercase mb-2 block">Medical Conditions</label>
            <div className="flex flex-wrap gap-2">
              {profile?.medical_conditions?.length > 0 ? profile.medical_conditions.map((c, i) => (
                <Badge key={i} variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">{c}</Badge>
              )) : <span className="text-sm text-gray-500">None declared</span>}
            </div>
          </div>

          <div>
            <label className="text-xs text-[#8f8fdb] uppercase mb-2 block">Allergies</label>
            <div className="flex flex-wrap gap-2">
              {profile?.allergies?.length > 0 ? profile.allergies.map((a, i) => (
                <Badge key={i} variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">{a}</Badge>
              )) : <span className="text-sm text-gray-500">None declared</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fitness for Duty */}
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader><CardTitle className="text-white flex items-center gap-2"><ActivityIcon className="h-5 w-5 text-green-400"/> Fitness for Duty</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6 p-4 bg-[#25253e] rounded-lg border border-[#2a2a40]">
            <div>
              <p className="text-[#8f8fdb] text-sm">Current Status</p>
              <h3 className={`text-xl font-bold ${profile?.fitness_for_duty_status === 'Fit' ? 'text-green-400' : 'text-red-400'}`}>
                {profile?.fitness_for_duty_status || 'Unknown'}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-[#8f8fdb] text-sm">Last Assessment</p>
              <p className="text-white">{profile?.fitness_for_duty_date ? new Date(profile.fitness_for_duty_date).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-[#8f8fdb] uppercase">Restrictions & Accommodations</label>
            <p className="text-sm text-white bg-[#25253e] p-3 rounded-md min-h-[60px]">
              {profile?.restrictions_accommodations || "No active restrictions."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card className="bg-[#1e1e30] border-[#2a2a40] lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2"><FileText className="h-5 w-5 text-purple-400"/> Medical Certifications</CardTitle>
          <Button size="sm" variant="outline" className="border-[#3a3a5a] hover:bg-[#2a2a40]">Upload New</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {certs.length === 0 ? <p className="text-gray-500 text-center py-4">No certifications on file.</p> : certs.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between p-3 bg-[#25253e] rounded-lg hover:bg-[#2a2a45] transition-colors border border-[#2a2a40]">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">{cert.certificate_type}</p>
                    <p className="text-xs text-[#8f8fdb]">{cert.issuing_authority}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-[#8f8fdb]">Expires</p>
                    <p className="text-white text-sm">{new Date(cert.expiry_date).toLocaleDateString()}</p>
                  </div>
                  <Badge className={`${cert.status === 'Valid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {cert.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <label className="text-xs text-[#8f8fdb] uppercase mb-1 block">{label}</label>
      <div className="text-white font-medium bg-[#25253e] px-3 py-2 rounded border border-[#2a2a40]">{value}</div>
    </div>
  );
}

function ActivityIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}