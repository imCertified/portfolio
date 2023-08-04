import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as r53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';
import * as pythonLda from '@aws-cdk/aws-lambda-python-alpha';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import ReactDeployment from './react-deployment';
import { Source } from 'aws-cdk-lib/aws-s3-deployment';


export class PortfolioLinktreeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const parentDomain = 'portfolio.mannyserrano.com';
    const subdomain = `linktree.${parentDomain}`
    const apiDomain = `api.${subdomain}`
    const authDomain = `auth.${subdomain}`

    const portfolioHostedZone = r53.HostedZone.fromLookup(this, 'PorfolioHostedZone', {
      domainName: parentDomain
    });

    const table = new ddb.Table(this, 'LinktreeTable', {
      tableName: 'LinkTable',
      partitionKey: {
        name: 'pk',
        type: ddb.AttributeType.STRING
      },
      sortKey: {
        name: 'sk',
        type: ddb.AttributeType.STRING
      },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST
    });
    table.addGlobalSecondaryIndex({
      indexName: 'ClickIndex',
      partitionKey: {
        name: 'gsi1pk',
        type: ddb.AttributeType.STRING
      },
      sortKey: {
        name: 'sk',
        type: ddb.AttributeType.STRING
      },
      projectionType: ddb.ProjectionType.INCLUDE,
      nonKeyAttributes: [
        'clickTime'
      ]
    })
    
    const userPoolIdImport = cdk.Fn.importValue('PortfolioMasterPoolId');
    const userPool = cognito.UserPool.fromUserPoolId(this, 'MasterUserPool', userPoolIdImport.toString());

    new cognito.UserPoolClient(this, 'WebappClient',
    {
      userPool: userPool,
      userPoolClientName: `linktree-webapp`,
      oAuth: {
        callbackUrls: ['https://google.com', 'http://localhost:5173', 'https://oauth.pstmn.io/v1/callback'],
        scopes: [
          {
            scopeName: 'phone'
          },
          {
            scopeName: 'email'
          },
          {
            scopeName: 'openid'
          },
          {
            scopeName: 'profile'
          },
          {
            scopeName: 'aws.cognito.signin.user.admin'
          }
        ],
        flows: {
          implicitCodeGrant: true,
          authorizationCodeGrant: false,
          clientCredentials: false
        }
      },
      supportedIdentityProviders: [
        {
          name: 'COGNITO'
        }
      ],
      generateSecret: false,
      preventUserExistenceErrors: true      
    });

    const utilityLayer = new pythonLda.PythonLayerVersion(this, 'UtilityLayer', {
      layerVersionName: 'LinktreeUtilsLayer',
      entry: 'lib/lambda/utils',
      compatibleRuntimes: [lda.Runtime.PYTHON_3_9, lda.Runtime.PYTHON_3_10],
      compatibleArchitectures: [lda.Architecture.X86_64]
    });

    const domainLayer = new pythonLda.PythonLayerVersion(this, 'DomainLayer', {
      layerVersionName: 'LinktreeDomainLayer',
      entry: 'lib/lambda/domain_layer',
      compatibleRuntimes: [lda.Runtime.PYTHON_3_9, lda.Runtime.PYTHON_3_10],
      compatibleArchitectures: [lda.Architecture.X86_64]
    });

    // Base role assigned to each Lambda function
    const lambdaExecutionRole = new iam.Role(this, 'LambdaExecutionRole', {
      roleName: 'LinktreeBaseReadRole',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromManagedPolicyArn(this, 'LambdaBasicExecutionRole' ,'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole')
      ],
      inlinePolicies: {
        'ReadDDB': new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'dynamodb:Query',
                'dynamodb:GetItem',
              ],
              resources: [
                table.tableArn,
                `${table.tableArn}/index/*`
              ]
            })
          ]
        })
      }
    });

    // Tenant-aware role that allows lambdaExecutionRole to assume it
    const writeRole = new iam.Role(this, 'WriteRoleWithContext', {
      roleName: 'LinktreeTenantContextWriteRole',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        'WriteAccessPolicy': new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:GetItem',
                'dynamodb:Query',
                'dynamodb:DeleteItem'
              ],
              conditions: {
                'ForAllValues:StringEquals': {
                  'dynamodb:LeadingKeys': [
                    '${aws:PrincipalTag/username}'
                  ]
                }
              },
              resources: [
                table.tableArn,
                `${table.tableArn}/index/*`
              ]
            })
          ]
        })
      }
    });

    // Retroactively allow base lambda role to assume the context-aware role
    lambdaExecutionRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['sts:AssumeRole'],
      resources: [writeRole.roleArn]
    }))

    // CREATE LINK //
    const createLinkFunction = new pythonLda.PythonFunction(this, 'CreateLinkFunction', {
      functionName: 'LinktreeCreateLink',
      role: lambdaExecutionRole,
      entry: 'lib/lambda/link/create_link',
      layers: [utilityLayer, domainLayer],
      index: 'app.py',
      runtime: lda.Runtime.PYTHON_3_10,
      architecture: lda.Architecture.X86_64,
      handler: 'lambda_handler',
      environment: {
        TABLE_NAME: table.tableName,
        WRITE_ROLE_ARN: writeRole.roleArn
      }
    });

    // DELETE LINK //
    const deleteLinkFunction = new pythonLda.PythonFunction(this, 'DeleteLinkFunction', {
      functionName: 'LinktreeDeleteLink',
      role: lambdaExecutionRole,
      entry: 'lib/lambda/link/delete_link',
      layers: [utilityLayer, domainLayer],
      index: 'app.py',
      runtime: lda.Runtime.PYTHON_3_10,
      architecture: lda.Architecture.X86_64,
      handler: 'lambda_handler',
      environment: {
        TABLE_NAME: table.tableName,
        WRITE_ROLE_ARN: writeRole.roleArn
      }
    });

    // GET LINKS //
    const getLinksFunction = new pythonLda.PythonFunction(this, 'GetLinksFunction', {
      functionName: 'LinktreeGetLinks',
      role: lambdaExecutionRole,
      entry: 'lib/lambda/link/get_links',
      layers: [utilityLayer, domainLayer],
      index: 'app.py',
      runtime: lda.Runtime.PYTHON_3_10,
      architecture: lda.Architecture.X86_64,
      handler: 'lambda_handler',
      environment: {
        TABLE_NAME: table.tableName
      }
    });

    // REDIRECT //
    const redirectFunction = new pythonLda.PythonFunction(this, 'RedirectFunction', {
      functionName: 'LinktreeRedirect',
      role: lambdaExecutionRole,
      entry: 'lib/lambda/redirect',
      layers: [utilityLayer, domainLayer],
      index: 'app.py',
      runtime: lda.Runtime.PYTHON_3_10,
      architecture: lda.Architecture.X86_64,
      handler: 'lambda_handler',
      environment: {
        TABLE_NAME: table.tableName,
        WRITE_ROLE_ARN: writeRole.roleArn
      }
    })

    // API GATEWAY //
    const apiCert = new acm.Certificate(this, 'APICertificate',
    {
      domainName: apiDomain,
      validation: acm.CertificateValidation.fromDns(portfolioHostedZone)
    });

    // Grant all write functions access to assume writeRole with username context
    writeRole.assumeRolePolicy?.addStatements(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['sts:AssumeRole'],
      principals: [
        lambdaExecutionRole
      ]
    }));
    writeRole.assumeRolePolicy?.addStatements(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['sts:TagSession'],
      principals: [
        lambdaExecutionRole
      ],
      conditions: {
        'StringLike': {
          'aws:RequestTag/username': '*'
        }
      }
    }));

    const api = new apigw.RestApi(this, 'RestAPI', {
      restApiName: 'LinktreeAPI',
      deploy: true,
      cloudWatchRole: true,
      domainName: {
        domainName: apiDomain,
        certificate: apiCert
      },
      disableExecuteApiEndpoint: true
    });
    new r53.ARecord(this, 'APIRecord',
    {
      recordName: apiDomain,
      zone: portfolioHostedZone,
      target: r53.RecordTarget.fromAlias(new targets.ApiGateway(api))
    });
    const cognitoAuthorizer = new apigw.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      authorizerName: 'CognitoAuthorizer',
      cognitoUserPools: [userPool],
      identitySource: 'method.request.header.Authorization'
    })

    const linksPath = api.root.addResource('links');
    linksPath.addCorsPreflight({
      allowOrigins: ['*'],
      allowHeaders: ['*'],
      allowMethods: ['GET']
    });
    linksPath.addMethod('GET', new apigw.LambdaIntegration(getLinksFunction), {
      requestParameters: {
        'method.request.querystring.user': true
      }
    });
    linksPath.addMethod('PUT', new apigw.LambdaIntegration(createLinkFunction), {
      authorizer: cognitoAuthorizer
    });
    const linkProxyPath = linksPath.addResource('{link}');
    linkProxyPath.addCorsPreflight({
      allowOrigins: ['*'],
      allowHeaders: ['*'],
      allowMethods: ['GET']
    });
    linkProxyPath.addMethod('DELETE', new apigw.LambdaIntegration(deleteLinkFunction), {
      authorizer: cognitoAuthorizer
    });

    const redirectPath = api.root.addResource('redirect');
    redirectPath.addMethod('GET', new apigw.LambdaIntegration(redirectFunction), {
      requestParameters: {
        'method.request.querystring.user': true,
        'method.request.querystring.linkId': true
      }
    })

    // WEBAPP //
    const reactCert = new acm.Certificate(this, 'ReactCertificate',
    {
      domainName: subdomain,
      validation: acm.CertificateValidation.fromDns(portfolioHostedZone)
    });

    const frontedBucket = new CloudFrontToS3(this, 'FrontedBucket', {
      bucketProps: {
        bucketName: subdomain
      },
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
      expiration: cdk.Duration.days(3)
    });

    new ReactDeployment(this, 'ReactDeployment',
    {
      destinationBucket: frontedBucket.s3BucketInterface,
      sources: [Source.asset('./linktree-webapp/dist')],
      reactPath: './linktree-webapp/'
    });

    new r53.CnameRecord(this, 'CNameRecord',
    {
      recordName: subdomain,
      zone: portfolioHostedZone,
      domainName: frontedBucket.cloudFrontWebDistribution.distributionDomainName
    });
  }
}
