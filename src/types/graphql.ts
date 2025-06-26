// GraphQL API Tipleri
export interface HealthData {
  id: string;
  userId: string;
  nabiz?: number;
  oksijen?: number;
  topuykusuresi?: number;
  rem?: number;
  derin?: number;
  hafif?: number;
  adim?: number;
  kalori?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHealthDataInput {
  userId: string;
  nabiz?: number;
  oksijen?: number;
  topuykusuresi?: number;
  rem?: number;
  derin?: number;
  hafif?: number;
  adim?: number;
  kalori?: number;
}

// GraphQL Mutations
export const createHealthDataMutation = `
  mutation CreateHealthData($input: CreateHealthDataInput!) {
    createHealthData(input: $input) {
      id
      userId
      nabiz
      oksijen
      topuykusuresi
      rem
      derin
      hafif
      adim
      kalori
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
        userId
        nabiz
        oksijen
        topuykusuresi
        rem
        derin
        hafif
        adim
        kalori
        createdAt
        updatedAt
      }
    }
  }
`;

// Kullanıcıya özel veri sorgulama
export const listHealthDataByUserQuery = `
  query ListHealthDataByUser($userId: String!) {
    listHealthData(filter: { userId: { eq: $userId } }) {
      items {
        id
        userId
        nabiz
        oksijen
        topuykusuresi
        rem
        derin
        hafif
        adim
        kalori
        createdAt
        updatedAt
      }
    }
  }
`; 