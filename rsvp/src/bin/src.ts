#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { RSVPStack } from '../lib/rsvp-stack';

const app = new cdk.App();
new RSVPStack(app, 'RSVPStack', {
    env: { account: process.env.RSVP_ACCOUNT, region: 'us-east-1'}
});
