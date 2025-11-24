import React from 'react';
import { Button } from "@/components/ui/button";
import { Share2, Facebook, Twitter, MessageCircle, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function SocialShareButtons({ url, title, description }) {
  const shareUrl = url || window.location.href;
  const shareTitle = title || 'Guarda questo annuncio su Zazarap';
  const shareText = description || '';

  const handleShare = (platform) => {
    let shareLink = '';
    
    switch(platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copiato negli appunti!');
        return;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  // Try native share API if available
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to copy link
      handleShare('copy');
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={handleNativeShare}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        Condividi
      </Button>
      
      <Button
        onClick={() => handleShare('facebook')}
        variant="outline"
        size="sm"
        className="gap-2 text-blue-600 hover:text-blue-700"
      >
        <Facebook className="w-4 h-4" />
        Facebook
      </Button>
      
      <Button
        onClick={() => handleShare('twitter')}
        variant="outline"
        size="sm"
        className="gap-2 text-sky-500 hover:text-sky-600"
      >
        <Twitter className="w-4 h-4" />
        Twitter
      </Button>
      
      <Button
        onClick={() => handleShare('whatsapp')}
        variant="outline"
        size="sm"
        className="gap-2 text-green-600 hover:text-green-700"
      >
        <MessageCircle className="w-4 h-4" />
        WhatsApp
      </Button>
      
      <Button
        onClick={() => handleShare('copy')}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <LinkIcon className="w-4 h-4" />
        Copia Link
      </Button>
    </div>
  );
}