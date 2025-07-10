// GraphQL API Tipleri - Yeni Schema'ya göre güncellenmiş

export interface KaloriEntry {
  zaman: string;  // AWSDateTime
  deger: number;  // Int
}

export interface AdimEntry {
  zaman: string;  // AWSDateTime 
  deger: number;  // Int
}

export interface UykuEntry {
  start: string;  // AWSDateTime
  end: string;    // AWSDateTime
  derin?: number; // Int (optional)
  rem?: number;   // Int (optional)
  hafif?: number; // Int (optional)
  toplam: number; // Int (required)
}

export interface NabizEntry {
  zaman: string;  // AWSDateTime
  deger: number;  // Int
}

export interface OksijenEntry {
  zaman: string;  // AWSDateTime
  deger: number;  // Int
}

export interface HealthData {
  id: string;
  tarih: string;              // AWSDate - required (YYYY-MM-DD format)
  username: string;           // String - required  
  nabiz?: NabizEntry[];       // Array of heart rate entries
  oksijen?: OksijenEntry[];   // Array of oxygen entries
  uyku?: UykuEntry[];         // Array of sleep entries
  kalori?: KaloriEntry;       // Single object (AWS schema'ya göre)
  adim?: AdimEntry;           // Single object (AWS schema'ya göre)
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHealthDataInput {
  tarih: string;              // Required: YYYY-MM-DD format
  username: string;           // Required: user email
  nabiz?: NabizEntry[];
  oksijen?: OksijenEntry[];
  uyku?: UykuEntry[];
  kalori?: KaloriEntry[];     // Array (updated schema'ya göre)
  adim?: AdimEntry[];         // Array (updated schema'ya göre)
}

export interface UpdateHealthDataInput {
  id: string;
  tarih?: string;
  username?: string;
  nabiz?: NabizEntry[];
  oksijen?: OksijenEntry[];
  uyku?: UykuEntry[];
  kalori?: KaloriEntry[];     // Array (updated schema'ya göre)
  adim?: AdimEntry[];         // Array (updated schema'ya göre)
}

export interface DeleteHealthDataInput {
  id: string;
}

// GraphQL Mutations
export const createHealthDataMutation = `
  mutation CreateHealthData($input: CreateHealthDataInput!) {
    createHealthData(input: $input) {
      id
      tarih
      username
      nabiz {
        zaman
        deger
      }
      oksijen {
        zaman
        deger
      }
      uyku {
        start
        end
        derin
        rem
        hafif
        toplam
      }
      kalori {
        zaman
        deger
      }
      adim {
        zaman
        deger
      }
      createdAt
      updatedAt
    }
  }
`;

export const updateHealthDataMutation = `
  mutation UpdateHealthData($input: UpdateHealthDataInput!) {
    updateHealthData(input: $input) {
      id
      tarih
      username
      nabiz {
        zaman
        deger
      }
      oksijen {
        zaman
        deger
      }
      uyku {
        start
        end
        derin
        rem
        hafif
        toplam
      }
      kalori {
        zaman
        deger
      }
      adim {
        zaman
        deger
      }
      createdAt
      updatedAt
    }
  }
`;

// GraphQL Queries
export const listHealthDataQuery = `
  query ListHealthData {
    listHealthData {
      items {
        id
        tarih
        username
        nabiz {
          zaman
          deger
        }
        oksijen {
          zaman
          deger
        }
        uyku {
          start
          end
          derin
          rem
          hafif
          toplam
        }
        kalori {
          zaman
          deger
        }
        adim {
          zaman
          deger
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const listHealthDataByUserQuery = `
  query ListHealthDataByUser($username: String!) {
    listHealthData(filter: { 
      username: { eq: $username }
    }) {
      items {
        id
        tarih
        username
        nabiz {
          zaman
          deger
        }
        oksijen {
          zaman
          deger
        }
        uyku {
          start
          end
          derin
          rem
          hafif
          toplam
        }
        kalori {
          zaman
          deger
        }
        adim {
          zaman
          deger
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const getHealthDataByDateQuery = `
  query GetHealthDataByDate($username: String!, $tarih: AWSDate!) {
    listHealthData(filter: { 
      and: [
        { username: { eq: $username } },
        { tarih: { eq: $tarih } }
      ]
    }) {
      items {
        id
        tarih
        username
        nabiz {
          zaman
          deger
        }
        oksijen {
          zaman
          deger
        }
        uyku {
          start
          end
          derin
          rem
          hafif
          toplam
        }
        kalori {
          zaman
          deger
        }
        adim {
          zaman
          deger
        }
        createdAt
        updatedAt
      }
    }
  }
`; 