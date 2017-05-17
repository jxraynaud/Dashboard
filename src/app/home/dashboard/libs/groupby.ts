import { oneRowMapDataNames } from './mapDataNames';

import {debugLog, debugLogGroup} from '../../../utils';

const DEBUG: boolean = false;

export function groupBy(
    rawData,
    groupByCriterias:Array<string>,
    columnsToSum:Array<string>,
    computedMetricsFunc,
    filtersDimensionMapping,
    config
    ){
    // We test if there's at least one row of data.
    if(rawData && rawData.length > 0){
        // first step we reduce the data
        let mapped_reduced_data = rawData.map(dataElem => {
            let key = "";
            groupByCriterias.forEach((groupByElem) => {
                key += dataElem[groupByElem]+"__";
            })
            let object = {
                'key' : key,
            }
            columnsToSum.forEach((columnToSumElem) => {
                object[columnToSumElem] = dataElem[columnToSumElem];
            })
            return object
        }).reduce((acc, elem, index, array) => {
            if(!acc[elem.key]){
                // that's the first time we see this key, so we create an object.
                acc[elem.key] = {};
                columnsToSum.forEach((columnToSumElem) => {
                    acc[elem.key][columnToSumElem] = elem[columnToSumElem];
                })
            }else{
                // this key exists, we add the metrics values
                columnsToSum.forEach((columnToSumElem)=> {
                    acc[elem.key][columnToSumElem] += elem[columnToSumElem];
                })
            }
            return acc;
        }, [])
        // Now we have an assiociative array, we must transform it into a real array
        // and we must "explode" the key into the proper columns
        let aggregated_and_filtered_data = [];
        for(var row in mapped_reduced_data) {
            // retrieve the key id by splitting the key
            let groupBy_col_value = row.split("__")
            groupByCriterias.map((col_name, index) => {
                mapped_reduced_data[row][col_name] = groupBy_col_value[index];
            })
            // TODO : add the column dimensions names
            //Data mapped with their name column : for each element and each column fin name if present in config
            let namedFilteredRow;

            /*debugLogGroup(DEBUG,["GroupBy : Mapping rawData to add names [dataRow,filtersDimensionMapping, config]",
                      filteredData,
                      filtersDimensionMapping,
                      config
                  ]);*/
            namedFilteredRow = oneRowMapDataNames(mapped_reduced_data[row],filtersDimensionMapping,config);
            aggregated_and_filtered_data.push(namedFilteredRow)
            // TODO : apply the computedMetricsFunc
            // mapped_reduced_data[row] = computedMetricsFunc(mapped_reduced_data[row])
            // push into the aggregated_and_filtered_data array of objects
            //aggregated_and_filtered_data.push(mapped_reduced_data[row])
        }
        debugLogGroup(DEBUG,["Mapped data",
        mapped_reduced_data,
        "Aggregated data",
        aggregated_and_filtered_data]);
        //return [rawData[0]];
        return aggregated_and_filtered_data;
    }else{
        return [];
    }
}
