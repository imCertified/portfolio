import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as r53 from 'aws-cdk-lib/aws-route53';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lda from 'aws-cdk-lib/aws-lambda';
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

    const domainLayer = new pythonLda.PythonLayerVersion(this, 'DomainLayer', {
      layerVersionName: 'RSVPDomainLayer',
      entry: 'lib/lambda/domain_layer',
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
      layers: [domainLayer]
    });
    table.grantWriteData(newJobFunction);


  }
}
