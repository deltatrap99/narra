/** Pronunciation/POS checked against the linked Cambridge entries, 2026-11-16.
 * Examples, translations, usage notes and teaching syllable divisions are Narra originals.
 * Related words refer only to the sense described here, not every sense of the headword.
 */
export type LexiconExample = { text: string; vi: string };
export type LexiconEntry = {
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'idiom' | 'phrasal verb';
  grammar?: string;
  grammarVi?: string;
  uk?: string;
  us?: string;
  syllables: string[];
  stress: number[];
  phraseStress?: boolean;
  meaning: string;
  meaningVi: string;
  synonyms: string[];
  antonyms: string[];
  everyday: LexiconExample;
  ielts: LexiconExample;
  use: string;
  useVi: string;
  collocations: string[];
  sources: { label: string; url: string }[];
};

export const normalizeWord = (word: string) => word.trim().toLocaleLowerCase('en').replace(/[’‘]/g, "'").replace(/\s+/g, ' ');
const cambridge = (word: string, thesaurus = false) => ({ label: thesaurus ? 'Cambridge Thesaurus' : 'Cambridge Dictionary', url: `https://dictionary.cambridge.org/${thesaurus ? 'thesaurus' : 'dictionary/english'}/${word}` });

export const lexicon: Record<string, LexiconEntry> = {
  departure: {
    partOfSpeech: 'noun', grammar: 'countable / uncountable', grammarVi: 'đếm được / không đếm được', uk: 'dɪˈpɑː.tʃə', us: 'dɪˈpɑːr.tʃɚ', syllables: ['de', 'par', 'ture'], stress: [1],
    meaning: 'Leaving a place, or the time when a journey starts.', meaningVi: 'Sự rời đi hoặc thời điểm bắt đầu một hành trình.', synonyms: ['leaving'], antonyms: ['arrival'],
    everyday: { text: 'Our departure is at six, so let’s pack tonight.', vi: 'Mình khởi hành lúc sáu giờ, nên tối nay thu xếp hành lý nhé.' },
    ielts: { text: 'More reliable departure times would make public transport a practical alternative to driving.', vi: 'Giờ khởi hành đáng tin cậy hơn sẽ giúp giao thông công cộng trở thành lựa chọn thiết thực thay cho việc lái xe.' },
    use: 'Use “departure from” a place and “departure for” a destination.', useVi: 'Dùng “departure from” cho nơi rời đi và “departure for” cho điểm đến.', collocations: ['departure time', 'a delayed departure'], sources: [cambridge('departure'), cambridge('depart', true)],
  },
  reservation: {
    partOfSpeech: 'noun', grammar: 'countable', grammarVi: 'đếm được', uk: 'ˌrez.əˈveɪ.ʃən', us: 'ˌrez.ɚˈveɪ.ʃən', syllables: ['res', 'er', 'va', 'tion'], stress: [2],
    meaning: 'An arrangement to have a room, seat or table kept for you.', meaningVi: 'Việc đặt trước để giữ phòng, chỗ ngồi hoặc bàn cho bạn.', synonyms: ['booking'], antonyms: [],
    everyday: { text: 'Could you check our reservation for Saturday evening?', vi: 'Bạn kiểm tra giúp đặt bàn của chúng tôi vào tối thứ Bảy được không?' },
    ielts: { text: 'Online reservation systems allow visitors to plan ahead and can reduce queues at popular attractions.', vi: 'Hệ thống đặt chỗ trực tuyến giúp du khách lên kế hoạch trước và có thể giảm hàng chờ tại những điểm tham quan nổi tiếng.' },
    use: 'Say “make a reservation”, rather than “do a reservation”. “Reservations about” has a different meaning: doubts.', useVi: 'Nói “make a reservation”, không dùng “do”. “Reservations about” lại mang nghĩa băn khoăn hoặc nghi ngại.', collocations: ['make a reservation', 'confirm a reservation'], sources: [cambridge('reservation'), cambridge('reservation', true)],
  },
  itinerary: {
    partOfSpeech: 'noun', grammar: 'countable', grammarVi: 'đếm được', uk: 'aɪˈtɪn.ər.ər.i', us: 'aɪˈtɪn.ə.rer.i', syllables: ['i', 'tin', 'er', 'ar', 'y'], stress: [1],
    meaning: 'A plan showing the places and activities in a journey.', meaningVi: 'Lịch trình cho biết các điểm đến và hoạt động trong chuyến đi.', synonyms: ['travel plan', 'route'], antonyms: [],
    everyday: { text: 'I’ve left a free afternoon in our itinerary for exploring the old town.', vi: 'Tớ để trống một buổi chiều trong lịch trình để khám phá phố cổ.' },
    ielts: { text: 'A flexible itinerary gives travellers more opportunities to interact with local communities.', vi: 'Lịch trình linh hoạt tạo thêm cơ hội để du khách giao lưu với cộng đồng địa phương.' },
    use: 'A route describes the path; an itinerary can also include dates, bookings and activities.', useVi: '“Route” chủ yếu chỉ đường đi; “itinerary” còn có thể gồm ngày giờ, đặt chỗ và hoạt động.', collocations: ['a detailed itinerary', 'plan an itinerary'], sources: [cambridge('itinerary'), cambridge('detailed-plan-for-a-trip', true)],
  },
  serendipity: {
    partOfSpeech: 'noun', grammar: 'uncountable · formal', grammarVi: 'không đếm được · trang trọng', uk: 'ˌser.ənˈdɪp.ə.ti', us: 'ˌser.ənˈdɪp.ə.t̬i', syllables: ['ser', 'en', 'dip', 'i', 'ty'], stress: [2],
    meaning: 'The chance discovery of something welcome or valuable.', meaningVi: 'Sự tình cờ khám phá một điều thú vị hoặc có giá trị.', synonyms: ['a lucky discovery', 'a happy accident'], antonyms: [],
    everyday: { text: 'Meeting my future flatmate in that tiny café was pure serendipity.', vi: 'Tình cờ gặp người sau này ở cùng nhà trong quán cà phê nhỏ ấy thật là một cơ duyên.' },
    ielts: { text: 'Although research requires careful planning, serendipity can also play a role in scientific discovery.', vi: 'Dù nghiên cứu cần kế hoạch kỹ lưỡng, những phát hiện tình cờ cũng có thể góp phần vào khám phá khoa học.' },
    use: 'This describes a fortunate discovery by chance, rather than good luck in every situation.', useVi: 'Từ này nói về khám phá may mắn do tình cờ, không thay cho “good luck” trong mọi tình huống.', collocations: ['pure serendipity', 'an element of serendipity'], sources: [cambridge('serendipity')],
  },
  perspective: {
    partOfSpeech: 'noun', grammar: 'countable · this meaning', grammarVi: 'đếm được · trong nghĩa này', uk: 'pəˈspek.tɪv', us: 'pɚˈspek.tɪv', syllables: ['per', 'spec', 'tive'], stress: [1],
    meaning: 'A way of understanding or thinking about a situation.', meaningVi: 'Góc nhìn hoặc cách suy nghĩ về một tình huống.', synonyms: ['viewpoint', 'outlook'], antonyms: [],
    everyday: { text: 'Talking to my sister helped me see the problem from another perspective.', vi: 'Trò chuyện với chị gái giúp tớ nhìn vấn đề từ một góc độ khác.' },
    ielts: { text: 'Studying abroad can broaden students’ perspective by exposing them to different ways of life.', vi: 'Du học có thể mở rộng góc nhìn của sinh viên nhờ giúp họ tiếp xúc với những lối sống khác nhau.' },
    use: 'Use “a perspective on” a topic or “from someone’s perspective”.', useVi: 'Dùng “a perspective on” một chủ đề hoặc “from someone’s perspective” để nói từ góc nhìn của ai đó.', collocations: ['a fresh perspective', 'from my perspective'], sources: [cambridge('perspective'), cambridge('perspective', true)],
  },
  'make the most of': {
    partOfSpeech: 'idiom', uk: 'meɪk ðə ˈməʊst əv', us: 'meɪk ðə ˈmoʊst əv', syllables: ['make', 'the', 'most', 'of'], stress: [2], phraseStress: true,
    meaning: 'To use or enjoy an opportunity as fully as you can.', meaningVi: 'Tận dụng hoặc tận hưởng một cơ hội nhiều nhất có thể.', synonyms: ['take full advantage of', 'use to the full'], antonyms: [],
    everyday: { text: 'We have only an hour by the sea, so let’s make the most of it.', vi: 'Mình chỉ có một giờ ở biển thôi, nên tận hưởng thật trọn vẹn nhé.' },
    ielts: { text: 'Schools should help students make the most of digital resources while developing independent thinking.', vi: 'Nhà trường nên giúp học sinh tận dụng tài nguyên số đồng thời phát triển tư duy độc lập.' },
    use: 'Follow “of” with a noun or pronoun: make the most of your time / it.', useVi: 'Sau “of” dùng danh từ hoặc đại từ: make the most of your time / it.', collocations: ['make the most of your time', 'make the most of an opportunity'], sources: [cambridge('make-the-most-of'), { label: 'Component pronunciation', url: 'https://dictionary.cambridge.org/pronunciation/english/most' }],
  },
  thoughtful: {
    partOfSpeech: 'adjective', uk: 'ˈθɔːt.fəl', us: 'ˈθɑːt.fəl', syllables: ['thought', 'ful'], stress: [0],
    meaning: 'Showing care for another person’s needs or feelings.', meaningVi: 'Chu đáo, quan tâm đến nhu cầu hoặc cảm xúc của người khác.', synonyms: ['considerate', 'caring'], antonyms: ['thoughtless', 'inconsiderate'],
    everyday: { text: 'It was thoughtful of you to bring an extra umbrella for me.', vi: 'Bạn thật chu đáo khi mang thêm một chiếc ô cho tớ.' },
    ielts: { text: 'Thoughtful urban design can make public spaces more welcoming to older residents.', vi: 'Thiết kế đô thị chu đáo có thể giúp không gian công cộng thân thiện hơn với cư dân lớn tuổi.' },
    use: '“It was thoughtful of you to…” is a natural way to thank someone for a kind action.', useVi: '“It was thoughtful of you to…” là cách tự nhiên để cảm ơn một hành động quan tâm.', collocations: ['a thoughtful gesture', 'thoughtful of you'], sources: [cambridge('thoughtful'), cambridge('thoughtful', true)],
  },
  feedback: {
    partOfSpeech: 'noun', grammar: 'uncountable', grammarVi: 'không đếm được', uk: 'ˈfiːd.bæk', us: 'ˈfiːd.bæk', syllables: ['feed', 'back'], stress: [0],
    meaning: 'Comments about someone’s work that can guide improvement.', meaningVi: 'Nhận xét về công việc hoặc kết quả, giúp người nhận cải thiện.', synonyms: ['comments', 'response'], antonyms: [],
    everyday: { text: 'Could you give me some feedback on my presentation?', vi: 'Bạn góp ý giúp tớ về bài thuyết trình được không?' },
    ielts: { text: 'Regular, constructive feedback helps learners identify weaknesses and set realistic goals.', vi: 'Góp ý mang tính xây dựng và thường xuyên giúp người học nhận ra điểm yếu và đặt mục tiêu thực tế.' },
    use: 'Say “some feedback” or “a piece of feedback”, not “a feedback”.', useVi: 'Dùng “some feedback” hoặc “a piece of feedback”, không nói “a feedback”.', collocations: ['constructive feedback', 'give feedback on'], sources: [cambridge('feedback'), cambridge('feedback', true)],
  },
  collaborate: {
    partOfSpeech: 'verb', grammar: 'intransitive', grammarVi: 'nội động từ', uk: 'kəˈlæb.ə.reɪt', us: 'kəˈlæb.ə.reɪt', syllables: ['col', 'lab', 'o', 'rate'], stress: [1],
    meaning: 'To work with other people on a shared task or goal.', meaningVi: 'Hợp tác với người khác trong một công việc hoặc mục tiêu chung.', synonyms: ['cooperate', 'work together'], antonyms: [],
    everyday: { text: 'Shall we collaborate on the slides for tomorrow’s meeting?', vi: 'Mình cùng làm các trang trình chiếu cho cuộc họp ngày mai nhé?' },
    ielts: { text: 'Universities and local businesses can collaborate to provide students with practical training.', vi: 'Trường đại học và doanh nghiệp địa phương có thể hợp tác để mang đến cơ hội đào tạo thực tế cho sinh viên.' },
    use: 'Collaborate with a person; collaborate on a project.', useVi: 'Dùng “collaborate with” một người và “collaborate on” một dự án.', collocations: ['collaborate with colleagues', 'collaborate on research'], sources: [cambridge('collaborate'), cambridge('collaborate', true)],
  },
  deadline: {
    partOfSpeech: 'noun', grammar: 'countable', grammarVi: 'đếm được', uk: 'ˈded.laɪn', us: 'ˈded.laɪn', syllables: ['dead', 'line'], stress: [0],
    meaning: 'The final time or date allowed for finishing a task.', meaningVi: 'Hạn cuối để hoàn thành một công việc.', synonyms: ['time limit', 'cut-off date'], antonyms: [],
    everyday: { text: 'The deadline is Friday, but I’m hoping to finish on Thursday.', vi: 'Hạn cuối là thứ Sáu, nhưng tớ mong sẽ làm xong vào thứ Năm.' },
    ielts: { text: 'Clear deadlines can improve productivity, provided that employees have enough time to complete their work.', vi: 'Thời hạn rõ ràng có thể nâng cao năng suất, miễn là nhân viên có đủ thời gian hoàn thành công việc.' },
    use: 'You “meet” a deadline when you finish in time, and “miss” it when you finish too late.', useVi: '“Meet a deadline” là hoàn thành đúng hạn; “miss a deadline” là không kịp hạn.', collocations: ['meet a deadline', 'a tight deadline'], sources: [cambridge('deadline')],
  },
  usual: {
    partOfSpeech: 'noun', grammar: 'singular · informal', grammarVi: 'số ít · thân mật', uk: 'ˈjuː.ʒu.əl', us: 'ˈjuː.ʒu.əl', syllables: ['u', 'su', 'al'], stress: [0],
    meaning: 'The drink or order that a person regularly chooses.', meaningVi: 'Đồ uống hoặc món một người thường gọi.', synonyms: ['regular order'], antonyms: [],
    everyday: { text: 'I’ll have my usual today: a small coffee and a cheese sandwich.', vi: 'Hôm nay cho tôi món quen nhé: một cà phê nhỏ và một bánh mì kẹp phô mai.' },
    ielts: { text: 'When I visit my neighbourhood café, I normally order my usual because I enjoy its familiar taste.', vi: 'Khi ghé quán cà phê trong khu phố, tôi thường gọi món quen vì thích hương vị thân thuộc ấy.' },
    use: '“My usual” is a noun phrase. In “my usual coffee”, usual is an adjective.', useVi: '“My usual” là cụm danh từ. Trong “my usual coffee”, usual lại là tính từ.', collocations: ['my usual', 'the usual, please'], sources: [cambridge('usual')],
  },
  recommend: {
    partOfSpeech: 'verb', grammar: 'transitive', grammarVi: 'ngoại động từ', uk: 'ˌrek.əˈmend', us: 'ˌrek.əˈmend', syllables: ['rec', 'om', 'mend'], stress: [2],
    meaning: 'To suggest something because you think it is a good choice.', meaningVi: 'Đề xuất điều bạn cho là tốt hoặc phù hợp.', synonyms: ['suggest', 'endorse'], antonyms: [],
    everyday: { text: 'Can you recommend a quiet place for lunch near here?', vi: 'Bạn giới thiệu giúp một chỗ ăn trưa yên tĩnh gần đây được không?' },
    ielts: { text: 'I would recommend expanding cycle lanes before introducing restrictions on private cars.', vi: 'Tôi đề xuất mở rộng làn đường xe đạp trước khi áp dụng hạn chế đối với ô tô cá nhân.' },
    use: 'Use “recommend doing something” or “recommend that someone do something”.', useVi: 'Dùng “recommend doing something” hoặc “recommend that someone do something”.', collocations: ['highly recommend', 'recommend a solution'], sources: [cambridge('recommend'), cambridge('recommend', true)],
  },
  takeaway: {
    partOfSpeech: 'noun', grammar: 'countable / uncountable · UK', grammarVi: 'đếm được / không đếm được · Anh Anh', uk: 'ˈteɪk.ə.weɪ', us: 'ˈteɪk.ə.weɪ', syllables: ['take', 'a', 'way'], stress: [0],
    meaning: 'Food or drink bought from a place and consumed elsewhere.', meaningVi: 'Đồ ăn hoặc thức uống mua để dùng ở nơi khác.', synonyms: ['takeout', 'carryout'], antonyms: [],
    everyday: { text: 'Let’s get a takeaway and eat it in the park.', vi: 'Mình mua đồ ăn mang đi rồi ra công viên ăn nhé.' },
    ielts: { text: 'The popularity of takeaway meals highlights the need for more sustainable food packaging.', vi: 'Sự phổ biến của đồ ăn mang đi cho thấy nhu cầu về bao bì thực phẩm bền vững hơn.' },
    use: '“Takeaway” is common in British English; “takeout” is common in American English.', useVi: '“Takeaway” phổ biến trong Anh Anh; “takeout” phổ biến trong Anh Mỹ.', collocations: ['a takeaway meal', 'order a takeaway'], sources: [cambridge('takeaway'), cambridge('takeout')],
  },
  contribute: {
    partOfSpeech: 'verb', grammar: 'intransitive / transitive', grammarVi: 'nội động từ / ngoại động từ', uk: 'kənˈtrɪb.juːt', us: 'kənˈtrɪb.juːt', syllables: ['con', 'trib', 'ute'], stress: [1],
    meaning: 'To give time, money, effort or ideas to a shared goal.', meaningVi: 'Đóng góp thời gian, tiền bạc, công sức hoặc ý tưởng cho mục tiêu chung.', synonyms: ['give', 'provide'], antonyms: [],
    everyday: { text: 'Everyone can contribute one idea for the team outing.', vi: 'Mỗi người có thể góp một ý tưởng cho chuyến đi chơi của nhóm.' },
    ielts: { text: 'Volunteering allows young people to contribute to their community while developing practical skills.', vi: 'Hoạt động tình nguyện giúp người trẻ đóng góp cho cộng đồng đồng thời phát triển kỹ năng thực tế.' },
    use: 'Use “contribute to” a project or “contribute something to” a cause. The UK also has a first-syllable-stressed variant.', useVi: 'Dùng “contribute to” một dự án hoặc “contribute something to” một mục đích. Anh Anh còn có biến thể nhấn âm đầu.', collocations: ['contribute to a project', 'contribute ideas'], sources: [cambridge('contribute')],
  },
  experience: {
    partOfSpeech: 'noun', grammar: 'uncountable · knowledge / skill', grammarVi: 'không đếm được · kiến thức / kỹ năng', uk: 'ɪkˈspɪə.ri.əns', us: 'ɪkˈspɪr.i.əns', syllables: ['ex', 'pe', 'ri', 'ence'], stress: [1],
    meaning: 'Knowledge or skill you gain by doing something.', meaningVi: 'Kiến thức hoặc kỹ năng tích lũy từ việc trực tiếp làm điều gì đó.', synonyms: ['firsthand knowledge', 'practice'], antonyms: ['inexperience'],
    everyday: { text: 'I don’t have much experience with gardening, but I’d love to learn.', vi: 'Tớ chưa có nhiều kinh nghiệm làm vườn, nhưng rất muốn học.' },
    ielts: { text: 'Work experience can help graduates connect theoretical knowledge with the demands of a real workplace.', vi: 'Kinh nghiệm làm việc có thể giúp sinh viên mới tốt nghiệp kết nối kiến thức lý thuyết với yêu cầu thực tế của nơi làm việc.' },
    use: '“Experience” is uncountable for skill. “An experience” means a particular event you lived through.', useVi: '“Experience” không đếm được khi nói về kinh nghiệm. “An experience” chỉ một trải nghiệm cụ thể.', collocations: ['gain experience', 'practical experience'], sources: [cambridge('experience'), cambridge('personal-knowledge', true)],
  },
  initiative: {
    partOfSpeech: 'noun', grammar: 'uncountable · ability', grammarVi: 'không đếm được · năng lực', uk: 'ɪˈnɪʃ.ə.tɪv', us: 'ɪˈnɪʃ.ə.t̬ɪv', syllables: ['i', 'ni', 'tia', 'tive'], stress: [1],
    meaning: 'The ability to notice what needs doing and act without being told.', meaningVi: 'Khả năng nhận ra việc cần làm và chủ động hành động mà không chờ nhắc.', synonyms: ['resourcefulness', 'enterprise'], antonyms: [],
    everyday: { text: 'Mina showed initiative by organising the shared files before anyone asked.', vi: 'Mina thể hiện sự chủ động khi sắp xếp các tệp dùng chung trước khi có ai nhờ.' },
    ielts: { text: 'Project-based learning can encourage initiative because students must make decisions for themselves.', vi: 'Học theo dự án có thể khuyến khích tính chủ động vì học sinh phải tự đưa ra quyết định.' },
    use: 'Say “show initiative” or “use your initiative”. “An initiative” means a new plan, a different sense.', useVi: 'Dùng “show initiative” hoặc “use your initiative”. “An initiative” mang nghĩa khác: một sáng kiến hoặc kế hoạch mới.', collocations: ['show initiative', 'use your initiative'], sources: [cambridge('initiative'), cambridge('initiative', true)],
  },
  adventure: {
    partOfSpeech: 'noun', grammar: 'countable / uncountable', grammarVi: 'đếm được / không đếm được', uk: 'ədˈven.tʃə', us: 'ədˈven.tʃɚ', syllables: ['ad', 'ven', 'ture'], stress: [1],
    meaning: 'An exciting or unusual experience, sometimes involving risk.', meaningVi: 'Một trải nghiệm thú vị hoặc khác thường, đôi khi có yếu tố mạo hiểm.', synonyms: ['escapade'], antonyms: [],
    everyday: { text: 'Taking the night train through the mountains felt like a real adventure.', vi: 'Đi tàu đêm qua núi khiến tớ có cảm giác đang trải qua một cuộc phiêu lưu thực sự.' },
    ielts: { text: 'For many young travellers, adventure matters more than comfort when choosing a holiday destination.', vi: 'Với nhiều du khách trẻ, sự phiêu lưu quan trọng hơn tiện nghi khi chọn điểm đến nghỉ dưỡng.' },
    use: '“An adventure” is an experience; “a sense of adventure” is a willingness to try exciting things.', useVi: '“An adventure” là một trải nghiệm; “a sense of adventure” là tinh thần thích thử những điều thú vị.', collocations: ['go on an adventure', 'a sense of adventure'], sources: [cambridge('adventure')],
  },
  'look forward to': {
    partOfSpeech: 'phrasal verb', uk: 'lʊk ˈfɔː.wəd tə', us: 'lʊk ˈfɔːr.wɚd tə', syllables: ['look', 'for', 'ward', 'to'], stress: [1], phraseStress: true,
    meaning: 'To feel happy and excited about a future event.', meaningVi: 'Mong đợi và háo hức về điều sắp xảy ra.', synonyms: ['eagerly anticipate'], antonyms: ['dread'],
    everyday: { text: 'I’m looking forward to cooking dinner with you this weekend.', vi: 'Tớ rất mong được nấu bữa tối cùng bạn vào cuối tuần này.' },
    ielts: { text: 'I look forward to studying in a multicultural environment where I can exchange ideas with people from different backgrounds.', vi: 'Tôi mong được học trong môi trường đa văn hóa, nơi có thể trao đổi ý tưởng với những người đến từ nhiều hoàn cảnh khác nhau.' },
    use: '“To” is a preposition here: follow it with a noun or an -ing verb, not an infinitive.', useVi: '“To” ở đây là giới từ: theo sau bằng danh từ hoặc động từ thêm -ing, không dùng động từ nguyên mẫu.', collocations: ['look forward to meeting you', 'look forward to a trip'], sources: [cambridge('look-forward-to'), { label: 'Cambridge Grammar', url: 'https://dictionary.cambridge.org/grammar/british-grammar/look-forward-to' }, { label: 'Component pronunciation', url: 'https://dictionary.cambridge.org/pronunciation/english/forward' }],
  },
  crisp: {
    partOfSpeech: 'adjective', grammar: 'weather / air', grammarVi: 'miêu tả thời tiết / không khí', uk: 'krɪsp', us: 'krɪsp', syllables: ['crisp'], stress: [0],
    meaning: 'Pleasantly cool and fresh, when describing the air or weather.', meaningVi: 'Mát lạnh và trong lành, dùng để miêu tả không khí hoặc thời tiết.', synonyms: ['fresh', 'bracing'], antonyms: [],
    everyday: { text: 'The air was crisp, so I put on a light jacket before our walk.', vi: 'Không khí se lạnh nên tớ mặc thêm áo khoác mỏng trước khi đi dạo.' },
    ielts: { text: 'I find crisp autumn mornings particularly refreshing, especially after the heat of summer.', vi: 'Tôi thấy những buổi sáng thu se lạnh đặc biệt dễ chịu, nhất là sau cái nóng mùa hè.' },
    use: 'In this sense, use crisp with “air”, “morning” or “weather”. Food can be crisp too, with a different meaning.', useVi: 'Trong nghĩa này, dùng crisp với “air”, “morning” hoặc “weather”. Crisp còn có nghĩa khác khi miêu tả đồ ăn.', collocations: ['crisp morning air', 'a crisp autumn day'], sources: [cambridge('crisp')],
  },
  peaceful: {
    partOfSpeech: 'adjective', uk: 'ˈpiːs.fəl', us: 'ˈpiːs.fəl', syllables: ['peace', 'ful'], stress: [0],
    meaning: 'Calm and quiet, without disturbance.', meaningVi: 'Yên bình, tĩnh lặng và không bị quấy rầy.', synonyms: ['tranquil', 'quiet'], antonyms: ['noisy', 'disturbed'],
    everyday: { text: 'The garden is peaceful before everyone wakes up.', vi: 'Khu vườn thật yên bình trước khi mọi người thức dậy.' },
    ielts: { text: 'Access to peaceful green spaces can improve the quality of life in densely populated cities.', vi: 'Khả năng tiếp cận không gian xanh yên bình có thể cải thiện chất lượng sống ở các thành phố đông dân.' },
    use: 'Here, peaceful describes a calm place. It can also describe the absence of war or violence.', useVi: 'Ở đây, peaceful miêu tả nơi yên tĩnh. Từ này còn có thể chỉ trạng thái không có chiến tranh hoặc bạo lực.', collocations: ['a peaceful neighbourhood', 'a peaceful atmosphere'], sources: [cambridge('peaceful'), cambridge('peaceful', true)],
  },
};

export function getLexiconEntry(word: string) { return lexicon[normalizeWord(word)]; }

export type DictionaryLookup = {
  phonetics: string[];
  senses: { partOfSpeech: string; definition: string; synonyms: string[]; antonyms: string[] }[];
  sources: string[];
  license?: { name: string; url: string };
};
const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object';
const strings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.length <= 100).slice(0, 8) : [];
const secureUrl = (value: unknown) => typeof value === 'string' && /^https:\/\//i.test(value) ? value : undefined;

/** Lookup is user-initiated; it supplements rather than overwrites saved data. */
export async function lookupDictionary(word: string, signal: AbortSignal): Promise<DictionaryLookup> {
  const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(normalizeWord(word))}`, { signal });
  if (!response.ok) throw new Error(response.status === 404 ? 'not-found' : 'unavailable');
  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.length || !isRecord(data[0])) throw new Error('not-found');
  const records = data.filter(isRecord).slice(0, 3);
  const phonetics = [...new Set(records.flatMap(record => [typeof record.phonetic === 'string' ? record.phonetic : '', ...(Array.isArray(record.phonetics) ? record.phonetics.filter(isRecord).map(item => typeof item.text === 'string' ? item.text : '') : [])]).filter(text => text && text.length < 120))].slice(0, 3);
  const senses = records.flatMap(record => Array.isArray(record.meanings) ? record.meanings.filter(isRecord).flatMap(meaning => {
    if (!Array.isArray(meaning.definitions)) return [];
    return meaning.definitions.filter(isRecord).slice(0, 2).flatMap(definition => typeof definition.definition === 'string' ? [{ partOfSpeech: typeof meaning.partOfSpeech === 'string' ? meaning.partOfSpeech.slice(0, 40) : '', definition: definition.definition.slice(0, 1000), synonyms: [...new Set([...strings(definition.synonyms), ...strings(meaning.synonyms)])].slice(0, 6), antonyms: [...new Set([...strings(definition.antonyms), ...strings(meaning.antonyms)])].slice(0, 6) }] : []);
  }) : []).slice(0, 4);
  if (!senses.length) throw new Error('not-found');
  const sources = [...new Set(records.flatMap(record => Array.isArray(record.sourceUrls) ? record.sourceUrls.map(secureUrl).filter((url): url is string => Boolean(url)) : []))].slice(0, 3);
  const rawLicense = records.find(record => isRecord(record.license))?.license;
  const license = isRecord(rawLicense) && typeof rawLicense.name === 'string' && secureUrl(rawLicense.url) ? { name: rawLicense.name.slice(0, 60), url: secureUrl(rawLicense.url)! } : undefined;
  return { phonetics, senses, sources, license };
}
