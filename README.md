# CopyS3File

Node.js Lambda backed AWS CloudFormation Custom Resource to copy an S3 file.

When deploying an AWS stack with CloudFormation, it can be helpful to copy a particular configuration file, eg perhaps you have
dev, uat and prod versions of a config file, to a target file. The following CloudFormation template demonstrates this:
  
  https://s3-ap-southeast-2.amazonaws.com/au-com-thinkronicity-opencode-apse2/au-com-thinkronicity-CopyS3File-Sample-V1.0.0.template
  
  This template loads the code from a bucket in the AWS region the Stack is being deployed in. 
  
  These buckets are readable by any AWS account.
  
  See https://github.com/imhogan/CopyS3File for source code.
  
# Note

This is now deprecated - use the more general tool at https://github.com/imhogan/PutS3File as this can not only copy an S3 file but also
write data from a CloudFormation template to an S3 file.
 