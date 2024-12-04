# TokenMetadataAnalysis Documentation

## Overview

The `TokenMetadataAnalysis` class is designed to analyze and generate a comprehensive summary of a Twitter user's metadata, including their profile information, recent tweets, and the presence of a specified token address. The class leverages the Twitter API v2 to fetch user data and tweets, and it verifies the user's website for security and validity.

## Configuration

Before using the class, you need to set up your environment variables. Create a `.env` file in the root directory of your project and add your Twitter API (https://developers.x.com/) bearer token:

```env
BEARER_TOKEN=your_twitter_api_bearer_token
```

## Usage

### Example Usage

```typescript
import dotenv from 'dotenv';
import TokenMetadataAnalysis from './fetchTokenMetadata';
dotenv.config();

(async () => {
    const metadata = new TokenMetadataAnalysis(process.env.BEARER_TOKEN!);

    console.log(await metadata.generateSummary("7etsuo", "8i51XNNpGaKaj4G4nDdmQh95v4FKAxw8mhtaRoKd9tE8"))
})()
```

### Class: TokenMetadataAnalysis

#### Constructor

```typescript
constructor(bearerToken: string)
```

- **Parameters:**
  - `bearerToken`: Twitter API bearer token (typically from environment variables).

- **Description:**
  Initializes a read-only client for interacting with the Twitter API.

#### Methods

##### `fetchUserProfile(username: string): Promise<UserProfile>`

- **Parameters:**
  - `username`: Twitter username.

- **Returns:**
  - A promise resolving to the user profile information.

- **Description:**
  Fetches the user profile information from Twitter, including name, username, description, URL, and public metrics (followers count, following count, tweet count).

##### `fetchUserTweets(userId: string, maxResults: number = 5): Promise<Tweet[]>`

- **Parameters:**
  - `userId`: Twitter user ID.
  - `maxResults`: Maximum number of tweets to retrieve (default is 5).

- **Returns:**
  - A promise resolving to an array of tweets.

- **Description:**
  Fetches recent tweets for the specified user, up to the maximum number of results specified.

##### `verifyWebsite(url: string): Promise<WebsiteVerification>`

- **Parameters:**
  - `url`: Website URL to verify.

- **Returns:**
  - A promise resolving to the website verification result.

- **Description:**
  Verifies the website by performing a HEAD request, checking for HTTPS, and determining if the URL is a social media platform.

##### `generateSummary(username: string, tokenAddress: string): Promise<Summary>`

- **Parameters:**
  - `username`: Twitter username.
  - `tokenAddress`: Token address to search for.

- **Returns:**
  - A promise resolving to a comprehensive summary of the user profile, website verification, and token presence.

- **Description:**
  Generates a summary by fetching the user profile, verifying the website, and checking for the presence of the specified token address in the user's profile description or recent tweets.

### Interfaces

#### `UserProfile`

Represents the user profile information.

```typescript
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
```

#### `Tweet`

Represents a single tweet.

```typescript
interface Tweet {
    id: string;
    text: string;
    created_at: string;
}
```

#### `WebsiteVerification`

Represents the result of website verification.

```typescript
interface WebsiteVerification {
    isSecure?: boolean;
    isValid: boolean;
    status?: number;
    contentType?: string;
    isSocialMedia?: boolean;
}
```

#### `Summary`

Represents the comprehensive summary of user metadata and token presence.

```typescript
interface Summary {
    userProfile: UserProfile,
    websiteVerification: WebsiteVerification,
    tokenAddressFound: boolean,
    error?: string
}
```

### Example Output

#### Successful Request

```json
{
  "userProfile": {
    "id": "1587601034339561472",
    "name": "7etsuo",
    "username": "7etsuo",
    "url": "https://t.co/Vy2jXXsA72",
    "description": "Cyberpunk Ethos. C & ASM Wizard. E/Acc.\n\nTETSUO (SOL) - Community Token\n\nContract Address: 8i51XNNpGaKaj4G4nDdmQh95v4FKAxw8mhtaRoKd9tE8",
    "followers_count": 55226,
    "following_count": 371,
    "tweet_count": 5441
  },
  "websiteVerification": {
    "isValid": true,
    "isSecure": true,
    "status": 200,
    "contentType": "text/html",
    "isSocialMedia": false
  },
  "tokenAddressFound": true
}
```

#### Failed Request

```json
{
  "userProfile": {
    "error": {
      "message": "User not found",
      "details": "No data returned for username: SeedUnitSol"
    }
  },
  "websiteVerification": {},
  "tokenAddressFound": false,
  "error": "User not found"
}
```
