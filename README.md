# lambda_logger
Handles logging from lambda functions

## Initialisation

### package.json
  "dependencies": {
    "lambda_logger": "git+https://github.com/ciswired/lambda_logger.git"
  }
  
### module
  var lambdaLogger = require('lambda_logger');
  
  
## Common use

### Init
  var logger = new lambdaLogger(event, context);
  
### Lambda done handler
  logger.done(error, result);
  
### log function start
  logger.logStartFunction('validateUser');
  
### Log simple message (trigger console.log, use the same syntax)  
  logger.logSimpleMessage('PROCESS -%s-%s ', element._id.$oid, ' -- ', (element._etag ? element._etag.$oid : ''));  
  
### Warning
  logger.logWarning(logger.constants.LOG_TYPE_SNS, 'Unable to publish', error);  
  
  
## Lambdas

### Invoke
  Define:
  var preLambdaDate = new Date();
  var lambdaParams = {
    ...
  };
  
  Result:
  logger.lambda.logInvoke(lambdaParams, error, data, preLambdaDate);
  
### Warning
  logger.lambda.logWarning(lambdaParams, error);
  
## SNS

### Publish
  Define:
  var preSNSDate = new Date();
  var snsMessage = {
    ...
  };
  
  Result:
  logger.sns.logPublish(snsMessage, error, data, preSNSDate);
  
### Warning
  logger.sns.logWarning(snsMessage, error);
        
## Mongo

### Request
  Define:
  var preQueryDate = new Date();
  var requestConfig = {
    ...
  };
  
  Result:
  GET: logger.mongo.logGetRequest(requestConfig, error, response, body, preQueryDate);
  POST: logger.mongo.logPostRequest(requestConfig, error, response, body, preQueryDate);
  PATCH: logger.mongo.logPatchRequest(requestConfig, error, response, body, preQueryDate);
  
### Warning
  logger.mongo.logWarning(requestConfig, error);
  
## Cognito

### Publish
  Define:
  var preCognitoDate = new Date();
  var cognitoParameters = {
    ...
  };
  
  Result:
  getId: logger.cognito.logGetId(cognitoParameters, error, data, preSNSDate);
  getOpenIdTokenForDeveloperIdentity: logger.cognito.logGetOpenId(cognitoParameters, error, data, preSNSDate);
  getCredentialsForIdentity: logger.cognito.logGetCredentials(cognitoParameters, error, data, preSNSDate);
  
### Warning
  logger.cognito.logWarning(cognitoParameters, error);  
  
## PubNub

### Publish
  Define:
  var prePubNubDate = new Date();
  var pubNubChannel = '';
  var pubNubMessage = {
    ...
  };
  
  Callback:
  logger.pubnub.logPublishCallBack(pubNubChannel, pubNubMessage, result, prePubNubDate);
  
  Error:
  logger.pubnub.logPublishError(pubNubChannel, pubNubMessage, error, prePubNubDate);

### Warning
  logger.pubnub.logWarning(pubNubChannel, error);

## SES

### sendEmail
  Define:
  var preSESDate = new Date();
  var sesMessage = {
    ...
  };

  Result:
  logger.ses.logSendEmail(sesMessage, error, data, preSESDate);

### Warning
  logger.ses.logWarning(sesMessage, error);

## S3

### getObject
  Define:
  var preS3Date = new Date();
  var s3Params = {
    ...
  };

  Result:
  logger.s3.logGetObject(s3Params, error, data, preS3Date);

### Warning
  logger.s3.logWarning(s3Params, error);
  


