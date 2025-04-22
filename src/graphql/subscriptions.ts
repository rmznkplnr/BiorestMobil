/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateTodo = /* GraphQL */ `subscription OnCreateTodo($filter: ModelSubscriptionTodoFilterInput) {
  onCreateTodo(filter: $filter) {
    id
    name
    description
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateTodoSubscriptionVariables,
  APITypes.OnCreateTodoSubscription
>;
export const onUpdateTodo = /* GraphQL */ `subscription OnUpdateTodo($filter: ModelSubscriptionTodoFilterInput) {
  onUpdateTodo(filter: $filter) {
    id
    name
    description
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateTodoSubscriptionVariables,
  APITypes.OnUpdateTodoSubscription
>;
export const onDeleteTodo = /* GraphQL */ `subscription OnDeleteTodo($filter: ModelSubscriptionTodoFilterInput) {
  onDeleteTodo(filter: $filter) {
    id
    name
    description
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteTodoSubscriptionVariables,
  APITypes.OnDeleteTodoSubscription
>;
export const onCreateHealthData = /* GraphQL */ `subscription OnCreateHealthData(
  $filter: ModelSubscriptionHealthDataFilterInput
  $owner: String
) {
  onCreateHealthData(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateHealthDataSubscriptionVariables,
  APITypes.OnCreateHealthDataSubscription
>;
export const onUpdateHealthData = /* GraphQL */ `subscription OnUpdateHealthData(
  $filter: ModelSubscriptionHealthDataFilterInput
  $owner: String
) {
  onUpdateHealthData(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateHealthDataSubscriptionVariables,
  APITypes.OnUpdateHealthDataSubscription
>;
export const onDeleteHealthData = /* GraphQL */ `subscription OnDeleteHealthData(
  $filter: ModelSubscriptionHealthDataFilterInput
  $owner: String
) {
  onDeleteHealthData(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteHealthDataSubscriptionVariables,
  APITypes.OnDeleteHealthDataSubscription
>;
