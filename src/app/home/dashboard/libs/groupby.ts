import { oneRowMapDataNames } from './mapDataNames';

import {debugLog, debugLogGroup} from '../../../utils';

const DEBUG : boolean = false;

export function groupBy(
    rawData,
    groupByCriterias:Array<string>,
    columnsToSum:Array<string>,
    computedMetricsFunc,
    activeCalculatedMetrics,
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

        let activeCalculatedDataConfig = [];
        if(config['available_calculated_metrics']){
            activeCalculatedDataConfig = config['available_calculated_metrics'].filter((e)=>{
                return activeCalculatedMetrics.indexOf(e.column_name) != -1
            })
        }

        if(typeof activeCalculatedDataConfig != "undefined" && activeCalculatedDataConfig.length > 0){
            aggregated_and_filtered_data = addCalculatedColumnsToData(aggregated_and_filtered_data,activeCalculatedDataConfig);
        }
        //return [rawData[0]];
        return aggregated_and_filtered_data;
    }else{
        return [];
    }
}

/**
 *    To add a calculated metric :
 *    1-Add to view.config.json in view
 *    2-Add name to activeCalculatedMetrics in view
 *    3-Create ad hoc function here in groupby file + insert function name in "function_name"
 *    4-Create ad hoc function in view-base.component.ts + add to switch statemeent (or use base function if standard 1-column metric)
 */
function addCalculatedColumnsToData(data,activeCalculatedDataConfig){
    debugLogGroup(DEBUG,["Group by : Processing calculated metrics based on list : ",activeCalculatedDataConfig,]);
    data.map(dataElem=>{
        activeCalculatedDataConfig.map((calculatedCol,index)=>{
            console.log("Calculating "+calculatedCol.column_name+"with "+calculatedCol.function_name+" on ");
            //console.log(calculatedCol.function_name);
            //
            switch (calculatedCol.function_name) {
                  case "percent_certified": dataElem = calculatedMetric_percentCertified(dataElem,calculatedCol.column_name); break;
                  case "multi_attrib_comparison" : dataElem = calculatedMetric_attributionModelsComparison(dataElem,calculatedCol.column_name); break;
                  //case "functionY": functionY(); break;
                  default : console.error("GroupBy : calculated metric '"+calculatedCol.column_name+"' not declared in groupBy.ts 's switch statement and can't be processed. Please declare.");
              }
              //console.log(dataElem);
        });
        return dataElem;
    });
    debugLogGroup(DEBUG,["Data service : Data after processing calcualted metrics : ",data]);
    return data;
}

function calculatedMetric_percentCertified(dataElem,columnName){
    dataElem[columnName] =((dataElem["certified_conversions"] / dataElem["conversions"]) * 100).toFixed(2)
    return dataElem;
}

function calculatedMetric_attributionModelsComparison(dataElem,columnName){
    if(dataElem){
        let conversionsCols = [];

        //Create ordered list of columns depending on *ordernumber* in dataKey
        Object.keys(dataElem).map((dataKey) => {
            //If column name starts with "conversions "
            if(dataKey.split(" ")[0]=="conversions"){
                let colOrder = dataKey.split("*")[1];
                conversionsCols[colOrder]=dataKey;
            }
        });

        let firstConvCol = conversionsCols[0];
        //Every conversion col to be compared to first col
        let conversionsColsWithoutFirst = conversionsCols.slice(1);

        //Calculate percent for each and insert into dataElem
        conversionsColsWithoutFirst.map(col=>{
            let delta = dataElem[col] - dataElem[firstConvCol];
            let percent;
            if(dataElem[firstConvCol] != 0){
                percent = ((delta / dataElem[firstConvCol])*100).toFixed(2)
            }else{
                percent = "--"
            }
            dataElem[col+"__"+firstConvCol]=percent+"%";
        });
    }
    return dataElem;
}
