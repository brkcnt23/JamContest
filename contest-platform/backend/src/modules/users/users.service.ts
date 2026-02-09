import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatar: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Mock data - sonra DB'den çekersin
    return {
      userId: user.id,
      displayName: user.displayName || user.username,
      tagline: 'Visual Artist & Creative Director',
      bio: user.bio || 'Exploring creativity through digital art',
      profileImageUrl: user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop',
      galleryImageUrls: [
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&h=1000&fit=crop',
      ],
      links: [
        { label: 'Portfolio', url: 'https://example.com', icon: 'website' },
        { label: 'Instagram', url: 'https://instagram.com/', icon: 'instagram' },
      ],
      socialLinks: {
        instagram: 'https://instagram.com/',
        twitter: 'https://x.com/',
        email: 'mailto:hello@artist.com',
      },
    };
  }
}