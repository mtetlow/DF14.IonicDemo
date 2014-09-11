
var oppApp = angular.module('oppApp', ['ionic', 'ngAnimate']);

oppApp.controller('oppAppCtrl', function ($scope, $ionicLoading, ToggleFavoriteOpp, GetMyFavoriteOpps) {
  $scope.favoriteOpps = favoriteOpps;
  $scope.currentUserId = currentUserId;
  $scope.constants = {};
  $scope.navigateToSObject=function(id, view){
    if(typeof(sforce)!='undefined' && typeof(sforce.one) != 'undefined'){
      sforce.one.navigateToSObject(id, view);
    }
  }
  $scope.addOpp=function(){
    if(typeof(sforce)!='undefined' && typeof(sforce.one) != 'undefined'){
      sforce.one.createRecord('Opportunity');
    }
  }
  $scope.reloadPage=function(){
    window.location.reload();
  }
  $scope.showLoading = function() {

    // Show the loading overlay and text
    $scope.loading = $ionicLoading.show({

      // The text to display in the loading indicator
      content: '<span class="spin s1utility s1utility-spinner"></span>',

      // The animation to use
      animation: 'fade-in',

      // Will a dark overlay or backdrop cover the entire view
      showBackdrop: true,

      // The maximum width of the loading indicator
      // Text will be wrapped if longer than maxWidth
      maxWidth: 200,

      // The delay in showing the indicator
      showDelay: 0
    });
  };

  // Hide the loading indicator
  $scope.hideLoading = function(){
    $ionicLoading.hide();
  };

  $scope.favoriteOpp = function(opp){
    ToggleFavoriteOpp.get(opp.opportunity.Id).then(function(updatedOpp){
      if(opp.isFavorite){ opp.isFavorite=false; }
      else{ opp.isFavorite=true; }
      //Refetch the favorite opps
      $scope.getMyFavoriteOpps();
    });
    
  }

  $scope.getMyFavoriteOpps = function(){
    GetMyFavoriteOpps.get().then(function(newFavOpps){
      $scope.favoriteOpps = newFavOpps;
    });
  }
});

oppApp.controller('oppAppAccountCtrl', function ($scope, $stateParams, $ionicLoading, AccountsForUser) {
  $scope.userId=$stateParams.userId;
  $scope.fetchAccountsForUser=function(){
    $scope.showLoading();
    $scope.accountsForUser = AccountsForUser.get($scope.userId).then(function(accounts){
            $scope.constants['accountsForUser']=accounts;
            $scope.hideLoading();
          });
  }
  $scope.fetchAccountsForUser();
});

oppApp.controller('oppAppOppsForAccountCtrl', function ($scope, $stateParams, $ionicLoading, OppsForAccount) {
  $scope.currentAccountId = $stateParams.accountId;

  angular.forEach($scope.constants['accountsForUser'],function(accountObj,index){
    if(accountObj.Id == $scope.currentAccountId){
      $scope.currentAccountName = accountObj.Name;
    }
  });

  $scope.pageTitle = $scope.currentAccountName+' Opps';

  $scope.oppsForAccount=function(){
    $scope.showLoading();
    $scope.oppArr=[];

    OppsForAccount.get($scope.currentAccountId).then(function(opps){
            $scope.oppArr = opps;
            $scope.hideLoading();
          });
  }
  $scope.oppsForAccount();
});

oppApp.controller('oppAppExpiringOppsCtrl', function ($scope, $stateParams, $ionicLoading, ExpiringOpps) {
  $scope.pageTitle = 'Expiring Opps';

  $scope.expiringOpps=function(){
    $scope.showLoading();
    $scope.oppArr=[];

    ExpiringOpps.get($scope.currentUserId).then(function(opps){
            $scope.oppArr = opps;
            $scope.hideLoading();
          });
  }
  $scope.expiringOpps();
});

oppApp.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  //
  $urlRouterProvider.otherwise("/");
  // Now set up the states
  $stateProvider
  .state('index', {
    url: "/",
    templateUrl: "dashboard.html"
  })
  .state('accounts', {
    url: "/accounts/:userId",
    templateUrl: "accounts.html" ,
    controller: 'oppAppAccountCtrl'
  })
  .state('accountopps',{
    url: "/accountopps/:accountId",
    templateUrl: "oppslist.html",
    controller: "oppAppOppsForAccountCtrl"
  })
  .state('expiringopps',{
    url: "/expiringopps",
    templateUrl: "oppslist.html",
    controller: "oppAppExpiringOppsCtrl"
  })
  // .state('projectlistview',{
  //   url: "/projectlistview",
  //   templateUrl: "projectlistview.html",
  //   controller: 'trSF1ProjectListViewCtrl'
  // })
  // .state('projectmobilecard',{
  //   url: "/projectmobilecard/:projectId",
  //   templateUrl: 'projectmobilecard.html',
  //   controller: 'trSF1ProjectMobileCardCtrl'
  // })
  // .state('projecttasksbylist',{
  //   url: "/projecttasksbylist/:projectId/:listName",
  //   templateUrl: "projecttasksbylist.html",
  //   controller: "trSF1ProjectMobileCardCtrl"
  // })

});

oppApp.factory('GetMyFavoriteOpps',function($q){
   var result;
    
  return {
    get: function() {
      var deferred = $q.defer();
      // Get mapping of issues to cases from Apex controller
      oppAppController.myFavOpps(function(result, event){
        if (event.status) {
          deferred.resolve(result);
        } else {
          deferred.reject(event);
        }
      }, {
        escape: false
      });

      return deferred.promise;
    }
  }
});

oppApp.factory('AccountsForUser',function($q){
   var result;
    
  return {
    get: function(userId) {
      var deferred = $q.defer();
      // Get mapping of issues to cases from Apex controller
      oppAppController.accountsForUser(userId,function(result, event){
        if (event.status) {
          deferred.resolve(result);
        } else {
          deferred.reject(event);
        }
      }, {
        escape: false
      });

      return deferred.promise;
    }
  }
});

oppApp.factory('OppsForAccount',function($q){
   var result;
    
  return {
    get: function(accountId) {
      var deferred = $q.defer();
      // Get mapping of issues to cases from Apex controller
      oppAppController.oppsForAccount(accountId,function(result, event){
        if (event.status) {
          deferred.resolve(result);
        } else {
          deferred.reject(event);
        }
      }, {
        escape: false
      });

      return deferred.promise;
    }
  }
});

oppApp.factory('ExpiringOpps',function($q){
   var result;
    
  return {
    get: function(userId) {
      var deferred = $q.defer();
      // Get mapping of issues to cases from Apex controller
      oppAppController.expiringOpps(userId,function(result, event){
        if (event.status) {
          deferred.resolve(result);
        } else {
          deferred.reject(event);
        }
      }, {
        escape: false
      });

      return deferred.promise;
    }
  }
});

oppApp.factory('ToggleFavoriteOpp',function($q){
   var result;
    
  return {
    get: function(oppId) {
      var deferred = $q.defer();
      // Get mapping of issues to cases from Apex controller
      oppAppController.toggleFavoriteOpp(oppId,function(result, event){
        if (event.status) {
          deferred.resolve(result);
        } else {
          deferred.reject(event);
        }
      }, {
        escape: false
      });

      return deferred.promise;
    }
  }
});

// trSF1App.factory('CompleteTasks', function($q) {
//   var result;
    
//   return {
//     all: function(taskIds) {
//       var deferred = $q.defer();
      
//       // Get mapping of issues to cases from Apex controller
//       /*NS*/trSF1DashboardController.completeTasks(taskIds,function(result, event){
//         if (event.status) {
//           deferred.resolve(result);
//         } else {
//           deferred.reject(event);
//         }
//       }, {
//         escape: false
//       });

//       return deferred.promise;
//     },
//     set: function(taskIds) {
//       var deferred = $q.defer();
//     return this.all(taskIds).then(function(){
//           return result;
//         });
//       },

//     //   return deferred.promise;      
//     // },
//     clear: function() {
//       result = null;   
//     }
//   }
// });