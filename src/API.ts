/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateTodoInput = {
  id?: string | null,
  name: string,
  description?: string | null,
};

export type ModelTodoConditionInput = {
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  and?: Array< ModelTodoConditionInput | null > | null,
  or?: Array< ModelTodoConditionInput | null > | null,
  not?: ModelTodoConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type Todo = {
  __typename: "Todo",
  id: string,
  name: string,
  description?: string | null,
  createdAt: string,
  updatedAt: string,
};

export type UpdateTodoInput = {
  id: string,
  name?: string | null,
  description?: string | null,
};

export type DeleteTodoInput = {
  id: string,
};

export type CreateHealthDataInput = {
  id?: string | null,
  userId: string,
  timestamp: string,
  heartRate?: HeartRateDataInput | null,
  oxygen?: OxygenDataInput | null,
  sleep?: SleepDataInput | null,
  steps?: StepsDataInput | null,
  calories?: CaloriesDataInput | null,
};

export type HeartRateDataInput = {
  average?: number | null,
  values?: Array< number | null > | null,
  times?: Array< string | null > | null,
  lastUpdated?: string | null,
  status?: string | null,
  max?: number | null,
  min?: number | null,
};

export type OxygenDataInput = {
  average?: number | null,
  values?: Array< number | null > | null,
  times?: Array< string | null > | null,
  lastUpdated?: string | null,
  status?: string | null,
  max?: number | null,
  min?: number | null,
};

export type SleepDataInput = {
  duration?: number | null,
  efficiency?: number | null,
  deepSleep?: number | null,
  lightSleep?: number | null,
  remSleep?: number | null,
  awakeTime?: number | null,
  lastUpdated?: string | null,
  status?: string | null,
  deep?: number | null,
};

export type StepsDataInput = {
  count?: number | null,
  goal?: number | null,
  lastUpdated?: string | null,
};

export type CaloriesDataInput = {
  value?: number | null,
  goal?: number | null,
  lastUpdated?: string | null,
};

export type ModelHealthDataConditionInput = {
  userId?: ModelStringInput | null,
  timestamp?: ModelStringInput | null,
  and?: Array< ModelHealthDataConditionInput | null > | null,
  or?: Array< ModelHealthDataConditionInput | null > | null,
  not?: ModelHealthDataConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  owner?: ModelStringInput | null,
};

export type HealthData = {
  __typename: "HealthData",
  id: string,
  userId: string,
  timestamp: string,
  heartRate?: HeartRateData | null,
  oxygen?: OxygenData | null,
  sleep?: SleepData | null,
  steps?: StepsData | null,
  calories?: CaloriesData | null,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type HeartRateData = {
  __typename: "HeartRateData",
  average?: number | null,
  values?: Array< number | null > | null,
  times?: Array< string | null > | null,
  lastUpdated?: string | null,
  status?: string | null,
  max?: number | null,
  min?: number | null,
};

export type OxygenData = {
  __typename: "OxygenData",
  average?: number | null,
  values?: Array< number | null > | null,
  times?: Array< string | null > | null,
  lastUpdated?: string | null,
  status?: string | null,
  max?: number | null,
  min?: number | null,
};

export type SleepData = {
  __typename: "SleepData",
  duration?: number | null,
  efficiency?: number | null,
  deepSleep?: number | null,
  lightSleep?: number | null,
  remSleep?: number | null,
  awakeTime?: number | null,
  lastUpdated?: string | null,
  status?: string | null,
  deep?: number | null,
};

export type StepsData = {
  __typename: "StepsData",
  count?: number | null,
  goal?: number | null,
  lastUpdated?: string | null,
};

export type CaloriesData = {
  __typename: "CaloriesData",
  value?: number | null,
  goal?: number | null,
  lastUpdated?: string | null,
};

export type UpdateHealthDataInput = {
  id: string,
  userId?: string | null,
  timestamp?: string | null,
  heartRate?: HeartRateDataInput | null,
  oxygen?: OxygenDataInput | null,
  sleep?: SleepDataInput | null,
  steps?: StepsDataInput | null,
  calories?: CaloriesDataInput | null,
};

export type DeleteHealthDataInput = {
  id: string,
};

export type ModelTodoFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelTodoFilterInput | null > | null,
  or?: Array< ModelTodoFilterInput | null > | null,
  not?: ModelTodoFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelTodoConnection = {
  __typename: "ModelTodoConnection",
  items:  Array<Todo | null >,
  nextToken?: string | null,
};

export type ModelHealthDataFilterInput = {
  id?: ModelIDInput | null,
  userId?: ModelStringInput | null,
  timestamp?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelHealthDataFilterInput | null > | null,
  or?: Array< ModelHealthDataFilterInput | null > | null,
  not?: ModelHealthDataFilterInput | null,
  owner?: ModelStringInput | null,
};

export type ModelHealthDataConnection = {
  __typename: "ModelHealthDataConnection",
  items:  Array<HealthData | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionTodoFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionTodoFilterInput | null > | null,
  or?: Array< ModelSubscriptionTodoFilterInput | null > | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionHealthDataFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  userId?: ModelSubscriptionStringInput | null,
  timestamp?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionHealthDataFilterInput | null > | null,
  or?: Array< ModelSubscriptionHealthDataFilterInput | null > | null,
  owner?: ModelStringInput | null,
};

export type CreateTodoMutationVariables = {
  input: CreateTodoInput,
  condition?: ModelTodoConditionInput | null,
};

export type CreateTodoMutation = {
  createTodo?:  {
    __typename: "Todo",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateTodoMutationVariables = {
  input: UpdateTodoInput,
  condition?: ModelTodoConditionInput | null,
};

export type UpdateTodoMutation = {
  updateTodo?:  {
    __typename: "Todo",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteTodoMutationVariables = {
  input: DeleteTodoInput,
  condition?: ModelTodoConditionInput | null,
};

export type DeleteTodoMutation = {
  deleteTodo?:  {
    __typename: "Todo",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateHealthDataMutationVariables = {
  input: CreateHealthDataInput,
  condition?: ModelHealthDataConditionInput | null,
};

export type CreateHealthDataMutation = {
  createHealthData?:  {
    __typename: "HealthData",
    id: string,
    userId: string,
    timestamp: string,
    heartRate?:  {
      __typename: "HeartRateData",
      average?: number | null,
      values?: Array< number | null > | null,
      times?: Array< string | null > | null,
      lastUpdated?: string | null,
      status?: string | null,
      max?: number | null,
      min?: number | null,
    } | null,
    oxygen?:  {
      __typename: "OxygenData",
      average?: number | null,
      values?: Array< number | null > | null,
      times?: Array< string | null > | null,
      lastUpdated?: string | null,
      status?: string | null,
      max?: number | null,
      min?: number | null,
    } | null,
    sleep?:  {
      __typename: "SleepData",
      duration?: number | null,
      efficiency?: number | null,
      deepSleep?: number | null,
      lightSleep?: number | null,
      remSleep?: number | null,
      awakeTime?: number | null,
      lastUpdated?: string | null,
      status?: string | null,
      deep?: number | null,
    } | null,
    steps?:  {
      __typename: "StepsData",
      count?: number | null,
      goal?: number | null,
      lastUpdated?: string | null,
    } | null,
    calories?:  {
      __typename: "CaloriesData",
      value?: number | null,
      goal?: number | null,
      lastUpdated?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateHealthDataMutationVariables = {
  input: UpdateHealthDataInput,
  condition?: ModelHealthDataConditionInput | null,
};

export type UpdateHealthDataMutation = {
  updateHealthData?:  {
    __typename: "HealthData",
    id: string,
    userId: string,
    timestamp: string,
    heartRate?:  {
      __typename: "HeartRateData",
      average?: number | null,
      values?: Array< number | null > | null,
      times?: Array< string | null > | null,
      lastUpdated?: string | null,
      status?: string | null,
      max?: number | null,
      min?: number | null,
    } | null,
    oxygen?:  {
      __typename: "OxygenData",
      average?: number | null,
      values?: Array< number | null > | null,
      times?: Array< string | null > | null,
      lastUpdated?: string | null,
      status?: string | null,
      max?: number | null,
      min?: number | null,
    } | null,
    sleep?:  {
      __typename: "SleepData",
      duration?: number | null,
      efficiency?: number | null,
      deepSleep?: number | null,
      lightSleep?: number | null,
      remSleep?: number | null,
      awakeTime?: number | null,
      lastUpdated?: string | null,
      status?: string | null,
      deep?: number | null,
    } | null,
    steps?:  {
      __typename: "StepsData",
      count?: number | null,
      goal?: number | null,
      lastUpdated?: string | null,
    } | null,
    calories?:  {
      __typename: "CaloriesData",
      value?: number | null,
      goal?: number | null,
      lastUpdated?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteHealthDataMutationVariables = {
  input: DeleteHealthDataInput,
  condition?: ModelHealthDataConditionInput | null,
};

export type DeleteHealthDataMutation = {
  deleteHealthData?:  {
    __typename: "HealthData",
    id: string,
    userId: string,
    timestamp: string,
    heartRate?:  {
      __typename: "HeartRateData",
      average?: number | null,
      values?: Array< number | null > | null,
      times?: Array< string | null > | null,
      lastUpdated?: string | null,
      status?: string | null,
      max?: number | null,
      min?: number | null,
    } | null,
    oxygen?:  {
      __typename: "OxygenData",
      average?: number | null,
      values?: Array< number | null > | null,
      times?: Array< string | null > | null,
      lastUpdated?: string | null,
      status?: string | null,
      max?: number | null,
      min?: number | null,
    } | null,
    sleep?:  {
      __typename: "SleepData",
      duration?: number | null,
      efficiency?: number | null,
      deepSleep?: number | null,
      lightSleep?: number | null,
      remSleep?: number | null,
      awakeTime?: number | null,
      lastUpdated?: string | null,
      status?: string | null,
      deep?: number | null,
    } | null,
    steps?:  {
      __typename: "StepsData",
      count?: number | null,
      goal?: number | null,
      lastUpdated?: string | null,
    } | null,
    calories?:  {
      __typename: "CaloriesData",
      value?: number | null,
      goal?: number | null,
      lastUpdated?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type GetTodoQueryVariables = {
  id: string,
};

export type GetTodoQuery = {
  getTodo?:  {
    __typename: "Todo",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListTodosQueryVariables = {
  filter?: ModelTodoFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTodosQuery = {
  listTodos?:  {
    __typename: "ModelTodoConnection",
    items:  Array< {
      __typename: "Todo",
      id: string,
      name: string,
      description?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetHealthDataQueryVariables = {
  id: string,
};

export type GetHealthDataQuery = {
  getHealthData?:  {
    __typename: "HealthData",
    id: string,
    userId: string,
    timestamp: string,
    heartRate?:  {
      __typename: "HeartRateData",
      average?: number | null,
      values?: Array< number | null > | null,
      times?: Array< string | null > | null,
      lastUpdated?: string | null,
      status?: string | null,
      max?: number | null,
      min?: number | null,
    } | null,
    oxygen?:  {
      __typename: "OxygenData",
      average?: number | null,
      values?: Array< number | null > | null,
      times?: Array< string | null > | null,
      lastUpdated?: string | null,
      status?: string | null,
      max?: number | null,
      min?: number | null,
    } | null,
    sleep?:  {
      __typename: "SleepData",
      duration?: number | null,
      efficiency?: number | null,
      deepSleep?: number | null,
      lightSleep?: number | null,
      remSleep?: number | null,
      awakeTime?: number | null,
      lastUpdated?: string | null,
      status?: string | null,
      deep?: number | null,
    } | null,
    steps?:  {
      __typename: "StepsData",
      count?: number | null,
      goal?: number | null,
      lastUpdated?: string | null,
    } | null,
    calories?:  {
      __typename: "CaloriesData",
      value?: number | null,
      goal?: number | null,
      lastUpdated?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListHealthDataQueryVariables = {
  filter?: ModelHealthDataFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListHealthDataQuery = {
  listHealthData?:  {
    __typename: "ModelHealthDataConnection",
    items:  Array< {
      __typename: "HealthData",
      id: string,
      userId: string,
      timestamp: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateTodoSubscriptionVariables = {
  filter?: ModelSubscriptionTodoFilterInput | null,
};

export type OnCreateTodoSubscription = {
  onCreateTodo?:  {
    __typename: "Todo",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateTodoSubscriptionVariables = {
  filter?: ModelSubscriptionTodoFilterInput | null,
};

export type OnUpdateTodoSubscription = {
  onUpdateTodo?:  {
    __typename: "Todo",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteTodoSubscriptionVariables = {
  filter?: ModelSubscriptionTodoFilterInput | null,
};

export type OnDeleteTodoSubscription = {
  onDeleteTodo?:  {
    __typename: "Todo",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateHealthDataSubscriptionVariables = {
  filter?: ModelSubscriptionHealthDataFilterInput | null,
  owner?: string | null,
};

export type OnCreateHealthDataSubscription = {
  onCreateHealthData?:  {
    __typename: "HealthData",
    id: string,
    userId: string,
    timestamp: string,
    heartRate?:  {
      __typename: "HeartRateData",
      average?: number | null,
      values?: Array< number | null > | null,
      times?: Array< string | null > | null,
      lastUpdated?: string | null,
      status?: string | null,
      max?: number | null,
      min?: number | null,
    } | null,
    oxygen?:  {
      __typename: "OxygenData",
      average?: number | null,
      values?: Array< number | null > | null,
      times?: Array< string | null > | null,
      lastUpdated?: string | null,
      status?: string | null,
      max?: number | null,
      min?: number | null,
    } | null,
    sleep?:  {
      __typename: "SleepData",
      duration?: number | null,
      efficiency?: number | null,
      deepSleep?: number | null,
      lightSleep?: number | null,
      remSleep?: number | null,
      awakeTime?: number | null,
      lastUpdated?: string | null,
      status?: string | null,
      deep?: number | null,
    } | null,
    steps?:  {
      __typename: "StepsData",
      count?: number | null,
      goal?: number | null,
      lastUpdated?: string | null,
    } | null,
    calories?:  {
      __typename: "CaloriesData",
      value?: number | null,
      goal?: number | null,
      lastUpdated?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateHealthDataSubscriptionVariables = {
  filter?: ModelSubscriptionHealthDataFilterInput | null,
  owner?: string | null,
};

export type OnUpdateHealthDataSubscription = {
  onUpdateHealthData?:  {
    __typename: "HealthData",
    id: string,
    userId: string,
    timestamp: string,
    heartRate?:  {
      __typename: "HeartRateData",
      average?: number | null,
      values?: Array< number | null > | null,
      times?: Array< string | null > | null,
      lastUpdated?: string | null,
      status?: string | null,
      max?: number | null,
      min?: number | null,
    } | null,
    oxygen?:  {
      __typename: "OxygenData",
      average?: number | null,
      values?: Array< number | null > | null,
      times?: Array< string | null > | null,
      lastUpdated?: string | null,
      status?: string | null,
      max?: number | null,
      min?: number | null,
    } | null,
    sleep?:  {
      __typename: "SleepData",
      duration?: number | null,
      efficiency?: number | null,
      deepSleep?: number | null,
      lightSleep?: number | null,
      remSleep?: number | null,
      awakeTime?: number | null,
      lastUpdated?: string | null,
      status?: string | null,
      deep?: number | null,
    } | null,
    steps?:  {
      __typename: "StepsData",
      count?: number | null,
      goal?: number | null,
      lastUpdated?: string | null,
    } | null,
    calories?:  {
      __typename: "CaloriesData",
      value?: number | null,
      goal?: number | null,
      lastUpdated?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteHealthDataSubscriptionVariables = {
  filter?: ModelSubscriptionHealthDataFilterInput | null,
  owner?: string | null,
};

export type OnDeleteHealthDataSubscription = {
  onDeleteHealthData?:  {
    __typename: "HealthData",
    id: string,
    userId: string,
    timestamp: string,
    heartRate?:  {
      __typename: "HeartRateData",
      average?: number | null,
      values?: Array< number | null > | null,
      times?: Array< string | null > | null,
      lastUpdated?: string | null,
      status?: string | null,
      max?: number | null,
      min?: number | null,
    } | null,
    oxygen?:  {
      __typename: "OxygenData",
      average?: number | null,
      values?: Array< number | null > | null,
      times?: Array< string | null > | null,
      lastUpdated?: string | null,
      status?: string | null,
      max?: number | null,
      min?: number | null,
    } | null,
    sleep?:  {
      __typename: "SleepData",
      duration?: number | null,
      efficiency?: number | null,
      deepSleep?: number | null,
      lightSleep?: number | null,
      remSleep?: number | null,
      awakeTime?: number | null,
      lastUpdated?: string | null,
      status?: string | null,
      deep?: number | null,
    } | null,
    steps?:  {
      __typename: "StepsData",
      count?: number | null,
      goal?: number | null,
      lastUpdated?: string | null,
    } | null,
    calories?:  {
      __typename: "CaloriesData",
      value?: number | null,
      goal?: number | null,
      lastUpdated?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};
