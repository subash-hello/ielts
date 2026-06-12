const listeningTests = {
  '1': {
    id: '1',
    title: 'Section 1: Hotel Booking',
    section: 1,
    transcript: "Welcome to the IELTS Listening Test. Section one. Receptionist: Good morning, Grand Hotel. How may I help you today? Guest: Good morning. Yes, I would like to book a double room for three nights, please. Receptionist: Certainly. What is the preferred check-in date? Guest: I would like to check in on the 15th of March. Receptionist: Excellent. A double room is available for those dates. The rate is 120 dollars per night, which includes complimentary high-speed internet. Guest: Perfect, that is within my budget. Does that price include breakfast? Receptionist: Yes, it does. A full continental breakfast is served every morning in our restaurant from 7 to 10 AM. Guest: Wonderful. And where is the hotel located? Is it close to public transport? Receptionist: Yes, we are conveniently located in the city center, right next to the central metro station, making it very easy to get around. Guest: That sounds ideal. Also, is there a fitness center available? Receptionist: Yes, we have a fully equipped fitness center on the fourth floor, open 24 hours a day. Guest: Excellent. And do you offer a late checkout option? Receptionist: Yes, late checkout until 2 PM is available for an additional 30 dollars. Guest: That works for me. Let me also confirm — my name is James Wilson. Receptionist: Perfect, Mr. Wilson. I will book you in immediately. You will receive a confirmation email within 10 minutes. Let's go ahead and book it.",
    questions: [
      { id: 'q1', type: 'fillBlank', text: 'The guest wants to book a room for _____ nights.', correctAnswer: 'three' },
      { id: 'q2', type: 'multipleChoice', text: 'What type of room does the guest prefer?', options: ['Single', 'Double', 'Suite', 'Family'], correctAnswer: 'Double' },
      { id: 'q3', type: 'fillBlank', text: 'The total cost is $_____ per night.', correctAnswer: '120' },
      { id: 'q4', type: 'multipleChoice', text: 'Breakfast is served from:', options: ['6-9 AM', '7-10 AM', '8-11 AM', '9-12 PM'], correctAnswer: '7-10 AM' },
      { id: 'q5', type: 'fillBlank', text: 'The hotel is located near the central _____ station.', correctAnswer: 'metro' },
      { id: 'q6', type: 'fillBlank', text: 'The fitness center is located on the _____ floor.', correctAnswer: 'fourth' },
      { id: 'q7', type: 'multipleChoice', text: 'What are the fitness center opening hours?', options: ['6 AM - 10 PM', '7 AM - 11 PM', '24 hours', '8 AM - 9 PM'], correctAnswer: '24 hours' },
      { id: 'q8', type: 'fillBlank', text: 'Late checkout is available until _____ PM.', correctAnswer: '2' },
      { id: 'q9', type: 'fillBlank', text: 'The additional charge for late checkout is $_____.', correctAnswer: '30' },
      { id: 'q10', type: 'fillBlank', text: "The guest's surname is _____ .", correctAnswer: 'Wilson' }
    ]
  },
  '2': {
    id: '2',
    title: 'Section 2: Campus Library Tour',
    section: 2,
    transcript: "Welcome everyone to the university library. I'm Sarah, your head librarian. Let me give you a quick tour. As you enter, immediately to your right is the circulation desk where you can check out books. Just past that is the reference section, which contains encyclopedias and dictionaries that cannot be removed from the library. If you need quiet study space, the entire second floor is designated as a silent zone. For group work, we have twelve soundproof study pods on the third floor. You must book these pods online at least 24 hours in advance. Our opening hours during term time are 8 AM to midnight, Monday to Friday, and 10 AM to 10 PM on weekends. During exam season, the ground floor remains open 24 hours a day. We also have a printing and scanning room on the basement floor. Printing costs 10 cents per page for black and white, and 25 cents for color. The library also offers free Wi-Fi across all floors — you need to log in using your student ID number. New students should note that the borrowing limit is 10 books at a time, with a loan period of three weeks. Overdue fines are charged at 50 cents per day per book.",
    questions: [
      { id: 'q1', type: 'multipleChoice', text: 'Where is the circulation desk located?', options: ['On the left', 'On the right', 'On the second floor', 'On the third floor'], correctAnswer: 'On the right' },
      { id: 'q2', type: 'trueFalseNotGiven', text: 'Books from the reference section can be taken home.', correctAnswer: 'False' },
      { id: 'q3', type: 'fillBlank', text: 'The _____ floor is designated as a silent zone.', correctAnswer: 'second' },
      { id: 'q4', type: 'fillBlank', text: 'Study pods must be booked _____ hours in advance.', correctAnswer: '24' },
      { id: 'q5', type: 'multipleChoice', text: 'During exam season, which floor is open 24 hours?', options: ['Ground floor', 'Second floor', 'Third floor', 'All floors'], correctAnswer: 'Ground floor' },
      { id: 'q6', type: 'fillBlank', text: 'The printing and scanning room is on the _____ floor.', correctAnswer: 'basement' },
      { id: 'q7', type: 'multipleChoice', text: 'How much does color printing cost per page?', options: ['10 cents', '15 cents', '20 cents', '25 cents'], correctAnswer: '25 cents' },
      { id: 'q8', type: 'fillBlank', text: 'Students log in to Wi-Fi using their _____ number.', correctAnswer: 'student ID' },
      { id: 'q9', type: 'fillBlank', text: 'The maximum number of books a student can borrow at one time is _____ .', correctAnswer: '10' },
      { id: 'q10', type: 'fillBlank', text: 'Overdue fines are charged at _____ cents per day per book.', correctAnswer: '50' }
    ]
  },
  '3': {
    id: '3',
    title: 'Section 3: Biology Project Discussion',
    section: 3,
    transcript: "John: Hi Emma. Have you looked at the guidelines for our biology assignment yet? Emma: Yes, I was just reading them. It looks like we need to choose a specific marine ecosystem and analyze the impact of human activity on it. John: Right. I was thinking we could focus on the Great Barrier Reef. There's so much research available on coral bleaching. Emma: That's true, but it might be too broad. The professor said we should focus on a localized issue. How about mangrove forests in Southeast Asia? John: Oh, that's a brilliant idea! Mangroves are crucial for coastal defense but they're being destroyed for shrimp farming. Emma: Exactly. We need to submit our proposal by Friday. Shall we divide the research? I can look into the ecological importance of the mangroves. John: And I'll research the economic drivers behind the shrimp farming industry. Let's meet at the library on Wednesday afternoon to put it together. Emma: Good plan. The assignment also requires a visual presentation. Should we use slides or a poster? John: I think slides would be better — we can embed graphs and data charts. Emma: Agreed. I'll draft the outline and share it with you by Tuesday morning. John: Perfect. Don't forget — the final submission needs to be at least 3,000 words. Emma: I know. Let's aim for 3,500 to be safe. I'll see you Wednesday.",
    questions: [
      { id: 'q1', type: 'multipleChoice', text: 'What is the topic of their biology assignment?', options: ['Coral bleaching', 'Impact of human activity on a marine ecosystem', 'Shrimp farming in Australia', 'Coastal defense systems'], correctAnswer: 'Impact of human activity on a marine ecosystem' },
      { id: 'q2', type: 'trueFalseNotGiven', text: 'Emma thinks the Great Barrier Reef is too broad a topic.', correctAnswer: 'True' },
      { id: 'q3', type: 'fillBlank', text: 'They decide to focus on _____ forests in Southeast Asia.', correctAnswer: 'mangrove' },
      { id: 'q4', type: 'fillBlank', text: 'John will research the economic drivers behind the _____ farming industry.', correctAnswer: 'shrimp' },
      { id: 'q5', type: 'multipleChoice', text: 'When is their proposal due?', options: ['Wednesday', 'Thursday', 'Friday', 'Next week'], correctAnswer: 'Friday' },
      { id: 'q6', type: 'multipleChoice', text: 'What type of visual presentation will they use?', options: ['Poster', 'Slides', 'Report', 'Infographic'], correctAnswer: 'Slides' },
      { id: 'q7', type: 'fillBlank', text: 'Emma will share the outline with John by _____ morning.', correctAnswer: 'Tuesday' },
      { id: 'q8', type: 'fillBlank', text: 'The final submission must be at least _____ words.', correctAnswer: '3000' },
      { id: 'q9', type: 'fillBlank', text: 'Emma says they should aim for _____ words to be safe.', correctAnswer: '3500' },
      { id: 'q10', type: 'multipleChoice', text: 'What will John include in the slides?', options: ['Photos only', 'Graphs and data charts', 'Tables only', 'Text summaries'], correctAnswer: 'Graphs and data charts' }
    ]
  },
  '4': {
    id: '4',
    title: 'Section 4: Marine Biology Lecture',
    section: 4,
    transcript: "Good morning, everyone. Today's lecture will focus on the fascinating world of deep-sea marine biology, specifically the adaptations of organisms living in the abyssal zone. The abyssal zone lies between 4,000 and 6,000 meters below the surface. In this extreme environment, there is absolutely no sunlight, meaning photosynthesis is impossible. Instead, the food web relies heavily on 'marine snow'—organic detritus falling from the upper layers of the ocean. Organisms here have developed extraordinary adaptations. For instance, many deep-sea fish possess bioluminescence, which they use to attract prey, find mates, or confuse predators in the pitch black. Additionally, due to the immense pressure, which can exceed 600 times that of the surface, these creatures often have gelatinous bodies with very little solid bone structure. The anglerfish is a classic example, featuring a glowing lure extending from its head. Temperature in the abyssal zone remains near freezing — typically between 2 and 4 degrees Celsius — year round. Organisms adapted to these conditions are called extremophiles. Recent research using remotely operated vehicles, or ROVs, has revealed that deep-sea biodiversity is far greater than previously assumed. Scientists estimate that over 90 percent of deep-sea species remain undiscovered. Let's look closer at how bioluminescence is generated chemically...",
    questions: [
      { id: 'q1', type: 'fillBlank', text: 'The abyssal zone lies between 4,000 and _____ meters below the surface.', correctAnswer: '6000' },
      { id: 'q2', type: 'multipleChoice', text: 'What do deep-sea organisms rely on for food instead of photosynthesis?', options: ['Kelp forests', 'Marine snow', 'Thermal vents', 'Plankton'], correctAnswer: 'Marine snow' },
      { id: 'q3', type: 'trueFalseNotGiven', text: 'Bioluminescence is exclusively used to attract mates.', correctAnswer: 'False' },
      { id: 'q4', type: 'fillBlank', text: 'Due to immense pressure, abyssal creatures often have _____ bodies.', correctAnswer: 'gelatinous' },
      { id: 'q5', type: 'multipleChoice', text: 'Which fish uses a glowing lure extending from its head?', options: ['Lanternfish', 'Viperfish', 'Anglerfish', 'Gulper eel'], correctAnswer: 'Anglerfish' },
      { id: 'q6', type: 'fillBlank', text: 'The temperature in the abyssal zone is typically between 2 and _____ degrees Celsius.', correctAnswer: '4' },
      { id: 'q7', type: 'multipleChoice', text: 'What are organisms adapted to extreme conditions called?', options: ['Hydrophiles', 'Extremophiles', 'Thermophiles', 'Halophiles'], correctAnswer: 'Extremophiles' },
      { id: 'q8', type: 'fillBlank', text: 'Scientists use remotely operated _____ (ROVs) to study the deep sea.', correctAnswer: 'vehicles' },
      { id: 'q9', type: 'fillBlank', text: 'Scientists estimate that over _____ percent of deep-sea species remain undiscovered.', correctAnswer: '90' },
      { id: 'q10', type: 'trueFalseNotGiven', text: 'Deep-sea biodiversity is greater than previously assumed according to recent research.', correctAnswer: 'True' }
    ]
  },
  '5': {
    id: '5',
    title: 'Section 1: Travel Agency Booking',
    section: 1,
    transcript: "Welcome to the IELTS Listening Test. Section one. Travel Agent: Good afternoon, Pathways Travel Agency. How can I help you today? Customer: Hello, yes, I'm looking to book a guided holiday tour to New Zealand for my family of four. Travel Agent: Wonderful, New Zealand is an incredible destination! When are you planning to travel? Customer: We are looking at the second week of December. I believe the weather is lovely during that time. Travel Agent: Yes, December is peak summer, so the weather is excellent. We have a 10-day tour called 'South Island Wonders'. It covers Queenstown, Milford Sound, and Christchurch. Customer: That sounds perfect! What does the package cover in terms of accommodations? Travel Agent: It includes stays in four-star luxury hotels, all breakfast buffets, and private coach transport between cities. Customer: Excellent. And what is the price per person? Travel Agent: The standard price is 1500 dollars per adult, but since you are booking for four people, we can offer a 10 percent discount on the total booking. Customer: That is fantastic. Is there a children's discount available? Travel Agent: Yes, children under 12 receive an additional 20 percent off. How old are your children? Customer: They are 8 and 10 years old. Travel Agent: Perfect, they both qualify. We will also need your passport details to secure the booking. Customer: Certainly. Let's proceed.",
    questions: [
      { id: 'q1', type: 'fillBlank', text: 'The customer wants to book a holiday to _____ for their family.', correctAnswer: 'New Zealand' },
      { id: 'q2', type: 'multipleChoice', text: 'When is the customer planning to travel?', options: ['October', 'November', 'December', 'January'], correctAnswer: 'December' },
      { id: 'q3', type: 'fillBlank', text: 'The tour package is called South Island _____ .', correctAnswer: 'Wonders' },
      { id: 'q4', type: 'fillBlank', text: 'The price per adult before the discount is $_____ .', correctAnswer: '1500' },
      { id: 'q5', type: 'multipleChoice', text: 'What discount is offered for booking four people?', options: ['5 percent', '10 percent', '15 percent', '20 percent'], correctAnswer: '10 percent' },
      { id: 'q6', type: 'fillBlank', text: 'Children under _____ receive an additional discount.', correctAnswer: '12' },
      { id: 'q7', type: 'fillBlank', text: "The children's additional discount is _____ percent.", correctAnswer: '20' },
      { id: 'q8', type: 'multipleChoice', text: 'How old are the two children?', options: ['6 and 9', '8 and 10', '10 and 12', '7 and 11'], correctAnswer: '8 and 10' },
      { id: 'q9', type: 'multipleChoice', text: 'What accommodation is included in the package?', options: ['Three-star hotels', 'Hostels', 'Four-star luxury hotels', 'Self-catering apartments'], correctAnswer: 'Four-star luxury hotels' },
      { id: 'q10', type: 'fillBlank', text: 'To secure the booking, the customer must provide their _____ details.', correctAnswer: 'passport' }
    ]
  },
  '6': {
    id: '6',
    title: 'Section 2: Local Museum Guided Tour',
    section: 2,
    transcript: "Good morning, visitors! Welcome to the Royal Natural History Museum. My name is Arthur, and I will be leading your tour today. As you can see, we are standing in the Grand Foyer, built in 1895. To your left is the Dinosaur Hall, where our famous Tyrannosaurus Rex skeleton stands. To your right is the Hall of Human Evolution. We ask that you do not touch any exhibit behind the protective barriers. If you want to take photos, flash photography is strictly prohibited because it can damage sensitive materials. We have a beautiful cafe at the end of the second floor corridor which is famous for its homemade pastries. If you require restrooms, they are located next to the main exit on this floor. The gift shop is located adjacent to the entrance, and you can purchase souvenirs there before leaving. The museum also features a dedicated children's interactive gallery on the lower ground floor. School groups are welcome to book educational workshops — contact our education department at least two weeks in advance. Today's special exhibition is called 'Ice Age Giants' and is located in the West Wing on level two. Admission to this exhibition is included in the general entry ticket.",
    questions: [
      { id: 'q1', type: 'fillBlank', text: 'The Tyrannosaurus Rex skeleton is in the _____ Hall.', correctAnswer: 'Dinosaur' },
      { id: 'q2', type: 'multipleChoice', text: 'What is strictly prohibited inside the museum?', options: ['Mobile phones', 'Talking', 'Flash photography', 'Backpacks'], correctAnswer: 'Flash photography' },
      { id: 'q3', type: 'fillBlank', text: 'The museum cafe is famous for its homemade _____ .', correctAnswer: 'pastries' },
      { id: 'q4', type: 'multipleChoice', text: 'Where are the restrooms located?', options: ['Next to the main exit', 'In the Dinosaur Hall', 'On the second floor', 'Next to the gift shop'], correctAnswer: 'Next to the main exit' },
      { id: 'q5', type: 'trueFalseNotGiven', text: 'Visitors are allowed to touch the exhibits if they are careful.', correctAnswer: 'False' },
      { id: 'q6', type: 'fillBlank', text: "The children's interactive gallery is on the _____ ground floor.", correctAnswer: 'lower' },
      { id: 'q7', type: 'fillBlank', text: 'School groups must book workshops at least _____ weeks in advance.', correctAnswer: 'two' },
      { id: 'q8', type: 'fillBlank', text: "Today's special exhibition is called 'Ice Age _____ '.", correctAnswer: 'Giants' },
      { id: 'q9', type: 'multipleChoice', text: 'Where is the special exhibition located?', options: ['East Wing, level one', 'West Wing, level two', 'Grand Foyer', 'Lower ground floor'], correctAnswer: 'West Wing, level two' },
      { id: 'q10', type: 'trueFalseNotGiven', text: 'The special exhibition requires a separate admission ticket.', correctAnswer: 'False' }
    ]
  },
  '7': {
    id: '7',
    title: 'Section 3: Group Assignment Coordination',
    section: 3,
    transcript: "Professor: Welcome back, Mark and Sophia. How is your research paper on sustainable urban agriculture coming along? Mark: Hello, Professor. We have gathered a lot of data on vertical farming in urban areas, but we are struggling with structuring the introduction. Sophia: Yes, there are so many studies on this topic that we don't know which ones are most relevant to cite. Professor: I suggest you focus on studies published in the last five years to keep it current. Also, make sure to highlight the water savings, as vertical farms use 95 percent less water than traditional agriculture. Mark: That is a helpful statistic! Sophia, I will write the draft of the introduction focusing on water efficiency, and you can compile the charts. Sophia: Sounds good. We need to submit the first draft by next Wednesday. Mark: Yes, let's aim to finish our individual parts by Monday evening so we have time to review and edit together on Tuesday. Professor: I would also recommend including a cost-benefit analysis in your conclusion. Many policy makers find economic evidence more persuasive than environmental arguments alone. Sophia: That is a great suggestion. Should we include international examples? Professor: Yes, definitely. Tokyo and Singapore are excellent case studies for successful urban vertical farming. Mark: I will look into those. The presentation is also due the same week as the paper, correct? Professor: Yes, the oral presentation is on Thursday. You will have 15 minutes each.",
    questions: [
      { id: 'q1', type: 'multipleChoice', text: "What is the topic of Mark and Sophia's research paper?", options: ['Organic soil farming', 'Sustainable urban agriculture', 'Traditional farming statistics', 'Global food distribution'], correctAnswer: 'Sustainable urban agriculture' },
      { id: 'q2', type: 'fillBlank', text: 'The professor suggests focusing on studies published in the last _____ years.', correctAnswer: 'five' },
      { id: 'q3', type: 'fillBlank', text: 'Vertical farming uses _____ percent less water than traditional farming.', correctAnswer: '95' },
      { id: 'q4', type: 'multipleChoice', text: 'Who will draft the introduction section?', options: ['Mark', 'Sophia', 'The Professor', 'Both students'], correctAnswer: 'Mark' },
      { id: 'q5', type: 'multipleChoice', text: 'When is the first draft due?', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], correctAnswer: 'Wednesday' },
      { id: 'q6', type: 'fillBlank', text: 'The professor recommends including a cost-benefit analysis in the _____ .', correctAnswer: 'conclusion' },
      { id: 'q7', type: 'multipleChoice', text: 'Which two cities are mentioned as case studies?', options: ['London and Paris', 'Tokyo and Singapore', 'Seoul and Dubai', 'Berlin and Amsterdam'], correctAnswer: 'Tokyo and Singapore' },
      { id: 'q8', type: 'fillBlank', text: 'Who will research the international case studies?', correctAnswer: 'Mark' },
      { id: 'q9', type: 'fillBlank', text: 'The oral presentation is scheduled for _____ .', correctAnswer: 'Thursday' },
      { id: 'q10', type: 'fillBlank', text: 'Each student will have _____ minutes for their presentation.', correctAnswer: '15' }
    ]
  },
  '8': {
    id: '8',
    title: 'Section 4: Lecture on History of Tea',
    section: 4,
    transcript: "Good morning, everyone. In today's history lecture, we will explore the fascinating global journey of tea. Originating in ancient China around 2737 BC, legend has it that Emperor Shennong discovered tea when wild leaves blew into his boiling water. Initially consumed as a medicinal tonic, tea became a daily beverage during the Tang Dynasty. By the 16th century, Portuguese merchants introduced tea to Europe, where it quickly became a highly prized luxury item. To meet the massive demand, the British East India Company established extensive tea plantations in India in the 19th century, particularly in the Assam and Darjeeling regions. The introduction of the tea clipper, a fast sailing ship, revolutionized the trade by dramatically reducing transit times. A famous trade route called 'the Tea Road' connected China, Mongolia, and Russia for centuries, running approximately 13,000 kilometers. Today, tea is the second most consumed beverage in the world, surpassed only by water. China remains the world's largest producer of tea, accounting for about 40 percent of global output. India is the second largest producer. The global tea market is valued at over 50 billion dollars annually. Let's analyze how the processing of tea leaves differs between black and green tea...",
    questions: [
      { id: 'q1', type: 'fillBlank', text: 'Legend credits Emperor _____ with the discovery of tea.', correctAnswer: 'Shennong' },
      { id: 'q2', type: 'multipleChoice', text: 'During which Chinese dynasty did tea become a daily beverage?', options: ['Han Dynasty', 'Tang Dynasty', 'Song Dynasty', 'Ming Dynasty'], correctAnswer: 'Tang Dynasty' },
      { id: 'q3', type: 'fillBlank', text: 'British tea plantations were established in India in the _____ century.', correctAnswer: '19th' },
      { id: 'q4', type: 'fillBlank', text: 'The invention of the tea _____ revolutionized shipping speeds.', correctAnswer: 'clipper' },
      { id: 'q5', type: 'multipleChoice', text: 'Which beverage is consumed more globally than tea?', options: ['Coffee', 'Water', 'Milk', 'Juice'], correctAnswer: 'Water' },
      { id: 'q6', type: 'fillBlank', text: "The 'Tea Road' connected China, Mongolia, and _____ .", correctAnswer: 'Russia' },
      { id: 'q7', type: 'fillBlank', text: 'The Tea Road was approximately _____ kilometers long.', correctAnswer: '13000' },
      { id: 'q8', type: 'multipleChoice', text: 'Which country is the largest producer of tea?', options: ['India', 'Sri Lanka', 'China', 'Kenya'], correctAnswer: 'China' },
      { id: 'q9', type: 'fillBlank', text: 'China accounts for about _____ percent of global tea output.', correctAnswer: '40' },
      { id: 'q10', type: 'fillBlank', text: 'The global tea market is valued at over _____ billion dollars annually.', correctAnswer: '50' }
    ]
  },
  '9': {
    id: '9',
    title: 'Section 1: Renting an Apartment',
    section: 1,
    transcript: "Welcome to the IELTS Listening Test. Section one. Agent: Good morning, Metro Rentals. How can I assist you? Tenant: Hi, I'm calling about the two-bedroom apartment listed for rent on Park Avenue. Is it still available? Agent: Yes, it is! It's a modern apartment with a spacious living room and a fully fitted kitchen. Tenant: Excellent. What is the monthly rent? Agent: The rent is 850 pounds per month, which includes water bills, but electricity and gas are separate. Tenant: That's reasonable. Is there a security deposit required? Agent: Yes, a security deposit equivalent to six weeks of rent is required before moving in. Tenant: Understood. And is there parking available? Agent: Yes, the apartment comes with one designated space in the underground garage. Tenant: Perfect, that's exactly what I need. Can we arrange a viewing for this Saturday morning? Agent: Certainly, we have slots open at 10 AM. Tenant: That works for me. Is the apartment furnished? Agent: It is partially furnished — it includes all white goods, curtains, and light fittings. Tenant: What about the internet? Agent: The apartment is pre-wired for fiber optic broadband. You will need to arrange your own provider. Tenant: Good to know. My name is Laura Chen. Please register me for the Saturday morning viewing. Agent: Done, Ms. Chen. You will get a reminder call the day before.",
    questions: [
      { id: 'q1', type: 'fillBlank', text: 'The apartment is located on _____ Avenue.', correctAnswer: 'Park' },
      { id: 'q2', type: 'fillBlank', text: 'The monthly rent is _____ pounds.', correctAnswer: '850' },
      { id: 'q3', type: 'multipleChoice', text: 'Which bill is included in the monthly rent?', options: ['Electricity', 'Water', 'Gas', 'Internet'], correctAnswer: 'Water' },
      { id: 'q4', type: 'fillBlank', text: 'The security deposit is equivalent to _____ weeks of rent.', correctAnswer: 'six' },
      { id: 'q5', type: 'multipleChoice', text: 'Where is the parking space located?', options: ['On the street', 'Underground garage', 'Rear driveway', 'Nearby public parking'], correctAnswer: 'Underground garage' },
      { id: 'q6', type: 'fillBlank', text: 'The viewing appointment is at _____ AM on Saturday.', correctAnswer: '10' },
      { id: 'q7', type: 'trueFalseNotGiven', text: 'The apartment is fully furnished.', correctAnswer: 'False' },
      { id: 'q8', type: 'multipleChoice', text: 'What is included with the partial furnishings?', options: ['Sofa and wardrobe', 'White goods, curtains, and light fittings', 'Kitchen table and chairs', 'Beds and wardrobes'], correctAnswer: 'White goods, curtains, and light fittings' },
      { id: 'q9', type: 'fillBlank', text: 'The apartment is pre-wired for _____ optic broadband.', correctAnswer: 'fiber' },
      { id: 'q10', type: 'fillBlank', text: "The tenant's surname is _____ .", correctAnswer: 'Chen' }
    ]
  },
  '10': {
    id: '10',
    title: 'Section 2: Radio Broadcast Community Update',
    section: 2,
    transcript: "Good evening, listeners, and welcome to your local community update on Radio Oakville. First, we have exciting news about the Oakville Public Library. Starting next Monday, the library will be launching a brand new digital lending service, allowing members to download thousands of audiobooks for free. Additionally, the Oakville Sports Center will be closed for renovation from the 1st to the 15th of June to install a new swimming pool filtration system. The annual Summer Street Fair will take place on Saturday, July 12th. Volunteers are urgently needed to help set up the stalls. If you can spare three hours on that morning, please sign up on the town hall council website. Finally, residents are reminded that garbage collection days will shift by one day next week due to the public holiday on Monday. In arts news, the Oakville Community Theatre is staging a production of 'A Midsummer Night's Dream' this weekend. Performances are at 7 PM on Friday and Saturday, and 2 PM on Sunday. Tickets are available online or at the box office for 12 dollars for adults and 8 dollars for students. A free parking zone will be available in lot C adjacent to the theater for all ticketed audiences during performance hours.",
    questions: [
      { id: 'q1', type: 'fillBlank', text: 'The library is launching a free digital lending service for _____ .', correctAnswer: 'audiobooks' },
      { id: 'q2', type: 'multipleChoice', text: 'Why is the sports center closing in June?', options: ['To build a basketball court', 'To install a pool filtration system', 'To repaint the building', 'To host a tournament'], correctAnswer: 'To install a pool filtration system' },
      { id: 'q3', type: 'fillBlank', text: 'The Summer Street Fair is scheduled for Saturday, July _____ .', correctAnswer: '12th' },
      { id: 'q4', type: 'trueFalseNotGiven', text: 'Volunteers for the street fair must register at the library.', correctAnswer: 'False' },
      { id: 'q5', type: 'multipleChoice', text: 'Garbage collection next week will be delayed by:', options: ['One day', 'Two days', 'Three days', 'No delay'], correctAnswer: 'One day' },
      { id: 'q6', type: 'fillBlank', text: "The theatre production is called 'A Midsummer Night's _____ '.", correctAnswer: 'Dream' },
      { id: 'q7', type: 'multipleChoice', text: 'When is the Sunday performance?', options: ['7 PM', '5 PM', '2 PM', '6 PM'], correctAnswer: '2 PM' },
      { id: 'q8', type: 'fillBlank', text: 'Adult tickets for the theatre cost _____ dollars.', correctAnswer: '12' },
      { id: 'q9', type: 'fillBlank', text: 'Student tickets for the theatre cost _____ dollars.', correctAnswer: '8' },
      { id: 'q10', type: 'fillBlank', text: 'Free parking for ticket holders is available in lot _____ .', correctAnswer: 'C' }
    ]
  }
};
module.exports = listeningTests;
