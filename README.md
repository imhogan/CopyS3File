# CopyS3File

Node.js Lambda backed AWS CLoudFormation Custom Resource to copy an S3 file.

When deploying an AWS stack with CloudFormation, it can be helpful to copy a particular configuration file, eg perhaps you have
dev, uat and prod versions of a config file, to a target file. The following CloudFormation template demonstrates this:
  
  https://s3-ap-northeast-1.amazonaws.com/au-com-thinkronicity-opencode-apne1/au-com-thinkronicity-CopyS3File-Sample.template
  
  This template loads the code from a bucket in the AWS region the Stack is being deployed in. 
  
  These buckets are readable by any AWS account.
  
 Ian.Hogan@THINKronicity.com.au