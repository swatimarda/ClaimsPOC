public with sharing class CreateClaimController {

    @AuraEnabled(cacheable = true)
    public static List<Account> searchMembers(){
        List<Account> members = [Select Id,Name From Account where RecordType.DeveloperName ='Member'];
        return members;
    }
    @AuraEnabled
    public static String saveClaim(String contactFirstName,
                                 String contactMiddleName,
                                 String contactLastName,
                                 String dateOfBirth,
                                 String dateOfInjury,
                                 String selectedMember,
                                 String selectedPrograms) {

        system.debug('-----contactFirstName-------'+contactFirstName);
        system.debug('-----contactFirstName-------'+contactMiddleName);
        system.debug('-----contactFirstName-------'+contactLastName);
        system.debug('-----contactFirstName-------'+dateOfBirth);
        system.debug('-----contactFirstName-------'+dateOfInjury);
        system.debug('-----contactFirstName-------'+selectedMember);

        Contact con = new Contact();
        con.FirstName = contactFirstName;
        //con.MiddleName = contactMiddleName;
        con.LastName = contactLastName;
        //con.Date_of_Birth__c = Date.valueOf(dateOfBirth);
        insert con;

        Claim__c newClaim = new Claim__c();
        newClaim.Claimant_Name__c = con.Id;
        newClaim.Date_of_Injury__c = Date.valueOf(dateOfInjury);
        newClaim.Organization_Structure__c = selectedMember;
        insert newClaim;

        List<ProgramWrapper> programWrappers =   (List<ProgramWrapper>)System.JSON.deserialize(selectedPrograms, List<ProgramWrapper>.class);
        List<Claim_Programs__c> claimPrograms = new  List<Claim_Programs__c>();

        for(ProgramWrapper pw : programWrappers){
            Claim_Programs__c claimProgram = new Claim_Programs__c();
            claimProgram.Claim__c = newClaim.Id;
            claimProgram.Program__c = pw.recId;
            claimPrograms.add(claimProgram);
        }
        if(!claimPrograms.isEmpty()){
            insert claimPrograms;
        }
        return newClaim.Id;
    }

    public Class ProgramWrapper{
        public String recName;
        public String recId;
    }
}
