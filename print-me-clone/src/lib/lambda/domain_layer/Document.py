import datetime
from ulid import ULID
from Job import Job
from boto3.dynamodb.conditions import Key


class Document:
    def __init__(self, parent_job_id: str, document_id: str, friendly_name: str, status: str, ttl: datetime.datetime, s3_key: str = None):
        print('Creating Document object')

        # Mandatory
        self.parent_job_id = parent_job_id
        self.document_id = document_id
        self.friendly_name = friendly_name
        self.status = status
        self.ttl = ttl if type(ttl) == datetime.datetime else datetime.datetime.fromtimestamp(ttl)  # Marhsal into datetime if not already there

        # Optional
        self.s3_key = s3_key
    
    @classmethod
    def new(cls, parent_job_id: str, friendly_name: str):
        print('Creating new Job')
        return cls(
            parent_job_id=parent_job_id,
            document_id=str(ULID()),
            friendly_name=friendly_name,
            status='PROCESSING',
            ttl=datetime.datetime.now() + datetime.timedelta(days=7)
        )
    
    @classmethod
    def from_ddb(cls, rep: dict):
        print('Marshalling Document from DDB')

        params = {
            'parent_job_id': Job.id_from_pk(rep['sk']),
            'document_id': rep['pk'],
            'friendly_name': rep['friendly_name'],
            'status': rep['status'],
            'ttl': rep['ttl']
        }
        
        if 's3_key' in rep.keys():
            params['s3_key'] = rep['s3_key']

        return cls(
            **params
        )

    def create_in_table(self, table):
        print('Creating Document in table')
        table.put_item(
            Item=self.to_ddb()
        )
        return

    def get_ddb_key(self):
        return {
            'pk': Job.pk_from_id(self.parent_job_id),
            'sk': self.pk_from_id(self.document_id)
        }
    
    def to_ddb(self):
        ddb_rep =  {
            **self.get_ddb_key(),
            'friendly_name': self.friendly_name,
            'status': self.status,
            'ttl': str(int(self.ttl.timestamp()))
        }

        if self.s3_key:
            ddb_rep['s3_key'] = self.s3_key
        
        return ddb_rep

    @staticmethod
    def id_from_pk(pk: str):
        return pk.replace('DOC:', '')
    
    @staticmethod
    def pk_from_id(id: str):
        return f'DOC:{id}'