import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageSquare } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { helpService } from '@/services/helpService';
import { useHSE } from '@/context/HSEContext';

// Design family (batch 2C): the support form in the kit's input styling.
export default function SupportContact() {
  const { toast } = useToast();
  const { currentOrganization } = useHSE();
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
      await helpService.createTicket(ticket, currentOrganization?.id);
      toast({
        title: "Ticket Submitted",
        description: "We've received your request and will respond shortly.",
        variant: "success"
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
        <h2 className="font-pl-display text-2xl sm:text-3xl font-semibold text-pl-text mb-4">Contact Support</h2>
        <p className="text-pl-muted">Can't find what you're looking for? Our team is here to help.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Mail className="h-8 w-8 text-pl-primary-text mb-4" aria-hidden="true" />
            <h3 className="font-bold text-pl-text mb-2">Email Us</h3>
            <p className="text-sm text-pl-text mb-4">support@petrolord.com</p>
            <span className="text-xs text-pl-muted">Response time: 24 hours</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* Ticket Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit a Support Ticket</CardTitle>
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
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={ticket.category} onValueChange={v => setTicket({...ticket, category: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
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
                  className="h-32"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full font-semibold"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Side */}
        <div className="space-y-6">
          <div className="bg-pl-surface border border-pl-border shadow-pl-sm rounded-xl p-6">
            <h3 className="font-bold text-pl-text mb-2">Before you submit...</h3>
            <ul className="list-disc pl-5 space-y-2 text-pl-muted text-sm">
              <li>Check the <strong>FAQs</strong> tab for quick answers.</li>
              <li>Ensure your browser is up to date (Chrome, Firefox, Edge).</li>
              <li>Clear your cache and cookies if experiencing loading issues.</li>
              <li>Have screenshots ready if applicable.</li>
            </ul>
          </div>

          <div className="bg-pl-surface border border-pl-border shadow-pl-sm rounded-xl p-6">
            <h3 className="font-bold text-pl-text mb-2">Enterprise Support</h3>
            <p className="text-pl-muted text-sm mb-4">
              Premium enterprise clients have access to a dedicated account manager and expedited SLA.
            </p>
            <Button variant="outline">
              Contact Account Manager
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}