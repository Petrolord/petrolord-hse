import React from 'react';
import { cn } from "@/lib/utils";
import { Check, X, ShieldAlert, AlertTriangle, ListChecks, HelpCircle } from 'lucide-react';

/**
 * PETROLORD SAFETY MASTER TEMPLATE - STRICT CONTAINMENT VERSION
 * 
 * DESIGN RULES:
 * - Aspect Ratio: 16:9 (aspect-video)
 * - Background: #0F1B2E (Deep Navy)
 * - Margins: 40px safe area
 * - Logo: Absolute Top-Left (20px, 20px), Height 80px
 * - Content Start: 120px from top (to clear logo)
 * - Typography: Inter Bold 48px (Title), Inter Regular 16px (Body)
 * - Colors: White (Text), #F4B860 (Gold Accent), #E8E8E8 (Body Text)
 */

const BRAND = {
  logoUrl: "https://horizons-cdn.hostinger.com/b49b4b29-7343-48e8-91d9-c4b871e9bda0/0dd90013bb9d0942cf157920a4b88029.png",
  colors: {
    bg: "#0F1B2E",
    gold: "#F4B860",
    text: "#FFFFFF",
    body: "#E8E8E8",
    green: "#22C55E",
    red: "#EF4444"
  }
};

// --- CORE LAYOUT COMPONENTS ---

const SlideWrapper = ({ children, className }) => (
  <div className={cn(
    "relative w-full aspect-video bg-[#0F1B2E] overflow-hidden text-white font-sans flex flex-col shadow-2xl shrink-0",
    className
  )}>
    {/* 1. BRANDING LAYER (Absolute) */}
    <img 
      src={BRAND.logoUrl} 
      alt="Petrolord" 
      className="absolute top-[20px] left-[20px] h-[80px] w-auto object-contain z-50 pointer-events-none select-none"
    />
    
    {/* 2. CONTENT LAYER (Flex Column with Top Pad to clear logo) */}
    {/* The top padding of 120px ensures no content ever starts behind the logo */}
    <div className="flex flex-col h-full w-full px-[40px] pb-[40px] pt-[120px]">
      {children}
    </div>
  </div>
);

const SlideTitle = ({ children }) => (
  <div className="w-full shrink-0 mb-6 border-b-[2px] border-[#F4B860] pb-2">
    <h2 className="text-[48px] font-bold leading-[1.2] text-white tracking-tight line-clamp-2">
      {children}
    </h2>
  </div>
);

// --- SLIDE TYPES ---

// 1. Cover Slide (Unique Layout)
const CoverSlide = ({ title, category, duration }) => (
  <div className="relative w-full aspect-video bg-[#0F1B2E] overflow-hidden flex flex-col items-center justify-center text-center p-[40px] shrink-0 shadow-2xl">
    {/* Large Centered Logo */}
    <img 
      src={BRAND.logoUrl} 
      alt="Petrolord" 
      className="h-[200px] w-auto object-contain mb-12 drop-shadow-2xl"
    />
    
    <div className="w-[120px] h-[4px] bg-[#F4B860] mb-8 rounded-full" />
    
    <div className="uppercase tracking-[0.2em] text-[#F4B860] font-bold text-xl mb-4">
      {category || "Safety Moment"}
    </div>
    
    <h1 className="text-[64px] font-extrabold text-white leading-tight mb-6 max-w-[90%] line-clamp-3">
      {title}
    </h1>
    
    {duration && (
      <div className="flex items-center gap-3 text-[#D0D0D0] text-2xl bg-white/5 px-8 py-3 rounded-full backdrop-blur-sm border border-white/10">
        <span className="font-bold text-[#F4B860]">{duration} MIN</span> Reading Time
      </div>
    )}
  </div>
);

// 2. Content Slide (1 Column)
const ContentSlide = ({ title, body }) => (
  <SlideWrapper>
    <SlideTitle>{title}</SlideTitle>
    <div className="flex-1 min-h-0 overflow-y-auto pr-4">
      <div className="text-[24px] leading-[1.6] text-[#E8E8E8] whitespace-pre-wrap font-light">
        {body}
      </div>
    </div>
  </SlideWrapper>
);

// 3. Do's vs Don'ts (Split Column)
const DoDontSlide = ({ dos = [], donts = [] }) => (
  <SlideWrapper>
    <SlideTitle>Safety Practices</SlideTitle>
    <div className="flex-1 min-h-0 flex gap-[40px] overflow-hidden">
      
      {/* DO Column */}
      <div className="flex-1 flex flex-col bg-white/5 border-2 border-[#F4B860]/30 rounded-xl overflow-hidden">
        <div className="bg-[#F4B860]/10 p-4 border-b border-[#F4B860]/30 flex items-center gap-3 shrink-0">
          <div className="bg-[#F4B860] p-1 rounded-full text-[#0F1B2E]">
            <Check className="w-6 h-6 stroke-[4px]" />
          </div>
          <h3 className="text-[28px] font-bold text-[#F4B860] tracking-wide">DO THIS</h3>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <ul className="space-y-4">
            {dos.map((item, i) => (
              <li key={i} className="flex gap-4 text-[20px] text-[#E8E8E8] leading-snug items-start">
                <span className="text-[#F4B860] font-bold mt-1">•</span>
                <span>{item.replace(/^DO /i, '')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* DON'T Column */}
      <div className="flex-1 flex flex-col bg-white/5 border-2 border-[#F4B860]/30 rounded-xl overflow-hidden">
        <div className="bg-[#F4B860]/10 p-4 border-b border-[#F4B860]/30 flex items-center gap-3 shrink-0">
          <div className="bg-[#F4B860] p-1 rounded-full text-[#0F1B2E]">
            <X className="w-6 h-6 stroke-[4px]" />
          </div>
          <h3 className="text-[28px] font-bold text-[#F4B860] tracking-wide">AVOID THIS</h3>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <ul className="space-y-4">
            {donts.map((item, i) => (
              <li key={i} className="flex gap-4 text-[20px] text-[#E8E8E8] leading-snug items-start">
                <span className="text-[#F4B860] font-bold mt-1">•</span>
                <span>{item.replace(/^DON'T /i, '').replace(/^DONT /i, '')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  </SlideWrapper>
);

// 4. Scenario Slide (Stacked Sections)
const ScenarioSlide = ({ scenario }) => (
  <SlideWrapper>
    <SlideTitle>Real World Scenario</SlideTitle>
    <div className="flex-1 min-h-0 flex flex-col gap-6 overflow-y-auto pr-2">
      
      {/* What Happened */}
      <div className="bg-white/5 p-6 rounded-lg border-l-[6px] border-[#F4B860] shrink-0">
        <h4 className="text-[#F4B860] font-bold text-[18px] uppercase mb-2 tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> What Happened
        </h4>
        <p className="text-[22px] text-white italic leading-relaxed">"{scenario.what_happened}"</p>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Correct Action */}
        <div className="flex-1 bg-white/5 p-6 rounded-lg border-l-[6px] border-white/30 overflow-y-auto">
          <h4 className="text-[#D0D0D0] font-bold text-[18px] uppercase mb-2 tracking-wider">Correct Action</h4>
          <p className="text-[20px] text-[#E8E8E8] leading-relaxed">{scenario.what_should_happen}</p>
        </div>

        {/* Key Lesson */}
        <div className="flex-1 bg-[#F4B860]/10 p-6 rounded-lg border-l-[6px] border-[#F4B860] overflow-y-auto">
          <h4 className="text-[#F4B860] font-bold text-[18px] uppercase mb-2 tracking-wider">Key Lesson</h4>
          <p className="text-[20px] text-white font-medium leading-relaxed">{scenario.lesson}</p>
        </div>
      </div>

    </div>
  </SlideWrapper>
);

// 5. Checklist Slide (Grid)
const ChecklistSlide = ({ items }) => (
  <SlideWrapper>
    <SlideTitle>Site Safety Checklist</SlideTitle>
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="grid grid-cols-2 gap-x-12 gap-y-6">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10 break-inside-avoid hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 border-[3px] border-[#F4B860] rounded flex-shrink-0 mt-1" />
            <span className="text-[22px] text-[#E8E8E8] leading-snug">{item}</span>
          </div>
        ))}
      </div>
    </div>
  </SlideWrapper>
);

// 6. Discussion Slide (Grouped)
const DiscussionSlide = ({ questions, part, total }) => (
  <SlideWrapper>
    <div className="w-full shrink-0 mb-6 border-b-[2px] border-[#F4B860] pb-2 flex justify-between items-end">
      <h2 className="text-[48px] font-bold leading-[1.2] text-white tracking-tight">Team Discussion</h2>
      {total > 1 && <span className="text-[#F4B860] text-2xl font-bold pb-1">Part {part} of {total}</span>}
    </div>
    
    <div className="flex-1 min-h-0 flex flex-col gap-6 overflow-y-auto">
      {questions.map((q, i) => (
        <div key={i} className="bg-white/5 p-6 rounded-xl border border-white/10 flex gap-6 items-start">
          <div className="bg-[#F4B860] text-[#0F1B2E] font-bold text-xl px-4 py-2 rounded-lg shrink-0">
            Q{i + 1 + ((part-1)*4)}
          </div>
          <p className="text-[28px] font-medium text-white leading-snug">{q}</p>
        </div>
      ))}
    </div>
  </SlideWrapper>
);

// 7. Closing Slide
const ClosingSlide = () => (
  <div className="relative w-full aspect-video bg-[#0F1B2E] overflow-hidden flex flex-col items-center justify-center text-center p-[40px] shrink-0 shadow-2xl">
    {/* Small Logo Top Left for Consistency */}
    <img 
      src={BRAND.logoUrl} 
      alt="Petrolord" 
      className="absolute top-[20px] left-[20px] h-[80px] w-auto object-contain opacity-50"
    />
    
    <ShieldAlert className="w-32 h-32 text-[#F4B860] mb-8 stroke-[1.5]" />
    
    <h2 className="text-[80px] font-extrabold text-white mb-8 tracking-tight">STAY SAFE</h2>
    
    <div className="w-[200px] h-[6px] bg-[#F4B860] mb-10 rounded-full" />
    
    <p className="text-[32px] text-[#D0D0D0] leading-relaxed max-w-[800px]">
      Safety is everyone's responsibility.<br/>
      <span className="text-white font-bold">If you see something, say something.</span>
    </p>
  </div>
);


// --- MAIN EXPORT ---

export const PetrolordSafetyMasterTemplate = ({ moment }) => {
  if (!moment) return null;

  // Data Prep
  const keyPoints = moment.key_points || moment.key_talking_points || [];
  const dos = moment.do_list || [];
  const donts = moment.dont_list || [];
  const scenario = moment.incident_scenario || {};
  const checklist = moment.site_checklist || [];
  const questions = moment.discussion_questions || [];

  // Chunk Questions (Max 4 per slide)
  const questionChunks = [];
  for (let i = 0; i < questions.length; i += 4) {
    questionChunks.push(questions.slice(i, i + 4));
  }

  return (
    <div className="flex flex-col gap-12 bg-black/95 p-8 min-h-screen items-center overflow-y-auto">
      
      {/* 1. COVER */}
      <div className="w-full max-w-[1200px]">
        <CoverSlide 
          title={moment.title} 
          category={moment.category?.name} 
          duration={moment.duration} 
        />
      </div>

      {/* 2. WHY IT MATTERS */}
      <div className="w-full max-w-[1200px]">
        <ContentSlide 
          title="Why It Matters" 
          body={moment.why_it_matters || moment.description} 
        />
      </div>

      {/* 3. KEY POINTS */}
      {keyPoints.length > 0 && (
        <div className="w-full max-w-[1200px]">
          <ContentSlide 
            title="Key Takeaways" 
            body={
              <ul className="space-y-4 mt-2">
                {keyPoints.map((pt, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="text-[#F4B860] font-bold text-2xl leading-none mt-1">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            } 
          />
        </div>
      )}

      {/* 4. DO'S & DON'TS */}
      {(dos.length > 0 || donts.length > 0) && (
        <div className="w-full max-w-[1200px]">
          <DoDontSlide dos={dos} donts={donts} />
        </div>
      )}

      {/* 5. SCENARIO */}
      {scenario.what_happened && (
        <div className="w-full max-w-[1200px]">
          <ScenarioSlide scenario={scenario} />
        </div>
      )}

      {/* 6. CHECKLIST */}
      {checklist.length > 0 && (
        <div className="w-full max-w-[1200px]">
          <ChecklistSlide items={checklist} />
        </div>
      )}

      {/* 7. DISCUSSION */}
      {questionChunks.map((chunk, i) => (
        <div key={i} className="w-full max-w-[1200px]">
          <DiscussionSlide 
            questions={chunk} 
            part={i + 1} 
            total={questionChunks.length} 
          />
        </div>
      ))}

      {/* 8. CLOSING */}
      <div className="w-full max-w-[1200px]">
        <ClosingSlide />
      </div>

    </div>
  );
};

export default PetrolordSafetyMasterTemplate;