import { LightningElement, wire, track, api } from 'lwc';
import getReserveDetails from '@salesforce/apex/ReservesTableController.getReserveDetails';
import updateReserves from '@salesforce/apex/ReservesTableController.updateReserves';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FIRSTNAME_FIELD from '@salesforce/schema/Contact.FirstName';
import LASTNAME_FIELD from '@salesforce/schema/Contact.LastName';
import ID_FIELD from '@salesforce/schema/Contact.Id';



/*const COLS = [
    { label: 'Category', fieldName: 'Category__c', editable: false },
    { label: 'Paid', fieldName: 'Paid__c', type: 'currency' , editable: true ,cellAttributes: { alignment: 'left' }},
    { label: 'Outstanding', fieldName: 'Outstanding__c' , type: 'currency', editable: true ,cellAttributes: { alignment: 'left' }},
    { label: 'Incurred', fieldName: 'Incurred1__c' , type: 'currency', editable: true ,cellAttributes: { alignment: 'left' }},
    { label: 'Notes', fieldName: 'Comments__c' , type: 'textarea', editable: true ,cellAttributes: { alignment: 'left' }}
];*/
export default class ReservesTable extends LightningElement {
    @api recordId;
    @track error;
    //@track columns = COLS;
    //@track draftValues = [];
    @track reserves = [];
    @track newReserves = [];
    @track totalReserves = new Object();
    //wiredResults;


    @wire(getReserveDetails , { claimId: '$recordId'})
    wiredReserves({ error, data }) {
        this.wiredResults = data;
        if (data) {
            this.reserves = data;
            console.log('*****this.data**',data);
            let totalPaid = 0;
            let totalOutstanding = 0;
            let totalIncurred = 0;
            for(let i=0;i<data.length;i++){
                if(data[i].incurredAmount != null){
                    if(!isNaN(data[i].paidAmount)){
                        totalPaid = totalPaid + data[i].paidAmount;
                    }
                    if(!isNaN(data[i].outstandingAmount)){
                        totalOutstanding = totalOutstanding + data[i].outstandingAmount;
                    }
                    if(!isNaN(data[i].incurredAmount)){
                        totalIncurred = totalIncurred + data[i].incurredAmount;
                    }
                }
            }
            this.totalReserves.categoryName = 'Total';
            this.totalReserves.paidAmount = totalPaid;
            this.totalReserves.outstandingAmount = totalOutstanding;
            this.totalReserves.incurredAmount = totalIncurred;
            this.reserves = this.reserves.sort((a, b) => (a.categoryName > b.categoryName) ? 1 : -1);
        } else if (error) {
            //this.error = error;
            this.data = undefined;
        }
    }

    handleIncurredChange(event){
        var changedIncurred = event.target.value;
        var changedCategory = event.target.dataset.category;
        var parentCategory = event.target.dataset.parentCategory;
        var tempList = [];

        if(changedIncurred>100000){
            this.showToast();
        }else{
            for(let i=0;i<this.reserves.length;i++){
                var currentRecord = Object.assign({}, this.reserves[i]);
                if(currentRecord.categoryName === changedCategory){
                    let oldIncurred = currentRecord.incurredAmount;
                    let deltaValue = changedIncurred - oldIncurred;
                    currentRecord.incurredAmount = changedIncurred;
                    currentRecord.outstandingAmount = currentRecord.outstandingAmount + deltaValue;
                    this.totalReserves.incurredAmount = this.totalReserves.incurredAmount + deltaValue;
                    this.totalReserves.outstandingAmount = this.totalReserves.outstandingAmount + deltaValue;

                }else if(currentRecord.categoryName === parentCategory){
                    //console.log('*****parentCategory**',parentCategory);
                    var tempChildList = [];
                    for(let j=0;j<currentRecord.childWrappers.length;j++){
                        var childRecord = Object.assign({}, currentRecord.childWrappers[j]);
                        if(childRecord.categoryName === changedCategory){
                            let oldIncurred = childRecord.incurredAmount;
                            let deltaValue = changedIncurred - oldIncurred;
                            childRecord.incurredAmount = changedIncurred;
                            childRecord.outstandingAmount = childRecord.outstandingAmount + deltaValue;
                            currentRecord.incurredAmount = currentRecord.incurredAmount + deltaValue;
                            currentRecord.outstandingAmount = currentRecord.outstandingAmount + deltaValue;
                            this.totalReserves.incurredAmount = this.totalReserves.incurredAmount + deltaValue;
                            this.totalReserves.outstandingAmount = this.totalReserves.outstandingAmount + deltaValue;
                        }
                        tempChildList = [...tempChildList ,childRecord];
                    }
                    currentRecord.childWrappers = tempChildList;
                }
                tempList = [...tempList ,currentRecord];
            }
            this.reserves=tempList;
        }

    }

    handleCommentChange(event){
        //console.log('*****event**1***',event.data.category);event.target.dataset.targetId
        var changedComments = event.target.value;
        var changedCategory = event.target.dataset.category;
        var parentCategory = event.target.dataset.parentCategory;
        var tempList = [];

        console.log('****parentCategory***',parentCategory);

        for(let i=0;i<this.reserves.length;i++){
            var currentRecord = Object.assign({}, this.reserves[i]);
            console.log('****changedCategory**',changedCategory);
            console.log('****currentRecord.categoryName**',currentRecord.categoryName);
            if(currentRecord.categoryName === changedCategory){
                currentRecord.comments = changedComments;
            }else if(currentRecord.categoryName === parentCategory){
                var tempChildList = [];
                for(let j=0;j<currentRecord.childWrappers.length;j++){
                    var childRecord = Object.assign({}, currentRecord.childWrappers[j]);
                    if(childRecord.categoryName === changedCategory){
                        childRecord.comments = changedComments;
                    }
                    tempChildList = [...tempChildList ,childRecord];
                }
                currentRecord.childWrappers = tempChildList;
            }
            tempList = [...tempList ,currentRecord];
        }
        this.reserves=tempList;
    }

    handleSave(event) {
        console.log('****this.reserves**',this.reserves);
        updateReserves({  claimId: this.recordId, reserveWrappers: this.reserves})
        .then(result => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Reserves updated',
                    variant: 'success'
                })
            );
        })
        .catch(error => {
            window.console.log(error);
        });



    }

    showToast() {
            const event = new ShowToastEvent({
                title: 'Reserve Limit exceeded',
                message: 'The reserve limit on your profile is 100000 and has been exceeded. Please try with a smaller amount',
                variant: 'error'
            });
            this.dispatchEvent(event);
    }
}