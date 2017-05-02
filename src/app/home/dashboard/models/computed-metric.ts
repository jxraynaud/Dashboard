import { DataCol } from './data-col'

export class ComputedMetric extends DataCol {
    isAdditive : boolean;
    computeFunction : Function;
}
