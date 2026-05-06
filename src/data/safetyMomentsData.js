export const safetyMomentsData = [
  // --- PHASE 1 (1-21) ---
  {
    title: "Safety Footwear",
    category_name: "Personal Protective Equipment (PPE)",
    duration: 10,
    when_to_use: "In all workplaces where foot hazards exist - crushing, puncture, or slip hazards.",
    why_it_matters: "Foot injuries are common and can result in permanent disability. Proper footwear prevents crushing, punctures, and slips. Modern safety shoes are comfortable and effective.",
    key_talking_points: [
      "Types: Steel/Composite toe, EH rated, Puncture resistant, Slip resistant.",
      "Fit: Critical for comfort. Measure feet in afternoon.",
      "Inspection: Check soles, uppers, laces. Replace worn shoes.",
      "Hazards: Match footwear to hazard (crushing, electrical, chemical).",
      "Compliance: OSHA requirement. Employer usually provides/reimburses."
    ],
    do_list: [
      "DO wear safety footwear rated for hazards",
      "DO ensure proper fit",
      "DO inspect shoes regularly",
      "DO replace worn/damaged shoes",
      "DO keep shoes clean/dry",
      "DO wear work socks",
      "DO report foot pain",
      "DO follow requirements"
    ],
    dont_list: [
      "DON'T wear sandals/open-toed shoes",
      "DON'T wear worn-out shoes",
      "DON'T wear ill-fitting shoes",
      "DON'T wear broken laces",
      "DON'T ignore pain",
      "DON'T take shortcuts"
    ],
    incident_scenario: {
      what_happened: "Warehouse worker moving boxes in sneakers. Box fell, crushed foot causing fractures.",
      what_should_happen: "Should have worn steel-toe boots.",
      lesson: "Wear rated footwear for hazards."
    },
    discussion_questions: ["What hazards exist here?", "Required footwear type?", "Inspection frequency?", "Importance of fit?", "Steel vs Composite?"],
    site_checklist: ["Hazards identified", "Requirements documented", "Footwear available", "Proper fit", "Regular inspection", "No damaged shoes", "Workers trained"],
    one_minute_recap: "Safety footwear prevents injuries. Wear rated shoes. Ensure fit. Inspect regularly. Replace worn shoes.",
    references: ["OSHA 1910.136", "ANSI Z41", "ASTM F-1679"]
  },
  {
    title: "Muster Points",
    category_name: "Emergency Procedures",
    duration: 10,
    when_to_use: "During evacuations. Everyone must know the location.",
    why_it_matters: "Designated assembly areas ensure accountability during emergencies. Prevents confusion and helps responders.",
    key_talking_points: [
      "Definition: Safe assembly area outside.",
      "Location: 150ft+ away, safe from hazards.",
      "Procedure: Evacuate immediately, go to point.",
      "Accountability: Headcount taken.",
      "Communication: Supervisor updates responders."
    ],
    do_list: [
      "DO know muster point location",
      "DO evacuate immediately",
      "DO go directly to point",
      "DO use routes",
      "DO help others",
      "DO account for team",
      "DO report missing",
      "DO wait for all-clear"
    ],
    dont_list: [
      "DON'T delay",
      "DON'T stop for items",
      "DON'T use elevators",
      "DON'T leave area",
      "DON'T re-enter",
      "DON'T spread rumors",
      "DON'T ignore instructions"
    ],
    incident_scenario: {
      what_happened: "Fire alarm. No muster point. Workers scattered. Responders searched building unnecessarily.",
      what_should_happen: "Go to muster point for headcount.",
      lesson: "Know muster point. Go there. Account for everyone."
    },
    discussion_questions: ["Where is muster point?", "Distance?", "Route?", "If missing?", "Why stay?"],
    site_checklist: ["Point designated", "Safe location", "Accessible", "Routes clear", "Workers know location", "Drills conducted"],
    one_minute_recap: "Know muster point. Evacuate immediately. Go there. Account for everyone. Wait for all-clear.",
    references: ["OSHA 1910.38", "NFPA 101", "NFPA 1"]
  },
  {
    title: "First Aid Basics",
    category_name: "Emergency Procedures",
    duration: 15,
    when_to_use: "For any workplace injury. Basic knowledge saves lives.",
    why_it_matters: "Quick first aid prevents complications and death. Delays can be fatal. Simple training is effective.",
    key_talking_points: [
      "Priorities: Call help, assess scene, check responsiveness.",
      "Bleeding: Direct pressure, elevate.",
      "CPR: If no pulse/breath.",
      "Injuries: Cuts, sprains, burns, eye injuries.",
      "Shock: Keep warm, elevate legs.",
      "Supplies: Know kit location."
    ],
    do_list: [
      "DO call 911 for serious",
      "DO assess safety",
      "DO check responsiveness",
      "DO apply pressure",
      "DO keep warm",
      "DO recovery position",
      "DO elevate limb",
      "DO know kit location"
    ],
    dont_list: [
      "DON'T move unless necessary",
      "DON'T remove objects",
      "DON'T tourniquet unless severe",
      "DON'T give food/drink",
      "DON'T leave alone",
      "DON'T delay 911"
    ],
    incident_scenario: {
      what_happened: "Severe cut. Coworker panicked, didn't call 911 or apply pressure. Shock ensued.",
      what_should_happen: "Call 911. Apply pressure immediately.",
      lesson: "Learn basics. Call 911. Control bleeding."
    },
    discussion_questions: ["Kit location?", "Heavy bleeding?", "Recovery position?", "When to call 911?", "Sprain treatment?", "Choking?"],
    site_checklist: ["Kit accessible", "Stocked", "Workers trained", "Numbers posted", "AED available", "Responders identified"],
    one_minute_recap: "Know kit location. Call 911. Apply pressure. Keep warm. Get trained.",
    references: ["Red Cross", "OSHA First Aid", "CDC"]
  },
  {
    title: "CPR Awareness",
    category_name: "Emergency Procedures",
    duration: 15,
    when_to_use: "Regularly (Quarterly). Vital for all staff, regardless of role.",
    why_it_matters: "Cardiac arrest can happen anywhere, anytime. Immediate CPR can double or triple a person's chance of survival. Waiting for an ambulance without acting often leads to death. You are the first responder.",
    key_talking_points: [
      "Check Safety: Ensure scene is safe first.",
      "Check Responsiveness: 'Are you okay?' Tap shoulders.",
      "Call 911: Designate someone specifically ('You, call 911').",
      "Get AED: Send someone to get it immediately.",
      "Compressions: Center of chest, push hard and fast (100-120 bpm).",
      "Hands-Only: Rescue breaths are optional for untrained rescuers.",
      "Depth: At least 2 inches deep.",
      "Continuity: Don't stop until help arrives or AED analyzes."
    ],
    do_list: [
      "DO call 911 immediately if victim is unresponsive.",
      "DO push hard and fast in the center of the chest.",
      "DO use an AED as soon as it arrives.",
      "DO point to a specific person to call emergency services.",
      "DO check the scene for danger before approaching.",
      "DO allow the chest to recoil fully between compressions.",
      "DO swap compressors every 2 minutes if possible.",
      "DO keep calm and follow AED voice prompts.",
      "DO attend a certification course if available.",
      "DO know the location of the nearest AED."
    ],
    dont_list: [
      "DON'T hesitate to start compressions.",
      "DON'T worry about breaking ribs (life > ribs).",
      "DON'T leave the victim alone if possible.",
      "DON'T assume someone else called 911.",
      "DON'T stop compressions to check pulse repeatedly.",
      "DON'T use AED on a victim in a pool of water (move them).",
      "DON'T be afraid of the AED (it won't shock unless needed).",
      "DON'T give liquids to an unconscious person.",
      "DON'T move the victim unless in immediate danger.",
      "DON'T wait for permission to save a life."
    ],
    incident_scenario: {
      what_happened: "An employee collapsed in the breakroom. Coworkers stood by, unsure what to do, waiting for the supervisor. EMS arrived 12 minutes later, but the employee did not survive.",
      what_should_happen: "Someone should have immediately started Hands-Only CPR while another called 911. Early compressions circulate oxygen to the brain.",
      lesson: "Time is brain. Action beats perfection."
    },
    discussion_questions: [
      "Where is the nearest AED located?",
      "Who here is currently CPR certified?",
      "What is the song rhythm for compressions (e.g., Stayin' Alive)?",
      "Why are we sometimes afraid to act?",
      "How do you call 911 from a desk phone vs cell phone here?",
      "What barriers might stop you from performing CPR?",
      "Do we have a First Aid squad?",
      "When was the last time we checked the AED battery?"
    ],
    site_checklist: [
      "Is the AED present and visible?",
      "Is the AED battery indicator green/ok?",
      "Are AED pads within expiration date?",
      "Are emergency numbers posted clearly?",
      "Is the address of the site posted for 911 calls?",
      "Is there a list of CPR-trained staff?",
      "Is the First Aid kit stocked?",
      "Are aisles clear for EMS access?",
      "Is there a barrier mask available?",
      "Is solitary work minimized/monitored?",
      "Are 'Expected Response' drills conducted?",
      "Is training offered to staff?"
    ],
    one_minute_recap: "If someone collapses and isn't breathing, they need you. Call 911, get the AED, and start pushing hard and fast in the center of the chest. Don't be afraid of hurting them—you are their only hope. Hands-only CPR is simple and effective. You are the vital link in the chain of survival.",
    references: ["American Heart Association", "Red Cross", "ILCOR Guidelines"]
  },
  {
    title: "Spill Response",
    category_name: "Emergency Procedures",
    duration: 10,
    when_to_use: "Workplaces with chemicals, oils, or fuels. Before handling liquids or after a near-miss spill.",
    why_it_matters: "Spills create immediate slip hazards, fire risks, and environmental violations. A slow response can turn a liter spill into a major environmental incident involving storm drains and huge fines. Swift containment is key.",
    key_talking_points: [
      "Safety First: Identify substance and wear PPE.",
      "Stop the Source: Turn off valve, upright container.",
      "Contain: Use socks/booms to encircle spill.",
      "Protect Drains: Block storm drains immediately.",
      "Notify: Alert supervisor and HSE lead.",
      "Clean Up: Use pads/absorbents (working outside-in).",
      "Dispose: Use proper hazardous waste bags.",
      "Restock: Replace used spill kit items immediately."
    ],
    do_list: [
      "DO know where the nearest spill kit is.",
      "DO wear appropriate PPE (gloves, glasses) before acting.",
      "DO check the SDS if the substance is unknown.",
      "DO block drains/manholes as a priority.",
      "DO warn others to stay back (barricade).",
      "DO ventilate the area if fumes are present.",
      "DO use 'snakes' or 'booms' to stop spread.",
      "DO report the spill size and type.",
      "DO wash hands thoroughly after cleanup.",
      "DO treat all unknown spills as hazardous."
    ],
    dont_list: [
      "DON'T step into the spill.",
      "DON'T wash spills into drains or sinks.",
      "DON'T touch unknown chemicals with bare hands.",
      "DON'T try to clean up spills larger than your kit allows.",
      "DON'T use water on chemical spills (reaction risk).",
      "DON'T hide a spill to avoid trouble.",
      "DON'T use standard trash bins for hazmat waste.",
      "DON'T leave a spill unattended.",
      "DON'T ignore a leaking container.",
      "DON'T assume someone else will clean it."
    ],
    incident_scenario: {
      what_happened: "A drum of hydraulic oil was punctured by a forklift. The driver went to find a mop. In the meantime, the oil flowed into a storm drain, reaching a local creek. The company faced a $50,000 fine.",
      what_should_happen: "The driver should have immediately deployed the spill kit boom to block the drain, then called for help.",
      lesson: "Containment is more urgent than cleanup. Save the drain first."
    },
    discussion_questions: [
      "Where is our nearest spill kit?",
      "Who has actually opened a spill kit before?",
      "What do we do if a spill reaches a drain?",
      "How do we dispose of oily rags here?",
      "What are the most common fluids we might spill?",
      "Who do we call for a large (uncontainable) spill?",
      "Do we have the right PPE for our chemicals?",
      "What was the last spill we had and how did it go?"
    ],
    site_checklist: [
      "Is the spill kit fully stocked?",
      "Is the spill kit seal intact?",
      "Are drain covers available nearby?",
      "Is PPE (gloves/goggles) accessible?",
      "Are SDS sheets current and available?",
      "Is emergency contact info posted?",
      "Are waste disposal bags available?",
      "Are drums/containers labeled?",
      "Is secondary containment (pallets) used?",
      "Is the area free of trip hazards?",
      "Are fire extinguishers nearby?",
      "Is ventilation adequate?"
    ],
    one_minute_recap: "If you spill it, you own it. Response speed is everything. 1. Protect yourself (PPE). 2. Stop the source. 3. Protect the drains. 4. Contain and clean. Never wash a chemical spill down a drain. If it's too big for you to handle, evacuate and call for help immediately. Restock the kit when done.",
    references: ["EPA: Spill Prevention", "OSHA 1910.120", "Internal Spill Plan"]
  },
  {
    title: "Office Ergonomics",
    category_name: "Ergonomics",
    duration: 15,
    when_to_use: "Applicable during new employee orientation, after office reconfigurations, or when employees report discomfort. Best used quarterly as a refresher for office-based staff.",
    why_it_matters: "Musculoskeletal Disorders (MSDs) account for a significant portion of workplace injuries and lost time. Poor ergonomics can lead to chronic back pain, carpal tunnel syndrome, and eye strain, reducing productivity and quality of life.\n\nBy proactively adjusting workstations, we can prevent these long-term injuries. Small adjustments to chair height, monitor position, and posture can make a massive difference in daily comfort and long-term health.",
    key_talking_points: [
      "Neutral Posture: Keep body aligned and balanced.",
      "Chair Setup: Feet flat on floor, knees at 90 degrees.",
      "Monitor Height: Top of screen at or slightly below eye level.",
      "Keyboard/Mouse: Elbows close to body, wrists straight.",
      "Lighting: Reduce glare, use task lighting if needed.",
      "20-20-20 Rule: Every 20 mins, look 20 feet away for 20 seconds.",
      "Movement: Change position frequently.",
      "Phone Use: Avoid cradling phone between ear and shoulder."
    ],
    do_list: [
      "DO adjust your chair height so feet are flat on the floor.",
      "DO position your monitor an arm's length away.",
      "DO keep your mouse and keyboard close to avoid reaching.",
      "DO use a headset if you talk on the phone frequently.",
      "DO take micro-breaks to stretch every hour.",
      "DO keep frequently used items within the primary reach zone.",
      "DO report any persistent discomfort to your supervisor.",
      "DO adjust blinds to control screen glare.",
      "DO use a footrest if your feet dangle.",
      "DO stand up during phone calls to increase blood flow."
    ],
    dont_list: [
      "DON'T slouch or lean forward toward the screen.",
      "DON'T dangle your feet; support them.",
      "DON'T cradle the phone between your neck and shoulder.",
      "DON'T pound the keyboard; type lightly.",
      "DON'T sit for more than 60 minutes without moving.",
      "DON'T ignore early signs of pain or tingling.",
      "DON'T place the monitor off to the side (keep it centered).",
      "DON'T cross your legs for extended periods.",
      "DON'T stare at the screen without blinking.",
      "DON'T work in dim or flickering light."
    ],
    incident_scenario: {
      what_happened: "An administrative assistant ignored wrist pain for months while typing extensively. It developed into severe Carpal Tunnel Syndrome requiring surgery and 6 weeks off work.",
      what_should_happen: "She should have reported the early discomfort. An ergonomic assessment would have identified her keyboard was too high and she wasn't using a wrist rest.",
      lesson: "Early intervention and proper setup prevent permanent injury."
    },
    discussion_questions: [
      "Who here has adjusted their chair in the last month?",
      "Does anyone experience eye strain by the end of the day?",
      "What is one small change you can make to your desk today?",
      "How often do you actually take breaks from sitting?",
      "Do you know how to request an ergonomic assessment?",
      "Why is 'toughing it out' a bad strategy for ergonomic pain?",
      "How does lighting affect your work comfort?",
      "What challenges do you face with your current setup?"
    ],
    site_checklist: [
      "Chair height adjusted correctly?",
      "Lumbar support positioned at lower back?",
      "Feet flat on floor or footrest?",
      "Knees at 90-degree angle?",
      "Monitor at arm's length?",
      "Top of screen at eye level?",
      "Screen free from glare?",
      "Keyboard/mouse at elbow height?",
      "Wrists straight while typing?",
      "Shoulders relaxed, not hunched?",
      "Headset available for phone users?",
      "Under-desk area clear for legs?"
    ],
    one_minute_recap: "Office safety starts with your setup. Ensure your chair supports your back and allows feet to rest flat. Keep your monitor at eye level to save your neck, and keep your keyboard close to save your shoulders. Most importantly, listen to your body—discomfort is a warning sign. Move often and adjust early.",
    references: ["OSHA eTools: Computer Workstations", "ISO 9241: Ergonomics of Human-System Interaction", "Mayo Clinic: Office Ergonomics"]
  },
  {
    title: "Micro-Breaks",
    category_name: "Ergonomics",
    duration: 5,
    when_to_use: "Use when the team is facing long periods of stationary work, during intensive coding/drafting sessions, or in long meetings.",
    why_it_matters: "Prolonged static posture restricts blood flow and fatigues muscles. Micro-breaks reset the body, restore circulation, and improve mental focus. They are the simplest, most effective tool against fatigue.",
    key_talking_points: [
      "Definition: Short pauses (30s to 2 mins) taken frequently.",
      "Frequency: Aim for every 30-60 minutes.",
      "Benefit: Resets posture and reduces muscle tension.",
      "Action: Stand up, stretch, look away from screens.",
      "Eye Health: Reduces digital eye strain.",
      "Mental Clarity: Provides a brief mental reset.",
      "Circulation: Prevents blood pooling in legs.",
      "Hydration: Good opportunity to drink water."
    ],
    do_list: [
      "DO stand up and stretch every hour.",
      "DO look at a distant object for 20 seconds.",
      "DO roll your shoulders back and down.",
      "DO shake out your hands and wrists.",
      "DO take a deep breath to reset focus.",
      "DO walk to the printer or water cooler.",
      "DO stretch your neck gently side to side.",
      "DO blink deliberately to moisten eyes.",
      "DO set a timer to remind yourself to move.",
      "DO encourage colleagues to take breaks too."
    ],
    dont_list: [
      "DON'T stay seated for 3+ hours straight.",
      "DON'T use breaks just to look at your phone.",
      "DON'T skip breaks when you are busy.",
      "DON'T eat lunch at your desk every day.",
      "DON'T ignore stiffness or numbness.",
      "DON'T think of breaks as 'wasting time'.",
      "DON'T sit in a frozen posture while thinking.",
      "DON'T forget to hydrate.",
      "DON'T assume you are too young for RSI.",
      "DON'T hunch over your phone during breaks."
    ],
    incident_scenario: {
      what_happened: "A truck driver drove 6 hours without stopping to meet a deadline. Upon exiting the cab, his leg gave way due to numbness (sciatica), causing him to fall and fracture his wrist.",
      what_should_happen: "He should have stopped for a 5-minute stretch break every 2 hours as per policy.",
      lesson: "Static posture creates physical liability. Movement is mandatory for safety."
    },
    discussion_questions: [
      "How often do you find yourself sitting for more than 2 hours?",
      "What stops you from taking micro-breaks?",
      "Do you feel guilty taking a minute to stretch?",
      "What is your favorite quick stretch?",
      "How does your body feel at 3 PM vs 9 AM?",
      "Can we normalize standing during meetings?",
      "Do you use any apps to remind you to move?",
      "How can we support each other in staying active?"
    ],
    site_checklist: [
      "Are employees observed taking short breaks?",
      "Is there space to stand/stretch safely?",
      "Is hydration accessible?",
      "Are 'standing meetings' encouraged?",
      "Is break culture positive?",
      "Are ergonomic reminders posted?",
      "Do drivers have scheduled stops?",
      "Are eye-strain reduction tools used?",
      "Is workload managed to allow pauses?",
      "Are managers modeling the behavior?",
      "Is there a designated break area?",
      "Are stretch charts available?"
    ],
    one_minute_recap: "You don't need to stop working for 15 minutes to get a benefit. A 'Micro-Break' is just 30 to 60 seconds of movement. Stand up, stretch your arms, look out a window, or roll your neck. These tiny investments of time prevent stiffness, reduce eye strain, and keep your blood flowing. Your body is designed to move—don't keep it frozen.",
    references: ["Cornell University Ergonomics Web", "CDC: Workplace Health Promotion", "National Safety Council"]
  },
  {
    title: "Driving Ergonomics",
    category_name: "Ergonomics",
    duration: 10,
    when_to_use: "Before long-haul drives, for fleet drivers, or when assigning new company vehicles.",
    why_it_matters: "Driving is a complex task requiring focus and physical stamina. Poor seating position leads to fatigue, slower reaction times, and chronic back pain. A properly adjusted cabin is a primary safety feature.",
    key_talking_points: [
      "Seat Distance: Knees slightly bent when pedals fully depressed.",
      "Seat Height: Clear view of road, 3 inches headroom.",
      "Backrest: Reclined slightly (100-110 degrees), not vertical.",
      "Lumbar: Support the curve of the lower back.",
      "Steering Wheel: 10 inches from chest, airbag aimed at chest not face.",
      "Hand Position: 9 and 3 o'clock or 8 and 4.",
      "Mirrors: Adjusted to minimize blind spots without leaning.",
      "Wallet: Remove from back pocket to prevent spinal tilt."
    ],
    do_list: [
      "DO remove your wallet from your back pocket before driving.",
      "DO adjust mirrors AFTER adjusting your seat.",
      "DO keep hands at 9 and 3 o'clock position.",
      "DO take a break every 2 hours of driving.",
      "DO adjust the headrest so the middle aligns with ears.",
      "DO ensure you can reach pedals without stretching.",
      "DO use cruise control (when safe) to rest legs.",
      "DO keep the cabin clean and loose-item free.",
      "DO adjust the steering wheel tilt and telescope.",
      "DO check tire pressure (affects ride comfort)."
    ],
    dont_list: [
      "DON'T recline the seat like a lounge chair.",
      "DON'T sit closer than 10 inches to the steering wheel.",
      "DON'T grip the wheel tightly (white knuckles).",
      "DON'T drive with one hand at 12 o'clock.",
      "DON'T slouch or lean heavily on the center console.",
      "DON'T ignore mirror adjustments in a shared vehicle.",
      "DON'T keep heavy items on the passenger seat.",
      "DON'T drive if you are fatigued.",
      "DON'T wear bulky coats that restrict movement.",
      "DON'T ignore seatbelt fit (across shoulder, not neck)."
    ],
    incident_scenario: {
      what_happened: "A fleet driver experienced a sudden back spasm while merging on a highway, causing him to swerve. He had been driving for 4 hours with his wallet in his back pocket and the seat too far back.",
      what_should_happen: "He should have removed his wallet and adjusted the seat to support his spine.",
      lesson: "Cabin ergonomics directly impact vehicle control and safety."
    },
    discussion_questions: [
      "Who here drives a company vehicle shared with others?",
      "Do you adjust the seat every single time you get in?",
      "Why is the 'wallet in back pocket' habit dangerous?",
      "What is your preferred hand position on the wheel?",
      "Have you ever felt numb after a long drive?",
      "How often do you stop to stretch on long trips?",
      "Does anyone experience neck pain while driving?",
      "How does seat height affect your visibility?"
    ],
    site_checklist: [
      "Are seat controls functioning?",
      "Are mirrors clean and adjustable?",
      "Is the steering wheel adjustable?",
      "Are lumbar supports available/working?",
      "Are floor mats secured (not interfering with pedals)?",
      "Is the headrest present and adjustable?",
      "Are seatbelts fully functional?",
      "Is the dashboard free of clutter?",
      "Are break schedules enforced for drivers?",
      "Is cabin lighting adequate?",
      "Are pedals slip-resistant?",
      "Is there a spot for water/supplies?"
    ],
    one_minute_recap: "Your vehicle is your office. Treat it that way. Before you turn the key, take 30 seconds to fit the car to you. Remove your wallet, set your seat so your knees are bent, and ensure your mirrors frame the road, not your car. A comfortable driver is an alert driver. Don't just drive—drive comfortably.",
    references: ["NHTSA: Motor Vehicle Safety", "AAA: Car Fit for Older Drivers", "Canadian Centre for OHS: Driving Ergonomics"]
  },
  {
    title: "Stress at Work",
    category_name: "Mental Health & Wellness",
    duration: 10,
    when_to_use: "During high-workload periods, after incident investigations, or during Mental Health Awareness month.",
    why_it_matters: "Chronic stress isn't just a feeling; it's a safety hazard. Distracted, anxious, or burnt-out workers make errors, skip steps, and have slower reaction times. Managing stress is managing safety.",
    key_talking_points: [
      "Recognition: Know signs like irritability, fatigue, lack of focus.",
      "Communication: Talk to supervisors about workload.",
      "Prioritization: Tackle high-risk tasks when most alert.",
      "Control: Focus on what you can control, let go of what you can't.",
      "Breaks: Mental resets prevent tunnel vision.",
      "Connection: Social support buffers stress.",
      "Resources: EAP (Employee Assistance Programs) are confidential.",
      "Self-Care: Sleep, diet, and exercise are foundations."
    ],
    do_list: [
      "DO speak up if deadlines are unrealistic.",
      "DO take your assigned breaks away from the workstation.",
      "DO prioritize tasks: Safety first, production second.",
      "DO practice deep breathing when overwhelmed.",
      "DO check in on colleagues who seem withdrawn.",
      "DO use the Employee Assistance Program (EAP).",
      "DO get adequate sleep (7-8 hours).",
      "DO disconnect from work emails after hours.",
      "DO ask for help or clarification on tasks.",
      "DO celebrate small wins."
    ],
    dont_list: [
      "DON'T bottle up frustration until you explode.",
      "DON'T skip safety steps to 'save time'.",
      "DON'T rely on alcohol or substances to cope.",
      "DON'T isolate yourself from the team.",
      "DON'T bring work conflict home.",
      "DON'T ignore physical signs (headaches, shaking).",
      "DON'T assume asking for help is a weakness.",
      "DON'T work through lunch habitually.",
      "DON'T engage in gossip (increases toxicity).",
      "DON'T excessively consume caffeine."
    ],
    incident_scenario: {
      what_happened: "An experienced technician, going through a divorce and working overtime, forgot to lockout a machine before servicing. He was narrowly missed by a moving arm.",
      what_should_happen: "He should have alerted his supervisor he was distracted. The supervisor should have recognized the fatigue and reassigned safety-critical tasks.",
      lesson: "Mental state determines physical safety. It is okay to say 'I am not 100% today'."
    },
    discussion_questions: [
      "What are common stressors we face in this team?",
      "How does stress affect your decision making?",
      "Do you feel comfortable telling us if you are overwhelmed?",
      "What is one way we can reduce unnecessary stress here?",
      "How do you decompress after a hard shift?",
      "Do you know how to access the EAP?",
      "What does 'burnout' look like to you?",
      "How can we support each other better?"
    ],
    site_checklist: [
      "Are workloads distributed fairly?",
      "Is the EAP contact info posted visibly?",
      "Are break times enforced?",
      "Is there a quiet place to decompress?",
      "Are deadlines realistic?",
      "Is overtime monitored and capped?",
      "Are supervisors trained in mental health?",
      "Is there a zero-tolerance policy for bullying?",
      "Are 'check-ins' part of meetings?",
      "Is feedback encouraged?",
      "Are social events organized?",
      "Is shift rotation managed to reduce fatigue?"
    ],
    one_minute_recap: "Stress affects your focus, and a loss of focus can lead to accidents. It is not 'soft' to talk about mental health; it is essential for a safe job site. If you are overwhelmed, speak up. Prioritize your tasks, take your breaks, and look out for your teammates. We want you healthy, both mentally and physically.",
    references: ["NIOSH: Stress at Work", "Mental Health First Aid", "American Psychological Association"]
  },
  {
    title: "Fire Extinguisher Use",
    category_name: "Fire Safety",
    duration: 10,
    when_to_use: "Small fire response.",
    why_it_matters: "Stops small fires. PASS technique essential.",
    key_talking_points: [
      "Types: A, B, C, D, K.",
      "PASS: Pull, Aim, Squeeze, Sweep.",
      "Use: Small fire, trained, exit clear.",
      "NO Use: Large fire, smoke, no exit.",
      "Maintenance: Monthly check."
    ],
    do_list: [
      "DO know locations",
      "DO know type",
      "DO know PASS",
      "DO keep exit clear",
      "DO call 911",
      "DO evacuate if spreading"
    ],
    dont_list: [
      "DON'T use large fire",
      "DON'T turn back",
      "DON'T use wrong type",
      "DON'T delay 911",
      "DON'T ignore spread"
    ],
    incident_scenario: {
      what_happened: "Worker aimed at flames (not base). Fire spread. Panicked.",
      what_should_happen: "Use PASS (Aim base). Evacuate if fail.",
      lesson: "Know PASS. Aim base. Evacuate."
    },
    discussion_questions: ["Locations?", "Type?", "PASS?", "When/When not?", "Spread?"],
    site_checklist: ["Available", "Labeled", "Inspected", "Training", "PASS posted", "Exits clear"],
    one_minute_recap: "Stop small fires. PASS: Pull, Aim, Squeeze, Sweep. Only small fires w/ exit. Evacuate if spreading.",
    references: ["OSHA", "NFPA 10", "NFPA 101"]
  },
  {
    title: "Hot Work Permits",
    category_name: "Fire Safety",
    duration: 15,
    when_to_use: "Welding/Cutting/Grinding.",
    why_it_matters: "Prevents fires. Mandatory precaution.",
    key_talking_points: [
      "Definition: Auth for hot work.",
      "Requirements: Fire watch, precautions.",
      "Process: Request, identify, watch, approve.",
      "Precautions: Remove combustibles (35ft), extinguishers.",
      "Fire Watch: During + 30 mins after."
    ],
    do_list: [
      "DO obtain permit",
      "DO complete form",
      "DO remove combustibles",
      "DO fire watch",
      "DO have extinguisher",
      "DO post permit",
      "DO maintain watch"
    ],
    dont_list: [
      "DON'T work w/o permit",
      "DON'T skip precautions",
      "DON'T no watch",
      "DON'T leave unattended",
      "DON'T ignore combustibles"
    ],
    incident_scenario: {
      what_happened: "Welding w/o permit/watch. Sparks ignited boxes. Fire.",
      what_should_happen: "Permit. Remove combustibles. Fire watch.",
      lesson: "Permits mandatory. Follow precautions."
    },
    discussion_questions: ["What is it?", "When required?", "Fire watch role?", "Duration?", "Precautions?"],
    site_checklist: ["System in place", "Forms", "Authorized personnel", "Training", "Extinguishers", "Permits posted"],
    one_minute_recap: "Permit required. Remove combustibles. Fire watch +30 mins. Prevent fires.",
    references: ["OSHA 1910.252", "NFPA 51B", "AWS Z49.1"]
  },
  {
    title: "Electrical Fires",
    category_name: "Fire Safety",
    duration: 10,
    when_to_use: "All workplaces.",
    why_it_matters: "Dangerous/common. Spread fast. Shock risk.",
    key_talking_points: [
      "Causes: Overload, cords, faulty equipment.",
      "Prevention: Don't overload, inspect, GFCI.",
      "Signs: Smell, sparks, heat.",
      "Response: NO WATER. Class C. Power off. Evacuate.",
      "Equipment: Class C/CO2. Maintain."
    ],
    do_list: [
      "DO inspect",
      "DO replace damaged",
      "DO Class C ext",
      "DO power off",
      "DO GFCI",
      "DO keep dry",
      "DO report"
    ],
    dont_list: [
      "DON'T overload",
      "DON'T damaged cords",
      "DON'T use water",
      "DON'T work live",
      "DON'T ignore signs"
    ],
    incident_scenario: {
      what_happened: "Overload fire. Water used -> electrocution.",
      what_should_happen: "No overload. Class C ext. Power off.",
      lesson: "Prevent overload. No water."
    },
    discussion_questions: ["Causes?", "Prevention?", "Extinguisher?", "Why no water?", "Signs?", "GFCI?"],
    site_checklist: ["Inspected", "No damage", "Class C", "GFCI", "No overloads", "Maintenance"],
    one_minute_recap: "Don't overload. Inspect. Class C ext. No water. Power off. Evacuate.",
    references: ["OSHA Electrical", "NFPA 70E", "NFPA 10"]
  },
  {
    title: "Lock Out Tag Out (LOTO) - Advanced",
    category_name: "Electrical Safety",
    duration: 20,
    when_to_use: "Maintenance/Service w/ energy.",
    why_it_matters: "Prevents unexpected startup/injury. Complex scenarios.",
    key_talking_points: [
      "Complex Sources: Elec, pneu, hyd, etc.",
      "Group Lockout: Master + individual.",
      "Personnel: Authorized/Competent.",
      "Verification: Test isolation. Dissipate.",
      "Emergency: Removal protocol.",
      "Combinations: LOTO + Confined Space."
    ],
    do_list: [
      "DO ID all sources",
      "DO isolate",
      "DO lock all",
      "DO verify",
      "DO tag",
      "DO dissipate",
      "DO group lockout"
    ],
    dont_list: [
      "DON'T skip ID",
      "DON'T skip verify",
      "DON'T remove others'",
      "DON'T tag only",
      "DON'T leave unattended"
    ],
    incident_scenario: {
      what_happened: "Missed pneumatic lockout. Crushed worker.",
      what_should_happen: "ID ALL sources. Lockout. Verify.",
      lesson: "ID all sources. Verify. Don't miss any."
    },
    discussion_questions: ["Energy types?", "ID sources?", "Lock/Tag diff?", "Verify?", "Group lockout?", "Emergency?"],
    site_checklist: ["Sources ID", "Devices", "Tags", "Training", "Verification", "Group/Emergency procedures"],
    one_minute_recap: "ID all sources. Lock/Tag. Verify isolation. Group lockout. Dissipate. Document.",
    references: ["OSHA 1910.147", "ANSI Z535.4", "NFPA 70E"]
  },
  {
    title: "Extension Cord Safety",
    category_name: "Electrical Safety",
    duration: 10,
    when_to_use: "Using temporary power.",
    why_it_matters: "Misuse causes shock/fire. Proper use prevents injury.",
    key_talking_points: [
      "Selection: Gauge, Amp, Volt, Indoor/Outdoor.",
      "Use: Temporary. Uncoil. No kinks. No daisy-chain.",
      "Hazards: Overheat, trip, damage, water.",
      "Inspection: Check cuts/plug.",
      "Practices: Protect, GFCI wet areas."
    ],
    do_list: [
      "DO inspect",
      "DO proper gauge",
      "DO uncoil",
      "DO GFCI wet",
      "DO keep dry",
      "DO protect",
      "DO temporary only"
    ],
    dont_list: [
      "DON'T damaged",
      "DON'T tape",
      "DON'T undersized",
      "DON'T overload",
      "DON'T daisy-chain",
      "DON'T coiled"
    ],
    incident_scenario: {
      what_happened: "Damaged/wet cord. Electrocution.",
      what_should_happen: "Inspect. Replace. GFCI. Dry.",
      lesson: "Inspect. Replace. GFCI."
    },
    discussion_questions: ["Indoor/Outdoor?", "Gauge?", "Daisy-chain?", "Uncoil?", "GFCI?", "Overload?"],
    site_checklist: ["Inspected", "No damage", "Gauge", "GFCI", "Protected", "Not overloaded"],
    one_minute_recap: "Temporary. Inspect. Proper gauge. Uncoil. GFCI wet. No daisy-chain.",
    references: ["OSHA Electrical", "NFPA 70", "UL"]
  },
  {
    title: "GFCI Protection",
    category_name: "Electrical Safety",
    duration: 10,
    when_to_use: "Wet/hazard areas.",
    why_it_matters: "Prevents shock. Cuts power fast.",
    key_talking_points: [
      "Function: Detects fault, cuts power.",
      "Types: Outlet, Portable, Breaker.",
      "Locations: Wet areas.",
      "Testing: Monthly.",
      "Portable: Use w/ tools.",
      "Limits: Not substitute for safe practice."
    ],
    do_list: [
      "DO test monthly",
      "DO use wet",
      "DO portable",
      "DO replace faulty",
      "DO inspect",
      "DO report"
    ],
    dont_list: [
      "DON'T skip test",
      "DON'T non-GFCI wet",
      "DON'T ignore",
      "DON'T assume work",
      "DON'T use damaged"
    ],
    incident_scenario: {
      what_happened: "Wet area tool no GFCI. Shock.",
      what_should_happen: "Use GFCI. Inspect.",
      lesson: "GFCI saves lives. Test monthly."
    },
    discussion_questions: ["Ground fault?", "How works?", "Install where?", "Test?", "Outlet/Portable?"],
    site_checklist: ["Wet areas", "Tested", "Records", "Faulty replaced", "Portable", "Training"],
    one_minute_recap: "Install wet. Test monthly. Replace faulty. Use portable. Saves lives.",
    references: ["OSHA", "NFPA 70", "UL"]
  },
  {
    title: "Understanding SDS",
    category_name: "Chemical Safety",
    duration: 15,
    when_to_use: "Handling hazmat.",
    why_it_matters: "Critical info prevents injury. Standard format.",
    key_talking_points: [
      "Def: Safety Data Sheet.",
      "Sections: 16 (Hazards, First Aid, PPE, etc).",
      "Symbols: Flammable, Toxic, etc.",
      "Health: Acute/Chronic.",
      "First Aid: Procedures.",
      "Storage: Compatibility.",
      "PPE: Required gear."
    ],
    do_list: [
      "DO read first",
      "DO understand",
      "DO know aid",
      "DO wear PPE",
      "DO store proper",
      "DO report"
    ],
    dont_list: [
      "DON'T handle w/o read",
      "DON'T assume",
      "DON'T skip aid",
      "DON'T no PPE",
      "DON'T store bad"
    ],
    incident_scenario: {
      what_happened: "No read SDS. Corrosive. Burns.",
      what_should_happen: "Read SDS. PPE (gloves).",
      lesson: "Read SDS. Wear PPE."
    },
    discussion_questions: ["Where SDS?", "Info?", "Symbols?", "First aid?", "PPE?", "Storage?"],
    site_checklist: ["Available", "Current", "Training", "Symbols known", "PPE", "Storage"],
    one_minute_recap: "Read before use. Know hazards/aid. Wear PPE. Store proper.",
    references: ["OSHA 1910.1200", "GHS"]
  },
  {
    title: "Labeling Containers",
    category_name: "Chemical Safety",
    duration: 10,
    when_to_use: "Storing/transporting hazmat.",
    why_it_matters: "ID contents/hazards. Prevent misuse.",
    key_talking_points: [
      "Reqs: Name, symbols, warnings.",
      "Content: Product, pictograms, signal words.",
      "Secondary: Label if stored.",
      "Missing: Report, don't use.",
      "Org: By hazard."
    ],
    do_list: [
      "DO label all",
      "DO visible",
      "DO update",
      "DO report missing",
      "DO label secondary",
      "DO train"
    ],
    dont_list: [
      "DON'T use unlabeled",
      "DON'T deface",
      "DON'T assume",
      "DON'T store w/o label",
      "DON'T mix"
    ],
    incident_scenario: {
      what_happened: "Unlabeled container poured. Toxic reaction.",
      what_should_happen: "Report missing. ID first.",
      lesson: "Never use unlabeled. Report."
    },
    discussion_questions: ["Label info?", "Symbols?", "Missing?", "Secondary?", "Importance?"],
    site_checklist: ["Labeled", "Visible", "Secondary", "Missing reported", "Training"],
    one_minute_recap: "Label name/hazards. Keep visible. Report missing. Don't use unlabeled.",
    references: ["OSHA 1910.1200", "GHS", "EPA"]
  },
  {
    title: "H2S Awareness",
    category_name: "Chemical Safety",
    duration: 15,
    when_to_use: "H2S risk areas.",
    why_it_matters: "Deadly, odorless (high conc). Detectors critical.",
    key_talking_points: [
      "H2S: Deadly, heavier air, flam.",
      "Sources: Oil/gas, sewer.",
      "Effects: Irritation -> Death. Olfactory paralysis.",
      "Detection: Electronic only.",
      "PPE: Respirator.",
      "Emergency: Evacuate. Trained rescue."
    ],
    do_list: [
      "DO know sources",
      "DO use detector",
      "DO respirator",
      "DO monitor",
      "DO evacuate",
      "DO escape pack"
    ],
    dont_list: [
      "DON'T enter w/o gear",
      "DON'T trust nose",
      "DON'T ignore detector",
      "DON'T delay",
      "DON'T rescue untrained"
    ],
    incident_scenario: {
      what_happened: "Confined space H2S. No smell. Death + rescuer death.",
      what_should_happen: "Detector. Monitor. Respirator. Trained rescue.",
      lesson: "Detectors/PPE mandatory. Don't trust nose."
    },
    discussion_questions: ["What is H2S?", "Sources?", "Effects?", "Smell?", "Paralysis?", "Equip?"],
    site_checklist: ["Sources ID", "Detectors", "Monitoring", "Respirators", "Escape", "Rescue"],
    one_minute_recap: "Deadly. Know sources. Use detectors. Wear respirator. Don't trust nose. Evacuate.",
    references: ["OSHA H2S", "API", "NFPA"]
  },
  {
    title: "Check In On Your Mate",
    category_name: "Mental Health & Wellness",
    duration: 10,
    when_to_use: "All workplaces.",
    why_it_matters: "Peer support/early detect. Culture.",
    key_talking_points: [
      "Support: Detect early.",
      "Signs: Mood, withdrawal, performance.",
      "How: Ask, listen, support.",
      "Topics: Mental health, substances.",
      "Crisis: Suicide signs. Act.",
      "Culture: Normalize."
    ],
    do_list: [
      "DO check in",
      "DO ask",
      "DO listen",
      "DO suggest help",
      "DO respect",
      "DO support"
    ],
    dont_list: [
      "DON'T ignore",
      "DON'T judge",
      "DON'T pressure",
      "DON'T therapist",
      "DON'T share"
    ],
    incident_scenario: {
      what_happened: "Withdrawn mate. Ignored. Crisis. Friend asked -> Recovery.",
      what_should_happen: "Check in. Support.",
      lesson: "Check in. Listen. Support."
    },
    discussion_questions: ["Signs?", "What say?", "Listening?", "Resources?", "Suicide?", "Culture?"],
    site_checklist: ["Peer support", "Resources", "EAP", "Training", "Culture"],
    one_minute_recap: "Check in. Ask/Listen. Suggest resources. Support culture. Save lives.",
    references: ["SAMHSA", "NAMI", "CDC"]
  },
  {
    title: "Line of Fire",
    category_name: "Workplace Hazards",
    duration: 10,
    when_to_use: "Moving objects/energy.",
    why_it_matters: "Injury path. Awareness prevents.",
    key_talking_points: [
      "Def: Path of energy.",
      "Hazards: Falling, debris, pressure.",
      "Falling: Secure, hard hat.",
      "Debris: Guards, PPE.",
      "Pressure: Whip check.",
      "Prevention: Position, guard, PPE."
    ],
    do_list: [
      "DO ID hazard",
      "DO stay out",
      "DO secure",
      "DO guard",
      "DO PPE",
      "DO inspect"
    ],
    dont_list: [
      "DON'T stand under",
      "DON'T unguarded",
      "DON'T ignore stack",
      "DON'T skip PPE"
    ],
    incident_scenario: {
      what_happened: "Under ladder. Tool fell. Injury.",
      what_should_happen: "Don't stand under. PPE.",
      lesson: "Stay out of line. PPE."
    },
    discussion_questions: ["What is it?", "Hazards?", "Recognize?", "Prevention?", "PPE?"],
    site_checklist: ["Hazards ID", "Secured", "Guards", "Barriers", "PPE", "Training"],
    one_minute_recap: "ID hazard. Stay out. Secure/Guard. PPE. Prevent injury.",
    references: ["OSHA", "NFPA", "ANSI"]
  },
  {
    title: "Pressure Vessel Safety",
    category_name: "Workplace Hazards",
    duration: 15,
    when_to_use: "Working with boilers/tanks/cylinders.",
    why_it_matters: "Failure = Explosion. Energy release catastrophic. Maintenance key.",
    key_talking_points: [
      "Pressure: Stored energy.",
      "Relief: Critical device. Test.",
      "Inspection: Corrosion, cracks, leaks.",
      "Ops: Limits (P/T). Monitor.",
      "Corrosion: Weakens wall.",
      "Response: Leak/rupture -> Evacuate."
    ],
    do_list: [
      "DO know limits",
      "DO monitor",
      "DO inspect",
      "DO test relief",
      "DO follow ops",
      "DO evacuate fail"
    ],
    dont_list: [
      "DON'T exceed limit",
      "DON'T bypass safety",
      "DON'T operate bad",
      "DON'T ignore corrosion",
      "DON'T repair unauthorized"
    ],
    incident_scenario: {
      what_happened: "Stuck relief valve. Pressure rose. Boiler exploded.",
      what_should_happen: "Report stuck valve. Monitor pressure. Shut down.",
      lesson: "Maintain/Monitor. Don't ignore safety."
    },
    discussion_questions: ["Max pressure?", "Relief test?", "Leak?", "Monitor?", "Corrosion?"],
    site_checklist: ["Limits posted", "Gauges", "Relief valves", "No corrosion", "Logs", "Training"],
    one_minute_recap: "Stored energy. Know limits. Monitor. Maintain relief. Inspect. Evacuate fail.",
    references: ["ASME", "OSHA 1910.119", "OSHA 1910.268"]
  },

  // --- PHASE 2-3 (22-41) ---
  {
    title: "Hazard Communication",
    category_name: "Chemical Safety",
    duration: 15,
    when_to_use: "All workplaces with chemicals.",
    why_it_matters: "Right to know hazards. Prevents exposure/injury. Legal requirement.",
    key_talking_points: [
      "Standard: OSHA HazCom (Right-to-Know).",
      "Components: Labels, SDS, Training, Plan.",
      "Labels: ID, Warning, Pictogram.",
      "SDS: Detailed info (16 sections).",
      "Training: Must know hazards/protection.",
      "Inventory: List of all chemicals."
    ],
    do_list: [
      "DO read labels",
      "DO access SDS",
      "DO attend training",
      "DO ask questions",
      "DO use PPE",
      "DO know hazards",
      "DO label secondary",
      "DO report missing info"
    ],
    dont_list: [
      "DON'T ignore labels",
      "DON'T use unknown",
      "DON'T remove labels",
      "DON'T skip training",
      "DON'T guess hazards",
      "DON'T assume safety"
    ],
    incident_scenario: {
      what_happened: "Cleaner used new chemical w/o training. Mixed with bleach. Toxic gas. Hospitalized.",
      what_should_happen: "Training before use. Read label/SDS. Don't mix.",
      lesson: "Know hazards before use. Don't mix unknowns."
    },
    discussion_questions: ["What is HazCom?", "Where SDS?", "Label meanings?", "Training?", "New chemical procedure?"],
    site_checklist: ["Written plan", "Inventory", "SDS accessible", "Labels correct", "Training done"],
    one_minute_recap: "Right to know. Labels/SDS/Training. Read before use. Protect yourself.",
    references: ["OSHA 1910.1200", "GHS"]
  },
  {
    title: "Incident Reporting",
    category_name: "Safety Culture",
    duration: 10,
    when_to_use: "All incidents (injury, property, spill).",
    why_it_matters: "Reporting allows correction, prevents recurrence. Culture of honesty.",
    key_talking_points: [
      "Report: Immediately. All incidents.",
      "Why: Identify cause, fix hazard, medical care.",
      "Culture: No retaliation. Fact finding, not fault.",
      "Process: Notify supervisor, form, investigation.",
      "Outcome: Safer workplace."
    ],
    do_list: [
      "DO report immediately",
      "DO accurate details",
      "DO preserve scene",
      "DO witness statement",
      "DO cooperate invest",
      "DO suggest fix"
    ],
    dont_list: [
      "DON'T hide incident",
      "DON'T delay",
      "DON'T fear report",
      "DON'T alter scene",
      "DON'T guess facts"
    ],
    incident_scenario: {
      what_happened: "Minor cut ignored. Became infected. Lost time. Hazard remained.",
      what_should_happen: "Report cut. First aid. Fix hazard.",
      lesson: "Report all. Prevent worse outcome."
    },
    discussion_questions: ["When report?", "Why report?", "Process?", "Fear?", "Outcome?"],
    site_checklist: ["Policy", "Forms", "No retaliation", "Investigation", "Corrections"],
    one_minute_recap: "Report everything immediately. Fix hazards. No retaliation. Safer for all.",
    references: ["OSHA 1904", "National Safety Council"]
  },
  {
    title: "Near Miss Reporting",
    category_name: "Safety Culture",
    duration: 10,
    when_to_use: "Events that *could* have caused injury.",
    why_it_matters: "Free lesson. Warning sign. Fixing near miss prevents future accident.",
    key_talking_points: [
      "Def: Unplanned event, no injury/damage, potential for it.",
      "Pyramid: Many near misses -> 1 serious injury.",
      "Value: Proactive safety. Identify unseen hazards.",
      "Action: Report, analyze, fix.",
      "Culture: Celebrate reporting."
    ],
    do_list: [
      "DO recognize near miss",
      "DO report",
      "DO fix hazard",
      "DO share story",
      "DO encourage others",
      "DO treat as warning"
    ],
    dont_list: [
      "DON'T ignore",
      "DON'T think 'lucky'",
      "DON'T hide",
      "DON'T punish report",
      "DON'T dismiss"
    ],
    incident_scenario: {
      what_happened: "Tool fell, missed worker. Laughed off. Next day hit worker.",
      what_should_happen: "Report first drop. Install toe boards/tethers.",
      lesson: "Near miss is warning. Fix it before injury."
    },
    discussion_questions: ["What is near miss?", "Example?", "Why report?", "Barriers?", "Fixes?"],
    site_checklist: ["Reporting system", "Encouragement", "Analysis", "Sharing", "No blame"],
    one_minute_recap: "Near miss = warning. Report/Fix. Prevent future injury. Proactive safety.",
    references: ["NSC", "OSHA", "Safety Pyramid"]
  },
  {
    title: "Confined Space Entry",
    category_name: "Workplace Hazards",
    duration: 20,
    when_to_use: "Entering tanks, vessels, pits, sewers.",
    why_it_matters: "Deadly hazards (gas, oxygen, engulfment). Rescue difficult. Strict rules.",
    key_talking_points: [
      "Def: Limited entry, not for occupancy, hazard potential.",
      "Permit: Required for hazards (PRCS).",
      "Hazards: Atmosphere (O2, Tox, Flam), Engulfment, Config.",
      "Roles: Entrant, Attendant, Supervisor.",
      "Controls: Test air, ventilate, LOTO, rescue plan."
    ],
    do_list: [
      "DO obtain permit",
      "DO test air",
      "DO ventilate",
      "DO attendant present",
      "DO harness/lifeline",
      "DO communication",
      "DO rescue plan"
    ],
    dont_list: [
      "DON'T enter w/o permit",
      "DON'T enter w/o test",
      "DON'T leave attendant",
      "DON'T rescue unplanned",
      "DON'T ignore alarms"
    ],
    incident_scenario: {
      what_happened: "Entered tank w/o test. Low O2. Passed out. Attendant entered -> both died.",
      what_should_happen: "Test air. Ventilate. Attendant stays out/calls rescue.",
      lesson: "Strict procedures. Attendant stays out. Rescue plan."
    },
    discussion_questions: ["What is confined space?", "Hazards?", "Permit?", "Attendant role?", "Rescue?", "Air test?"],
    site_checklist: ["Spaces ID'd", "Permits", "Equipment (Air/Vent/Rescue)", "Training", "Team"],
    one_minute_recap: "Deadly. Permit required. Test air. Attendant required. Rescue plan. Don't rush in.",
    references: ["OSHA 1910.146", "ANSI Z117.1"]
  },
  {
    title: "Fall Protection",
    category_name: "Workplace Hazards",
    duration: 15,
    when_to_use: "Working at height (>6ft construction, >4ft general).",
    why_it_matters: "Falls are leading killer. Prevention 100% possible with gear/planning.",
    key_talking_points: [
      "Trigger Height: 4ft (Gen), 6ft (Const).",
      "Hierarchy: Eliminate, Guardrail, Restraint, Arrest.",
      "ABCD: Anchorage, Body Support (Harness), Connector, Descent/Rescue.",
      "Equipment: Inspect harness/lanyard. Proper fit.",
      "Anchor: 5000lbs support."
    ],
    do_list: [
      "DO wear harness",
      "DO inspect gear",
      "DO tie off",
      "DO use anchors",
      "DO verify clearance",
      "DO have rescue plan",
      "DO train"
    ],
    dont_list: [
      "DON'T work w/o protection",
      "DON'T use damaged gear",
      "DON'T tie to conduit",
      "DON'T disconnect at height",
      "DON'T ignore swing fall"
    ],
    incident_scenario: {
      what_happened: "Worker unhooked to move. Slipped. Fell 20ft. Fatal.",
      what_should_happen: "100% tie-off (Y-lanyard). Guardrails prefered.",
      lesson: "100% tie-off. Fall kills. Plan ahead."
    },
    discussion_questions: ["Trigger height?", "ABCD?", "Inspection?", "Anchor point?", "Rescue?", "Clearance?"],
    site_checklist: ["Plan", "Gear inspected", "Anchors ID", "Training", "Rescue plan", "100% tie-off"],
    one_minute_recap: "Falls kill. Wear harness. Inspect. Tie off to 5k anchor. Have rescue plan.",
    references: ["OSHA 1926.501", "ANSI Z359"]
  },
  {
    title: "Ladder Safety",
    category_name: "Workplace Hazards",
    duration: 10,
    when_to_use: "Using portable ladders.",
    why_it_matters: "Falls from ladders common. Improper use/setup main cause.",
    key_talking_points: [
      "Selection: Correct type/height/rating.",
      "Inspection: Rungs, rails, feet. No grease.",
      "Setup: 4:1 angle (extension). Stable ground. Secure top/bottom.",
      "Use: 3 points contact. Center body (Belt buckle). Don't overreach.",
      "Step: Fully open, lock spreaders. Not a leaning ladder."
    ],
    do_list: [
      "DO inspect",
      "DO 3 points contact",
      "DO face ladder",
      "DO secure",
      "DO 4:1 angle",
      "DO extend 3ft above",
      "DO stable footing"
    ],
    dont_list: [
      "DON'T use damaged",
      "DON'T overreach",
      "DON'T stand on top",
      "DON'T carry heavy loads",
      "DON'T move while on",
      "DON'T lean step ladder"
    ],
    incident_scenario: {
      what_happened: "Reached too far. Ladder tipped. Fall/broken leg.",
      what_should_happen: "Move ladder. Keep belt buckle in rails.",
      lesson: "Don't overreach. 3 points contact. Secure ladder."
    },
    discussion_questions: ["Inspection?", "Angle?", "3 points?", "Top step?", "Setup?", "Carrying?"],
    site_checklist: ["Ladders inspected", "Proper type", "Storage", "Training", "Usage monitored"],
    one_minute_recap: "Inspect. 4:1 angle. 3 points contact. Don't overreach. Don't stand on top.",
    references: ["OSHA 1926.1053", "ANSI A14"]
  },
  {
    title: "Scaffolding Safety",
    category_name: "Workplace Hazards",
    duration: 15,
    when_to_use: "Working on scaffolds.",
    why_it_matters: "Collapse/Falls. Complex assembly requires competence.",
    key_talking_points: [
      "Competent Person: Must supervise erect/dismantle.",
      "Inspection: Daily/before use. Tags (Green/Red/Yellow).",
      "Base: Mud sills, base plates, level.",
      "Planks: Full decking, cleated/overlap.",
      "Guardrails: Top/Mid/Toe. Fall protection if missing.",
      "Access: Ladder/Stair. No cross-braces."
    ],
    do_list: [
      "DO inspect tag",
      "DO use ladder access",
      "DO keep clear",
      "DO wear hard hat",
      "DO report defects",
      "DO lock wheels (mobile)",
      "DO use guardrails"
    ],
    dont_list: [
      "DON'T climb braces",
      "DON'T use red tag",
      "DON'T overload",
      "DON'T move while on (unless designed)",
      "DON'T remove parts",
      "DON'T work in storm"
    ],
    incident_scenario: {
      what_happened: "Worker climbed cross-braces. Board tipped (not cleated). Fall.",
      what_should_happen: "Use ladder. Inspect planks. Secure decking.",
      lesson: "Use access. Inspect. Don't climb braces."
    },
    discussion_questions: ["Competent person?", "Tags?", "Access?", "Planking?", "Guardrails?", "Base?"],
    site_checklist: ["Erected by CP", "Inspected/Tagged", "Guardrails", "Planking full", "Access proper", "Base stable"],
    one_minute_recap: "Check tag. Use ladder. Guardrails/Planking secure. Stable base. Report defects.",
    references: ["OSHA 1926.451"]
  },
  {
    title: "Personal Protective Equipment (PPE)",
    category_name: "Personal Protective Equipment (PPE)",
    duration: 15,
    when_to_use: "General PPE requirements.",
    why_it_matters: "Last line of defense. Reduces severity of injury.",
    key_talking_points: [
      "Hierarchy: Eng/Admin controls first. PPE last.",
      "Assessment: Determine hazards -> Select PPE.",
      "Selection: Correct for hazard/fit.",
      "Use: Wear properly.",
      "Maintenance: Clean, inspect, store.",
      "Limitations: Doesn't eliminate hazard."
    ],
    do_list: [
      "DO wear required PPE",
      "DO inspect",
      "DO fit check",
      "DO clean/store",
      "DO replace damaged",
      "DO ask if unsure",
      "DO know limits"
    ],
    dont_list: [
      "DON'T use damaged",
      "DON'T modify",
      "DON'T wear wrong size",
      "DON'T skip",
      "DON'T rely on alone"
    ],
    incident_scenario: {
      what_happened: "Grinding w/o face shield. Wheel shattered. Eye injury despite glasses.",
      what_should_happen: "Shield + Glasses for grinding. Assess hazard.",
      lesson: "Use correct PPE for task. Inspect gear."
    },
    discussion_questions: ["Hierarchy?", "When use?", "Inspection?", "Limitations?", "Storage?"],
    site_checklist: ["Assessment done", "PPE available", "Training", "Usage enforced", "Maintenance"],
    one_minute_recap: "Last defense. Wear it. Inspect it. Clean it. Replace it. Know why you wear it.",
    references: ["OSHA 1910.132"]
  },
  {
    title: "Respirator Use",
    category_name: "Personal Protective Equipment (PPE)",
    duration: 15,
    when_to_use: "Airborne hazards (dust, fume, vapor).",
    why_it_matters: "Lung damage often permanent. Improper use = No protection.",
    key_talking_points: [
      "Hazards: Dust (particulate), Vapor (chemical), O2 deficiency.",
      "Types: N95, Half-face, Full-face, SCBA.",
      "Requirements: Med Eval, Fit Test, Training.",
      "Seal: Clean shave req. Seal check every use.",
      "Cartridges: Select for hazard. Change schedule.",
      "Storage: Clean, sealed bag."
    ],
    do_list: [
      "DO med eval/fit test",
      "DO seal check",
      "DO clean shave",
      "DO correct cartridge",
      "DO clean/store",
      "DO replace filter",
      "DO inspect valves"
    ],
    dont_list: [
      "DON'T wear w/ beard",
      "DON'T use wrong filter",
      "DON'T share (unless cleaned)",
      "DON'T use damaged",
      "DON'T ignore smell/taste"
    ],
    incident_scenario: {
      what_happened: "Painting w/ dust mask. Inhaled solvents. Dizzy/sick.",
      what_should_happen: "Organic vapor respirator. Dust mask is for particles.",
      lesson: "Match respirator to hazard. Fit matters."
    },
    discussion_questions: ["Med eval?", "Fit test?", "Seal check?", "Beards?", "Cartridges?", "Storage?"],
    site_checklist: ["Program", "Fit testing", "Med evals", "Cartridges avail", "Cleaning/Storage", "No beards"],
    one_minute_recap: "Protect lungs. Med eval/Fit test req. Clean shave. Seal check. Right cartridge. Store clean.",
    references: ["OSHA 1910.134", "ANSI Z88.2"]
  },
  {
    title: "Hearing Protection",
    category_name: "Personal Protective Equipment (PPE)",
    duration: 10,
    when_to_use: "High noise areas (>85dB).",
    why_it_matters: "Hearing loss permanent/painless. Tinnitus. Preventable.",
    key_talking_points: [
      "Noise: Level (dB) + Duration. 85dB Action, 90dB PEL.",
      "Rule: If shout to be heard at 3ft -> Too loud.",
      "Types: Plugs (Insert), Muffs (Over ear).",
      "Fit: Roll/Pull/Hold (Plugs). Seal (Muffs).",
      "NRR: Noise Reduction Rating. Derating."
    ],
    do_list: [
      "DO wear in noise",
      "DO insert plugs proper",
      "DO check muff seal",
      "DO clean/replace",
      "DO combine if >100dB",
      "DO monitor hearing"
    ],
    dont_list: [
      "DON'T ignore noise",
      "DON'T half-insert",
      "DON'T use dirty",
      "DON'T modify",
      "DON'T remove in noise"
    ],
    incident_scenario: {
      what_happened: "Worker didn't wear plugs 'just for a minute'. Years later -> hearing loss/ringing.",
      what_should_happen: "Wear always in noise. Cumulative damage.",
      lesson: "Hearing loss permanent. Wear protection always."
    },
    discussion_questions: ["When required?", "How to fit plug?", "Muff seal?", "Symptoms?", "Tinnitus?"],
    site_checklist: ["Noise monitored", "PPE available", "Training", "Audiograms", "Signs posted"],
    one_minute_recap: "Noise kills hearing permanently. If shouting at 3ft, wear gear. Roll/Pull/Hold plugs. Check muff seal.",
    references: ["OSHA 1910.95", "NIOSH"]
  },
  {
    title: "Eye Protection",
    category_name: "Personal Protective Equipment (PPE)",
    duration: 10,
    when_to_use: "Flying particles, chemical, light hazards.",
    why_it_matters: "Eyes fragile. Injuries blinding. Easy to prevent.",
    key_talking_points: [
      "Hazards: Impact, Dust, Chemical, Radiation.",
      "Types: Safety glasses (Impact), Goggles (Seal/Chem), Shield (Face/High impact).",
      "Z87+: Standard marking.",
      "Fit: Close to face, side shields.",
      "Care: Clean, replace scratched."
    ],
    do_list: [
      "DO wear Z87+",
      "DO use side shields",
      "DO use goggles for chems",
      "DO use face shield + glasses",
      "DO clean",
      "DO inspect",
      "DO replace"
    ],
    dont_list: [
      "DON'T use street glasses",
      "DON'T remove to inspect",
      "DON'T wear on head",
      "DON'T use scratched",
      "DON'T ignore hazards"
    ],
    incident_scenario: {
      what_happened: "Drilling overhead. Dust under glasses. Scratched cornea.",
      what_should_happen: "Goggles for dust/overhead. Seal needed.",
      lesson: "Select right eyewear. Glasses for impact, Goggles for seal."
    },
    discussion_questions: ["Glasses vs Goggles?", "Z87?", "Face shield use?", "Cleaning?", "Contact lenses?"],
    site_checklist: ["Z87 available", "Goggles/Shields", "Cleaning stations", "Emergency wash", "Training"],
    one_minute_recap: "Protect vision. Z87+ glasses. Goggles for chem/dust. Face shield for heavy. Inspect/Clean.",
    references: ["OSHA 1910.133", "ANSI Z87.1"]
  },
  {
    title: "Hand Protection",
    category_name: "Personal Protective Equipment (PPE)",
    duration: 10,
    when_to_use: "Handling rough, sharp, chemical, hot items.",
    why_it_matters: "Hands most injured body part. Cuts/crush/burns. Gloves prevent most.",
    key_talking_points: [
      "Hazards: Cuts, Punctures, Chemicals, Heat, Pinch.",
      "Selection: Cut resistant, Nitrile (Chem), Leather (Gen), Insulated.",
      "Fit: Dexterity vs protection. Too loose = catch.",
      "Inspection: Holes, wear, contamination.",
      "Machinery: NO GLOVES with rotating parts (catch hazard)."
    ],
    do_list: [
      "DO select right glove",
      "DO inspect",
      "DO ensure fit",
      "DO clean/replace",
      "DO wash hands",
      "DO watch pinch points"
    ],
    dont_list: [
      "DON'T wear rotating parts",
      "DON'T use worn",
      "DON'T use wrong type",
      "DON'T contaminate inside"
    ],
    incident_scenario: {
      what_happened: "Used cotton gloves with solvent. Soaked through. Skin burn.",
      what_should_happen: "Chemical gloves (Nitrile/Neoprene). Check chart.",
      lesson: "Match glove to hazard. Cotton absorbs."
    },
    discussion_questions: ["Cut levels?", "Chemical types?", "Rotating parts?", "Inspection?", "Sizing?"],
    site_checklist: ["Assessment", "Types available", "Sizing", "Training", "Machine guards"],
    one_minute_recap: "Hands vulnerable. Select right glove (Cut/Chem/Heat). No gloves near rotating parts. Inspect.",
    references: ["OSHA 1910.138", "ANSI/ISEA 105"]
  },
  {
    title: "Foot Protection",
    category_name: "Personal Protective Equipment (PPE)",
    duration: 10,
    when_to_use: "Workplace foot hazards (distinct from general footwear).",
    why_it_matters: "Specific hazards require specific protection (Meta, EH, Chem).",
    key_talking_points: [
      "Toe: Impact/Compression (Steel/Comp).",
      "Metatarsal: Top of foot protection (Heavy drops).",
      "Sole: Puncture (Nail), Slip, Heat.",
      "Electrical: EH (Shock) vs SD (Static).",
      "Chemical: Rubber/PVC boots.",
      "Care: Clean, inspect tread/uppers."
    ],
    do_list: [
      "DO assess hazard",
      "DO wear specific protection",
      "DO inspect soles",
      "DO lace tight",
      "DO replace damaged",
      "DO dry out"
    ],
    dont_list: [
      "DON'T rely on toe only",
      "DON'T wear worn tread",
      "DON'T modify",
      "DON'T ignore wear"
    ],
    incident_scenario: {
      what_happened: "Pipe fell on instep. Steel toe didn't help. Broken foot.",
      what_should_happen: "Metatarsal guard boots for heavy lifting.",
      lesson: "Toe cap isn't enough for top impact. Use Met-guards."
    },
    discussion_questions: ["Metatarsal?", "EH rating?", "Puncture plate?", "Chem boots?", "Inspection?"],
    site_checklist: ["Hazard assessment", "Specific boots req", "Subsidy/Supply", "Training", "Enforcement"],
    one_minute_recap: "Match boot to hazard. Met-guards for tops. Puncture for nails. EH for shock. Inspect.",
    references: ["OSHA 1910.136", "ASTM F2413"]
  },
  {
    title: "Head Protection",
    category_name: "Personal Protective Equipment (PPE)",
    duration: 10,
    when_to_use: "Overhead hazards, bumps, electrical.",
    why_it_matters: "Brain injury fatal/permanent. Hard hat simple/effective.",
    key_talking_points: [
      "Types: Type I (Top), Type II (Top/Side).",
      "Classes: G (Gen), E (Elec), C (Conductive).",
      "Suspension: Absorbs shock. 1-1.25 inch clearance.",
      "Inspection: Shell (cracks/UV), Suspension (fray/break).",
      "Replacement: After impact, 5 yrs shell, 1 yr suspension.",
      "Use: Forward facing (unless reverse rated)."
    ],
    do_list: [
      "DO wear if req",
      "DO inspect daily",
      "DO replace if hit",
      "DO check suspension",
      "DO wear proper",
      "DO clean"
    ],
    dont_list: [
      "DON'T store in sun",
      "DON'T paint/sticker (unless approved)",
      "DON'T wear backwards (unless rated)",
      "DON'T put items in shell",
      "DON'T use damaged"
    ],
    incident_scenario: {
      what_happened: "Bolt fell. Hit hard hat. Hat cracked, worker headache but OK.",
      what_should_happen: "Replace hat immediately. It did its job.",
      lesson: "Hard hats save lives. Replace after impact."
    },
    discussion_questions: ["Type I vs II?", "Classes?", "Inspection?", "Replacement?", "Storage?", "Stickers?"],
    site_checklist: ["Hats available", "Types correct", "Inspection", "Replacement policy", "Training"],
    one_minute_recap: "Protect head. Inspect shell/suspension. Replace if hit or old. Don't store in sun.",
    references: ["OSHA 1910.135", "ANSI Z89.1"]
  },
  {
    title: "Body Protection",
    category_name: "Personal Protective Equipment (PPE)",
    duration: 10,
    when_to_use: "Skin hazards (chem, heat, cut, vis).",
    why_it_matters: "Skin largest organ. Burns/absorption/cuts. Visibility.",
    key_talking_points: [
      "Types: Coveralls, Chem suits, Aprons, FR (Flame Res), High-Vis.",
      "Chemical: Material matters (Tyvek, PVC, etc).",
      "Heat/Arc: FR rating.",
      "Traffic: Class 1, 2, 3 High-Vis.",
      "Cuts: Kevlar sleeves/aprons.",
      "Fit: Not loose (catch), not tight."
    ],
    do_list: [
      "DO assess hazard",
      "DO wear correct suit",
      "DO check fit",
      "DO inspect rips",
      "DO clean/dispose",
      "DO wear Hi-Vis"
    ],
    dont_list: [
      "DON'T wear synthetic in fire",
      "DON'T loose clothing",
      "DON'T ignore tears",
      "DON'T reuse disposable",
      "DON'T soak w/ chem"
    ],
    incident_scenario: {
      what_happened: "Traffic control at night. Dark clothes. Struck by car.",
      what_should_happen: "Class 3 High-Vis retroreflective gear.",
      lesson: "Be seen. Protect skin. Match gear to hazard."
    },
    discussion_questions: ["FR clothing?", "Chem suit types?", "Hi-Vis classes?", "Cut sleeves?", "Heat stress?"],
    site_checklist: ["Assessment", "Gear available", "Laundry/Disposal", "Training", "Inspection"],
    one_minute_recap: "Cover skin. FR for fire. Chem suit for splah. Hi-Vis for traffic. Cut resist sleeves.",
    references: ["OSHA 1910.132", "ANSI/ISEA 107"]
  },
  {
    title: "Chemical Safety",
    category_name: "Chemical Safety",
    duration: 15,
    when_to_use: "Using/Storing chemicals.",
    why_it_matters: "Exposure/Fire/Reaction. Knowledge key.",
    key_talking_points: [
      "HazCom: Labels + SDS.",
      "Storage: Compatibility (Acid/Base, Oxidizer/Flam). Secondary contain.",
      "Handling: PPE, Ventilation, Tools.",
      "Hygiene: Wash hands, don't eat, clean clothes.",
      "Emergency: Eye wash (15 min), Shower, Spill kit.",
      "Disposal: Hazardous waste rules."
    ],
    do_list: [
      "DO read label/SDS",
      "DO wear PPE",
      "DO store proper",
      "DO separate incompat",
      "DO wash hands",
      "DO use ventilation",
      "DO know eye wash"
    ],
    dont_list: [
      "DON'T mix unknown",
      "DON'T sniff",
      "DON'T eat near",
      "DON'T pour drain",
      "DON'T ignore spill"
    ],
    incident_scenario: {
      what_happened: "Mixed Bleach + Ammonia. Chlorine gas. Evacuation.",
      what_should_happen: "Never mix. Read SDS. Store separate.",
      lesson: "Incompatibles react. Read SDS. Don't mix."
    },
    discussion_questions: ["Incompatibles?", "Eye wash location?", "Hygiene?", "Ventilation?", "Storage?"],
    site_checklist: ["Inventory", "SDS", "Storage segregated", "Eye wash/Shower", "PPE", "Training"],
    one_minute_recap: "Know hazards. Read SDS. Wear PPE. Store compatible. Wash hands. Know emergency plan.",
    references: ["OSHA 1910.1200", "OSHA 1910.1450"]
  },
  {
    title: "Biological Hazards",
    category_name: "Workplace Hazards",
    duration: 10,
    when_to_use: "Medical, outdoor, cleaning, waste.",
    why_it_matters: "Infection/Disease. Blood, animals, mold.",
    key_talking_points: [
      "Sources: Blood/fluids, Mold, Insects/Animals, Waste.",
      "Bloodborne: HIV, Hep B/C. Universal Precautions.",
      "Mold: Moisture control. Respirators.",
      "Animals: Bites, venom, disease (Hanta, Lyme).",
      "Hygiene: Hand wash, vaccines, PPE.",
      "Sharps: Disposal containers."
    ],
    do_list: [
      "DO Universal Precautions",
      "DO wear gloves",
      "DO wash hands",
      "DO cover cuts",
      "DO report bites",
      "DO use sharps bin",
      "DO disinfect"
    ],
    dont_list: [
      "DON'T touch blood",
      "DON'T recap needles",
      "DON'T eat near",
      "DON'T ignore mold",
      "DON'T handle wildlife"
    ],
    incident_scenario: {
      what_happened: "Cleaner picked up trash. Needle stick. Testing/Stress.",
      what_should_happen: "Don't compress trash. Wear puncture gloves. Use tongs.",
      lesson: "Treat all fluids as infectious. Watch for sharps."
    },
    discussion_questions: ["Universal precautions?", "Sharps?", "Hand wash?", "Wildlife?", "Mold?", "Vaccines?"],
    site_checklist: ["BBP plan", "Sharps bins", "PPE", "Vaccine offer", "Cleaning", "Pest control"],
    one_minute_recap: "Blood/waste/animals. Universal Precautions. PPE. Wash hands. Sharps safety.",
    references: ["OSHA 1910.1030", "CDC"]
  },
  {
    title: "Radiation Safety",
    category_name: "Workplace Hazards",
    duration: 15,
    when_to_use: "X-ray, Nuclear, Gauge work.",
    why_it_matters: "Invisible hazard. DNA damage/Cancer. Strict control.",
    key_talking_points: [
      "Types: Ionizing (X-ray, Gamma), Non-ionizing (UV, RF).",
      "Principles: Time (minimize), Distance (maximize), Shielding (use).",
      "ALARA: As Low As Reasonably Achievable.",
      "Monitoring: Dosimeters (badges).",
      "Signs: Magenta/Yellow symbol.",
      "Controls: Interlocks, barriers, PPE."
    ],
    do_list: [
      "DO wear dosimeter",
      "DO minimize time",
      "DO maximize dist",
      "DO use shield",
      "DO obey signs",
      "DO lock out",
      "DO ALARA"
    ],
    dont_list: [
      "DON'T enter zone",
      "DON'T bypass interlock",
      "DON'T lose badge",
      "DON'T eat in zone",
      "DON'T ignore alarm"
    ],
    incident_scenario: {
      what_happened: "Worker entered radiography zone. Barrier missing. Exposure.",
      what_should_happen: "Barriers. Alarms. Monitoring. Survey.",
      lesson: "Respect barriers. Time/Distance/Shielding."
    },
    discussion_questions: ["ALARA?", "Time/Dist/Shield?", "Dosimeter?", "Signs?", "Non-ionizing?"],
    site_checklist: ["RSO officer", "License", "Dosimetry", "Survey meter", "Signs/Barriers", "Training"],
    one_minute_recap: "ALARA. Time (less), Distance (more), Shielding (use). Wear badge. Obey signs.",
    references: ["OSHA 1910.1096", "NRC"]
  },
  {
    title: "Noise Hazards",
    category_name: "Workplace Hazards",
    duration: 10,
    when_to_use: "Loud environments.",
    why_it_matters: "Hearing loss permanent. Safety risk (comms).",
    key_talking_points: [
      "Levels: 85dB (Action), 90dB (Limit).",
      "Signs: Ringing, shouting to speak.",
      "Controls: Engineering (quiet tools), Admin (rotation), PPE.",
      "Monitoring: Sound meter, Dosimeter.",
      "Audiograms: Annual check."
    ],
    do_list: [
      "DO wear PPE",
      "DO fit plugs",
      "DO rotate tasks",
      "DO maintain equip",
      "DO report noise",
      "DO test hearing"
    ],
    dont_list: [
      "DON'T ignore loud",
      "DON'T remove PPE",
      "DON'T modify muff",
      "DON'T assume used to it"
    ],
    incident_scenario: {
      what_happened: "Worked near compressor. No PPE. Temp threshold shift -> Permanent.",
      what_should_happen: "Wear PPE. Enclose compressor.",
      lesson: "Noise kills hearing. Protect it."
    },
    discussion_questions: ["Action level?", "Controls?", "PPE fit?", "Signs?", "Audiogram?"],
    site_checklist: ["Monitoring", "Controls", "PPE", "Audiograms", "Signs", "Training"],
    one_minute_recap: "Loud noise hurts. Engineering first, then PPE. Check hearing. Wear protection.",
    references: ["OSHA 1910.95", "NIOSH"]
  },
  {
    title: "Vibration Hazards",
    category_name: "Workplace Hazards",
    duration: 10,
    when_to_use: "Using power tools/Driving.",
    why_it_matters: "HAVS (Hand-Arm Vib), WBV (Whole Body). Nerve/blood damage.",
    key_talking_points: [
      "HAVS: White finger, numbness, grip loss.",
      "WBV: Back pain (drivers).",
      "Controls: Low-vib tools, gloves, breaks, maintenance.",
      "Grip: Let tool work, don't squeeze tight.",
      "Warmth: Cold worsens effects."
    ],
    do_list: [
      "DO use low-vib",
      "DO take breaks",
      "DO keep warm",
      "DO loose grip",
      "DO maintain tool",
      "DO report numbness"
    ],
    dont_list: [
      "DON'T squeeze tight",
      "DON'T smoke (circ)",
      "DON'T ignore tingle",
      "DON'T use bad tool"
    ],
    incident_scenario: {
      what_happened: "Jackhammer daily. White fingers in cold. Perm nerve damage.",
      what_should_happen: "Rotate task. Warm hands. Dampened tool.",
      lesson: "Vibration damages nerves. Limit time. Keep warm."
    },
    discussion_questions: ["HAVS signs?", "WBV?", "Controls?", "Grip?", "Cold effect?"],
    site_checklist: ["Tool selection", "Maintenance", "Gloves", "Rotation", "Health surv"],
    one_minute_recap: "Vibration damages nerves/flow. Use low-vib tools. Warm hands. Loose grip. Breaks.",
    references: ["ANSI S2.70", "NIOSH", "ACGIH"]
  },
  {
    title: "Heat Stress Prevention",
    category_name: "Workplace Hazards",
    duration: 10,
    when_to_use: "Working in hot conditions.",
    why_it_matters: "Heat stroke can be fatal. Prevention is simple (Water/Rest/Shade).",
    key_talking_points: [
      "Heat Stress: Heat cramps -> Exhaustion -> Stroke.",
      "Prevention: Drink water often (don't wait for thirst), Rest in shade, Acclimatize.",
      "Signs: Dizziness, Nausea, Confusion (Stroke!), Dry skin.",
      "Acclimatization: Build tolerance slowly (7-14 days).",
      "Emergency: Stroke = 911. Cool aggressively."
    ],
    do_list: [
      "DO drink frequently",
      "DO rest in shade",
      "DO wear light clothes",
      "DO monitor urine color",
      "DO check buddy",
      "DO report symptoms"
    ],
    dont_list: [
      "DON'T ignore dizziness",
      "DON'T drink caffeine/alcohol",
      "DON'T work alone in heat",
      "DON'T wait to hydrate",
      "DON'T wear heavy layers"
    ],
    incident_scenario: {
      what_happened: "New worker on hot day. Pushed hard. Collapsed. Heat stroke.",
      what_should_happen: "Acclimatize. More breaks. Hydrate.",
      lesson: "Heat kills. Acclimatize and hydrate."
    },
    discussion_questions: ["Signs of stroke vs exhaustion?", "Hydration plan?", "Acclimatization?", "Emergency action?", "PPE impact?"],
    site_checklist: ["Water available", "Shade/Cool area", "Acclimatization plan", "Emergency plan", "Monitoring"],
    one_minute_recap: "Water. Rest. Shade. Know the signs. Heat stroke is an emergency (Call 911).",
    references: ["OSHA Heat", "NIOSH"]
  },
  {
    title: "Noise Exposure",
    category_name: "Workplace Hazards",
    duration: 10,
    when_to_use: "Working in noisy environments.",
    why_it_matters: "Hearing loss is permanent and preventable.",
    key_talking_points: [
      "Hazard: Noise >85dB causes damage over time.",
      "Rule: If you must shout to be heard at 3 feet, it's too loud.",
      "Protection: Earplugs (fit correctly!) or Earmuffs.",
      "Controls: Reduce noise source first, PPE second.",
      "Testing: Audiometric testing monitors health."
    ],
    do_list: [
      "DO wear hearing protection >85dB",
      "DO fit earplugs properly (roll, pull, hold)",
      "DO maintain earmuff seals",
      "DO take breaks from noise",
      "DO report noisy equipment"
    ],
    dont_list: [
      "DON'T use dirty earplugs",
      "DON'T remove protection in noise",
      "DON'T ignore ringing ears",
      "DON'T modify protection",
      "DON'T assume you 'got used to it'"
    ],
    incident_scenario: {
      what_happened: "Worker rarely wore plugs. 'Got used to' noise. Permanent hearing loss at 40.",
      what_should_happen: "Wear protection every time.",
      lesson: "Hearing loss is permanent. Protect your ears."
    },
    discussion_questions: ["When is it too loud?", "How to fit earplugs?", "Double protection?", "Signs of loss?", "Tinnitus?"],
    site_checklist: ["Noise survey", "PPE available", "Signage posted", "Training provided", "Audiograms conducted"],
    one_minute_recap: "If you have to shout at 3 feet, wear earplugs. Fit them properly. Hearing loss is forever.",
    references: ["OSHA 1910.95"]
  }
];