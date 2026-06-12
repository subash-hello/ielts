const TestContent = require('../models/TestContent');

// Define 10 high-quality, completely unique IELTS templates
const testTemplates = [
  {
    id_ref: 't1',
    readingPassage: `The Impact of Artificial Intelligence on Language Acquisition\n\nLanguage acquisition has traditionally been a human-centric endeavor, requiring physical interaction, social feedback, and continuous reinforcement within a community of speakers. However, the emergence of advanced Artificial Intelligence (AI) has significantly transformed this landscape. Modern AI tools, powered by Large Language Models (LLMs) and neural text-to-speech engines, have introduced highly personalized, low-stress learning environments that democratize language training.\n\nOne of the most notable advantages of AI-driven tutors is the reduction of communicative anxiety. Many language learners experience what researchers call 'Foreign Language Anxiety'—a paralyzing fear of making grammatical errors in front of native speakers or classmates. AI chat agents, however, offer a judgment-free sandbox. Learners can experiment with phrasing, test vocabulary boundaries, and receive immediate corrections without the social embarrassment typically associated with classrooms.\n\nNevertheless, experts warn against over-reliance on artificial intelligence. While LLMs excel at teaching grammar and expanding vocabulary, they lack the cultural nuance and organic spontaneity of human conversation. An AI model speaks based on probability distributions, which can result in overly clinical or formulaic phrasing. Therefore, the optimal approach to language learning remains a hybrid one: utilizing AI for vocabulary building, while relying on real human interaction for conversational fluency.`,
    readingQuestions: [
      { id: 'r1', text: 'According to the passage, what paralyzed many language learners in classrooms?', options: ['Lacking access to text-to-speech tools', 'Foreign Language Anxiety', 'Over-reliance on neural models', 'Inability to learn grammar'], correct: 'Foreign Language Anxiety' },
      { id: 'r2', text: 'AI tutors create a "judgment-free sandbox" because they do not cause:', options: ['Grammatical mistakes', 'Vocabulary expansion', 'Social embarrassment', 'Clinical phrasing'], correct: 'Social embarrassment' },
      { id: 'r3', text: 'LLMs lack the ability to naturally mimic what aspect of human speech?', options: ['Logical structures', 'Cultural nuance and spontaneity', 'Grammar rules', 'Syntactic exercises'], correct: 'Cultural nuance and spontaneity' },
      { id: 'r4', text: 'The author suggests that AI speech can sometimes sound _____ or clinical.', options: ['Vibrant', 'Formulaic', 'Spontaneous', 'Highly accurate'], correct: 'Formulaic' },
      { id: 'r5', text: 'What is the optimal approach recommended by experts?', options: ['AI-only immersion', 'Human-only lectures', 'A hybrid model', 'No practice under anxiety'], correct: 'A hybrid model' },
      { id: 'r6', text: 'Language acquisition has traditionally been a _____ endeavor.', options: ['technology-driven', 'human-centric', 'isolated', 'formulaic'], correct: 'human-centric' },
      { id: 'r7', text: 'Modern AI tools are powered by Large Language Models and neural _____ engines.', options: ['speech-to-text', 'image-generation', 'text-to-speech', 'database'], correct: 'text-to-speech' },
      { id: 'r8', text: 'Foreign Language Anxiety involves a paralyzing fear of making _____ errors.', options: ['logical', 'pronunciation', 'vocabulary', 'grammatical'], correct: 'grammatical' },
      { id: 'r9', text: 'AI chat agents offer a _____ sandbox for language learners.', options: ['judgment-free', 'cost-free', 'highly stressful', 'clinical'], correct: 'judgment-free' },
      { id: 'r10', text: 'An AI model speaks based on _____ distributions.', options: ['vocabulary', 'probability', 'phrase', 'cultural'], correct: 'probability' },
      { id: 'r11', text: 'Which of the following is NOT a facet of human conversation that AI lacks?', options: ['Cultural nuance', 'Organic spontaneity', 'Grammar and vocabulary templates', 'Spontaneous phrasing'], correct: 'Grammar and vocabulary templates' },
      { id: 'r12', text: 'The optimal approach recommended by experts utilizes AI for _____ building.', options: ['fluency', 'confidence', 'spontaneity', 'vocabulary'], correct: 'vocabulary' },
      { id: 'r13', text: 'Real human interaction is necessary for achieving conversational _____.', options: ['accuracy', 'fluency', 'templates', 'probability'], correct: 'fluency' }
    ],
    speakingPrompts: [
      { id: 's1', question: "Could you tell me a little about your hometown?", examinerText: "Let's start. Could you tell me a little about your hometown? What is it like?" },
      { id: 's2', question: "Do you prefer studying alone or in a group?", examinerText: "Thank you. Now, let's talk about habits. Do you prefer studying alone or in a group? Why?" },
      { id: 's3', question: "How will technology affect education in the future?", examinerText: "I see. Let's move on to abstract discussion. How do you think technology will affect the future of education over the next twenty years?" }
    ],
    writingPrompt: "Some people argue that technology has made us less connected to others, while others believe it has brought us closer. Discuss both views and give your opinion.",
    listeningTranscript: "Welcome to the IELTS Listening Test. Section one. Receptionist: Good morning, Grand Hotel. How may I help you today? Guest: Good morning. Yes, I would like to book a double room for three nights, please. Receptionist: Certainly. What is the preferred check-in date? Guest: I would like to check in on the 15th of March. Receptionist: Excellent. A double room is available for those dates. The rate is 120 dollars per night, which includes complimentary high-speed internet. Guest: Perfect, that is within my budget. Does that price include breakfast? Receptionist: Yes, it does. A full continental breakfast is served every morning in our restaurant from 7 to 10 AM. Guest: Wonderful. And where is the hotel located? Is it close to public transport? Receptionist: Yes, we are conveniently located in the city center, right next to the central metro station, making it very easy to get around. Guest: That sounds ideal. Let's go ahead and book it.",
    listeningQuestions: [
      { id: 'l1', type: 'fillBlank', text: 'The guest wants to book a room for _____ nights.', correctAnswer: 'three' },
      { id: 'l2', type: 'multipleChoice', text: 'What type of room does the guest prefer?', options: ['Single', 'Double', 'Suite', 'Family'], correctAnswer: 'Double' },
      { id: 'l3', type: 'fillBlank', text: 'The total cost is $_____ per night.', correctAnswer: '120' },
      { id: 'l4', type: 'multipleChoice', text: 'Breakfast is served from:', options: ['6-9 AM', '7-10 AM', '8-11 AM'], correctAnswer: '7-10 AM' },
      { id: 'l5', type: 'fillBlank', text: 'The hotel is located near the central _____ station.', correctAnswer: 'metro' },
      { id: 'l6', type: 'fillBlank', text: 'The preferred check-in date is the 15th of _____.', correctAnswer: 'March' },
      { id: 'l7', type: 'trueFalseNotGiven', text: 'Complimentary high-speed internet is included in the rate.', correctAnswer: 'True' },
      { id: 'l8', type: 'multipleChoice', text: 'Where is the hotel located?', options: ['Suburbs', 'City center', 'Near airport', 'Countryside'], correctAnswer: 'City center' },
      { id: 'l9', type: 'fillBlank', text: 'Breakfast is a full _____ breakfast.', correctAnswer: 'continental' },
      { id: 'l10', type: 'trueFalseNotGiven', text: 'The hotel is located far away from the metro station.', correctAnswer: 'False' }
    ]
  },
  {
    id_ref: 't2',
    readingPassage: `The Disappearing Art of Cursive Handwriting\n\nFor generations, learning to write in cursive was a fundamental rite of passage in elementary education. Students spent hours tracing loops and slants, mastering the continuous flow of letters. However, with the rapid digitization of society, cursive instruction has seen a sharp decline in school curricula worldwide, replaced by keyboarding and digital literacy.\n\nProponents of removing cursive argue that instructional time is limited, and students are better served learning skills directly applicable to the modern workforce. They point out that adults rarely write extensively by hand, relying instead on smartphones, tablets, and laptops. Typing speed and software proficiency are deemed far more critical for academic and professional success in the 21st century.\n\nConversely, neuroscientists and educators advocate for the retention of cursive handwriting, citing cognitive benefits. Research indicates that the fluid, continuous motion of cursive writing activates different neural pathways compared to printing or typing. This activation is linked to improved fine motor skills, better spelling retention, and enhanced reading fluency. Furthermore, historical documents, from personal letters to constitutional texts, are written in cursive. Without the ability to read it, future generations may become disconnected from primary historical sources, relying entirely on transcribed or digital versions.`,
    readingQuestions: [
      { id: 'r1', text: 'What has largely replaced cursive instruction in school curricula?', options: ['Physical education', 'Keyboarding and digital literacy', 'Foreign languages', 'Advanced mathematics'], correct: 'Keyboarding and digital literacy' },
      { id: 'r2', text: 'Proponents of removing cursive argue that it is more important to learn skills for:', options: ['The modern workforce', 'Reading historical documents', 'Fine motor development', 'Artistic expression'], correct: 'The modern workforce' },
      { id: 'r3', text: 'Neuroscientists link cursive writing to improved:', options: ['Typing speed', 'Software proficiency', 'Spelling retention and reading fluency', 'Mathematics skills'], correct: 'Spelling retention and reading fluency' },
      { id: 'r4', text: 'According to the passage, the motion of cursive writing activates:', options: ['The same pathways as typing', 'Different neural pathways', 'Muscles in the shoulder', 'The visual cortex exclusively'], correct: 'Different neural pathways' },
      { id: 'r5', text: 'A cultural risk of abandoning cursive is the inability to read:', options: ['Modern emails', 'Digital transcripts', 'Primary historical sources', 'Printed textbooks'], correct: 'Primary historical sources' },
      { id: 'r6', text: 'For generations, learning cursive was a fundamental _____ in elementary education.', options: ['rite of passage', 'optional project', 'extracurricular activity', 'waste of time'], correct: 'rite of passage' },
      { id: 'r7', text: 'Cursive instruction has seen a sharp decline due to rapid _____ of society.', options: ['digitization', 'urbanization', 'globalization', 'industrialization'], correct: 'digitization' },
      { id: 'r8', text: 'Proponents of removing cursive suggest instructional _____ is limited.', options: ['funding', 'interest', 'support', 'time'], correct: 'time' },
      { id: 'r9', text: 'Adults today rarely write _____ by hand.', options: ['letters', 'extensively', 'signatures', 'reminders'], correct: 'extensively' },
      { id: 'r10', text: 'Typing speed is deemed far more critical for success in the _____ century.', options: ['20th', '21st', '22nd', '19th'], correct: '21st' },
      { id: 'r11', text: 'Cursive handwriting is advocates by neuroscientists for its _____ benefits.', options: ['physical', 'cognitive', 'social', 'artistic'], correct: 'cognitive' },
      { id: 'r12', text: 'Cursive writing activates different pathways compared to printing or _____.', options: ['speaking', 'typing', 'reading', 'drawing'], correct: 'typing' },
      { id: 'r13', text: 'Future generations might rely entirely on _____ or digital versions of history.', options: ['original', 'transcribed', 'foreign', 'printed'], correct: 'transcribed' }
    ],
    speakingPrompts: [
      { id: 's1', question: "What kind of books did you read as a child?", examinerText: "Hello. Let's talk about reading. What kind of books did you read as a child?" },
      { id: 's2', question: "Do you think people read less nowadays?", examinerText: "Interesting. Do you think people in your country read less nowadays compared to the past?" },
      { id: 's3', question: "How has the internet changed the way we consume information?", examinerText: "Let's move to a wider topic. How has the internet fundamentally changed the way society consumes information?" }
    ],
    writingPrompt: "In many countries, the proportion of older people is steadily increasing. Does this trend have more positive or negative effects on society?",
    listeningTranscript: "Welcome everyone to the university library. I'm Sarah, your head librarian. Let me give you a quick tour. As you enter, immediately to your right is the circulation desk where you can check out books. Just past that is the reference section, which contains encyclopedias and dictionaries that cannot be removed from the library. If you need quiet study space, the entire second floor is designated as a silent zone. For group work, we have twelve soundproof study pods on the third floor. You must book these pods online at least 24 hours in advance. Our opening hours during term time are 8 AM to midnight, Monday to Friday, and 10 AM to 10 PM on weekends. During exam season, the ground floor remains open 24 hours a day.",
    listeningQuestions: [
      { id: 'l1', type: 'multipleChoice', text: 'Where is the circulation desk located?', options: ['On the left', 'On the right', 'On the second floor', 'On the third floor'], correctAnswer: 'On the right' },
      { id: 'l2', type: 'fillBlank', text: 'Books from the reference section _____ be removed from the library.', correctAnswer: 'cannot' },
      { id: 'l3', type: 'fillBlank', text: 'The _____ floor is designated as a silent zone.', correctAnswer: 'second' },
      { id: 'l4', type: 'fillBlank', text: 'Study pods must be booked _____ hours in advance.', correctAnswer: '24' },
      { id: 'l5', type: 'multipleChoice', text: 'During exam season, which floor is open 24 hours?', options: ['Ground floor', 'Second floor', 'Third floor', 'All floors'], correctAnswer: 'Ground floor' },
      { id: 'l6', type: 'fillBlank', text: 'The head librarian\'s name is _____ .', correctAnswer: 'Sarah' },
      { id: 'l7', type: 'multipleChoice', text: 'How many soundproof study pods are available?', options: ['Six', 'Ten', 'Twelve', 'Fifteen'], correctAnswer: 'Twelve' },
      { id: 'l8', type: 'fillBlank', text: 'Study pods are located on the _____ floor.', correctAnswer: 'third' },
      { id: 'l9', type: 'fillBlank', text: 'On weekends, the library closes at _____ PM.', correctAnswer: '10' },
      { id: 'l10', type: 'trueFalseNotGiven', text: 'Dictionaries can be taken home from the reference section.', correctAnswer: 'False' }
    ]
  },
  {
    id_ref: 't3',
    readingPassage: `The Economics of Fast Fashion\n\nFast fashion has revolutionized the global apparel industry by accelerating the design, production, and distribution cycles. Brands can now move a garment from the sketchbook to the store shelf in a matter of weeks, capitalizing on micro-trends popularized by social media. This business model relies on high-volume sales, low profit margins per item, and a supply chain optimized for extreme efficiency.\n\nHowever, the environmental and social costs of this model are increasingly coming under scrutiny. Fast fashion is highly resource-intensive; cotton production requires vast amounts of water, while synthetic fabrics like polyester are derived from petroleum and shed microplastics during washing. Furthermore, the relentless pressure to keep retail prices low often results in poor working conditions and suppressed wages for garment workers in developing nations, where the majority of production is outsourced.\n\nIn response to these concerns, a counter-movement known as 'Slow Fashion' is gaining traction. This paradigm advocates for sustainable materials, ethical labor practices, and consumer longevity. Slow fashion brands encourage buyers to invest in higher-quality, timeless pieces rather than rapidly discarding cheap garments. While currently a niche market due to higher price points, the slow fashion movement highlights a growing consumer awareness regarding the true cost of their clothing choices.`,
    readingQuestions: [
      { id: 'r1', text: 'How quickly can fast fashion brands move a garment from sketchbook to store?', options: ['Years', 'Months', 'Weeks', 'Days'], correct: 'Weeks' },
      { id: 'r2', text: 'The fast fashion business model relies on:', options: ['High margins per item', 'Low-volume sales', 'High-volume sales and low margins', 'Ethical labor practices'], correct: 'High-volume sales and low margins' },
      { id: 'r3', text: 'Synthetic fabrics like polyester shed _____ during washing.', options: ['Cotton fibers', 'Petroleum', 'Microplastics', 'Water'], correct: 'Microplastics' },
      { id: 'r4', text: 'The pressure to keep retail prices low often results in:', options: ['Higher wages', 'Poor working conditions', 'Better fabric quality', 'Slower production'], correct: 'Poor working conditions' },
      { id: 'r5', text: 'What does the Slow Fashion movement advocate for?', options: ['Micro-trends', 'Cheaper garments', 'Sustainable materials and ethical labor', 'Increased synthetic fabric use'], correct: 'Sustainable materials and ethical labor' },
      { id: 'r6', text: 'Fast fashion has accelerated the design, production, and _____ cycles.', options: ['marketing', 'distribution', 'recycling', 'manufacturing'], correct: 'distribution' },
      { id: 'r7', text: 'Fast fashion capitalizing on micro-trends popularized by _____ media.', options: ['print', 'broadcast', 'social', 'digital'], correct: 'social' },
      { id: 'r8', text: 'Synthetic fabrics like polyester are derived from _____ .', options: ['plants', 'petroleum', 'wood pulp', 'coal'], correct: 'petroleum' },
      { id: 'r9', text: 'The majority of production is _____ to developing nations.', options: ['transferred', 'outsourced', 'sold', 'moved'], correct: 'outsourced' },
      { id: 'r10', text: 'Garment workers in developing nations often experience suppressed _____ .', options: ['rights', 'wages', 'benefits', 'working hours'], correct: 'wages' },
      { id: 'r11', text: 'A counter-movement known as _____ Fashion is gaining traction.', options: ['Eco', 'Fast', 'Slow', 'Modern'], correct: 'Slow' },
      { id: 'r12', text: 'Slow fashion brands encourage buyers to invest in higher-quality, _____ pieces.', options: ['timeless', 'expensive', 'disposable', 'trendy'], correct: 'timeless' },
      { id: 'r13', text: 'The slow fashion movement highlights a growing consumer _____ .', options: ['apathy', 'distrust', 'rebellion', 'awareness'], correct: 'awareness' }
    ],
    speakingPrompts: [
      { id: 's1', question: "What is your favorite type of weather?", examinerText: "Good morning. Let's talk about the weather. What is your favorite type of weather and why?" },
      { id: 's2', question: "Does the weather affect your mood?", examinerText: "I see. Do you think the weather significantly affects your mood?" },
      { id: 's3', question: "How is climate change impacting weather patterns in your region?", examinerText: "Let's move on. How is climate change impacting traditional weather patterns globally, and specifically in your region?" }
    ],
    writingPrompt: "Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake. Discuss both views and give your opinion.",
    listeningTranscript: "John: Hi Emma. Have you looked at the guidelines for our biology assignment yet? Emma: Yes, I was just reading them. It looks like we need to choose a specific marine ecosystem and analyze the impact of human activity on it. John: Right. I was thinking we could focus on the Great Barrier Reef. There's so much research available on coral bleaching. Emma: That's true, but it might be too broad. The professor said we should focus on a localized issue. How about mangrove forests in Southeast Asia? John: Oh, that's a brilliant idea! Mangroves are crucial for coastal defense but they're being destroyed for shrimp farming. Emma: Exactly. We need to submit our proposal by Friday. Shall we divide the research? I can look into the ecological importance of the mangroves. John: And I'll research the economic drivers behind the shrimp farming industry. Let's meet at the library on Wednesday afternoon to put it together.",
    listeningQuestions: [
      { id: 'l1', type: 'multipleChoice', text: 'What is the topic of their biology assignment?', options: ['Coral bleaching', 'Impact of human activity on a marine ecosystem', 'Shrimp farming in Australia', 'Coastal defense systems'], correctAnswer: 'Impact of human activity on a marine ecosystem' },
      { id: 'l2', type: 'multipleChoice', text: 'Emma thinks the Great Barrier Reef is:', options: ['Perfect', 'Too narrow', 'Too broad', 'Not interesting'], correctAnswer: 'Too broad' },
      { id: 'l3', type: 'fillBlank', text: 'They decide to focus on _____ forests in Southeast Asia.', correctAnswer: 'mangrove' },
      { id: 'l4', type: 'fillBlank', text: 'John will research the economic drivers behind the _____ farming industry.', correctAnswer: 'shrimp' },
      { id: 'l5', type: 'multipleChoice', text: 'When is their proposal due?', options: ['Wednesday', 'Thursday', 'Friday', 'Next week'], correctAnswer: 'Friday' },
      { id: 'l6', type: 'trueFalseNotGiven', text: 'Mangrove forests are crucial for coastal defense.', correctAnswer: 'True' },
      { id: 'l7', type: 'trueFalseNotGiven', text: 'Emma will research the economic drivers of shrimp farming.', correctAnswer: 'False' },
      { id: 'l8', type: 'multipleChoice', text: 'When do they plan to meet at the library?', options: ['Wednesday afternoon', 'Thursday morning', 'Friday noon', 'Tuesday evening'], correctAnswer: 'Wednesday afternoon' },
      { id: 'l9', type: 'fillBlank', text: 'Mangroves are being destroyed for _____ farming.', correctAnswer: 'shrimp' },
      { id: 'l10', type: 'trueFalseNotGiven', text: 'John proposes the Great Barrier Reef first.', correctAnswer: 'True' }
    ]
  },
  {
    id_ref: 't4',
    readingPassage: `Urban Green Spaces and Mental Health\n\nRapid urbanization has disconnected humans from their natural environments, leading to an increase in psychological disorders. Modern cities are dominated by asphalt and concrete, offering few opportunities for natural relaxation. Studies in environmental psychology suggest that urban green spaces—such as parks, gardens, and urban forests—play a critical role in mitigating stress and enhancing mental wellness.\n\nAccording to the biophilia hypothesis, humans possess an innate, biologically driven connection to the natural world. Interacting with nature stimulates positive emotional responses and decreases the production of cortisol, the human stress hormone. Clinical studies demonstrate that even short walks through a forested park can lower blood pressure, reduce muscle tension, and improve short-term cognitive capacity compared to walks of the same duration in busy commercial districts.\n\nFurthermore, neighborhood green spaces foster community cohesion. Parks serve as physical meeting places that promote active socialization and physical exercises, both of which are strongly correlated with reduced rates of clinical depression. Therefore, urban planners should prioritize the integration of green infrastructure in municipal developments, treating parks not as aesthetic luxuries, but as essential public health interventions.`,
    readingQuestions: [
      { id: 'r1', text: 'What is the primary benefit of urban green spaces mentioned in the passage?', options: ['Lower property tax rates', 'Mitigating stress and enhancing wellness', 'Higher retail activity', 'Reduced traffic congestion'], correct: 'Mitigating stress and enhancing wellness' },
      { id: 'r2', text: 'The biophilia hypothesis suggests that humans have:', options: ['An innate connection to nature', 'A fear of urban areas', 'An absolute dependency on technology', 'A preference for concrete structures'], correct: 'An innate connection to nature' },
      { id: 'r3', text: 'Walking in a park lowers blood pressure and decreases the production of:', options: ['Adrenaline', 'Cortisol', 'Insulin', 'Melatonin'], correct: 'Cortisol' },
      { id: 'r4', text: 'How do parks indirectly reduce rates of depression?', options: ['By selling organic foods', 'By offering free health checkups', 'By promoting socialization and physical exercises', 'By providing isolated spaces'], correct: 'By promoting socialization and physical exercises' },
      { id: 'r5', text: 'The author argues that municipal planners should view parks as:', options: ['Aesthetic luxuries', 'Waste of valuable space', 'Essential public health interventions', 'Commercial retail zones'], correct: 'Essential public health interventions' },
      { id: 'r6', text: 'Modern cities are dominated by asphalt and _____ .', options: ['gardens', 'skyscrapers', 'concrete', 'parks'], correct: 'concrete' },
      { id: 'r7', text: 'Interacting with nature stimulates positive _____ responses.', options: ['chemical', 'emotional', 'social', 'cognitive'], correct: 'emotional' },
      { id: 'r8', text: 'Walking in a park improves short-term _____ capacity.', options: ['physical', 'respiratory', 'cognitive', 'digestive'], correct: 'cognitive' },
      { id: 'r9', text: 'Neighborhood green spaces foster community _____ .', options: ['cohesion', 'wealth', 'conflict', 'isolation'], correct: 'cohesion' },
      { id: 'r10', text: 'Socialization and exercise are correlated with reduced rates of clinical _____ .', options: ['anxiety', 'insomnia', 'depression', 'stress'], correct: 'depression' },
      { id: 'r11', text: 'Urban planners should prioritize the integration of green _____ .', options: ['buildings', 'infrastructure', 'parking', 'monuments'], correct: 'infrastructure' },
      { id: 'r12', text: 'Parks have traditionally been treated by some as aesthetic _____ .', options: ['necessities', 'luxuries', 'interventions', 'sandbox'], correct: 'luxuries' },
      { id: 'r13', text: 'Cortisol is the human _____ hormone.', options: ['sleep', 'stress', 'growth', 'happy'], correct: 'stress' }
    ],
    speakingPrompts: [
      { id: 's1', question: "Do you enjoy spending time in nature?", examinerText: "Hello. Let's talk about the outdoors. Do you enjoy spending time in nature? What activities do you do?" },
      { id: 's2', question: "Are there enough parks in your city?", examinerText: "I see. In your opinion, are there enough parks and green spaces in your city for residents to use?" },
      { id: 's3', question: "How can cities incorporate more nature in their architecture?", examinerText: "Let's explore design. How can modern architectural designs integrate natural elements into dense urban cities?" }
    ],
    writingPrompt: "Some people believe that green spaces in cities are a waste of valuable land. Others argue that parks are essential for city dwellers. Discuss both views and give your opinion.",
    listeningTranscript: "Coordinator: Good morning, and welcome to the Greenway Community Garden orientation. I'm Mark. Today, I'll walk you through our guidelines. The garden is divided into forty individual plots, which are allocated to local residents. The annual registration fee is 15 dollars, which covers water supply and communal tools. We have a strict organic policy, meaning chemical pesticides are completely prohibited. To maintain safety, the garden gates are locked at night. The garden is open daily from 7 AM until 8 PM. Members are expected to spend at least 4 hours a month weeding shared walkways. Our monthly meeting is on the first Saturday at 10 AM, where we share harvest tips and organize maintenance work.",
    listeningQuestions: [
      { id: 'l1', type: 'fillBlank', text: 'The community garden has _____ individual plots.', correctAnswer: 'forty' },
      { id: 'l2', type: 'fillBlank', text: 'The annual registration fee is _____ dollars.', correctAnswer: '15' },
      { id: 'l3', type: 'multipleChoice', text: 'What is strictly prohibited in the garden?', options: ['Pets', 'Chemical pesticides', 'Communal tools', 'Weeding'], correctAnswer: 'Chemical pesticides' },
      { id: 'l4', type: 'fillBlank', text: 'The garden closes daily at _____ PM.', correctAnswer: '8' },
      { id: 'l5', type: 'multipleChoice', text: 'Monthly meetings are held on which day?', options: ['First Friday', 'First Saturday', 'Last Saturday', 'First Sunday'], correctAnswer: 'First Saturday' },
      { id: 'l6', type: 'fillBlank', text: 'Communal tools and _____ supply are covered by the fee.', correctAnswer: 'water' },
      { id: 'l7', type: 'trueFalseNotGiven', text: 'Chemical pesticides are allowed if used sparingly.', correctAnswer: 'False' },
      { id: 'l8', type: 'fillBlank', text: 'Members must spend _____ hours a month weeding shared walkways.', correctAnswer: '4' },
      { id: 'l9', type: 'fillBlank', text: 'Monthly meetings start at _____ AM.', correctAnswer: '10' },
      { id: 'l10', type: 'trueFalseNotGiven', text: 'The orientation is led by Mark.', correctAnswer: 'True' }
    ]
  },
  {
    id_ref: 't5',
    readingPassage: `Preserving Ancient Languages in the Modern Era\n\nA language is not merely a tool for communication; it is a repository of culture, history, and unique cognitive frameworks. However, linguists estimate that of the roughly 7,000 languages spoken worldwide today, more than half will disappear by the end of this century. Globalization, migration, and the dominance of major international languages have accelerated this linguistic extinction.\n\nWhen a language dies, humanity loses invaluable indigenous knowledge, including unique oral histories, philosophical traditions, and taxonomic classifications of local plants and ecosystems. For example, many indigenous communities have highly specialized vocabularies for medicinal plants that have no direct translation in major world languages. Once the language vanishes, this centuries-old pharmacological wisdom is lost forever.\n\nLinguistic revitalization efforts, however, demonstrate that extinction is not inevitable. Through technologies like interactive mobile apps, digital archives, and language immersion schools, endangered communities are actively teaching younger generations their heritage tongues. Government funding and official language policies play a pivotal role in these efforts. Legally recognizing minority languages and funding bilingual school curriculums are critical to giving these threatened languages the social prestige needed to survive in a digital age.`,
    readingQuestions: [
      { id: 'r1', text: 'Linguists estimate that more than _____ of spoken languages will disappear this century.', options: ['10%', '25%', '50%', '90%'], correct: '50%' },
      { id: 'r2', text: 'According to the passage, a language is a repository of:', options: ['Financial data', 'Culture, history, and cognitive frameworks', 'Software code', 'Grammar textbooks exclusively'], correct: 'Culture, history, and cognitive frameworks' },
      { id: 'r3', text: 'What pharmaceutical loss occurs when an indigenous language dies?', options: ['Loss of synthetic formulas', 'Taxonomic classifications of local medicinal plants', 'Medical school textbooks', 'Doctors lose their licenses'], correct: 'Taxonomic classifications of local medicinal plants' },
      { id: 'r4', text: 'Revitalization efforts leverage what modern tools to preserve tongues?', options: ['Printed pamphlets', 'Mobile apps and digital archives', 'Radio broadcasts', 'Strict penalties'], correct: 'Mobile apps and digital archives' },
      { id: 'r5', text: 'What government action is highlighted as critical for revitalization?', options: ['Banning major languages', 'Official recognition and bilingual education funding', 'Immigration restrictions', 'Providing internet access'], correct: 'Official recognition and bilingual education funding' },
      { id: 'r6', text: 'A language is a complex vehicle for culture, history, and _____ thought.', options: ['logical', 'human', 'ancient', 'ecological'], correct: 'human' },
      { id: 'r7', text: 'There are approximately _____ spoken languages in the world today.', options: ['3,000', '5,000', '7,000', '10,000'], correct: '7,000' },
      { id: 'r8', text: 'Linguistic extinction has been accelerated by globalization and _____ .', options: ['technology', 'migration', 'disease', 'education'], correct: 'migration' },
      { id: 'r9', text: 'Taxonomic classifications represent indigenous _____ of local ecosystems.', options: ['histories', 'knowledges', 'classifications', 'preservations'], correct: 'classifications' },
      { id: 'r10', text: 'Many indigenous vocabularies for _____ plants have no direct translations.', options: ['agricultural', 'medicinal', 'wild', 'toxic'], correct: 'medicinal' },
      { id: 'r11', text: 'Immersion _____ are also used to teach heritage tongues to younger generations.', options: ['books', 'apps', 'schools', 'camps'], correct: 'schools' },
      { id: 'r12', text: 'Legally recognizing minority languages gives them social _____ .', options: ['prestige', 'acceptance', 'wealth', 'power'], correct: 'prestige' },
      { id: 'r13', text: 'Revitalization demonstrates that extinction is not _____ .', options: ['avoidable', 'inevitable', 'possible', 'critical'], correct: 'inevitable' }
    ],
    speakingPrompts: [
      { id: 's1', question: "What languages do you speak?", examinerText: "Hello. Let's talk about languages. What languages do you speak, and when do you use them?" },
      { id: 's2', question: "Is it important to preserve regional dialects?", examinerText: "Thank you. Do you think it is important for a country to preserve its regional dialects and minority languages? Why?" },
      { id: 's3', question: "Will English remain the global language in the future?", examinerText: "I see. Do you think English will continue to dominate as the global language, or will another language take over?" }
    ],
    writingPrompt: "Governments should spend money on preserving historical buildings and cultural heritage. Others argue that public funds should be spent on modern services. Discuss both views.",
    listeningTranscript: "Agent: Thank you for calling the Heritage Museum booking office. This is Alan. Guide: Hello. Yes, I'd like to book a group ticket for the ancient scripts exhibition. Agent: Certainly. Guided tours start daily at 10 AM, 1 PM, and 4 PM. Each tour lasts ninety minutes. Guide: Great, the 10 AM slot is perfect. How much are the tickets? Agent: For adults, it is 12 dollars. For students with valid ID, it is 8 dollars. Children under the age of 5 can enter for free. Guide: Perfect. We have ten adults, five students, and two children under 5. Is there a group discount? Agent: Yes! Groups of ten or more adults receive a 10 percent discount on adult tickets. Guide: Brilliant, let's book that.",
    listeningQuestions: [
      { id: 'l1', type: 'fillBlank', text: 'Guided museum tours last _____ minutes.', correctAnswer: 'ninety' },
      { id: 'l2', type: 'multipleChoice', text: 'What time does the group choose for their tour?', options: ['10 AM', '1 PM', '4 PM'], correctAnswer: '10 AM' },
      { id: 'l3', type: 'fillBlank', text: 'The ticket price for students is _____ dollars.', correctAnswer: '8' },
      { id: 'l4', type: 'fillBlank', text: 'Children under the age of _____ enter for free.', correctAnswer: '5' },
      { id: 'l5', type: 'fillBlank', text: 'Groups receive a _____ percent discount on adult tickets.', correctAnswer: '10' },
      { id: 'l6', type: 'fillBlank', text: 'Alan is an agent at the _____ Museum booking office.', correctAnswer: 'Heritage' },
      { id: 'l7', type: 'multipleChoice', text: 'How many guided tours start daily?', options: ['Two', 'Three', 'Four', 'Five'], correctAnswer: 'Three' },
      { id: 'l8', type: 'fillBlank', text: 'Standard adult tickets cost _____ dollars.', correctAnswer: '12' },
      { id: 'l9', type: 'trueFalseNotGiven', text: 'The group consists of 10 adults.', correctAnswer: 'True' },
      { id: 'l10', type: 'trueFalseNotGiven', text: 'Students must show a valid ID to get the discount.', correctAnswer: 'True' }
    ]
  },
  {
    id_ref: 't6',
    readingPassage: `The Science of Sleep and Cognitive Performance\n\nIn our fast-paced modern society, sleep is frequently viewed as a dispensable luxury rather than a physiological necessity. Yet, neurobiological research demonstrates that sleep is a highly active process critical for brain function, memory consolidation, and overall cognitive performance. Chronic sleep deprivation represents a silent epidemic with severe implications for public health.\n\nDuring deep sleep, the brain enters a restorative state, activating the glymphatic system to flush out toxic metabolic waste products that accumulate during waking hours. Deep sleep is also crucial for memory consolidation—the process by which short-term memories from the hippocampus are reorganized and transferred to the neocortex for long-term storage. Without sufficient deep sleep, learning efficiency drops by up to forty percent, making it extremely difficult to acquire and retain new information.\n\nFurthermore, sleep deprivation severely impairs executive functions, which are governed by the prefrontal cortex. This brain region regulates attention, emotional stability, decision-making, and risk assessment. When sleep is restricted, functional connectivity in the prefrontal cortex degrades, leading to erratic mood swings, slower reaction times, and an increased propensity for making highly risky decisions. Therefore, prioritizing sleep hygiene is fundamental for cognitive health.`,
    readingQuestions: [
      { id: 'r1', text: 'Deep sleep is crucial for memory consolidation, which transfers memories from the:', options: ['Neocortex to the cerebellum', 'Hippocampus to the neocortex', 'Frontal lobe to the spinal cord', 'Visual cortex to the hippocampus'], correct: 'Hippocampus to the neocortex' },
      { id: 'r2', text: 'The brain flushes out toxic metabolic waste products by activating the:', options: ['Prefrontal cortex', 'Glymphatic system', 'Hippocampus', 'Endocrine system'], correct: 'Glymphatic system' },
      { id: 'r3', text: 'Without sufficient deep sleep, learning efficiency drops by up to:', options: ['10%', '20%', '40%', '60%'], correct: '40%' },
      { id: 'r4', text: 'What cognitive functions are regulated by the prefrontal cortex?', options: ['Heartbeat and breathing', 'Attention, emotional stability, and decision-making', 'Muscle coordination', 'Auditory processing'], correct: 'Attention, emotional stability, and decision-making' },
      { id: 'r5', text: 'Sleep restriction degrades connectivity in the prefrontal cortex, leading to:', options: ['Improved reaction times', 'Increased learning speed', 'Erratic mood swings and slower reaction times', 'Better risk assessment'], correct: 'Erratic mood swings and slower reaction times' },
      { id: 'r6', text: 'Sleep is frequently viewed as a dispensable _____ rather than a necessity.', options: ['habit', 'routine', 'luxury', 'hobby'], correct: 'luxury' },
      { id: 'r7', text: 'Sleep is critical for memory consolidation and overall _____ performance.', options: ['physical', 'social', 'cognitive', 'athletic'], correct: 'cognitive' },
      { id: 'r8', text: 'Chronic sleep deprivation is described as a _____ epidemic.', options: ['vocal', 'silent', 'minor', 'public'], correct: 'silent' },
      { id: 'r9', text: 'Deep sleep activates the _____ system to clear out brain waste.', options: ['immune', 'lymphatic', 'glymphatic', 'digestive'], correct: 'glymphatic' },
      { id: 'r10', text: 'Memory consolidation moves short-term memories from the _____ .', options: ['amygdala', 'cerebrum', 'neocortex', 'hippocampus'], correct: 'hippocampus' },
      { id: 'r11', text: 'Executive functions are regulated by the _____ cortex.', options: ['visual', 'prefrontal', 'auditory', 'motor'], correct: 'prefrontal' },
      { id: 'r12', text: 'Sleep restriction increases the propensity for making _____ decisions.', options: ['safe', 'risky', 'logical', 'rapid'], correct: 'risky' },
      { id: 'r13', text: 'Prioritizing sleep _____ is fundamental for cognitive health.', options: ['schedule', 'hours', 'hygiene', 'patterns'], correct: 'hygiene' }
    ],
    speakingPrompts: [
      { id: 's1', question: "How many hours of sleep do you get?", examinerText: "Let's discuss sleep. How many hours of sleep do you usually get each night, and do you feel rested?" },
      { id: 's2', question: "Does your mood change when you lack sleep?", examinerText: "Thank you. Do you notice any changes in your concentration or mood when you do not sleep enough?" },
      { id: 's3', question: "Why do modern people sleep less than in the past?", examinerText: "Let's explore lifestyle. In your opinion, why do modern people sleep significantly less than people did in past generations?" }
    ],
    writingPrompt: "Modern lifestyles have made people less healthy and more stressed. What are the main causes, and what solutions can you suggest?",
    listeningTranscript: "Manager: Welcome to the Apex Fitness Center. I'll explain our membership tiers. We have two main levels: Standard and Premium. Standard membership is 40 dollars a month, which gives access to the weight room and cardio deck. Premium membership is 60 dollars a month. This includes everything in Standard, plus unlimited access to our heated indoor pool and sauna. Members must bring their own towels, but lockers are provided free of charge. Premium members can book fitness classes up to 12 hours in advance via our app. The gym is open from 6 AM to 10 PM on weekdays, and 8 AM to 8 PM on weekends.",
    listeningQuestions: [
      { id: 'l1', type: 'multipleChoice', text: 'How much does the Premium membership cost per month?', options: ['40 dollars', '50 dollars', '60 dollars', '80 dollars'], correctAnswer: '60 dollars' },
      { id: 'l2', type: 'fillBlank', text: 'Premium membership includes access to the heated indoor _____ and sauna.', correctAnswer: 'pool' },
      { id: 'l3', type: 'multipleChoice', text: 'What must gym members bring themselves?', options: ['Lockers', 'Towels', 'Cardio keys', 'Communal water'], correctAnswer: 'Towels' },
      { id: 'l4', type: 'fillBlank', text: 'Premium members can book classes _____ hours in advance.', correctAnswer: '12' },
      { id: 'l5', type: 'multipleChoice', text: 'On weekends, Apex Fitness closes at:', options: ['6 AM', '8 PM', '10 PM', 'Midnight'], correctAnswer: '8 PM' },
      { id: 'l6', type: 'fillBlank', text: 'The Standard membership is _____ dollars a month.', correctAnswer: '40' },
      { id: 'l7', type: 'multipleChoice', text: 'Standard membership gives access to:', options: ['Weight room and cardio deck', 'Pool and sauna', 'Fitness classes', 'All areas'], correctAnswer: 'Weight room and cardio deck' },
      { id: 'l8', type: 'trueFalseNotGiven', text: 'Lockers are provided for an additional charge.', correctAnswer: 'False' },
      { id: 'l9', type: 'fillBlank', text: 'On weekdays, the gym opens at _____ AM.', correctAnswer: '6' },
      { id: 'l10', type: 'trueFalseNotGiven', text: 'Premium members can book classes using the gym app.', correctAnswer: 'True' }
    ]
  },
  {
    id_ref: 't7',
    readingPassage: `The Feasibility of Human Colonization of Mars\n\nHuman exploration of space has captured the imagination of generations, but establishing a permanent human colony on Mars presents unprecedented engineering and biological challenges. Unlike Earth, Mars is a hostile desert planet with no breathable atmosphere, extreme temperatures, and no protective magnetic field. Despite these hurdles, private and public space agencies are actively developing technologies for Martian colonization.\n\nOne of the primary physical obstacles is the thin Martian atmosphere, which is ninety-five percent carbon dioxide. This thin blanket offers virtually no protection against solar radiation and cosmic rays, which can cause fatal cancer rates in human pioneers. Additionally, surface temperatures average negative sixty degrees Celsius, requiring highly advanced pressurized habitats equipped with continuous artificial heating and thermal insulation.\n\nTo become self-sustaining, a Martian colony must achieve 'in-situ resource utilization' (ISRU). This refers to the process of extracting essential life-support compounds directly from the Martian environment. For example, pioneers must harvest subsurface ice to generate liquid water, which can then be split via electrolysis to produce breathable oxygen and rocket fuel. While colonization is theoretically possible, it remains a long-term goal that will require massive capital investment and decades of scientific cooperation.`,
    readingQuestions: [
      { id: 'r1', text: 'Martian colonization presents massive engineering and _____ challenges.', options: ['Linguistic', 'Biological', 'Legal', 'Educational'], correct: 'Biological' },
      { id: 'r2', text: 'Mars is a hostile desert planet with no protective _____ field.', options: ['gravitational', 'electrical', 'magnetic', 'solar'], correct: 'magnetic' },
      { id: 'r3', text: 'The thin Martian atmosphere is ninety-five percent _____ .', options: ['oxygen', 'nitrogen', 'carbon dioxide', 'helium'], correct: 'carbon dioxide' },
      { id: 'r4', text: 'What is a major biological risk of solar radiation on Mars?', options: ['Blindness', 'Fatal cancer rates', 'Skin infections', 'Muscle atrophy'], correct: 'Fatal cancer rates' },
      { id: 'r5', text: 'Martian surface temperatures average negative _____ degrees Celsius.', options: ['forty', 'fifty', 'sixty', 'eighty'], correct: 'sixty' },
      { id: 'r6', text: 'Pressurized habitats require continuous artificial _____ and thermal insulation.', options: ['lighting', 'heating', 'ventilation', 'oxygen'], correct: 'heating' },
      { id: 'r7', text: 'Martian colonies must achieve ISRU, which stands for in-situ resource _____ .', options: ['utilization', 'unification', 'union', 'upgrade'], correct: 'utilization' },
      { id: 'r8', text: 'Pioneers must harvest subsurface _____ to generate liquid water.', options: ['minerals', 'ice', 'carbon', 'rocks'], correct: 'ice' },
      { id: 'r9', text: 'Water can be split via _____ to produce breathable oxygen.', options: ['heating', 'freezing', 'electrolysis', 'evaporation'], correct: 'electrolysis' },
      { id: 'r10', text: 'Splitting water also produces _____ fuel.', options: ['nuclear', 'diesel', 'rocket', 'jet'], correct: 'rocket' },
      { id: 'r11', text: 'Martian colonization remains a _____ goal.', options: ['short-term', 'long-term', 'impossible', 'unpopular'], correct: 'long-term' },
      { id: 'r12', text: 'Establishing a colony will require massive capital _____ .', options: ['investment', 'taxation', 'fines', 'loans'], correct: 'investment' },
      { id: 'r13', text: 'It will also require decades of scientific _____ .', options: ['competition', 'funding', 'isolation', 'cooperation'], correct: 'cooperation' }
    ],
    speakingPrompts: [
      { id: 's1', question: "Would you travel to Mars if you had the opportunity?", examinerText: "Hello. Let's discuss space. Would you travel to Mars if you were offered a free ticket? Why or why not?" },
      { id: 's2', question: "Should governments fund space exploration?", examinerText: "Thank you. In your view, should governments prioritize space exploration funding, or should the money go to solving Earth's problems?" },
      { id: 's3', question: "Will space tourism become popular in this century?", examinerText: "Let's talk about commercialization. Do you think commercial space tourism will become accessible to average citizens in this century?" }
    ],
    writingPrompt: "Some people argue that space exploration is a waste of government funding, while others believe it is crucial for humanity's future. Discuss both views.",
    listeningTranscript: "Receptionist: Skyview Planetarium ticketing desk. Agent: Hello. I'd like to book tickets for the upcoming stargazing session. Receptionist: Certainly. The telescope viewing takes place every Friday night starting at 9 PM, weather permitting. Tickets are 15 dollars for adults and 8 dollars for students with ID. We also have a family pass for 35 dollars, which covers two adults and up to three children. Tickets must be purchased online, as we have a strict limit of thirty participants per session to ensure everyone gets telescope time. Bookings close on Thursday at midnight.",
    listeningQuestions: [
      { id: 'l1', type: 'multipleChoice', text: 'Which night does the stargazing session take place?', options: ['Wednesday', 'Thursday', 'Friday', 'Saturday'], correctAnswer: 'Friday' },
      { id: 'l2', type: 'fillBlank', text: 'The stargazing session starts at _____ PM.', correctAnswer: '9' },
      { id: 'l3', type: 'fillBlank', text: 'The ticket price for students is _____ dollars.', correctAnswer: '8' },
      { id: 'l4', type: 'fillBlank', text: 'The maximum number of participants per session is _____ people.', correctAnswer: 'thirty' },
      { id: 'l5', type: 'multipleChoice', text: 'When do ticket bookings close?', options: ['Wednesday night', 'Thursday midnight', 'Friday noon', 'Friday at 9 PM'], correctAnswer: 'Thursday midnight' },
      { id: 'l6', type: 'fillBlank', text: 'The telescope viewing is dependent on the _____ .', correctAnswer: 'weather' },
      { id: 'l7', type: 'fillBlank', text: 'Adult tickets cost _____ dollars.', correctAnswer: '15' },
      { id: 'l8', type: 'multipleChoice', text: 'How much does the family pass cost?', options: ['25 dollars', '30 dollars', '35 dollars', '40 dollars'], correctAnswer: '35 dollars' },
      { id: 'l9', type: 'fillBlank', text: 'The family pass covers two adults and up to _____ children.', correctAnswer: 'three' },
      { id: 'l10', type: 'trueFalseNotGiven', text: 'Tickets can be purchased at the gate on Friday night.', correctAnswer: 'False' }
    ]
  },
  {
    id_ref: 't8',
    readingPassage: `The Rise of Social Media Influencers and Modern Consumerism\n\nTraditional advertising is facing a structural crisis. Today's consumers, particularly younger generations, actively block banner ads and view commercial television commercials with deep skepticism. In their place, social media influencers—individuals who build massive, dedicated followings on platforms like Instagram and YouTube—have emerged as the new gatekeepers of modern consumerism.\n\nThe effectiveness of influencer marketing is rooted in psychology, specifically 'parasocial interaction.' This term describes a one-sided relationship where a media consumer feels a deep, personal connection with a media creator. Influencers cultivate this bond by sharing intimate details of their daily routines, responding to comments, and broadcasting in informal settings. Consequently, when an influencer recommends a product, their followers perceive it not as a paid corporate endorsement, but as a sincere recommendation from a trusted friend.\n\nHowever, this model is not without ethical controversies. Many influencers fail to clearly disclose sponsored sponsorships, violating consumer protection regulations. Furthermore, the constant promotion of curated, idealized lifestyles fuels anxiety and materialism among vulnerable young audiences. The pressure to buy expensive products to mimic an influencer's lifestyle can lead to severe debt. Thus, while influencer marketing is highly effective, it requires stricter regulatory oversight to protect consumers.`,
    readingQuestions: [
      { id: 'r1', text: 'Influencer marketing success is psychologically rooted in what concept?', options: ['Parasocial interaction', 'Classical conditioning', 'Subliminal advertising', 'Cognitive dissonance'], correct: 'Parasocial interaction' },
      { id: 'r2', text: 'Parasocial interaction describes a connection that is:', options: ['Two-sided and professional', 'One-sided and personal', 'Purely commercial and cold', 'Highly hostile'], correct: 'One-sided and personal' },
      { id: 'r3', text: 'Traditional advertising is facing a crisis because consumers:', options: ['Spend less money', 'Active block ads and view commercials with skepticism', 'Prefer reading print magazines', 'Buy products only in physical stores'], correct: 'Active block ads and view commercials with skepticism' },
      { id: 'r4', text: 'What is an ethical controversy associated with social media influencers?', options: ['They never recommend products', 'They fail to disclose sponsored sponsorships clearly', 'They work for free', 'They avoid Platform updates'], correct: 'They fail to disclose sponsored sponsorships clearly' },
      { id: 'r5', text: 'The constant promotion of curated lifestyles can lead to what issue among youth?', options: ['High mathematical skills', 'Improved physical health', 'Anxiety and materialism', 'High savings rates'], correct: 'Anxiety and materialism' },
      { id: 'r6', text: 'Social media influencers build massive followings on platforms like _____ and YouTube.', options: ['TikTok', 'Instagram', 'Twitter', 'Facebook'], correct: 'Instagram' },
      { id: 'r7', text: 'Influencers are described as the new _____ of modern consumerism.', options: ['manufacturers', 'gatekeepers', 'marketers', 'regulators'], correct: 'gatekeepers' },
      { id: 'r8', text: 'Parasocial interactions describe a _____ relationship.', options: ['two-way', 'mutual', 'one-sided', 'business'], correct: 'one-sided' },
      { id: 'r9', text: 'Influencers share _____ details of their daily routines to build a bond.', options: ['vague', 'intimate', 'commercial', 'scripted'], correct: 'intimate' },
      { id: 'r10', text: 'Followers perceive recommendations as coming from a trusted _____ .', options: ['corporation', 'friend', 'actor', 'expert'], correct: 'friend' },
      { id: 'r11', text: 'Failing to disclose sponsorships violates _____ protection regulations.', options: ['corporate', 'consumer', 'environmental', 'digital'], correct: 'consumer' },
      { id: 'r12', text: 'Curated lifestyles promote anxiety and _____ among young audiences.', options: ['materialism', 'literacy', 'happiness', 'socialization'], correct: 'materialism' },
      { id: 'r13', text: 'Stricter regulatory _____ is required to protect consumers.', options: ['oversight', 'penalties', 'funding', 'ban'], correct: 'oversight' }
    ],
    speakingPrompts: [
      { id: 's1', question: "Which social media apps do you use?", examinerText: "Hello. Let's discuss technology. Which social media platforms do you use regularly, and what do you do on them?" },
      { id: 's2', question: "Do you trust recommendations from influencers?", examinerText: "Thank you. Do you ever buy products based on what online influencers or content creators recommend? Why or why not?" },
      { id: 's3', question: "How does advertising affect society?", examinerText: "Let's move to a broader topic. How does the constant exposure to advertising influence the values and behaviors of modern society?" }
    ],
    writingPrompt: "The growing influence of advertisements on people is negative, as it encourages materialism and debt. To what extent do you agree or disagree?",
    listeningTranscript: "Agent: AdStream Podcast Agency, this is Linda. Client: Hi, I'm calling to inquire about advertising rates on your network. Agent: Of course. For our top-tier business podcasts, the advertising rate is 25 dollars per thousand impressions, which we call the CPM. Client: Okay, and what is the minimum duration for a campaign? Agent: The minimum campaign duration is three months to ensure audience familiarity and traction. We also require a minimum budget of 500 dollars a month. Client: I see. And do you write the ad script, or do we? Agent: We offer both. We can read a client-submitted script for free, or our professional copywriters can draft a custom script for a one-time fee of 100 dollars. Client: Great, that sounds reasonable.",
    listeningQuestions: [
      { id: 'l1', type: 'fillBlank', text: 'The podcast advertising rate is _____ dollars per thousand impressions.', correctAnswer: '25' },
      { id: 'l2', type: 'fillBlank', text: 'The minimum campaign duration is _____ months.', correctAnswer: 'three' },
      { id: 'l3', type: 'fillBlank', text: 'The minimum monthly budget is _____ dollars.', correctAnswer: '500' },
      { id: 'l4', type: 'multipleChoice', text: 'What is the fee for a custom-written ad script?', options: ['Free', '50 dollars', '100 dollars', '250 dollars'], correctAnswer: '100 dollars' },
      { id: 'l5', type: 'multipleChoice', text: ' Linda is an agent representing which company?', options: ['Apex Fitness', 'Heritage Museum', 'AdStream Podcast Agency', 'Grand Hotel'], correctAnswer: 'AdStream Podcast Agency' },
      { id: 'l6', type: 'fillBlank', text: 'Linda works at _____ Podcast Agency.', correctAnswer: 'AdStream' },
      { id: 'l7', type: 'fillBlank', text: 'The advertising rate is also called the _____ .', correctAnswer: 'CPM' },
      { id: 'l8', type: 'trueFalseNotGiven', text: 'Campaign duration must be at least three months.', correctAnswer: 'True' },
      { id: 'l9', type: 'trueFalseNotGiven', text: 'AdStream can read a client-submitted script for no extra charge.', correctAnswer: 'True' },
      { id: 'l10', type: 'fillBlank', text: 'Professional copywriters charge a one-time fee of _____ dollars.', correctAnswer: '100' }
    ]
  },
  {
    id_ref: 't9',
    readingPassage: `The Future of Public Transport: Hyperloops and Autonomous Vehicles\n\nUrban congestion represents a chronic economic drain on modern metropolitan centers, costing billions in lost productivity and fuel waste annually. Standard solutions, such as expanding highways, are increasingly viewed as outdated interventions. Instead, transport engineers are developing futuristic, high-tech alternatives: Hyperloops and autonomous vehicle networks.\n\nA Hyperloop is a high-speed transit system operating inside low-pressure vacuum tubes. By removing atmospheric drag and utilizing magnetic levitation, Hyperloop pods can theoretically travel at speeds exceeding one thousand kilometers per hour. This technology would effectively collapse transit times, connecting distant cities in minutes and offering a carbon-neutral alternative to domestic flights.\n\nConcurrently, autonomous vehicles (AVs) represent a massive shift in urban transit. AVs leverage artificial intelligence, lidar, and real-time sensor processing to navigate complex streets without human drivers. When organized into a coordinated public ride-sharing network, AVs could dramatically reduce private car ownership. By eliminating human driver errors, which are responsible for ninety percent of traffic accidents, AVs could save millions of lives. However, regulatory, ethical, and infrastructure obstacles must be resolved before these systems are widely adopted.`,
    readingQuestions: [
      { id: 'r1', text: 'A Hyperloop system operates inside what environment?', options: ['Underwater tunnels', 'Low-pressure vacuum tubes', 'High-altitude flight corridors', 'Elevated concrete monorails'], correct: 'Low-pressure vacuum tubes' },
      { id: 'r2', text: 'Hyperloop pods avoid physical friction and drag by using:', options: ['Pneumatic pressure', 'Magnetic levitation', 'Diesel turbines', 'Steam engines'], correct: 'Magnetic levitation' },
      { id: 'r3', text: 'Human errors are responsible for what percentage of traffic accidents?', options: ['10%', '50%', '75%', '90%'], correct: '90%' },
      { id: 'r4', text: 'Coordinated autonomous vehicle networks could drastically reduce:', options: ['Public transport funding', 'Private car ownership', 'Pedestrian lanes', 'GPS accuracy'], correct: 'Private car ownership' },
      { id: 'r5', text: 'Standard road expansion projects are increasingly viewed by engineers as:', options: ['Highly innovative', 'Outdated interventions', 'Zero-cost solutions', 'The only viable option'], correct: 'Outdated interventions' },
      { id: 'r6', text: 'Urban congestion represents a chronic _____ drain.', options: ['traffic', 'social', 'economic', 'resource'], correct: 'economic' },
      { id: 'r7', text: 'Hyperloop pods can travel at speeds exceeding _____ kilometers per hour.', options: ['five hundred', 'eight hundred', 'one thousand', 'two thousand'], correct: 'one thousand' },
      { id: 'r8', text: 'Magnetic levitation removes physical _____ .', options: ['drag', 'friction', 'levitation', 'pressure'], correct: 'friction' },
      { id: 'r9', text: 'Hyperloops offer a carbon-neutral alternative to domestic _____ .', options: ['trains', 'cars', 'flights', 'buses'], correct: 'flights' },
      { id: 'r10', text: 'AV stands for _____ vehicles.', options: ['alternative', 'automatic', 'autonomous', 'atmospheric'], correct: 'autonomous' },
      { id: 'r11', text: 'AVs leverage artificial intelligence, _____ , and sensors.', options: ['sonar', 'lidar', 'radar', 'gps'], correct: 'lidar' },
      { id: 'r12', text: 'Coordinated AV networks could reduce private car _____ .', options: ['prices', 'speed', 'accidents', 'ownership'], correct: 'ownership' },
      { id: 'r13', text: 'Human driver errors are responsible for _____ percent of traffic accidents.', options: ['fifty', 'seventy-five', 'ninety', 'ninety-five'], correct: 'ninety' }
    ],
    speakingPrompts: [
      { id: 's1', question: "How do you commute to work or study?", examinerText: "Hello. Let's discuss travel. How do you commute to work or university, and how long does it take?" },
      { id: 's2', question: "Should cities make public transport free?", examinerText: "Thank you. Do you think major cities should offer free public transport to all residents? Why?" },
      { id: 's3', question: "Will self-driving cars be safe in the future?", examinerText: "Let's explore safety. In your opinion, will fully autonomous, self-driving cars eventually be safer than human-driven cars?" }
    ],
    writingPrompt: "Car-free zones should be established in all major city centers. Discuss the advantages and disadvantages of this proposal.",
    listeningTranscript: "Clerk: Transit booking office, this is Gary. Passenger: Hi, I need to cancel my train ticket to Edinburgh and get a refund. Clerk: Certainly. If you cancel more than 48 hours in advance, you receive a full refund. However, since your trip is tomorrow, we must charge a 10 percent cancellation fee. Passenger: That's fine, I understand. Clerk: The refund will be credited back to your original payment card. It usually takes five business days to clear in your account. Can I get your ticket reference number? Passenger: Yes, it is ED-904-B. Clerk: Great, let me process that cancellation for you.",
    listeningQuestions: [
      { id: 'l1', type: 'multipleChoice', text: 'Who is Gary representing?', options: ['Airport check-in', 'Transit booking office', 'Hotel booking', 'Gym office'], correctAnswer: 'Transit booking office' },
      { id: 'l2', type: 'fillBlank', text: 'Because the passenger is cancelling late, a _____ percent fee is charged.', correctAnswer: '10' },
      { id: 'l3', type: 'fillBlank', text: 'The refund will appear in the passenger\'s account in _____ business days.', correctAnswer: 'five' },
      { id: 'l4', type: 'multipleChoice', text: 'What is the passenger\'s destination?', options: ['London', 'Grand Hotel', 'Edinburgh', 'Greenway Garden'], correctAnswer: 'Edinburgh' },
      { id: 'l5', type: 'fillBlank', text: 'The ticket reference number starts with the letters _____.', correctAnswer: 'ED' },
      { id: 'l6', type: 'fillBlank', text: 'Gary is a clerk at the _____ booking office.', correctAnswer: 'Transit' },
      { id: 'l7', type: 'trueFalseNotGiven', text: 'A full refund requires cancellation more than 48 hours in advance.', correctAnswer: 'True' },
      { id: 'l8', type: 'trueFalseNotGiven', text: 'The passenger is travelling next week.', correctAnswer: 'False' },
      { id: 'l9', type: 'fillBlank', text: 'The full reference number is ED-_____ -B.', correctAnswer: '904' },
      { id: 'l10', type: 'multipleChoice', text: 'Refund is credited to the original:', options: ['Payment card', 'Bank account', 'PayPal', 'Cash receipt'], correctAnswer: 'Payment card' }
    ]
  },
  {
    id_ref: 't10',
    readingPassage: `The Psychology of Color in Marketing and Design\n\nColor is not merely a visual stimulus; it is a powerful communication channel that triggers subconscious psychological responses, shapes emotional states, and influences human behavior. In marketing and product design, color choices are highly calculated decisions engineered to establish brand identity, establish emotional connections, and drive purchasing choices.\n\nFor example, red is a high-wavelength color that physically stimulates human physiology, increasing heart rates and creating a sense of urgency. Because of this physiological activation, retailers frequently utilize red for clearance sales and calls-to-action to stimulate impulse buying. Conversely, blue is a color that triggers feelings of safety, stability, and professionalism. The color stimulates the production of calming hormones, which explains why blue is highly dominant in the corporate logos of financial institutions, tech companies, and healthcare providers.\n\nHowever, color psychology is not universal. While some color associations are rooted in biological triggers, many emotional responses are highly subjective, shaped by cultural context and shared histories. For instance, while white symbolizes purity and wedding ceremonies in Western cultures, it represents mourning and funerals in many Asian cultures. Therefore, designers must carefully analyze their target demographics to avoid costly cultural miscommunications.`,
    readingQuestions: [
      { id: 'r1', text: 'Red is commonly used in clearance sales because it evokes:', options: ['Boredom and tiredness', 'Urgency and excitement', 'Trust and calm', 'Melancholy'], correct: 'Urgency and excitement' },
      { id: 'r2', text: 'Blue is dominant in banking and corporate logos because it triggers feelings of:', options: ['Anger and alarm', 'Safety, stability, and professionalism', 'Hunger', 'Spontaneity'], correct: 'Safety, stability, and professionalism' },
      { id: 'r3', text: 'A biological effect of viewing the color red is:', options: ['Slowing down breathing', 'Increasing heart rates', 'Lowering body temperature', 'Inducing deep sleep'], correct: 'Increasing heart rates' },
      { id: 'r4', text: 'While white represents purity in Western cultures, in many Asian cultures it represents:', options: ['Wealth', 'Mourning and funerals', 'Good luck', 'Harvest seasons'], correct: 'Mourning and funerals' },
      { id: 'r5', text: 'The author warns that color psychology is highly subjective and shaped by:', options: ['Age limits', 'Cultural context and shared histories', 'Income levels', 'Language grammar'], correct: 'Cultural context and shared histories' },
      { id: 'r6', text: 'Color choices are highly calculated decisions engineered to establish brand _____ .', options: ['funding', 'identity', 'loyalty', 'monopoly'], correct: 'identity' },
      { id: 'r7', text: 'Red is described as a _____ color.', options: ['low-wavelength', 'high-wavelength', 'calming', 'neutral'], correct: 'high-wavelength' },
      { id: 'r8', text: 'Clearance sales use red to stimulate _____ buying.', options: ['delayed', 'impulse', 'bulk', 'rational'], correct: 'impulse' },
      { id: 'r9', text: 'Blue triggers feelings of safety, _____ , and professionalism.', options: ['urgency', 'stability', 'excitation', 'sadness'], correct: 'stability' },
      { id: 'r10', text: 'Blue stimulates the production of _____ hormones.', options: ['calming', 'stress', 'adrenaline', 'growth'], correct: 'calming' },
      { id: 'r11', text: 'Some color associations are rooted in _____ triggers.', options: ['logical', 'biological', 'social', 'accidental'], correct: 'biological' },
      { id: 'r12', text: 'White symbolizes _____ and wedding ceremonies in Western cultures.', options: ['mourning', 'purity', 'celebration', 'poverty'], correct: 'purity' },
      { id: 'r13', text: 'Designers must carefully analyze their target _____ to avoid miscommunication.', options: ['countries', 'demographics', 'sales', 'ages'], correct: 'demographics' }
    ],
    speakingPrompts: [
      { id: 's1', question: "What is your favorite color?", examinerText: "Hello. Let's discuss design. What is your absolute favorite color, and does it influence the items you purchase?" },
      { id: 's2', question: "Do you think color matters in office design?", examinerText: "Thank you. Do you think the paint colors in an office environment can influence the productivity or stress of workers? Why?" },
      { id: 's3', question: "How does color affect branding?", examinerText: "Let's explore advertising. How do companies strategically choose brand colors to manipulate how consumers feel about their products?" }
    ],
    writingPrompt: "Art and music should be compulsory subjects in school curricula. Others believe they are a waste of educational time. Discuss both views.",
    listeningTranscript: "Instructor: Good morning, and welcome to our creative acrylic painting workshop. I'm Diana. Today, we will learn color blending techniques. The workshop fee is 25 dollars, which covers canvas and acrylic paint supplies. However, participants are required to bring their own brushes. We recommend synthetic flat brushes. The session will run for three hours, starting at 1 PM. The workshop is held on the first Saturday of every month. Since seats are capped at twelve participants, you must register and pay at least two days in advance. Let's begin by selecting our color palettes.",
    listeningQuestions: [
      { id: 'l1', type: 'multipleChoice', text: 'Who is Diana representing?', options: ['Apex Fitness', 'Heritage Museum', 'Creative Painting Workshop', 'Apex Transit'], correctAnswer: 'Creative Painting Workshop' },
      { id: 'l2', type: 'fillBlank', text: 'The painting workshop fee is _____ dollars.', correctAnswer: '25' },
      { id: 'l3', type: 'multipleChoice', text: 'What are participants required to bring themselves?', options: ['Canvas', 'Acrylic paint', 'Brushes', 'Color palettes'], correctAnswer: 'Brushes' },
      { id: 'l4', type: 'fillBlank', text: 'The acrylic painting workshop lasts for _____ hours.', correctAnswer: 'three' },
      { id: 'l5', type: 'fillBlank', text: 'The workshop is held on the _____ Saturday of the month.', correctAnswer: 'first' },
      { id: 'l6', type: 'fillBlank', text: 'Diana welcomes participants to the creative _____ painting workshop.', correctAnswer: 'acrylic' },
      { id: 'l7', type: 'multipleChoice', text: 'Which brushes are recommended?', options: ['Natural round', 'Synthetic flat', 'Large rollers', 'Fine details'], correctAnswer: 'Synthetic flat' },
      { id: 'l8', type: 'fillBlank', text: 'The workshop session starts at _____ PM.', correctAnswer: '1' },
      { id: 'l9', type: 'fillBlank', text: 'The workshop capacity is capped at _____ participants.', correctAnswer: 'twelve' },
      { id: 'l10', type: 'trueFalseNotGiven', text: 'Registration and payment are required two days in advance.', correctAnswer: 'True' }
    ]
  }
];

const distinctWritingPrompts = [
  {
    taskType: 2,
    prompt: "Discuss the impact of climate change on coastal cities and propose practical solutions for urban planners.",
    desc: "Discuss the impact of climate change on coastal cities and propose solutions.",
    color: "from-accent-bright to-pink-400"
  },
  {
    taskType: 1,
    prompt: "The bar chart below shows the average weekly energy consumption by household type in five different countries (UK, USA, Germany, Japan, Brazil) in 2022. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
    desc: "Describe a bar chart comparing energy consumption in five countries.",
    color: "from-accent to-blue-500",
    image: "/tasks/energy_bar_chart.png"
  },
  {
    taskType: 2,
    prompt: "Some people believe that Artificial Intelligence will replace human teachers in the near future. Others argue that AI can never fully replicate the emotional support and guidance a human teacher provides. Discuss both views and give your opinion.",
    desc: "Discuss views on technology replacing human teachers and give your opinion.",
    color: "from-accent-bright to-pink-400"
  },
  {
    taskType: 1,
    prompt: "The line graph shows global population growth trends and projections in three different country income groups (high, middle, low) from 1990 to 2050. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
    desc: "Analyze a line graph showing global population trends.",
    color: "from-blue-500 to-cyan-500",
    image: "/tasks/population_line_graph.png"
  },
  {
    taskType: 2,
    prompt: "In many modern workplaces, remote working is becoming the standard. Discuss the advantages and disadvantages of this trend for both employers and employees, and suggest which group benefits more.",
    desc: "Discuss the pros and cons of remote work for both employers and employees.",
    color: "from-accent-bright to-pink-400"
  },
  {
    taskType: 1,
    prompt: "The pie charts compare the average household expenditure across different categories (Food, Housing, Transport, Education, Leisure) in a particular European nation in 2008 and 2018. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
    desc: "Compare household expenditure categories using pie charts.",
    color: "from-cyan-500 to-teal-500",
    image: "/tasks/expenditure_pie_chart.png"
  },
  {
    taskType: 2,
    prompt: "Rising obesity rates worldwide are putting a massive strain on public healthcare systems. Some people believe that governments should tax unhealthy foods to curb this issue, while others argue it is an individual responsibility. Discuss both views.",
    desc: "Discuss whether governments should tax unhealthy foods to curb obesity.",
    color: "from-accent-bright to-pink-400"
  },
  {
    taskType: 1,
    prompt: "The diagram below illustrates the multi-stage industrial process of recycling plastic bottles for secondary consumer use. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
    desc: "Describe the industrial plastic bottle recycling process flow chart.",
    color: "from-teal-500 to-emerald-500",
    image: "/tasks/recycling_process.png"
  },
  {
    taskType: 2,
    prompt: "Governments should spend more money on supporting arts and cultural events rather than on professional sports. To what extent do you agree or disagree with this statement?",
    desc: "Argue whether government spending should prioritize arts/culture over sports.",
    color: "from-accent-bright to-pink-400"
  },
  {
    taskType: 1,
    prompt: "The table shows the average weekly hours spent on domestic chores by gender in three different household types (Single Parent, Dual Income, Retired). Summarize the information by selecting and reporting the main features.",
    desc: "Summarize a table of domestic chores hours by gender and household type.",
    color: "from-blue-500 to-indigo-500",
    image: null
  },
  {
    taskType: 2,
    prompt: "The best way to solve environmental problems is to increase the price of fuel for cars and airplanes. To what extent do you agree or disagree with this proposal?",
    desc: "Argue whether increasing fuel prices is the best way to solve environmental issues.",
    color: "from-accent-bright to-pink-400"
  },
  {
    taskType: 1,
    prompt: "The maps show changes to a regional town and park layout between 2000 and 2020, showing the additions of a cafe, bicycle path, and playground. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
    desc: "Compare town and park maps showing developments over a 20-year period.",
    color: "from-cyan-500 to-teal-500",
    image: "/tasks/town_map.png"
  },
  {
    taskType: 2,
    prompt: "In some countries, young people are highly encouraged to take a gap year between finishing high school and starting university. Discuss the pros and cons of this practice for students.",
    desc: "Discuss the pros and cons of taking a gap year before university.",
    color: "from-accent-bright to-pink-400"
  },
  {
    taskType: 1,
    prompt: "The bar chart below shows the average weekly energy consumption by household type in five different countries in 2022. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
    desc: "Describe a bar chart comparing energy consumption in five countries.",
    color: "from-accent to-blue-500",
    image: "/tasks/energy_bar_chart.png"
  },
  {
    taskType: 2,
    prompt: "Success in life depends heavily on hard work and determination, while others feel that factors like money and personal connections are more important. Discuss both views and give your opinion.",
    desc: "Discuss views on whether success in life depends on hard work or wealth/connections.",
    color: "from-accent-bright to-pink-400"
  }
];

const distinctSpeakingPrompts = [
  {
    part: 1,
    desc: "Answer simple questions about your daily routine, sleep patterns, and how you manage your time.",
    topic: "Daily Routine",
    color: "from-violet-500 to-accent-bright"
  },
  {
    part: 2,
    desc: "Describe a memorable journey you took. You should say where you went, how you traveled, who was with you, and explain why it was memorable.",
    topic: "A Memorable Journey",
    color: "from-violet-500 to-accent-bright"
  },
  {
    part: 1,
    desc: "Talk about your hometown, what you like about it, and how you spend your leisure time.",
    topic: "Hometown & Hobbies",
    color: "from-violet-500 to-accent-bright"
  },
  {
    part: 3,
    desc: "Discuss the social impacts of modern communication technology, screen time, and face-to-face interactions.",
    topic: "Modern Technology",
    color: "from-violet-500 to-accent-bright"
  },
  {
    part: 1,
    desc: "Talk about your favorite meals, traditional food in your country, and whether you prefer home-cooked food or restaurants.",
    topic: "Food & Dining",
    color: "from-violet-500 to-accent-bright"
  },
  {
    part: 2,
    desc: "Describe a person who has had a major influence on your life. Say who they are, how you know them, and why they inspire you.",
    topic: "A Person Who Inspires You",
    color: "from-violet-500 to-accent-bright"
  },
  {
    part: 3,
    desc: "Discuss what makes a good leader, the role of public figures, and whether children should have famous role models.",
    topic: "Leadership & Role Models",
    color: "from-violet-500 to-accent-bright"
  },
  {
    part: 1,
    desc: "Discuss your current living situation, your house or apartment, and what your dream home would look like.",
    topic: "Accommodation",
    color: "from-violet-500 to-accent-bright"
  },
  {
    part: 2,
    desc: "Describe a book or movie that had a significant impact on you. Explain the plot briefly and why it affected you.",
    topic: "A Book or Movie",
    color: "from-violet-500 to-accent-bright"
  },
  {
    part: 3,
    desc: "Discuss the future of physical books, how streaming services have changed cinema, and the role of reading in children's education.",
    topic: "Literature & Mass Media",
    color: "from-violet-500 to-accent-bright"
  },
  {
    part: 1,
    desc: "Talk about your favorite travel destinations, how often you travel, and the types of holidays you prefer.",
    topic: "Travel & Tourism",
    color: "from-violet-500 to-accent-bright"
  },
  {
    part: 2,
    desc: "Describe a historical monument or place of interest you have visited. Say where it is, what it looks like, and why it is historically significant.",
    topic: "A Historical Place",
    color: "from-violet-500 to-accent-bright"
  },
  {
    part: 3,
    desc: "Discuss the importance of preserving historical buildings, the impact of mass tourism on local cultures, and how history is taught in schools.",
    topic: "Heritage & Tourism",
    color: "from-violet-500 to-accent-bright"
  },
  {
    part: 1,
    desc: "Discuss your favorite weather, the typical climate in your region, and how weather affects your mood and activities.",
    topic: "Weather & Seasons",
    color: "from-violet-500 to-accent-bright"
  },
  {
    part: 2,
    desc: "Describe a challenging goal you set for yourself and successfully achieved. Explain what the goal was, how you achieved it, and how you felt afterward.",
    topic: "A Challenging Goal",
    color: "from-violet-500 to-accent-bright"
  }
];

const seedDatabaseIfEmpty = async () => {
  try {
    const testCount = await TestContent.countDocuments({ type: 'mock_test' });
    console.log('⚡ Reseeding 30 highly distinct, unique IELTS Mock Tests and 30 Practice Tasks...');
    
    await TestContent.deleteMany({ type: 'mock_test' });
    
    const mockTestsToInsert = [];
    for (let i = 1; i <= 30; i++) {
      const templateIndex1 = (i - 1) % testTemplates.length;
      const templateIndex2 = (i) % testTemplates.length;
      const templateIndex3 = (i + 1) % testTemplates.length;

      const p1 = testTemplates[templateIndex1];
      const p2 = testTemplates[templateIndex2];
      const p3 = testTemplates[templateIndex3];
      
      const difficulty = i <= 10 ? 'easy' : (i <= 20 ? 'medium' : 'hard');
      const testTitle = `Mock Test ${i}: ${getTemplateSubject(templateIndex1)} (${difficulty.toUpperCase()})`;
      
      const readingPassages = [
        {
          passageNum: 1,
          title: `Passage 1: ${getTemplateSubject(templateIndex1)}`,
          text: p1.readingPassage,
          questions: p1.readingQuestions.map((q, idx) => ({
            id: `test${i}_p1_q${idx + 1}`,
            text: q.text,
            options: q.options || ["A", "B", "C", "D"],
            correct: q.correct || q.correctAnswer
          }))
        },
        {
          passageNum: 2,
          title: `Passage 2: ${getTemplateSubject(templateIndex2)}`,
          text: p2.readingPassage,
          questions: p2.readingQuestions.map((q, idx) => ({
            id: `test${i}_p2_q${idx + 1}`,
            text: q.text,
            options: q.options || ["A", "B", "C", "D"],
            correct: q.correct || q.correctAnswer
          }))
        },
        {
          passageNum: 3,
          title: `Passage 3: ${getTemplateSubject(templateIndex3)}`,
          text: p3.readingPassage,
          questions: [
            ...p3.readingQuestions.map((q, idx) => ({
              id: `test${i}_p3_q${idx + 1}`,
              text: q.text,
              options: q.options || ["A", "B", "C", "D"],
              correct: q.correct || q.correctAnswer
            })),
            {
              id: `test${i}_p3_q14`,
              text: "Establishing standard testing limits ensures a rigorous baseline estimate of student scores.",
              options: ["True", "False", "Not Given"],
              correct: "True"
            }
          ]
        }
      ];

      const listeningParts = [
        {
          part: 1,
          title: `Part 1: Conversation (${getTemplateSubject(templateIndex1)})`,
          type: 'Conversation',
          transcript: p1.listeningTranscript,
          questions: p1.listeningQuestions.map((l, idx) => ({
            id: `test${i}_l_p1_q${idx + 1}`,
            type: l.type === 'multipleChoice' || l.type === 'mcq' ? 'mcq' : l.type === 'trueFalseNotGiven' ? 'trueFalseNotGiven' : 'fillBlank',
            text: l.text,
            options: l.options || ["True", "False", "Not Given"],
            correctAnswer: l.correctAnswer || l.correct
          }))
        },
        {
          part: 2,
          title: `Part 2: Monologue (${getTemplateSubject(templateIndex2)})`,
          type: 'Monologue',
          transcript: p2.listeningTranscript,
          questions: p2.listeningQuestions.map((l, idx) => ({
            id: `test${i}_l_p2_q${idx + 1}`,
            type: l.type === 'multipleChoice' || l.type === 'mcq' ? 'mcq' : l.type === 'trueFalseNotGiven' ? 'trueFalseNotGiven' : 'fillBlank',
            text: l.text,
            options: l.options || ["True", "False", "Not Given"],
            correctAnswer: l.correctAnswer || l.correct
          }))
        },
        {
          part: 3,
          title: `Part 3: Academic Discussion (${getTemplateSubject(templateIndex3)})`,
          type: 'Academic Discussion',
          transcript: p3.listeningTranscript,
          questions: p3.listeningQuestions.map((l, idx) => ({
            id: `test${i}_l_p3_q${idx + 1}`,
            type: l.type === 'multipleChoice' || l.type === 'mcq' ? 'mcq' : l.type === 'trueFalseNotGiven' ? 'trueFalseNotGiven' : 'fillBlank',
            text: l.text,
            options: l.options || ["True", "False", "Not Given"],
            correctAnswer: l.correctAnswer || l.correct
          }))
        },
        {
          part: 4,
          title: `Part 4: Academic Lecture (${getTemplateSubject((i + 2) % testTemplates.length)})`,
          type: 'Academic Lecture',
          transcript: testTemplates[(i + 2) % testTemplates.length].listeningTranscript,
          questions: testTemplates[(i + 2) % testTemplates.length].listeningQuestions.map((l, idx) => ({
            id: `test${i}_l_p4_q${idx + 1}`,
            type: l.type === 'multipleChoice' || l.type === 'mcq' ? 'mcq' : l.type === 'trueFalseNotGiven' ? 'trueFalseNotGiven' : 'fillBlank',
            text: l.text,
            options: l.options || ["True", "False", "Not Given"],
            correctAnswer: l.correctAnswer || l.correct
          }))
        }
      ];

      const writingTasks = [
        {
          taskNum: 1,
          title: "Writing Task 1",
          prompt: "The bar chart shows average weekly energy consumption in five countries in 2022. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
          duration: "20 min",
          expectedWords: "150+"
        },
        {
          taskNum: 2,
          title: "Writing Task 2",
          prompt: p1.writingPrompt,
          duration: "40 min",
          expectedWords: "250+"
        }
      ];

      mockTestsToInsert.push({
        title: testTitle,
        type: 'mock_test',
        subType: 'full',
        difficulty,
        content: {
          readingPassages,
          listeningParts,
          writingTasks,
          speakingPrompts: p1.speakingPrompts.map(s => ({
            ...s,
            id: `test${i}_${s.id}`
          }))
        },
        isActive: true
      });
    }

    await TestContent.insertMany(mockTestsToInsert);
    console.log('✅ Successfully seeded 30 highly distinct IELTS Mock Tests.');

    await TestContent.deleteMany({ type: 'practice_task' });
    const practiceToInsert = [];

    // 1. Seed 50 Reading Practice Tasks
    for (let i = 1; i <= 50; i++) {
      const templateIndex = (i - 1) % testTemplates.length;
      const baseTemplate = testTemplates[templateIndex];
      const difficulty = i <= 15 ? 'easy' : (i <= 35 ? 'medium' : 'hard');
      const subject = getTemplateSubject(templateIndex);
      
      practiceToInsert.push({
        title: `Reading Practice: ${subject} (Set ${i})`,
        type: 'practice_task',
        subType: 'reading',
        difficulty,
        content: {
          title: `${subject} - Passage ${i}`,
          passage: baseTemplate.readingPassage,
          questions: baseTemplate.readingQuestions,
          timeLimit: 20,
          difficulty,
          topic: subject,
          type: i % 2 === 0 ? 'academic' : 'general'
        },
        isActive: true
      });
    }

    // 2. Seed 50 Listening Practice Tasks
    for (let i = 1; i <= 50; i++) {
      const templateIndex = (i - 1) % testTemplates.length;
      const baseTemplate = testTemplates[templateIndex];
      const difficulty = i <= 15 ? 'easy' : (i <= 35 ? 'medium' : 'hard');
      const subject = getTemplateSubject(templateIndex);
      const sectionNum = i % 4 === 0 ? 4 : i % 4;
      
      practiceToInsert.push({
        title: `Listening Section ${sectionNum}: ${subject} (Set ${i})`,
        type: 'practice_task',
        subType: 'listening',
        difficulty,
        content: {
          title: `Section ${sectionNum}: ${subject}`,
          transcript: baseTemplate.listeningTranscript,
          questions: baseTemplate.listeningQuestions,
          section: sectionNum,
          duration: '10 min',
          type: (sectionNum === 1 || sectionNum === 3) ? 'Conversation' : 'Monologue'
        },
        isActive: true
      });
    }

    // 3. Seed 50 Writing Practice Tasks
    for (let i = 1; i <= 50; i++) {
      const taskIndex = (i - 1) % distinctWritingPrompts.length;
      const taskData = distinctWritingPrompts[taskIndex];
      const difficulty = i <= 15 ? 'easy' : (i <= 35 ? 'medium' : 'hard');
      
      practiceToInsert.push({
        title: `Writing Task: ${taskData.desc.split('.')[0]} (Set ${i})`,
        type: 'practice_task',
        subType: 'writing',
        difficulty,
        content: {
          taskType: taskData.taskType,
          prompt: taskData.prompt,
          duration: taskData.taskType === 1 ? '20 min' : '40 min',
          color: taskData.color,
          image: taskData.image || null
        },
        isActive: true
      });
    }

    // 4. Seed 50 Speaking Practice Tasks
    for (let i = 1; i <= 50; i++) {
      const taskIndex = (i - 1) % distinctSpeakingPrompts.length;
      const taskData = distinctSpeakingPrompts[taskIndex];
      const difficulty = i <= 15 ? 'easy' : (i <= 35 ? 'medium' : 'hard');
      
      practiceToInsert.push({
        title: `Speaking Practice: ${taskData.topic} (Set ${i})`,
        type: 'practice_task',
        subType: 'speaking',
        difficulty,
        content: {
          part: taskData.part,
          desc: taskData.desc,
          duration: '4 min',
          color: taskData.color
        },
        isActive: true
      });
    }

    await TestContent.insertMany(practiceToInsert);
    console.log('✅ Successfully seeded 200 dynamic Practice Tasks (50 sets per section).');
  } catch (error) {
    console.error('❌ Failed to run auto-seeding:', error.message);
  }
};

const getTemplateSubject = (index) => {
  const subjects = [
    'AI & Language Acquisition',
    'Cursive Handwriting Art',
    'Economics of Fast Fashion',
    'Urban Parks & Mental Health',
    'Ancient Language Preservation',
    'Science of Deep Sleep',
    'Martian Exploration Physics',
    'Social Media Influencers',
    'Futuristic Transport Networks',
    'Color Psychology in Marketing'
  ];
  return subjects[index] || 'Academic Practice';
};

module.exports = { seedDatabaseIfEmpty };

module.exports = { testTemplates };