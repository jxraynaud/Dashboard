/**
   * Map raw object to add, for each dimension that has a data_name_column_name in config, a new key found in
   * the config at data_name_column_name, with as value the verbose name found in the mapping object filtersDimensionMapping
   * @method mapDataNames
   * @param  {[type]}     dataRow    One row of data with only ids but no names
   * @param  {[type]}     filtersDimensionMapping Object with a key per dimension,
   * each containing an array of type dimElem[id]=dimElemName to associate the dimension elem's id to its name
   * Ex : Object {kpi_id: Array(37), partner_id: Array(163), advertiser_id: Array(149097), metacampaign_id: Array(96)}
   * Extract of an item :
   * advertiser_id:Array(149097)
        50427:"France"
        50624:"United Kingdom"
        50625:"Global"
        50626:"Germany"
        ...
   * @param  {[type]}     config                  standard config object
   * @return {[type]} the inputed row of data with everything that came in the parameter dataRow,
   * plus a new key (found with getNameColumnLabelFromIdColumnLabel) containing the corresponding human readable name.
   */
  export function oneRowMapDataNames(dataRow,filtersDimensionMapping,config){
      //Define list of keys in dataRow (list of all data : dimensions, metrics, ...) to use to check if mapping key is present in data
      let dataRowKeys = Object.keys(dataRow);
      for(let dimensionIdColumnLabel in filtersDimensionMapping){
          //Check if dimension is present by it's id in the data (to avoid dimension_name : undefined if dimension was skipped by groupby)
          if(dataRowKeys.indexOf(dimensionIdColumnLabel) != -1){
              //Test : data_name_column_name that are set to "false" are not mapped.
              let dimensionNameColumnLabel = getNameColumnLabelFromIdColumnLabel(dimensionIdColumnLabel,config);
              if(dimensionNameColumnLabel){
                  //ID found in dataRow with as key the label of the Id column
                  let dimensionElemId = dataRow[dimensionIdColumnLabel];
                  //Name of the element from the mappgin array
                  let dimensionElemName = filtersDimensionMapping[dimensionIdColumnLabel][dimensionElemId];
                  //Insert the correct nam at the correct key
                  dataRow[dimensionNameColumnLabel]=dimensionElemName;
              }
          }
      }
      return dataRow;
  }

  /**
   * Returns the "name" column label found in the config at available_dimensions.data_name_column_name,
   * from the "id" column label found in the same config at available_dimensions.data_id_column_name
   * @method getNameColumnLabelFromIdColumnLabel
   * @param  {string}                            dimensionIdColumLabel label of the id column (Ex : partner_id)
   * @param  {configObject}                            config                standard config object
   * @return {string}             Label of the Name column for the item.
   */
  function getNameColumnLabelFromIdColumnLabel(dimensionIdColumLabel,config){
      //Get dimension details for name column identifier
      let dimensionDetails = config["available_dimensions"].filter((dim)=>{
          return dim.data_id_column_name == dimensionIdColumLabel;
      });
      //Find first and only element of filter returned array
      dimensionDetails = dimensionDetails[0];

      return dimensionDetails.data_name_column_name;
  }
