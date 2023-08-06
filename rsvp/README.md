:warning: To see a live version of this project, click [here](https://linktree.portfolio.mannyserrano.com/katyperry) or [here]() or [here]().

# tl;dr
I built a basic webapp and backend that allows invitees to an event (in this case a wedding) to RSVP by scanning a personalized QR code attached to a physical invite or email. It uses React, API Gateway, Lambda, and DynamoDB all deployed by CDK. You can interact with a few examples at the links above. 

# Introduction
This project is an example of a basic RSVP website. However, as opposed to most RSVP solutions, the webapp is personalized for each person. Each invitee gets a unique URL that they can visit to RSVP. That URL can be disseminated to each invitee in whatever way the organizer chooses. I used this actual solution for my own wedding. We had generic invites printed with about 2 inches of blank space right in the center. Once we received the invites, we printed a QR code that mapped to each invitees URL for each invite on transparent stickers. Once each invitee received their invite, they scanned their QR code, answered the questions, and never had to text or call anyone throughout the process. Easy! We used stickers on physical invites, but this basic premise applies to any medium that can disseminate a URL directly or indirectly.

# Implementation
## Requirements
There were a few basic requirements I wanted to hit when I was originally building this for my own wedding, and here they are:
1. Each invitee's ability to add plus ones should be configurable per invitee
1. Each invitee's landing page should prominently display their name and the current state of their invitation
1. Invitees should be able to specify dietary restrictions on the RSVP
1. Invitees should be able to choose from the available meal options
1. Invitees should be able to specify the age group of their plus ones (child, non-drinking age adult, drinking-age adult)
1. Children should _not_ be able to choose from the available meal options (Kid's meal only. Sorry kids)
1. Invitees should be able to specify whether or not they are bringing a plus one (if applicable)
1. Aggregated and detailed reporting should be possible on the data, such as:
    1. Retrieve the number of invitees who have responded
    1. Retrieve aggregated number for invitees who have not responded, who responded as attending, and total number of responded including plus ones
    1. Retrieve the number of attending drinking-age invitees including plus ones
    1. Retrieve a CSV file detailing each invitee, their attending status, their requested meal, and dietary restrictions

## Architecture
My RSVP solution is a 3-tier serverless solution with a static webapp for the UI (React), API layer (API Gateway and Lambda) and a persistence layer (DynamoDB). There is no authentication needed for the invitees, and write authorization is handled exclusively by IAM. CloudFront is used to distribute the webapp, while an edge-optimized API Gateway endpoint is used to make the API available. There is no caching needed aside from the webapp as the data is unique to each person and should only be access once or twice throughout the life of an RSVP. 

## Data Model - UPDATE!!!!!!
The data model needed to be resilient enough to conform to somewhat strict security requirements, but also performant enough to allow for very fast retrieval of data via common access patterns. Far and away, the most common access pattern of this application would be to retrieve a set of links for a given user's tree. Also, the data needed to be constructed in such a way that common trees (like those for social media celebrities) could be cached at the edge. The data model I chose, while basic, supports all of this.<br /><br />

An example Link item is shown below. Note the `LINK#` prefix in the `sk` attribute. If you come from a SQL background or are unfamiliar with DynamoDB data modeling for relational data, then this may look foreign. If that's the case, I highly encourage a watch of [this](https://www.youtube.com/watch?v=yNOVamgIXGQ) talk by Alex Debrie or [this](https://www.youtube.com/watch?v=xfxBhvGpoa0) more advanced talk on the same subject from Rick Houlihan. The identifier portion of the sort key is a ULID, which is very much like a UUID, except by the nature of its construction it is natively URL-safe and natively chronologically-sortable. I use ULID by default for all identifiers where I would normally use a UUID for these reasons.
<img src='assets/example-link.PNG' alt='Example Link Object'><br /><br />

An example Click item is shown below. Note that, like the Link item, it also has a prefix to denote that this is a Click object stored alongside the Link objects under the same primary key. Note that the clickTime attribute is in ISO-8601 format, which makes it portable and chronologically-sortable like the ULID, which is perfect for time series data like this. This simple object structure unlocks tons of potential statistical methods.
<img src='assets/example-click.PNG' alt='Example Click Object'><br /><br />

The gsi1pk attribute supports global secondary index named ClickIndex, which asociates all Click items with a Link item, and thus enables the "Get all clicks for a specific link access pattern. If other access patterns were needed, this index could easily be overloaded with more context. However, there are no other access patterns in this project to address. This simple item structure combined with the ClickIndex provides tons potential analysis like A/B testing, affiliate relationships, etc.

## Authorization
The service uses a clever authorization mechanism that I'm very fond of in order to control write access to DynamoDB items. A full description of this mechanism can be found [here](NEEDS LINK). Essentially, upon each PUT, POST, or DELETE call, the Lambda function that serves the call gathers the authentication information appended to the payload and assumes an IAM role with the appropriate IAM context. The assumed role is then limited to DynamoDB attributes whose key matches the user's username. In effect, a given user is only allowed to execute write actions against resources that they own. This is a lightweight mechanism to enforce a basic access policy like this one that scales to an infinite number of users at constant time. If I had to implement a more complex access policy, I'd probably go with a vending machine.

# Deployment
The project is a TypeScript CDK project defined entirely within the `src/` directory. I've implemented a semi-custom CDK construct to handle the build and deployment of the React application into the hosting bucket during a CDK deployment. You can find the source to the webapp in `src/rsvp-webapp`. Please note again that I am not a frontend developer.

# Design Decision Log
All good projects have a decision log. Here is mine.<br /><br />
__Only serverless components will be used__
1. Most serverless components on AWS have the ability to scale to 0, which is desirable for a project that is deployed 24x7 for the purposes of this portfolio
1. With a serverful architecture, I'd have to constantly maintain servers and deal with patching. That's too much work for a portfolio item

__React will be used for the UI__  
1. React is the only frontend framework I can tolerate long-term development with, and it lets me sharpen my TypeSript skills
1. React is statically built, allowing it to be served by S3 and CloudFront without paying for a server

__DynamoDB will be used for state persistence__  
1. DynamoDB is cool :call_me_hand:
1. DynamoDB can be configured such that it has no RCU/WCU cost at idle with on-demand capacity provisioning. Aurora serverless can only do this in v1, and I don't like managing SQL connection cursors anyway
1. I'm ultra-familiar with data modeling on DynamoDB from some other projects
1. The data I'm storing, while relational, does not require any complex joins or business logic on the database
1. The data I'm storing lends itself well to a key-value model, which DynamoDB can deliver at lightning speed
1. Storage and R/W capacity is _cheap_

__CloudFront will be used for caching__
1. CloudFront is pretty much the go-to caching on AWS for a global audience
1. Can cache both S3 and API GW under one roof
1. Provisioning certs and using them for CloudFront is very easy

__The OAuth `sub` value will be used as a user identifier__
1. It's readily available at signup when the user first creates an account
1. It's unique
1. It's sufficiently long and random that it will avoid weird indexing issues in DynamoDB's engine
1. The `sub` value is not considered a secret and can be freely exchanged
1. It's provided to Lambda by APIGW on each request, making permissions scoping easy and fast