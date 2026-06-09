const fs = require('fs');
const path = require('path');

const RAW_DIR = '_original_materials/raw_content';
const DATA_DIR = 'src/data';

function parseFlashcards() {
  const flashcardFiles = fs.readdirSync(RAW_DIR).filter(f => f.startsWith('HO1000') && f.endsWith('.txt'));
  let allFlashcards = [];

  flashcardFiles.forEach(file => {
    const content = fs.readFileSync(path.join(RAW_DIR, file), 'utf-8');
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const moduleMatch = file.match(/D(\d)M(\d)/);
    const module = moduleMatch ? `Day ${moduleMatch[1]} Module ${moduleMatch[2]}` : 'General';

    // The observed pattern is: 
    // Row N: Term A \t Term B
    // Row N+5: Def B \t Def A (swapped)
    // This repeats every 10 lines (5 rows of terms, 5 rows of definitions)
    
    for (let i = 0; i < lines.length; i += 10) {
      const terms = lines.slice(i, i + 5).map(l => l.split('\t'));
      const defs = lines.slice(i + 5, i + 10).map(l => l.split('\t'));
      
      for (let r = 0; r < 5; r++) {
        if (terms[r] && defs[r]) {
          // Term A (col 0) -> Def A (col 1)
          if (terms[r][0] && defs[r][1]) {
            allFlashcards.push({
              term: terms[r][0].trim(),
              definition: defs[r][1].trim(),
              module
            });
          }
          // Term B (col 1) -> Def B (col 0)
          if (terms[r][1] && defs[r][0]) {
            allFlashcards.push({
              term: terms[r][1].trim(),
              definition: defs[r][0].trim(),
              module
            });
          }
        }
      }
    }
  });

  fs.writeFileSync(path.join(DATA_DIR, 'flashcards.json'), JSON.stringify(allFlashcards, null, 2));
  console.log(`Parsed ${allFlashcards.length} flashcards.`);
}

function parseQuizzes() {
  const content = fs.readFileSync(path.join(RAW_DIR, 'Google Keep Document.txt'), 'utf-8');
  const sections = content.split(/Day \d Module \d Self-Assessment/i);
  let allQuizzes = [];

  // Note: sections[0] might be empty if it starts with the header
  sections.forEach((section, idx) => {
    if (!section.trim()) return;
    
    // Attempt to identify which module this is.
    // Since we split by the header, the idx-1 might tell us which one it was if we used a better split.
    // Let's re-split to keep the delimiters or find them.
  });

  // Better split
  const quizBlocks = content.split(/(?=Day \d Module \d Self-Assessment)/i);
  quizBlocks.forEach(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    const moduleHeader = lines[0];
    const module = moduleHeader.replace('Self-Assessment', '').trim();
    
    let currentQuestion = null;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Match "1. Question text" or "Question 1: Question text"
      const qMatch = line.match(/^(?:\d+\.|Question \d+:)\s*(.*)/i);
      if (qMatch) {
        if (currentQuestion) allQuizzes.push(currentQuestion);
        currentQuestion = {
          module,
          question: qMatch[1].trim(),
          options: [],
          answer: "" // Needs to be filled
        };
      } else if (line.startsWith('- ')) {
        if (currentQuestion) currentQuestion.options.push(line.substring(2).trim());
      } else if (line.startsWith('(Options: ')) {
        // Handle the (Options: A / B / C / D) format
        const optionsStr = line.replace('(Options: ', '').replace(')', '');
        const options = optionsStr.split(' / ').map(o => o.trim());
        if (currentQuestion) currentQuestion.options = options;
      } else if (currentQuestion && !line.match(/^[A-Z\d]/)) {
         // Probably continuation of the question
         currentQuestion.question += " " + line;
      }
    }
    if (currentQuestion) allQuizzes.push(currentQuestion);
  });

  // Map answers from the study guides if possible, otherwise research
  // For now, I'll output them and might need a manual pass or more research.
  fs.writeFileSync(path.join(DATA_DIR, 'quizzes.json'), JSON.stringify(allQuizzes, null, 2));
  console.log(`Parsed ${allQuizzes.length} quiz questions.`);
}

function parseLessons() {
  const studyFiles = fs.readdirSync(RAW_DIR).filter(f => f.startsWith('LHAFL') && f.endsWith('.txt'));
  let allLessons = [];

  studyFiles.forEach(file => {
    const content = fs.readFileSync(path.join(RAW_DIR, file), 'utf-8');
    const moduleMatch = file.match(/Day (\d) Module (\d)/i);
    const module = moduleMatch ? `Day ${moduleMatch[1]} Module ${moduleMatch[2]}` : 'General';
    
    // Very basic extraction of the main text
    allLessons.push({
      module,
      content: content.trim()
    });
  });

  fs.writeFileSync(path.join(DATA_DIR, 'lessons.json'), JSON.stringify(allLessons, null, 2));
  console.log(`Parsed ${allLessons.length} lessons.`);
}

parseFlashcards();
parseQuizzes();
parseLessons();
