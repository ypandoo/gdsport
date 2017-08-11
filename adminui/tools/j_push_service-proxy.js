/*
 * Copyright 2014 Red Hat, Inc.
 *
 * Red Hat licenses this file to you under the Apache License, version 2.0
 * (the "License"); you may not use this file except in compliance with the
 * License.  You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/** @module gd-appworld-extgateway-jpush-js/j_push_service */
!function (factory) {
  if (typeof require === 'function' && typeof module !== 'undefined') {
    factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD loader
    define('gd-appworld-extgateway-jpush-js/j_push_service-proxy', [], factory);
  } else {
    // plain old include
    JPushService = factory();
  }
}(function () {

  /**
 The jpush service interface.

 @class
  */
  var JPushService = function(eb, address) {

    var j_eb = eb;
    var j_address = address;
    var closed = false;
    var that = this;
    var convCharCollection = function(coll) {
      var ret = [];
      for (var i = 0;i < coll.length;i++) {
        ret.push(String.fromCharCode(coll[i]));
      }
      return ret;
    };

    /**

     @public

     */
    this.close = function() {
      var __args = arguments;
      if (__args.length === 0) {
        if (closed) {
          throw new Error('Proxy is closed');
        }
        j_eb.send(j_address, {}, {"action":"close"});
        closed = true;
        return;
      } else throw new TypeError('function invoked with invalid arguments');
    };

    /**

     @public
     @param test {boolean} 
     @param toAndroid {boolean} 
     @param toIOS {boolean} 
     @param alert {string} 
     @param androidAlert {Object} 
     @param iosAlert {Object} 
     @param message {Object} 
     @param extraMessage {Object} 
     @param sendno {number} 
     @param time_to_live {number} 
     @param apns_production {boolean} 
     @param big_push_duration {number} 
     @param resultHandler {function} 
     */
    this.send2All = function(test, toAndroid, toIOS, alert, androidAlert, iosAlert, message, extraMessage, sendno, time_to_live, apns_production, big_push_duration, resultHandler) {
      var __args = arguments;
      if (__args.length === 13 && typeof __args[0] ==='boolean' && typeof __args[1] ==='boolean' && typeof __args[2] ==='boolean' && typeof __args[3] === 'string' && (typeof __args[4] === 'object' && __args[4] != null) && (typeof __args[5] === 'object' && __args[5] != null) && (typeof __args[6] === 'object' && __args[6] != null) && (typeof __args[7] === 'object' && __args[7] != null) && typeof __args[8] ==='number' && typeof __args[9] ==='number' && typeof __args[10] ==='boolean' && typeof __args[11] ==='number' && typeof __args[12] === 'function') {
        if (closed) {
          throw new Error('Proxy is closed');
        }
        j_eb.send(j_address, {"test":__args[0], "toAndroid":__args[1], "toIOS":__args[2], "alert":__args[3], "androidAlert":__args[4], "iosAlert":__args[5], "message":__args[6], "extraMessage":__args[7], "sendno":__args[8], "time_to_live":__args[9], "apns_production":__args[10], "big_push_duration":__args[11]}, {"action":"send2All"}, function(err, result) { __args[12](err, result &&result.body); });
        return;
      } else throw new TypeError('function invoked with invalid arguments');
    };

    /**

     @public
     @param test {boolean} 
     @param toAndroid {boolean} 
     @param toIOS {boolean} 
     @param tags {Array.<string>} 
     @param tags_and {Array.<string>} 
     @param alias {Array.<string>} 
     @param register_ids {Array.<string>} 
     @param alert {string} 
     @param androidAlert {Object} 
     @param iosAlert {Object} 
     @param message {Object} 
     @param extraMessage {Object} 
     @param sendno {number} 
     @param time_to_live {number} 
     @param apns_production {boolean} 
     @param big_push_duration {number} 
     @param resultHandler {function} 
     */
    this.send2Range = function(test, toAndroid, toIOS, tags, tags_and, alias, register_ids, alert, androidAlert, iosAlert, message, extraMessage, sendno, time_to_live, apns_production, big_push_duration, resultHandler) {
      var __args = arguments;
      if (__args.length === 17 && typeof __args[0] ==='boolean' && typeof __args[1] ==='boolean' && typeof __args[2] ==='boolean' && typeof __args[3] === 'object' && __args[3] instanceof Array && typeof __args[4] === 'object' && __args[4] instanceof Array && typeof __args[5] === 'object' && __args[5] instanceof Array && typeof __args[6] === 'object' && __args[6] instanceof Array && typeof __args[7] === 'string' && (typeof __args[8] === 'object' && __args[8] != null) && (typeof __args[9] === 'object' && __args[9] != null) && (typeof __args[10] === 'object' && __args[10] != null) && (typeof __args[11] === 'object' && __args[11] != null) && typeof __args[12] ==='number' && typeof __args[13] ==='number' && typeof __args[14] ==='boolean' && typeof __args[15] ==='number' && typeof __args[16] === 'function') {
        if (closed) {
          throw new Error('Proxy is closed');
        }
        j_eb.send(j_address, {"test":__args[0], "toAndroid":__args[1], "toIOS":__args[2], "tags":__args[3], "tags_and":__args[4], "alias":__args[5], "register_ids":__args[6], "alert":__args[7], "androidAlert":__args[8], "iosAlert":__args[9], "message":__args[10], "extraMessage":__args[11], "sendno":__args[12], "time_to_live":__args[13], "apns_production":__args[14], "big_push_duration":__args[15]}, {"action":"send2Range"}, function(err, result) { __args[16](err, result &&result.body); });
        return;
      } else throw new TypeError('function invoked with invalid arguments');
    };

    /**

     @public
     @param registrationId {string} 
     @param resultHandler {function} 
     */
    this.getDeviceTagAlias = function(registrationId, resultHandler) {
      var __args = arguments;
      if (__args.length === 2 && typeof __args[0] === 'string' && typeof __args[1] === 'function') {
        if (closed) {
          throw new Error('Proxy is closed');
        }
        j_eb.send(j_address, {"registrationId":__args[0]}, {"action":"getDeviceTagAlias"}, function(err, result) { __args[1](err, result &&result.body); });
        return;
      } else throw new TypeError('function invoked with invalid arguments');
    };

    /**

     @public
     @param registrationId {string} 
     @param clearAlias {boolean} 
     @param clearTag {boolean} 
     @param resultHandler {function} 
     */
    this.clearDeviceTagAlias = function(registrationId, clearAlias, clearTag, resultHandler) {
      var __args = arguments;
      if (__args.length === 4 && typeof __args[0] === 'string' && typeof __args[1] ==='boolean' && typeof __args[2] ==='boolean' && typeof __args[3] === 'function') {
        if (closed) {
          throw new Error('Proxy is closed');
        }
        j_eb.send(j_address, {"registrationId":__args[0], "clearAlias":__args[1], "clearTag":__args[2]}, {"action":"clearDeviceTagAlias"}, function(err, result) { __args[3](err, result &&result.body); });
        return;
      } else throw new TypeError('function invoked with invalid arguments');
    };

    /**

     @public
     @param registrationId {string} 
     @param alias {string} 
     @param tagsToAdd {Array.<string>} 
     @param tagsToRemove {Array.<string>} 
     @param resultHandler {function} 
     */
    this.updateDeviceTagAlias = function(registrationId, alias, tagsToAdd, tagsToRemove, resultHandler) {
      var __args = arguments;
      if (__args.length === 5 && typeof __args[0] === 'string' && typeof __args[1] === 'string' && typeof __args[2] === 'object' && __args[2] instanceof Array && typeof __args[3] === 'object' && __args[3] instanceof Array && typeof __args[4] === 'function') {
        if (closed) {
          throw new Error('Proxy is closed');
        }
        j_eb.send(j_address, {"registrationId":__args[0], "alias":__args[1], "tagsToAdd":__args[2], "tagsToRemove":__args[3]}, {"action":"updateDeviceTagAlias"}, function(err, result) { __args[4](err, result &&result.body); });
        return;
      } else throw new TypeError('function invoked with invalid arguments');
    };

    /**

     @public
     @param resultHandler {function} 
     */
    this.getTags = function(resultHandler) {
      var __args = arguments;
      if (__args.length === 1 && typeof __args[0] === 'function') {
        if (closed) {
          throw new Error('Proxy is closed');
        }
        j_eb.send(j_address, {}, {"action":"getTags"}, function(err, result) { __args[0](err, result &&result.body); });
        return;
      } else throw new TypeError('function invoked with invalid arguments');
    };

    /**

     @public
     @param theTag {string} 
     @param registrationID {string} 
     @param resultHandler {function} 
     */
    this.isDeviceInTag = function(theTag, registrationID, resultHandler) {
      var __args = arguments;
      if (__args.length === 3 && typeof __args[0] === 'string' && typeof __args[1] === 'string' && typeof __args[2] === 'function') {
        if (closed) {
          throw new Error('Proxy is closed');
        }
        j_eb.send(j_address, {"theTag":__args[0], "registrationID":__args[1]}, {"action":"isDeviceInTag"}, function(err, result) { __args[2](err, result &&result.body); });
        return;
      } else throw new TypeError('function invoked with invalid arguments');
    };

    /**

     @public
     @param theTag {string} 
     @param toAddUsers {Array.<string>} 
     @param toRemoveUsers {Array.<string>} 
     @param resultHandler {function} 
     */
    this.addRemoveDevicesFromTag = function(theTag, toAddUsers, toRemoveUsers, resultHandler) {
      var __args = arguments;
      if (__args.length === 4 && typeof __args[0] === 'string' && typeof __args[1] === 'object' && __args[1] instanceof Array && typeof __args[2] === 'object' && __args[2] instanceof Array && typeof __args[3] === 'function') {
        if (closed) {
          throw new Error('Proxy is closed');
        }
        j_eb.send(j_address, {"theTag":__args[0], "toAddUsers":__args[1], "toRemoveUsers":__args[2]}, {"action":"addRemoveDevicesFromTag"}, function(err, result) { __args[3](err, result &&result.body); });
        return;
      } else throw new TypeError('function invoked with invalid arguments');
    };

    /**

     @public
     @param theTag {string} 
     @param platform {string} 
     @param resultHandler {function} 
     */
    this.deleteTag = function(theTag, platform, resultHandler) {
      var __args = arguments;
      if (__args.length === 3 && typeof __args[0] === 'string' && typeof __args[1] === 'string' && typeof __args[2] === 'function') {
        if (closed) {
          throw new Error('Proxy is closed');
        }
        j_eb.send(j_address, {"theTag":__args[0], "platform":__args[1]}, {"action":"deleteTag"}, function(err, result) { __args[2](err, result &&result.body); });
        return;
      } else throw new TypeError('function invoked with invalid arguments');
    };

    /**

     @public
     @param alias {string} 
     @param platform {string} 
     @param resultHandler {function} 
     */
    this.getAliasDeviceList = function(alias, platform, resultHandler) {
      var __args = arguments;
      if (__args.length === 3 && typeof __args[0] === 'string' && typeof __args[1] === 'string' && typeof __args[2] === 'function') {
        if (closed) {
          throw new Error('Proxy is closed');
        }
        j_eb.send(j_address, {"alias":__args[0], "platform":__args[1]}, {"action":"getAliasDeviceList"}, function(err, result) { __args[2](err, result &&result.body); });
        return;
      } else throw new TypeError('function invoked with invalid arguments');
    };

    /**

     @public
     @param alias {string} 
     @param platform {string} 
     @param resultHandler {function} 
     */
    this.deleteAlias = function(alias, platform, resultHandler) {
      var __args = arguments;
      if (__args.length === 3 && typeof __args[0] === 'string' && typeof __args[1] === 'string' && typeof __args[2] === 'function') {
        if (closed) {
          throw new Error('Proxy is closed');
        }
        j_eb.send(j_address, {"alias":__args[0], "platform":__args[1]}, {"action":"deleteAlias"}, function(err, result) { __args[2](err, result &&result.body); });
        return;
      } else throw new TypeError('function invoked with invalid arguments');
    };

    /**

     @public
     @param msgIdArray {Array.<string>} 
     @param resultHandler {function} 
     */
    this.getReceiveds = function(msgIdArray, resultHandler) {
      var __args = arguments;
      if (__args.length === 2 && typeof __args[0] === 'object' && __args[0] instanceof Array && typeof __args[1] === 'function') {
        if (closed) {
          throw new Error('Proxy is closed');
        }
        j_eb.send(j_address, {"msgIdArray":__args[0]}, {"action":"getReceiveds"}, function(err, result) { __args[1](err, result &&result.body); });
        return;
      } else throw new TypeError('function invoked with invalid arguments');
    };

  };

  /**

   @memberof module:gd-appworld-extgateway-jpush-js/j_push_service
   @param vertx {Vertx} 
   @return {JPushService}
   */
  JPushService.create = function(vertx) {
    var __args = arguments;
    if (__args.length === 1 && typeof __args[0] === 'object' && __args[0]._jdel) {
      if (closed) {
        throw new Error('Proxy is closed');
      }
      j_eb.send(j_address, {"vertx":__args[0]}, {"action":"create"});
      return;
    } else throw new TypeError('function invoked with invalid arguments');
  };

  /**

   @memberof module:gd-appworld-extgateway-jpush-js/j_push_service
   @param vertx {Vertx} 
   @param address {string} 
   @return {JPushService}
   */
  JPushService.createProxy = function(vertx, address) {
    var __args = arguments;
    if (__args.length === 2 && typeof __args[0] === 'object' && __args[0]._jdel && typeof __args[1] === 'string') {
      if (closed) {
        throw new Error('Proxy is closed');
      }
      j_eb.send(j_address, {"vertx":__args[0], "address":__args[1]}, {"action":"createProxy"});
      return;
    } else throw new TypeError('function invoked with invalid arguments');
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = JPushService;
    } else {
      exports.JPushService = JPushService;
    }
  } else {
    return JPushService;
  }
});