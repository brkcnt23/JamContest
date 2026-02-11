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
        tagline: true,
        portfolioLink: true,
        gallery1: true,
        gallery2: true,
        gallery3: true,
        gallery4: true,
        gallery5: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: user.id,
      displayName: user.displayName || user.username,
      tagline: user.tagline || '',
      bio: user.bio || '',
      profileImageUrl: user.avatar || '',
      portfolioLink: user.portfolioLink || '',
      galleryImageUrls: [user.gallery1, user.gallery2, user.gallery3, user.gallery4, user.gallery5].filter(Boolean),
    };
  }

  async updateUserProfile(userId: string, data: any) {
    // URL validation (basic)
    const isValidUrl = (url: string) => {
      if (!url) return true;
      try { new URL(url); return true; } catch { return false; }
    };

    if (data.portfolioLink && !isValidUrl(data.portfolioLink)) {
      throw new Error('Invalid portfolio link URL');
    }
    ['avatar', 'gallery1', 'gallery2', 'gallery3', 'gallery4', 'gallery5'].forEach((key) => {
      if (data[key] && !isValidUrl(data[key])) {
        throw new Error(`Invalid URL for ${key}`);
      }
    });

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: data.displayName,
        tagline: data.tagline,
        bio: data.bio,
        portfolioLink: data.portfolioLink,
        avatar: data.avatar,
        gallery1: data.gallery1,
        gallery2: data.gallery2,
        gallery3: data.gallery3,
        gallery4: data.gallery4,
        gallery5: data.gallery5,
      },
    });
    return {
      userId: updated.id,
      displayName: updated.displayName || updated.username,
      tagline: updated.tagline || '',
      bio: updated.bio || '',
      profileImageUrl: updated.avatar || '',
      portfolioLink: updated.portfolioLink || '',
      galleryImageUrls: [updated.gallery1, updated.gallery2, updated.gallery3, updated.gallery4, updated.gallery5].filter(Boolean),
    };
  }
}