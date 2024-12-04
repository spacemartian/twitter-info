import dotenv from 'dotenv';
import TokenMetadataAnalysis from './fetchTokenMetadata';
dotenv.config();

(async () => {
    const metadata = new TokenMetadataAnalysis(process.env.BEARER_TOKEN!);

    console.log(await metadata.generateSummary("7etsuo", "8i51XNNpGaKaj4G4nDdmQh95v4FKAxw8mhtaRoKd9tE8"))
})()