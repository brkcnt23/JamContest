import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding post comments...\n');

  const users = await prisma.user.findMany({
    where: { email: { contains: '@jamcontest.com' } },
  });
  const userMap = new Map(users.map(u => [u.username, u]));

  const ali = userMap.get('ali_sanatci')!;
  const buse = userMap.get('buse_tasarim')!;
  const emre = userMap.get('emre_pixel')!;
  const selin = userMap.get('selin_photo')!;
  const burak = userMap.get('burak_dev')!;
  const nida = userMap.get('nida_illustration')!;
  const orhan = userMap.get('orhan_music')!;
  const irem = userMap.get('irem_writer')!;
  const testUser = userMap.get('testuser')!;

  const posts = await prisma.socialPost.findMany({
    orderBy: { createdAt: 'asc' },
    include: { user: true },
  });

  const commentData = [
    // Post 0: ali - yeni illüstrasyon
    { postIdx: 0, userId: buse.id, content: 'Renk paleti olarak sıcak tonları öneririm! Turuncu ve mor kontrastı paralel evren temasına çok uyar 🔥' },
    { postIdx: 0, userId: nida.id, content: 'Eskizleri görmek isteriz! WIP paylaşır mısın?' },
    { postIdx: 0, userId: testUser.id, content: 'Ben de illüstrasyonla uğraşıyorum, ilham verici!' },

    // Post 1: buse - dashboard UI
    { postIdx: 1, userId: ali.id, content: 'Mikro etkileşimler gerçekten fark yaratıyor. Hangi tool ile yapıyorsun?' },
    { postIdx: 1, userId: emre.id, content: 'Dashboard tasarımında whitespace kullanımı çok önemli. Eline sağlık.' },
    { postIdx: 1, userId: selin.id, content: 'Kullanıcı testi yaptın mı? Merak ettim sonuçları.' },

    // Post 2: emre - pixel art
    { postIdx: 2, userId: burak.id, content: '64x64 portre challenge? Ben varım! Konu ne olsun?' },
    { postIdx: 2, userId: ali.id, content: 'Kısıtlama yaratıcılığı tetikler. Pixel art\'ın güzelliği burada.' },

    // Post 3: selin - fotoğraf
    { postIdx: 3, userId: orhan.id, content: 'Işık gerçekten mükemmel. Hangi saatte çektin?' },
    { postIdx: 3, userId: buse.id, content: 'Bu karedeki kompozisyon ders niteliğinde. Altın oran mı kullandın?' },
    { postIdx: 3, userId: irem.id, content: 'Sokak fotoğrafçılığı bir hikaye anlatma sanatı. Bu karede çok şey anlatıyor.' },

    // Post 4: burak - oyun prototipi
    { postIdx: 4, userId: emre.id, content: 'Test etmek isterim! Build linki paylaşabilir misin?' },
    { postIdx: 4, userId: ali.id, content: 'Loop teması puzzle oyunları için harika. Mekanikleri merak ettim.' },
    { postIdx: 4, userId: nida.id, content: 'Minimalist art style kullanacaksan asset konusunda yardımcı olabilirim.' },

    // Post 5: nida - çocuk kitabı
    { postIdx: 5, userId: irem.id, content: 'Çocuk kitabı karakterleri gerçekten "canlı" olmalı. Çok doğru tespit.' },
    { postIdx: 5, userId: buse.id, content: 'Gözler konusunda haklısın. Karakterin ruhu gözlerinde saklı.' },

    // Post 6: ali - renk teorisi
    { postIdx: 6, userId: nida.id, content: 'Renk teorisi hayat kurtarır. Özellikle tamamlayıcı renkler...' },
    { postIdx: 6, userId: selin.id, content: '4 saat renk teorisi mi? Adanmışlık budur 👏' },

    // Post 7: orhan - yeni parça
    { postIdx: 7, userId: irem.id, content: 'Ambient + downtempo harika kombo. Mastering için LANDR öneririm.' },
    { postIdx: 7, userId: burak.id, content: 'Oyunum için müzik arıyordum, belki çalışabiliriz?' },

    // Post 8: irem - kısa öykü
    { postIdx: 8, userId: orhan.id, content: '"Her cümle bir öncekinden daha iyi olmak zorunda" — bunu duvara yazdım.' },
    { postIdx: 8, userId: testUser.id, content: 'Kısa öykü yazmak isteyenlere önerin var mı? Kaynak olarak?' },

    // Post 9: selin - sokaklar
    { postIdx: 9, userId: ali.id, content: 'İstanbul sokakları tükenmez bir ilham kaynağı. Hangi semt?' },
    { postIdx: 9, userId: emre.id, content: 'Ben de fotoğrafa yeni başladım. Hangi makineyi kullanıyorsun?' },

    // Post 10: testuser - yeni katılım
    { postIdx: 10, userId: ali.id, content: 'Hoş geldin! 🎉 Hangi alanla ilgileniyorsun?' },
    { postIdx: 10, userId: buse.id, content: 'Aramıza hoş geldin! Yakında harika işler çıkaracağına eminim.' },
    { postIdx: 10, userId: selin.id, content: 'Topluluğa katıldığın için tebrikler. Hangi yarışmalara katılmayı düşünüyorsun?' },
  ];

  let count = 0;
  for (const { postIdx, userId, content } of commentData) {
    if (postIdx < posts.length) {
      await prisma.postComment.create({
        data: { userId, postId: posts[postIdx].id, content },
      });
      count++;
    }
  }

  console.log(`✅ ${count} post comments created`);
  console.log('   Users with avatars:');
  for (const u of [ali, buse, emre, selin, burak, nida, orhan, irem, testUser]) {
    console.log(`   - ${u.username}: ${u.avatar || 'NO AVATAR'}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
