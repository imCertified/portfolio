from json import loads, JSONDecodeError
from boto3 import Session

class NonExistentValueError(Exception):
    pass

class ParseError(Exception):
    pass


def get_query_param(req: dict, param: str):
    '''
    Looks for a given query param in an APIGW payload. Raises NonExistentValueError if the value doesn't exist

    Parameters:
        req (dict): The API GW payload
        param (dict): The query parameter to search for

    Returns:
        value (str): The value of the query parameter in the payload
    '''
    print(f'Getting query param {param} from request')
    try:
        if 'queryStringParameters' in req.keys() and param in req['queryStringParameters'].keys():
            print(f'Query param {param} found')
            return req['queryStringParameters'][param]
        else:
            raise NonExistentValueError
    except (KeyError, AttributeError):
        print(f'Could not found queryStringParameters or param: {param}')
        raise NonExistentValueError
        

def get_path_param(req: dict, param: str):
    '''
    Looks for a given query param in an APIGW payload. Raises NonExistentValueError if the value doesn't exist

    Parameters:
        req (dict): The API GW payload
        param (dict): The path parameter to search for

    Returns:
        value (str): The value of the path parameter in the payload
    '''

    print(f'Getting path param {param} from request')
    try:
        if 'pathParameters' in req.keys() and param in req['pathParameters'].keys():
            print(f'Path param {param} found')
            return req['pathParameters'][param]           
    except NonExistentValueError:
        print(f'Cannot find pathParameters or param {param} in request')
        return None


def get_body_param(event: dict, key: str, parser: callable = None):
    '''
    Looks for a given key in the body in an APIGW payload.
    Raises NonExistentValueError if the value doesn't exist.
    Raises ParseError if parser is provided and throws and error during parsing.

    Parameters:
        req (dict): The API GW payload
        key (str): The Key to look for in the request body
        parser (callable): Optional: A function which should be called with the retrieved param as a parameter
    
    Returns:
        value: The retrieved value from the body, parsed via the parser if provided

    '''
    try:
        body = loads(event['body'])
    except (KeyError, TypeError, JSONDecodeError):  # This would never ever happen when being called from APIGW, but just in case
        raise NonExistentValueError

    if key in body.keys():
        # Validate with callable if provided
        if parser:
            try:
                return parser(body[key])
            except:
                raise ParseError
        else:
            return body[key]
    else:
        print(f'Key {key} not found in event body')
        raise NonExistentValueError
    

def assume_with_context(sts, role_arn: str, username: str):
    '''
    Assumes the provided role_arn with the provided context to set permission boundaries

    Parameters:
        sts: sts boto3 client
        role_arn (str): The ARN of the role to assume
        username (str): The username to inject into the context

    Returns:
        session (Session): A boto3 session with the appropriate assumption and context applied
    '''

    assume_role_response = sts.assume_role(
        RoleArn=role_arn,
        DurationSeconds=900,
        RoleSessionName=f'ContextAwareSession-{username}',
        Tags=[
            {
                'Key': 'username',
                'Value': username.lower()
            }
        ]
    )
    session = Session(aws_access_key_id=assume_role_response['Credentials']['AccessKeyId'],
                    aws_secret_access_key=assume_role_response['Credentials']['SecretAccessKey'],
                    aws_session_token=assume_role_response['Credentials']['SessionToken'])
    return session