import { LightningElement, track, wire } from 'lwc';
import saveClaim from '@salesforce/apex/CreateClaimController.saveClaim';
import searchMembers from '@salesforce/apex/CreateClaimController.searchMembers';
import { NavigationMixin } from 'lightning/navigation';

export default class CreateClaimController extends NavigationMixin(LightningElement) {
    @track contactFirstName;
    @track contactMiddleName;
    @track contactLastName;
    @track dateOfBirth;
    @track dateOfInjury;
    @track selectedMember;
    @track selectedPrograms = [];
    @track selectRecordName;
    @track selectRecordId;
    @track selectProgramRecordName;
    @track selectProgramRecordId;

    // wire to call apex to search the data (clinician assignments)
    @wire(searchMembers)
    wiredAccounts({ error, data }) {
        if (data) {
            if(data.length == 1){
                console.log('data----',data[0].Name);
                this.selectRecordName = data[0].Name;
                this.selectRecordId = data[0].Id;
            }
        } else if (error) {
            //this.error = error;
            this.data = undefined;
        }
    }


    contactFirstNameChange(event){
        this.contactFirstName= event.target.value;
    }

    contactMiddleNameChange(event){
        this.contactMiddleName= event.target.value;
    }

    contactLastNameChange(event){
        this.contactLastName= event.target.value;
    }

    dateOfBirthChange(event){
        this.dateOfBirth= event.target.value;
    }

    dateOfInjuryChange(event){
        this.dateOfInjury= event.target.value;
    }

    contactLastNameChange(event){
        this.contactLastName= event.target.value;
    }

    handleEventResults(event) {
        var currentRecId = event.detail.currentRecId;
        this.selectedMember = currentRecId;
    }

    handleProgramResults(event) {
        var selRecords = event.detail.selRecords;
        this.selectedPrograms= selRecords;
    }



    handleSave(evt) {


        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputCmp) => {
                        inputCmp.reportValidity();
                        return validSoFar && inputCmp.checkValidity();
            }, true);
        if (allValid) {

            console.log('this.selectedPrograms: ' ,this.selectedPrograms[0]);
            let programJSON = JSON.stringify(this.selectedPrograms);
            saveClaim({
                contactFirstName: this.contactFirstName,
                contactMiddleName : this.contactMiddleName,
                contactLastName : this.contactLastName,
                dateOfBirth : this.dateOfBirth,
                dateOfInjury : this.dateOfInjury,
                selectedMember : this.selectedMember,
                selectedPrograms : programJSON
                                })
                .then(result => {
                    this[NavigationMixin.Navigate]({
                            type: 'standard__recordPage',
                            attributes: {
                                recordId: result,
                                objectApiName: 'Claim__c', // objectApiName is optional
                                actionName: 'edit'
                            }
                        });
                    })
                .catch(error => {
                    window.console.log(error);
                });
        } else {
            //alert('Please update the invalid form entries and try again.');
        }
    }

    /*@wire(getPrograms , { selectedMember: '$selectedMember'})
    wiredPrograms({ error, data }) {
        var temp =[];
        if(data){
            this.facilities = [...this.facilities ,{value: '' , label: '-None-' }];
            for(let i=0;i<data.length;i++){
                this.facilities = [...this.facilities ,{value: data[i].Name , label: data[i].Name} ];
            }

            this.cities = [...this.cities ,{value: '' , label: '-None-' }];
            for(let i=0;i<data.length;i++){
                if(temp.indexOf(data[i].BillingCity) === -1 && data[i].BillingCity){
                    temp.push(data[i].BillingCity);
                }
            }
            temp.sort();
            for(let i=0;i<temp.length;i++){
                this.cities = [...this.cities ,{value: temp[i] , label: temp[i]} ];
            }
        }else if(error){
            window.console.log(error);
        }
    }*/


}