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
        about: true,
        avatar: true,
        tagline: true,
        portfolioLink: true,
        galleryImages: true,
        contactEmail: true,
        contactInstagram: true,
        contactTwitter: true,
        contactBehance: true,
        contactArtStation: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    console.log('[UsersService] getUserProfile - user.galleryImages:', user.galleryImages);

    const result = {
      userId: user.id,
      displayName: user.displayName || user.username,
      tagline: user.tagline || '',
      bio: user.bio || '',
      about: user.about || '',
      profileImageUrl: user.avatar || '',
      portfolioLink: user.portfolioLink || '',
      galleryImageUrls: Array.isArray(user.galleryImages) ? user.galleryImages.filter(Boolean) : [],
      contactEmail: user.contactEmail || '',
      contactInstagram: user.contactInstagram || '',
      contactTwitter: user.contactTwitter || '',
      contactBehance: user.contactBehance || '',
      contactArtStation: user.contactArtStation || '',
    };

    console.log('[UsersService] getUserProfile - returning galleryImageUrls:', result.galleryImageUrls);

    return result;
  }

  async updateUserProfile(userId: string, data: any) {
    console.log('[UsersService] updateUserProfile called with data:', data);
    console.log('[UsersService] Gallery images received:', data.galleryImages);
    
    const isValidUrl = (url: string) => {
      if (!url) return true;
      try { new URL(url); return true; } catch { return false; }
    };

    // Validation
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
    
    const contactFields = ['contactInstagram', 'contactTwitter', 'contactBehance', 'contactArtStation'];
    contactFields.forEach(field => {
      if (data[field] && !isValidUrl(data[field])) {
        throw new Error(`Invalid URL for ${field}`);
      }
    });

    // Character limits
    if (data.bio && data.bio.length > 250) {
      throw new Error('Bio must be 250 characters or less');
    }
    if (data.about && data.about.length > 1000) {
      throw new Error('About must be 1000 characters or less');
    }

    const galleryImagesToSave = Array.isArray(data.galleryImages) ? data.galleryImages.filter(Boolean) : [];
    console.log('[UsersService] Gallery images to save:', galleryImagesToSave);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: data.displayName,
        tagline: data.tagline,
        bio: data.bio,
        about: data.about,
        portfolioLink: data.portfolioLink,
        avatar: data.avatar,
        galleryImages: galleryImagesToSave,
        contactEmail: data.contactEmail,
        contactInstagram: data.contactInstagram,
        contactTwitter: data.contactTwitter,
        contactBehance: data.contactBehance,
        contactArtStation: data.contactArtStation,
      },
    });

    console.log('[UsersService] Updated user galleryImages:', updated.galleryImages);

    return {
      userId: updated.id,
      displayName: updated.displayName || updated.username,
      tagline: updated.tagline || '',
      bio: updated.bio || '',
      about: updated.about || '',
      profileImageUrl: updated.avatar || '',
      portfolioLink: updated.portfolioLink || '',
      galleryImageUrls: Array.isArray(updated.galleryImages) ? updated.galleryImages.filter(Boolean) : [],
      contactEmail: updated.contactEmail || '',
      contactInstagram: updated.contactInstagram || '',
      contactTwitter: updated.contactTwitter || '',
      contactBehance: updated.contactBehance || '',
      contactArtStation: updated.contactArtStation || '',
    };
  }
}