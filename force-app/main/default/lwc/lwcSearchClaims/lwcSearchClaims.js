import { LightningElement, wire, track, api  } from 'lwc';
import CLAIM_OBJECT from '@salesforce/schema/Claim__c';
import searchClaims from '@salesforce/apex/SearchController.searchClaims';
import findClaims from '@salesforce/apex/SearchController.findClaims';

const columns = [
    {
        label: 'Claim Number',
        fieldName: 'Id',
        type: 'url',
        typeAttributes: {
            label: {
                fieldName: 'ClaimNumber'
            },
            target: '_self'
        }
    },
    {
        label: 'Name',
        fieldName: 'Name',
        type: 'text'
    },
    {
        label: 'Claimant Name',
        fieldName: 'ClaimantName',
        type: 'text'
    },
    {
        label: 'Member/Organization',
        fieldName: 'Member',
        type: 'text'
    },
    {
        label: 'Date Of Injury',
        fieldName: 'DateOfInjury',
        type: 'date-local'
    },
    {
        label: 'Body Parts',
        fieldName: 'BodyParts',
        type: 'text'
    },
    {
        label: 'Managing TPA',
        fieldName: 'ManagingTPA',
        type: 'text'
    },
];


export default class LwcSearchClaims extends LightningElement {
    @api recordId = '';
    @track isAccountRecord =  false;
    @track isResultFound = false;
    @track isLoaded = true;
    @track data = [];
    @track items = [];
    @track claims;
    @track error;
    @track columns = columns;



    claimant    = '';
    account     = '';
    claimNumber = '';
    dateOfInjury= '';
    tpa         = '';
    bodyPart    = '';

    handleChange(event) {
        if (event.target.label === 'Claimant Name') {
            this.claimant = event.target.value;
        }
        if (event.target.label === 'Member Name') {
            this.account = event.target.value;
        }
        if (event.target.label === 'Organizations') {
            this.account = event.target.value;
        }
        if (event.target.label === 'Claim Number') {
            this.claimNumber = event.target.value;
        }
        if (event.target.label === 'Date Of Injury') {
            this.dateOfInjury = event.target.value;
        }
        if (event.target.label === 'Body Part') {
            this.bodyPart = event.target.value;
        }
        if (event.target.label === 'Managing TPA') {
            this.tpa = event.target.value;
        }

    }

    handleSearch(event){
        var inp=this.template.querySelectorAll("lightning-input");
        inp.forEach(function(element){
            if(element.name=="input1"){
                this.claimant=element.value;
            }
            else if(element.name=="input2"){
                this.account=element.value;
            }
            else if(element.name=="input3"){
                this.claimNumber=element.value;
            }
            else if(element.name=="input4"){
                this.dateOfInjury = element.value;
            }
            else if(element.name=="input5"){
                this.bodyPart = element.value;;
            }
            else if(element.name=="input6"){
                this.tpa = element.value;;
            }
            else if(element.name=="input7"){
                this.account = element.value;;
            }
        },this);

    }



    @wire(findClaims, { recordId : '$recordId',claimant: '$claimant' ,account : '$account', claimNumber: '$claimNumber',
                          dateOfInjury: '$dateOfInjury',tpa: '$tpa',bodyPart: '$bodyPart'})
                          responseData({data, error}){
                            if(data){
                                //this.claims = data;
                                if(this.recordId){
                                    this.isAccountRecord = true;
                                }
                                this.populateData(data);
                                this.error = undefined;
                            }else if (error) {
                                this.error  = error;
                                this.claims = undefined;
                                this.data   = undefined;
                            }
                          };


    applyFilters(){
        this.isLoaded = true;

        var inp=this.template.querySelectorAll("lightning-input");
        inp.forEach(function(element){
            if(element.name=="input1"){
                this.claimant=element.value;
            }
            else if(element.name=="input2"){
                this.account=element.value;
            }
            else if(element.name=="input3"){
                this.claimNumber=element.value;
            }
            else if(element.name=="input4"){
                this.dateOfInjury = element.value;
            }
            else if(element.name=="input5"){
                this.bodyPart = element.value;;
            }
            else if(element.name=="input6"){
                this.tpa = element.value;;
            }
        },this);

        searchClaims({claimant:this.claimant,account:this.account,claimNumber:this.claimNumber,
            dateOfInjury:this.dateOfInjury,tpa:this.tpa,bodyPart:this.bodyPart
        })
        .then(result => {
            this.populateData(result);
            this.isLoaded = false;
        })
        .catch(error => {
        });
    }

    populateData(data){
        if(data.length>0){
            this.isResultFound = true;

        }else{
            this.isResultFound = false;
        }
        data = data.map(
            record => Object.assign(
                { "Id":  record.id  },
                { "Name": record.name },
                { "ClaimantName": record.claimant },
                { "Member": record.account },
                { "ClaimNumber": record.claimNumber },
                { "DateOfInjury": record.dateOfInjury },
                { "BodyParts": record.bodyPart },
                { "ManagingTPA": record.managingTPA },

                record
            )
        );
        this.items = data;
        this.claims= data;
    }

}