const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' });
const TestContent = require('../models/TestContent');

const task1Types = [
  { type: "bar chart", text: "The chart below shows the expenditure of two countries on consumer goods in 2010.", url: "https://via.placeholder.com/600x400.png?text=Bar+Chart:+Consumer+Goods" },
  { type: "line graph", text: "The graph below shows the population figures of different types of wild birds in the UK from 1970 to 2010.", url: "https://via.placeholder.com/600x400.png?text=Line+Graph:+Bird+Populations" },
  { type: "pie chart", text: "The pie charts below show the energy production of a country in two different years.", url: "https://via.placeholder.com/600x400.png?text=Pie+Charts:+Energy+Production" },
  { type: "table", text: "The table below gives information about the underground railway systems in six cities.", url: "https://via.placeholder.com/600x400.png?text=Table:+Underground+Railways" },
  { type: "diagram", text: "The diagram below shows the process of making electricity from coal.", url: "https://via.placeholder.com/600x400.png?text=Diagram:+Coal+Electricity" },
  { type: "map", text: "The maps show the changes that have taken place in a coastal town since 1990.", url: "https://via.placeholder.com/600x400.png?text=Map:+Coastal+Town+Changes" },
  { type: "mixed", text: "The bar chart and table below show the climate patterns and sales of umbrellas in London.", url: "https://via.placeholder.com/600x400.png?text=Mixed:+Climate+and+Sales" },
  { type: "bar chart", text: "The chart below shows the number of men and women studying engineering at Australian universities.", url: "https://via.placeholder.com/600x400.png?text=Bar+Chart:+Engineering+Students" }
];

const task2Prompts = [
  "Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake. Discuss both views and give your opinion.",
  "In many countries, an increasing number of people are suffering from health problems as a result of eating too much fast food. It is therefore necessary for governments to impose a higher tax on this kind of food. To what extent do you agree or disagree?",
  "As computers are being used more and more in education, there will be soon no role for teachers in the classroom. To what extent do you agree or disagree?",
  "Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?",
  "The development of tourism has contributed to English becoming the most prominent language in the world. Some people think this will lead to English being the only language to be spoken globally. What are the advantages and disadvantages to having one language in the world?",
  "Many people prefer to use public transportation, while others say that personal cars are the best. Discuss both views and give your opinion.",
  "In some countries, young people are encouraged to work or travel for a year between finishing high school and starting university studies. Discuss the advantages and disadvantages for young people who decide to do this.",
  "Some people think that all teenagers should be required to do unpaid work in their free time to help the local community. They believe this would benefit both the individual teenager and society as a whole. Do you agree or disagree?",
  "The crime rate among teenagers has increased dramatically in many countries. Discuss some possible reasons for this increase and suggest solutions.",
  "With the rapid advancement in technology, some people believe that traditional letters will eventually become obsolete. To what extent do you agree or disagree?"
];

async function generateTests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const newTests = [];
    let testNumber = 1;
    let bookNumber = 10; // Starting from Cambridge 10

    // Generate 40 tests (10 books, 4 tests each)
    for (let i = 0; i < 40; i++) {
      if (i > 0 && i % 4 === 0) {
        bookNumber++;
        testNumber = 1;
      }

      const t1 = task1Types[i % task1Types.length];
      const t2 = task2Prompts[i % task2Prompts.length];

      const testContent = {
        title: `Cambridge IELTS ${bookNumber} Academic Writing Test ${testNumber}`,
        type: 'practice_task',
        subType: 'writing',
        difficulty: 'medium',
        isActive: true,
        content: {
          parts: [
            {
              title: "Writing Task 1",
              instruction: "You should spend about 20 minutes on this task.",
              imageUrl: t1.url,
              text: `${t1.text}\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.`,
              questions: [
                {
                  id: `w1_${i}_1`,
                  type: "longText",
                  text: "Write your answer for Task 1 here.",
                  correctAnswer: ""
                }
              ]
            },
            {
              title: "Writing Task 2",
              instruction: "You should spend about 40 minutes on this task.",
              text: `${t2}\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.`,
              questions: [
                {
                  id: `w1_${i}_2`,
                  type: "longText",
                  text: "Write your answer for Task 2 here.",
                  correctAnswer: ""
                }
              ]
            }
          ]
        }
      };

      newTests.push(testContent);
      testNumber++;
    }

    // Check existing
    const existing = await TestContent.countDocuments({ subType: 'writing' });
    console.log(`Currently there are ${existing} writing tests.`);

    // Delete existing to avoid duplicates or messy data if user prefers fresh 40+ tests
    // Or just append. We'll append for safety.
    console.log(`Inserting ${newTests.length} new Cambridge writing tests...`);
    await TestContent.insertMany(newTests);
    
    console.log('Successfully inserted all tests!');
    process.exit(0);
  } catch (err) {
    console.error('Error generating tests:', err);
    process.exit(1);
  }
}

generateTests();
