'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Clock, Calendar, User, X, Sparkles, AlertCircle } from 'lucide-react';

const articles = [
  {
    id: 1,
    title: '5 Crucial Cue Card Secrets for IELTS Speaking Band 8.0+',
    category: 'Speaking',
    readTime: '6 min read',
    date: 'May 18, 2026',
    author: 'Marcus Thorne',
    excerpt: 'Struggling to speak continuously for 2 minutes? Learn the "PPF" (Past, Present, Future) structuring model that guarantees you never run out of ideas.',
    content: `
### The Cue Card Struggle
Many IELTS candidates freeze during **Speaking Part 2 (The Cue Card)**. You are given a topic, 1 minute to prepare, and must speak for 1 to 2 minutes. The most common pitfall is listing disjointed facts and running dry after 45 seconds.

To achieve **Band 8.0 or higher**, you must display structural fluency and natural grammatical variety. Here is the examiner-favorite formula to achieve exactly that.

---

### The PPF Method (Past, Present, Future)
If your card asks you to "Describe a memorable journey you went on," do not just describe what happened on the trip. Instead, divide your 2 minutes into three sequential timelines:

1. **The Past (40 seconds)**: Discuss the background context. Why was the trip planned? How were you feeling *before* you left?
   * *Grammar booster*: Use Past Perfect. *"Before we embarked on that journey, I had never traveled outside my home province..."*
2. **The Present (50 seconds)**: Detail the core of the prompt. What did you do? Who were you with?
   * *Vocabulary booster*: Use idiomatic collocations. *"It was a feast for the eyes,"* *"off the beaten track,"* *"in the middle of nowhere."*
3. **The Future (30 seconds)**: Share your reflections. Would you go back? How has that journey influenced your outlook on traveling?
   * *Grammar booster*: Use conditional clauses. *"If I were given the opportunity to revisit that place tomorrow, I would jump at the chance without hesitation."*

---

### The 1-Minute Note-Taking Strategy
During your 1 preparation minute, **never write full sentences**. You will waste time and sound like you are reading. Instead, draw a simple timelines cross:
* **P (Past)**: *Stressful exam period, hadn't slept, surprise ticket.*
* **Pr (Present)**: *Remote village, majestic peaks, hospitality, local cuisine.*
* **F (Future)**: *Plan to return, eco-tourism interest, hypothetical trip.*

By speaking in a chronological narrative, you naturally produce complex past and future tenses, keeping your rhythm fluent and effortless. Try recording yourself using the **IELTS AI Speaking Practice** module today using this exact structure!
    `
  },
  {
    id: 2,
    title: 'Standard Essay Templates for Writing Task 2 (Band 7.5+)',
    category: 'Writing',
    readTime: '8 min read',
    date: 'May 14, 2026',
    author: 'Dr. Evelyn Carter',
    excerpt: 'Save valuable time and mental energy on exam day. Memorize these proven paragraph structures for Agree/Disagree and Discussion essays.',
    content: `
### Writing Task 2: The Core Challenge
In **Writing Task 2**, you have 40 minutes to write a 250-word formal essay. Many students fail to score Band 7.0+ because their arguments lack **Coherence and Cohesion** (organization) and **Task Response** (a clear, consistent position).

Using a standardized structural template lets you focus 100% of your brainpower on vocabulary and grammatical precision, rather than wondering what paragraph to write next.

---

### Type A: Agree or Disagree Essay Template

#### Paragraph 1: Introduction (30-40 words)
* **Sentence 1**: Paraphrase the prompt.
* **Sentence 2**: State your thesis clearly. (Agree or disagree).
* *Example*: *"It is argued by some that university education should be completely free for all citizens. Personally, I completely agree with this view, as it fosters social equality and drives economic innovation."*

#### Paragraph 2: First Supporting Idea (70-80 words)
* **Sentence 1 (Topic Sentence)**: State your first primary argument.
* **Sentence 2 (Explain)**: Elaborate on why this argument is valid.
* **Sentence 3 (Example)**: Provide a specific, concrete example.
* **Sentence 4 (Result/Link)**: Re-state how this supports your main thesis.
* *Example*: *"To begin with, eliminating tuition fees ensures that talent is prioritized over financial background. In many societies, high-achieving pupils from impoverished households are deterred from higher education due to student loan debt. For instance, a recent study by Oxford University revealed that free tertiary education in Germany led to a 15% increase in STEM graduates from lower-income backgrounds. Consequently, this policy ensures equal social mobility."*

#### Paragraph 3: Second Supporting Idea (70-80 words)
* **Sentence 1 (Topic Sentence)**: State your second primary argument (e.g. economic benefits).
* **Sentence 2 (Explain)**: Elaborate.
* **Sentence 3 (Example)**: Provide an example.
* **Sentence 4 (Link)**: Summarize.

#### Paragraph 4: Conclusion (30-40 words)
* **Sentence 1**: Restate your thesis in different words.
* **Sentence 2**: Provide a broad, final recommendation or future prediction.
* *Example*: *"In conclusion, I firmly believe that making universities free is a critical step for modern nations. By leveling the educational playing field, governments not only support individual aspirations but also establish a highly skilled workforce ready for future challenges."*

---

### Key Connecting Words to Memorize
* **Addition**: *Furthermore, Moreover, In addition to this.*
* **Contrast**: *However, Conversely, On the other hand.*
* **Illustration**: *For instance, To exemplify, As demonstrated by.*
* **Consequence**: *Consequently, Therefore, As a direct result.*

Practice writing your essay in our **IELTS AI Writing Evaluator** to receive instant, sentence-by-sentence corrections matching these criteria!
    `
  },
  {
    id: 3,
    title: 'Skimming and Scanning: Academic Reading Speed Tactics',
    category: 'Reading',
    readTime: '5 min read',
    date: 'May 09, 2026',
    author: 'Marcus Thorne',
    excerpt: 'You do not have enough time to read all 3 passages word-for-word. Master skimming and scanning to locate answers in under 45 seconds.',
    content: `
### The Time Trap
The **IELTS Academic Reading** test consists of 3 long passages (totaling 2,500+ words) and 40 questions. You have exactly 60 minutes. If you read the text word-for-word like a novel, you will fail to finish the final passage.

You must learn to search the text efficiently using two primary eyes-on-page techniques: **Skimming** and **Scanning**.

---

### 1. Skimming: Reading for the Gist
Skimming is running your eyes rapidly over the text to understand the overall theme of each paragraph.
* **How to do it**: Read the **title**, the **first 2 sentences** of each paragraph (where the topic sentence is), and the **concluding sentence** of each paragraph. Ignore difficult vocabulary.
* **Why**: This creates a "mental map" of the passage. When you read a question about "greenhouse gas effects in the Arctic," you will instantly know to look in Paragraph D because your skim mapped that paragraph to environmental impacts.

---

### 2. Scanning: Hunting for Keywords
Scanning is searching for specific data points, names, dates, or technical jargon without reading the surrounding text.
* **How to do it**: Keep the target keyword in your mind (e.g., *"1987"* or *"Dr. Richard"*). Move your eyes in a Z-pattern across the lines, looking ONLY for the capital letters, numbers, or specific symbols. Do not comprehend the sentences yet.
* **Why**: This lets you pinpoint the exact sentence containing the answer in seconds.

---

### The Ultimate Reading Sequence (Step-by-Step)
1. **Analyze the Questions First (1 minute)**: Read the questions for Passage 1, underline the keywords, and identify the question type (e.g. True/False/Not Given, Matching Headings).
2. **Skim the Passage (2 minutes)**: Get a quick layout map of the text.
3. **Scan for Keywords (Remaining time)**: Go back to the questions, scan the passage for the matching keywords, and then read the surrounding 2 sentences *very carefully* to deduce the answer.
4. **Beware of Synonyms**: IELTS examiners rarely repeat the exact word. If a question asks for "decreased rapidly," you must scan for synonyms like "plummeted," "dropped significantly," or "collapsed."
    `
  },
  {
    id: 4,
    title: 'Listening Section 4: Eliminating Common Spelling Traps',
    category: 'Listening',
    readTime: '4 min read',
    date: 'Apr 28, 2026',
    author: 'Marcus Thorne',
    excerpt: 'Spelling mistakes will completely invalidate an otherwise correct listening answer. Memorize these tricky letter clusters and double letters.',
    content: `
### Spelling Matters
In the **IELTS Listening** module, a spelling mistake is graded as a wrong answer. Even if you heard the correct word, writing *"goverment"* instead of *"government"* will lose you a valuable mark.

**Section 4** is the most academic and fast-paced section, where spelling slips commonly occur due to exam fatigue. Here is how to train your ears and hands.

---

### Tricky Spelling Categories to Master

#### 1. Double Letters
This is the single largest spelling trap. Make sure you know exactly where the double letters are:
* **Accommodation** (Double C, Double M)
* **Embarrass** (Double B, Double R, Double S)
* **Committee** (Double M, Double T, Double E)
* **Tomorrow** (Single M, Double R)
* **Necessary** (Single C, Double S)

#### 2. Silent Letters
English pronunciation frequently hides letters. Keep these silent vowels and consonants in mind:
* **Environment** (Do not forget the silent 'n' in the middle!)
* **Government** (Contains a silent 'n')
* **Foreign** (Contains silent 'g')
* **February** (Contains silent first 'r')

#### 3. "EI" vs "IE" Rules
The old rhyme *"I before E except after C"* is useful, but beware of common IELTS exceptions:
* **Receive** (After C)
* **Ceiling** (After C)
* **Believe** (IE)
* **Their** (Exception!)
* **Height** (Exception!)

---

### Double Check Your Answers
At the end of the paper-based test, you have 10 minutes to transfer answers. In the computer-delivered test, you have 2 minutes to review. **Use this time exclusively to check spelling!**
* Is the noun singular or plural? If the speaker said *"students"* and you wrote *"student"*, it is incorrect.
* Are the capitalizations correct for proper nouns (e.g. *"Tuesday"*, *"Professor Green"*)?
    `
  },
  {
    id: 5,
    title: 'Top 15 Academic Vocabulary Collocations for Band 8.0',
    category: 'Vocabulary',
    readTime: '7 min read',
    date: 'Apr 19, 2026',
    author: 'Dr. Evelyn Carter',
    excerpt: 'Upgrade simple verbs and adjectives to advanced academic pairings. Make your speech and writing sound highly professional.',
    content: `
### What are Collocations?
Collocations are words that naturally go together in English. For example, we say *"make a mistake"*, never *"do a mistake"*. 

In the IELTS band descriptors, **Lexical Resource** makes up 25% of your Writing and Speaking scores. Examiners are explicitly looking for your ability to use **collocations and idiomatic pairings** smoothly.

---

### Advanced Collocations Table

| Simple Phrase | Band 8.0 Upgrade | Context / Example |
| :--- | :--- | :--- |
| Big change | **Profound impact** | *"AI has had a profound impact on education."* |
| Do research | **Conduct an investigation** | *"Scientists conducted an extensive investigation."* |
| Fast growth | **Exponential rise** | *"There has been an exponential rise in remote work."* |
| Solve a problem | **Address an issue** | *"Governments must address this critical issue."* |
| Very clear | **Abundantly clear** | *"The scientific consensus has made it abundantly clear."* |
| Bad effect | **Adverse consequence** | *"Fossil fuels lead to adverse consequences."* |
| Change a law | **Amend legislation** | *"Parliament voted to amend the existing legislation."* |
| Main reason | **Primary catalyst** | *"Urbanization was the primary catalyst for economic shifts."* |

---

### How to Practice
1. **Never learn isolated words**. Instead of memorizing *"adverse"*, memorize *"adverse consequences"* as a single, combined unit of meaning.
2. **Contextualize**: Write three sentences using these upgrades in our **IELTS AI Vocabulary dashboard** to solidify them in your active memory.
3. **Use in Speaking**: Using collocations like *"abundantly clear"* or *"profound impact"* during Speaking Part 3 instantly signals to the examiner that you possess a natural command of English syntax.
    `
  }
];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<typeof articles[0] | null>(null);

  const categories = ['All', 'Speaking', 'Writing', 'Reading', 'Listening', 'Vocabulary'];

  const filteredArticles = articles.filter((art) => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || art.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-1/10 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/10 w-96 h-96 bg-neon/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-accent/20 text-xs text-accent mb-4 font-semibold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Expert Resources
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            IELTS Preparation <span className="gradient-text">Tips & Guides</span>
          </h1>
          <p className="text-base sm:text-lg text-text-muted">
            Curated advice, paragraph templates, and test strategies compiled by former examiners and AI engineers to accelerate your band growth.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between pb-8 border-b border-border-glass mb-10">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  activeCategory === cat
                    ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20'
                    : 'bg-surface/50 border-border-glass text-text-muted hover:text-white hover:bg-surface'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border-glass text-xs text-white placeholder-text-muted focus:border-accent transition-all outline-none"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((art, idx) => (
              <motion.article
                key={art.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => setSelectedArticle(art)}
                className="group rounded-2xl glass border border-border-glass p-6 hover:border-accent/40 transition-all duration-300 flex flex-col justify-between h-[360px] cursor-pointer hover:shadow-xl hover:shadow-accent/5"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-accent/15 text-accent">
                      {art.category}
                    </span>
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {art.readTime}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-accent transition-colors mb-3 line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-4">
                    {art.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-border-glass/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-[10px] text-accent font-bold">
                      {art.author.charAt(0)}
                    </div>
                    <span className="text-[10px] font-semibold text-white">{art.author}</span>
                  </div>
                  <span className="text-[10px] text-text-muted">{art.date}</span>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-text-muted max-w-sm mx-auto flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10 text-text-muted/60" />
            <h3 className="text-sm font-bold text-white">No articles matched your search</h3>
            <p className="text-xs">Try selecting a different category or adjusting your search queries.</p>
          </div>
        )}
      </div>

      {/* Article Reader Slide-in Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Content Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              className="relative w-full max-w-3xl rounded-3xl glass-strong border border-border-glass shadow-2xl p-6 md:p-8 text-white z-10 max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-border-glass pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-accent/20 text-accent">
                      {selectedArticle.category}
                    </span>
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {selectedArticle.readTime}
                    </span>
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {selectedArticle.date}
                    </span>
                  </div>
                  <h2 className="text-lg md:text-xl font-extrabold text-white leading-snug">
                    {selectedArticle.title}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-2">
                    <User className="w-3 h-3 text-accent" />
                    <span className="text-[10px] text-text-muted">Authored by <strong className="text-white">{selectedArticle.author}</strong></span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-1.5 rounded-xl bg-surface hover:bg-surface-hover text-text-muted hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Text Body */}
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin text-sm text-text-muted leading-relaxed whitespace-pre-line space-y-4">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: selectedArticle.content
                      .replace(/### (.*)/g, '<h3 class="text-white font-bold text-base mt-6 mb-3 border-l-2 border-accent pl-2.5">$1</h3>')
                      .replace(/#### (.*)/g, '<h4 class="text-white font-semibold text-sm mt-4 mb-2">$1</h4>')
                      .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>')
                      .replace(/\* (.*)/g, '<li class="list-disc ml-5 mt-1">$1</li>')
                      .replace(/---/g, '<hr class="border-border-glass/40 my-6" />')
                      .replace(/\| (.*) \| (.*) \| (.*) \|/g, '<tr class="border-b border-border-glass/40 text-xs"><td class="py-2.5 pr-4 font-bold text-accent">$1</td><td class="py-2.5 pr-4">$2</td><td class="py-2.5">$3</td></tr>')
                      .replace(/\| :--- \| :--- \| :--- \|/g, '')
                      .replace(/\| (.*) \|/g, '<table class="w-full my-4 text-left border-collapse"><thead><tr class="border-b border-border-glass font-bold text-white text-xs"><th class="pb-2">Upgrade</th><th>Upgrade</th><th>Upgrade</th></tr></thead><tbody>')
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
