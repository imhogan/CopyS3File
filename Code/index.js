/**
 * A sample Lambda function that takes an AWS CloudFormation stack name
 * and returns the outputs from that stack. Make sure to include permissions
 * for `cloudformation:DescribeStacks` in your execution role!
 *
 * See http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/walkthrough-custom-resources-lambda-cross-stack-ref.html
 * for documentation on how to use this blueprint.
 */
console.log('Loading function');

var https = require('https');
var url = require('url');

// Sends a response to the pre-signed S3 URL
var sendResponse = function(event, context, responseStatus, responseData, physicalResourceId) {
    var responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: "See the details in CloudWatch Log Stream: " + context.logStreamName,
        PhysicalResourceId: physicalResourceId || context.logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData || {Result: "Empty Response"}
    });

    console.log('RESPONSE BODY:\n', responseBody);
    
    if (event.ResponseURL) {

        var parsedUrl = url.parse(event.ResponseURL);
        var options = {
            hostname: parsedUrl.hostname,
            port: 443,
            path: parsedUrl.path,
            method: 'PUT',
            headers: {
                'Content-Type': '',
                'Content-Length': responseBody.length
            }
        };
    
        var req = https.request(options, function(res) {
            console.log('STATUS:', res.statusCode);
            console.log('HEADERS:', JSON.stringify(res.headers));
            context.succeed('Successfully sent stack response!');
        });
    
        req.on('error', function(err) {
            console.log('sendResponse Error:\n', err);
            context.fail(err);
        });
    
        req.write(responseBody);
        req.end();
    }
    else {
        console.log('Warning - no ResponseURL in event!');
    }
};

exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));

    var responseData = {"_self_version": "1.0"};
    
    if (event.RequestType === 'Delete') {
        responseData.Result = 'Delete requires no action.';
        sendResponse(event, context, 'SUCCESS', responseData);
        return;
    }

    var source = event.ResourceProperties.Source;
    var target = event.ResourceProperties.Target;
    var responseStatus = 'FAILED';

    // Verifies that a stack name was passed
    try {
        var aws = require('aws-sdk'); 
        
        var s3 = new aws.S3(); 

        var params = {
          Bucket: target.Bucket, /* required */
          CopySource: source.S3Url, /* required */
          Key: target.Key /* required */
        };
        
        if (target.ACL) {
            params.ACL = target.ACL;
        }
        
        s3.copyObject(params, function(err, data) {
            if (err) {
                responseData.Error = 'CopyS3File call failed';
                console.log(responseData.Error + ":\n", err);
            } else {
                // Populates the return data with the outputs from the specified stack
                responseStatus = 'SUCCESS';
                responseData.Result = 'File '+source.S3Url+' copied to '+target.Bucket+'/'+target.Key;
            }
            sendResponse(event, context, responseStatus, responseData);
        });        
    } catch(ex) {
        responseData.Error = ex.name + ': ' + ex.message;
        console.log(responseData.Error);
        sendResponse(event, context, responseStatus, responseData);
    }
};