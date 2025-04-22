/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createTodo = /* GraphQL */ `mutation CreateTodo(
  $input: CreateTodoInput!
  $condition: ModelTodoConditionInput
) {
  createTodo(input: $input, condition: $condition) {
    id
    name
    description
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateTodoMutationVariables,
  APITypes.CreateTodoMutation
>;
export const updateTodo = /* GraphQL */ `mutation UpdateTodo(
  $input: UpdateTodoInput!
  $condition: ModelTodoConditionInput
) {
  updateTodo(input: $input, condition: $condition) {
    id
    name
    description
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateTodoMutationVariables,
  APITypes.UpdateTodoMutation
>;
export const deleteTodo = /* GraphQL */ `mutation DeleteTodo(
  $input: DeleteTodoInput!
  $condition: ModelTodoConditionInput
) {
  deleteTodo(input: $input, condition: $condition) {
    id
    name
    description
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteTodoMutationVariables,
  APITypes.DeleteTodoMutation
>;
export const createHealthData = /* GraphQL */ `mutation CreateHealthData(
  $input: CreateHealthDataInput!
  $condition: ModelHealthDataConditionInput
) {
  createHealthData(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateHealthDataMutationVariables,
  APITypes.CreateHealthDataMutation
>;
export const updateHealthData = /* GraphQL */ `mutation UpdateHealthData(
  $input: UpdateHealthDataInput!
  $condition: ModelHealthDataConditionInput
) {
  updateHealthData(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateHealthDataMutationVariables,
  APITypes.UpdateHealthDataMutation
>;
export const deleteHealthData = /* GraphQL */ `mutation DeleteHealthData(
  $input: DeleteHealthDataInput!
  $condition: ModelHealthDataConditionInput
) {
  deleteHealthData(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteHealthDataMutationVariables,
  APITypes.DeleteHealthDataMutation
>;
