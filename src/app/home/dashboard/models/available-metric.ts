import { RawDataCol } from './raw-data-col'

export class AvailableDimension extends RawDataCol {
    objectDetailEndpointUrl : string;
    isAdditive : boolean;
    isUsableAsGroupBy : boolean;
}
