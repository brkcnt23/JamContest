import { PrismaClient, GlobalRole, ContestStatus, ApprovalMode, SubscriptionTier } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const PASS = 'asd123';

// Avatar URL'leri
const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;

// Unsplash görselleri
const IMG = {
  illustration: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
  photography:  'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&q=80',
  gameJam:      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80',
  music:        'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200&q=80',
  writing:      'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80',
  animation:    'https://images.unsplash.com/photo-1626379953822-baec19c3accd?w=1200&q=80',
  uiux:         'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80',
  pixelart:     'https://images.unsplash.com/photo-1633356122102-3fe601e09bd2?w=800&q=80',
  architecture: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80',
  abstract:     'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
  nature:       'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  tech:         'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
  fashion:      'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80',
};

// Logo URL'leri (DiceBear icons as company logos)
const companyLogo = (seed: string) =>
  `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`;

async function main() {
  console.log('🌱 Marketing seed başlıyor...\n');
  const hash = await bcrypt.hash(PASS, 10);

  // ==========================================
  // 1. EK KULLANICILAR (20+ yaratıcı profil)
  // ==========================================

  const newUsers: any[] = [];

  const userDefs = [
    // Sanatçılar / İllüstratörler
    { email: 'deniz@artmail.co',       username: 'deniz_art',      displayName: 'Deniz Yıldız',     bio: 'Freelance dijital illüstratör. 6 yıldır çocuk kitapları ve oyun konseptleri çiziyorum.', tagline: 'Hayal gücünü fırçayla buluşturmak', portfolioLink: 'https://denizyildiz.art', contactInstagram: 'denizyildiz.art', contactBehance: 'denizyildiz', globalRole: GlobalRole.USER },
    { email: 'murat@creativemail.net', username: 'murat_pixel',   displayName: 'Murat Taş',        bio: 'Pixel art ve retro oyunlar tutkunu. Aseprite ile 16x16\'dan 128x128\'e her şeyi çizerim.', tagline: 'Piksellerle dünya kurmak', portfolioLink: 'https://murattas.itch.io', contactTwitter: 'murattas_pixel', globalRole: GlobalRole.USER },
    { email: 'aysun@artmail.co',       username: 'aysun_water',   displayName: 'Aysun Demir',      bio: 'Suluboya ve dijital karışık medya sanatçısı. Doğa, mitoloji ve rüya temaları.', tagline: 'Renklerin dansı', contactInstagram: 'aysunwatercolor', globalRole: GlobalRole.USER },
    { email: 'cagatay@creativemail.net', username: 'cagatay_3d',  displayName: 'Çağatay Korkmaz',  bio: '3D karakter modelleme ve rigging. Oyun stüdyoları için asset üretiyorum. ZBrush & Blender.', tagline: 'Heykeli dijitale taşımak', portfolioLink: 'https://artstation.com/cagatay3d', contactArtStation: 'cagatay3d', globalRole: GlobalRole.USER },

    // Fotoğrafçılar
    { email: 'leyla@photofocus.net',   username: 'leyla_photo',   displayName: 'Leyla Gezgin',     bio: 'Belgesel ve sokak fotoğrafçısı. 15 ülkede çekim yaptı. National Geographic Türkiye yayını.', tagline: 'Anı dondurmak', portfolioLink: 'https://leylagezgin.com', contactInstagram: 'leylagezginphoto', contactTwitter: 'leylagezgin', globalRole: GlobalRole.USER },
    { email: 'tarkan@photofocus.net',  username: 'tarkan_foto',   displayName: 'Tarkan Özkan',     bio: 'Doğa ve manzara fotoğrafçısı. Uzun pozlama ve astrofotoğrafi uzmanı.', tagline: 'Işığın peşinde', portfolioLink: 'https://tarkanozkan.photo', contactInstagram: 'tarkanophoto', globalRole: GlobalRole.USER },

    // Müzisyenler / Ses
    { email: 'ece@audiomail.net',      username: 'ece_music',     displayName: 'Ece Solmaz',       bio: 'Film ve oyun müziği bestecisi. Ambient, orkestral ve elektronik türlerde çalışıyorum.', tagline: 'Sessizliğe notalar eklemek', portfolioLink: 'https://soundcloud.com/ecesolmaz', contactTwitter: 'ecesolmazmusic', globalRole: GlobalRole.USER },
    { email: 'kerem@audiomail.net',    username: 'kerem_sound',   displayName: 'Kerem Yalçın',     bio: 'Ses tasarımcısı ve foley artist. 20+ indie oyuna ses ve müzik yaptım.', tagline: 'Her ses bir hikaye', portfolioLink: 'https://keremsound.design', contactInstagram: 'keremsoundesign', globalRole: GlobalRole.USER },

    // Geliştiriciler / Oyun
    { email: 'pelin@devhub.io',        username: 'pelin_dev',     displayName: 'Pelin Aksu',       bio: 'Unity & Unreal geliştirici. 5 indie oyun, 2 mobil uygulama. Oyun jam\'leri benim için yaşam tarzı.', tagline: 'Kodla sanat yapmak', portfolioLink: 'https://pelinaksu.dev', contactTwitter: 'pelinaksudev', globalRole: GlobalRole.USER },
    { email: 'cengiz@devhub.io',       username: 'cengiz_code',   displayName: 'Cengiz Bulut',     bio: 'Full-stack developer ve araç geliştirici. Yaratıcılar için open-source araçlar yazıyorum.', tagline: 'Araç yap, yaratıcılar kullansın', portfolioLink: 'https://github.com/cengizbulut', contactTwitter: 'cengizbulutdev', globalRole: GlobalRole.USER },

    // Tasarımcılar
    { email: 'damla@designhub.net',    username: 'damla_ui',      displayName: 'Damla Şener',      bio: 'Senior UI/UX tasarımcı. Fintech, SaaS ve oyun sektörlerinde 9 yıl deneyim.', tagline: 'Kullanıcı önce gelir', portfolioLink: 'https://damlasener.design', contactBehance: 'damlasener', globalRole: GlobalRole.USER },
    { email: 'yigit@designhub.net',    username: 'yigit_brand',   displayName: 'Yiğit Karaca',     bio: 'Marka kimliği ve logo tasarımı. 100+ markaya görsel kimlik oluşturdum.', tagline: 'Markaları görünür kılmak', portfolioLink: 'https://yigitkaraca.design', contactInstagram: 'yigitbranding', globalRole: GlobalRole.USER },

    // Yazarlar
    { email: 'gulce@writersden.net',   username: 'gulce_writer',  displayName: 'Gülce Özdemir',    bio: 'Kısa öykü yazarı ve içerik editörü. 2 kitap, 50+ yayınlanmış öykü.', tagline: 'Kelimelerle evren kurmak', portfolioLink: 'https://gulceozdemir.com', contactTwitter: 'gulceozdemirwriter', globalRole: GlobalRole.USER },
    { email: 'sinan@writersden.net',   username: 'sinan_script',  displayName: 'Sinan Aktaş',      bio: 'Senaryo yazarı ve storyboard sanatçısı. Animasyon ve kısa film projeleri.', tagline: 'Hikayenin iskeleti', portfolioLink: 'https://sinanaktas.art', contactInstagram: 'sinanstoryboard', globalRole: GlobalRole.USER },

    // Organizatör adayları
    { email: 'bahar@orgmail.co',       username: 'bahar_org',     displayName: 'Bahar Güneş',      bio: 'Kültür-sanat etkinlikleri organizatörü. 5 yıldır festival ve sergi düzenliyorum.', tagline: 'Sanatı birleştirmek', contactInstagram: 'bahargunesarts', globalRole: GlobalRole.ORGANIZER },
    { email: 'volkan@orgmail.co',      username: 'volkan_org',    displayName: 'Volkan Şimşek',    bio: 'Game jam ve hackathon organizatörü. Türkiye\'nin en büyük indie game jam\'ini yönettim.', tagline: 'Oyun geliştiricileri buluşturmak', contactTwitter: 'volkansimsekggj', globalRole: GlobalRole.ORGANIZER },

    // Şirket / Recruiter profilleri
    { email: 'ik@dreamforge.co',       username: 'dreamforge_hr', displayName: 'DreamForge Games', bio: 'Bağımsız oyun stüdyosu. Yetenekli sanatçı ve geliştiriciler arıyoruz.', tagline: 'Hayalleri oyuna dönüştürüyoruz', portfolioLink: 'https://dreamforge.games', globalRole: GlobalRole.USER },
    { email: 'hr@pixelminds.co',       username: 'pixelminds_hr', displayName: 'PixelMinds Studio', bio: 'Mobil oyun ve interaktif deneyim stüdyosu. 50+ kişilik ekip.', tagline: 'Piksellerin ötesini düşün', portfolioLink: 'https://pixelminds.studio', globalRole: GlobalRole.USER },
    { email: 'talent@kreatifajans.co',  username: 'kreatif_hr',   displayName: 'Kreatif Ajans',    bio: 'Tam hizmet reklam ajansı. Görsel tasarım, motion graphics ve içerik üretimi.', tagline: 'Fikirleri görünür kılmak', portfolioLink: 'https://kreatifajans.com', globalRole: GlobalRole.USER },
    { email: 'recruit@techarts.co',    username: 'techarts_hr',   displayName: 'TechArts Digital',  bio: 'Dijital ürün stüdyosu. SaaS, mobil ve web platformları geliştiriyoruz.', tagline: 'Teknoloji ve sanat bir arada', portfolioLink: 'https://techarts.digital', globalRole: GlobalRole.USER },
    { email: 'jobs@storyforge.co',     username: 'storyforge_hr', displayName: 'StoryForge Media',  bio: 'Animasyon ve VFX stüdyosu. Netflix ve Disney+ için içerik üretiyoruz.', tagline: 'Hikayeleri canlandırmak', portfolioLink: 'https://storyforge.media', globalRole: GlobalRole.USER },
  ];

  for (const u of userDefs) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { ...u, passwordHash: hash, emailVerified: true, avatar: avatar(u.username) },
      create: { ...u, passwordHash: hash, emailVerified: true, avatar: avatar(u.username), language: 'tr' },
    });
    newUsers.push(user);
  }

  const allUsers = await prisma.user.findMany();
  const userMap = new Map<string, any>();
  for (const u of allUsers) {
    userMap.set(u.username, u);
    userMap.set(u.email, u);
  }

  console.log(`✅ ${newUsers.length} yeni kullanıcı (toplam ${allUsers.length})`);

  // ==========================================
  // 2. ABONELİKLER — bazı kullanıcılar premium
  // ==========================================

  const plans = await prisma.subscriptionPlan.findMany();
  const planMap = new Map(plans.map(p => [p.tier, p]));

  const subscriptions = [
    { email: 'deniz@artmail.co',       tier: 'CREATOR' },
    { email: 'murat@creativemail.net', tier: 'PRO' },
    { email: 'cagatay@creativemail.net', tier: 'CREATOR' },
    { email: 'damla@designhub.net',    tier: 'PRO' },
    { email: 'pelin@devhub.io',        tier: 'CREATOR' },
    { email: 'ece@audiomail.net',      tier: 'CREATOR' },
    { email: 'ik@dreamforge.co',       tier: 'RECRUITER_BASIC' },
    { email: 'hr@pixelminds.co',       tier: 'RECRUITER_PRO' },
    { email: 'talent@kreatifajans.co',  tier: 'RECRUITER_BASIC' },
    { email: 'recruit@techarts.co',    tier: 'RECRUITER_PRO' },
    { email: 'jobs@storyforge.co',     tier: 'RECRUITER_ENTERPRISE' },
    { email: 'organizer1@jamcontest.com', tier: 'PRO' },
    { email: 'organizer2@jamcontest.com', tier: 'CREATOR' },
  ];

  for (const sub of subscriptions) {
    const user = userMap.get(sub.email);
    const plan = planMap.get(sub.tier as SubscriptionTier);
    if (!user || !plan) continue;

    await prisma.userSubscription.upsert({
      where: { userId: user.id },
      update: { planId: plan.id, status: 'ACTIVE', autoRenew: plan.price > 0 },
      create: {
        userId: user.id,
        planId: plan.id,
        status: 'ACTIVE',
        autoRenew: plan.price > 0,
        startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Mock transaction for the subscription
    if (plan.price > 0) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          amount: plan.price,
          currency: 'TRY',
          status: 'COMPLETED',
          method: 'MOCK',
          description: `${plan.name} aylık abonelik`,
          completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log(`✅ ${subscriptions.length} abonelik oluşturuldu`);

  // ==========================================
  // 3. SPONSOR PAKETLERİ ve SPONSORLUKLAR
  // ==========================================

  const sponsorPackages = [
    { name: 'Silver',  price: 2500,  features: JSON.stringify(['Logo footer\'da', 'Yarışma sayfasında mention']) },
    { name: 'Gold',    price: 7500,  features: JSON.stringify(['Featured sponsor', 'Aylık rapor', 'Sosyal medya paylaşımı']) },
    { name: 'Platinum', price: 15000, features: JSON.stringify(['Homepage logo', 'Detaylı analiz', 'Özel yarışma dashboard\'u', 'Priority support']) },
  ];

  const createdPackages: any[] = [];
  for (const pkg of sponsorPackages) {
    let existing = await prisma.sponsorPackage.findFirst({ where: { name: pkg.name } });
    if (!existing) {
      existing = await prisma.sponsorPackage.create({ data: pkg });
    }
    createdPackages.push(existing);
  }

  const activeContests = await prisma.contest.findMany({
    where: { status: { in: ['ACTIVE', 'APPLICATIONS', 'JUDGING', 'SUBMISSION_CLOSED'] } },
  });

  // Sponsorluklar
  const sponsorships = [
    { email: 'ik@dreamforge.co',      packageIdx: 1, contestIdx: 0 },
    { email: 'hr@pixelminds.co',      packageIdx: 2, contestIdx: 0 },
    { email: 'recruit@techarts.co',   packageIdx: 0, contestIdx: 1 },
    { email: 'talent@kreatifajans.co', packageIdx: 1, contestIdx: 2 },
    { email: 'jobs@storyforge.co',    packageIdx: 2, contestIdx: 1 },
  ];

  for (const s of sponsorships) {
    const sponsor = userMap.get(s.email);
    const contest = activeContests[s.contestIdx % activeContests.length];
    const pkg = createdPackages[s.packageIdx % createdPackages.length];
    if (!sponsor || !contest || !pkg) continue;

    try {
      await prisma.sponsorSponsorship.create({
        data: {
          sponsorId: sponsor.id,
          contestId: contest.id,
          packageId: pkg.id,
          amount: pkg.price,
          status: 'ACTIVE',
          startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      });
    } catch { /* skip duplicates */ }
  }

  console.log(`✅ ${sponsorships.length} sponsorluk oluşturuldu`);

  // ==========================================
  // 4. EK YARIŞMALAR
  // ==========================================

  const now = new Date();
  const d = (offsetDays: number) => new Date(now.getTime() + offsetDays * 86400_000);

  const extraContestDefs = [
    {
      title: 'Logo Tasarım Yarışması 2026',
      slug: 'logo-tasarim-2026',
      description: 'Yeni nesil girişimler için logo tasarımı. Minimalist, akılda kalıcı, ölçeklenebilir logolar bekliyoruz.',
      coverImage: IMG.abstract,
      createdByEmail: 'bahar@orgmail.co',
      category: 'graphic-design',
      status: ContestStatus.APPLICATIONS,
      reviewStatus: 'APPROVED',
      allowedFormats: ['jpg', 'png', 'svg', 'pdf'],
      maxFileSize: 10 * 1024 * 1024,
      applicationStart: d(-3),
      applicationEnd: d(14),
      submissionStart: d(14),
      submissionEnd: d(30),
      judgingStart: d(30),
      judgingEnd: d(40),
      topic: 'Yarışma teması: **"Bağlantı"** — İnsanları, fikirleri veya sistemleri birbirine bağlayan bir logo tasarlayın.',
      rules: '- Logo vektörel olmalıdır (SVG/PDF).\n- En az 2 renk varyasyonu sunulmalıdır.\n- Logo, 16x16\'dan 512x512\'ye ölçeklenebilir olmalıdır.',
      prizes: '🥇 1. Ödül: ₺3.000\n🥈 2. Ödül: ₺1.500\n🥉 3. Ödül: ₺750',
    },
    {
      title: 'Mobil Oyun Prototip Jam',
      slug: 'mobil-oyun-prototip-jam-2026',
      description: '48 saatte mobil oyun prototipi! Hyper-casual, puzzle veya arcade — tür serbest.',
      coverImage: IMG.gameJam,
      createdByEmail: 'volkan@orgmail.co',
      category: 'game-dev',
      status: ContestStatus.ACTIVE,
      reviewStatus: 'APPROVED',
      allowedFormats: ['apk', 'aab', 'zip'],
      maxFileSize: 200 * 1024 * 1024,
      maxParticipants: 150,
      applicationStart: d(-10),
      applicationEnd: d(-2),
      submissionStart: d(-2),
      submissionEnd: d(3),
      judgingStart: d(3),
      judgingEnd: d(10),
      topic: 'Tema: **"Yerçekimi"** — Fizik tabanlı mekanikler veya metaforik yorumlar kabul edilir.',
      rules: '- Oyun, mobil cihazda çalışabilir olmalıdır.\n- Ekip en fazla 3 kişi.\n- Hazır asset kullanımı serbest, ancak belirtilmelidir.',
      prizes: '🥇 1. Ödül: ₺8.000\n🥈 2. Ödül: ₺4.000\n🥉 3. Ödül: ₺2.000\n🎖️ En Yaratıcı: ₺1.000',
    },
    {
      title: 'Portre Fotoğrafçılığı Masters',
      slug: 'portre-fotograf-masters-2026',
      description: 'İnsan yüzünün ve duygularının gücü. Doğal ışıkta, stüdyoda veya sokakta çekilmiş portreler.',
      coverImage: IMG.photography,
      createdByEmail: 'bahar@orgmail.co',
      category: 'photography',
      status: ContestStatus.JUDGING,
      reviewStatus: 'APPROVED',
      allowedFormats: ['jpg', 'jpeg', 'tiff'],
      maxFileSize: 25 * 1024 * 1024,
      maxParticipants: 80,
      applicationStart: d(-40),
      applicationEnd: d(-25),
      submissionStart: d(-25),
      submissionEnd: d(-5),
      judgingStart: d(-5),
      judgingEnd: d(7),
      topic: 'Tema: **"Gözler"** — Bir çift gözün anlattığı hikayeyi yakalayın.',
      rules: '- Fotoğraflar 2024 sonrası çekilmiş olmalıdır.\n- Her katılımcı en fazla 2 fotoğraf gönderebilir.\n- Aşırı photoshop/manipülasyon kabul edilmez.',
      prizes: '🥇 1. Ödül: ₺5.000\n🥈 2. Ödül: ₺2.500\n🥉 3. Ödül: ₺1.000',
    },
    {
      title: 'Kısa Animasyon Showcase',
      slug: 'kisa-animasyon-showcase-2026',
      description: '30 saniyede bir hikaye anlat. 2D, 3D, stop-motion — teknik serbest.',
      coverImage: IMG.animation,
      createdByEmail: 'volkan@orgmail.co',
      category: 'animation',
      status: ContestStatus.DRAFT,
      reviewStatus: 'DRAFT',
      allowedFormats: ['mp4', 'mov', 'webm'],
      maxFileSize: 300 * 1024 * 1024,
      applicationStart: d(10),
      applicationEnd: d(30),
      topic: 'Tema: **"Dönüşüm"** — Bir şeyin başka bir şeye dönüşmesi.',
      prizes: '🥇 1. Ödül: ₺10.000\n🥈 2. Ödül: ₺5.000',
    },
  ];

  const extraContests: any[] = [];
  for (const c of extraContestDefs) {
    const { createdByEmail, ...contestData } = c as any;
    const creator = userMap.get(createdByEmail);
    if (!creator) continue;

    const contest = await prisma.contest.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        ...contestData,
        createdById: creator.id,
        approvalMode: ApprovalMode.AUTO,
      },
    });
    extraContests.push(contest);
  }

  console.log(`✅ ${extraContests.length} yeni yarışma oluşturuldu`);

  // ==========================================
  // 5. SOSYAL POSTLAR (30+)
  // ==========================================

  const postContent = [
    { username: 'deniz_art',    content: 'Bugünkü eskiz çalışmam 🎨 Karakter tasarımı üzerine yoğunlaşıyorum. Silüet ve poz çok önemli!', imageUrl: IMG.illustration },
    { username: 'murat_pixel',  content: 'Yeni pixel art tileset\'im hazır! 48x48, çimen-taş-su temaları. Yakında itch.io\'da satışa çıkıyor 🕹️', imageUrl: IMG.pixelart },
    { username: 'aysun_water',  content: 'Suluboya + Procreate karışık bir çalışma. Geleneksel ve dijitalin dansı 💧', imageUrl: IMG.abstract },
    { username: 'cagatay_3d',   content: 'ZBrush\'ta sculpt ettiğim yeni yaratık modeli. Retopoloji aşamasına geçiyorum!', imageUrl: IMG.tech },
    { username: 'leyla_photo',  content: 'Kapadokya\'da gün doğumu. 3 saat beklediğime değdi. Işık her şeydir. 📸', imageUrl: IMG.nature },
    { username: 'damla_ui',     content: 'Yeni dashboard tasarımımın karanlık mod versiyonu. Erişilebilirlik kontrast oranları AAA seviyesinde. 🖤', imageUrl: IMG.uiux },
    { username: 'ece_music',    content: 'Yeni parçamın ilk 30 saniyesi. Keman + synthwave = beklenmedik bir combo oldu 🎻', imageUrl: null },
    { username: 'pelin_dev',    content: 'Unity\'de procedural generation üzerine çalışıyorum. Her seferinde farklı bir level! Kod paylaşımı yakında.', imageUrl: IMG.gameJam },
    { username: 'yigit_brand',  content: 'Yeni marka kimliği projesinden bir sneak peek. Renk paleti seçimi logodan daha zor olabiliyor.', imageUrl: IMG.abstract },
    { username: 'gulce_writer', content: '"Kelimeler bazen yetmez" — yeni öykümün ilk cümlesi. Gerisi yolda ✍️', imageUrl: null },
    { username: 'tarkan_foto',  content: 'Süper ay altında 4 saatlik uzun pozlama. Gökyüzü hiç bu kadar net olmamıştı 🌙', imageUrl: IMG.nature },
    { username: 'kerem_sound',  content: 'Foley kaydı için yağmur sesi topluyorum. En iyi ses, gerçek sestir. 🎙️', imageUrl: null },
    { username: 'deniz_art',    content: 'Commission çalışması: bir yazarın kitap kapağı illüstrasyonu. Fantastik evren, ejderha ve büyü 🔮', imageUrl: IMG.illustration },
    { username: 'sinan_script', content: 'Storyboard\'dan bir kare. Aksiyon sahnesi planlaması. Kamera açıları anlatımın %60\'ıdır.', imageUrl: IMG.animation },
    { username: 'bahar_org',    content: 'Yeni yarışmamız başvurulara açıldı! Logo Tasarım 2026. Detaylar profilimde. 🏆', imageUrl: null },
    { username: 'volkan_org',   content: 'Mobil Oyun Jam başladı! 48 saat süreniz var. Tema: Yerçekimi. Bol şans! 🎮', imageUrl: IMG.gameJam },
    { username: 'leyla_photo',  content: 'Siyah beyaz sokak fotoğrafçılığı. Renkleri çıkarınca geriye sadece hikaye kalıyor.', imageUrl: IMG.photography },
    { username: 'murat_pixel',  content: '16x16 piksel portre challenge! Tek palette 4 renk. Kendi portrenizi yapın challenge\'ı başlatıyorum.', imageUrl: null },
    { username: 'cengiz_code',  content: 'Yaratıcılar için ücretsiz palette generator tool\'u yaptım. Link bio\'da. Açık kaynak! 🛠️', imageUrl: null },
    { username: 'ece_music',    content: 'Spotify için lofi beats playlist\'i hazırladım. Çalışırken dinlemelik. 3 saat kesintisiz 🎧', imageUrl: null },
    { username: 'damla_ui',     content: 'Kullanıcı test sonuçları geldi! Yeni onboarding flow %40 daha az drop-off. Veriyle tasarım 🎯', imageUrl: null },
    { username: 'pelin_dev',    content: 'Oyun jam\'inden çıkan en iyi şey: yeni arkadaşlar ve ortak projeler. Topluluk her şeydir.', imageUrl: null },
    { username: 'aysun_water',  content: 'Doğadan ilham serisi #3: Sonbahar yaprakları. Her yaprak farklı bir renk hikayesi 🍂', imageUrl: IMG.nature },
    { username: 'cagatay_3d',   content: 'Retopoloji bitti, UV unfolding zamanı. 3D sanatçılar bilir: bu kısım sabır işi 😅', imageUrl: null },
    { username: 'tarkan_foto',  content: 'Yıldız fotoğrafçılığına yeni başlayanlara tavsiye: tripod şart, uzaktan deklanşör şart. Gerisi pratik.', imageUrl: null },
    { username: 'yigit_brand',  content: 'Minimalist logo tasarımının altın kuralı: bir logo, siyah-beyaz ve 1cm boyutunda da çalışmalı.', imageUrl: IMG.abstract },
    { username: 'gulce_writer', content: 'Editörüm son öyküyü beğendi! "En iyisi bu olmuş" dedi. Şimdi dergiye gönderme zamanı 📖', imageUrl: null },
    { username: 'kerem_sound',  content: 'Yeni foley stüdyom neredeyse hazır. Ses yalıtımı bitti, ekipman kurulumu kaldı.', imageUrl: null },
    { username: 'sinan_script', content: 'Animasyon için 120 kare storyboard çizdim. 3 dakikalık kısa film. Yapımcı arıyorum.', imageUrl: IMG.animation },
    { username: 'deniz_art',    content: 'Sanatçılar için en büyük tuzak: mükemmeliyetçilik. Bazen "yeterince iyi" de iyidir. Paylaş, ilerle.', imageUrl: null },
    { username: 'bahar_org',    content: 'Etkinlik yönetimi zor iş. Ama katılımcıların mutluluğunu görmek her şeye değer. ❤️', imageUrl: null },
    { username: 'leyla_photo',  content: 'Seyahat fotoğrafçılığı ipucu: her zaman yedek pil ve hafıza kartı taşıyın. Her. Zaman.', imageUrl: IMG.photography },
  ];

  const socialPosts: any[] = [];
  for (const p of postContent) {
    const user = userMap.get(p.username);
    if (!user) continue;
    const post = await prisma.socialPost.create({
      data: {
        userId: user.id,
        content: p.content,
        imageUrl: p.imageUrl || null,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000),
      },
    });
    socialPosts.push(post);
  }

  console.log(`✅ ${socialPosts.length} sosyal post oluşturuldu`);

  // ==========================================
  // 6. POST VOTE'LAR
  // ==========================================

  const usernames = allUsers.map(u => u.username);
  let voteCount = 0;
  for (const post of socialPosts) {
    const voterCount = 3 + Math.floor(Math.random() * 8);
    const shuffled = [...usernames].sort(() => Math.random() - 0.5).slice(0, voterCount);
    for (const username of shuffled) {
      const voter = userMap.get(username);
      if (!voter || voter.id === post.userId) continue;
      try {
        await prisma.postVote.create({
          data: {
            userId: voter.id,
            postId: post.id,
            type: Math.random() > 0.15 ? 'UP' : 'DOWN',
          },
        });
        voteCount++;
      } catch { /* duplicate */ }
    }
  }

  console.log(`✅ ${voteCount} post oyu oluşturuldu`);

  // ==========================================
  // 7. POST YORUMLARI
  // ==========================================

  const commentReplies = [
    'Çok iyi olmuş! 🔥', 'Harika!', 'Eline sağlık 👏', 'İlham verici!',
    'Bunu nasıl yaptın?', 'Renkler süper', 'Detaylar inanılmaz',
    'Keşke ben de yapabilsem', 'Tebrikler!', 'Daha fazlasını görmek isteriz',
    'Pro', 'Bunu satın alabilir miyim?', 'Favori çalışman bu mu?',
    'Çok yaratıcı', 'Devamını bekliyoruz', 'Workshop yapsana',
    'Bunu Pinterest\'e kaydettim', 'Tarzın çok unique',
    'Arka plan müziği ne?', 'Hangi tool ile yaptın?', 'Kaç saat sürdü?',
  ];

  let commentCount = 0;
  for (const post of socialPosts) {
    const replyCount = 1 + Math.floor(Math.random() * 3);
    const shuffled = [...usernames].sort(() => Math.random() - 0.5).slice(0, replyCount);
    for (const username of shuffled) {
      const commenter = userMap.get(username);
      if (!commenter) continue;
      try {
        await prisma.postComment.create({
          data: {
            userId: commenter.id,
            postId: post.id,
            content: commentReplies[Math.floor(Math.random() * commentReplies.length)],
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
          },
        });
        commentCount++;
      } catch { /* skip */ }
    }
  }

  console.log(`✅ ${commentCount} post yorumu oluşturuldu`);

  // ==========================================
  // 8. İŞ İLANLARI (20+)
  // ==========================================

  const jobData = [
    { username: 'ik@dreamforge.co',    title: 'Kıdemli 3D Karakter Sanatçısı', company: 'DreamForge Games', location: 'İstanbul (Hibrit)', remote: true, salary: '40.000 - 60.000 TL', tags: ['3D', 'ZBrush', 'Maya', 'Character Art', 'Game Dev'] },
    { username: 'ik@dreamforge.co',    title: 'Oyun Geliştirici (Unity)', company: 'DreamForge Games', location: 'İstanbul (Hibrit)', remote: true, salary: '35.000 - 55.000 TL', tags: ['Unity', 'C#', 'Game Design', 'Mobile'] },
    { username: 'hr@pixelminds.co',    title: 'UI/UX Tasarımcısı', company: 'PixelMinds Studio', location: 'Ankara', remote: false, salary: '28.000 - 42.000 TL', tags: ['UI/UX', 'Figma', 'Mobile Design', 'User Testing'] },
    { username: 'hr@pixelminds.co',    title: '2D Oyun Sanatçısı', company: 'PixelMinds Studio', location: 'Remote', remote: true, salary: '22.000 - 35.000 TL', tags: ['2D', 'Illustration', 'Game Assets', 'Photoshop'] },
    { username: 'talent@kreatifajans.co', title: 'Motion Graphics Tasarımcısı', company: 'Kreatif Ajans', location: 'İzmir', remote: true, salary: '25.000 - 38.000 TL', tags: ['After Effects', 'Premiere', 'Cinema 4D', 'Animation'] },
    { username: 'talent@kreatifajans.co', title: 'Grafik Tasarımcı', company: 'Kreatif Ajans', location: 'İzmir', remote: false, salary: '20.000 - 30.000 TL', tags: ['Graphic Design', 'Illustrator', 'InDesign', 'Branding'] },
    { username: 'recruit@techarts.co', title: 'Frontend Geliştirici (React)', company: 'TechArts Digital', location: 'İstanbul', remote: true, salary: '38.000 - 58.000 TL', tags: ['React', 'TypeScript', 'Next.js', 'Tailwind'] },
    { username: 'recruit@techarts.co', title: 'Ürün Tasarımcısı', company: 'TechArts Digital', location: 'Remote', remote: true, salary: '32.000 - 48.000 TL', tags: ['Product Design', 'Figma', 'Design Systems', 'SaaS'] },
    { username: 'recruit@techarts.co', title: 'Backend Geliştirici (Node.js)', company: 'TechArts Digital', location: 'İstanbul', remote: true, salary: '40.000 - 60.000 TL', tags: ['Node.js', 'PostgreSQL', 'AWS', 'Docker'] },
    { username: 'jobs@storyforge.co',  title: 'VFX Sanatçısı', company: 'StoryForge Media', location: 'İstanbul', remote: false, salary: '35.000 - 50.000 TL', tags: ['VFX', 'Houdini', 'Nuke', 'Maya'] },
    { username: 'jobs@storyforge.co',  title: 'Animasyon Yönetmeni', company: 'StoryForge Media', location: 'İstanbul', remote: false, salary: '45.000 - 70.000 TL', tags: ['Animation', 'Director', 'Maya', 'Pipeline'] },
    { username: 'jobs@storyforge.co',  title: 'Compositor (Nuke)', company: 'StoryForge Media', location: 'Remote', remote: true, salary: '30.000 - 45.000 TL', tags: ['Compositing', 'Nuke', 'After Effects', 'Color'] },
    { username: 'ik@dreamforge.co',    title: 'Ses Tasarımcısı', company: 'DreamForge Games', location: 'Remote', remote: true, salary: '25.000 - 35.000 TL', tags: ['Sound Design', 'FMOD', 'Wwise', 'Game Audio'] },
    { username: 'hr@pixelminds.co',    title: 'Sosyal Medya Yöneticisi', company: 'PixelMinds Studio', location: 'Ankara', remote: true, salary: '18.000 - 25.000 TL', tags: ['Social Media', 'Content', 'Community', 'Gaming'] },
    { username: 'talent@kreatifajans.co', title: 'İçerik Yazarı', company: 'Kreatif Ajans', location: 'Remote', remote: true, salary: '18.000 - 28.000 TL', tags: ['Copywriting', 'Content', 'SEO', 'Creative Writing'] },
    { username: 'recruit@techarts.co', title: 'DevOps Mühendisi', company: 'TechArts Digital', location: 'İstanbul', remote: true, salary: '45.000 - 65.000 TL', tags: ['DevOps', 'Kubernetes', 'Terraform', 'CI/CD'] },
    { username: 'jobs@storyforge.co',  title: 'Render Wrangler', company: 'StoryForge Media', location: 'İstanbul', remote: false, salary: '22.000 - 32.000 TL', tags: ['Render', 'Farm', 'Pipeline', 'Python'] },
    { username: 'talent@kreatifajans.co', title: 'Art Direktör', company: 'Kreatif Ajans', location: 'İzmir', remote: false, salary: '40.000 - 60.000 TL', tags: ['Art Direction', 'Creative', 'Team Lead', 'Brand'] },
  ];

  let jobCount = 0;
  for (const j of jobData) {
    const user = userMap.get(j.username);
    if (!user) continue;
    try {
      await prisma.jobListing.create({
        data: {
          userId: user.id,
          title: j.title,
          description: `${j.company} bünyesinde ${j.title} arıyoruz.\n\nAranan Nitelikler:\n- En az 2-5 yıl deneyim\n- Portföy/örnek çalışma şart\n- Ekip çalışmasına yatkın\n\nYan Haklar:\n- Esnek çalışma saatleri\n- Özel sağlık sigortası\n- Yıllık eğitim bütçesi`,
          company: j.company,
          location: j.location,
          remote: j.remote,
          salary: j.salary,
          tags: j.tags,
          contactEmail: `ik@${j.company.toLowerCase().replace(/\s/g, '')}.com`,
        },
      });
      jobCount++;
    } catch { /* skip */ }
  }

  console.log(`✅ ${jobCount} iş ilanı oluşturuldu`);

  // ==========================================
  // 9. PROJE İLANLARI (15+)
  // ==========================================

  const projectDefs = [
    { username: 'deniz_art',    title: 'Çocuk Kitabı İllüstrasyon Paketi', description: '24 sayfa tam renkli çocuk kitabı illüstrasyonu. Karakter tasarımı, arka plan ve kapak dahil.', price: 4500, tags: ['illustration', 'children-book', 'character-design'] },
    { username: 'murat_pixel',  title: 'Pixel Art RPG Tileset - Koleksiyon', description: '5 tema (çimen, taş, buz, lav, orman), 16x16, 32x32 ve 48x48 boyutlarında toplam 200+ tile.', price: 350, tags: ['pixel-art', 'rpg', 'tileset', 'game-assets'] },
    { username: 'cagatay_3d',   title: 'Low-Poly Karakter Paketi', description: '10 adet low-poly karakter modeli. Rigged, textured, oyun motoruna hazır.', price: 1200, tags: ['3d', 'low-poly', 'characters', 'game-ready'] },
    { username: 'damla_ui',     title: 'SaaS Dashboard UI Kit (Figma)', description: '60+ ekran, dark/light mode, responsive bileşenler, auto-layout ile hazırlandı.', price: 599, tags: ['ui-kit', 'figma', 'dashboard', 'saas'] },
    { username: 'ece_music',    title: 'Oyun Müziği Paketi - Fantasy RPG', description: '10 parça, döngülenebilir, WAV/MP3. Savaş, keşif, şehir ve boss temaları.', price: 2500, tags: ['music', 'game-audio', 'fantasy', 'rpg'] },
    { username: 'yigit_brand',  title: 'Startup Marka Kimliği Paketi', description: 'Logo, renk paleti, tipografi, kartvizit, sosyal medya kiti. 3 revizyon hakkı.', price: 3000, tags: ['branding', 'logo', 'identity', 'startup'] },
    { username: 'pelin_dev',    title: 'Unity Hyper-Casual Oyun Şablonu', description: 'Reklam entegrasyonlu, optimize edilmiş hyper-casual oyun şablonu. Kolayca özelleştirilebilir.', price: 800, tags: ['unity', 'game-template', 'hyper-casual', 'mobile'] },
    { username: 'kerem_sound',  title: 'UI Ses Efektleri Paketi', description: '150+ buton, geçiş, bildirim ses efekti. Oyunlar ve uygulamalar için optimize.', price: 200, tags: ['sfx', 'ui-sounds', 'game-audio', 'wav'] },
    { username: 'leyla_photo',  title: 'Stok Fotoğraf Seti - İstanbul', description: '50 yüksek çözünürlüklü İstanbul fotoğrafı. Sokak, mimari, günlük yaşam.', price: 400, tags: ['photography', 'stock', 'istanbul', 'commercial-use'] },
    { username: 'aysun_water',  title: 'Özel Portre İllüstrasyonu', description: 'Fotoğrafınızdan dijital suluboya tarzı portre. A3 boyut, 300dpi.', price: 500, tags: ['portrait', 'watercolor', 'digital-art', 'commission'] },
    { username: 'sinan_script', title: 'Kısa Film Storyboard Paketi', description: '5 dakikaya kadar kısa film için profesyonel storyboard. 60-80 kare, dijital teslim.', price: 1500, tags: ['storyboard', 'film', 'pre-production', 'animation'] },
    { username: 'gulce_writer', title: 'Kısa Öykü Editörlüğü', description: '5000 kelimeye kadar öykünüz için yapısal ve dil editörlüğü. Detaylı geri bildirim raporu.', price: 350, tags: ['editing', 'story', 'creative-writing', 'feedback'] },
    { username: 'tarkan_foto',  title: 'Doğa Fotoğrafçılığı Eğitim Seti', description: 'PDF + video, 10 bölüm. Kamera ayarlarından kompozisyona, post-processing\'e kadar.', price: 250, tags: ['education', 'photography', 'nature', 'tutorial'] },
    { username: 'cengiz_code',  title: 'Renk Paleti Oluşturucu - Web App', description: 'Açık kaynak, self-hosted. Sanatçılar için akıllı renk paleti önerileri sunan web uygulaması.', price: 0, tags: ['open-source', 'tool', 'color', 'web-app', 'free'] },
    { username: 'deniz_art',    title: 'Dijital İllüstrasyon Komisyonu', description: 'İstediğiniz konseptte özel dijital illüstrasyon. Karakter, sahne veya konsept art.', price: 800, tags: ['commission', 'illustration', 'digital-art', 'custom'] },
  ];

  let projectCount = 0;
  for (const p of projectDefs) {
    const user = userMap.get(p.username);
    if (!user) continue;
    try {
      await prisma.projectListing.create({
        data: {
          userId: user.id,
          title: p.title,
          description: p.description,
          price: p.price,
          tags: p.tags,
          images: [IMG.illustration, IMG.abstract, IMG.pixelart].slice(0, 1 + Math.floor(Math.random() * 2)),
        },
      });
      projectCount++;
    } catch { /* skip */ }
  }

  console.log(`✅ ${projectCount} proje ilanı oluşturuldu`);

  // ==========================================
  // 10. TAKİPLEŞMELER
  // ==========================================

  let followCount = 0;
  const followPairs: [string, string][] = [];
  // Her yeni kullanıcı 3-7 kişiyi takip etsin
  for (const user of allUsers) {
    const targetCount = 3 + Math.floor(Math.random() * 5);
    const targets = allUsers.filter(u => u.id !== user.id).sort(() => Math.random() - 0.5).slice(0, targetCount);
    for (const target of targets) {
      followPairs.push([user.id, target.id]);
    }
  }

  for (const [followerId, followingId] of followPairs) {
    try {
      await prisma.follow.create({ data: { followerId, followingId } });
      followCount++;
    } catch { /* duplicate */ }
  }

  console.log(`✅ ${followCount} takipleşme oluşturuldu`);

  // ==========================================
  // 11. JÜRİ ÖDEMELERİ
  // ==========================================

  const juryUsers = allUsers.filter(u => u.globalRole === 'JURY');
  let juryPaymentCount = 0;
  for (const contest of activeContests.slice(0, 3)) {
    const assignedJuries = allUsers.filter(u => {
      // Check if this user is a jury member for this contest
      return (u as any).contestMembers?.some?.((cm: any) =>
        cm.contestId === contest.id && cm.role === 'JURY'
      );
    });

    const juries = assignedJuries.length > 0 ? assignedJuries : juryUsers.slice(0, 2);
    for (const jury of juries) {
      try {
        await prisma.juryPayment.create({
          data: {
            juryId: jury.id,
            contestId: contest.id,
            amount: 500 + Math.floor(Math.random() * 1500),
            currency: 'TRY',
            status: Math.random() > 0.3 ? 'PAID' : 'PENDING',
            description: `${contest.title} — jüri ücreti`,
            paidAt: Math.random() > 0.3 ? new Date() : null,
          },
        });
        juryPaymentCount++;
      } catch { /* skip */ }
    }
  }

  console.log(`✅ ${juryPaymentCount} jüri ödemesi oluşturuldu`);

  // ==========================================
  // ÖZET
  // ==========================================

  const totalUsers = await prisma.user.count();
  const totalContests = await prisma.contest.count();
  const totalPosts = await prisma.socialPost.count();
  const totalJobs = await prisma.jobListing.count();
  const totalProjects = await prisma.projectListing.count();
  const totalFollows = await prisma.follow.count();
  const totalSubs = await prisma.userSubscription.count({ where: { status: 'ACTIVE' } });
  const totalSponsors = await prisma.sponsorSponsorship.count();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌱 Marketing seed tamamlandı!\n');
  console.log(`  👤 ${totalUsers} kullanıcı`);
  console.log(`  🏆 ${totalContests} yarışma`);
  console.log(`  📝 ${totalPosts} sosyal post`);
  console.log(`  💼 ${totalJobs} iş ilanı`);
  console.log(`  📦 ${totalProjects} proje ilanı`);
  console.log(`  👥 ${totalFollows} takipleşme`);
  console.log(`  ⭐ ${totalSubs} aktif abonelik`);
  console.log(`  🤝 ${totalSponsors} sponsorluk`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
