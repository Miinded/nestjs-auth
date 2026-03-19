export interface IAuthApiKeys {
  getOneUserByApiKey(apiKey: string): Promise<unknown>;
}
