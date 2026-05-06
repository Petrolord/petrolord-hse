import { supabase } from '@/lib/customSupabaseClient';

export const chatbotService = {
  /**
   * Sends a message to the AI Chatbot via Supabase Edge Function
   * @param {Array} history - Array of message objects { role: 'user'|'assistant', content: '...' }
   * @param {string} userId - Current user UUID
   * @param {string} orgId - Current organization UUID
   */
  async sendMessage(history, userId, orgId) {
    try {
      // 1. Invoke the function
      const { data, error } = await supabase.functions.invoke('chat-with-petrolord', {
        body: {
          messages: history,
          userId,
          orgId
        }
      });

      // 2. Handle Network/Infrastructure Errors (Supabase client errors)
      if (error) {
        console.error('Supabase Client Error:', error);
        // Try to read the response body if it exists, sometimes error object has context
        let detailedMsg = error.message;
        
        // If the function returns a 500 with a JSON body, supabase client puts it in 'context' or similar depending on version
        // We'll throw a generic error if we can't find specifics
        throw new Error(detailedMsg || 'Network error connecting to AI service');
      }

      // 3. Handle Application Errors (Function returned 500 or 400 with { error: ... })
      // Even if Supabase client returns success=true for invoke, the function might return data.error
      if (data && data.error) {
        console.error('Edge Function Logic Error:', data.error);
        throw new Error(data.error);
      }

      // 4. Validate Success Response
      if (!data || !data.message) {
        throw new Error('Received empty response from AI service');
      }

      return data.message;
    } catch (error) {
      console.error('Chatbot Service Error:', error);
      
      // Improve the error message for the UI
      let uiMessage = error.message;
      if (uiMessage.includes('functions_client_error')) {
        uiMessage = "Unable to connect to AI server. Please check your internet connection.";
      } else if (uiMessage.includes('OpenAI')) {
        uiMessage = "AI Provider Error: " + uiMessage;
      }
      
      throw new Error(uiMessage);
    }
  },

  /**
   * Local storage management for offline support/persistence
   */
  saveHistoryToLocal(history) {
    try {
      localStorage.setItem('petrolord_chat_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save chat history', e);
    }
  },

  loadHistoryFromLocal() {
    try {
      const saved = localStorage.getItem('petrolord_chat_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to load chat history', e);
      return [];
    }
  },

  clearHistory() {
    localStorage.removeItem('petrolord_chat_history');
  }
};