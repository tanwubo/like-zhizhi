export type PutObjectInput = {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
};

export type StoredObject = {
  body: unknown;
  contentType?: string;
  contentLength?: number;
};

export type StorageAdapter = {
  kind: "s3" | "r2";
  putObject(input: PutObjectInput): Promise<{
    bucket: string;
    key: string;
    publicUrl: string;
  }>;
  getObject(key: string): Promise<StoredObject>;
};
