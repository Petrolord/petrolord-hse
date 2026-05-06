import { supabase } from '@/lib/customSupabaseClient';
import { gamificationService } from './gamificationService';

export const quickReportService = {
  // Analyze audio/image using AI (Mock for now or calls edge function)
  analyzeReport: async (photoBlob, audioBlob) => {
    // In a real implementation, this would upload files to storage 
    // and call an Edge Function to process them with OpenAI/Vision API
    
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      success: true,
      reportId: `QR-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      confidence: 88,
      category: 'Unsafe Behavior', // Predicted category
      severity: 'Medium',          // Predicted severity
      location: 'Site B - Generator Room',
      description: 'AI Transcription: "I noticed a loose cable near the main generator that could cause a trip hazard. It needs to be secured immediately."',
      transcription: 'I noticed a loose cable near the main generator that could cause a trip hazard. It needs to be secured immediately.',
      combinedAnalysis: {
        summary: "Trip hazard detected near generator equipment.",
        recommendedActions: ["Secure cabling", "Inspect area for other loose wires"]
      }
    };
  },

  // Submit the final report
  submitReport: async (reportData, options = {}, user, organization) => {
    try {
      let mediaUrls = [];
      
      // 1. Upload Media if present (Photo from capture step)
      if (reportData.photo) {
        const fileName = `quick-reports/${organization.id}/${Date.now()}_photo.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('org-assets')
          .upload(fileName, reportData.photo);
          
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('org-assets').getPublicUrl(fileName);
          mediaUrls.push({ type: 'image', url: publicUrl, name: 'Capture.jpg' });
        }
      }

      // 2. Upload Audio if present
      if (reportData.audioBlob) {
        const fileName = `quick-reports/${organization.id}/${Date.now()}_audio.webm`;
        const { error: uploadError } = await supabase.storage
          .from('org-assets')
          .upload(fileName, reportData.audioBlob);
          
        if (!uploadError) {
           const { data: { publicUrl } } = supabase.storage.from('org-assets').getPublicUrl(fileName);
           // We might store audio URL in specific column or media_urls
           reportData.audio_url = publicUrl; 
        }
      }

      // 3. Upload Advanced Media (Additional photos/videos)
      if (reportData.advancedMedia && reportData.advancedMedia.length > 0) {
        for (const file of reportData.advancedMedia) {
           const fileName = `quick-reports/${organization.id}/${Date.now()}_${file.name}`;
           const { error: uploadError } = await supabase.storage
             .from('org-assets')
             .upload(fileName, file);
             
           if (!uploadError) {
             const { data: { publicUrl } } = supabase.storage.from('org-assets').getPublicUrl(fileName);
             mediaUrls.push({ type: file.type.startsWith('video') ? 'video' : 'image', url: publicUrl, name: file.name });
           }
        }
      }

      // 4. Calculate Points (Bonus for advanced details)
      let pointsBase = 10;
      let pointsBonus = 0;
      
      // Check for advanced details completeness
      if (reportData.category && reportData.category !== 'Other') pointsBonus += 2;
      if (reportData.immediate_actions) pointsBonus += 3;
      if (reportData.media_urls && reportData.media_urls.length > 0) pointsBonus += 2;
      
      const totalPoints = pointsBase + pointsBonus;

      // 5. Insert into Database
      const { data: insertedReport, error: insertError } = await supabase
        .from('quick_reports')
        .insert({
          organization_id: organization.id,
          created_by_user_id: options.isAnonymous ? null : user.id,
          title: reportData.title || 'Quick Report',
          description: reportData.description || reportData.transcription || 'No description provided.',
          report_data: reportData, // Store full raw AI data
          status: options.saveAsDraft ? 'draft' : 'submitted',
          severity: reportData.severity?.toLowerCase() || 'low',
          location: reportData.location || 'Unknown',
          audio_blob_url: reportData.audio_url,
          transcription: reportData.transcription,
          leaderboard_points: totalPoints,
          
          // New Advanced Fields
          category: reportData.category,
          hazard_classification: reportData.hazard_classification,
          media_urls: mediaUrls, // JSONB array
          witnesses: reportData.witnesses || [], // JSONB array
          injured_persons: reportData.injured_persons || [], // JSONB array
          immediate_actions: reportData.immediate_actions,
          corrective_actions: reportData.corrective_actions,
          additional_notes: reportData.additional_notes,
          
          // Mappings for backward compatibility or different schema versions if needed
          people_involved: [...(reportData.witnesses || []).map(w => ({...w, role: 'witness'})), ...(reportData.injured_persons || []).map(p => ({...p, role: 'injured'}))]
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 6. Trigger Gamification Update
      if (!options.isAnonymous && !options.saveAsDraft) {
        await gamificationService.addPoints(user.id, organization.id, totalPoints, 'Quick Report Submission');
        await gamificationService.updateStreak(user.id, organization.id);
      }

      return {
        success: true,
        reportId: insertedReport.id, // Use actual DB ID
        points: totalPoints,
        streak: 1 // In real app, fetch actual streak
      };

    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  },

  getUserReports: async (userId, orgId, status = 'all') => {
    try {
      let query = supabase
        .from('quick_reports')
        .select('*')
        .eq('organization_id', orgId)
        .eq('created_by_user_id', userId)
        .order('created_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user reports:', error);
      return [];
    }
  },
  
  // Helper to fetch single report details
  getReportById: async (reportId) => {
    try {
      const { data, error } = await supabase
        .from('quick_reports')
        .select('*')
        .eq('id', reportId)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching report details:', error);
      return null;
    }
  }
};