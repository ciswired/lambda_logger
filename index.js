/**
 * @author Sergey Andronnikov
 * @param event
 * @param context
 *
 *
 *
 --- INIT

 , lambdaLogger = require('lambda_logger')

 var logger = new lambdaLogger(event, context);

 --- LAMBDA DONE
 logger.done(error, result);

 --- COMMON WARNING
 logger.logWarning(logger.constants.LOG_TYPE_SNS, 'Unable to publish', error);


--- LOG LEVELS (process.env.logLevel)
- info (only start and done messages)
- error (start, done and error messages)
- verbose (all)

 ------------- LAMBDA --------------

 var preLambdaDate = new Date();

 --- ANY
 logger.logLambdaInvoke(lambdaParams, error, data, preLambdaDate);

 --- ERROR
 logger.logLambdaError(lambdaParams, error);

 ---WARNING
 logger.logLambdaWarning(lambdaParams, error);



 ------------- SNS --------------
 var preSNSDate = new Date();
 var snsMessage = {};

 --- ANY
 logger.sns.logPublish(snsMessage, error, data, preSNSDate);

 --- WARNING
 logger.sns.logWarning(snsMessage, error);


 ------------- DB --------------

 var preQueryDate = new Date();
 var requestConfig = {};

 requestConfig, function(error, response, body)
 --- ANY
 logger.mongo.logGetRequest(requestConfig, error, response, body, preQueryDate);
 logger.mongo.logPostRequest(requestConfig, error, response, body, preQueryDate);
 logger.mongo.logPatchRequest(requestConfig, error, response, body, preQueryDate);
 *
 */

var util = require('util');

const LOG_TYPE_AWS = 'aws';
const LOG_TYPE_MONGO = 'mongo';
const LOG_TYPE_LAMBDA = 'lambda';
const LOG_TYPE_SNS = 'sns';
const LOG_TYPE_COGNITO = 'cognito';
const LOG_TYPE_PUBNUB = 'pubnub';
const LOG_TYPE_SES = 'ses';
const LOG_TYPE_S3 = 's3';
const LOG_TYPE_CW = 'cloudwatch';

const LOG_METHOD_LAMBDA_INVOKE = 'call';
const LOG_METHOD_SNS = 'sns';

const LOG_METHOD_MONGO_GET = 'get';
const LOG_METHOD_MONGO_POST = 'post';
const LOG_METHOD_MONGO_PATCH = 'patch';
const LOG_METHOD_MONGO_PUT = 'put';

const LOG_METHOD_CW_PUT_METRIC = 'putMetric';

const LOG_METHOD_COGNITO_GET_ID = 'getId';
const LOG_METHOD_COGNITO_GET_OPENID = 'getOpenIdTokenForDeveloperIdentity';
const LOG_METHOD_COGNITO_GET_CREDENTIALS = 'getCredentialsForIdentity';


/**
 * Lambda Logger
 * @param event
 * @param context
 * @param detailed
 */
var lambdaLogger = function (event, context, detailed) {
    "use strict";
    lambdaLogger.prototype.event = event;
    lambdaLogger.prototype.context = context;
    lambdaLogger.prototype.logLevel = process.env.logLevel ? process.env.logLevel : 'info';

    lambdaLogger.prototype.inData = {
        inData: {
            startDateTime: new Date(),
            name: lambdaLogger.prototype.context.functionName,
            payload: lambdaLogger.prototype.event,
            lambdaContext: lambdaLogger.prototype.context
        }
    };

    if (detailed && detailed === true) {
        var headerString = event.inputParams || null;
        if (headerString && headerString.length > 0) {
            var startPosition = headerString.toLowerCase().indexOf("accept=");
            if (startPosition > -1) lambdaLogger.prototype.inData.inData.acceptString = headerString.substring(startPosition + 7, headerString.indexOf(',', startPosition));
            startPosition = headerString.toLowerCase().indexOf("cloudfront-is-desktop-viewer=");
            if (startPosition > -1) lambdaLogger.prototype.inData.inData.isDesktop = headerString.substring(startPosition + 29, headerString.indexOf(',', startPosition)) === 'true';
            startPosition = headerString.toLowerCase().indexOf("cloudfront-is-mobile-viewer=");
            if (startPosition > -1) lambdaLogger.prototype.inData.inData.isMobile = headerString.substring(startPosition + 28, headerString.indexOf(',', startPosition)) === 'true';
            startPosition = headerString.toLowerCase().indexOf("cloudfront-is-smarttv-viewer=");
            if (startPosition > -1) lambdaLogger.prototype.inData.inData.isSmartTV = headerString.substring(startPosition + 29, headerString.indexOf(',', startPosition)) === 'true';
            startPosition = headerString.toLowerCase().indexOf("cloudfront-is-tablet-viewer=");
            if (startPosition > -1) lambdaLogger.prototype.inData.inData.isTablet = headerString.substring(startPosition + 28, headerString.indexOf(',', startPosition)) === 'true';
            startPosition = headerString.toLowerCase().indexOf("cloudfront-viewer-country=");
            if (startPosition > -1) lambdaLogger.prototype.inData.inData.countryCode = headerString.substring(startPosition + 26, headerString.indexOf(',', startPosition));
            startPosition = headerString.toLowerCase().indexOf("content-type=");
            if (startPosition > -1) lambdaLogger.prototype.inData.inData.contentType = headerString.substring(startPosition + 13, headerString.indexOf(',', startPosition));
            startPosition = headerString.toLowerCase().indexOf("host=");
            if (startPosition > -1) lambdaLogger.prototype.inData.inData.host = headerString.substring(startPosition + 5, headerString.indexOf(',', startPosition));
            startPosition = headerString.toLowerCase().indexOf("user-agent=");
            if (startPosition > -1) lambdaLogger.prototype.inData.inData.userAgent = headerString.substring(startPosition + 11, headerString.indexOf(',', startPosition));
            startPosition = headerString.toLowerCase().indexOf("via=");
            if (startPosition > -1) lambdaLogger.prototype.inData.inData.via = headerString.substring(startPosition + 4, headerString.indexOf(',', startPosition));
            startPosition = headerString.toLowerCase().indexOf("x-amz-cf-id=");
            if (startPosition > -1) lambdaLogger.prototype.inData.inData.cloudFrontId = headerString.substring(startPosition + 12, headerString.indexOf(',', startPosition));
            startPosition = headerString.toLowerCase().indexOf("x-amz-date=");
            if (startPosition > -1) lambdaLogger.prototype.inData.inData.amazonDateTime = headerString.substring(startPosition + 11, headerString.indexOf(',', startPosition));
            startPosition = headerString.toLowerCase().indexOf("x-api-key=");
            if (startPosition > -1) lambdaLogger.prototype.inData.inData.apiKey = headerString.substring(startPosition + 10, headerString.indexOf(',', startPosition));
            startPosition = headerString.toLowerCase().indexOf('x-forwarded-for=');
            if (startPosition > -1) lambdaLogger.prototype.inData.inData.forwardedFor = headerString.substring(startPosition + 16, headerString.toLowerCase().indexOf(', x', startPosition));
        }
    }

    lambdaLogger.prototype.metaData = {
        metaData: {
        }
    };

    lambdaLogger.prototype.outData = {
        outData: {
            warnings: []
        }
    };

    console.log(JSON.stringify(lambdaLogger.prototype.inData));

    lambdaLogger.prototype._logMetaData = function _logMetaData () {
        lambdaLogger.prototype.metaData.metaData.name = lambdaLogger.prototype.inData.inData.name;
        lambdaLogger.prototype.metaData.metaData.startDateTime = lambdaLogger.prototype.inData.inData.startDateTime;
        lambdaLogger.prototype.metaData.metaData.endDateTime = new Date();
        console.log(JSON.stringify(lambdaLogger.prototype.metaData));
    };
};

/**
 * Lambda context done handler
 * @param error
 * @param result
 */
lambdaLogger.prototype.done = function done(error, result) {
    "use strict";
    if (error) {
        lambdaLogger.prototype.fail(error, result);
    } else {
        lambdaLogger.prototype.succeed(result);
    }
};

/**
 * Lambda context fail handler
 * @param error
 * @param result
 * @param outPayload
 */
lambdaLogger.prototype.fail = function (error, result, outPayload) {
    "use strict";
    if (!outPayload) {
        outPayload = 'Bad Request: ' + (error.message ? error.message : error);
    }
    lambdaLogger.prototype.outData.outData = Object.assign(
        lambdaLogger.prototype.outData.outData,
        {
            payload: outPayload,
            status: 'error',
            errorMessage: 'LAMBDA_FATAL',
            errorObject: error,
            startDateTime: lambdaLogger.prototype.inData.inData.startDateTime,
            endDateTime: new Date()
        }
    );

    lambdaLogger.prototype._logMetaData();
    console.log(JSON.stringify(lambdaLogger.prototype.outData));
    lambdaLogger.prototype.context.done(outPayload);
};

/**
 * Lambda context succeed handler
 * @param result
 */
lambdaLogger.prototype.succeed = function (result) {
    "use strict";
    lambdaLogger.prototype.outData.outData = Object.assign(
        lambdaLogger.prototype.outData.outData,
        {
            payload: result,
            status: 'success',
            startDateTime: lambdaLogger.prototype.inData.inData.startDateTime,
            endDateTime: new Date()
        }
    );
    lambdaLogger.prototype._logMetaData();
    console.log(JSON.stringify(lambdaLogger.prototype.outData));
    lambdaLogger.prototype.context.done(null, result);
};


/**
 * Log start of lambda method
 * @param functionName
 * @param params
 */
lambdaLogger.prototype.logStartFunction = function (functionName, params) {
    "use strict";

    if (lambdaLogger.prototype.logLevel == 'verbose') {
      if (params) {
        console.log(util.format('RUN "%s"; PARAMS: %j', functionName, params));
      } else {
        console.log(util.format('RUN "%s"', functionName));
      }
    }
};

lambdaLogger.prototype.logSimpleMessage = function () {
    "use strict";
    if (lambdaLogger.prototype.logLevel == 'verbose') {
      console.log.apply(this, arguments);
    }
};

/** -------- LAMBDAS SECTION ------------ */
/**
 * Log lambda invoke result
 * @param lambdaParams
 * @param error
 * @param data
 * @param preLambdaDate
 */
lambdaLogger.prototype.logLambdaInvoke = function logLambdaInvoke(lambdaParams, error, data, preLambdaDate) {
    "use strict";
    if (lambdaLogger.prototype.logLevel == 'verbose' ||
        (lambdaLogger.prototype.logLevel == 'error' && error)) {
    console.log(JSON.stringify({
        callData: {
            type: LOG_TYPE_LAMBDA,
            method: LOG_METHOD_LAMBDA_INVOKE,
            startDateTime: preLambdaDate,
            endDateTime: new Date(),
            functionName: lambdaParams.FunctionName,
            qualifier: lambdaParams.Qualifier,
            payload: JSON.parse(lambdaParams.Payload),
            lambdaError: error,
            lambdaData: data
        }
    }));
  }
};

/**
 * Log Custom type warning
 * @param type
 * @param message
 * @param error
 */
lambdaLogger.prototype.logWarning = function (type, message, error) {
    "use strict";
    var logObject = {
        type: type,
        messages: message
    };
    if (error) {
        logObject.messageObject = error;
    }
    lambdaLogger.prototype.outData.outData.warnings.push(logObject);
};

/**
 * Log lambda invoke warning
 * @param lambdaParams
 * @param error
 */
lambdaLogger.prototype.logLambdaWarning = function (lambdaParams, error) {
    "use strict";
    lambdaLogger.prototype.logWarning(
        LOG_TYPE_LAMBDA,
        'LAMBDA_WARNING: ' + lambdaParams.FunctionName + ' function',
        error
    );
};

/**
 *
 * @type {{logInvoke: lambdaFunctionsLogger.logInvoke, logWarning: lambdaFunctionsLogger.logWarning}}
 */
var lambdaFunctionsLogger = {
    /**
     *
     * @param lambdaParams
     * @param error
     * @param data
     * @param preLambdaDate
     */
    logInvoke: function (lambdaParams, error, data, preLambdaDate) {
        "use strict";
        lambdaLogger.prototype.logLambdaInvoke(lambdaParams, error, data, preLambdaDate);
    },
    /**
     *
     * @param lambdaParams
     * @param error
     */
    logWarning: function (lambdaParams, error) {
        "use strict";
        lambdaLogger.prototype.logLambdaWarning(lambdaParams, error);
    }
};

lambdaLogger.prototype.lambda = lambdaFunctionsLogger;


/** -------- SNS SECTION ------------ */

/**
 * SNS Logger
 * @type {{logPublish: snsLogger.logPublish, logWarning: snsLogger.logWarning}}
 */
var snsLogger = {
    /**
     *
     * @param snsMessage
     * @param error
     * @param data
     * @param preSNSDate
     */
    logPublish: function(snsMessage, error, data, preSNSDate) {
        "use strict";
        if (lambdaLogger.prototype.logLevel == 'verbose' ||
            (lambdaLogger.prototype.logLevel == 'error' && error)) {
          console.log(JSON.stringify({
              callData: {
                  type: LOG_TYPE_AWS,
                  method: LOG_METHOD_SNS,
                  startDateTime: preSNSDate,
                  endDateTime: new Date(),
                  topicArn: snsMessage.TopicArn,
                  snsMessage: snsMessage.Message,
                  snsSubject: snsMessage.Subject,
                  snsError: error,
                  snsResponse: data
              }
          }));
      }
    },
    /**
     * Log SNS warning
     * @param snsMessage
     * @param error
     */
    logWarning: function(snsMessage, error) {
        "use strict";
        lambdaLogger.prototype.logWarning(
            LOG_METHOD_SNS,
            'LAMBDA_WARNING: Error sending SNS "' + snsMessage.Subject + '" message',
            error
        );
    }
};

lambdaLogger.prototype.sns = snsLogger;


/** -------- CW SECTION ------------ */

/**
 * CW Logger
 * @type {{logPutMetric: cwLogger.logPutMetric, logWarning: cwLogger.logWarning}}
 */
var cwLogger = {
    /**
     *
     * @param cwParams
     * @param error
     * @param data
     * @param preCWDate
     */
    logPutMetric: function(cwParams, error, data, preCWDate) {
        "use strict";
        if (lambdaLogger.prototype.logLevel == 'verbose' ||
            (lambdaLogger.prototype.logLevel == 'error' && error)) {
          console.log(JSON.stringify({
              callData: {
                  type: LOG_TYPE_CW,
                  method: LOG_METHOD_CW_PUT_METRIC,
                  startDateTime: preCWDate,
                  endDateTime: new Date(),
                  cwParams: cwParams,
                  cwError: error,
                  cwResponse: data
              }
          }));
      }
    },
    /**
     * Log SNS warning
     * @param snsMessage
     * @param error
     */
    logWarning: function(cwMessage, error) {
        "use strict";
        lambdaLogger.prototype.logWarning(
            LOG_METHOD_CW_PUT_METRIC,
            'LAMBDA_WARNING: Error writing metric ' + cwMessage.MetricName,
            error
        );
    }
};

lambdaLogger.prototype.cw = cwLogger;

/** -------- MONGO SECTION ------------ */
/**
 * Mongo logger
 * @type {{logRequest: mongoLogger.logRequest, logBigRequest: mongoLogger.logBigRequest, logBigGetRequest: mongoLogger.logBigGetRequest, logGetRequest: mongoLogger.logGetRequest, logPostRequest: mongoLogger.logPostRequest, logPatchRequest: mongoLogger.logPatchRequest, logWarning: mongoLogger.logWarning}}
 */
var mongoLogger = {
    /**
     * Log Mongo Request
     * @param requestConfig
     * @param method
     * @param error
     * @param response
     * @param body
     * @param preQueryDate
     */
    logRequest: function(requestConfig, method, error, response, body, preQueryDate) {
        "use strict";
        if (lambdaLogger.prototype.logLevel == 'verbose' ||
            (lambdaLogger.prototype.logLevel == 'error' && error)) {
          console.log(JSON.stringify({
              callData: {
                  type: LOG_TYPE_MONGO,
                  method: method,
                  startDateTime: preQueryDate,
                  endDateTime: new Date(),
                  requestUri: requestConfig.uri,
                  requestHeaders: requestConfig.headers,
                  requestBody: requestConfig.body || null,
                  responseStatusCode: response && response.hasOwnProperty('statusCode') ? response.statusCode : null,
                  responseError: error,
                  responseBody: body || response ? response.body : null
              }
          }));
        }
    },
    /**
     *
     * @param requestConfig
     * @param method
     * @param error
     * @param response
     * @param body
     * @param preQueryDate
     */
    logBigRequest: function(requestConfig, method, error, response, body, preQueryDate) {
        "use strict";

        var returnedCount = 0;
        if (!error && response.body) {
            var tmpBody = response.body;
            if (response.body.hasOwnProperty('_returned') === false && typeof response.body === 'string' && response.body.length > 0) {
                tmpBody = JSON.parse(response.body);
            }
            if (tmpBody.hasOwnProperty('_returned')) {
                returnedCount = tmpBody._returned;
            }
        }

        if (lambdaLogger.prototype.logLevel == 'verbose' ||
            (lambdaLogger.prototype.logLevel == 'error' && error)) {
          console.log(JSON.stringify({
              callData: {
                  type: LOG_TYPE_MONGO,
                  method: method,
                  startDateTime: preQueryDate,
                  endDateTime: new Date(),
                  requestUri: requestConfig.uri,
                  requestHeaders: requestConfig.headers,
                  responseStatusCode: response && response.hasOwnProperty('statusCode') ? response.statusCode : null,
                  responseError: error,
                  responseBodyReturned: returnedCount
              }
          }));
        }
    },
    /**
     *
     * @param requestConfig
     * @param error
     * @param response
     * @param body
     * @param preQueryDate
     */
    logBigGetRequest: function (requestConfig, error, response, body, preQueryDate) {
        "use strict";
        this.logBigRequest(requestConfig, LOG_METHOD_MONGO_GET, error, response, body, preQueryDate);
    },
    /**
     * Log GET requests
     * @param requestConfig
     * @param error
     * @param response
     * @param body
     * @param preQueryDate
     */
    logGetRequest: function (requestConfig, error, response, body, preQueryDate) {
        "use strict";
        this.logRequest(requestConfig, LOG_METHOD_MONGO_GET, error, response, body, preQueryDate);
    },
    /**
     * Log POST requests
     * @param requestConfig
     * @param error
     * @param response
     * @param body
     * @param preQueryDate
     */
    logPostRequest: function (requestConfig, error, response, body, preQueryDate) {
        "use strict";
        this.logRequest(requestConfig, LOG_METHOD_MONGO_POST, error, response, body, preQueryDate);
    },
    /**
     * Log Patch requests
     * @param requestConfig
     * @param error
     * @param response
     * @param body
     * @param preQueryDate
     */
    logPatchRequest: function (requestConfig, error, response, body, preQueryDate) {
        "use strict";
        this.logRequest(requestConfig, LOG_METHOD_MONGO_PATCH, error, response, body, preQueryDate);
    },
    /**
     * Log Put requests
     * @param requestConfig
     * @param error
     * @param response
     * @param body
     * @param prePutDate
     */
    logPutRequest: function (requestConfig, error, response, body, prePutDate) {
        "use strict";
        this.logRequest(requestConfig, LOG_METHOD_MONGO_PUT, error, response, body, prePutDate);
    },
    /**
     * Log Mongo warning
     * @param requestConfig
     * @param error
     */
    logWarning: function(requestConfig, error) {
        "use strict";
        lambdaLogger.prototype.logWarning(
            LOG_TYPE_MONGO,
            'LAMBDA_WARNING: Error DB "' + requestConfig.uri + '" request',
            error
        );
    }
};

lambdaLogger.prototype.mongo = mongoLogger;

/** -------- COGNITO SECTION ------------ */

/**
 * COGNITO logger
 * @type {{logRequest: cognitoLogger.logRequest, logGetId: cognitoLogger.logGetId, logGetOpenId: cognitoLogger.logGetOpenId, logGetCredentials: cognitoLogger.logGetCredentials, logWarning: cognitoLogger.logWarning}}
 */
var cognitoLogger = {
    /**
     * Cognito log request
     * @param cognito_method
     * @param cognitoParameters
     * @param error
     * @param response
     * @param preCognitoDate
     */
    logRequest: function(cognito_method, cognitoParameters, error, response, preCognitoDate) {
        "use strict";
        if (lambdaLogger.prototype.logLevel == 'verbose' ||
            (lambdaLogger.prototype.logLevel == 'error' && error)) {
          console.log(JSON.stringify({
              callData: {
                  type: LOG_TYPE_COGNITO,
                  method: cognito_method,
                  startDateTime: preCognitoDate,
                  endDateTime: new Date(),
                  cognitoParameters: cognitoParameters,
                  cognitoError: error,
                  cogniroResponse: response
              }
          }));
        }
    },
    /**
     * Log "logGetId" request
     * @param cognitoParameters
     * @param error
     * @param response
     * @param preCognitoDate
     */
    logGetId: function(cognitoParameters, error, response, preCognitoDate) {
        this.logRequest(LOG_METHOD_COGNITO_GET_ID, cognitoParameters, error, response, preCognitoDate);
    },

    /**
     * Log "getOpenIdTokenForDeveloperIdentity" request
     * @param cognitoParameters
     * @param error
     * @param response
     * @param preCognitoDate
     */
    logGetOpenId: function(cognitoParameters, error, response, preCognitoDate) {
        this.logRequest(LOG_METHOD_COGNITO_GET_OPENID, cognitoParameters, error, response, preCognitoDate);
    },

    /**
     * Log "getCredentialsForIdentity" request
     * @param cognitoParameters
     * @param error
     * @param response
     * @param preCognitoDate
     */
    logGetCredentials: function(cognitoParameters, error, response, preCognitoDate) {
        this.logRequest(LOG_METHOD_COGNITO_GET_CREDENTIALS, cognitoParameters, error, response, preCognitoDate);
    },

    /**
     * Log COGNITO warning
     * @param cognitoParameters
     * @param error
     */
    logWarning: function(cognitoParameters, error) {
        "use strict";
        lambdaLogger.prototype.logWarning(
            LOG_TYPE_COGNITO,
            'LAMBDA_WARNING: COGNITO Error',
            error
        );
    }
};


lambdaLogger.prototype.cognito = cognitoLogger;


/** -------- PubNub SECTION ------------ */
/**
 *
 * @type {{logRequest: pubNubLogger.logRequest, logPublishCallBack: pubNubLogger.logPublishCallBack, logPublishError: pubNubLogger.logPublishError, logWarning: pubNubLogger.logWarning}}
 */
var pubNubLogger = {

    /**
     *
     * @param channel
     * @param message
     * @param method
     * @param error
     * @param result
     * @param prePubNubDate
     */
    logRequest: function(channel, message, method, error, result, prePubNubDate) {
        "use strict";
        if (lambdaLogger.prototype.logLevel == 'verbose' ||
            (lambdaLogger.prototype.logLevel == 'error' && error)) {
          console.log(JSON.stringify({
              callData: {
                  type: LOG_TYPE_PUBNUB,
                  method: method,
                  startDateTime: prePubNubDate,
                  endDateTime: new Date(),
                  channel: channel,
                  message: message,
                  status: (error ? 'error' : 'success'),
                  pubnubError: error || null,
                  pubnubResponse: result || null
              }
          }));
        }
    },

    /**
     *
     * @param channel
     * @param message
     * @param result
     * @param prePubNubDate
     */
    logPublishCallBack: function(channel, message, result, prePubNubDate) {
        this.logRequest(channel, message, 'publish', null, result, prePubNubDate);
    },

    /**
     *
     * @param channel
     * @param message
     * @param error
     * @param prePubNubDate
     */
    logPublishError: function(channel, message, error, prePubNubDate) {
        this.logRequest(channel, message, 'publish', error, null, prePubNubDate);
    },

    /**
     *
     * @param channel
     * @param error
     */
    logWarning: function(channel, error) {
        "use strict";
        lambdaLogger.prototype.logWarning(
            LOG_TYPE_PUBNUB,
            'LAMBDA_WARNING: pubNub Error "' + channel + '"',
            error
        );
    }
};

lambdaLogger.prototype.pubnub = pubNubLogger;


/** -------- SES SECTION ------------ */
/**
 *
 * @type {{logRequest: sesLogger.logRequest, logSendEmail: sesLogger.logSendEmail, logWarning: sesLogger.logWarning}}
 */
var sesLogger = {
    /**
     *
     * @param sesMessage
     * @param method
     * @param error
     * @param data
     * @param preSESDate
     */
    logRequest: function(sesMessage, method, error, data, preSESDate) {
        "use strict";
        if (lambdaLogger.prototype.logLevel == 'verbose' ||
            (lambdaLogger.prototype.logLevel == 'error' && error)) {
          console.log(JSON.stringify({
              callData: {
                  type: LOG_TYPE_SES,
                  method: method,
                  startDateTime: preSESDate,
                  endDateTime: new Date(),
                  sesMessage: sesMessage,
                  sesError: error,
                  sesResponse: data
              }
          }));
        }
    },
    /**
     *
     * @param sesMessage
     * @param error
     * @param data
     * @param preSESDate
     */
    logSendEmail: function (sesMessage, error, data, preSESDate) {
        this.logRequest(sesMessage, 'sendEmail', error, data, preSESDate);
    },

    /**
     * Log SES warning
     * @param sesMessage
     * @param error
     */
    logWarning: function(sesMessage, error) {
        "use strict";
        lambdaLogger.prototype.logWarning(
            LOG_TYPE_SES,
            'LAMBDA_WARNING: Error sending SES "' + sesMessage.Message.Subject + '" message',
            error
        );
    }
};


lambdaLogger.prototype.ses = sesLogger;


/** -------- S3 SECTION ------------ */
/**
 *
 * @type {{logRequest: s3Logger.logRequest, logGetObject: s3Logger.logGetObject, logWarning: s3Logger.logWarning}}
 */
var s3Logger = {
    /**
     *
     * @param s3Params
     * @param method
     * @param error
     * @param data
     * @param preS3Date
     */
    logRequest: function(s3Params, method, error, data, preS3Date) {
        "use strict";
        if (lambdaLogger.prototype.logLevel == 'verbose' ||
            (lambdaLogger.prototype.logLevel == 'error' && error)) {
          console.log(JSON.stringify({
              callData: {
                  type: LOG_TYPE_S3,
                  method: method,
                  startDateTime: preS3Date,
                  endDateTime: new Date(),
                  s3Params: s3Params,
                  s3Error: error,
                  s3Response: data
              }
          }));
        }
    },
    /**
     * logGetObject
     * @param s3Params
     * @param error
     * @param data
     * @param preS3Date
     */
    logGetObject: function (s3Params, error, data, preS3Date) {
        this.logRequest(s3Params, 'getObject', error, data, preS3Date);
    },

    /**
     * Log S3 warning
     * @param s3Params
     * @param error
     */
    logWarning: function(s3Params, error) {
        "use strict";
        lambdaLogger.prototype.logWarning(
            LOG_TYPE_S3,
            'LAMBDA_WARNING: Error S3 "' + s3Params.Bucket + '" bucket',
            error
        );
    }
};

lambdaLogger.prototype.s3 = s3Logger;

/** -------- CONST SECTION ------------ */
var constantsObject = Object.freeze({
    LOG_TYPE_AWS: LOG_TYPE_AWS,
    LOG_TYPE_MONGO: LOG_TYPE_MONGO,
    LOG_TYPE_LAMBDA: LOG_TYPE_LAMBDA,
    LOG_TYPE_SNS: LOG_TYPE_SNS,
    LOG_TYPE_COGNITO: LOG_TYPE_COGNITO,
    LOG_TYPE_PUBNUB: LOG_TYPE_PUBNUB,
    LOG_TYPE_SES: LOG_TYPE_SES,
    LOG_TYPE_S3: LOG_TYPE_S3
});

/**
 *
 * @type {Object}
 */
lambdaLogger.prototype.constants = constantsObject;


/**
 * Useful utils
 * @type {{buildQueryString: utils.buildQueryString, objectsMerge: utils.objectsMerge, escapeRegExp: utils.escapeRegExp}}
 */
var utils = {

    /**
     * Build query string for restHeart request from object
     *
     * @param inObject
     * @returns {string}
     * @private
     */
    buildQueryString: function (inObject) {
        "use strict";
        var queryString = '';
        if (inObject.constructor === Object && Object.keys(inObject).length > 0) {
            for (var index in inObject) {
                if (inObject[index].constructor === Object) {
                    if (Object.keys(inObject[index]).length > 0) {
                        queryString += index + '=' + JSON.stringify(inObject[index]) + '&';
                    }
                } else if (inObject[index] instanceof Array && inObject[index].length > 0) {
                    inObject[index].forEach(function (elem) {
                        queryString += index + '=' + elem.toString() + '&';
                    });
                } else if (typeof inObject[index] === 'string' && inObject[index].length > 0) {
                    queryString += index + '=' + inObject[index].toString().trim() + '&';
                } else {
                    queryString += index + '=' + inObject[index] + '&';
                }
            }
        }
        return queryString;
    },

    /**
     * Merge several objects by keys
     *
     * @param target
     * @returns {*}
     * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
     */
    objectsMerge: function(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert first argument to object');
        }

        var to = Object(target);
        for (var i = 1; i < arguments.length; i++) {
            var nextSource = arguments[i];
            if (nextSource === undefined || nextSource === null) {
                continue;
            }
            nextSource = Object(nextSource);

            var keysArray = Object.keys(nextSource);
            for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                var nextKey = keysArray[nextIndex];
                var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                if (desc !== undefined && desc.enumerable) {
                    if (to[nextKey] !== undefined && to[nextKey] instanceof Array && nextSource[nextKey] instanceof Array) {
                        for(var ikey in nextSource[nextKey]) {
                            to[nextKey].push(nextSource[nextKey][ikey]);
                        }
                    } else {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    },

    /**
     * Escape string for restHeart $regex queries
     * @param string
     * @returns {string}
     */
    escapeRegExp: function (string){
        // return encodeURIComponent(string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"));
        return encodeURIComponent(string);
    }

};

lambdaLogger.prototype.utils = utils;


module.exports = lambdaLogger;
