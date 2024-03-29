import { Sdk, addFeature } from '@unique-nft/substrate-client';
import { UnsignedTxPayload } from '@unique-nft/substrate-client/types';

class SponsorshipSdkModule {
  private sdk: Sdk;

  constructor(sdk: Sdk) {
    this.sdk = sdk;
  }

  confirmSponsorship(collectionId: number, signer?: string): Promise<UnsignedTxPayload> {
    return this.sdk.extrinsics.build({
      section: 'unique',
      method: 'confirmSponsorship',
      args: [collectionId],
      address: signer || '',
      isImmortal: false
    });
  }

  removeCollectionSponsor(collectionId: number, signer?: string): Promise<UnsignedTxPayload> {
    return this.sdk.extrinsics.build({
      section: 'unique',
      method: 'removeCollectionSponsor',
      args: [collectionId],
      address: signer || '',
      isImmortal: false
    });
  }

  setCollectionSponsor(collectionId: number, sponsorAddress: string, signer?: string): Promise<UnsignedTxPayload> {
    return this.sdk.extrinsics.build({
      section: 'unique',
      method: 'setCollectionSponsor',
      args: [collectionId],
      address: signer || '',
      isImmortal: false
    });
  }
}

declare module '@unique-nft/substrate-client' {
  export interface Sdk {
    sponsorhip: SponsorshipSdkModule;
  }
}

addFeature('sponsorship', SponsorshipSdkModule);
