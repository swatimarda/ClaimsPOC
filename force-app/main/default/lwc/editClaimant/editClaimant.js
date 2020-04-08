import { LightningElement, api } from 'lwc';
export default class EditClaimant extends LightningElement {
    @api recordId;
    @api objectApiName;
}