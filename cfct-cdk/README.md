# Disclaimer
This directory houses a large, complex, enterprise-grade tool. It requires a lot of explanation that can get quite verbose. I have supplemented this material with visual artifacts where possible, but it is still wordy. Additionally, unlike my other portfolio items, there will be no hosted UI that you can go to in order to interact with this tool. You'll see why shortly.

# Introduction and Background
## Customizations for Control Tower
I've been a DevSecOps engineer a few times. A significant portion of your job as a DevSecOps engineer is focused on automating things. CI/CD pipelines, account provisioning, OS hardening, account inflation, etc all need to be automated at large organizations or everything falls apart.<br /><br />

One incredibly useful tool developed by AWS is called [Customizations for Control Tower](https://aws.amazon.com/solutions/implementations/customizations-for-aws-control-tower/) (CfCT). This is a complex system with lots of features, but at it's heart it's a tool for deploying a set of CloudFormation templates throughout an organization (or a subset of that organization). It integrates tightly with Control Tower and utilizes the existing structure of your AWS Organization to target your various environments. This is very useful for establishing and maintaining a bit of fundamental control of an environment, which is a common need for large organizations especially. You need a service role deployed to all accounts? stick it in CfCT. You need a standard set of AWS Config rules deployed to your workload accounts? Stick it in CfCT. You need to automatically onboard all accounts to an east-west network solution? Why, stick it in CfCT! You get the picture.<br /><br />

CfCT has one major flaw, though. It can _only_ deploy SCPs and CloudFormation templates. For a lot of use organizations, this is okay. Lots of workloads lend themselves very well to being built natively as a CFT or being synthesized from another system into CFT. The problem surfaces when you need complex logic in your deployment templates or you want to dynamically build packages or... so on and so forth. The normal way to solve this issue when deploying typical workloads is to use CDK. It's powerful, extensible, and AWS-supported. With CfCT, though, this is not an option. As stated before, CfCT _only_ supports the deployment of SCPs and CloudFormation templates. You can, of course, build a CDK project into a CFT and integrate the CFT into CfCT, but this has its shortcomings. This is the fundamental problem solved by this tool.

## Enter CfCT-CDK
CfCT-CDK is what I've dubbed my solution to this problem. Basically, it's like standard CfCT, but it can deploy CDK projects and supports all the bells and whistles that come with CDK support. It borrows the philosophy and spirit of CfCT, but adds a CDK deployment mechanism in the mix.

# Architecture
CfCT-CDK looks very similar to CfCT from the outside. After all, that was the goal. CfCT is a wonderful and proven tool. If you're familiar with CfCT, then CfCT-CDK should feel like home. In an effort to have a full description of the tool here, I will describe the entire solution, even if some of that functionality came from AWS. If you're already familiar with CfCT and its architecture, feel free to skip to the [differences](#differences-from-cfct) section.

## Differences from CfCT