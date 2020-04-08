import { LightningElement, api, wire , track} from 'lwc';
import checkIfReservesExceedLayers from '@salesforce/apex/ShowClaimsNotificationsController.checkIfReservesExceedLayers';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const FIELDS = [
    'Claim__c.Denied_Date__c',
    'Claim__c.Denied_Reason__c'
];

export default class ShowClaimNotifications extends LightningElement {
    @api recordId;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredClaims({ error, data }) {
        if (data) {
           var claim = data;
           if(deniedDate!=null && deniedReason == null){

                /*const evt = new ShowToastEvent({
                    title: 'Please enter a Denied Reason',
                    message: 'You have not entered a denied reason',
                    variant: 'warning',
                });
                this.dispatchEvent(evt);*/
           }
        } else if (error) {
            //this.error = error;
            this.data = undefined;
        }
    }

    // wire to call apex method to get the facilities & city to be displayed on the filter panel based on the type/tab selected for MHS/SUD
    @wire(checkIfReservesExceedLayers , { claimId: '$recordId'})
    wiredReserves({ error, data }) {
        if(data){
            console.log('********data',data);
            const evt = new ShowToastEvent({
                title: 'Reserves exceeded',
                message: 'Reserves exceed the Memorandum Period Layers',
                variant: 'warning',
            });
            this.dispatchEvent(evt);
        }else if(error){
            window.console.log(error);
        }
    }
}