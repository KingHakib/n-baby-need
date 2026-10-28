/* ============================================================
   N Baby Need — Express · سایت + ادمین + چیکاوټ + وټساپ
   + ګالري + ټیلیګرام + آنلاین پرداخت
   ============================================================ */
const express=require('express'),session=require('express-session'),
      fs=require('fs'),path=require('path'),crypto=require('crypto'),https=require('https');
const PORT=process.env.PORT||3000;
const DATA=path.join(__dirname,'nbn-data');
const F={site:path.join(DATA,'site.json'),orders:path.join(DATA,'orders.json'),
  consults:path.join(DATA,'consults.json'),subs:path.join(DATA,'subs.json'),
  secret:path.join(DATA,'session-secret.txt')};
const UP=path.join(DATA,'uploads');
[DATA,UP].forEach(d=>{try{fs.mkdirSync(d,{recursive:true})}catch(e){}});

/* ---------------- ډیفالټ ډاټا (ps/fa/en) ---------------- */
const DEFAULTS={
brand:{nameEn:'N Baby Need',nameFa:'ان بيبي نيد',namePs:'ان بيبي نيد',logo:null},
theme:{paper:'#FAF4E8',card:'#FFFDF7',ink:'#33261A',clay:'#A9502C',radius:20,grain:true},
settings:{phone:'0790 000 000',whatsapp:'0790 000 000',deliveryFee:60,
 telegram:{token:'',chat:''},
 pay:{enabled:false,apiKey:'',endpoint:'https://api.hesabpay.com/api/v1/payment-requests'},
 currency:{en:'AFN',fa:'افغانی',ps:'افغانۍ'},
 addr:{en:'N Baby Need Kitchen, Kabul',fa:'آشپزخانهٔ ان بيبي نيد، کابل',ps:'د ان بيبي نيد پخلنځی، کابل'},
 bar:{en:'Free pediatric nutrition hotline — 0790 000 000 · Sat–Thu, 9:00–17:00',
      fa:'خط مشاورهٔ رایگان تغذیهٔ کودک — ۰۷۹۰ ۰۰۰ ۰۰۰ · شنبه تا پنجشنبه، ۹ تا ۱۷',
      ps:'د ماشومانو د تغذیې وړیا مشورتي کرښه — ۰۷۹۰ ۰۰۰ ۰۰۰ · شنبه تر پنجشنبې، ۹ تر ۵'},
 heroImg:null,promos:[{code:'WELCOME',pct:10}],
 show:{mq:1,stages:1,products:1,promise:1,nutrition:1,stories:1,care:1}},
stages:[
 {range:{en:'0–6 m',fa:'۰–۶ ماهگی',ps:'۰–۶ م'},color:'#E08A5F',soft:'#F2DACB',
  name:{en:'First light',fa:'نورِ اول',ps:'لومړنۍ رڼا'},
  feed:{en:'Breast milk or Stage 1 gentle milk — nothing else is needed yet.',fa:'شیر مادر یا شیر خشک مرحلهٔ ۱ — فعلاً هیچ‌چیز دیگری لازم نیست.',ps:'د مور شید یا د پړاو ۱ نرم شید — نور هیڅ څه اړتیا نشته.'},
  milestones:{en:['Lifts the head at tummy time','Follows faces and light','First social smiles'],fa:['در دَمرَو سرش را بالا می‌آورد','چهره‌ها و نور را دنبال می‌کند','نخستین لبخندهای اجتماعی'],ps:['پر خېټه پرتله سر جګوي','مخونه او رڼا تعقیبوي','لومړني ټوکي']},
  focus:{en:['DHA & ARA','Vitamin D','Gentle iron'],fa:['DHA و ARA','ویتامین D','آهنِ ملایم'],ps:['DHA او ARA','وټامین D','نرمه اوسپنه']}},
 {range:{en:'6–12 m',fa:'۶–۱۲ ماهگی',ps:'۶–۱۲ م'},color:'#8A9B6E',soft:'#DDE4D0',
  name:{en:'First tastes',fa:'نخستین چشیدن‌ها',ps:'لومړني خوندونه'},
  feed:{en:'Iron-fortified porridge, single-fruit purées; one new food every 3 days.',fa:'فرنیِ غنی از آهن، پورهٔ میوه‌های تکی؛ هر سه روز یک غذای جدید.',ps:'د اوسپنې سره پیاوړی فرنی، د یوې مېوې پورې؛ هرې درې ورځې یو نوی خواړه.'},
  milestones:{en:['Sits with a little support','Reaches for the spoon','Babbles and says “mama”'],fa:['با کمکِ کم می‌نشیند','به سمت قاشق دست دراز می‌کند','غش‌غش می‌کند و «ماما» می‌گوید'],ps:['لږ مرستې سره کښيني','قاشوغې ته لاس غزوي','غږونه کوي او «ماما» وايي']},
  focus:{en:['Iron','Fruit & veg purées','Texture play'],fa:['آهن','پورهٔ میوه و سبزی','بازیِ بافت'],ps:['اوسپنه','د مېوو او سبزیجاتو پورې','د جوړښت لوبه']}},
 {range:{en:'12–24 m',fa:'۱۲–۲۴ ماهگی',ps:'۱۲–۲۴ م'},color:'#D9A441',soft:'#F0E2C0',
  name:{en:'Little explorer',fa:'کوچک‌ترین کاشف',ps:'کوچنی پلټونکی'},
  feed:{en:'Soft family foods, Little Bisks for pincer grip, two dairy servings a day.',fa:'غذاهای نرم خانوادگی، بیسکویت کوچک برای گرفتن با انگشت، دو واحد لبنیات در روز.',ps:'نرم کورني خواړه، د کوچنیو ګوتو لپاره بیسکوټ، په ورځ کې دوه ځله شیدو توکي.'},
  milestones:{en:['First wobbly steps','Holds a spoon (almost!)','Points at what they want'],fa:['نخستین قدم‌های لرزان','قاشق را نگه می‌دارد (تقریباً!)','به خواسته‌اش اشاره می‌کند'],ps:['لومړني لړزېدونکي ګامه','قاشوغه نیسي (نږدې!)','خپلې غوښتنې ته اشاره کوي']},
  focus:{en:['Calcium & protein','Self-feeding','Family meals'],fa:['کلسیم و پروتئین','خودخوری','غذای خانواده'],ps:['کلسیم او پروټین','په ځان خوړل','کورني خواړه']}},
 {range:{en:'24–36 m',fa:'۲۴–۳۶ ماهگی',ps:'۲۴–۳۶ م'},color:'#C96F4A',soft:'#EFD4C5',
  name:{en:'Bright toddler',fa:'نورسِ شیطون',ps:'روښانه کوچنی'},
  feed:{en:'Balanced plates and smart snacks — no added sugar, so the play never runs out.',fa:'بشقاب‌های متعادل و میان‌وعده‌های هوشمند — بدون شکر افزوده، تا انرژیِ بازی تمام‌نشود.',ps:'بیلانس شوي پلیټونه او هوښیار خواږه — پرته له اضافي بورې، چې د لوبې انرژي نه ختمېږي.'},
  milestones:{en:['Runs — and rarely stops','Speaks in little sentences','Feeds themselves fully'],fa:['می‌دود (و بند نمی‌آید!)','جمله‌های کوچک می‌سازد','کاملاً خودش غذا می‌خورد'],ps:['منډه کوي — او نه درېږي','کوچنۍ جملې جوړوي','بشپړ په ځان خوري']},
  focus:{en:['Energy for play','Omega-3','Smart snacks'],fa:['انرژی برای بازی','امگا ۳','میان‌وعدهٔ هوشمند'],ps:['د لوبې انرژي','امګا ۳','هوښیار خواږه']}}],
products:[
 {id:'porridge',pkg:'box',stage:1,price:350,stock:40,plabel:'CEREAL',tilt:-2,img:null,imgs:[],
  name:{en:'First Porridge',fa:'فرنیِ اول',ps:'لومړنی فرنی'},
  tag:{en:'Iron-fortified rice + oat cereal',fa:'غلهٔ برنج و جو، غنی از آهن',ps:'د اوسپنې سره پیاوړی د وربشو او جو فرنی'},
  notes:{en:['No added sugar','Iron +','Ready in 3 min'],fa:['بدون شکر افزوده','آهن +','آماده در ۳ دقیقه'],ps:['پرته له اضافي بورې','اوسپنه +','په ۳ دقیقو کې چمتو']}},
 {id:'milk1',pkg:'tin',stage:0,price:900,stock:25,plabel:'MILK · 1',tilt:1.5,img:null,imgs:[],
  name:{en:'Stage 1 Gentle Milk',fa:'شیر ملایم · مرحلهٔ ۱',ps:'نرم شید · پړاو ۱'},
  tag:{en:'From birth up to 6 months',fa:'از تولد تا ۶ ماهگی',ps:'له زیږون څخه تر ۶ میاشتو پورې'},
  notes:{en:['DHA & ARA','No added sugar','Probiotic'],fa:['DHA و ARA','بدون شکر افزوده','پروبیوتیک'],ps:['DHA او ARA','پرته له اضافي بورې','پروبیوتیک']}},
 {id:'puree',pkg:'jar',stage:1,price:120,stock:60,plabel:'PURÉE',tilt:-1.5,img:null,imgs:[],
  name:{en:'Apple & Carrot Purée',fa:'پورهٔ سیب و هویج',ps:'د مڼې او ګازر پورې'},
  tag:{en:'Single-orchard fruit & veg',fa:'میوه و سبزی از یک باغ',ps:'له یوه باغ څخه مېوه او سبزي'},
  notes:{en:['No added sugar','No salt','Summer harvest'],fa:['بدون شکر افزوده','بدون نمک','برداشت تابستان'],ps:['پرته له اضافي بورې','پرته له مالګې','د اوړي حاصلات']}},
 {id:'bisks',pkg:'pack',stage:2,price:180,stock:50,plabel:'BISKS',tilt:2,img:null,imgs:[],
  name:{en:'Little Bisks',fa:'بیسکویت‌های کوچک',ps:'کوچني بیسکوټ'},
  tag:{en:'Banana & oat, for little fingers',fa:'موز و جو، برای انگشتان کوچک',ps:'کېله او جو، د کوچنیو ګوتو لپاره'},
  notes:{en:['Whole grain','No added sugar','Melts easily'],fa:['غلهٔ کامل','بدون شکر افزوده','آسان‌حل'],ps:['ټول غله','پرته له اضافي بورې','ژر حلېږي']}},
 {id:'milk2',pkg:'tin',stage:1,price:850,stock:20,plabel:'MILK · 2',tilt:-1,img:null,imgs:[],
  name:{en:'Stage 2 Follow-on Milk',fa:'شیر پیگیر · مرحلهٔ ۲',ps:'تعقیبي شید · پړاو ۲'},
  tag:{en:'6–12 months, iron + calcium',fa:'۶ تا ۱۲ ماهگی، آهن و کلسیم',ps:'۶ تر ۱۲ میاشتې، اوسپنه + کلسیم'},
  notes:{en:['Iron +','No palm oil','Calcium'],fa:['آهن +','بدون روغن پالم','کلسیم'],ps:['اوسپنه +','پرته له پالم غوړي','کلسیم']}},
 {id:'mash',pkg:'pouch',stage:2,price:150,stock:35,plabel:'MASH',tilt:1.5,img:null,imgs:[],
  name:{en:'Mango Oat Mash',fa:'پورهٔ انبه و جو',ps:'د امبو او جو پورې'},
  tag:{en:'Spouted pouch for out-days',fa:'پاکت دستی برای روزهای بیرون',ps:'د باندې ورځو لپاره د لاس پاکټ'},
  notes:{en:['No added sugar','Fibre','No preservatives'],fa:['بدون شکر افزوده','فیبر','بدون نگهدارنده'],ps:['پرته له اضافي بورې','فایبر','پرته له ساتونکو']}},
 {id:'muesli',pkg:'box',stage:3,price:320,stock:30,plabel:'MUESLI',tilt:-1.5,img:null,imgs:[],
  name:{en:'Toddler Muesli',fa:'موسلیِ نورس',ps:'د کوچنیانو موسلي'},
  tag:{en:'Barley, date & almond',fa:'جو، خرما و بادام',ps:'جو، خرما او بادام'},
  notes:{en:['Whole grain','No added sugar','Omega-3'],fa:['غلهٔ کامل','بدون شکر افزوده','امگا ۳'],ps:['ټول غله','پرته له اضافي بورې','امګا ۳']}}],
nutrients:[
 {color:'#C96F4A',val:7.2,unit:'mg',pct:52,name:{en:'Iron',fa:'آهن',ps:'اوسپنه'},
  desc:{en:'Builds blood and brain. Iron deficiency is the most common nutritional gap in infancy — we fortify every cereal.',fa:'سازندهٔ خون و مغز است. کمبود آهن، شایع‌ترین کمبود تغذیه‌ای شیرخواران است — همهٔ غله‌های ما غنی‌شده‌اند.',ps:'د وینې او مغز جوړوونکې ده. د اوسپنې کموالی د شېدونکو تر ټولو عادي غذایي ستونزه ده — زموږ ټول فرني پیاوړي شوي دي.'}},
 {color:'#8A9B6E',val:18,unit:'mg',pct:38,name:{en:'DHA',fa:'DHA',ps:'DHA'},
  desc:{en:'The structural fat of the brain and eyes, sourced from algae — never fish.',fa:'چربیِ سازندهٔ مغز و چشم، تأمین‌شده از جلبک — هرگز ماهی.',ps:'د مغز او سترګو جوړښتي چربی، له طحالبو څخه — هیڅکله له کب نه.'}},
 {color:'#D9A441',val:320,unit:'mg',pct:40,name:{en:'Calcium',fa:'کلسیم',ps:'کلسیم'},
  desc:{en:'Bones do half of their growing in the first three years. Calcium shows up early and stays late.',fa:'استخوان‌ها نیمی از رشدشان را در سه سال اول انجام می‌دهند. کلسیم زود می‌آید و دیر می‌ماند.',ps:'هډوکي په لومړیو درېو کلونو کې خپل نیمايي وده کوي. کلسیم ژر راځي او ناوخته ښکته کیږي.'}},
 {color:'#E08A5F',val:6.4,unit:'µg',pct:64,name:{en:'Vitamin D',fa:'ویتامین D',ps:'وټامین D'},
  desc:{en:'Calcium without vitamin D barely absorbs. We always pair the two — chemistry is a team sport.',fa:'کلسیم بدون ویتامین D به‌سختی جذب می‌شود. ما همیشه این دو را با هم می‌آوریم — شیمی، کارِ تیمی است.',ps:'کلسیم له وټامین D پرته سخت جذبیږي. موږ تل دواړه یو ځای راوړو — کیمیا د ټیم کار دی.'}}],
stories:[
 {icon:'#i-sun',color:'#8A9B6E',soft:'#DDE4D0',
  title:{en:'The first 1,000 days',fa:'هزار روزِ اول',ps:'لومړنۍ زره ورځې'},
  dek:{en:'Why the window before the third birthday matters more than any other.',fa:'چرا پنجرهٔ پیش از سومین تولد، از هر زمان دیگری مهم‌تر است.',ps:'ولې درېیمې زوکړې مخکې وخت له هر بل وخت نه مهم دی.'},
  meta:{en:'Science · 6 min',fa:'علم · ۶ دقیقه',ps:'علم · ۶ دقیقې'},
  body:{en:['From conception to a child’s third birthday, the body builds faster than it ever will again. The brain forms more than a million neural connections every second — and every one of them is constructed from what arrives on the spoon.','No single meal matters — the pattern does: iron most days, protein twice a day, colour on the plate, patience at the table. At N Baby Need we design for the pattern, not the moment.'],
   fa:['از آغاز تا سومین تولد، بدن انسان سریع‌تر از هر زمان دیگری ساخته می‌شود. مغز هر ثانیه بیش از یک میلیون پیوند عصبی می‌سازد — و هر پیوند از چیزی می‌آید که روی قاشق است.','هیچ وعده‌ای به‌تنهایی اهمیت ندارد؛ الگو مهم است: آهن در بیشتر روزها، پروتئین دو بار در روز، رنگ روی بشقاب، و صبر سرِ میز. ما برای الگو طراحی می‌کنیم، نه برای لحظه.'],
   ps:['له زیږون څخه تر درېیمې زوکړې پورې، د انسان بدن له هر بل وخت نه ژر جوړیږي. مغز په هره ثانیه کې له یو میلیون څخه زیاتې عصبي اړیکې جوړوي — او هره یوه له هغه څه جوړیږي چې پر قاشوغه راځي.','هیڅ یوه خواړه یوازې مهمه نه ده؛ الګو مهمه ده: په ډېرو ورځو کې اوسپنه، په ورځ کې دوه ځله پروټین، پر پلیټ رنګ، او پر مېز صبر. موږ د الګو لپاره ډیزاین کوو، نه د یوې شېبې.']}},
 {icon:'#i-bowl',color:'#D9A441',soft:'#F0E2C0',
  title:{en:'Starting solids, calmly',fa:'شروعِ کمکی، آرام',ps:'جامدو خوړو ته آرام پیل'},
  dek:{en:'A no-drama method for the first spoonfuls — signs, pacing, and the joy of mess.',fa:'روشی بی‌دردسر برای نخستین قاشق‌ها — نشانه‌ها، ریتم، و لذتِ بی‌نظمی.',ps:'د لومړنیو قاشوغو لپاره بې غمې طریقه — نښې، چلند، او د ککړتیا خوښي.'},
  meta:{en:'Guide · 8 min',fa:'راهنما · ۸ دقیقه',ps:'لارښود · ۸ دقیقې'},
  body:{en:['Your baby is ready for solids when they can sit with little support, reach for your plate with intent, and have lost the tongue-thrust reflex — not because the calendar says so.','The calm method: one new food, every three days. Textures early — lumps are not a hazard, they are a lesson. And let the mess happen; a face full of purée is data, not failure.'],
   fa:['کودک شما وقتی برای غذای کمکی آماده است که با کمکِ کم بنشیند، با قصد به بشقاب شما دست دراز کند و رفلکس زبان فروکش کرده باشد — نه وقتی که تقویم بگوید.','روشِ آرام: هر سه روز، یک غذای جدید. بافت‌ها را زود شروع کنید؛ تکه‌ها خطر نیستند، درس‌اند. و اجازه دهید بی‌نظمی رخ دهد.'],
   ps:['ستا ماشوم هغه وخت جامدو خوړو ته چمتو دی چې لږ مرستې سره کښېناستلی شي، په قصد ستا پلیټ ته لاس وغځوي، او د ژبې ریفلکس یې ورک شوی وي.','آرامې طریقې: هرې درې ورځې، یو نوی خواړه. جوړښت ژر پیل کړه؛ ټوټې خطر نه دي، درسونه دي.']}},
 {icon:'#star5',color:'#C96F4A',soft:'#EFD4C5',
  title:{en:'Iron: the quiet hero',fa:'آهن؛ قهرمانِ ساکت',ps:'اوسپنه؛ چوپ قهرمان'},
  dek:{en:'The mineral that runs out at six months — and the cereal that quietly fixes it.',fa:'مادهٔ معدنی‌ای که شش‌ماهگی کم می‌شود، و فرنی‌ای که آرام جبرانش می‌کند.',ps:'هغه ماده چې په شپږ میاشتو کې کمېږي — او هغه فرني چې په آرامۍ سره یې جبرانوي.'},
  meta:{en:'Science · 5 min',fa:'علم · ۵ دقیقه',ps:'علم · ۵ دقیقې'},
  body:{en:['A baby is born with a private iron reserve — enough for roughly their first six months. Then the account runs low, exactly as solid foods arrive.','Prevention is simpler than correction: an iron-fortified cereal once or twice a day does most of the work. Pair it with vitamin C for better absorption.'],
   fa:['نوزاد با یک ذخیرهٔ خصوصیِ آهن به دنیا می‌آید — کافی برای حدود شش ماه اول. سپس حساب کم می‌شود، دقیقاً وقتی غذای کمکی می‌رسد.','پیشگیری ساده‌تر از جبران است: فرنیِ غنی از آهن، روزی یک‌دو بار. همراهش ویتامین C برای جذب بهتر.'],
   ps:['ماشوم د اوسپنې خصوصي زیرمې سره زیږي — د لومړیو شپږو میاشتو لپاره کافي. بیا حساب کمېږي، سمه هغه شېبه چې جامد خواړه راځي.','مخنیوی له جبران نه اسانه دی: د اوسپنې پیاوړی فرني، په ورځ کې یو دوه ځله. ورسره وټامین C د ښه جذب لپاره.']}},
 {icon:'#i-moon',color:'#E08A5F',soft:'#F2DACB',
  title:{en:'The evening bottle, reconsidered',fa:'شیشهٔ شب، از نو',ps:'د شپې بوتل، بیا کتل'},
  dek:{en:'Need or habit? A gentle framework for the decision every parent faces.',fa:'نیاز یا عادت؟ چارچوبی ملایم برای تصمیمی که هر والد با آن روبه‌روست.',ps:'اړتیا که عادت؟ د هغې پریکړې لپاره نرم چوکاټ چې هر مور پلار ورسره مخ دي.'},
  meta:{en:'Care · 7 min',fa:'مراقبت · ۷ دقیقه',ps:'پاملرنه · ۷ دقیقې'},
  body:{en:['Almost every parent eventually asks the same 2 a.m. question: is the night bottle a need, or a habit? The honest answer is usually both — and that is fine.','If it has quietly become the only road to sleep, soften it: move the bottle earlier in the routine, shorten it a few minutes each week, and let a calm voice and a dark room do the rest.'],
   fa:['تقریباً هر والد سرانجام همان سؤال ساعت دو بامداد را می‌پرسد: شیر شب، نیاز است یا عادت؟ پاسخ صادقانه معمولاً هر دو است — و همین خوب است.','اگر تنها راهِ خواب شده، نرمش کنید: شیشه را به اوایل روتین بیاورید، هر هفته چند دقیقه کوتاه‌ترش کنید.'],
   ps:['تقریباً هر مور پلار بالاخره همدغه پوښتنه کوي: د شپې شید اړتیا ده که عادت؟ ریښتینی ځواب معمولاً دواړه دي — او همدا سمه ده.','که یوازینۍ لار ویښتابه شوې، نرم یې کړه: بوتل د روټین په پیل کې راوړه، هره اونۍ څو دقیقې لنډ یې کړه.']}}],
legal:{
 privacy:{title:{en:'Privacy, briefly',fa:'حریم خصوصی، مختصر',ps:'محرمیت، لنډ'},paras:[
  {en:'Your order details are kept only for fulfilling your order and never shared.',fa:'اطلاعات سفارش شما فقط برای انجام سفارش نگه داشته می‌شود و هرگز به اشتراک گذاشته نمی‌شود.',ps:'ستا د سفارش معلومات یوازې د سفارش د بشپړولو لپاره ساتل کیږي او هیڅکله نه شریکوي.'},
  {en:'We contact you only about your order or consultation request.',fa:'فقط دربارهٔ سفارش یا درخواست مشاوره با شما تماس می‌گیریم.',ps:'یوازې د ستا د سفارش یا د مشورې د غوښتنې په اړه اړیکه نیسو.'}]},
 terms:{title:{en:'Terms, briefly',fa:'قوانین، مختصر',ps:'قانونونه، لنډ'},paras:[
  {en:'Product information is general. For your child’s health, always consult your pediatrician.',fa:'اطلاعات محصولات کلی است. برای سلامت کودکتان همیشه با پزشک اطفال مشورت کنید.',ps:'د توکو معلومات عمومي دي. د ستا د ماشوم روغتیا لپاره تل له اطفالو ډاکټر سره مشوره وکړه.'},
  {en:'Payment on delivery or online. Prices may change without notice.',fa:'پرداخت هنگام تحویل یا آنلاین. قیمت‌ها ممکن است تغییر کند.',ps:'پیسې د تحویل په وخت یا آنلاین. بیې کولای شي بدلي شي.'}]}},
texts:{
en:{doc_title:'Baby nutrition & care',nav_stages:'Ages & stages',nav_products:'Products',nav_nutrition:'Nutrition',nav_stories:'Stories',nav_care:'Care',cta_consult:'Book a consult',hero_kicker:'Baby nutrition & care · Kabul',hero_h1a:'Every little one deserves the',hero_h1b:'brightest start.',hero_sub:'Pick your baby’s stage — we’ll show you exactly what matters right now: the right foods, the right nutrients, the right pace.',scene_cap:'From first light to full noon',stage_word:'Stage',feed_label:'What to feed now:',focus_label:'Focus on',milestones_label:'Look for',mq1:'No added sugar',mq2:'Iron-fortified',mq3:'Pediatrician reviewed',mq4:'BPA-free packaging',mq5:'Grain from local fields',mq6:'No palm oil',mq7:'Gently dried, never fried',sec1_k:'01 · Ages & stages',sec1_t:'Four stages, one growing story',sec1_s:'Tap a stage to see what’s typical, what to offer, and what to stop worrying about.',sec2_k:'02 · The pantry',sec2_t:'Small jars, serious standards.',sec2_s:'Fresh staples with grain from local fields and fruit from the foothills. No added sugar, ever.',search_ph:'Search products…',chip_all:'All ages',add:'Add',outstock:'Out of stock',pr1_n:'0 g',pr1_t:'of added sugar in any recipe — sweetness comes from fruit, and nothing else.',pr2_n:'1,000',pr2_t:'days to build the foundations — we take that seriously, spoonful by spoonful.',pr3_n:'38',pr3_t:'quality checks on every production batch, from field to sealed jar.',sec3_k:'03 · Inside the spoon',sec3_t:'Every number, out loud.',sec3_s:'The full recipe maths — per 100 g of prepared cereal, not per vague “serving”. Tap a nutrient to see what it does.',n_daily:'of daily needs',n_per:'per 100 g prepared',sec4_k:'04 · Field notes',sec4_t:'Notes from the first thousand days',sec4_s:'Honest reads for tired, curious parents. Hover to peek, tap to read.',sec5_k:'05 · Care',sec5_t:'Talk to a real pediatric nutritionist.',sec5_s:'No bots, no scripts. A fifteen-minute call, free, in your language. Leave your number — we call back within one working day.',phone_label:'Free hotline',hours:'Sat–Thu · 9:00–17:00',f_name:'Your name',f_phone:'Phone number',f_age:'Baby’s age',f_topic:'What’s on your mind?',f_msg:'Anything else? (optional)',f_msg_ph:'e.g. my daughter refuses lumps…',f_pick:'Pick a topic…',f_submit:'Request a call back',f_again:'Book another',f_success_t:'We’ll call you soon',f_success_s:'Your request is in. A nutritionist will call within one working day, Sat–Thu.',e_name:'Please tell us your name',e_phone:'That phone number looks a little short',a0:'0–6 months',a1:'6–12 months',a2:'12–24 months',a3:'24–36 months',top1:'Starting solids',top2:'Formula choice',top3:'Allergies',top4:'Sleep & routine',ft_news_t:'One gentle letter a month',ft_news_s:'Recipes, seasonal guides and milestone notes. No noise, easy exit.',ft_ph:'your@email.com',ft_join:'Join',ft_learn:'Learn',ft_help:'Help',ft_legal:'Legal',ft_note:'Made with care in Kabul · since 2024',ft_bot1:'© 2025 N Baby Need · Kabul',ft_bot2:'“Every little one deserves the brightest start.”',cart_t:'Your basket',cart_empty:'Your basket is empty — the pantry awaits.',cart_total:'Total',sub_t:'Subtotal',del_t:'Delivery',disc_t:'Discount',free_t:'Free',checkout:'Checkout',t_added:'Added to your basket',t_form:'Request received — we will call you back.',t_news:'Welcome aboard. One gentle letter a month.',t_news_err:'That email doesn’t look right.',lg_privacy_t:'Privacy',lg_terms_t:'Terms',ck_t:'Checkout',ck_items:'Your order',ck_name:'Full name',ck_phone:'Phone number',ck_addr:'City & address',ck_note:'Note (optional)',ck_pay:'Payment',ck_cash:'Cash on delivery',ck_bank:'Bank transfer',ck_online:'Online payment (HesabPay)',ck_place:'Place order',ck_ok_t:'Order received!',ck_ok_s:'Thank you! We will call you shortly to confirm. Your order number:',ck_err:'Please fill name, phone and address correctly.',promo_ph:'Discount code',promo_apply:'Apply',promo_ok:'Code applied',promo_bad:'Code not valid',ws_btn:'Send order via WhatsApp',pay_now:'Pay now',track_t:'Track your order',track_ph:'e.g. NB-1001',track_btn:'Check',track_none:'No order found with this code.',order_t:'Orders',ord_empty:'No orders yet.',ord_call:'Customer',st_new:'New',st_conf:'Confirmed',st_done:'Delivered',st_cxl:'Cancelled',msgs_t:'Messages',cons_t:'Consult requests',subs_t:'Subscribers',cons_empty:'No requests yet.',subs_empty:'No subscribers yet.',del_btn:'Delete',t_order:'Order placed — thank you!',t_paid:'Payment received ✓',t_payfail:'Payment failed or cancelled'},
fa:{doc_title:'تغذیه و مراقبت کودک',nav_stages:'مراحل رشد',nav_products:'محصولات',nav_nutrition:'تغذیه',nav_stories:'دفترچه',nav_care:'مشاوره',cta_consult:'رزرو مشاوره',hero_kicker:'تغذیه و مراقبت کودک · کابل',hero_h1a:'هر کوچک، لایقِ',hero_h1b:'روشن‌ترین آغاز است.',hero_sub:'مرحلهٔ کودکتان را انتخاب کنید تا دقیقاً نشان دهیم همین حالا چه چیزی مهم است: غذاهای درست، مواد مغذیِ درست، ریتم درست.',scene_cap:'از نخستین نور تا نیم‌روزِ تمام',stage_word:'مرحله',feed_label:'الان چه بدهیم؟',focus_label:'تمرکزِ امروز',milestones_label:'نشانه‌هایی که دنبالش باشید',mq1:'بدون شکر افزوده',mq2:'غنی‌شده با آهن',mq3:'تأیید متخصص اطفال',mq4:'بسته‌بندی بدون BPA',mq5:'غله از مزارع محلی',mq6:'بدون روغن پالم',mq7:'خشکِ ملایم، نه سرخ‌شده',sec1_k:'۰۱ · مراحل رشد',sec1_t:'چهار مرحله، یک روایتِ رشد',sec1_s:'روی هر مرحله بزنید تا ببینید چه چیزی معمول است، چه بدهید، و از چه لازم نیست نگران باشید.',sec2_k:'۰۲ · قفسهٔ خوراک',sec2_t:'شیشه‌های کوچک، استانداردهای جدی.',sec2_s:'اصل‌های تازه با غلهٔ مزارع محلی و میوهٔ دامنه‌ها. بدون شکر افزوده، همیشه.',search_ph:'جست‌وجوی محصولات…',chip_all:'همهٔ سنین',add:'افزودن',outstock:'بس تمام شد',pr1_n:'۰ گرم',pr1_t:'شکرِ افزوده در هیچ دستوری — شیرینی فقط از میوه می‌آید، و هیچ‌چیز دیگر.',pr2_n:'۱٬۰۰۰',pr2_t:'روز برای ساختنِ پایه‌ها — جدی می‌گیریمش، قاشق‌به‌قاشق.',pr3_n:'۳۸',pr3_t:'کنترل کیفیت در هر دورهٔ تولید، از مزرعه تا درِ بستهٔ شیشه.',sec3_k:'۰۳ · درون قاشق',sec3_t:'هر عدد، بلند و واضح.',sec3_s:'حسابِ کامل دستور — بر اساس ۱۰۰ گرم فرنیِ آماده، نه «سرو» مبهم.',n_daily:'از نیاز روزانه',n_per:'در ۱۰۰ گرم آماده',sec4_k:'۰۴ · دفترچهٔ میدانی',sec4_t:'یادداشت‌هایی از هزار روزِ اول',sec4_s:'خواندنی‌هایی صادقانه برای والدینِ خسته و کنجکاو.',sec5_k:'۰۵ · مراقبت',sec5_t:'با متخصص تغذیهٔ اطفال حرف بزنید.',sec5_s:'ربات نیستیم. یک تماس پانزده‌دقیقه‌ای، رایگان. شماره‌تان را بگذارید.',phone_label:'خط ویژهٔ رایگان',hours:'شنبه تا پنجشنبه · ۹ تا ۱۷',f_name:'نام شما',f_phone:'شماره تماس',f_age:'سن کودک',f_topic:'موضوع مشاوره',f_msg:'نکته‌ای هست؟ (اختیاری)',f_msg_ph:'مثلاً: دخترم تکه‌های غذا را قبول نمی‌کند…',f_pick:'یک موضوع انتخاب کنید…',f_submit:'درخواست تماس',f_again:'ثبت درخواست دیگر',f_success_t:'به‌زودی تماس می‌گیریم',f_success_s:'درخواست شما ثبت شد. کارشناس ما حداکثر یک روز کاری تماس می‌گیرد.',e_name:'لطفاً نام‌تان را بنویسید',e_phone:'این شماره کمی کوتاه به‌نظر می‌رسد',a0:'۰ تا ۶ ماه',a1:'۶ تا ۱۲ ماه',a2:'۱۲ تا ۲۴ ماه',a3:'۲۴ تا ۳۶ ماه',top1:'شروع غذای کمکی',top2:'انتخاب شیر خشک',top3:'حساسیت‌ها',top4:'خواب و نظم روزانه',ft_news_t:'ماهی یک نامهٔ ملایم',ft_news_s:'دستور غذا، راهنماهای فصلی و یادداشت‌های رشد.',ft_ph:'ایمیل شما',ft_join:'عضویت',ft_learn:'دانستنی',ft_help:'راهنما',ft_legal:'قوانین',ft_note:'با عشق ساخته‌شده در کابل · از ۱۴۰۳',ft_bot1:'© ۲۰۲۵ ان بيبي نيد · کابل',ft_bot2:'«هر کوچک، لایقِ روشن‌ترین آغاز است»',cart_t:'سبد شما',cart_empty:'سبد خالی است — قفسه منتظر است.',cart_total:'مجموع نهایی',sub_t:'جمع سبد',del_t:'هزینهٔ ارسال',disc_t:'تخفیف',free_t:'رایگان',checkout:'ثبت سفارش',t_added:'به سبد اضافه شد',t_form:'درخواست رسید — به‌زودی تماس می‌گیریم.',t_news:'خوش آمدید؛ ماهی یک نامهٔ ملایم.',t_news_err:'این ایمیل درست به نظر نمی‌رسد.',lg_privacy_t:'حریم خصوصی',lg_terms_t:'قوانین',ck_t:'ثبت سفارش',ck_items:'سفارش شما',ck_name:'نام کامل',ck_phone:'شماره تماس',ck_addr:'شهر و نشانی',ck_note:'یادداشت (اختیاری)',ck_pay:'روش پرداخت',ck_cash:'نقدی هنگام تحویل',ck_bank:'انتقال بانکی',ck_online:'پرداخت آنلاین (HesabPay)',ck_place:'ثبت سفارش',ck_ok_t:'سفارش شما رسید!',ck_ok_s:'سپاسگزاریم! به‌زودی برای تأیید تماس می‌گیریم. شمارهٔ سفارش شما:',ck_err:'لطفاً نام، شماره و نشانی را درست پر کنید.',promo_ph:'کد تخفیف',promo_apply:'اعمال',promo_ok:'کد اعمال شد',promo_bad:'کد معتبر نیست',ws_btn:'ارسال سفارش در واتساپ',pay_now:'اوس پرداخت کنید',track_t:'پیگیری سفارش',track_ph:'مثلاً NB-1001',track_btn:'بررسی',track_none:'سفارشی با این شماره پیدا نشد.',order_t:'سفارش‌ها',ord_empty:'هنوز سفارشی نیست.',ord_call:'مشتری',st_new:'جدید',st_conf:'تأیید شده',st_done:'تحویل شده',st_cxl:'لغو شده',msgs_t:'پیغام‌ها',cons_t:'درخواست‌های مشاوره',subs_t:'مشترکان خبرنامه',cons_empty:'هنوز درخواستی نیست.',subs_empty:'هنوز مشترکی نیست.',del_btn:'حذف',t_order:'سفارش ثبت شد — سپاسگزاریم!',t_paid:'پرداخت دریافت شد ✓',t_payfail:'پرداخت ناموفق یا لغو شد'},
ps:{doc_title:'د ماشومانو خواړه او پاملرنه',nav_stages:'د ودې پړاوونه',nav_products:'توکي',nav_nutrition:'تغذیه',nav_stories:'لیکنې',nav_care:'مشوره',cta_consult:'مشوره واخلئ',hero_kicker:'د ماشومانو خواړه او پاملرنه · کابل',hero_h1a:'هر کوچنی د',hero_h1b:'ترڅرګند پیل مستحق دی.',hero_sub:'د خپل ماشوم پړاو وټاکه — موږ به درته ووایو چې همدا اوس څه مهم دي: سم خواړه، سمې غذايي مادې، سم چلند.',scene_cap:'له لومړنۍ رڼا تر روښانه غرمې پورې',stage_word:'پړاو',feed_label:'اوس څه ورکړو؟',focus_label:'د نن تمرکز',milestones_label:'دې نښو ته پام کوه',mq1:'پرته له اضافي بورې',mq2:'د اوسپنې سره پیاوړی',mq3:'د ماشومانو د ډاکټر منل شوې',mq4:'له BPA پاکه بسته‌بندي',mq5:'له سیمه‌ییزو کښتونو وربشې',mq6:'پرته له پالم غوړي',mq7:'نرم وچ شوی، نه غوړ شوی',sec1_k:'۰۱ · د ودې پړاوونه',sec1_t:'څلور پړاوونه، یوه ودې کیسه',sec1_s:'پر هر پړاو کېکاږه: څه عادي دي، څه ورکړه، او له څه ته اندېښنه نه ده اړتیا.',sec2_k:'۰۲ · د خوړو قفسه',sec2_t:'کوچنۍ کوزې، جدي معیارونه.',sec2_s:'تازه توکي له سیمه‌ییزو وربشو او د غونډو مېوو. پرته له اضافي بورې — تل.',search_ph:'توکي ولټوه…',chip_all:'ټول سني',add:'زیاتول',outstock:'بس پای ته ورسېد',pr1_n:'۰ ګرامه',pr1_t:'اضافي بوره په هیڅ دستور کې نه ده — خوږوالی یوازې له مېوې راځي، او بل هیڅ څه نه.',pr2_n:'۱٬۰۰۰',pr2_t:'ورځې د بنسټ جوړولو لپاره — په دې جدي یو، قاشوغې په قاشوغه.',pr3_n:'۳۸',pr3_t:'کیفیت کنټرول په هره تولیدي دوره کې، له کښته تر تړلې کوزې پورې.',sec3_k:'۰۳ · د قاشوغې دننه',sec3_t:'هر عدد، لوړ او څرګند.',sec3_s:'بشپړ حساب — پر ۱۰۰ ګرامه چمتو شوي فرني، نه پر مبهم «حصه».',n_daily:'له ورځنیو اړتیاوو',n_per:'په ۱۰۰ ګرامه چمتو شوي کې',sec4_k:'۰۴ · ساحوي لیکنې',sec4_t:'له لومړیو زرو ورځو لیکنې',sec4_s:'ریښتینې لیکنې د میندو پلرونو لپاره.',sec5_k:'۰۵ · پاملرنه',sec5_t:'له ماشومانو د تغذیې له ډاکټر سره خبرې وکړه.',sec5_s:'روباټ نه یو. د ۱۵ دقیقو تلیفوني خبرې، وړیا، ستا په ژبه.',phone_label:'وړیا کرښه',hours:'شنبه تر پنجشنبې · ۹ تر ۵',f_name:'ستا نوم',f_phone:'تلیفون شمېره',f_age:'د ماشوم عمر',f_topic:'د مشورې موضوع',f_msg:'بل څه؟ (اختیاري)',f_msg_ph:'لکه: لور مې ټوټې خواړه نه مني…',f_pick:'یوه موضوع وټاکه…',f_submit:'د اړیکې غوښتنه',f_again:'نورې غوښتنې لپاره',f_success_t:'ژر به اړیکه ونیسو',f_success_s:'غوښتنه ثبت شوه. زموږ کارپوه به تر یوې کاري ورځې تلیفون وکړي.',e_name:'مهرباني وکړه نوم ولیکه',e_phone:'دا شمېره ډېره لنډه ښکاري',a0:'۰ تر ۶ میاشتو',a1:'۶ تر ۱۲ میاشتو',a2:'۱۲ تر ۲۴ میاشتو',a3:'۲۴ تر ۳۶ میاشتو',top1:'د جامدو خوړو پیل',top2:'د فورمولا انتخاب',top3:'حساسیتونه',top4:'ویده کول او ورځنی نظم',ft_news_t:'میاشت کې یوه نرمه لیک',ft_news_s:'د خوړو دستورونه، فصلي لارښودونه او د ودې یادښتونه.',ft_ph:'ستا ایمیل',ft_join:'غړیتوب',ft_learn:'زده کړه',ft_help:'مرسته',ft_legal:'قانوني',ft_note:'په کابل کې په مینه جوړ شوی · له ۲۰۲۴ راهیسې',ft_bot1:'© ۲۰۲۵ ان بيبي نيد · کابل',ft_bot2:'«هر کوچنی د ترڅرګند پیل مستحق دی»',cart_t:'ستا ټوکرۍ',cart_empty:'ټوکرۍ تشه ده — قفسه انتظار کوي.',cart_total:'وروستی ټولټال',sub_t:'د ټوکرۍ جمع',del_t:'د لېږد بیه',disc_t:'تخفیف',free_t:'وړیا',checkout:'سفارش بشپړول',t_added:'ټوکرۍ ته ورګډ شو',t_form:'غوښتنه ترلاسه شوه — ژر به اړیکه ونیسو.',t_news:'ښه راغلې؛ میاشت کې یوه نرمه لیک.',t_news_err:'دا ایمیل سمه نه ښکاري.',lg_privacy_t:'محرمیت',lg_terms_t:'قانونونه',ck_t:'سفارش بشپړول',ck_items:'ستا سفارش',ck_name:'بشپړ نوم',ck_phone:'تلیفون شمېره',ck_addr:'ښار او پته',ck_note:'یادښت (اختیاري)',ck_pay:'د پیسو طریقه',ck_cash:'د تحویل په وخت نغدي',ck_bank:'بانکي انتقال',ck_online:'آنلاین پیسې (HesabPay)',ck_place:'سفارش ثبتول',ck_ok_t:'سفارش ترلاسه شو!',ck_ok_s:'مننه! د تایید لپاره ژر به اړیکه ونیسو. ستا د سفارش شمېره:',ck_err:'مهرباني وکړه نوم، شمېره او پته سمه ډکه کړه.',promo_ph:'د تخفیف کوډ',promo_apply:'پلي کول',promo_ok:'کوډ پلي شو',promo_bad:'کوډ سمه نه ده',ws_btn:'سفارش په وټساپ ولېږه',pay_now:'اوس پیسې ورکړه',track_t:'سفارش تعقیب کړه',track_ph:'لکه NB-1001',track_btn:'څېړل',track_none:'په دې شمېره سفارش ونه موندل شو.',order_t:'سفارشونه',ord_empty:'تر اوسه سفارش نشته.',ord_call:'پیرودونکی',st_new:'نوی',st_conf:'تایید شوی',st_done:'تحویل شوی',st_cxl:'لغوه شوی',msgs_t:'پیغامونه',cons_t:'د مشورې غوښتنې',subs_t:'د خبرپاڼې غړي',cons_empty:'تر اوسه غوښتنه نشته.',subs_empty:'تر اوسه غړی نشته.',del_btn:'حذف',t_order:'سفارش ثبت شو — مننه!',t_paid:'پیسې ترلاسه شوې ✓',t_payfail:'پیسې ناکامې یا لغوه شوې'}
}};

/* ---------------- مرستندویه ---------------- */
function readJSON(f){try{return JSON.parse(fs.readFileSync(f,'utf8'))}catch(e){return null}}
function writeJSON(f,o){const t=f+'.tmp'+process.pid;fs.writeFileSync(t,JSON.stringify(o,null,1),'utf8');fs.renameSync(t,f);}
function hashPw(pw){const s=crypto.randomBytes(16).toString('hex');return's$'+s+'$'+crypto.scryptSync(pw,s,32).toString('hex');}
function verifyPw(pw,st){try{const[,s,h]=st.split('$');return crypto.timingSafeEqual(Buffer.from(h,'hex'),Buffer.from(crypto.scryptSync(pw,s,32).toString('hex'),'hex'))}catch(e){return false}}
function deepMerge(b,o){if(o==null)return b;if(Array.isArray(b)||typeof b!=='object'||typeof o!=='object')return o;
 const out={...b};for(const k in o)out[k]=deepMerge(b?b[k]:undefined,o[k]);return out;}

/* ---------------- ډاټا ---------------- */
let SITE=readJSON(F.site);
if(!SITE||!Array.isArray(SITE.stages)){SITE=JSON.parse(JSON.stringify(DEFAULTS));SITE.admin={hash:hashPw('admin1234')};writeJSON(F.site,SITE);console.log('✓ site.json جوړ شو — رمز: admin1234');}
function sitePublic(){const m=deepMerge(DEFAULTS,SITE);delete m.admin;
 if(!Array.isArray(m.settings.promos))m.settings.promos=[];return m;}
function saveSite(){SITE=deepMerge(DEFAULTS,SITE);try{writeJSON(F.site,SITE);return true}catch(e){console.error(e.message);return false}}
function orders(){let o=readJSON(F.orders);if(!o||!Array.isArray(o.list))o={next:1001,list:[]};return o;}
const saveOrders=o=>{try{writeJSON(F.orders,o);return true}catch(e){return false}};
const simpleList=f=>{const a=readJSON(f);return Array.isArray(a)?a:[]};
function sessionSecret(){try{return fs.readFileSync(F.secret,'utf8').trim()}catch(e){const s=crypto.randomBytes(32).toString('hex');try{fs.writeFileSync(F.secret,s)}catch(_){}return s;}}

/* ---------------- ټیلیګرام خبرتیا ---------------- */
function tgSend(text){
 const c=(SITE.settings&&SITE.settings.telegram)||{};
 if(!c.token||!c.chat)return;
 const data=JSON.stringify({chat_id:c.chat,text});
 try{const req=https.request({hostname:'api.telegram.org',path:'/bot'+c.token+'/sendMessage',
   method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(data)}},()=>{});
  req.on('error',()=>{});req.write(data);req.end();}catch(e){}}

/* ---------------- HesabPay ---------------- */
function payCreate(order,origin){
 const c=(SITE.settings&&SITE.settings.pay)||{};
 if(!c.enabled||!c.apiKey||!c.endpoint)return Promise.resolve(null);
 const body=JSON.stringify({amount:order.total,order_id:order.id,currency:'AFN',
  callback_url:origin+'/api/pay-callback',redirect_url:origin+'/?payok='+order.id});
 return new Promise(resolve=>{
  try{const u=new URL(c.endpoint);
   const req=https.request({hostname:u.hostname,path:u.pathname+u.search,method:'POST',
    headers:{'Content-Type':'application/json','api-key':c.apiKey,'Content-Length':Buffer.byteLength(body)}},res=>{
     let d='';res.on('data',x=>d+=x);res.on('end',()=>{
      try{const j=JSON.parse(d);
       const url=j.payment_url||j.paymentUrl||j.url||j.redirect_url||(j.data&&(j.data.url||j.data.payment_url))||null;
       resolve(url);
      }catch(e){resolve(null);}});});
   req.on('error',()=>resolve(null));req.write(body);req.end();
  }catch(e){resolve(null);}});}

/* ---------------- App ---------------- */
const app=express();
app.use(express.json({limit:'8mb'}));
app.use(session({secret:sessionSecret(),resave:false,saveUninitialized:false,cookie:{maxAge:7*24*3600*1000,sameSite:'lax',httpOnly:true}}));
app.use('/uploads',express.static(UP,{maxAge:'7d'}));
app.use('/nbn-data',(req,res)=>res.status(404).end());
const isAdmin=r=>!!(r.session&&r.session.admin);
app.use((req,res,next)=>{if(!req.session.csrf)req.session.csrf=crypto.randomBytes(16).toString('hex');next();});
const csrfOK=r=>r.get('x-csrf')===r.session.csrf;
function needAdmin(req,res,fn){if(!isAdmin(req))return res.json({ok:false,error:'auth'});if(!csrfOK(req))return res.json({ok:false,error:'csrf'});fn();}
const findPromo=c=>(SITE.settings.promos||[]).find(p=>p.code&&p.code.toLowerCase()===String(c||'').toLowerCase()&&+p.pct>0);
const tries={};
const blocked=ip=>{const t=tries[ip];return t&&t.n>=8&&Date.now()-t.t<10*60*1000;};

/* ---------------- API ---------------- */
app.post('/api/login',(req,res)=>{
 const ip=req.socket.remoteAddress||'?';
 if(blocked(ip))return res.json({ok:false,error:'wait'});
 setTimeout(()=>{if(verifyPw(String(req.body.pw||''),SITE.admin.hash)){
   delete tries[ip];req.session.regenerate(()=>{req.session.admin=1;req.session.csrf=crypto.randomBytes(16).toString('hex');res.json({ok:true});});
 }else{const t=tries[ip]||{n:0};t.n++;t.t=Date.now();tries[ip]=t;res.json({ok:false,error:'wrong'});}},350);});
app.post('/api/logout',(req,res)=>req.session.destroy(()=>res.json({ok:true})));

app.post('/api/save',(req,res)=>needAdmin(req,res,()=>{
 const inS=req.body.site;if(!inS||!Array.isArray(inS.stages)||!Array.isArray(inS.products))return res.json({ok:false,error:'bad'});
 const prev=readJSON(F.site);inS.admin=prev&&prev.admin?prev.admin:SITE.admin;
 SITE=inS;res.json({ok:saveSite()});}));
app.post('/api/upload',(req,res)=>needAdmin(req,res,()=>{
 const m=String(req.body.data||'').match(/^data:image\/(jpeg|png|webp);base64,/);
 if(!m)return res.json({ok:false,error:'type'});
 const bin=Buffer.from(req.body.data.slice(req.body.data.indexOf(',')+1),'base64');
 if(bin.length>1600000)return res.json({ok:false,error:'size'});
 const name='u'+Date.now()+crypto.randomBytes(4).toString('hex')+'.'+(m[1]==='jpeg'?'jpg':m[1]);
 fs.writeFileSync(path.join(UP,name),bin);res.json({ok:true,url:'/uploads/'+name});}));
app.get('/api/export',(req,res)=>{if(!isAdmin(req))return res.json({ok:false});
 res.setHeader('Content-Disposition','attachment; filename="n-baby-need-backup.json"');res.json(sitePublic());});
app.post('/api/import',(req,res)=>needAdmin(req,res,()=>{
 const inS=req.body.site;if(!inS||!Array.isArray(inS.stages))return res.json({ok:false,error:'bad'});
 inS.admin=SITE.admin;SITE=inS;res.json({ok:saveSite()});}));
app.post('/api/reset',(req,res)=>needAdmin(req,res,()=>{
 const a=SITE.admin;SITE=JSON.parse(JSON.stringify(DEFAULTS));SITE.admin=a||{hash:hashPw('admin1234')};res.json({ok:saveSite()});}));
app.post('/api/password',(req,res)=>needAdmin(req,res,()=>{
 if(!verifyPw(String(req.body.cur||''),SITE.admin.hash))return res.json({ok:false,error:'wrong'});
 if(String(req.body.new||'').length<4)return res.json({ok:false,error:'short'});
 SITE.admin.hash=hashPw(String(req.body.new));res.json({ok:saveSite()});}));

app.post('/api/promo',(req,res)=>{
 const pr=findPromo(req.body.code);
 if(!pr)return res.json({ok:false});
 const sub=Math.max(0,+req.body.sub||0);
 res.json({ok:true,code:pr.code,pct:+pr.pct,discount:Math.round(sub*(+pr.pct)/100)});});

app.post('/api/order',async(req,res)=>{
 if(!csrfOK(req))return res.json({ok:false,error:'csrf'});
 const items=Array.isArray(req.body.items)?req.body.items:[],cust=req.body.customer||{};
 const name=String(cust.name||'').trim(),phone=String(cust.phone||'').trim(),
       addr=String(cust.addr||'').trim(),note=String(cust.note||'').trim().slice(0,400);
 let pay=req.body.pay==='online'?'online':req.body.pay==='bank'?'bank':'cash';
 if(name.length<2||phone.replace(/\D/g,'').length<8||addr.length<5)return res.json({ok:false,error:'fields'});
 const lines=[];let sub=0;
 for(const it of items){const q=Math.max(1,Math.min(99,parseInt(it.qty)||0));
  const p=SITE.products.find(x=>x.id===it.id);if(!p)continue;
  if(p.stock!=null&&p.stock<=0)continue;
  const use=Math.min(q,p.stock==null?q:p.stock);
  sub+=(+p.price||0)*use;lines.push({id:p.id,qty:use,price:+p.price||0,name:p.name.fa||p.name.en});
  if(p.stock!=null)p.stock=Math.max(0,p.stock-use);}
 if(!lines.length)return res.json({ok:false,error:'empty'});
 let discount=0,promoUsed=null;
 const pr=findPromo(req.body.promo);
 if(pr){promoUsed=pr.code;discount=Math.round(sub*(+pr.pct)/100);}
 const fee=(+SITE.settings.deliveryFee||0),total=Math.max(0,sub-discount)+fee;
 const o=orders(),id='NB-'+(o.next++);
 const order={id,time:new Date().toISOString(),status:'new',pay,promo:promoUsed,payStatus:pay==='online'?'pending':null,
  customer:{name,phone,addr,note},items:lines,sub,discount,fee,total};
 let payUrl=null;
 if(pay==='online'){
  payUrl=await payCreate(order,req.protocol+'://'+req.get('host'));
  if(!payUrl){order.pay='cash';order.payStatus=null;}}
 o.list.unshift(order);
 const okO=saveOrders(o),okS=saveSite();
 tgSend('🛒 نوی سفارش '+id+'\n'+name+' — '+phone+'\n'+addr+'\n'+
  lines.map(l=>l.name+' ×'+l.qty).join('، ')+'\n'+
  'ټولټال: '+total+' '+(SITE.settings.currency.fa||'')+
  (order.pay==='online'?' (آنلاین)':order.pay==='bank'?' (بانکي)':' (نغدي)'));
 res.json({ok:true,id,stored:okO&&okS,total,payUrl});});

app.get('/api/orders',(req,res)=>{if(!isAdmin(req))return res.json({ok:false});res.json({ok:true,list:orders().list});});
app.post('/api/order-status',(req,res)=>needAdmin(req,res,()=>{
 const o=orders(),it=o.list.find(x=>x.id===req.body.id);
 if(!it)return res.json({ok:false});
 if(['new','conf','done','cxl'].includes(req.body.status))it.status=req.body.status;
 res.json({ok:saveOrders(o)});}));
app.post('/api/order-delete',(req,res)=>needAdmin(req,res,()=>{
 const o=orders();o.list=o.list.filter(x=>x.id!==req.body.id);res.json({ok:saveOrders(o)});}));

app.get('/api/pay-callback',(req,res)=>{
 const code=String(req.query.order||req.query.order_id||'').trim();
 const o=orders(),it=o.list.find(x=>x.id===code);
 const okSt=['success','paid','true','1'].includes(String(req.query.status||'').toLowerCase());
 if(it){it.payStatus=okSt?'paid':'failed';
  if(okSt&&it.status==='new')it.status='conf';saveOrders(o);}
 res.redirect('/?payok='+encodeURIComponent(code)+'&st='+(it&&it.payStatus?it.payStatus:'failed'));});

app.get('/api/track',(req,res)=>{
 const code=String(req.query.code||'').trim().toUpperCase();
 const it=orders().list.find(x=>x.id.toUpperCase()===code);
 if(!it)return res.json({ok:false});
 res.json({ok:true,id:it.id,status:it.status,payStatus:it.payStatus,total:it.total,time:it.time});});

app.post('/api/consult',(req,res)=>{
 if(!csrfOK(req))return res.json({ok:false});
 const name=String(req.body.name||'').trim(),phone=String(req.body.phone||'').trim();
 if(name.length<2||phone.replace(/\D/g,'').length<8)return res.json({ok:false});
 const a=simpleList(F.consults);
 a.unshift({t:new Date().toISOString(),name,phone,age:String(req.body.age||'').slice(0,40),
   topic:String(req.body.topic||'').slice(0,60),msg:String(req.body.msg||'').slice(0,600)});
 writeJSON(F.consults,a.slice(0,500));
 tgSend('📩 نوی مشوره: '+name+' — '+phone+(req.body.topic?' · '+req.body.topic:''));
 res.json({ok:true});});
app.get('/api/consults',(req,res)=>{if(!isAdmin(req))return res.json({ok:false});res.json({ok:true,list:simpleList(F.consults)});});
app.post('/api/consult-del',(req,res)=>needAdmin(req,res,()=>{
 writeJSON(F.consults,simpleList(F.consults).filter(x=>x.t!==req.body.t));res.json({ok:true});}));
app.post('/api/subscribe',(req,res)=>{
 if(!csrfOK(req))return res.json({ok:false});
 const email=String(req.body.email||'').trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.json({ok:false});
 const a=simpleList(F.subs);if(!a.some(x=>x.email===email)){a.unshift({t:new Date().toISOString(),email});writeJSON(F.subs,a.slice(0,2000));}
 res.json({ok:true});});
app.get('/api/subs',(req,res)=>{if(!isAdmin(req))return res.json({ok:false});res.json({ok:true,list:simpleList(F.subs)});});
app.post('/api/subs-del',(req,res)=>needAdmin(req,res,()=>{
 writeJSON(F.subs,simpleList(F.subs).filter(x=>x.email!==req.body.email));res.json({ok:true});}));

/* ---------------- پاڼه ---------------- */
let PAGE=null;
try{PAGE=fs.readFileSync(path.join(__dirname,'index.html'),'utf8')}catch(e){}
app.get('/index.html',(req,res)=>res.redirect('/'));
app.get('/',(req,res)=>{
 if(!PAGE)return res.status(500).send('index.html نه موندل شو — له server.js سره په یو فولډر کي کېږده.');
 const pub=sitePublic();
 const inject=`<script>window.NBN=${JSON.stringify(pub).replace(/</g,'\\u003c')};window.NBN_CSRF='${req.session.csrf}';window.NBN_ADMIN=${isAdmin(req)?1:0};</script>`;
 res.send(PAGE.replace('<!--NBN_INJECT-->',inject));});
app.use(express.static(__dirname,{index:false,extensions:['html']}));
app.listen(PORT,()=>console.log(`✓ N Baby Need روان دی: http://localhost:${PORT}`));