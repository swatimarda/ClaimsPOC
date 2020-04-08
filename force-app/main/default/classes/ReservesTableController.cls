public with sharing class ReservesTableController {

    @AuraEnabled(cacheable=true)
    public static List<ReserveWrapper> getReserveDetails(String claimId) {
        Map<String,Reserve__c> existingCategoriesMap = new Map<String,Reserve__c>();
        Set<String> categories = new Set<String>{'Expense', 'Indemnity','Medical'};
        Set<String> subCategories = new Set<String>{'TD', 'PD'};
        List<ReserveWrapper> reserveWrappers = new List<ReserveWrapper>();

        List<Reserve__c> reserves = [Select Id,
                                            Claim__c,
                                            Category__c,
                                            Sub_Category__c,
                                            Paid__c,
                                            Outstanding__c,
                                            Outstanding1__c,
                                            Incurred1__c
                                        from Reserve__c WHERE Claim__c=:claimId];

        for(Reserve__c reserve: reserves){
            if(!String.isBlank(reserve.Sub_Category__c)){
                if(existingCategoriesMap.containsKey(reserve.Category__c +'-'+reserve.Sub_Category__c)){
                    Reserve__c totalReserve = existingCategoriesMap.get(reserve.Category__c +'-'+reserve.Sub_Category__c);
                    totalReserve.Incurred1__c = totalReserve.Incurred1__c + reserve.Incurred1__c;
                    totalReserve.Outstanding1__c = totalReserve.Outstanding1__c + reserve.Outstanding__c;
                    totalReserve.Paid__c = totalReserve.Paid__c + reserve.Paid__c;
                }else{
                    existingCategoriesMap.put(reserve.Category__c +'-'+reserve.Sub_Category__c, reserve);
                }
            }else{
                if(existingCategoriesMap.containsKey(reserve.Category__c)){
                    Reserve__c totalReserve = existingCategoriesMap.get(reserve.Category__c);
                    totalReserve.Incurred1__c = totalReserve.Incurred1__c + reserve.Incurred1__c;
                    totalReserve.Outstanding1__c = totalReserve.Outstanding1__c + reserve.Outstanding__c;
                    totalReserve.Paid__c = totalReserve.Paid__c + reserve.Paid__c;
                }else{
                    existingCategoriesMap.put(reserve.Category__c, reserve);
                }

            }
        }

        System.debug('****existingCategoriesMap*****' + existingCategoriesMap);

        for(String cat:categories){
            ReserveWrapper rw = new ReserveWrapper();
            rw.categoryName = cat;
            if(cat == 'Indemnity'){
                rw.hasChild = true;
                Decimal totalPaidAmount = 0;
                Decimal totalOutstandingAmount = 0;
                Decimal totalIncurredAmount = 0;
                if(existingCategoriesMap.containsKey('Indemnity-PD')){
                    Reserve__c res = existingCategoriesMap.get('Indemnity-PD');
                    ReserveWrapper pdrw = new ReserveWrapper();
                    //pdrw.reserveId = res.Id;
                    pdrw.categoryName = 'PD';
                    pdrw.paidAmount = res.Paid__c;
                    pdrw.outstandingAmount = res.Outstanding1__c;
                    pdrw.incurredAmount = res.Incurred1__c;

                    totalPaidAmount = totalPaidAmount + res.Paid__c;
                    totalOutstandingAmount = totalOutstandingAmount + res.Outstanding1__c;
                    totalIncurredAmount = totalIncurredAmount + res.Incurred1__c;
                    rw.childWrappers.add(pdrw);

                }else{
                    ReserveWrapper pdrw = new ReserveWrapper();
                    pdrw.categoryName = 'PD';
                    pdrw.paidAmount = 0;
                    pdrw.outstandingAmount = 0;
                    pdrw.incurredAmount = 0;
                    rw.childWrappers.add(pdrw);
                }
                if(existingCategoriesMap.containsKey('Indemnity-TD')){
                    Reserve__c res = existingCategoriesMap.get('Indemnity-TD');
                    ReserveWrapper tdrw = new ReserveWrapper();
                    //tdrw.reserveId = res.Id;
                    tdrw.categoryName = 'TD';
                    tdrw.paidAmount = res.Paid__c;
                    tdrw.outstandingAmount = res.Outstanding1__c;
                    tdrw.incurredAmount = res.Incurred1__c;

                    totalPaidAmount = totalPaidAmount + res.Paid__c;
                    totalOutstandingAmount = totalOutstandingAmount + res.Outstanding1__c;
                    totalIncurredAmount = totalIncurredAmount + res.Incurred1__c;
                    rw.childWrappers.add(tdrw);
                }else{
                    ReserveWrapper pdrw = new ReserveWrapper();
                    pdrw.categoryName = 'TD';
                    pdrw.paidAmount = 0;
                    pdrw.outstandingAmount = 0;
                    pdrw.incurredAmount = 0;
                    rw.childWrappers.add(pdrw);
                }
                rw.paidAmount = totalPaidAmount;
                rw.outstandingAmount = totalOutstandingAmount;
                rw.incurredAmount = totalIncurredAmount;

            }else{
                if(existingCategoriesMap.containsKey(cat)){
                    Reserve__c res = existingCategoriesMap.get(cat);
                    //rw.reserveId = res.Id;
                    rw.paidAmount = res.Paid__c;
                    rw.outstandingAmount = res.Outstanding__c;
                    rw.incurredAmount = res.Incurred1__c;
                }else{
                    Reserve__c res = new Reserve__c();
                    rw.paidAmount = 0;
                    rw.outstandingAmount = 0;
                    rw.incurredAmount = 0;
                }
            }
            reserveWrappers.add(rw);
            System.debug('****reserveWrappers*****' + reserveWrappers);
        }
        return reserveWrappers;
    }

    @AuraEnabled
    public static void updateReserves(String claimId, List<ReserveWrapper> reserveWrappers) {
       System.debug('-reserveWrappers---' + reserveWrappers);
       Map<String,Reserve__c> existingCategoriesMap = new Map<String,Reserve__c>();
       List<Reserve__c> updatedReserves = new List<Reserve__c>();
       List<Reserve__c> reserves = [Select Id,
                                            Claim__c,
                                            Category__c,
                                            Sub_Category__c,
                                            Paid__c,
                                            Outstanding1__c,
                                            Incurred1__c
                                        from Reserve__c WHERE Claim__c=:claimId];

        for(Reserve__c reserve: reserves){
            if(!String.isBlank(reserve.Sub_Category__c)){
                if(existingCategoriesMap.containsKey(reserve.Category__c +'-'+reserve.Sub_Category__c)){
                    Reserve__c totalReserve = existingCategoriesMap.get(reserve.Category__c +'-'+reserve.Sub_Category__c);
                    totalReserve.Incurred1__c = totalReserve.Incurred1__c + reserve.Incurred1__c;
                    totalReserve.Outstanding1__c = totalReserve.Outstanding1__c + reserve.Outstanding__c;
                }else{
                    existingCategoriesMap.put(reserve.Category__c +'-'+reserve.Sub_Category__c, reserve);
                }
            }else{
                if(existingCategoriesMap.containsKey(reserve.Category__c)){
                    Reserve__c totalReserve = existingCategoriesMap.get(reserve.Category__c);
                    totalReserve.Incurred1__c = totalReserve.Incurred1__c + reserve.Incurred1__c;
                    totalReserve.Outstanding1__c = totalReserve.Outstanding1__c + reserve.Outstanding__c;
                }else{
                    existingCategoriesMap.put(reserve.Category__c, reserve);
                }

            }
        }
        /*for(Reserve__c reserve: reserves){
            if(!String.isBlank(reserve.Sub_Category__c)){
                existingCategoriesMap.put(reserve.Category__c +'-'+reserve.Sub_Category__c, reserve);
            }else{
                existingCategoriesMap.put(reserve.Category__c, reserve);
            }
        }*/

       for(ReserveWrapper rw: reserveWrappers){
            if(rw.categoryName != 'Total'){
                if(rw.categoryName == 'Indemnity'){
                    for(ReserveWrapper crw: rw.childWrappers){
                        Reserve__c updatedReserve = new Reserve__c();
                        updatedReserve.Claim__c = claimId;
                        updatedReserve.Category__c = rw.categoryName;
                        updatedReserve.Sub_Category__c = crw.categoryName;
                        updatedReserve.Comments__c = crw.comments;
                        updatedReserve.Incurred1__c = crw.incurredAmount;
                        updatedReserve.Outstanding1__c = updatedReserve.Incurred1__c;
                        if(existingCategoriesMap.containsKey(rw.categoryName+'-'+crw.categoryName)){
                            Reserve__c oldReserve = existingCategoriesMap.get(rw.categoryName+'-'+crw.categoryName);
                            updatedReserve.Incurred1__c = crw.incurredAmount - oldReserve.Incurred1__c;
                            updatedReserve.Outstanding1__c = updatedReserve.Outstanding__c;
                            if(updatedReserve.Incurred1__c!=0){
                                updatedReserves.add(updatedReserve);
                            }
                        }else{
                            updatedReserves.add(updatedReserve);
                        }
                    }
                }else{
                    Reserve__c updatedReserve = new Reserve__c();
                    updatedReserve.Claim__c = claimId;
                    updatedReserve.Category__c = rw.categoryName;
                    updatedReserve.Comments__c = rw.comments;
                    updatedReserve.Incurred1__c = rw.incurredAmount;
                    updatedReserve.Outstanding1__c = updatedReserve.Incurred1__c;
                    System.debug('**updatedReserves***'+updatedReserve.Incurred1__c);
                    if(existingCategoriesMap.containsKey(rw.categoryName)){
                        Reserve__c oldReserve = existingCategoriesMap.get(rw.categoryName);
                        updatedReserve.Incurred1__c = rw.incurredAmount - oldReserve.Incurred1__c;
                        updatedReserve.Outstanding1__c = updatedReserve.Outstanding__c;
                        System.debug('**updatedReserves***'+updatedReserve.Incurred1__c);
                        if(updatedReserve.Incurred1__c!=0){
                            updatedReserves.add(updatedReserve);
                        }
                        System.debug('**updatedReserves***'+updatedReserve);
                    }else{
                        updatedReserves.add(updatedReserve);
                    }
                }
            }
       }
       if(!updatedReserves.isEmpty()){
            insert updatedReserves;
       }
    }

    public class ReserveWrapper{

        @AuraEnabled
        public String categoryName {get ; set ;}

        //@AuraEnabled
        //public String reserveId {get ; set ;}

        @AuraEnabled
        public Decimal paidAmount {get ; set ;}

        @AuraEnabled
        public Decimal outstandingAmount {get ; set ;}

        @AuraEnabled
        public Decimal incurredAmount {get ; set ;}

        @AuraEnabled
        public String comments {get ; set ;}

        @AuraEnabled
        public Boolean hasChild {get ; set ;}

        @AuraEnabled
        public List<ReserveWrapper> childWrappers {get ; set ;}

        public  ReserveWrapper(){
            childWrappers = new List<ReserveWrapper>();
            hasChild = false;
        }
    }
}
