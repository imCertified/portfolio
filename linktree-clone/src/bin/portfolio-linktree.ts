#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PortfolioLinktreeStack } from '../lib/portfolio-linktree-stack';

const app = new cdk.App();
new PortfolioLinktreeStack(app, 'LinktreeStack', {
  env: { account: process.env.LINKTREE_ACCOUNT, region: 'us-east-1'}
});