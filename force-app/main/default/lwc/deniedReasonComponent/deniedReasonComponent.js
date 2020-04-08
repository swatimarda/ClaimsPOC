import { LightningElement, api, wire , track} from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const FIELDS = [
    'Claim__c.Denied_Date__c',
    'Claim__c.Denied_Reason__c'
];

export default class DeniedReasonComponent extends LightningElement {
    @api recordId;
    @track showWarning = false;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredClaims({ error, data }) {
        if (data) {
           var claim = data;
           var deniedDate = ('********claim',claim.fields.Denied_Date__c.value);
           var deniedReason = ('********claim',claim.fields.Denied_Reason__c.value);
           if(deniedDate!=null && deniedReason == null){

                const evt = new ShowToastEvent({
                    title: 'Please enter a Denied Reason',
                    message: 'You have not entered a denied reason',
                    variant: 'warning',
                });
                this.dispatchEvent(evt);
           }
        } else if (error) {
            //this.error = error;
            this.data = undefined;
        }
    }
}