export interface AiFeatureState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  empty?: boolean;
}
