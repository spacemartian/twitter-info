import { TwitterApi } from 'twitter-api-v2';
import { isSocialMedia, isTokenAddressInText } from './utils';

interface UserProfile {
    id?: string;
    name?: string;
    username?: string;
    url?: string;
    description?: string;
    followers_count?: number;
    following_count?: number;
    tweet_count?: number;
    error?: {
        message: string;
        details?: string;
    };
}

interface Tweet {
    id: string;
    text: string;
    created_at: string;
}

interface WebsiteVerification {
    isSecure?: boolean;
    isValid: boolean;
    status?: number;
    contentType?: string;
    isSocialMedia?: boolean;
}

interface Summary {
    userProfile: UserProfile,
    websiteVerification: WebsiteVerification,
    tokenAddressFound: boolean,
    error?: string
}

class TokenMetadataAnalysis {
    #client;
    
    /**
     * Constructor that takes a bearer token and creates a read-only client
     * @param bearerToken Twitter API bearer token (typically from environment variables)
    */
    constructor(bearerToken: string) {
        const client = new TwitterApi(bearerToken);
        
        // Create a read-only client to restrict operations
        this.#client = client.readOnly;
    }

    /**
     * Fetch user profile information
     * @param username Twitter username
     * @returns Promise resolving to user profile
    */
    async fetchUserProfile(username: string): Promise<UserProfile> {
        try {
            console.log("Reading user profile ...")
            const user = await this.#client.v2.userByUsername(username, {
                "user.fields": [
                  'name', 'username', 'description', 'url', 
                  'verified', 'verified_type', 'created_at', 'public_metrics'
                ]
            });
    
            if (!user.data) {
                return {
                    error: {
                        message: 'User not found',
                        details: `No data returned for username: ${username}`
                    }
                };
            }
    
            const userData = user.data;
    
            return {
                id: userData.id,
                name: userData.name,
                username: userData.username,
                url: userData.url ?? "",
                description: userData.description,
                followers_count: userData.public_metrics?.followers_count ?? 0,
                following_count: userData.public_metrics?.following_count ?? 0,
                tweet_count: userData.public_metrics?.tweet_count ?? 0
            };
        } catch (error) {
            let errorMessage = 'Failed to fetch user profile';
            let errorDetails = '';
    
            if (error instanceof Error) {
                errorMessage = `Failed to fetch user profile for ${username}`;
                errorDetails = `${error}`;
    
                // Specific handling for Twitter API errors
                if ('errors' in error && Array.isArray(error.errors)) {
                    errorDetails = error.errors.map(err => err.detail || err.message).join('; ');
                }
            }
    
            return {
                error: {
                    message: errorMessage,
                    details: errorDetails
                }
            };
        }
    }

    /**
     * Fetch recent tweets for a user
     * @param userId Twitter user ID
     * @param maxResults Maximum number of tweets to retrieve (default 5)
     * @returns Promise resolving to array of tweets
    */
    async fetchUserTweets(userId: string, maxResults: number = 5): Promise<Tweet[]> {
        try {
        // Fetch tweets using the read-only client
        console.log("Reading tweets ...")
        const tweetsResponse = await this.#client.v2.userTimeline(userId, {
            max_results: maxResults,
            'tweet.fields': ['created_at', 'text'],
        });

        // Convert tweets to our custom Tweet interface
        return tweetsResponse.data.data?.map(tweet => ({
            id: tweet.id,
            text: tweet.text,
            created_at: tweet.created_at!
        })) || [];
        } catch (error) {
        console.error('Error fetching user tweets:', error);
        throw new Error('Failed to fetch tweets');
        }
    }

    /**
     * Verify a website by performing a HEAD request
     * @param url Website URL to verify
     * @returns Promise resolving to website verification result
    */
    async verifyWebsite(url: string): Promise<WebsiteVerification> {
        let finalUrl: string;
    
        // Check if the URL has a protocol; if not, add 'https://'
        try {
            new URL(url);
            finalUrl = url;
        } catch {
            finalUrl = `https://${url}`;
        }
    
        try {
            console.log("Reading website ...")
            const response = await fetch(finalUrl, { method: 'HEAD' });
            const urlObj = new URL(response.url);
            const hostnameWithoutWWW = urlObj.hostname.replace(/^www\./, '').toLowerCase();
            const isSocial = isSocialMedia(hostnameWithoutWWW);
    
            return {
                isValid: response.ok,
                isSecure: response.url.startsWith('https://'),
                status: response.status,
                contentType: response.headers.get('content-type') || undefined,
                isSocialMedia: isSocial,
            };
        } catch (error) {
            console.error('Error verifying website:', error);
            return {
                isValid: false
            };
        }
    }

    /**
     * Generate a comprehensive summary of user metadata and token presence
     * @param username Twitter username
     * @param tokenAddress Token address to search for
     * @returns Comprehensive analysis of user profile, website, and token presence
     */
    async generateSummary(username: string, tokenAddress: string): Promise<Summary> {
        try {
            const userProfile = await this.fetchUserProfile(username);
            if (userProfile.error) {
                return {
                    userProfile,
                    websiteVerification: {} as WebsiteVerification,
                    tokenAddressFound: false,
                    error: userProfile.error.message
                };
            }

            const profileDescription = userProfile.description || '';
            if (isTokenAddressInText(tokenAddress, profileDescription)) {
                // Token found in profile, no need to fetch tweets
                const websiteVerification = await this.verifyWebsite(userProfile.url || '');
                return {
                    userProfile,
                    websiteVerification,
                    tokenAddressFound: true
                };
            } else {
                // Token not in profile, fetch tweets and check there
                try {
                    const tweets = await this.fetchUserTweets(userProfile.id!, 10);
                    const tweetsText = tweets.map(tweet => tweet.text);
                    const tokenInTweets = isTokenAddressInText(tokenAddress, tweetsText);
                    const websiteVerification = await this.verifyWebsite(userProfile.url || '');
                    return {
                        userProfile,
                        websiteVerification,
                        tokenAddressFound: tokenInTweets
                    };
                } catch (tweetError) {
                    console.error('Error fetching tweets:', tweetError);
                    const websiteVerification = await this.verifyWebsite(userProfile.url || '');
                    return {
                        userProfile,
                        websiteVerification,
                        tokenAddressFound: false,
                        error: 'Failed to fetch tweets. Token address not found in profile or tweets could not be fetched.'
                    };
                }
            }
        } catch (error) {
            console.error('Error generating summary:', error);
            return {
                userProfile: {} as UserProfile,
                websiteVerification: {} as WebsiteVerification,
                tokenAddressFound: false,
                error: 'An error occurred while generating the summary.'
            };
        }
    }

    
}

export default TokenMetadataAnalysis;