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
            order: {
              product_items:{
                product_retailer_id: string;
                item_price: string;
              }[];
            };
          }[];
          metadata: {
            phone_number_id: string;
          };
        };
      }[];
    }[];
  }
  
