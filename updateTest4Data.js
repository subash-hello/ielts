const fs = require('fs');
const path = require('path');

const file1 = path.join(__dirname, 'src/data/cambridgeListeningTests.js');
const file2 = path.join(__dirname, 'src/data/cambridgeTenTests.js');

const test4Content = {
  id: "4",
  title: "Cambridge IELTS 20 Academic Listening Test 4",
  duration: "30 min",
  difficulty: "hard",
  parts: [
    {
      part: 1,
      title: "Part 1: Questions 1-10",
      type: "Conversation",
      audioUrl: "https://engnovate.com/wp-content/uploads/2025/07/cambridge-ielts-20-academic-listening-4-audio-part-1.mp3",
      transcript: `MAN: Sandra, I seem to remember you had some family visitors staying with you recently.
WOMAN: Yeah, that's right. My brother and his family were here a couple of months ago.
MAN: OK, good. Well, I wanted to ask for your advice. I've got my cousin and her family visiting next month and as I don't have kids, I've no idea where to take them.
WOMAN: Right. What about accommodation? Are they going to stay with you in your flat?
MAN: No, thankfully. There wouldn't be room. My cousin wants me to recommend a hotel. Do you know anywhere?
WOMAN: Yes, I do actually. I always recommend people stay at the King's Hotel.
MAN: Where's that near?
WOMAN: It's about a five minutes' walk from Murray Station, so nice and central. It's actually on George Street.
MAN: Oh yes, I know.
WOMAN: I think they're on quite a tight budget, so how much roughly is it to stay there? If you book a family room, it's about £125 per night. My brother paid for two double rooms in the end, and I think that was around £95 for each room.
MAN: Oh, that's not too bad. So how old are your cousin's kids?
WOMAN: Twelve and nine. So I want to organise some trips while they're here. I was thinking of doing a bus tour of the city centre, as none of them have been here before.
WOMAN: Those bus tours are quite expensive. I think it's better to do a walking tour. It gives you a much better feel for the city. There's one that starts from Colton Square. It takes a couple of hours and doesn't cost that much.
MAN: Sounds good. I'll look that up. Thanks.
WOMAN: If the weather's nice, one thing you could do is visit the old fort. You could get there by boat. The whole trip takes half a day.
MAN: That's a really good idea. I'd like to do that myself. And if the weather's bad, I was thinking they could go to the science museum. But maybe they could do that when I'm at work.
WOMAN: Yeah, don't forget it's closed on Mondays.
MAN: They're here from Saturday for four nights, so Tuesday would be best, I think.
WOMAN: And it won't be so crowded then. Saturdays are terrible. I took my kids to the exhibition on old computers there and it was far too crowded. I wanted to go back but it's finished now.
MAN: That's a shame. My cousin's kids would have enjoyed that.
WOMAN: There's another one starting soon on space, which looks really good too.
MAN: OK, well, I'll mention that to my cousin.
WOMAN: Have you thought about where to take them to eat?
MAN: Well, I really like all the food stalls at Clacton Market. My cousin's vegetarian. I know it's one of the best places for that kind of food.
WOMAN: Definitely, and there'll be loads of choices for the kids too. You need to get there quite early, though. At the weekend, most of the stalls stop serving lunch at 2.30.
MAN: Good point. It's all going to need careful planning. My cousin said she'd love to take the kids to a show at the theatre, but tickets are so expensive.
WOMAN: I know. But you can get some good deals if you book online with bargaintickets.com for the following day. On some seats there's a 75% discount.
MAN: Really? I must try and get some.
WOMAN: Yeah, there are lots of things you can do for free as well. No need to spend a fortune.
MAN: Like what?
WOMAN: They're coming next month, right? Well, check and see if it's the same weekend as the Roots Music Festival in Blakewell Gardens.
MAN: R-O-O-T-S?
WOMAN: Yeah, check it out online. It's always a family-friendly event and there's no entry charge.
MAN: That sounds perfect.
WOMAN: And if you're in Blakewell Gardens, climb Telegraph Hill. You'll be able to look right down on the port. Everyone's always really impressed because it's so huge.
MAN: Oh yeah, I've been meaning to do that for ages. I've heard the view's amazing.
WOMAN: Yeah, it's really worth the effort.
MAN: Well, that's given me loads of ideas. Thanks so much.`,
      questions: [
        { id: "c20t4q1", type: "fillBlank", text: "_____ Hotel on George Street", correctAnswer: "Kings / King's" },
        { id: "c20t4q2", type: "fillBlank", text: "Cost of family room per night (approximate): £_____", correctAnswer: "125" },
        { id: "c20t4q3", type: "fillBlank", text: "A _____ tour of the city centre (starts in Colton Square)", correctAnswer: "walking" },
        { id: "c20t4q4", type: "fillBlank", text: "A trip by _____ to the old fort", correctAnswer: "boat" },
        { id: "c20t4q5", type: "fillBlank", text: "Science Museum - Best day to visit: _____", correctAnswer: "Tuesday" },
        { id: "c20t4q6", type: "fillBlank", text: "See the exhibition about _____ which opens soon", correctAnswer: "space" },
        { id: "c20t4q7", type: "fillBlank", text: "Food: Clacton Market - Good for _____ food", correctAnswer: "vegetarian" },
        { id: "c20t4q8", type: "fillBlank", text: "Need to have lunch before _____ p.m.", correctAnswer: "2.30" },
        { id: "c20t4q9", type: "fillBlank", text: "Theatre Tickets - Save up to _____ % on ticket prices at bargaintickets.com", correctAnswer: "75" },
        { id: "c20t4q10", type: "fillBlank", text: "Climb Telegraph Hill to see a view of the _____", correctAnswer: "port" }
      ]
    },
    {
      part: 2,
      title: "Part 2: Questions 11-20",
      type: "Monologue",
      audioUrl: "https://engnovate.com/wp-content/uploads/2025/07/cambridge-ielts-20-academic-listening-4-audio-part-2.mp3",
      transcript: `Good morning and welcome to City Football Club. I'd like to give you some useful information about your visit to the stadium today and then we'll start the tour of the areas of the stadium that are open to visitors. I can see lots of children here today, so just to let mums and dads know a few things before we start. The stadium has lots of stairs and the players' tunnel is very dark. Please don't let your children wander off on their own, even for a minute. We don't want any accidents or anyone getting frightened. Cameras are permitted everywhere and you can take pictures of your child shooting a penalty. Assistants are helping to organise this and hopefully the queue won't be too long. It's very hot and sunny out on the pitch today. You can get food and drink at the cafe and I really recommend the healthy lunch boxes for children. Also in the cafe, children are invited to do a football drawing. We pick the best one at the end of the afternoon. So don't forget to put your name and contact details on the back. That way if you've left the stadium before then, we'll send your prize, but sadly we can't return drawings. I'd like to mention some features of the tour. We'll start with the 360 cinema experience, which has been very popular over the years, and then I'll take you to the players' dressing rooms, before going outside to the seating area and the pitch. I should say, if you'd prefer your visit to be self-guided, please collect headphones from the reception, and then you can listen to the pre-recorded information at your own speed. We've only just introduced this feature and would appreciate your feedback. We're thinking of offering tours in other languages in future, so if you have any thoughts on that, we'd welcome those too. If you plan to return another time, you might like to book one of our VIP tours. We've only just started offering these and they can be booked online.
      
Now, the stadium you see today was built in 1989 as part of a three-year redevelopment project. While that project was going on, the team had to play its matches at the ground of another club. Apart from that, the club has been here on this site since 1870. As some of you may know, that was the start of a really important decade in the history of football in this country. For example, 1870 was also the year that football teams started to include a player whose role it was to guard the goal. It's hard to imagine what the game must have been like without someone in that position, isn't it? In 1872 and 73, many other clubs were established, both here and abroad. And the following year, in 1874, referees were allowed to send players off if they committed certain offences. And also in that year, teams started having to swap ends at half-time. One fact I was interested to discover was that in early football games the aim was for the scorer to get the ball between two flag posts and later between sticks joined at the top with a piece of tape. In 1875, that tape was replaced with the solid crossbar that we're familiar with today. 1877 saw the founding of further new clubs and the history books tell us that in the same year all the clubs decided to set a limit of 90 minutes for each match. Before that it was a more casual arrangement and this sometimes caused huge arguments and sometimes fights during matches when one team called the end of the game and the other team wanted to play on to try and score a winning goal. By 1878, the number of teams in the Football League increased again. In addition, referees started using whistles and electric lamps were installed on certain pitches. This was a significant change, as games could then be played in the evenings all year round. In 1880, clubs began to charge fans for admission to games, even though players were still amateurs and had other proper jobs. That's hard to imagine in the modern professional game where top players earn significant sums of money from both playing and commercial activities.`,
      questions: [
        { id: "c20t4q11", type: "multipleChoice", text: "Visiting the stadium with children - statement 1:", options: ["A. Children can get their photo taken with a football player", "B. There is a competition for children today", "C. Parents must stay with their children at all times", "D. Children will need sunhats and drinks", "E. The café has a special offer on meals for children"], correctAnswer: "B" },
        { id: "c20t4q12", type: "multipleChoice", text: "Visiting the stadium with children - statement 2:", options: ["A. Children can get their photo taken with a football player", "B. There is a competition for children today", "C. Parents must stay with their children at all times", "D. Children will need sunhats and drinks", "E. The café has a special offer on meals for children"], correctAnswer: "C" },
        { id: "c20t4q13", type: "multipleChoice", text: "New features of the stadium tour this year - feature 1:", options: ["A. VIP tour", "B. 360 cinema experience", "C. Audio guide", "D. Dressing room tour", "E. Tours in other languages"], correctAnswer: "A" },
        { id: "c20t4q14", type: "multipleChoice", text: "New features of the stadium tour this year - feature 2:", options: ["A. VIP tour", "B. 360 cinema experience", "C. Audio guide", "D. Dressing room tour", "E. Tours in other languages"], correctAnswer: "C" },
        { id: "c20t4q15", type: "matching", text: "Event in UK football history in 1870", options: ["A. the introduction of pay for the players", "B. a change to the design of the goal", "C. the first use of lights for matches", "D. the introduction of goalkeepers", "E. the first international match", "F. two changes to the rules of the game", "G. the introduction of a fee for spectators", "H. an agreement on the length of a game"], correctAnswer: "D" },
        { id: "c20t4q16", type: "matching", text: "Event in UK football history in 1874", options: ["A. the introduction of pay for the players", "B. a change to the design of the goal", "C. the first use of lights for matches", "D. the introduction of goalkeepers", "E. the first international match", "F. two changes to the rules of the game", "G. the introduction of a fee for spectators", "H. an agreement on the length of a game"], correctAnswer: "F" },
        { id: "c20t4q17", type: "matching", text: "Event in UK football history in 1875", options: ["A. the introduction of pay for the players", "B. a change to the design of the goal", "C. the first use of lights for matches", "D. the introduction of goalkeepers", "E. the first international match", "F. two changes to the rules of the game", "G. the introduction of a fee for spectators", "H. an agreement on the length of a game"], correctAnswer: "B" },
        { id: "c20t4q18", type: "matching", text: "Event in UK football history in 1877", options: ["A. the introduction of pay for the players", "B. a change to the design of the goal", "C. the first use of lights for matches", "D. the introduction of goalkeepers", "E. the first international match", "F. two changes to the rules of the game", "G. the introduction of a fee for spectators", "H. an agreement on the length of a game"], correctAnswer: "H" },
        { id: "c20t4q19", type: "matching", text: "Event in UK football history in 1878", options: ["A. the introduction of pay for the players", "B. a change to the design of the goal", "C. the first use of lights for matches", "D. the introduction of goalkeepers", "E. the first international match", "F. two changes to the rules of the game", "G. the introduction of a fee for spectators", "H. an agreement on the length of a game"], correctAnswer: "C" },
        { id: "c20t4q20", type: "matching", text: "Event in UK football history in 1880", options: ["A. the introduction of pay for the players", "B. a change to the design of the goal", "C. the first use of lights for matches", "D. the introduction of goalkeepers", "E. the first international match", "F. two changes to the rules of the game", "G. the introduction of a fee for spectators", "H. an agreement on the length of a game"], correctAnswer: "G" }
      ]
    },
    {
      part: 3,
      title: "Part 3: Questions 21-30",
      type: "Academic Discussion",
      audioUrl: "https://engnovate.com/wp-content/uploads/2025/07/cambridge-ielts-20-academic-listening-4-audio-part-3.mp3",
      transcript: `MAN: How are you getting on with the assignment on handwriting?
WOMAN: Not too bad. You know, I hadn’t realised that children benefit in so many ways from learning to write. It’s such an important skill, and yet most people think handwriting is less important than in the past, because people hardly ever write by hand these days.
MAN: Yes, and all the evidence suggests children should learn to write by hand before they learn to type, not least because it helps their memory.
WOMAN: That’s right. The physical act of writing helps children to remember letters. That seems pretty obvious when you think about it.
MAN: What’s less obvious is how it helps develop their concentration. They have to sit still and focus on one thing.
WOMAN: Yeah, that aspect of handwriting had never occurred to me before.
MAN: Same here. I’m not sure I understand how it improves children’s imagination, though.
WOMAN: Well, there was that study which showed that primary age children generated more ideas when they were writing by hand than using a keyboard. I would have guessed that would be the case.
MAN: Hmm, yeah. I never associated spatial awareness with handwriting either. I thought spatial awareness was more to do with knowing where you are in relation to objects or other people.
WOMAN: I thought that too. But good spatial awareness is essential for writing because you have to space words correctly. It’s not just fine motor skills that improve through writing, as I’d always assumed.
MAN: Handwriting is so much harder for children with dyspraxia, who have problems coordinating movement. It’s good there are lots of things you can do in the classroom to help them. They need so much more support with letter formation. You need to play lots of games to help them distinguish letter shapes. It takes a lot of patience.
WOMAN: Yeah, I like the idea of using one of those pens that lights up if you press too hard. That seems like a really simple solution.
MAN: Yes, absolutely. I’m not sure there’s much you can do about children with dyspraxia writing very slowly. It’s more important to focus on accuracy and as they get more confident, I think they eventually speed up.
WOMAN: One quite simple thing you can do is to use grid paper. So they write each letter in a box and that trains them to space the letters correctly.
MAN: Indeed, that’s more important for legibility than trying to get them to write in a straight line.
MAN: For some children, it might be better to teach them to write on a laptop rather than by hand, like children with dyslexia. They often really struggle with handwriting and some just give up.
WOMAN: Yeah, it’s not as frustrating for them if they get things wrong. On a keyboard, they can be more willing to have a go. But I read that developing fluency isn’t any faster.
MAN: That’s right. Did you read that article on the benefits of teaching print rather than cursive handwriting, where the letters are joined up?
WOMAN: Yes. Well, in the past, cursive writing was certainly considered more stylish and educated, but not anymore. Teachers’ attitudes have changed because it’s been proved that cursive is more difficult to learn, especially for children with learning difficulties who find joining up letters really challenging.
MAN: I agree. I was always worried that my poor handwriting affected my exam results, and now research shows that I was right to worry. I’m sure a lot of students think it’s unfair that they’re being judged on their handwriting, not just their knowledge.
WOMAN: Marks are definitely affected if examiners can't read the script. That is why it has always been so important to teach children to write legibly. Do you think the role of handwriting will change in the future?
MAN: I can’t see that changing much. Touch typing still isn’t taught in most schools, which is a shame. But maybe that won’t be necessary in the future, because people will also be able to write by hand on digital devices. Anyway, teachers understand the value of handwriting. It’s a basic life skill.
WOMAN: True. However, the fact is that people are writing by hand less and less and relying on digital devices. That does cause some problems.
MAN: You mean like note-taking. There are lots of apps for that.
WOMAN: And for reading historical documents, apparently. But my mum is shocked by my awful spelling and the fact that my punctuation is really inconsistent. I think you can put that down to lack of practice.
MAN: I expect so. Personally, I miss writing by hand. I hardly ever write anything now. I remember my grandparents had such beautiful handwriting and it was so individual. Nobody I know would be able to identify my handwriting now. It’s a shame.
WOMAN: I know. I feel the same way. I used to write a diary by hand and now I do that digitally. It just seems less effort to do it that way.`,
      questions: [
        { id: "c20t4q21", type: "multipleChoice", text: "Surprising benefit for children of learning to write - benefit 1:", options: ["A. improved fine motor skills", "B. improved memory", "C. improved concentration", "D. improved imagination", "E. improved spatial awareness"], correctAnswer: "C" },
        { id: "c20t4q22", type: "multipleChoice", text: "Surprising benefit for children of learning to write - benefit 2:", options: ["A. improved fine motor skills", "B. improved memory", "C. improved concentration", "D. improved imagination", "E. improved spatial awareness"], correctAnswer: "E" },
        { id: "c20t4q23", type: "multipleChoice", text: "Dyspraxia handwriting problem easiest to correct - problem 1:", options: ["A. not spacing letters correctly", "B. not writing in a straight line", "C. applying too much pressure when writing", "D. confusing letter shapes", "E. writing very slowly"], correctAnswer: "A" },
        { id: "c20t4q24", type: "multipleChoice", text: "Dyspraxia handwriting problem easiest to correct - problem 2:", options: ["A. not spacing letters correctly", "B. not writing in a straight line", "C. applying too much pressure when writing", "D. confusing letter shapes", "E. writing very slowly"], correctAnswer: "C" },
        { id: "c20t4q25", type: "multipleChoice", text: "What does the woman say about using laptops for children with dyslexia?", options: ["A. Children often lack motivation to learn that way", "B. Children become fluent relatively quickly", "C. Children react more positively if they make a mistake"], correctAnswer: "C" },
        { id: "c20t4q26", type: "multipleChoice", text: "When discussing whether to teach cursive or print writing, the woman thinks that", options: ["A. cursive writing disadvantages a certain group of children", "B. print writing is associated with lower academic performance", "C. most teachers in the UK prefer a traditional approach to handwriting"], correctAnswer: "A" },
        { id: "c20t4q27", type: "multipleChoice", text: "According to the students, what impact does poor handwriting have on exam performance?", options: ["A. There is evidence to suggest grades are affected by poor handwriting", "B. Neat handwriting is less important now than it used to be", "C. Candidates write more slowly and produce shorter answers"], correctAnswer: "A" },
        { id: "c20t4q28", type: "multipleChoice", text: "What prediction does the man make about the future of handwriting?", options: ["A. Touch typing will be taught before writing by hand", "B. Children will continue to learn to write by hand", "C. People will dislike handwriting on digital devices"], correctAnswer: "B" },
        { id: "c20t4q29", type: "multipleChoice", text: "The woman is concerned that relying on digital devices has made it difficult for her to", options: ["A. take detailed notes", "B. spell and punctuate", "C. read old documents"], correctAnswer: "B" },
        { id: "c20t4q30", type: "multipleChoice", text: "How do the students feel about their own handwriting?", options: ["A. concerned they are unable to write quickly", "B. embarrassed by comments made about it", "C. regretful that they have lost the habit"], correctAnswer: "C" }
      ]
    },
    {
      part: 4,
      title: "Part 4: Questions 31-40",
      type: "Academic Lecture",
      audioUrl: "https://engnovate.com/wp-content/uploads/2025/07/cambridge-ielts-20-academic-listening-4-audio-part-4.mp3",
      transcript: `We’ve been looking at different types of conflicts that may arise between wildlife and humans at the boundaries of protected areas, such as national parks and animal sanctuaries. I’d like to illustrate this by telling you about some research that I’ve been involved in recently in the Central African country of Zambia in the area around the Chembe Bird Sanctuary which contains over 300 of the listed birds of Zambia. These include a number of birds of prey such as eagles, hawks and owls that live by hunting and killing other birds and animals. Now most of the people living in the local communities near to the bird sanctuary are small-scale farmers and these birds of prey provide important social and ecological benefits to them. For example, a lot of damage can be caused to farmers’ crops by rodents, such as rats, which would consume the crops as they grow in the fields, as well as after harvesting if they weren’t hunted and killed by the birds. And the predatory habits of these birds also protect farmers in other ways. For example, a major danger to rural workers is snakes, whose bite may be dangerous or even fatal, and birds of prey have a major role in keeping their populations under control. Local people have always been aware of these benefits and for years, even before the sanctuary was opened in 1973, the birds played a key role in the culture of the region. However, more recently, the sanctuary and its birds have also become increasingly important to the community in economic terms, because at present, after a relatively slow start, tourism has become an important source of revenue for them.
      
However, although these birds of prey are protected by the government, their numbers are falling. Some of these deaths are accidental. Fatalities occur when birds alight on roads to catch and eat their prey, and are hit by fast moving traffic. Drivers in Zambia have to take special care at night, as birds may regard the quieter roads as safe places to sleep. Accidental deaths may also occur if these birds fly close to high power lines as they may be electrocuted. This is a particular danger in the heavy rain which can occur in the region in the months from December to April. And local farmers also pose a threat to these birds. As well as growing crops, small-scale farmers in the area also rear chickens. These provide food for the farmers’ families, as well as being an important source of income. But they’re also an easy target for birds of prey, and so farmers may shoot these birds, which is illegal but understandable, or they may poison the birds, which again is illegal and can have negative effects on the ecosystem. So how else can farmers protect their chickens from birds of prey? Some people believe that to prevent the predators from settling near the area where the chickens are kept, it’s best to keep this area free from vegetation. But in fact, this is counterproductive, as it means the chickens have no cover to hide in and they’ll be easier for the birds to see. Another possibility would be to prevent the chickens from going outside at all and to keep them safe from predators inside a building, but this would cost far too much to be a practical solution.
      
Nearly all the farmers reported that they spent a lot of time and effort trying to frighten off the birds of prey without actually harming them. Most of the farmers had at least one dog and said this was a big help at scaring away the predators. Some of the farmers also reported that during the breeding season, when the chickens were particularly vulnerable, they encouraged their children to watch over the chickens and to hit pans with a metal spoon so that the resulting noise would succeed in driving away birds that were trying to seize the young chicks. None of these methods was 100% effective so as a result the village people told us that rather than just using one method, they were forced to use a combination for them to have any effect. And even so, these birds of prey remain a major threat to the chickens’ survival and cause considerable economic loss to farmers.`,
      questions: [
        { id: "c20t4q31", type: "fillBlank", text: "They destroy _____ and other rodents.", correctAnswer: "rats" },
        { id: "c20t4q32", type: "fillBlank", text: "They help prevent farmers from being bitten by _____ .", correctAnswer: "snakes" },
        { id: "c20t4q33", type: "fillBlank", text: "They now support the economy by encouraging _____ in the area.", correctAnswer: "tourism" },
        { id: "c20t4q34", type: "fillBlank", text: "Falling numbers of birds of prey: By _____ when hunting or sleeping.", correctAnswer: "traffic" },
        { id: "c20t4q35", type: "fillBlank", text: "By electrocution from power lines, especially during times of high _____ .", correctAnswer: "rain" },
        { id: "c20t4q36", type: "fillBlank", text: "Local farmers may illegally shoot them or _____ them.", correctAnswer: "poison" },
        { id: "c20t4q37", type: "fillBlank", text: "Providing a _____ for chickens (expensive).", correctAnswer: "building" },
        { id: "c20t4q38", type: "fillBlank", text: "Frightening birds of prey by keeping a _____ .", correctAnswer: "dog" },
        { id: "c20t4q39", type: "fillBlank", text: "Making a _____ (e.g. with metal objects).", correctAnswer: "noise" },
        { id: "c20t4q40", type: "fillBlank", text: "A _____ of methods is usually most effective.", correctAnswer: "combination" }
      ]
    }
  ]
};

// Target 1: cambridgeListeningTests.js
if (fs.existsSync(file1)) {
  const tests1 = require(file1);
  tests1["4"] = test4Content;
  fs.writeFileSync(file1, 'const cambridgeListeningTests = ' + JSON.stringify(tests1, null, 2) + ';\n\nmodule.exports = cambridgeListeningTests;\n', 'utf8');
  console.log('✅ Updated test 4 in cambridgeListeningTests.js');
}

// Target 2: cambridgeTenTests.js
if (fs.existsSync(file2)) {
  const tests2 = require(file2);
  tests2["4"] = test4Content;
  fs.writeFileSync(file2, 'module.exports = ' + JSON.stringify(tests2, null, 2) + ';\n', 'utf8');
  console.log('✅ Updated test 4 in cambridgeTenTests.js');
}
