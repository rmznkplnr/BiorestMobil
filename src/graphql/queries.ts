/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getTodo = /* GraphQL */ `query GetTodo($id: ID!) {
  getTodo(id: $id) {
    id
    name
    description
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetTodoQueryVariables, APITypes.GetTodoQuery>;
export const listTodos = /* GraphQL */ `query ListTodos(
  $filter: ModelTodoFilterInput
  $limit: Int
  $nextToken: String
) {
  listTodos(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      name
      description
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListTodosQueryVariables, APITypes.ListTodosQuery>;
export const getHealthData = /* GraphQL */ `query GetHealthData($id: ID!) {
  getHealthData(id: $id) {
    id
    userId
    timestamp
    heartRate {
      average
      values
      times
      lastUpdated
      status
      max
      min
      __typename
    }
    oxygen {
      average
      values
      times
      lastUpdated
      status
      max
      min
      __typename
    }
    sleep {
      duration
      efficiency
      deepSleep
      lightSleep
      remSleep
      awakeTime
      lastUpdated
      status
      deep
      __typename
    }
    steps {
      count
      goal
      lastUpdated
      __typename
    }
    calories {
      value
      goal
      lastUpdated
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetHealthDataQueryVariables,
  APITypes.GetHealthDataQuery
>;
export const listHealthData = /* GraphQL */ `query ListHealthData(
  $filter: ModelHealthDataFilterInput
  $limit: Int
  $nextToken: String
) {
  listHealthData(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      userId
      timestamp
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListHealthDataQueryVariables,
  APITypes.ListHealthDataQuery
>;
