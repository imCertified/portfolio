#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PrintMeStack } from '../lib/printme-stack';

const app = new cdk.App();
new PrintMeStack(app, 'PrintMeStack', {
  env: { account: process.env.PRINTME_ACCOUNT, region: 'us-east-1'}
});