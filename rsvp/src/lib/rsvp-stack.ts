import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as r53 from 'aws-cdk-lib/aws-route53';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lda from 'aws-cdk-lib/aws-lambda';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as pythonLda from '@aws-cdk/aws-lambda-python-alpha';
import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';
import { Source } from 'aws-cdk-lib/aws-s3-deployment';
import ReactDeployment from './react-deployment';
import { Construct } from 'constructs';

export class RSVPStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const parentDomain = 'portfolio.mannyserrano.com'
    const subdomain = `rsvp.${parentDomain}`;
    const apiSubdomain = `api.${subdomain}`;

    const hostedZone = r53.HostedZone.fromLookup(this, 'PortfolioHostedZone', {
      domainName: parentDomain
    });

    const table = new ddb.Table(this, 'RSVPTable', {
      tableName: 'RSVPTable',
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'pk',
        type: ddb.AttributeType.STRING
      },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
    });

    const domainLayer = new pythonLda.PythonLayerVersion(this, 'DomainLayer', {
      layerVersionName: 'RSVPDomainLayer',
      entry: 'lib/lambda/domain_layer',
      compatibleArchitectures: [lda.Architecture.X86_64],
      compatibleRuntimes: [lda.Runtime.PYTHON_3_9]
    })

    const getInviteFunction = new pythonLda.PythonFunction(this, 'GetInviteFunction', {
      functionName: 'RSVPGetInviteFunction',
      entry: 'lib/lambda/get_invite',
      runtime: lda.Runtime.PYTHON_3_9,
      architecture: lda.Architecture.X86_64,
      index: 'app.py',
      handler: 'lambda_handler',
      environment: {
        'TABLE_NAME': table.tableName
      },
      layers: [domainLayer]
    })
    table.grantReadData(getInviteFunction);

    const respondInviteFunction = new pythonLda.PythonFunction(this, 'RespondInviteFunction', {
      functionName: 'RSVPRespondInviteFunction',
      entry: 'lib/lambda/respond_invite',
      runtime: lda.Runtime.PYTHON_3_9,
      architecture: lda.Architecture.X86_64,
      index: 'app.py',
      handler: 'lambda_handler',
      environment: {
        'TABLE_NAME': table.tableName
      },
      layers: [domainLayer]
    })
    table.grantReadWriteData(respondInviteFunction);

    const apiCert = new acm.Certificate(this, 'APICertificate',
    {
      domainName: apiSubdomain,
      validation: acm.CertificateValidation.fromDns(hostedZone)
    });

    const api = new apigw.RestApi(this, 'RSVPAPI', {
      restApiName: 'RSVPAPI',
      deploy: true,
      domainName: {
        domainName: apiSubdomain,
        certificate: apiCert
      },
      disableExecuteApiEndpoint: true
    });

    const invitePath = api.root.addResource('invite');
    invitePath.addCorsPreflight({
      allowOrigins: ['*'],
      allowHeaders: ['*'],
      allowMethods: ['GET', 'PUT']
    });
    const inviteProxyPath = invitePath.addResource('{inviteId}');
    inviteProxyPath.addCorsPreflight({
      allowOrigins: ['*'],
      allowHeaders: ['*'],
      allowMethods: ['GET', 'PUT']
    });
    inviteProxyPath.addMethod('GET', new apigw.LambdaIntegration(getInviteFunction));
    inviteProxyPath.addMethod('PUT', new apigw.LambdaIntegration(respondInviteFunction));
    new r53.ARecord(this, 'ARecord',
    {
      recordName: apiSubdomain,
      zone: hostedZone,
      target: r53.RecordTarget.fromAlias(new targets.ApiGateway(api))
    });

    const reactCert = new acm.Certificate(this, 'ReactCertificate',
    {
      domainName: subdomain,
      validation: acm.CertificateValidation.fromDns(hostedZone)
    });

    const frontedBucket = new CloudFrontToS3(this, 'FrontedBucket', {
      // bucketProps: {
      //   bucketName: subdomain
      // },
      cloudFrontDistributionProps: {
        certificate: reactCert,
        domainNames: [subdomain],
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: '/'
          }
        ]
      },
      logS3AccessLogs: false,
      insertHttpSecurityHeaders: false
    });
    frontedBucket.cloudFrontLoggingBucket?.addLifecycleRule({
      enabled: true,
      expiration: Duration.days(3)
    });

    new r53.ARecord(this, 'ApexRecord', {
      zone: hostedZone,
      recordName: subdomain,
      target: r53.RecordTarget.fromAlias(new targets.CloudFrontTarget(frontedBucket.cloudFrontWebDistribution))
    });

    new ReactDeployment(this, 'ReactDeployment',
    {
      reactPath: './rsvp-webapp/',
      destinationBucket: frontedBucket.s3BucketInterface,
      sources: [Source.asset('./rsvp-webapp/dist')]
    });
  }
}
