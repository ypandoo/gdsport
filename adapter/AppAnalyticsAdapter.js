"use strict";
require("parse");
var _ = require('lodash');
var AppAnalytics = Parse.Object.extend("AppAnalytics");
function AppAnalyticsAdapter() {
  
}

AppAnalyticsAdapter.prototype.appOpened = function(parameters, req) {
        console.log(parameters);

    return Promise.resolve({});
  }

AppAnalyticsAdapter.prototype.trackEvent =function(eventName, parameters, req) {
       
       var appAnalytics = new AppAnalytics();
        appAnalytics.set("event", eventName);
        if(req.user){
            appAnalytics.set("user", req.user);
        }
        if(req.auth && req.auth.installationId){
            appAnalytics.set("installationId", req.auth.installationId);
        }
        _.forIn(_.omit(parameters, ['objectId','createdAt','updatedAt','event', 'ACL','user','installationId']), function(value, key) {
            appAnalytics.set(key, value);
           
        });
        return appAnalytics.save(null, {useMasterKey: true});
   // return Promise.resolve({});
  }


module.exports = AppAnalyticsAdapter;
module.exports.default  = AppAnalyticsAdapter;