# CopyS3File
Node.js Lambda backed AWS CLoudFormation Custom Resource to copy an S3 file.

When deploying an AWS stack with CloudFormation, it can be helpful to copy a particular configuration file, eg perhaps you have
dev, uat and prod versions of a config file, to a target file. The following sample CloudFormation snippet demonstrates this.

{
    "AWSTemplateFormatVersion": "2010-09-09",
    "Description": "Demonstrate CopyS3File custom resource - built by THINKronicity Pty Ltd.",
    "Parameters": {
        "S3CopyFileKey": {
            "Description": "Zip file for S3 Copy File function",
            "Type": "String",
            "Default": "au-com-thinkronicity-CopyS3File-V1.0.zip"
        },
        "S3Bucket": {
            "Description": "Bucket for configuration file",
            "Type": "String",
            "Default": "some-bucket-name"
        },
        "S3Key": {
            "Description": "Key for configuration file",
            "Type": "String",
            "Default": "some/key/path"
        },
        "TargetEnvironment": {
          "Description": "Target environment - dev, uat or prod, default is dev",
          "Type": "String",
          "AllowedValues": [
            "dev",
            "uat",
            "prod"
          ],
          "Default": "dev"
        },
    },
    "Mappings": {"AWSRegion2Bucket": {
        "us-east-1": {
            "OpenCode": "au-com-thinkronicity-opencode-usea1",
            "ClientCode": "au-com-thinkronicity-clientcode-apne1"
        },
        "us-west-2": {
            "OpenCode": "au-com-thinkronicity-opencode-uswe2",
            "ClientCode": "au-com-thinkronicity-clientcode-apne1"
        },
        "eu-west-1": {
            "OpenCode": "au-com-thinkronicity-opencode-euwe1",
            "ClientCode": "au-com-thinkronicity-clientcode-apne1"
        },
        "ap-northeast-1": {
            "OpenCode": "au-com-thinkronicity-opencode-apne1",
            "ClientCode": "au-com-thinkronicity-clientcode-apne1"
        }
    }},
    "Resources": {
        "LambdaExecutionRole": {
            "Type": "AWS::IAM::Role",
            "Properties": {
                "AssumeRolePolicyDocument": {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {"Service": "lambda.amazonaws.com"},
                            "Action": "sts:AssumeRole"
                        }
                    ]
                },
                "Path": "/some/path",
                "Policies": [{
                    "PolicyName": "AccessProjectS3Files",
                    "PolicyDocument": {
                        "Version": "2012-10-17",
                        "Statement": [
                            {
                                "Effect": "Allow",
                                "Action": ["s3:*"],
                                "Resource": ["some bucket resource"]
                            },
                            {
                                "Effect": "Allow",
                                "Action": [
                                    "logs:CreateLogGroup",
                                    "logs:CreateLogStream",
                                    "logs:PutLogEvents"
                                ],
                                "Resource": "arn:aws:logs:*:*:*"
                            }
                        ]
                    }
                }]
            }
        },
        "THINKonicityS3CopyFileLambda": {
            "Type": "AWS::Lambda::Function",
            "Properties": {
                "Code": {
                    "S3Bucket": {"Fn::FindInMap": [
                        "AWSRegion2Bucket",
                        {"Ref": "AWS::Region"},
                        "OpenCode"
                    ]},
                    "S3Key": {"Ref": "S3CopyFileKey"}
                },
                "Runtime": "nodejs4.3",
                "Handler": "index.handler",
                "Timeout": "30",
                "Description": "CloudFormation S3 Zip Loader from THINKronicity.com.au",
                "MemorySize": 128,
                "Role": {"Fn::GetAtt": [
                    "LambdaExecutionRole",
                    "Arn"
                ]}
            }
        },
        "SetPropertiesForEnvironment": {
            "Type": "Custom::S3FileCopy",
            "DependsOn" : ["ProjectFilesLoad"],
            "Properties": {
                "ServiceToken": {"Fn::GetAtt": [
                    "THINKonicityS3CopyFileLambda",
                    "Arn"
                ]},
                "Source": {
                    "S3Url":  {"Fn::Join": [
                        "",
                        [
                            {"Ref": "S3Bucket"},
                            "/",
                            {"Ref": "S3Key"},
                            "-",
                            {"Ref": "TargetEnvironment"}
                        ]
                    ]}
                },
                "Target": {
                    "Bucket": {"Ref": "S3Bucket"},
                    "Key": {"Ref": "S3Key"}
                },
                "Debug": "true"
            }
        }
    },
    "Outputs": {
        "LambdaExecutionRoleArn": {"Value": {"Fn::GetAtt": [
            "LambdaExecutionRole",
            "Arn"
        ]}}
    }
}