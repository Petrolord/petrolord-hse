import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MessageSquare, Clock } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { helpService } from '@/services/helpService';

export default function SupportContact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticket, setTicket] = useState({
    subject: '',
    category: '',
    priority: 'Medium',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await helpService.createTicket(ticket);
      toast({
        title: "Ticket Submitted",
        description: "We've received your request and will respond shortly.",
        className: "bg-green-600 text-white border-none"
      });
      setTicket({ subject: '', category: '', priority: 'Medium', description: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4">Contact Support</h2>
        <p className="text-[#b0b0c0]">Can't find what you're looking for? Our team is here to help.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Mail className="h-8 w-8 text-[#FFC107] mb-4" />
            <h3 className="font-bold text-white mb-2">Email Us</h3>
            <p className="text-sm text-gray-400 mb-4">support@petrolord.com</p>
            <span className="text-xs text-gray-500">Response time: 24 hours</span>
          </CardContent>
        </Card>
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Phone className="h-8 w-8 text-[#FFC107] mb-4" />
            <h3 className="font-bold text-white mb-2">Call Us</h3>
            <p className="text-sm text-gray-400 mb-4">+1 (555) 123-4567</p>
            <span className="text-xs text-gray-500">Mon-Fri, 9am-6pm EST</span>
          </CardContent>
        </Card>
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Clock className="h-8 w-8 text-[#FFC107] mb-4" />
            <h3 className="font-bold text-white mb-2">SLA Status</h3>
            <p className="text-sm text-gray-400 mb-4">Systems Operational</p>
            <span className="text-xs text-green-500 font-bold">99.9% Uptime</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* Ticket Form */}
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader>
            <CardTitle className="text-white">Submit a Support Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input 
                  value={ticket.subject}
                  onChange={e => setTicket({...ticket, subject: e.target.value})}
                  required
                  placeholder="Brief summary of the issue"
                  className="bg-[#1a1a2e] border-[#3a3a5a] text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={ticket.category} onValueChange={v => setTicket({...ticket, category: v})}>
                    <SelectTrigger className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="access">Access/Login</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={ticket.priority} onValueChange={v => setTicket({...ticket, priority: v})}>
                    <SelectTrigger className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={ticket.description}
                  onChange={e => setTicket({...ticket, description: e.target.value})}
                  required
                  placeholder="Detailed explanation..."
                  className="bg-[#1a1a2e] border-[#3a3a5a] text-white h-32"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#FFC107] text-black hover:bg-[#e0a800] font-bold"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Side */}
        <div className="space-y-6">
          <div className="bg-[#1a1a2e] border border-[#3a3a5a] rounded-xl p-6">
            <h3 className="font-bold text-white mb-2">Before you submit...</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-400 text-sm">
              <li>Check the <strong>FAQs</strong> tab for quick answers.</li>
              <li>Ensure your browser is up to date (Chrome, Firefox, Edge).</li>
              <li>Clear your cache and cookies if experiencing loading issues.</li>
              <li>Have screenshots ready if applicable.</li>
            </ul>
          </div>

          <div className="bg-[#1a1a2e] border border-[#3a3a5a] rounded-xl p-6">
            <h3 className="font-bold text-white mb-2">Enterprise Support</h3>
            <p className="text-gray-400 text-sm mb-4">
              Premium enterprise clients have access to a dedicated account manager and expedited SLA.
            </p>
            <Button variant="outline" className="border-[#3a3a5a] text-white hover:bg-[#252541]">
              Contact Account Manager
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}