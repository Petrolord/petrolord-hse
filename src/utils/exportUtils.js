import jsPDF from 'jspdf';
import pptxgen from 'pptxgenjs';
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType, Header, TextRun } from 'docx';
import { saveAs } from 'file-saver';

/**
 * UTILS FOR PETROLORD SAFETY MOMENT EXPORTS
 * STRICT BRAND COMPLIANCE:
 * - Colors: #0F1B2E (Navy), #F4B860 (Gold)
 * - Fonts: Arial Rounded MT Bold (Preferred), Helvetica Bold (Fallback for PDF)
 * - Logo: Replaced with "Petrolord" text in top right
 */

const BRAND = {
  colors: {
    primary: '0F1B2E', // Deep Navy
    accent: 'F4B860',  // Petrolord Gold
    text: 'FFFFFF',    // White
    textSecondary: 'E8E8E8',
    success: '22C55E',
    danger: 'EF4444'
  }
};

// --- PDF Export ---
export const exportToPDF = async (moment, user) => {
  const doc = new jsPDF({ orientation: 'landscape', format: 'a4' }); // 16:9 aspect ratio approximation
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Helper: Background & Branding
  const addBackground = () => {
    doc.setFillColor('#0F1B2E');
    doc.rect(0, 0, width, height, 'F');
    
    // Branding Text at Top Right
    // Note: jsPDF uses standard built-in fonts. "Arial Rounded MT Bold" isn't standard in jsPDF without custom font files.
    // Using Helvetica Bold as the closest standard bold sans-serif fallback.
    doc.setFontSize(24);
    doc.setTextColor('#F4B860'); // Petrolord Gold
    doc.setFont('helvetica', 'bold'); 
    doc.text("Petrolord", width - margin, 20, { align: 'right' });
  };

  // 1. Title Slide
  addBackground();
  
  // Accent Line
  doc.setDrawColor('#F4B860');
  doc.setLineWidth(1);
  doc.line((width/2) - 20, (height/2) - 25, (width/2) + 20, (height/2) - 25);

  // Category
  doc.setFontSize(14);
  doc.setTextColor('#F4B860');
  doc.setFont('helvetica', 'bold');
  doc.text((moment.category?.name || "Safety Moment").toUpperCase(), width/2, (height/2) - 15, { align: 'center' });

  // Main Title
  doc.setFontSize(36);
  doc.setTextColor('#FFFFFF');
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(moment.title, width - 60);
  doc.text(titleLines, width/2, (height/2) + 10, { align: 'center' });

  // Subtitle
  doc.setFontSize(16);
  doc.setTextColor('#D0D0D0');
  doc.setFont('helvetica', 'normal');
  doc.text("Workplace Safety Series", width/2, (height/2) + 30 + (titleLines.length * 10), { align: 'center' });

  // 2. Why It Matters
  doc.addPage();
  addBackground();
  
  doc.setFontSize(28);
  doc.setTextColor('#FFFFFF');
  doc.setFont('helvetica', 'bold');
  doc.text("Why It Matters", margin, 45);
  doc.setDrawColor('#F4B860');
  doc.line(margin, 50, width-margin, 50);

  doc.setFontSize(16);
  doc.setTextColor('#E8E8E8');
  doc.setFont('helvetica', 'normal');
  const descLines = doc.splitTextToSize(moment.why_it_matters || moment.description || "", width - (margin * 2));
  doc.text(descLines, margin, 65);

  // 3. Key Points
  const keyPoints = moment.key_points || moment.key_talking_points || [];
  if (keyPoints.length > 0) {
    doc.addPage();
    addBackground();
    
    doc.setFontSize(28);
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.text("Key Takeaways", margin, 45);
    doc.line(margin, 50, width-margin, 50);

    let yPos = 65;
    keyPoints.forEach((pt) => {
        doc.setTextColor('#F4B860');
        doc.setFontSize(20);
        doc.text("•", margin, yPos);
        
        doc.setTextColor('#E8E8E8');
        doc.setFontSize(16);
        const lines = doc.splitTextToSize(pt, width - (margin * 2) - 10);
        doc.text(lines, margin + 10, yPos);
        yPos += (lines.length * 8) + 8;
    });
  }

  // 4. Do's & Don'ts
  const dos = moment.do_list || [];
  const donts = moment.dont_list || [];
  if (dos.length > 0 || donts.length > 0) {
    doc.addPage();
    addBackground();
    doc.setFontSize(28);
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.text("Safety Practices", margin, 45);
    doc.line(margin, 50, width-margin, 50);

    const colWidth = (width - (margin * 3)) / 2;
    let yStart = 65;

    if (dos.length > 0) {
        doc.setTextColor('#22C55E'); // Green
        doc.setFontSize(18);
        doc.text("DO THIS", margin, yStart);
        let y = yStart + 10;
        doc.setTextColor('#E8E8E8');
        doc.setFontSize(12);
        dos.forEach(item => {
            const txt = item.replace(/^DO /i, '');
            const lines = doc.splitTextToSize(`• ${txt}`, colWidth);
            doc.text(lines, margin, y);
            y += (lines.length * 6) + 4;
        });
    }

    if (donts.length > 0) {
        doc.setTextColor('#EF4444'); // Red
        doc.setFontSize(18);
        doc.text("AVOID THIS", margin + colWidth + margin, yStart);
        let y = yStart + 10;
        doc.setTextColor('#E8E8E8');
        doc.setFontSize(12);
        donts.forEach(item => {
            const txt = item.replace(/^DON'T /i, '').replace(/^DONT /i, '');
            const lines = doc.splitTextToSize(`• ${txt}`, colWidth);
            doc.text(lines, margin + colWidth + margin, y);
            y += (lines.length * 6) + 4;
        });
    }
  }

  doc.save(`${moment.title}_Petrolord_Master.pdf`);
};

// --- PowerPoint Export ---
export const exportToPPTX = async (moment) => {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches
  
  // Define Master Slide
  pptx.defineSlideMaster({
    title: "MASTER_SLIDE",
    background: { color: BRAND.colors.primary },
    objects: [
      {
        text: {
          text: "Petrolord",
          options: {
            x: 7.5, y: 0.2, w: 2.3, h: 0.5,
            align: 'right',
            fontFace: "Arial Rounded MT Bold",
            fontSize: 24,
            color: BRAND.colors.accent,
            bold: true
          }
        }
      }
    ]
  });

  // 1. Cover Slide
  const slide1 = pptx.addSlide();
  slide1.background = { color: BRAND.colors.primary };
  
  // Manual text on cover slide (to match master slide positioning)
  slide1.addText("Petrolord", {
    x: 7.5, y: 0.2, w: 2.3, h: 0.5,
    align: 'right',
    fontFace: "Arial Rounded MT Bold",
    fontSize: 24,
    color: BRAND.colors.accent,
    bold: true
  });
  
  // Accent Bar
  slide1.addShape(pptx.ShapeType.rect, { x: "45%", y: 2.5, w: 1.0, h: 0.05, fill: BRAND.colors.accent });
  
  // Category
  slide1.addText((moment.category?.name || "Safety Topic").toUpperCase(), {
    x: 0, y: 2.7, w: '100%',
    fontSize: 14, color: BRAND.colors.accent, bold: true, align: 'center', tracking: 20
  });

  // Title
  slide1.addText(moment.title, {
    x: 0.5, y: 3.2, w: '90%',
    fontSize: 48, color: BRAND.colors.text, bold: true, align: 'center', fontFace: "Arial"
  });

  // 2. Why It Matters
  const slide2 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
  slide2.addText("Why It Matters", { x: 0.5, y: 1.0, w: '90%', fontSize: 32, color: BRAND.colors.text, bold: true });
  slide2.addShape(pptx.ShapeType.line, { x: 0.5, y: 1.6, w: '90%', h: 0, line: { color: BRAND.colors.accent, width: 2 } });
  slide2.addText(moment.why_it_matters || moment.description || "", {
    x: 0.5, y: 2.0, w: '90%', fontSize: 18, color: BRAND.colors.textSecondary, lineSpacing: 30
  });

  // 3. Key Points
  const keyPoints = moment.key_points || moment.key_talking_points || [];
  if (keyPoints.length > 0) {
    const slide3 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide3.addText("Key Takeaways", { x: 0.5, y: 1.0, w: '90%', fontSize: 32, color: BRAND.colors.text, bold: true });
    slide3.addShape(pptx.ShapeType.line, { x: 0.5, y: 1.6, w: '90%', h: 0, line: { color: BRAND.colors.accent, width: 2 } });
    
    const bullets = keyPoints.map(pt => ({ text: pt, options: { fontSize: 18, color: BRAND.colors.textSecondary, bullet: { code: '2022', color: BRAND.colors.accent } } }));
    slide3.addText(bullets, { x: 0.5, y: 2.0, w: '90%', lineSpacing: 35 });
  }

  // 4. Do's and Don'ts
  const dos = moment.do_list || [];
  const donts = moment.dont_list || [];
  
  if (dos.length > 0 || donts.length > 0) {
    const slide4 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide4.addText("Safety Practices", { x: 0.5, y: 1.0, w: '90%', fontSize: 32, color: BRAND.colors.text, bold: true });
    slide4.addShape(pptx.ShapeType.line, { x: 0.5, y: 1.6, w: '90%', h: 0, line: { color: BRAND.colors.accent, width: 2 } });

    if (dos.length > 0) {
        slide4.addText("DO THIS", { x: 0.5, y: 2.0, w: 4.5, fontSize: 20, color: BRAND.colors.success, bold: true });
        const doBullets = dos.map(pt => ({ text: pt.replace(/^DO /i, ''), options: { fontSize: 14, color: BRAND.colors.textSecondary, bullet: { code: '2713', color: BRAND.colors.success } } }));
        slide4.addText(doBullets, { x: 0.5, y: 2.5, w: 4.5, lineSpacing: 25 });
    }

    if (donts.length > 0) {
        slide4.addText("AVOID THIS", { x: 5.2, y: 2.0, w: 4.5, fontSize: 20, color: BRAND.colors.danger, bold: true });
        const dontBullets = donts.map(pt => ({ text: pt.replace(/^DON'T /i, '').replace(/^DONT /i, ''), options: { fontSize: 14, color: BRAND.colors.textSecondary, bullet: { code: '2717', color: BRAND.colors.danger } } }));
        slide4.addText(dontBullets, { x: 5.2, y: 2.5, w: 4.5, lineSpacing: 25 });
    }
  }

  // 5. Scenario
  if (moment.incident_scenario?.what_happened) {
    const slide5 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide5.addText("Real World Scenario", { x: 0.5, y: 1.0, w: '90%', fontSize: 32, color: BRAND.colors.text, bold: true });
    slide5.addShape(pptx.ShapeType.line, { x: 0.5, y: 1.6, w: '90%', h: 0, line: { color: BRAND.colors.accent, width: 2 } });

    slide5.addText("What Happened:", { x: 0.5, y: 2.0, w: '90%', fontSize: 14, color: BRAND.colors.accent, bold: true });
    slide5.addText(`"${moment.incident_scenario.what_happened}"`, { x: 0.5, y: 2.3, w: '90%', fontSize: 16, color: BRAND.colors.textSecondary, italic: true });

    if (moment.incident_scenario.lesson) {
        slide5.addText("Key Lesson:", { x: 0.5, y: 4.0, w: '90%', fontSize: 14, color: BRAND.colors.accent, bold: true });
        slide5.addText(moment.incident_scenario.lesson, { x: 0.5, y: 4.3, w: '90%', fontSize: 18, color: BRAND.colors.text, bold: true });
    }
  }

  // 6. Checklist
  const checklist = moment.site_checklist || [];
  if (checklist.length > 0) {
    const slide6 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide6.addText("Site Checklist", { x: 0.5, y: 1.0, w: '90%', fontSize: 32, color: BRAND.colors.text, bold: true });
    slide6.addShape(pptx.ShapeType.line, { x: 0.5, y: 1.6, w: '90%', h: 0, line: { color: BRAND.colors.accent, width: 2 } });

    const checks = checklist.map(pt => ({ text: pt, options: { fontSize: 16, color: BRAND.colors.textSecondary, bullet: { code: '2610', color: BRAND.colors.accent } } }));
    
    const half = Math.ceil(checks.length / 2);
    const leftChecks = checks.slice(0, half);
    const rightChecks = checks.slice(half);

    slide6.addText(leftChecks, { x: 0.5, y: 2.0, w: 4.5, lineSpacing: 30 });
    if (rightChecks.length > 0) {
        slide6.addText(rightChecks, { x: 5.2, y: 2.0, w: 4.5, lineSpacing: 30 });
    }
  }

  // 7. Discussion
  const questions = moment.discussion_questions || [];
  for (let i = 0; i < questions.length; i += 4) {
      const chunk = questions.slice(i, i + 4);
      const slideQ = pptx.addSlide({ masterName: "MASTER_SLIDE" });
      slideQ.addText("Team Discussion", { x: 0.5, y: 1.0, w: '90%', fontSize: 32, color: BRAND.colors.text, bold: true });
      slideQ.addShape(pptx.ShapeType.line, { x: 0.5, y: 1.6, w: '90%', h: 0, line: { color: BRAND.colors.accent, width: 2 } });

      chunk.forEach((q, idx) => {
          const qNum = i + idx + 1;
          const yPos = 2.0 + (idx * 1.0);
          slideQ.addText(`Q${qNum}`, { x: 0.5, y: yPos, w: 1.0, fontSize: 14, color: BRAND.colors.accent, bold: true });
          slideQ.addText(q, { x: 0.5, y: yPos + 0.3, w: '90%', fontSize: 18, color: BRAND.colors.text });
      });
  }

  // 8. Closing
  const slideEnd = pptx.addSlide({ masterName: "MASTER_SLIDE" });
  slideEnd.addText("STAY SAFE", { x: 0, y: 2.5, w: '100%', fontSize: 44, color: BRAND.colors.text, bold: true, align: 'center' });
  slideEnd.addText("If you see something, say something.", { x: 0, y: 3.5, w: '100%', fontSize: 18, color: BRAND.colors.textSecondary, align: 'center' });

  pptx.writeFile({ fileName: `${moment.title}_Petrolord_Master.pptx` });
};

// --- Word Export ---
export const exportToWord = async (moment) => {
  try {
    const doc = new Document({
      sections: [{
          properties: {},
          headers: {
              default: new Header({
                  children: [
                      new Paragraph({
                          alignment: AlignmentType.RIGHT,
                          children: [
                              new TextRun({
                                  text: "Petrolord",
                                  bold: true,
                                  color: BRAND.colors.accent,
                                  font: "Arial Rounded MT Bold",
                                  size: 48, // 24pt
                              }),
                          ],
                      }),
                  ],
              }),
          },
          children: [
              new Paragraph({ text: moment.title, heading: HeadingLevel.HEADING_1 }),
              new Paragraph({ text: "" }),
              new Paragraph({ text: "Why It Matters", heading: HeadingLevel.HEADING_2 }),
              new Paragraph({ text: moment.why_it_matters || moment.description || "" }),
              
              new Paragraph({ text: "" }),
              new Paragraph({ text: "Key Takeaways", heading: HeadingLevel.HEADING_2 }),
              ...((moment.key_points || []).map(pt => new Paragraph({ text: pt, bullet: { level: 0 } }))),
              
              new Paragraph({ text: "" }),
              new Paragraph({ text: "Discussion Questions", heading: HeadingLevel.HEADING_2 }),
              ...((moment.discussion_questions || []).map(q => new Paragraph({ text: q, bullet: { level: 0 } }))),
          ]
      }]
    });
    
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${moment.title}_Petrolord_Master.docx`);
  } catch (error) {
    console.error("Word export failed:", error);
    throw error;
  }
};