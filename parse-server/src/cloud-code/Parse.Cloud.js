import { Parse }     from 'parse/node';
import * as triggers from '../triggers';

function validateClassNameForTriggers(className) {
  const restrictedClassNames = [ '_Session' ];
  if (restrictedClassNames.indexOf(className) != -1) {
    throw `Triggers are not supported for ${className} class.`;
  }
  return className;
}

function getClassName(parseClass) {
  if (parseClass && parseClass.className) {
    return validateClassNameForTriggers(parseClass.className);
  }
  return validateClassNameForTriggers(parseClass);
}

var ParseCloud = {};
ParseCloud.define = function(functionName, handler, validationHandler) {
  triggers.addFunction(functionName, handler, validationHandler, Parse.applicationId);
};

ParseCloud.job = function(functionName, handler) {
  triggers.addJob(functionName, handler, Parse.applicationId);
};

ParseCloud.beforeSave = function(parseClass, handler) {
  var className = getClassName(parseClass);
  triggers.addTrigger(triggers.Types.beforeSave, className, handler, Parse.applicationId);
};

ParseCloud.beforeDelete = function(parseClass, handler) {
  var className = getClassName(parseClass);
  triggers.addTrigger(triggers.Types.beforeDelete, className, handler, Parse.applicationId);
};

ParseCloud.afterSave = function(parseClass, handler) {
  var className = getClassName(parseClass);
  triggers.addTrigger(triggers.Types.afterSave, className, handler, Parse.applicationId);
};

ParseCloud.afterDelete = function(parseClass, handler) {
  var className = getClassName(parseClass);
  triggers.addTrigger(triggers.Types.afterDelete, className, handler, Parse.applicationId);
};

ParseCloud.beforeFind = function(parseClass, handler) {
  var className = getClassName(parseClass);
  triggers.addTrigger(triggers.Types.beforeFind, className, handler, Parse.applicationId);
};

ParseCloud.afterFind = function(parseClass, handler) {
  const className = getClassName(parseClass);
  triggers.addTrigger(triggers.Types.afterFind, className, handler, Parse.applicationId);
};

ParseCloud._removeAllHooks = () => {
  triggers._unregisterAll();
}

ParseCloud.useMasterKey = () => {
  // eslint-disable-next-line
  console.warn("Parse.Cloud.useMasterKey is deprecated (and has no effect anymore) on parse-server, please refer to the cloud code migration notes: https://github.com/ParsePlatform/parse-server/wiki/Compatibility-with-Hosted-Parse#cloud-code")
}

ParseCloud.httpRequest = require("./httpRequest");

module.exports = ParseCloud;
