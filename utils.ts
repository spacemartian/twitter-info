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