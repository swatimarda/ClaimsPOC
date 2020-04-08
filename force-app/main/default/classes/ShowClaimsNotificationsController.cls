public with sharing class ShowClaimsNotificationsController {

    @AuraEnabled(cacheable=true)
    public static Boolean checkIfReservesExceedLayers(String claimId) {
        Claim__c claim = [Select Id,Memorandum_Period__c,Total_Reserve_Amount__c from Claim__c WHERE Id=:claimId LIMIT 1];
        System.Debug('****Memorandum_Period__c*****'+claim.Memorandum_Period__c);
        List<Layers__c> layers = [Select Id,Upper_Limit__c from Layers__c WHERE Memorandum_Period__c =:claim.Memorandum_Period__c ORDER BY Upper_Limit__c LIMIT 1];
        if(!layers.isEmpty() && layers[0].Upper_Limit__c < claim.Total_Reserve_Amount__c){
            return true;
        }
        return false;
    }
}
