export declare enum ResourceProcessingStateType {
  Pending = 'pending',
  Started = 'started',
  Failed = 'failed',
  Finished = 'finished'
}
export declare enum EventBusMessageType {
  ResourceProcessingMessage = 'ResourceProcessingMessage'
}
export type ResourceProcessingState =
  | {
      type: ResourceProcessingStateType.Pending
    }
  | {
      type: ResourceProcessingStateType.Started
    }
  | {
      type: ResourceProcessingStateType.Failed
      message: string
    }
  | {
      type: ResourceProcessingStateType.Finished
    }
export type EventBusMessage = {
  type: EventBusMessageType.ResourceProcessingMessage
  resource_id: string
  status: ResourceProcessingState
}
//# sourceMappingURL=eventBus.types.d.ts.map
