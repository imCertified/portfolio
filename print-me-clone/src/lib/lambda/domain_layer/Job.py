import datetime
from ulid import ULID


class Job:
    def __init__(self, job_id: str, status: str, created_date: datetime.datetime, ttl: datetime.datetime, friendly_name: str = None, fulfilled_date: datetime.datetime = None):
        print('Creating Job object')

        # Required attributes
        self.job_id = job_id
        self.status = status
        self.created_date = created_date if type(created_date) == datetime.datetime else datetime.datetime.fromisoformat(created_date)  # Marhsal into datetime if not already there
        self.ttl = ttl if type(ttl) == datetime.datetime else datetime.datetime.fromtimestamp(ttl)  # Marhsal into datetime if not already there

        # Optional attributes
        self.friendly_name = friendly_name

        if fulfilled_date:
            self.fulfilled_date = fulfilled_date if type(fulfilled_date) == datetime.datetime else datetime.datetime.fromisoformat(fulfilled_date)  # Marhsal into datetime if not already there
        else:
            self.fulfilled_date = None
    
    @classmethod
    def new(cls, friendly_name = None):
        print('Creating new Job')
        return cls(
            job_id=str(ULID()),
            status='UNFULFILLED',
            created_date = datetime.datetime.now(),
            ttl = datetime.datetime.now() + datetime.timedelta(days=7),
            friendly_name = friendly_name
        )

    def create_in_table(self, table):
        print('Creating Job in table')
        table.put_item(
            Item=self.to_ddb()
        )
        return


    def get_ddb_key(self):
        return {
            'pk': f'JOB:{self.job_id}',
            'sk': f'JOB:{self.job_id}'
        }
    
    def to_ddb(self):
        # Mandatory attributes
        ddb_rep =  {
            **self.get_ddb_key(),
            'status': self.status,
            'created_date': self.created_date.isoformat(),
            'ttl': str(int(self.ttl.timestamp())),
        }

        # Optional attributes
        if self.friendly_name:
            ddb_rep['friendly_name'] = self.friendly_name
        
        if self.fulfilled_date:
            ddb_rep['fulfilled_date'] = self.fulfilled_date.isoformat()
        
        return ddb_rep
    
    @staticmethod
    def pk_from_id(job_id: str):
        return f'JOB:{job_id}'
    
    @staticmethod
    def id_from_pk(pk: str):
        return pk.replace('JOB:', '')