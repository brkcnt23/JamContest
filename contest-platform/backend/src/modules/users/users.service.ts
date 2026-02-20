import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GalleryArtwork } from './types/gallery-artwork.type';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // galleryArtworks JSON parse
    let galleryArtworks: GalleryArtwork[] = [];
    try {
      const raw = user.galleryArtworks as any;
      galleryArtworks = Array.isArray(raw) ? raw : [];
    } catch (error) {
      console.error('[UsersService] Error parsing galleryArtworks:', error);
    }

    return {
      userId: user.id,
      displayName: user.displayName || user.username,
      tagline: user.tagline || '',
      bio: user.bio || '',
      about: user.about || '',
      profileImageUrl: user.avatar || '',
      portfolioLink: user.portfolioLink || '',
      galleryArtworks: galleryArtworks,
      contactEmail: user.contactEmail || '',
      contactInstagram: user.contactInstagram || '',
      contactTwitter: user.contactTwitter || '',
      contactBehance: user.contactBehance || '',
      contactArtStation: user.contactArtStation || '',
    };
  }

  async updateUserProfile(userId: string, data: any) {
    console.log('[UsersService] Updating profile:', userId);
    console.log('[UsersService] Data:', data);

    // galleryArtworks validation
    let artworksToSave: GalleryArtwork[] = [];
    if (Array.isArray(data.galleryArtworks)) {
      artworksToSave = data.galleryArtworks
        .filter((art: any) => art && typeof art === 'object' && art.url)
        .map((art: any) => ({
          title: art.title || 'Untitled',
          url: art.url.trim(),
        }));
    }

    console.log('[UsersService] Gallery artworks to save:', artworksToSave);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: data.displayName,
        tagline: data.tagline,
        bio: data.bio,
        about: data.about,
        portfolioLink: data.portfolioLink,
        avatar: data.avatar,
        galleryArtworks: artworksToSave as any,
        contactEmail: data.contactEmail,
        contactInstagram: data.contactInstagram,
        contactTwitter: data.contactTwitter,
        contactBehance: data.contactBehance,
        contactArtStation: data.contactArtStation,
      },
    });

    console.log('[UsersService] Updated galleryArtworks:', updated.galleryArtworks);

    let savedArtworks: GalleryArtwork[] = [];
    try {
      const raw = updated.galleryArtworks as any;
      savedArtworks = Array.isArray(raw) ? raw : [];
    } catch (error) {
      console.error('[UsersService] Error parsing saved artworks:', error);
    }

    return {
      userId: updated.id,
      displayName: updated.displayName || updated.username,
      tagline: updated.tagline || '',
      bio: updated.bio || '',
      about: updated.about || '',
      profileImageUrl: updated.avatar || '',
      portfolioLink: updated.portfolioLink || '',
      galleryArtworks: savedArtworks,
      contactEmail: updated.contactEmail || '',
      contactInstagram: updated.contactInstagram || '',
      contactTwitter: updated.contactTwitter || '',
      contactBehance: updated.contactBehance || '',
      contactArtStation: updated.contactArtStation || '',
    };
  }
}