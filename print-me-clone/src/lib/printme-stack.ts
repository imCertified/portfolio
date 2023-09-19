import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as r53 from 'aws-cdk-lib/aws-route53';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as pythonLda from '@aws-cdk/aws-lambda-python-alpha';

export class PrintMeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const parentDomain = 'portfolio.mannyserrano.com'
    const subdomain = `printme.${parentDomain}`;
    const apiSubdomain = `api.${subdomain}`;

    const hostedZone = r53.HostedZone.fromLookup(this, 'PortfolioHostedZone', {
      domainName: parentDomain
    });

    const table = new ddb.Table(this, 'PrintMeTable', {
      tableName: 'PrintMeTable',
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'pk',
        type: ddb.AttributeType.STRING
      },
      sortKey: {
        name: 'sk',
        type: ddb.AttributeType.STRING
      },
      timeToLiveAttribute: 'ttl',
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
    });

    const docBucket =  new s3.Bucket(this, 'DocBucket', {
      bucketName: 'printme-doc-bucket',
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true
      },
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        {
          enabled: true,
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),  // No permission is granted to even initiate MPUs, but just to be safe
          expiration: cdk.Duration.days(7) // Matches the TTL of 7 days on DynamoDB objects
        }
      ]
    })

    const domainLayer = new pythonLda.PythonLayerVersion(this, 'DomainLayer', {
      layerVersionName: 'PrintMeDomainLayer',
      entry: 'lib/lambda/domain_layer',
      compatibleArchitectures: [lda.Architecture.X86_64],
      compatibleRuntimes: [lda.Runtime.PYTHON_3_9]
    });

    const utilityLayer = new pythonLda.PythonLayerVersion(this, 'UtilityLayer', {
      layerVersionName: 'PrintMeUtilitiesLayer',
      entry: 'lib/lambda/utility_layer',
      compatibleArchitectures: [lda.Architecture.X86_64],
      compatibleRuntimes: [lda.Runtime.PYTHON_3_9]
    });

    // const newJobFunctionJava = new lda.Function(this, 'NewJobFunctionJava', {
    //   code: lda.Code.fromAsset('lib/lambda/new_job_java'),
    //   handler: 'com.printme.app.App',
    //   runtime: lda.Runtime.JAVA_17,
    //   timeout: cdk.Duration.seconds(60)
    // });

    const newJobFunction = new pythonLda.PythonFunction(this, 'NewJobFunction', {
      functionName: 'PrintMeNewJobFunction',
      entry: 'lib/lambda/new_job',
      runtime: lda.Runtime.PYTHON_3_9,
      architecture: lda.Architecture.X86_64,
      index: 'app.py',
      handler: 'lambda_handler',
      environment: {
        'TABLE_NAME': table.tableName
      },
      layers: [domainLayer, utilityLayer]
    });
    table.grantWriteData(newJobFunction);

    const getUploadURLFunction = new pythonLda.PythonFunction(this, 'GetUploadURLFunction', {
      functionName: 'PrintMeGetUploadURLFunction',
      entry: 'lib/lambda/get_upload_url',
      runtime: lda.Runtime.PYTHON_3_9,
      architecture: lda.Architecture.X86_64,
      index: 'app.py',
      handler: 'lambda_handler',
      environment: {
        'TABLE_NAME': table.tableName,
        'DOC_BUCKET': docBucket.bucketName
      },
      layers: [domainLayer, utilityLayer]
    });
    table.grantWriteData(getUploadURLFunction);
    docBucket.grantPut(getUploadURLFunction);

    const apiCert = new acm.Certificate(this, 'APICertificate',
    {
      domainName: apiSubdomain,
      validation: acm.CertificateValidation.fromDns(hostedZone)
    });

    const api = new apigw.RestApi(this, 'RSVPAPI', {
      restApiName: 'PrintMeAPI',
      deploy: true,
      domainName: {
        domainName: apiSubdomain,
        certificate: apiCert
      },
      disableExecuteApiEndpoint: true
    });

    const jobPath = api.root.addResource('job');
    jobPath.addCorsPreflight({
      allowOrigins: ['*'],
      allowHeaders: ['*'],
      allowMethods: ['GET', 'POST']
    });
    jobPath.addMethod('POST', new apigw.LambdaIntegration(newJobFunction));
    const jobProxyPath = jobPath.addResource('{jobId}');
    const docPath = jobProxyPath.addResource('doc');
    
    const uploadPath = docPath.addResource('upload');
    uploadPath.addCorsPreflight({
      allowOrigins: ['*'],
      allowHeaders: ['*'],
      allowMethods: ['GET']
    });
    uploadPath.addMethod('POST', new apigw.LambdaIntegration(getUploadURLFunction))  // Path to get secure uploadURL
    const docProxyPath = docPath.addResource('{docPath}')
    // const jobProxyPath = jobPath.addResource('{inviteId}');
    // jobProxyPath.addCorsPreflight({
    //   allowOrigins: ['*'],
    //   allowHeaders: ['*'],
    //   allowMethods: ['GET', 'PUT']
    // });
    // jobProxyPath.addMethod('GET', new apigw.LambdaIntegration(getInviteFunction));
    // jobProxyPath.addMethod('PUT', new apigw.LambdaIntegration(respondInviteFunction));


  }
}
