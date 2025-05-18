/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
/** 임시로 생성한 graphql 코드입니다.
 * 정확한 graphql 스키마가 나오면 이 코드를 대체합니다.
 * codegen을 사용하여 생성한 graphql.tsx 파일을 대체합니다.
 */
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export enum AgeGroup {
  FortiesPlus = 'FORTIES_PLUS',
  Teens = 'TEENS',
  Thirties = 'THIRTIES',
  Twenties = 'TWENTIES',
}

export interface Applicant {
  __typename?: 'Applicant';
  goals: Array<Maybe<Scalars['String']['output']>>;
  id: Scalars['ID']['output'];
  member: Member;
  relation: Relation;
}

export enum Category {
  Book = 'BOOK',
  Dev = 'DEV',
  Economy = 'ECONOMY',
  Exercise = 'EXERCISE',
  Leisure = 'LEISURE',
  Music = 'MUSIC',
  Study = 'STUDY',
}

export interface Challenge {
  __typename?: 'Challenge';
  applicants: Array<Maybe<Applicant>>;
  host: Member;
  id: Scalars['ID']['output'];
  info: ChallengeInfo;
  like: Likes;
  title: Scalars['String']['output'];
}

export interface ChallengeConnection {
  __typename?: 'ChallengeConnection';
  edges?: Maybe<Array<Maybe<ChallengeEdge>>>;
  pageInfo: PageInfo;
}

export interface ChallengeEdge {
  __typename?: 'ChallengeEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Challenge>;
}

export interface ChallengeFilterInput {
  ageGroup?: InputMaybe<AgeGroup>;
  duration?: InputMaybe<DurationRange>;
  job?: InputMaybe<JobType>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<ChallengeStatus>;
}

export interface ChallengeInfo {
  __typename?: 'ChallengeInfo';
  birthday?: Maybe<Date>;
  category?: Maybe<Category>;
  email?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  job?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
}

export enum ChallengeRole {
  Guest = 'GUEST',
  Host = 'HOST',
}

export enum ChallengeStatus {
  Completed = 'COMPLETED',
  Fixed = 'FIXED',
  Flexible = 'FLEXIBLE',
  InProgress = 'IN_PROGRESS',
  Recruiting = 'RECRUITING',
}

export interface Date {
  __typename?: 'Date';
  day?: Maybe<Scalars['Int']['output']>;
  month?: Maybe<Scalars['Int']['output']>;
  year?: Maybe<Scalars['Int']['output']>;
}

export interface DiaryGoal {
  __typename?: 'DiaryGoal';
  achieve: Scalars['Boolean']['output'];
  content: Scalars['String']['output'];
}

export interface DiaryInfo {
  __typename?: 'DiaryInfo';
  createdAt: Date;
  date: Date;
  feeling: Feeling;
  goals: Array<Maybe<DiaryGoal>>;
  public: Scalars['Boolean']['output'];
}

export interface DiaryOption {
  __typename?: 'DiaryOption';
  public: Scalars['Boolean']['output'];
}

export interface DiaryStatus {
  __typename?: 'DiaryStatus';
  deleted: Scalars['Boolean']['output'];
}

export interface DurationRange {
  maxDays?: InputMaybe<Scalars['Int']['input']>;
  minDays?: InputMaybe<Scalars['Int']['input']>;
}

export enum Feeling {
  Happy = 'HAPPY',
  Sad = 'SAD',
  SoSo = 'SO_SO',
}

export interface Goal {
  __typename?: 'Goal';
  content: Scalars['String']['output'];
  id: Scalars['ID']['output'];
}

export interface Img {
  __typename?: 'Img';
  path?: Maybe<Scalars['String']['output']>;
}

export enum JobType {
  Student = 'STUDENT',
  Worker = 'WORKER',
}

export interface Likes {
  __typename?: 'Likes';
  count: Scalars['Int']['output'];
  members: Array<Maybe<Member>>;
}

export interface Member {
  __typename?: 'Member';
  id: Scalars['ID']['output'];
  img?: Maybe<Img>;
  info: MemberInfo;
  option: MemberOption;
  relations: Array<Maybe<Relation>>;
  role: MemberRole;
}

export interface MemberInfo {
  __typename?: 'MemberInfo';
  birthday?: Maybe<Date>;
  category?: Maybe<Category>;
  email?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  job?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
}

export interface MemberOption {
  __typename?: 'MemberOption';
  public: Scalars['Boolean']['output'];
}

export enum MemberRole {
  Admin = 'ADMIN',
  Participant = 'PARTICIPANT',
}

export enum MyStatus {
  Host = 'HOST',
  None = 'NONE',
  Participant = 'PARTICIPANT',
  Requested = 'REQUESTED',
}

export interface PageInfo {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
}

export interface Query {
  __typename?: 'Query';
  challengeDetail?: Maybe<Challenge>;
  challengesList?: Maybe<ChallengeConnection>;
  member?: Maybe<Member>;
  myChallenges?: Maybe<Array<Maybe<Challenge>>>;
  randomChallenges?: Maybe<Array<Maybe<Challenge>>>;
}

export type QueryChallengeDetailArgs = {
  id: Scalars['ID']['input'];
};

export type QueryChallengesListArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ChallengeFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryMemberArgs = {
  id: Scalars['ID']['input'];
};

export type QueryRandomChallengesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
};

export interface Relation {
  __typename?: 'Relation';
  member: Member;
  status: RelationStatus;
}

export enum RelationStatus {
  Accepted = 'ACCEPTED',
  Pending = 'PENDING',
  Rejected = 'REJECTED',
}

export type GetMemberQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetMemberQuery = {
  __typename?: 'Query';
  member?: { __typename?: 'Member'; id: string } | null;
};

export const GetMemberDocument = gql`
  query getMember($id: ID!) {
    member(id: $id) {
      id
    }
  }
`;

/**
 * __useGetMemberQuery__
 *
 * To run a query within a React component, call `useGetMemberQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMemberQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMemberQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetMemberQuery(
  baseOptions: Apollo.QueryHookOptions<GetMemberQuery, GetMemberQueryVariables> &
    ({ variables: GetMemberQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetMemberQuery, GetMemberQueryVariables>(GetMemberDocument, options);
}
export function useGetMemberLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetMemberQuery, GetMemberQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetMemberQuery, GetMemberQueryVariables>(GetMemberDocument, options);
}
export function useGetMemberSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetMemberQuery, GetMemberQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetMemberQuery, GetMemberQueryVariables>(
    GetMemberDocument,
    options
  );
}
export type GetMemberQueryHookResult = ReturnType<typeof useGetMemberQuery>;
export type GetMemberLazyQueryHookResult = ReturnType<typeof useGetMemberLazyQuery>;
export type GetMemberSuspenseQueryHookResult = ReturnType<typeof useGetMemberSuspenseQuery>;
export type GetMemberQueryResult = Apollo.QueryResult<GetMemberQuery, GetMemberQueryVariables>;
