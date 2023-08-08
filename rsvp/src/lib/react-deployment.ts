import { BucketDeployment, BucketDeploymentProps } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import { execSync } from 'node:child_process';

interface ReactDeploymentProps extends BucketDeploymentProps {
    /**
     * The path to the top level directory of your React application
     */
    readonly reactPath: string;
}

// TODO: Accept environment details to inject into environment before deployment
class ReactDeployment extends BucketDeployment {
    constructor(scope: Construct, id: string, props: ReactDeploymentProps) {
        console.log(execSync('npx vite build', {cwd: props.reactPath}).toString());
        super(scope, id, props);
    }
}

export default ReactDeployment;