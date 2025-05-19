import { ApolloClient, InMemoryCache, gql, NormalizedCacheObject } from '@apollo/client';
import { MockLink, MockedResponse } from '@apollo/client/testing';
import { IUserRepository } from '@/features/user/domain/repositories/IUserRepository';
import { UserModel } from '@/features/user/domain/entities/UserModel';

const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    user(id: $id) {
      id
      email
      name
    }
  }
`;
const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    userByEmail(email: $email) {
      id
      email
      name
    }
  }
`;
const SAVE_USER = gql`
  mutation SaveUser($id: ID!) {
    saveUser(id: $id)
  }
`;
const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

const mocks: MockedResponse[] = [
  {
    request: {
      query: GET_USER_BY_ID,
      variables: { id: '1' },
    },
    result: {
      data: { user: { id: '1', email: 'mock1@example.com', name: 'Mock User 1' } },
    },
  },
  {
    request: {
      query: GET_USER_BY_EMAIL,
      variables: { email: 'mock@example.com' },
    },
    result: {
      data: { userByEmail: { id: '2', email: 'mock@example.com', name: 'Mock User 2' } },
    },
  },
  {
    request: {
      query: SAVE_USER,
      variables: { id: '3' },
    },
    result: {
      data: { saveUser: true },
    },
  },
  {
    request: {
      query: DELETE_USER,
      variables: { id: '4' },
    },
    result: {
      data: { deleteUser: true },
    },
  },
];

// 3) MockLink 기반 ApolloClient 생성
const mockClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  link: new MockLink(mocks),
  cache: new InMemoryCache(),
});

// 4) UserRepositoryMock 구현
export class UserRepositoryMock implements IUserRepository {
  private client = mockClient;

  async findById(id: string): Promise<UserModel | null> {
    const { data } = await this.client.query<{ user: { id: string; email: string; name: string } }>(
      {
        query: GET_USER_BY_ID,
        variables: { id },
      }
    );
    return data.user ? UserModel.create(data.user) : null;
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    const { data } = await this.client.query<{
      userByEmail: { id: string; email: string; name: string };
    }>({
      query: GET_USER_BY_EMAIL,
      variables: { email },
    });
    return data.userByEmail ? UserModel.create(data.userByEmail) : null;
  }

  async save(id: string): Promise<void> {
    await this.client.mutate<{ saveUser: boolean }>({
      mutation: SAVE_USER,
      variables: { id },
    });
  }

  async delete(id: string): Promise<void> {
    await this.client.mutate<{ deleteUser: boolean }>({
      mutation: DELETE_USER,
      variables: { id },
    });
  }
}

export { mocks };
