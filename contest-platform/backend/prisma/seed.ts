import { PrismaClient, GlobalRole, ContestStatus, ApprovalMode, BadgeType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PASS = 'asd123';

// Unsplash — sabit, erişilebilir görsel URL'leri (contest cover images)
const COVERS = {
  illustration: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
  photography:  'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&q=80',
  gameJam:      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80',
  music:        'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200&q=80',
  writing:      'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80',
  animation:    'https://images.unsplash.com/photo-1626379953822-baec19c3accd?w=1200&q=80',
};

// Avatar URL'leri (DiceBear — SVG avatar servisi, her zaman çalışır)
const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;

async function main() {
  console.log('🌱 Seeding database...');
  const hash = await bcrypt.hash(PASS, 10);

  // ─── USERS ────────────────────────────────────────────────────────────────

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@jamcontest.com' },
    update: {},
    create: {
      email: 'superadmin@jamcontest.com',
      username: 'superadmin',
      displayName: 'Super Admin',
      bio: 'Platform yöneticisi.',
      passwordHash: hash,
      globalRole: GlobalRole.SUPER_ADMIN,
      emailVerified: true,
      avatar: avatar('superadmin'),
      language: 'tr',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@jamcontest.com' },
    update: {},
    create: {
      email: 'admin@jamcontest.com',
      username: 'admin',
      displayName: 'Admin User',
      bio: 'İçerik moderatörü.',
      passwordHash: hash,
      globalRole: GlobalRole.ADMIN,
      emailVerified: true,
      avatar: avatar('admin'),
      language: 'tr',
    },
  });

  const organizer1 = await prisma.user.upsert({
    where: { email: 'organizer1@jamcontest.com' },
    update: {},
    create: {
      email: 'organizer1@jamcontest.com',
      username: 'ayse_org',
      displayName: 'Ayşe Kaya',
      bio: 'Dijital sanat etkinlikleri organizatörü.',
      tagline: 'Sanatı herkese ulaştırıyorum.',
      portfolioLink: 'https://aysekaya.art',
      contactInstagram: 'aysekaya.art',
      passwordHash: hash,
      globalRole: GlobalRole.ORGANIZER,
      emailVerified: true,
      avatar: avatar('ayse'),
      language: 'tr',
    },
  });

  const organizer2 = await prisma.user.upsert({
    where: { email: 'organizer2@jamcontest.com' },
    update: {},
    create: {
      email: 'organizer2@jamcontest.com',
      username: 'mehmet_org',
      displayName: 'Mehmet Demir',
      bio: 'Oyun geliştirici ve jam organizatörü.',
      tagline: 'Indie game jams.',
      contactTwitter: 'mehmetdemir_dev',
      passwordHash: hash,
      globalRole: GlobalRole.ORGANIZER,
      emailVerified: true,
      avatar: avatar('mehmet'),
      language: 'tr',
    },
  });

  const jury1 = await prisma.user.upsert({
    where: { email: 'jury1@jamcontest.com' },
    update: {},
    create: {
      email: 'jury1@jamcontest.com',
      username: 'zeynep_jury',
      displayName: 'Zeynep Arslan',
      bio: 'Grafik tasarımcı, 10 yıl deneyim.',
      tagline: 'Tasarım değerlendirme uzmanı.',
      portfolioLink: 'https://behance.net/zeyneparslan',
      contactBehance: 'zeyneparslan',
      passwordHash: hash,
      globalRole: GlobalRole.JURY,
      emailVerified: true,
      avatar: avatar('zeynep'),
      language: 'tr',
    },
  });

  const jury2 = await prisma.user.upsert({
    where: { email: 'jury2@jamcontest.com' },
    update: {},
    create: {
      email: 'jury2@jamcontest.com',
      username: 'can_jury',
      displayName: 'Can Yılmaz',
      bio: 'Fotoğrafçı ve görsel sanatlar eleştirmeni.',
      contactInstagram: 'canyilmazphoto',
      passwordHash: hash,
      globalRole: GlobalRole.JURY,
      emailVerified: true,
      avatar: avatar('can'),
      language: 'tr',
    },
  });

  const jury3 = await prisma.user.upsert({
    where: { email: 'jury3@jamcontest.com' },
    update: {},
    create: {
      email: 'jury3@jamcontest.com',
      username: 'elif_jury',
      displayName: 'Elif Şahin',
      bio: 'Müzisyen ve ses tasarımcısı.',
      contactTwitter: 'elifsahinmusic',
      passwordHash: hash,
      globalRole: GlobalRole.JURY,
      emailVerified: true,
      avatar: avatar('elif'),
      language: 'tr',
    },
  });

  // Katılımcılar
  const participants = await Promise.all(
    [
      { email: 'p1@jamcontest.com', username: 'ali_sanatci',     displayName: 'Ali Çelik',     bio: 'Dijital illüstratör.' },
      { email: 'p2@jamcontest.com', username: 'buse_tasarim',    displayName: 'Buse Öztürk',   bio: 'UI/UX tasarımcısı.' },
      { email: 'p3@jamcontest.com', username: 'emre_pixel',      displayName: 'Emre Doğan',    bio: 'Pixel art tutkunu.' },
      { email: 'p4@jamcontest.com', username: 'selin_photo',     displayName: 'Selin Aydın',   bio: 'Belgesel fotoğrafçı.' },
      { email: 'p5@jamcontest.com', username: 'burak_dev',       displayName: 'Burak Şen',     bio: 'Indie oyun geliştirici.' },
      { email: 'p6@jamcontest.com', username: 'nida_illustration', displayName: 'Nida Kurt',  bio: 'Kitap illüstratörü.' },
      { email: 'p7@jamcontest.com', username: 'orhan_music',     displayName: 'Orhan Avcı',    bio: 'Elektronik müzisyen.' },
      { email: 'p8@jamcontest.com', username: 'irem_writer',     displayName: 'İrem Koç',      bio: 'Kısa öykü yazarı.' },
    ].map(async (u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          ...u,
          passwordHash: hash,
          globalRole: GlobalRole.USER,
          emailVerified: true,
          avatar: avatar(u.username),
          language: 'tr',
        },
      })
    )
  );

  const testUser = await prisma.user.upsert({
    where: { email: 'test@jamcontest.com' },
    update: {},
    create: {
      email: 'test@jamcontest.com',
      username: 'testuser',
      displayName: 'Test User',
      passwordHash: hash,
      globalRole: GlobalRole.USER,
      emailVerified: true,
      avatar: avatar('testuser'),
      language: 'tr',
    },
  });

  console.log('✅ Users created');

  // ─── BADGES ───────────────────────────────────────────────────────────────

  const badgeDefs: { type: BadgeType; name: string; description: string; icon: string; color: string }[] = [
    { type: BadgeType.EARLY_ADOPTER,    name: 'Erken Benimseyici',  description: 'Platformun ilk kullanıcılarından biri.',         icon: '🚀', color: '#F59E0B' },
    { type: BadgeType.ORGANIZER,        name: 'Organizatör',        description: 'En az bir yarışma düzenledi.',                   icon: '🎪', color: '#8B5CF6' },
    { type: BadgeType.JURY_MEMBER,      name: 'Jüri Üyesi',         description: 'Bir yarışmada jüri olarak görev yaptı.',         icon: '⚖️', color: '#3B82F6' },
    { type: BadgeType.FIRST_WIN,        name: 'İlk Zafer',          description: 'İlk birinciliğini kazandı.',                     icon: '🥇', color: '#EAB308' },
    { type: BadgeType.FIRST_SUBMISSION, name: 'İlk Adım',           description: 'İlk başvurusunu tamamladı.',                     icon: '📤', color: '#10B981' },
    { type: BadgeType.SOCIAL_SHARER,    name: 'Sosyal Paylaşımcı',  description: 'Bir yarışmayı sosyal medyada paylaştı.',         icon: '📢', color: '#EC4899' },
    { type: BadgeType.TOP_3,            name: 'İlk 3',              description: 'Bir yarışmada ilk 3\'e girdi.',                  icon: '🏆', color: '#F97316' },
    { type: BadgeType.VETERAN,          name: 'Veteran',            description: '5\'ten fazla yarışmaya katıldı.',                icon: '🎖️', color: '#6366F1' },
    { type: BadgeType.CONTEST_CREATOR,  name: 'İçerik Üreticisi',   description: '3 veya daha fazla yarışma düzenledi.',           icon: '✨', color: '#14B8A6' },
  ];

  const badges: Record<BadgeType, any> = {} as any;
  for (const b of badgeDefs) {
    badges[b.type] = await prisma.badge.upsert({
      where: { type: b.type },
      update: {},
      create: b,
    });
  }
  console.log('✅ Badges created');

  // ─── USER BADGES ──────────────────────────────────────────────────────────

  const awardBadge = async (userId: string, type: BadgeType) =>
    prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: badges[type].id } },
      update: {},
      create: { userId, badgeId: badges[type].id },
    });

  await awardBadge(organizer1.id, BadgeType.EARLY_ADOPTER);
  await awardBadge(organizer1.id, BadgeType.ORGANIZER);
  await awardBadge(organizer1.id, BadgeType.CONTEST_CREATOR);
  await awardBadge(organizer2.id, BadgeType.ORGANIZER);
  await awardBadge(jury1.id, BadgeType.JURY_MEMBER);
  await awardBadge(jury2.id, BadgeType.JURY_MEMBER);
  await awardBadge(jury3.id, BadgeType.JURY_MEMBER);
  await awardBadge(participants[0].id, BadgeType.FIRST_SUBMISSION);
  await awardBadge(participants[0].id, BadgeType.TOP_3);
  await awardBadge(participants[0].id, BadgeType.FIRST_WIN);
  await awardBadge(participants[1].id, BadgeType.FIRST_SUBMISSION);
  await awardBadge(participants[1].id, BadgeType.TOP_3);
  await awardBadge(participants[2].id, BadgeType.FIRST_SUBMISSION);
  await awardBadge(participants[3].id, BadgeType.FIRST_SUBMISSION);
  await awardBadge(participants[4].id, BadgeType.VETERAN);

  console.log('✅ User badges awarded');

  // ─── CONTESTS ─────────────────────────────────────────────────────────────

  const now = new Date();
  const d = (offsetDays: number) => new Date(now.getTime() + offsetDays * 86400_000);

  // 1. COMPLETED — Dijital İllüstrasyon
  const contestCompleted = await prisma.contest.upsert({
    where: { slug: 'dijital-illustrasyon-2024' },
    update: {},
    create: {
      title: 'Dijital İllüstrasyon Yarışması 2024',
      slug: 'dijital-illustrasyon-2024',
      description: 'Hayal gücünüzü dijital fırçayla buluşturun. Fantezi, bilim kurgu veya günlük yaşamdan ilham alan özgün illüstrasyonlarınızı paylaşın.',
      coverImage: COVERS.illustration,
      createdById: organizer1.id,
      category: 'illustration',
      status: ContestStatus.COMPLETED,
      reviewStatus: 'APPROVED',
      approvalMode: ApprovalMode.AUTO,
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      maxFileSize: 10 * 1024 * 1024,
      maxParticipants: 100,
      applicationStart: d(-60),
      applicationEnd:   d(-45),
      submissionStart:  d(-45),
      submissionEnd:    d(-20),
      judgingStart:     d(-20),
      judgingEnd:       d(-5),
      topic: 'Yarışmanın teması: **"Paralel Evrenler"** — Var olabilecek ama henüz keşfedilmemiş dünyaları illüstre edin.',
      rules: '- Eserler tamamen özgün olmalıdır.\n- Yapay zeka destekli araçlar kullanılmamalıdır.\n- Maksimum dosya boyutu: 10 MB.\n- İzin verilen formatlar: JPG, PNG, WEBP.',
      prizes: '🥇 **1. Ödül:** ₺5.000 + Sertifika\n🥈 **2. Ödül:** ₺2.500 + Sertifika\n🥉 **3. Ödül:** ₺1.000 + Sertifika',
    },
  });

  // 2. JUDGING — Fotoğrafçılık
  const contestJudging = await prisma.contest.upsert({
    where: { slug: 'sokak-fotografciligi-2025' },
    update: {},
    create: {
      title: 'Sokak Fotoğrafçılığı Yarışması',
      slug: 'sokak-fotografciligi-2025',
      description: 'Şehrin ruhunu yakalayın. Sokakların hikayesini tek bir kareye sığdırın.',
      coverImage: COVERS.photography,
      createdById: organizer1.id,
      category: 'photography',
      status: ContestStatus.JUDGING,
      reviewStatus: 'APPROVED',
      approvalMode: ApprovalMode.MANUAL,
      allowedFormats: ['jpg', 'jpeg', 'png'],
      maxFileSize: 20 * 1024 * 1024,
      maxParticipants: 50,
      applicationStart: d(-30),
      applicationEnd:   d(-15),
      submissionStart:  d(-15),
      submissionEnd:    d(-2),
      judgingStart:     d(-2),
      judgingEnd:       d(10),
      topic: 'Tema: **"Şehrin Sessizliği"** — Kalabalık şehir hayatında yakaladığınız sessiz anlar.',
      rules: '- Her katılımcı en fazla 3 fotoğraf gönderebilir.\n- Post-prodüksiyon kabul edilir, ancak kompozit fotoğraflar kabul edilmez.\n- Fotoğraflar 2023 sonrası çekilmiş olmalıdır.',
      prizes: '🥇 **1. Ödül:** ₺3.000 + Sergi Fırsatı\n🥈 **2. Ödül:** ₺1.500\n🥉 **3. Ödül:** ₺750',
    },
  });

  // 3. ACTIVE — Game Jam
  const contestActive = await prisma.contest.upsert({
    where: { slug: 'indie-game-jam-spring-2025' },
    update: {},
    create: {
      title: 'Indie Game Jam — Bahar 2025',
      slug: 'indie-game-jam-spring-2025',
      description: '72 saatte sıfırdan bir oyun geliştirin. Solo veya en fazla 3 kişilik ekiplerle katılabilirsiniz.',
      coverImage: COVERS.gameJam,
      createdById: organizer2.id,
      category: 'game-dev',
      status: ContestStatus.ACTIVE,
      reviewStatus: 'APPROVED',
      approvalMode: ApprovalMode.AUTO,
      allowedFormats: ['zip', 'rar', '7z'],
      maxFileSize: 200 * 1024 * 1024,
      maxParticipants: 200,
      applicationStart: d(-10),
      applicationEnd:   d(-3),
      submissionStart:  d(-3),
      submissionEnd:    d(5),
      judgingStart:     d(5),
      judgingEnd:       d(15),
      topic: 'Tema: **"Loop"** — Döngü, tekrar, sonsuz. Bu kavramları yorumlamak tamamen size kalmış.',
      rules: '- Oyun jam süresi boyunca (başlangıçtan itibaren) sıfırdan geliştirilmelidir.\n- Hazır asset paketleri kullanılabilir ancak belirtilmelidir.\n- Her türlü oyun motoru kabul edilir.',
      prizes: '🥇 **1. Ödül:** ₺10.000\n🥈 **2. Ödül:** ₺5.000\n🥉 **3. Ödül:** ₺2.500\n🎖️ **En Yaratıcı:** ₺1.500',
    },
  });

  // 4. APPLICATIONS açık
  const contestApplications = await prisma.contest.upsert({
    where: { slug: 'elektronik-muzik-yarismasi-2025' },
    update: {},
    create: {
      title: 'Elektronik Müzik Yarışması 2025',
      slug: 'elektronik-muzik-yarismasi-2025',
      description: 'Yeni seslerin peşinde. Ambient, techno, house veya kendi türünü yarat.',
      coverImage: COVERS.music,
      createdById: organizer1.id,
      category: 'music',
      status: ContestStatus.APPLICATIONS,
      reviewStatus: 'APPROVED',
      approvalMode: ApprovalMode.MANUAL,
      allowedFormats: ['mp3', 'wav', 'flac'],
      maxFileSize: 50 * 1024 * 1024,
      maxParticipants: 75,
      applicationStart: d(-5),
      applicationEnd:   d(10),
      submissionStart:  d(10),
      submissionEnd:    d(30),
      judgingStart:     d(30),
      judgingEnd:       d(45),
      topic: 'Konu serbesttir. Parçanız 2-8 dakika arasında olmalıdır.',
      rules: '- Parçalar tamamen özgün olmalıdır.\n- Sample kullanımı serbesttir ancak telif hakkı olmayan örnekler kullanılmalıdır.\n- Yayınlanmış veya lisanslanmış parçalar kabul edilmez.',
      prizes: '🥇 **1. Ödül:** ₺7.500 + Kayıt Stüdyosu Süresi\n🥈 **2. Ödül:** ₺3.000\n🥉 **3. Ödül:** ₺1.500',
    },
  });

  // 5. DRAFT
  await prisma.contest.upsert({
    where: { slug: 'kisa-oyku-yarismasi-2025-draft' },
    update: {},
    create: {
      title: 'Kısa Öykü Yarışması 2025',
      slug: 'kisa-oyku-yarismasi-2025-draft',
      description: 'Kelimelerle bir dünya kurun. 500-2000 kelime arası kısa öykülerinizi bekliyoruz.',
      coverImage: COVERS.writing,
      createdById: organizer2.id,
      category: 'writing',
      status: ContestStatus.DRAFT,
      reviewStatus: 'DRAFT',
      approvalMode: ApprovalMode.AUTO,
      allowedFormats: ['pdf', 'docx', 'txt'],
      maxFileSize: 5 * 1024 * 1024,
    },
  });

  // 6. PENDING_APPROVAL
  await prisma.contest.upsert({
    where: { slug: 'animasyon-yarismasi-2025' },
    update: {},
    create: {
      title: 'Kısa Animasyon Yarışması',
      slug: 'animasyon-yarismasi-2025',
      description: 'Maksimum 3 dakika, tam özgürlük. Hikayeni canlandır.',
      coverImage: COVERS.animation,
      createdById: organizer1.id,
      category: 'animation',
      status: ContestStatus.PENDING_APPROVAL,
      reviewStatus: 'PENDING',
      approvalMode: ApprovalMode.AUTO,
      allowedFormats: ['mp4', 'mov', 'avi'],
      maxFileSize: 500 * 1024 * 1024,
      applicationStart: d(5),
      applicationEnd:   d(20),
      submissionStart:  d(20),
      submissionEnd:    d(50),
      rules: '- Animasyon uzunluğu max 3 dakika.\n- Kullanılan tüm sesler telif hakkından arındırılmış olmalıdır.',
      prizes: '🥇 **1. Ödül:** ₺8.000\n🥈 **2. Ödül:** ₺4.000',
    },
  });

  console.log('✅ Contests created');

  // ─── CONTEST APPROVALS ────────────────────────────────────────────────────

  await prisma.contestApproval.createMany({
    skipDuplicates: true,
    data: [
      { contestId: contestCompleted.id, reviewerId: admin.id, decision: 'APPROVED', note: 'Her şey yolunda.' },
      { contestId: contestJudging.id,   reviewerId: admin.id, decision: 'APPROVED', note: 'Onaylandı.' },
      { contestId: contestActive.id,    reviewerId: admin.id, decision: 'APPROVED', note: 'Onaylandı.' },
      { contestId: contestApplications.id, reviewerId: admin.id, decision: 'APPROVED', note: 'Onaylandı.' },
    ],
  });

  // ─── CONTEST MEMBERS ──────────────────────────────────────────────────────

  const cm = (userId: string, contestId: string, role: any) =>
    prisma.contestMember.upsert({
      where: { userId_contestId_role: { userId, contestId, role } },
      update: {},
      create: { userId, contestId, role },
    });

  // contestCompleted
  await cm(organizer1.id, contestCompleted.id, 'ORGANIZER');
  await cm(jury1.id,      contestCompleted.id, 'JURY');
  await cm(jury2.id,      contestCompleted.id, 'JURY');
  // contestJudging
  await cm(organizer1.id, contestJudging.id, 'ORGANIZER');
  await cm(jury2.id,      contestJudging.id, 'JURY');
  await cm(jury3.id,      contestJudging.id, 'JURY');
  // contestActive
  await cm(organizer2.id, contestActive.id, 'ORGANIZER');
  await cm(jury1.id,      contestActive.id, 'JURY');
  await cm(jury3.id,      contestActive.id, 'JURY');
  // contestApplications
  await cm(organizer1.id,    contestApplications.id, 'ORGANIZER');
  await cm(jury3.id,         contestApplications.id, 'JURY');

  console.log('✅ Contest members assigned');

  // ─── APPLICATIONS ─────────────────────────────────────────────────────────

  const makeApp = (userId: string, contestId: string, status: any, message?: string) =>
    prisma.contestApplication.upsert({
      where: { userId_contestId: { userId, contestId } },
      update: {},
      create: { userId, contestId, status, message },
    });

  // contestCompleted katılımcıları (APPROVED)
  for (const p of [participants[0], participants[1], participants[2], participants[5]]) {
    await makeApp(p.id, contestCompleted.id, 'APPROVED', 'Katılmak istiyorum.');
  }
  // contestJudging (APPROVED + PENDING)
  await makeApp(participants[3].id, contestJudging.id, 'APPROVED', 'Sokak fotoğrafçılığı tutkunum.');
  await makeApp(participants[1].id, contestJudging.id, 'APPROVED');
  await makeApp(testUser.id,        contestJudging.id, 'PENDING',  'Değerlendirme bekliyor.');
  // contestActive (APPROVED)
  await makeApp(participants[4].id, contestActive.id, 'APPROVED', 'Solo katılıyorum.');
  await makeApp(participants[2].id, contestActive.id, 'APPROVED');
  // contestApplications (PENDING)
  await makeApp(participants[6].id, contestApplications.id, 'PENDING', 'Müzik yapıyorum 5 yıldır.');
  await makeApp(participants[0].id, contestApplications.id, 'PENDING');

  console.log('✅ Applications created');

  // ─── SUBMISSIONS ──────────────────────────────────────────────────────────

  // contestCompleted submissions
  const sub1 = await prisma.submission.upsert({
    where: { userId_contestId: { userId: participants[0].id, contestId: contestCompleted.id } },
    update: {},
    create: {
      userId: participants[0].id,
      contestId: contestCompleted.id,
      title: 'Kızıl Nehir Boyunca',
      description: 'Paralel evrende akan kızıl bir nehrin kıyısındaki antik şehri tasvir ettim. Renk paleti ve ışık oyunları üzerine uzun süre çalıştım.',
      finalScore: 9.2,
      rank: 1,
    },
  });

  const sub2 = await prisma.submission.upsert({
    where: { userId_contestId: { userId: participants[1].id, contestId: contestCompleted.id } },
    update: {},
    create: {
      userId: participants[1].id,
      contestId: contestCompleted.id,
      title: 'Kristal Orman',
      description: 'Yerçekiminin farklı çalıştığı bir dünyada kristalleşmiş bir orman.',
      finalScore: 8.7,
      rank: 2,
    },
  });

  const sub3 = await prisma.submission.upsert({
    where: { userId_contestId: { userId: participants[2].id, contestId: contestCompleted.id } },
    update: {},
    create: {
      userId: participants[2].id,
      contestId: contestCompleted.id,
      title: 'Neon Şehir',
      description: 'Siberpunk paralel evren — pixel art stilinde retro bir şehir.',
      finalScore: 8.1,
      rank: 3,
    },
  });

  const sub4 = await prisma.submission.upsert({
    where: { userId_contestId: { userId: participants[5].id, contestId: contestCompleted.id } },
    update: {},
    create: {
      userId: participants[5].id,
      contestId: contestCompleted.id,
      title: 'Bulutların Üstünde',
      description: 'Gökyüzünde yüzen adalar ve orada yaşayan topluluklar.',
      finalScore: 7.5,
      rank: 4,
    },
  });

  // contestJudging submissions (henüz finalScore yok)
  const sub5 = await prisma.submission.upsert({
    where: { userId_contestId: { userId: participants[3].id, contestId: contestJudging.id } },
    update: {},
    create: {
      userId: participants[3].id,
      contestId: contestJudging.id,
      title: 'Sabah Treni',
      description: 'İstanbul\'un ücra bir durağında, sabahın köründe bekleyen tek yolcu.',
    },
  });

  const sub6 = await prisma.submission.upsert({
    where: { userId_contestId: { userId: participants[1].id, contestId: contestJudging.id } },
    update: {},
    create: {
      userId: participants[1].id,
      contestId: contestJudging.id,
      title: 'Yağmur Sonrası',
      description: 'Yağmur sonrası ıslak kaldırımda yansıyan şehir ışıkları.',
    },
  });

  // contestActive submissions
  await prisma.submission.upsert({
    where: { userId_contestId: { userId: participants[4].id, contestId: contestActive.id } },
    update: {},
    create: {
      userId: participants[4].id,
      contestId: contestActive.id,
      title: 'Endless Loop',
      description: 'Oyuncu döngüden kaçmaya çalışırken her seferinde başa dönen bir platform oyunu.',
      link: 'https://itch.io/placeholder-endless-loop',
    },
  });

  console.log('✅ Submissions created');

  // ─── JURY SCORES & REVIEWS ────────────────────────────────────────────────

  // contestCompleted — tüm submission'lar için score var
  const juryScoreData = [
    { juryId: jury1.id, submissionId: sub1.id, score: 9.5, comment: 'Renk kullanımı ve kompozisyon mükemmel. Anlatı güçlü.' },
    { juryId: jury2.id, submissionId: sub1.id, score: 8.9, comment: 'Işık oyunları çok başarılı, detaylar etkileyici.' },
    { juryId: jury1.id, submissionId: sub2.id, score: 8.8, comment: 'Yaratıcı konsept, teknik yetkinlik yüksek.' },
    { juryId: jury2.id, submissionId: sub2.id, score: 8.6, comment: 'Atmosfer çok güzel kurulmuş.' },
    { juryId: jury1.id, submissionId: sub3.id, score: 8.0, comment: 'Pixel art stilini çok iyi kullanmış.' },
    { juryId: jury2.id, submissionId: sub3.id, score: 8.2, comment: 'Nostalji ve fütürizm dengesi güzel.' },
    { juryId: jury1.id, submissionId: sub4.id, score: 7.8, comment: 'Konsept iyi ama daha fazla detay beklerdim.' },
    { juryId: jury2.id, submissionId: sub4.id, score: 7.2, comment: 'Teknik yetkinlik orta düzeyde.' },
  ];

  for (const d of juryScoreData) {
    await prisma.juryScore.upsert({
      where: { juryId_submissionId: { juryId: d.juryId, submissionId: d.submissionId } },
      update: {},
      create: { ...d, isLocked: true },
    });
  }

  // contestJudging — jury review'lar devam ediyor
  const juryReviewData = [
    { submissionId: sub5.id, juryId: jury2.id, score: 9, comment: 'Saatin ruhunu mükemmel yakalamış.', status: 'SUBMITTED' },
    { submissionId: sub5.id, juryId: jury3.id, score: 8, comment: 'Kompozisyon güçlü, ışık mükemmel.', status: 'DRAFT' },
    { submissionId: sub6.id, juryId: jury2.id, score: 7, comment: 'Yansıma kullanımı yaratıcı.', status: 'SUBMITTED' },
    { submissionId: sub6.id, juryId: jury3.id, score: 8, comment: 'Renk tonu çok başarılı.', status: 'DRAFT' },
  ];

  for (const r of juryReviewData) {
    await prisma.juryReview.upsert({
      where: { submissionId_juryId: { submissionId: r.submissionId, juryId: r.juryId } },
      update: {},
      create: {
        submissionId: r.submissionId,
        juryId: r.juryId,
        score: r.score,
        comment: r.comment,
        status: r.status,
        submittedAt: r.status === 'SUBMITTED' ? new Date() : null,
      },
    });
  }

  console.log('✅ Jury scores & reviews created');

  // ─── JURY INVITATIONS ─────────────────────────────────────────────────────

  await prisma.juryInvitation.upsert({
    where: { contestId_userId: { contestId: contestApplications.id, userId: jury1.id } },
    update: {},
    create: {
      contestId: contestApplications.id,
      userId: jury1.id,
      invitedBy: organizer1.id,
      status: 'PENDING',
    },
  });

  // ─── APPLICATIONS (Jury & Organizer) ──────────────────────────────────────

  await prisma.juryApplication.upsert({
    where: { userId: participants[0].id },
    update: {},
    create: {
      userId: participants[0].id,
      motivation: 'İllüstrasyon alanında 5 yıllık deneyimim var, jüri süreçlerine katkı sağlamak istiyorum.',
      status: 'PENDING',
    },
  });

  await prisma.organizerApplication.upsert({
    where: { userId: participants[4].id },
    update: {},
    create: {
      userId: participants[4].id,
      motivation: 'Indie oyun topluluğu için bir game jam organizasyonu yapmak istiyorum.',
      status: 'PENDING',
    },
  });

  // ─── SOCIAL: FOLLOWS ──────────────────────────────────────────────────────

  const follow = (followerId: string, followingId: string) =>
    prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      update: {},
      create: { followerId, followingId },
    });

  await follow(participants[0].id, organizer1.id);
  await follow(participants[1].id, organizer1.id);
  await follow(participants[2].id, organizer2.id);
  await follow(participants[3].id, organizer1.id);
  await follow(testUser.id, organizer1.id);
  await follow(testUser.id, participants[0].id);
  await follow(participants[0].id, participants[1].id);

  // ─── SOCIAL: LIKES ────────────────────────────────────────────────────────

  const like = (userId: string, submissionId: string) =>
    prisma.like.upsert({
      where: { userId_submissionId: { userId, submissionId } },
      update: {},
      create: { userId, submissionId },
    });

  await like(participants[1].id, sub1.id);
  await like(participants[2].id, sub1.id);
  await like(participants[3].id, sub1.id);
  await like(testUser.id,        sub1.id);
  await like(organizer1.id,      sub1.id);
  await like(participants[0].id, sub2.id);
  await like(participants[3].id, sub2.id);
  await like(testUser.id,        sub2.id);
  await like(participants[0].id, sub3.id);
  await like(participants[1].id, sub3.id);

  // ─── SOCIAL: COMMENTS ─────────────────────────────────────────────────────

  await prisma.comment.createMany({
    skipDuplicates: true,
    data: [
      { userId: participants[1].id, submissionId: sub1.id, content: 'Harika bir çalışma! Renk paleti inanılmaz.' },
      { userId: testUser.id,        submissionId: sub1.id, content: 'Tebrikler, hak edilmiş birincili 🏆' },
      { userId: organizer1.id,      submissionId: sub1.id, content: 'Bu yarışmanın en güçlü eseri.' },
      { userId: participants[0].id, submissionId: sub2.id, content: 'Kristal efektleri çok güzel olmuş.' },
      { userId: participants[3].id, submissionId: sub3.id, content: 'Pixel art + neon kombinasyonu 🔥' },
    ],
  });

  console.log('✅ Social interactions created');

  // ─── NOTIFICATIONS ────────────────────────────────────────────────────────

  const notify = (userId: string, type: string, title: string, body: string, link?: string) =>
    prisma.notification.create({ data: { userId, type, title, body, link } });

  await notify(participants[0].id, 'CONTEST_RESULT', '🏆 Yarışma Sonuçlandı!',
    'Dijital İllüstrasyon Yarışması\'nda 1. oldunuz! Tebrikler.',
    '/contests/dijital-illustrasyon-2024');
  await notify(participants[1].id, 'CONTEST_RESULT', '🥈 Yarışma Sonuçlandı!',
    'Dijital İllüstrasyon Yarışması\'nda 2. oldunuz.',
    '/contests/dijital-illustrasyon-2024');
  await notify(participants[2].id, 'CONTEST_RESULT', '🥉 Yarışma Sonuçlandı!',
    'Dijital İllüstrasyon Yarışması\'nda 3. oldunuz.',
    '/contests/dijital-illustrasyon-2024');
  await notify(participants[3].id, 'APPLICATION_APPROVED', '✅ Başvurunuz Onaylandı',
    'Sokak Fotoğrafçılığı Yarışması\'na başvurunuz onaylandı.',
    '/contests/sokak-fotografciligi-2025');
  await notify(testUser.id, 'APPLICATION_PENDING', '⏳ Başvurunuz İnceleniyor',
    'Sokak Fotoğrafçılığı Yarışması başvurunuz inceleme aşamasında.');
  await notify(organizer1.id, 'ADMIN_ACTION', '📋 Yeni Başvuru',
    'Animasyon Yarışması onay için bekliyor.',
    '/admin/contests');
  await notify(jury2.id, 'JURY_ASSIGNMENT', '⚖️ Jüri Görevi',
    'Sokak Fotoğrafçılığı Yarışması\'nda jüri olarak atandınız.',
    '/contests/sokak-fotografciligi-2025');

  console.log('✅ Notifications created');

  // ─── CONTEST FAVORITES ────────────────────────────────────────────────────

  const fav = (userId: string, contestId: string) =>
    prisma.contestFavorite.upsert({
      where: { userId_contestId: { userId, contestId } },
      update: {},
      create: { userId, contestId },
    });

  await fav(testUser.id,        contestActive.id);
  await fav(testUser.id,        contestApplications.id);
  await fav(participants[0].id, contestApplications.id);
  await fav(participants[5].id, contestActive.id);

  // ─── SUMMARY ──────────────────────────────────────────────────────────────

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌱 Seed tamamlandı!\n');
  console.log('👤 Kullanıcılar (şifre: asd123)');
  console.log('  superadmin@jamcontest.com  → SUPER_ADMIN');
  console.log('  admin@jamcontest.com       → ADMIN');
  console.log('  organizer1@jamcontest.com  → ORGANIZER (Ayşe Kaya)');
  console.log('  organizer2@jamcontest.com  → ORGANIZER (Mehmet Demir)');
  console.log('  jury1@jamcontest.com       → JURY (Zeynep Arslan)');
  console.log('  jury2@jamcontest.com       → JURY (Can Yılmaz)');
  console.log('  jury3@jamcontest.com       → JURY (Elif Şahin)');
  console.log('  p1..p8@jamcontest.com      → USER (katılımcılar)');
  console.log('  test@jamcontest.com        → USER');
  console.log('\n🏆 Yarışmalar');
  console.log('  COMPLETED  → Dijital İllüstrasyon 2024');
  console.log('  JUDGING    → Sokak Fotoğrafçılığı');
  console.log('  ACTIVE     → Indie Game Jam Bahar 2025');
  console.log('  APPLICATIONS → Elektronik Müzik 2025');
  console.log('  DRAFT      → Kısa Öykü 2025');
  console.log('  PENDING    → Kısa Animasyon');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
