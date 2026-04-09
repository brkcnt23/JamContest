/**
 * Social feed seed — mevcut seed üzerine ekler, silmez.
 * Çalıştır: pnpm local:seed:social
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Social seed başlıyor...');

  // Mevcut kullanıcıları ve yarışmaları çek
  const users = await prisma.user.findMany({ select: { id: true, username: true } });
  const contests = await prisma.contest.findMany({
    where: { status: { in: ['ACTIVE', 'JUDGING', 'COMPLETED', 'SUBMISSION_CLOSED'] } },
    select: { id: true, title: true, slug: true },
  });

  if (users.length === 0 || contests.length === 0) {
    console.error('❌ Önce pnpm local:seed çalıştır.');
    process.exit(1);
  }

  const u = (username: string) => users.find(x => x.username === username)!;
  const c = (idx: number) => contests[idx % contests.length];

  // ─── EK SUBMISSIONS ───────────────────────────────────────────────────────
  // Feed'de görünmesi için farklı kullanıcılardan çeşitli gönderimler

  const extraSubmissions = [
    {
      userId: u('buse_tasarim').id,
      contestId: c(0).id,
      title: 'Mor Dimension',
      description: 'Mor tonların hâkim olduğu bir paralel evrende yaşayan şehir sakinleri. Her bina bir his, her renk bir duygu.',
    },
    {
      userId: u('nida_illustration').id,
      contestId: c(0).id,
      title: 'Yaprak Kanatlar',
      description: 'Doğanın ve teknolojinin iç içe geçtiği bir dünya. Yapraklardan kanat yapıp uçan karakterler.',
    },
    {
      userId: u('emre_pixel').id,
      contestId: c(1).id,
      title: 'Sabah Pazarı',
      description: 'İstanbul\'un arka sokaklarında, henüz şehir uyanmadan kurulan pazarın sessizliği.',
    },
    {
      userId: u('selin_photo').id,
      contestId: c(1).id,
      title: 'Gece Yağmuru',
      description: 'Yağmurlu bir gecede ıslak kaldırımda yansıyan neon tabelalar. Uzun pozlama tekniği.',
    },
    {
      userId: u('orhan_music').id,
      contestId: c(0).id,
      title: 'Ses Dalgaları',
      description: 'Müzik notalarının görsel temsili — ses frekanslarını illüstrasyon diline çevirdim.',
    },
    {
      userId: u('irem_writer').id,
      contestId: c(1).id,
      title: 'Son Tramvay',
      description: 'Gece yarısı boş tramvayda yalnız bir yolcu. Kentin yalnızlığı tek bir karede.',
    },
    {
      userId: u('ali_sanatci').id,
      contestId: c(1).id,
      title: 'Duman ve Işık',
      description: 'Duman makinesiyle yaratılan sis içinde dans eden ışık huzmelerini sokak fotoğrafçılığıyla belgeledim.',
    },
  ];

  const createdSubs: any[] = [];

  for (const s of extraSubmissions) {
    if (!s.userId) continue;
    try {
      const sub = await prisma.submission.upsert({
        where: { userId_contestId: { userId: s.userId, contestId: s.contestId } },
        update: {},
        create: {
          userId: s.userId,
          contestId: s.contestId,
          title: s.title,
          description: s.description,
        },
      });
      createdSubs.push(sub);
    } catch { /* Zaten varsa geç */ }
  }

  console.log(`✅ ${createdSubs.length} ek submission oluşturuldu`);

  // ─── EK LIKES ────────────────────────────────────────────────────────────

  const allSubs = await prisma.submission.findMany({ select: { id: true, userId: true } });

  let likeCount = 0;
  const likePairs = [
    { username: 'testuser',      subIdx: 0 },
    { username: 'testuser',      subIdx: 1 },
    { username: 'ali_sanatci',   subIdx: 2 },
    { username: 'buse_tasarim',  subIdx: 3 },
    { username: 'emre_pixel',    subIdx: 4 },
    { username: 'orhan_music',   subIdx: 0 },
    { username: 'irem_writer',   subIdx: 1 },
    { username: 'selin_photo',   subIdx: 4 },
    { username: 'nida_illustration', subIdx: 2 },
    { username: 'testuser',      subIdx: 4 },
    { username: 'ali_sanatci',   subIdx: 5 },
    { username: 'buse_tasarim',  subIdx: 6 },
  ];

  for (const pair of likePairs) {
    const user = users.find(x => x.username === pair.username);
    const sub = allSubs[pair.subIdx % allSubs.length];
    if (!user || !sub || sub.userId === user.id) continue;
    try {
      await prisma.like.upsert({
        where: { userId_submissionId: { userId: user.id, submissionId: sub.id } },
        update: {},
        create: { userId: user.id, submissionId: sub.id },
      });
      likeCount++;
    } catch { /* duplicate */ }
  }

  console.log(`✅ ${likeCount} ek like oluşturuldu`);

  // ─── EK COMMENTS ──────────────────────────────────────────────────────────

  const commentData = [
    { username: 'testuser',      subIdx: 0, content: 'Renk seçimi inanılmaz! 🎨' },
    { username: 'emre_pixel',    subIdx: 1, content: 'Teknik yetkinlik çok güçlü, tebrikler.' },
    { username: 'orhan_music',   subIdx: 2, content: 'Bu an\'ı yakalamak için sabahı beklemiş olmalısın.' },
    { username: 'irem_writer',   subIdx: 3, content: 'Uzun pozlama çok profesyonel durmuş.' },
    { username: 'buse_tasarim',  subIdx: 4, content: 'Ses dalgalarını görsel olarak bu kadar güzel ifade etmek 🔥' },
    { username: 'ali_sanatci',   subIdx: 5, content: 'Yalnızlık hissini tam yakalamışsın.' },
    { username: 'nida_illustration', subIdx: 6, content: 'Duman efekti mükemmel, nasıl çektin?' },
    { username: 'selin_photo',   subIdx: 0, content: 'Paralel evren konseptine çok uygun.' },
  ];

  let commentCount = 0;
  for (const c of commentData) {
    const user = users.find(x => x.username === c.username);
    const sub = allSubs[c.subIdx % allSubs.length];
    if (!user || !sub) continue;
    try {
      await prisma.comment.create({
        data: { userId: user.id, submissionId: sub.id, content: c.content },
      });
      commentCount++;
    } catch { /* skip */ }
  }

  console.log(`✅ ${commentCount} ek comment oluşturuldu`);

  // ─── EK FOLLOWS ───────────────────────────────────────────────────────────

  const followPairs = [
    { from: 'testuser',     to: 'buse_tasarim' },
    { from: 'testuser',     to: 'emre_pixel' },
    { from: 'ali_sanatci',  to: 'selin_photo' },
    { from: 'buse_tasarim', to: 'nida_illustration' },
    { from: 'emre_pixel',   to: 'ali_sanatci' },
    { from: 'orhan_music',  to: 'irem_writer' },
    { from: 'selin_photo',  to: 'buse_tasarim' },
  ];

  let followCount = 0;
  for (const f of followPairs) {
    const follower = users.find(x => x.username === f.from);
    const following = users.find(x => x.username === f.to);
    if (!follower || !following) continue;
    try {
      await prisma.follow.upsert({
        where: { followerId_followingId: { followerId: follower.id, followingId: following.id } },
        update: {},
        create: { followerId: follower.id, followingId: following.id },
      });
      followCount++;
    } catch { /* skip */ }
  }

  console.log(`✅ ${followCount} ek follow oluşturuldu`);

  console.log('\n✅ Social seed tamamlandı!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
