"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Sample Unsplash images for posts
const POST_IMAGES = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80',
    'https://images.unsplash.com/photo-1633356122102-3fe601e09bd2?w=800&q=80',
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
    'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80',
];
// Sample project images
const PROJECT_IMAGES = [
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&q=80',
    'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600&q=80',
    'https://images.unsplash.com/photo-1581291518633-83b4eef92e2f?w=600&q=80',
];
async function main() {
    console.log('🌱 Seeding sample data...\n');
    const users = await prisma.user.findMany({
        where: { email: { contains: '@jamcontest.com' } },
    });
    const userMap = new Map(users.map(u => [u.username, u]));
    const testUser = userMap.get('testuser');
    const ali = userMap.get('ali_sanatci');
    const buse = userMap.get('buse_tasarim');
    const emre = userMap.get('emre_pixel');
    const selin = userMap.get('selin_photo');
    const burak = userMap.get('burak_dev');
    const nida = userMap.get('nida_illustration');
    const orhan = userMap.get('orhan_music');
    const irem = userMap.get('irem_writer');
    const ayse = userMap.get('ayse_org');
    // ===================== SOCIAL POSTS =====================
    const postData = [
        { userId: ali.id, content: 'Yeni illüstrasyon serim üzerinde çalışıyorum! 🎨 Bu sefer paralel evrenler temasını işliyorum. Eskiz aşaması bitti, renklendirmeye geçiyorum. Sizce hangi renk paleti daha iyi olur?', imageUrl: POST_IMAGES[0] },
        { userId: buse.id, content: 'Kullanıcı deneyimi her şeydir. Tasarladığım yeni dashboard arayüzünde mikro etkileşimlere çok önem verdim. Her buton, her geçiş kullanıcıyı yormadan akmalı. 🖌️', imageUrl: POST_IMAGES[1] },
        { userId: emre.id, content: 'Pixel art ile ilgili en sevdiğim şey: sınırlamalar içinde yaratıcılık. 64x64 piksel bir portre yapmak, 4K bir renderdan daha zor olabilir.', imageUrl: POST_IMAGES[2] },
        { userId: selin.id, content: 'Dün akşamüstü çektiğim bu kare. Işık tam istediğim gibiydi. Sokak fotoğrafçılığında anı yakalamak her şeydir. 📸', imageUrl: POST_IMAGES[3] },
        { userId: burak.id, content: 'Yeni indie oyunumun ilk prototipini bitirdim! 🎮 "Loop" teması etrafında dönen minimalist bir puzzle platformer. Test edecek gönüllü var mı?', imageUrl: POST_IMAGES[4] },
        { userId: nida.id, content: 'Çocuk kitabı illüstrasyonu projemden bir sayfa. Karakter tasarımında en çok zorlandığım şey, onları "canlı" göstermek. Gözlerdeki ifade çok önemli.', imageUrl: POST_IMAGES[5] },
        { userId: ali.id, content: 'Bugün 4 saat boyunca sadece renk teorisi çalıştım. Renklerin birbiriyle dansı gerçekten büyüleyici. Tamamlayıcı renkleri kullanarak derinlik yaratmak favori tekniğim.', imageUrl: null },
        { userId: orhan.id, content: 'Yeni parçamın mixini bitirdim! 🎧 Ambient ve downtempo karışımı bir şey oldu. Mastering için önerisi olan var mı?', imageUrl: POST_IMAGES[6] },
        { userId: irem.id, content: 'Kısa öykü yazmanın püf noktası: her cümle bir öncekinden daha iyi olmak zorunda. 500 kelimede bir dünya kuruyorsunuz. ✍️', imageUrl: null },
        { userId: selin.id, content: 'İstanbul\'un ara sokaklarında kayboldum bugün. Her köşe başka bir hikaye. Fotoğraf makinem olmadan asla çıkmam.', imageUrl: POST_IMAGES[7] },
        { userId: testUser.id, content: 'JamContest platformuna yeni katıldım! 🚀 Buradaki yaratıcı topluluk gerçekten ilham verici. Yakında ilk yarışmama katılacağım.', imageUrl: null },
    ];
    const posts = [];
    for (const p of postData) {
        const post = await prisma.socialPost.create({ data: p });
        posts.push(post);
    }
    console.log(`✅ ${posts.length} social posts created`);
    // ===================== POST VOTES =====================
    // Up votes on most posts
    const votePairs = [
        { postIdx: 0, voter: buse, type: 'UP' },
        { postIdx: 0, voter: emre, type: 'UP' },
        { postIdx: 0, voter: nida, type: 'UP' },
        { postIdx: 0, voter: testUser, type: 'UP' },
        { postIdx: 1, voter: ali, type: 'UP' },
        { postIdx: 1, voter: selin, type: 'UP' },
        { postIdx: 1, voter: irem, type: 'UP' },
        { postIdx: 2, voter: burak, type: 'UP' },
        { postIdx: 2, voter: ali, type: 'UP' },
        { postIdx: 3, voter: buse, type: 'UP' },
        { postIdx: 3, voter: orhan, type: 'UP' },
        { postIdx: 3, voter: ayse, type: 'UP' },
        { postIdx: 3, voter: testUser, type: 'UP' },
        { postIdx: 4, voter: emre, type: 'UP' },
        { postIdx: 4, voter: ali, type: 'UP' },
        { postIdx: 4, voter: nida, type: 'UP' },
        { postIdx: 5, voter: selin, type: 'UP' },
        { postIdx: 5, voter: buse, type: 'UP' },
        { postIdx: 5, voter: irem, type: 'UP' },
        { postIdx: 6, voter: orhan, type: 'UP' },
        { postIdx: 6, voter: burak, type: 'UP' },
        { postIdx: 7, voter: ali, type: 'UP' },
        { postIdx: 7, voter: selin, type: 'UP' },
        { postIdx: 8, voter: buse, type: 'UP' },
        { postIdx: 8, voter: nida, type: 'UP' },
        { postIdx: 9, voter: emre, type: 'UP' },
        { postIdx: 9, voter: burak, type: 'UP' },
        { postIdx: 9, voter: testUser, type: 'UP' },
        { postIdx: 10, voter: ali, type: 'UP' },
        { postIdx: 10, voter: ayse, type: 'UP' },
        // A few down votes for realism
        { postIdx: 6, voter: selin, type: 'DOWN' },
        { postIdx: 8, voter: orhan, type: 'DOWN' },
    ];
    let voteCount = 0;
    for (const { postIdx, voter, type } of votePairs) {
        try {
            await prisma.postVote.create({
                data: { userId: voter.id, postId: posts[postIdx].id, type },
            });
            voteCount++;
        }
        catch { /* duplicate */ }
    }
    console.log(`✅ ${voteCount} post votes created`);
    // ===================== COMMENTS ON SUBMISSIONS =====================
    const submissions = await prisma.submission.findMany({
        take: 6,
        include: { user: true },
    });
    const commentData = [
        { submissionIdx: 0, userId: buse.id, content: 'Renk paleti inanılmaz! Özellikle kızıl tonlarının geçişleri çok profesyonelce.' },
        { submissionIdx: 0, userId: testUser.id, content: '🏆 Bu eser birinciliği sonuna kadar hak ediyor. Tebrikler!' },
        { submissionIdx: 0, userId: emre.id, content: 'Kompozisyon mükemmel. Işık kaynağını nereden aldığını merak ettim?' },
        { submissionIdx: 1, userId: ali.id, content: 'Kristal efektleri çok başarılı olmuş. Hangi tool\'u kullandın?' },
        { submissionIdx: 1, userId: selin.id, content: 'Atmosfer çok güzel kurulmuş. Sanki içine çekiyor izleyiciyi.' },
        { submissionIdx: 2, userId: burak.id, content: 'Retro pixel art + cyberpunk = 🔥 Çok iyi combo olmuş!' },
        { submissionIdx: 2, userId: nida.id, content: 'Neon renklerin kullanımı cesur ve etkileyici.' },
        { submissionIdx: 2, userId: testUser.id, content: 'Bu tarz oyunların konsept artlarını görmek isterim.' },
        { submissionIdx: 3, userId: buse.id, content: 'Bulutların üstünde bir dünya fikri çok şiirsel.' },
        { submissionIdx: 4, userId: selin.id, content: 'Tren metaforu İstanbul\'a çok yakışmış. Hangi durak?' },
        { submissionIdx: 4, userId: orhan.id, content: 'Sabahın köründe o durakta ben de bekledim. Duyguyu çok iyi vermişsin.' },
        { submissionIdx: 5, userId: ali.id, content: 'Yağmur sonrası yansımalar — fotoğrafçının en sevdiği an.' },
        { submissionIdx: 5, userId: emre.id, content: 'Kompozisyon ve zamanlama müthiş. Işık ölçümü manuel mi?' },
    ];
    let commentCount = 0;
    for (const { submissionIdx, userId, content } of commentData) {
        if (submissionIdx < submissions.length) {
            await prisma.comment.create({
                data: { userId, submissionId: submissions[submissionIdx].id, content },
            });
            commentCount++;
        }
    }
    console.log(`✅ ${commentCount} comments created`);
    // ===================== LIKES ON SUBMISSIONS =====================
    const likeUsers = [ali, buse, emre, selin, burak, nida, orhan, irem, testUser];
    let likeCount = 0;
    for (const sub of submissions.slice(0, 4)) {
        for (const u of likeUsers.slice(0, 5 + Math.floor(Math.random() * 4))) {
            try {
                await prisma.like.create({ data: { userId: u.id, submissionId: sub.id } });
                likeCount++;
            }
            catch { /* duplicate */ }
        }
    }
    console.log(`✅ ${likeCount} submission likes created`);
    // ===================== JOB LISTINGS =====================
    const jobData = [
        {
            userId: ayse.id,
            title: 'Kıdemli UI/UX Tasarımcısı',
            description: 'Dijital ürün ekibimiz için deneyimli bir UI/UX tasarımcısı arıyoruz. Kullanıcı araştırması, wireframe, prototip ve görsel tasarım süreçlerinde aktif rol alacaksınız.\n\nArananlar:\n- En az 4 yıl UI/UX deneyimi\n- Figma, Sketch veya Adobe XD deneyimi\n- Kullanıcı araştırması ve test süreçlerinde deneyim\n- Design system kurma ve yönetme deneyimi\n\nYan haklar:\n- Esnek çalışma saatleri\n- Özel sağlık sigortası\n- Yıllık eğitim bütçesi',
            company: 'DreamStudio Digital',
            location: 'İstanbul (Hibrit)',
            remote: true,
            salary: '35.000 - 55.000 TL',
            tags: ['UI/UX', 'Figma', 'Design System', 'User Research'],
            contactEmail: 'hr@dreamstudio.digital',
        },
        {
            userId: ayse.id,
            title: '3D Karakter Tasarımcısı',
            description: 'Oyun stüdyomuz için karakter ve yaratık tasarımı yapacak yetenekli bir 3D artist arıyoruz. Stilize ve gerçekçi modeller arasında geçiş yapabilen biri olmalı.\n\nArananlar:\n- ZBrush, Blender veya Maya deneyimi\n- PBR workflow bilgisi\n- En az 2 yıl oyun sektörü deneyimi\n- Portfolio şart',
            company: 'PixelForge Games',
            location: 'Ankara',
            remote: false,
            salary: '28.000 - 42.000 TL',
            tags: ['3D', 'ZBrush', 'Blender', 'Game Art', 'Character Design'],
            contactEmail: 'jobs@pixelforge.games',
        },
        {
            userId: ayse.id,
            title: 'Freelance İllüstratör',
            description: 'Çocuk kitabı serimiz için freelance illüstratör arıyoruz. Proje bazlı çalışılacak, toplam 24 sayfa illüstrasyon.\n\nArananlar:\n- Dijital illüstrasyon deneyimi\n- Karakter tasarımı konusunda yetenekli\n- Deadline\'lara uyum\n- Çocuk kitabı deneyimi tercih sebebi',
            company: 'Masal Yayıncılık',
            location: 'Remote',
            remote: true,
            salary: 'Proje bazlı: 30.000 - 50.000 TL',
            tags: ['Illustration', 'Children Book', 'Digital Art', 'Freelance'],
            contactEmail: 'editor@masalyayincilik.com',
        },
        {
            userId: ayse.id,
            title: 'Motion Graphics Tasarımcısı',
            description: 'Reklam ajansımız için motion graphics ve animasyon odaklı bir tasarımcı arıyoruz. Sosyal medya içerikleri, reklam bannerları ve explainer videolar üreteceksiniz.\n\nArananlar:\n- After Effects ve Premiere Pro\n- Cinema 4D veya Blender bilgisi avantaj\n- 2 yıl reklam/ajans deneyimi\n- Kreatif düşünce ve hikaye anlatımı',
            company: 'Kıvılcım Reklam Ajansı',
            location: 'İzmir',
            remote: true,
            salary: '25.000 - 38.000 TL',
            tags: ['Motion Graphics', 'After Effects', 'Animation', 'Advertising'],
            contactEmail: 'ik@kivilcimajans.com',
        },
    ];
    let jobCount = 0;
    for (const j of jobData) {
        await prisma.jobListing.create({ data: j });
        jobCount++;
    }
    console.log(`✅ ${jobCount} job listings created`);
    // ===================== PROJECT LISTINGS =====================
    const projectData = [
        {
            userId: ali.id,
            title: 'Pixel Art Karakter Paketi - RPG Set',
            description: '16x16 ve 32x32 pixel art karakter seti. Dört yönlü yürüme animasyonu, idle, attack ve ölüm animasyonları dahil. 8 karakter, her biri 4 varyasyon. Toplam 32 sprite sheet.',
            price: 350,
            tags: ['pixel-art', 'rpg', 'game-assets', 'sprites'],
            images: [PROJECT_IMAGES[0]],
        },
        {
            userId: buse.id,
            title: 'Modern Dashboard UI Kit',
            description: 'Figma\'da hazırlanmış, 50+ ekrandan oluşan dashboard UI kit. Dark/light mode, responsive tasarım, component variants. SaaS projeleri için optimize edildi.',
            price: 499,
            tags: ['ui-kit', 'figma', 'dashboard', 'saas'],
            images: [PROJECT_IMAGES[1]],
        },
        {
            userId: emre.id,
            title: 'Retro Game Tileset - Platformer',
            description: 'Platform oyunları için 48x48 tile set. Çimen, taş, ahşap, buz ve lav temaları. Her tema 30+ benzersiz tile içerir. Tileset dosyası ve örnek level dahil.',
            price: 200,
            tags: ['tileset', 'platformer', 'game-dev', 'pixel-art'],
            images: [PROJECT_IMAGES[2]],
        },
        {
            userId: nida.id,
            title: 'Özel Portre İllüstrasyonu',
            description: 'Fotoğrafınızdan yola çıkarak dijital portre illüstrasyonu. Karakterinizi stylized tarzda yeniden yorumluyorum. 3000x3000px, 300dpi, teslim süresi 5 iş günü.',
            price: 750,
            tags: ['portrait', 'illustration', 'digital-art', 'commission'],
            images: [POST_IMAGES[5]],
        },
    ];
    let projectCount = 0;
    for (const p of projectData) {
        await prisma.projectListing.create({ data: p });
        projectCount++;
    }
    console.log(`✅ ${projectCount} project listings created`);
    // ===================== FOLLOWS =====================
    const followPairs = [
        [testUser.id, ali.id], [testUser.id, buse.id], [testUser.id, emre.id],
        [ali.id, buse.id], [ali.id, nida.id],
        [buse.id, ali.id], [buse.id, selin.id],
        [emre.id, burak.id], [emre.id, ali.id],
        [selin.id, buse.id], [selin.id, orhan.id],
        [burak.id, emre.id], [burak.id, ali.id],
        [nida.id, ali.id], [nida.id, irem.id],
        [orhan.id, selin.id], [orhan.id, burak.id],
        [irem.id, nida.id], [irem.id, orhan.id],
    ];
    let followCount = 0;
    for (const [followerId, followingId] of followPairs) {
        try {
            await prisma.follow.create({ data: { followerId, followingId } });
            followCount++;
        }
        catch { /* duplicate */ }
    }
    console.log(`✅ ${followCount} follows created`);
    // ===================== SOCIAL POST LIKES/COMMENTS (submission comments for feed) =====================
    // Already done above
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌱 Sample data seeded successfully!\n');
    console.log(`  📝 ${posts.length} social posts`);
    console.log(`  👍 ${voteCount} post votes`);
    console.log(`  💬 ${commentCount} submission comments`);
    console.log(`  ❤️ ${likeCount} submission likes`);
    console.log(`  💼 ${jobCount} job listings`);
    console.log(`  📦 ${projectCount} project listings`);
    console.log(`  👥 ${followCount} follows`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.sample-data.js.map