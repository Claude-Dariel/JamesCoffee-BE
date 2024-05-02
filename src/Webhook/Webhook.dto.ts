// webhook.dto.ts
export interface WebhookDTO {
    object: string;
    entry: {
      changes: {
        value: {
          contacts: {
            profile: {
              name: string;
            };
            wa_id: string;
          }[];
          messages: {
            from: string;
            text: {
              body: string;
            };
            type: string;
          }[];
          metadata: {
            phone_number_id: string;
          };
        };
      }[];
    }[];
  }
  
