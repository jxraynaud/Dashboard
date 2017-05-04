import { Component, OnInit } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { DataService } from '../../services/data.service';
import { ConfigService } from '../../services/config.service';

import {debugLog, debugWarn, debugLogGroup} from '../../../../utils';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
    DEBUG : boolean = true;

    activeDimensions : string[] = ['advertiser_id','partner_id','kpi_id','bbb'];
    activeDimensionColumns : Array<{}>;

    activeMetrics : string[] = ['conversion_date','conversions Default 7.5/7.5','conversions Sizmek 30/15'];
    activeMetricColumns : Array<{}>;

    filteredData : Array<{}>;

    //TODO : destroy subscription at the end
    filteredDataBehaviorSubjectSubscription : Subscription;
    configBehaviorSubjectSubsciption : Subscription;

    constructor(
        private dataService : DataService,
        private configService : ConfigService,
    ) {
    }

    ngOnInit() {
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

        this.configBehaviorSubjectSubsciption = this.configService.configBehaviorSubject.subscribe({
            next : (configData) => {
                debugLogGroup(this.DEBUG,["Overview Component : this.configService.configBehaviorSubject subscription triggered with value [config] for generating list of columns in datatable :",
                    configData,
                    "List of active columns : ",
                    this.activeDimensions
                ]);
                this.activeDimensionColumns = this.generateDimensionColumnsList(configData['available_dimensions']);
            },
            error : (err) => console.error(err),
        });
        //console.log(this.configService);

        /*this.availableColumnsDetailsBehaviorSubjectSubscription = this.dataService.availableColumnsDetailsBehaviorSubject.subscribe({
            next : (availableColumns) => {
                debugLogGroup(this.DEBUG,["Overview Component : this.dataService.availableColumnsDetailsBehaviorSubject subscription triggered with value [availableColumns] :",
                    availableColumns,
                    "Calculating active dimensions details and building columns info for DataTable"
                ]);
                let activeDimensionsColumns = [];
                for( let colIndex in availableColumns ){
                    if( this.activeDimensions.indexOf(colIndex) != -1 ){
                        console.log(colIndex);
                        console.log(availableColumns[colIndex]);
                    }
                }
            },
            error : (err) => console.error(err),
        });*/
    }

    private generateDimensionColumnsList(availableDimensions){
        let activeDimensionColumnsTemp = [];
        this.activeDimensions.map((dimensionName)=>{
            let singleActiveDimension = availableDimensions.filter((e)=>{ return e.data_id_column_name == dimensionName});
            if(singleActiveDimension.length==0){
                //Error catch : if an unavailable dimension was listed, skip it.
                console.error('"'+dimensionName+'" is not an available dimension. Dimension ignored. See list of available dimensions : ',[availableDimensions[0]]);
            }else{
                let singleActiveDimensionColumn = {
                    name : singleActiveDimension[0].data_id_column_name,
                    label : singleActiveDimension[0].label,
                    numeric : singleActiveDimension[0].is_numeric
                };
                activeDimensionColumnsTemp.push(singleActiveDimensionColumn);
            }
        });
        debugLogGroup(this.DEBUG,[
            "Overview component : Calculated list of columns depending on list of active columns and list of available columns :",
            activeDimensionColumnsTemp
        ]);
        return activeDimensionColumnsTemp;
    }



}
