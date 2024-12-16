import bs58 from 'bs58';

export function isSocialMedia(hostname: string): boolean {
    const socialMediaDomains = [
        'instagram.com',
        'twitter.com',
        'telegram.org',
        't.me',
        'facebook.com',
        'youtube.com',
        'gitbook.io'
    ];
    return socialMediaDomains.some(domain => hostname.endsWith(domain));
}

export function isTokenAddressInText(tokenAddress: string, textOrTexts: string | string[]): boolean {
    if (typeof textOrTexts === 'string') {
      return textOrTexts.includes(tokenAddress);
    } else if (Array.isArray(textOrTexts)) {
      return textOrTexts.some(text => text.includes(tokenAddress));
    } else {
      return false;
    }
}


export function extractEd25519PublicKeys(input: string | string[]): Set<string> {
  // Regular expression for base58-compatible strings (32 to 44 characters)
  const pattern = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g;

  const validAddresses = new Set<string>();

  // Normalize input to an array of strings
  const texts = Array.isArray(input) ? input : [input];

  for (const text of texts) {
      // Find all potential matches
      const candidates = text.match(pattern) || [];

      // Filter only valid base58-encoded strings
      for (const candidate of candidates) {
          try {
              // Decode using base58 to ensure it's valid
              const decoded = bs58.decode(candidate);
              // Optional: Validate length (32 bytes is standard for Solana)
              if (decoded.length === 32) {
                  validAddresses.add(candidate);
              }
          } catch (error) {
              // Ignore invalid base58 strings
              continue;
          }
      }
  }

  return validAddresses;
}
  
