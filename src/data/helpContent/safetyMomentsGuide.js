import { MessageCircle, Layers, Library, Bookmark, Plus, FileText, LayoutDashboard, HelpCircle } from 'lucide-react';

export const safetyMomentsGuide = {
  id: 'safety-moments',
  title: 'Safety Moments Guide',
  icon: MessageCircle,
  description: 'Find, save, present, and create short pre-task safety talks for your team briefings.',
  sections: [
    {
      id: 'overview',
      title: 'Module Overview',
      icon: Layers,
      description: 'What the Safety Moments Bank is and how to use it.',
      content: [
        { type: 'paragraph', text: 'A safety moment (sometimes called a toolbox talk or safety share) is a short, focused safety talk delivered before a task or at the start of a shift. It draws the team\'s attention to a single hazard or good practice and usually takes only a few minutes.' },
        { type: 'paragraph', text: 'The Safety Moments Bank gives you a ready-made library of these talks so supervisors and team leads do not have to write one from scratch each day. You can browse curated topics, save favourites for quick access, present them to your team, and create your own custom moments.' },
        { type: 'alert', variant: 'info', title: 'Who is this for?', text: 'Anyone who runs a team briefing or pre-task talk: supervisors, crew leads, HSE officers, and contractors. No special training is needed to use the library.' },
        { type: 'paragraph', text: 'Each safety moment is built to be easy to deliver and may include:' },
        { type: 'list', items: [
          'A short "Why it matters" introduction',
          'Key talking points to walk through',
          'A Do / Avoid (Don\'t) checklist',
          'A real-world incident scenario with the lesson learned',
          'Discussion questions to engage the team',
          'A site checklist and references to relevant standards'
        ]}
      ]
    },
    {
      id: 'navigation',
      title: 'Getting Around',
      icon: LayoutDashboard,
      description: 'The tabs and actions in the module header.',
      content: [
        { type: 'paragraph', text: 'The module opens on the Library tab. Three tabs sit across the top of the screen:' },
        { type: 'step-list', items: [
          { title: 'Library', description: 'Browse the full collection of safety moments as cards. This is your main working area for finding and opening a talk.' },
          { title: 'Overview', description: 'A summary view showing high-level stats such as the total number of moments and a featured topic of the week.' },
          { title: 'Saved', description: 'Shows only the moments you have bookmarked, so you can jump straight to the talks you use most.' }
        ]},
        { type: 'paragraph', text: 'In the top-right corner you will also find two buttons: "Create Moment" to add your own talk, and "Restock Library" to populate the bank with the built-in curated content if it is empty.' }
      ]
    },
    {
      id: 'library',
      title: 'Browsing & Filtering the Library',
      icon: Library,
      description: 'Finding the right talk for the task at hand.',
      content: [
        { type: 'paragraph', text: 'The Library shows each safety moment as a card. Every card displays the topic category, the title, a short summary, and the estimated duration in minutes. Cards you have saved show a bookmark marker in the corner.' },
        { type: 'paragraph', text: 'A filter bar sits above the cards to help you narrow the list:' },
        { type: 'list', items: [
          'Search topics: type a keyword to match against moment titles and topics.',
          'Category: filter by a specific safety category, or leave it on "All Categories".',
          'Duration: limit results by how long the talk takes (Up to 5 min, 5 - 10 min, 10 - 15 min, or 15+ min), or leave it on "Any Duration".',
          'Reset: clears the search box and both filters back to their defaults.'
        ]},
        { type: 'alert', variant: 'info', title: 'No results?', text: 'If no moments appear, the filters may be too narrow. Use Reset to clear them, or check that the library has been stocked using the "Restock Library" button.' }
      ]
    },
    {
      id: 'detail',
      title: 'Opening & Presenting a Moment',
      icon: FileText,
      description: 'Using the detail panel to deliver a talk.',
      content: [
        { type: 'paragraph', text: 'Click any card to open the moment in a side panel. The panel shows the full talk: the category, duration, when to use it, why it matters, the key talking points, Do / Avoid lists, any incident scenario, discussion questions, a site checklist, and references.' },
        { type: 'step-list', items: [
          { title: 'Find a relevant topic', description: 'On the Library tab, use the search box and the Category and Duration filters to find a talk that fits today\'s task.' },
          { title: 'Open the moment', description: 'Click the card to open the detail side panel and read through the full content.' },
          { title: 'Deliver it to your team', description: 'Walk through the "Why it matters" intro, the key talking points, and the Do / Avoid lists. Use the discussion questions to get the team talking.' },
          { title: 'Hand out or copy the content', description: 'Use the Export button to download the moment as a PDF, PowerPoint slide, or Word document, or use the copy buttons to copy a single section or the full text.' },
          { title: 'Share with the team', description: 'Use the "Share with Team" action at the bottom of the panel to distribute the moment.' }
        ]},
        { type: 'paragraph', text: 'Small copy icons next to individual sections (such as "Why It Matters" and "Key Talking Points") let you copy just that part to your clipboard, while "Copy All Text" at the bottom copies the whole talk.' }
      ]
    },
    {
      id: 'saving',
      title: 'Saving Moments',
      icon: Bookmark,
      description: 'Bookmarking talks for quick access.',
      content: [
        { type: 'paragraph', text: 'Saving (bookmarking) a moment keeps it within easy reach so you do not have to search for it again before each briefing.' },
        { type: 'step-list', items: [
          { title: 'Open a moment', description: 'Click a card in the Library to open the detail side panel.' },
          { title: 'Tap the bookmark', description: 'Click the bookmark icon near the top of the panel. When it is filled in, the moment is saved.' },
          { title: 'Find it again', description: 'Switch to the Saved tab at any time to see all your bookmarked moments in one place.' }
        ]},
        { type: 'paragraph', text: 'To unsave a moment, open it again and tap the bookmark icon a second time. Saved cards in the Library are marked with a bookmark indicator so you can spot them at a glance.' }
      ]
    },
    {
      id: 'create',
      title: 'Creating a New Moment',
      icon: Plus,
      description: 'Adding your own custom safety talk.',
      content: [
        { type: 'paragraph', text: 'When you have a site-specific topic that is not already in the bank, you can build your own. Click "Create Moment" in the top-right corner to open the builder. It is organised into four tabs so you can fill it in step by step.' },
        { type: 'step-list', items: [
          { title: 'Basics', description: 'Enter the topic title (required), choose a category, set an estimated duration, note when the talk should be used, and write the "Why It Matters" introduction.' },
          { title: 'Key Content', description: 'Add your key talking points (3 to 5 are recommended) and build the Do list and Don\'t list. Use the Add buttons to insert more rows and the trash icon to remove one.' },
          { title: 'Scenario & Engagement', description: 'Describe an incident scenario (what happened, what should have happened, and the lesson) and add discussion questions to spark conversation.' },
          { title: 'Summary & Review', description: 'Write a one-minute recap, add any site checklist items, and list references or standards.' }
        ]},
        { type: 'paragraph', text: 'When you are done, click "Save to Bank". The moment is created as a Draft and added to the library so it appears alongside the curated content.' },
        { type: 'alert', variant: 'warning', title: 'Title and organisation required', text: 'The topic title is mandatory, and you must have an organisation selected before a moment can be saved. If saving fails, check that both are set.' }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: HelpCircle,
      description: 'Quick fixes for common issues.',
      content: [
        { type: 'step-list', items: [
          { title: 'The library is empty', description: 'Use the "Restock Library" button in the top-right corner to populate the bank with the built-in curated safety moments.' },
          { title: 'A search returns nothing', description: 'Your filters may be too narrow. Click Reset to clear the search box, Category, and Duration filters.' },
          { title: 'The Saved tab is empty', description: 'You have not bookmarked any moments yet. Open a moment and tap the bookmark icon to save it.' },
          { title: 'A moment will not save', description: 'Make sure the topic title is filled in and that an organisation is selected before clicking "Save to Bank".' }
        ]}
      ]
    }
  ]
};
