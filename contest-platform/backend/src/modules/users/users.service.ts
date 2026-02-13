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
        galleryImages: true,
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
      galleryImageUrls: Array.isArray(user.galleryImages) ? user.galleryImages.filter(Boolean) : [],
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
    if (data.avatar && !isValidUrl(data.avatar)) {
      throw new Error('Invalid URL for avatar');
    }
    if (Array.isArray(data.galleryImages)) {
      data.galleryImages.forEach((url: string) => {
        if (url && !isValidUrl(url)) {
          throw new Error('Invalid URL in galleryImages');
        }
      });
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: data.displayName,
        tagline: data.tagline,
        bio: data.bio,
        portfolioLink: data.portfolioLink,
        avatar: data.avatar,
        galleryImages: Array.isArray(data.galleryImages) ? data.galleryImages.filter(Boolean) : [],
      },
    });
    return {
      userId: updated.id,
      displayName: updated.displayName || updated.username,
      tagline: updated.tagline || '',
      bio: updated.bio || '',
      profileImageUrl: updated.avatar || '',
      portfolioLink: updated.portfolioLink || '',
      galleryImageUrls: Array.isArray(updated.galleryImages) ? updated.galleryImages.filter(Boolean) : [],
    };
  }
}