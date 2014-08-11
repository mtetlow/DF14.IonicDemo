public with sharing class oppAppController {
	public String favoriteOppsJSON{
		get{
			List<FavoriteOpps__c> favOpps = [SELECT FavOpp__c, FavOpp__r.Name FROM FavoriteOpps__c WHERE OwnerId = :UserInfo.getUserId()];
			List<Opportunity> returnOpps = new List<Opportunity>();
			for(FavoriteOpps__c favOpp : favOpps){
				returnOpps.add(favOpp.FavOpp__r);
			}
			return JSON.serialize(returnOpps);
		}set;}

	public String currentUserId{get{ return UserInfo.getUserId(); }set;}
	public oppAppController() {
	}

	@RemoteAction
	public static List<Opportunity> myFavOpps(){
		List<FavoriteOpps__c> favOpps = [SELECT FavOpp__c, FavOpp__r.Name, FavOpp__r.CloseDate FROM FavoriteOpps__c WHERE OwnerId = :UserInfo.getUserId()];
		List<Opportunity> returnOpps = new List<Opportunity>();
		for(FavoriteOpps__c favOpp : favOpps){
			returnOpps.add(favOpp.FavOpp__r);
		}
		return returnOpps;
	}

	@RemoteAction
	public static List<Account> accountsForUser(Id userId){
		List<Account> accounts = [SELECT Id,Name FROM Account WHERE OwnerId=:userId ORDER BY Name];
		return accounts;
	}

	@RemoteAction
	public static List<oppWrapper> oppsForAccount(Id accountId){
		List<Opportunity> opps = [SELECT Id,Name,CloseDate FROM Opportunity WHERE AccountId=:accountId ORDER BY Name];
		
		List<FavoriteOpps__c> favOpps = [SELECT Id,FavOpp__c FROM FavoriteOpps__c WHERE OwnerId = :UserInfo.getUserId()];
		Set<Id> favOppsSet = new Set<Id>();
		for(FavoriteOpps__c favOpp : favOpps){
			favOppsSet.add(favOpp.FavOpp__c);
		}

		List<oppWrapper> wrappedOpps = new List<oppWrapper>();
		for(Opportunity opp : opps){
			wrappedOpps.add(new oppWrapper(opp,favOppsSet));
		}
		return wrappedOpps;
	}

	@RemoteAction
	public static List<oppWrapper> expiringOpps(Id userId){
		List<Opportunity> opps = [SELECT Id,Name,CloseDate FROM Opportunity WHERE OwnerId=:userId AND CloseDate < NEXT_WEEK AND IsClosed=false ORDER BY Name];
		
		List<FavoriteOpps__c> favOpps = [SELECT Id,FavOpp__c FROM FavoriteOpps__c WHERE OwnerId = :UserInfo.getUserId()];
		Set<Id> favOppsSet = new Set<Id>();
		for(FavoriteOpps__c favOpp : favOpps){
			favOppsSet.add(favOpp.FavOpp__c);
		}

		List<oppWrapper> wrappedOpps = new List<oppWrapper>();
		for(Opportunity opp : opps){
			wrappedOpps.add(new oppWrapper(opp,favOppsSet));
		}
		return wrappedOpps;
	}

	@RemoteAction
	public static oppWrapper toggleFavoriteOpp(Id oppId){
		List<FavoriteOpps__c> favOpps = [SELECT Id,OwnerId,FavOpp__c FROM FavoriteOpps__c WHERE FavOpp__c = :oppId AND OwnerId=:UserInfo.getUserId()];
		if(favOpps.size()==0){
			//Add record
			FavoriteOpps__c newFav = new FavoriteOpps__c(FavOpp__c=oppId);
			system.debug('inserting for: '+oppId);
			system.debug(newFav);
			insert newFav;
		} else{
			//Delete record
			delete favOpps;
			system.debug('deleting');
		}
		Opportunity opp = [SELECT Id,Name,CloseDate FROM Opportunity WHERE Id=:oppId LIMIT 1];
		List<FavoriteOpps__c> newFavOpps = [SELECT Id,FavOpp__c FROM FavoriteOpps__c WHERE OwnerId = :UserInfo.getUserId()];
		Set<Id> favOppsSet = new Set<Id>();
		for(FavoriteOpps__c favOpp : newFavOpps){
			favOppsSet.add(favOpp.FavOpp__c);
		}
		system.debug(favOppsSet);
		system.debug(favOppsSet.contains(opp.Id));
		return new oppWrapper(opp,favOppsSet);
	}

	public class oppWrapper{
		public Opportunity opportunity {get;set;}
		public Boolean isFavorite {get;set;}
		public String parsedCloseDate {get;set;}

		public oppWrapper(Opportunity opp, Set<Id> favoriteOppSet){
			this.opportunity = opp;
			this.isFavorite = favoriteOppSet.contains(opp.Id);
			this.parsedCloseDate = (opp.CloseDate != null) ? opp.CloseDate.format() : '';
		}
	}
}