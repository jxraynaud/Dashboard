import { Component, OnInit } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { DataService } from '../services/data.service'
import { DataFiltersService } from '../services/data-filters.service'
import { ConfigService } from '../services/config.service';

import {debugLog, debugWarn, debugLogGroup} from '../../../utils';

import viewConfig from './view.config.json';

@Component({
  selector: 'app-multi-attribution',
  templateUrl: './multi-attribution.component.html',
  styleUrls: ['./multi-attribution.component.css']
})
export class MultiAttributionComponent implements OnInit {
    DEBUG : boolean = true;

    activeDimensions : string[] = ['advertiser_id','partner_id','kpi_id','metacampaign_id','bbb'];
    activeDimensionWithIdColumns : Array<{}>;
    activeDimensionsWithoutIdColumns : Array<{}>;

    activeMetrics : string[] = ['conversion_date','conversions Default 7.5/7.5','conversions Sizmek 30/15'];
    activeMetricColumns : Array<{}>;

    filteredData : Array<{}>;

    //TODO : destroy subscription at the end
    filteredDataBehaviorSubjectSubscription : Subscription;
    configBehaviorSubjectSubscription : Subscription;

    constructor(
        private configService : ConfigService,
        private dataService : DataService,
        private dataFiltersService : DataFiltersService) {
            this.configService.setConfigFile(viewConfig);

            this.filteredDataBehaviorSubjectSubscription = this.dataService.filteredDataBehaviorSubject.subscribe({
                next : (filteredData) => {
                    if(filteredData.length > 0){
                        debugLogGroup(this.DEBUG,["Overview Component : this.dataService.filteredDataBehaviorSubject subscription triggered with value [filteredData] :",
                            "Injected in filteredData attribute",
                            filteredData]);
                        this.filteredData = filteredData;
                    }else{
                        debugWarn(this.DEBUG,"Overview Component : this.dataService.filteredDataBehaviorSubject subscription triggered. filteredData empty, not doing anything.");
                    }
                },
                error : (err) => console.error(err),
            });

            this.configBehaviorSubjectSubscription = this.configService.configBehaviorSubject.subscribe({
                next : (configData) => {
                    debugLogGroup(this.DEBUG,["Overview Component : this.configService.configBehaviorSubject subscription triggered with value [config] for generating list of columns in datatable :",
                        configData,
                        "List of active columns : ",
                        this.activeDimensions
                    ]);
                    this.activeDimensionWithIdColumns = this.generateDimensionColumnsListsObject(configData['available_dimensions'], this.activeDimensions).withIdColumns;
                    this.activeDimensionsWithoutIdColumns = this.generateDimensionColumnsListsObject(configData['available_dimensions'], this.activeDimensions).withoutIdColumns;
                },
                error : (err) => console.error(err),
            });
    }

    ngOnInit() {
    }

    /**
     * Generates 2 things : list of columns with id columns and list of columns withour id columns
     * @method generateDimensionColumnsListsObject
     * @param  {[type]}                            availableDimensions [description]
     * @return {{withIdColumns:[],withoutIdColumns:[]}}     Object containing both with id and withoutIds columns
     */
    private generateDimensionColumnsListsObject(availableDimensions,activeDimensions){
        //Creating empty arrays for column list
        let activeWithIdDimensionColumnsTemp = [];
        let activeWithoutIdDimensionColumnsTemp = [];

        activeDimensions.map((dimensionName)=>{
            let singleActiveDimension = availableDimensions.filter((e)=>{ return e.data_id_column_name == dimensionName});

            if(singleActiveDimension.length==0){
                //Error catch : if an unavailable dimension was listed, skip it.
                console.error('"'+dimensionName+'" is not an available dimension. Dimension ignored. See list of available dimensions : ',[availableDimensions[0]]);
            }else{
                //Filter first and only element returned by filter
                singleActiveDimension = singleActiveDimension[0];
                //Create id column
                let singleActiveDimensionIdColumn = {
                    name : singleActiveDimension.data_id_column_name,
                    label : singleActiveDimension.id_label,
                    numeric : true
                };
                //Puushing element in temporary column list
                activeWithIdDimensionColumnsTemp.push(singleActiveDimensionIdColumn);

                //Create name column if indicated in config file
                if(singleActiveDimension.data_name_column_name){
                    let singleActiveDimensionNameColumn = {
                        name : singleActiveDimension.data_name_column_name,
                        label : singleActiveDimension.label,
                        numeric : singleActiveDimension.is_numeric
                    };
                    activeWithIdDimensionColumnsTemp.push(singleActiveDimensionNameColumn);
                    activeWithoutIdDimensionColumnsTemp.push(singleActiveDimensionNameColumn);
                }else{
                    debugWarn(this.DEBUG,"OverviewComponent : "+singleActiveDimension.data_id_column_name+" has no indicated human readable column in config file. Skipping name column.")
                }
            }
        });
        debugLogGroup(this.DEBUG,[
            "Overview component : Calculated list of columns depending on list of active columns and list of available columns, returning both with and without id columns [ withIdColumns,withoutIdColumns ]:",
            activeWithIdDimensionColumnsTemp,
            activeWithoutIdDimensionColumnsTemp
        ]);
        return {withIdColumns:activeWithIdDimensionColumnsTemp, withoutIdColumns:activeWithoutIdDimensionColumnsTemp};
    }

}
